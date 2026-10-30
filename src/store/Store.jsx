import { createContext, useContext, useEffect, useRef, useState } from "react";
import { acceptanceError, addDays, scheduledDeliveries } from "../lib/domain";
import {
  loadDatabase,
  migrateBrowserData,
  saveDatabase,
} from "../lib/database";

const Context = createContext(null);
export function StoreProvider({ children }) {
  const [state, setState] = useState(null);
  const current = useRef(null);
  const revision = useRef(null);
  const writing = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [toast, setToast] = useState(null);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    loadDatabase(controller.signal)
      .then((database) => migrateBrowserData(database, controller.signal))
      .then((database) => {
        if (controller.signal.aborted) return;
        current.current = database.state;
        revision.current = database.revision;
        setState(database.state);
        setLoadError("");
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    const preventUnsavedClose = (event) => {
      if (!writing.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventUnsavedClose);
    return () =>
      window.removeEventListener("beforeunload", preventUnsavedClose);
  }, []);
  function notify(message, kind = "success") {
    setToast({ message, kind, id: Date.now() });
  }
  async function update(updater) {
    if (writing.current) {
      notify("Espera a que termine el guardado actual.", "error");
      return false;
    }
    writing.current = true;
    setSaveStatus("saving");
    setSaveError("");
    try {
      const next =
        typeof updater === "function" ? updater(current.current) : updater;
      const saved = await saveDatabase(next, revision.current);
      current.current = saved.state;
      revision.current = saved.revision;
      setState(saved.state);
      setSaveStatus("saved");
      return true;
    } catch (error) {
      setSaveError(error.message);
      setSaveStatus("error");
      notify(error.message, "error");
      return false;
    } finally {
      writing.current = false;
    }
  }
  async function acceptQuote(id) {
    const quote = current.current.quotes.find((q) => q.id === id);
    const error = acceptanceError(quote, current.current);
    if (error) {
      notify(error, "error");
      return false;
    }
    const agreementId = `AC-${Date.now().toString().slice(-7)}`;
    const agreement = {
      id: agreementId,
      quoteId: quote.id,
      requestId: quote.requestId,
      clientId: quote.clientId,
      startDate: quote.startDate,
      endDate: addDays(quote.startDate, quote.duration - 1),
      mode: quote.mode,
      total: quote.total,
    };
    const saved = await update((s) => ({
      ...s,
      quotes: s.quotes.map((q) =>
        q.id === id ? { ...q, state: "Aceptada" } : q,
      ),
      requests: s.requests.map((r) =>
        r.id === quote.requestId ? { ...r, state: "Aceptada" } : r,
      ),
      agreements: [...s.agreements, agreement],
      deliveries: [...s.deliveries, ...scheduledDeliveries(quote, agreementId)],
    }));
    if (!saved) return false;
    notify(
      `Aceptación simulada. ${agreement.id} creado con ${quote.duration} entregas.`,
    );
    return true;
  }
  if (!state)
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas p-8 text-center">
        <h1 className="text-xl font-semibold">
          {loadError ? "No pudimos abrir los datos" : "Cargando tu espacio…"}
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted">
          {loadError || "Leyendo la información guardada."}
        </p>
        {loadError && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setLoadError("");
              setAttempt((value) => value + 1);
            }}
          >
            Reintentar
          </button>
        )}
      </main>
    );
  return (
    <Context.Provider
      value={{
        state,
        update,
        notify,
        acceptQuote,
        toast,
        setToast,
        saveStatus,
        saveError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(Context);
