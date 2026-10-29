import { Component, useEffect, useState } from "react";
import { Shell } from "./components/Shell";
import { StoreProvider } from "./store/Store";
import Login from "./features/auth/Login";
import Dashboard from "./features/dashboard/Dashboard";
import Preparations from "./features/preparations/Preparations";
import Profile from "./features/profile/Profile";
import { Quotes, Requests } from "./features/sales/Sales";
import Calendar from "./features/calendar/Calendar";
import Clients from "./features/clients/Clients";
import Finance from "./features/finance/Finance";

const pages = {
  inicio: Dashboard,
  perfil: Profile,
  preparaciones: Preparations,
  solicitudes: Requests,
  cotizaciones: Quotes,
  calendario: Calendar,
  clientes: Clients,
  finanzas: Finance,
};
function Workspace() {
  const [session, setSession] = useState(
    () => sessionStorage.getItem("dieta-session") === "oferente-demo",
  );
  const [route, setRoute] = useState(() => ({
    path: window.location.hash.slice(1) || "inicio",
    revision: 0,
  }));
  useEffect(() => {
    const listener = () => {
      setRoute((previous) => ({
        path: window.location.hash.slice(1) || "inicio",
        revision: previous.revision + 1,
      }));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  const [page, itemId] = route.path.split("/");
  const Page = pages[page] || Dashboard;
  if (!session) return <Login onLogin={() => setSession(true)} />;
  return (
    <div
      onClickCapture={(event) => {
        const link = event.target.closest('a[href^="#"]');
        if (link && link.getAttribute("href") === window.location.hash) {
          event.preventDefault();
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }}
    >
      <Shell
        page={pages[page] ? page : "inicio"}
        onLogout={() => {
          sessionStorage.removeItem("dieta-session");
          setSession(false);
        }}
      >
        <Page key={`${route.path}:${route.revision}`} itemId={itemId} />
      </Shell>
    </div>
  );
}
class ErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (this.state.error)
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-8">
          <h1 className="text-2xl font-semibold">
            No pudimos cargar esta vista
          </h1>
          <p className="text-sm text-muted">
            Recarga la aplicación para volver a intentarlo.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Recargar aplicación
          </button>
        </div>
      );
    return this.props.children;
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <Workspace />
      </StoreProvider>
    </ErrorBoundary>
  );
}
