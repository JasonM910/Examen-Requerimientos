import { createContext, useContext, useState } from "react";
import { createSeed } from "../data/seed";
import { acceptanceError, addDays, scheduledDeliveries } from "../lib/domain";

const Context = createContext(null);
const KEY = "dieta-saludable-v1";
function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.profile?.id && Array.isArray(saved.deliveries)) return saved;
  } catch {
    /* Recreate demo if the saved state is invalid. */
  }
  return createSeed();
}
export function StoreProvider({ children }) {
  const [state, setState] = useState(readState);
  const [toast, setToast] = useState(null);
  const [storageWarning, setStorageWarning] = useState(false);
  function notify(message, kind = "success") {
    setToast({ message, kind, id: Date.now() });
  }
  function update(updater) {
    setState((previous) => {
      const next = typeof updater === "function" ? updater(previous) : updater;
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        setTimeout(() => setStorageWarning(true), 0);
      }
      return next;
    });
  }
  function acceptQuote(id) {
    const quote = state.quotes.find((q) => q.id === id);
    const error = acceptanceError(quote, state);
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
    update((s) => ({
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
    notify(
      `Aceptación simulada. ${agreement.id} creado con ${quote.duration} entregas.`,
    );
    return true;
  }
  return (
    <Context.Provider
      value={{
        state,
        update,
        notify,
        acceptQuote,
        toast,
        setToast,
        storageWarning,
      }}
    >
      {children}
    </Context.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(Context);
