import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings2,
  Sprout,
  Users,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { useStore } from "../store/Store";
import { Avatar, Brand, Modal } from "./UI";

const items = [
  ["inicio", "Resumen", LayoutDashboard, "GENERAL"],
  ["solicitudes", "Solicitudes", ClipboardList],
  ["cotizaciones", "Cotizaciones", FileText],
  ["calendario", "Calendario", CalendarDays],
  ["preparaciones", "Preparaciones", Utensils, "MI NEGOCIO"],
  ["clientes", "Clientes", Users],
  ["finanzas", "Finanzas", Wallet],
  ["perfil", "Mi perfil", Settings2],
];
export function Shell({ page, children, onLogout }) {
  const { state, update, toast, setToast, saveStatus, saveError } = useStore();
  const [mobile, setMobile] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [help, setHelp] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const fresh = state.requests.filter((r) => r.state === "Nueva").length;
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6500);
    return () => clearTimeout(timer);
  }, [toast, setToast]);
  useEffect(() => {
    const key = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const matches =
    search.trim().length > 1
      ? [
          ...state.preparations.map((p) => ({
            label: p.title,
            sub: "Preparación",
            href: `#preparaciones/${p.id}`,
          })),
          ...state.clients.map((c) => ({
            label: c.name,
            sub: "Cliente",
            href: `#clientes/${c.id}`,
          })),
          ...state.requests.map((r) => ({
            label: `${r.id} · ${state.clients.find((c) => c.id === r.clientId).name}`,
            sub: "Solicitud",
            href: `#solicitudes/${r.id}`,
          })),
          ...state.quotes.map((q) => ({
            label: q.id,
            sub: "Cotización",
            href: `#cotizaciones/${q.id}`,
          })),
        ]
          .filter((r) =>
            r.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
          )
          .slice(0, 6)
      : [];
  return (
    <div className="min-h-screen">
      {mobile && (
        <div
          className="fixed inset-0 z-30 bg-ink/25 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-[238px] flex-col border-r border-line bg-white transition-transform lg:translate-x-0 ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[87px] items-center justify-between px-5">
          <a
            href="#inicio"
            aria-label="Dieta Saludable, inicio"
            onClick={() => setMobile(false)}
          >
            <Brand />
          </a>
          <button
            className="icon-btn lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="mx-4 mb-5 flex items-center gap-3 rounded-lg border border-line px-3 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#f0f3e9] text-forest">
            <Sprout size={19} />
          </span>
          <div className="flex-1">
            <div className="text-xs font-semibold">{state.profile.name}</div>
            <div className="mt-1 text-[10px] text-muted">
              Espacio del oferente
            </div>
          </div>
          <span className="size-1.5 rounded-full bg-[#8ba969]" />
        </div>
        <nav className="flex-1 space-y-1 overflow-auto px-3 pb-4">
          {items.map(([id, label, Icon, group]) => (
            <div key={id}>
              {group && (
                <div className="mb-3 mt-5 px-3 text-[9px] font-semibold tracking-[1.8px] text-[#a0a69a]">
                  {group}
                </div>
              )}
              <a
                href={`#${id}`}
                onClick={() => {
                  setMobile(false);
                  setSearch("");
                }}
                aria-current={page === id ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-[12px] text-xs ${page === id ? "bg-[#edf3e6] font-semibold text-forest" : "text-[#7b867b] hover:bg-canvas hover:text-forest"}`}
              >
                <Icon size={18} strokeWidth={page === id ? 2 : 1.6} />
                <span className="flex-1">{label}</span>
                {id === "solicitudes" && fresh > 0 && (
                  <span className="flex size-5 items-center justify-center rounded bg-[#e0eacb] text-[10px] font-semibold text-forest">
                    {fresh}
                  </span>
                )}
              </a>
            </div>
          ))}
        </nav>
        <div className="m-4 rounded-xl bg-[#f6f7f0] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
            <CircleHelp size={15} className="text-[#93a67b]" />
            Un poco de ayuda
          </div>
          <p className="text-[10px] leading-relaxed text-muted">
            Todo lo que necesitas para hacer crecer tu cocina.
          </p>
          <button
            className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-forest"
            onClick={() => {
              setHelp(true);
              setMobile(false);
            }}
          >
            Ver guía rápida <ArrowRight size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2.5 border-t border-line px-5 py-4">
          <Avatar client={{ name: state.profile.owner }} />
          <a className="min-w-0 flex-1" href="#perfil">
            <div className="truncate text-xs font-semibold">
              {state.profile.owner}
            </div>
            <div className="mt-1 text-[10px] text-muted">
              Cuenta de oferente
            </div>
          </a>
          <button
            className="icon-btn"
            onClick={onLogout}
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="lg:pl-[238px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-lg sm:px-8">
          <div className="flex shrink-0 items-center gap-2 text-xs">
            <button
              className="icon-btn lg:hidden"
              aria-label="Abrir menú"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span className="hidden text-muted sm:inline">Mi espacio</span>
            <ChevronRight
              size={12}
              className="hidden text-[#bcc2b7] sm:block"
            />
            <span className="font-medium">
              {items.find((i) => i[0] === page)?.[1] || "Resumen"}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-2.5 text-[#a2aa9c]"
                size={15}
              />
              <input
                ref={searchRef}
                aria-label="Buscar en la aplicación"
                placeholder="Buscar en tu espacio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearch("");
                  if (e.key === "Enter" && matches[0]) {
                    window.location.hash = matches[0].href;
                    setSearch("");
                  }
                }}
                className="w-48 rounded-lg border border-line bg-[#fafbf8] py-2.5 pl-9 pr-12 text-[11px] outline-none lg:w-64"
              />
              <kbd className="absolute right-2 top-2 rounded border border-line px-1.5 py-0.5 text-[9px] text-muted">
                Ctrl K
              </kbd>
              {search.length > 1 && (
                <div className="absolute right-0 top-12 w-80 rounded-xl border border-line bg-white p-2 shadow-xl">
                  {matches.length ? (
                    matches.map((r) => (
                      <a
                        key={r.href}
                        href={r.href}
                        onClick={() => setSearch("")}
                        className="block rounded-lg p-3 hover:bg-canvas"
                      >
                        <div className="text-xs font-medium">{r.label}</div>
                        <div className="mt-1 text-[10px] text-muted">
                          {r.sub}
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="p-3 text-xs text-muted">
                      Sin resultados para “{search}”.
                    </p>
                  )}
                </div>
              )}
            </div>
            <span className="hidden h-6 border-l border-line sm:block" />
            <div className="relative">
              <button
                aria-label="Ver notificaciones"
                onClick={() => setNotifications(!notifications)}
                className="icon-btn relative"
              >
                <Bell size={18} />
                {fresh > 0 && !state.readNotifications && (
                  <span className="absolute right-2 top-1.5 size-1.5 rounded-full border border-white bg-[#8ea86d]" />
                )}
              </button>
              {notifications && (
                <div className="absolute right-0 top-12 w-[min(320px,85vw)] rounded-xl border border-line bg-white p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Notificaciones</h2>
                    <button
                      className="text-[10px] text-forest hover:underline"
                      onClick={() =>
                        update((s) => ({ ...s, readNotifications: true }))
                      }
                    >
                      Marcar como leídas
                    </button>
                  </div>
                  {state.requests
                    .filter((r) => r.state === "Nueva")
                    .map((r) => (
                      <a
                        href={`#solicitudes/${r.id}`}
                        key={r.id}
                        onClick={() => setNotifications(false)}
                        className="mt-2 block rounded-lg bg-canvas p-3 text-xs"
                      >
                        <span className="font-medium">
                          Nueva solicitud · {r.id}
                        </span>
                        <p className="mt-1 text-muted">
                          {state.clients.find((c) => c.id === r.clientId).name}{" "}
                          · Plan de {r.duration} días
                        </p>
                      </a>
                    ))}
                  {!fresh && (
                    <p className="muted">Estás al día con tus solicitudes.</p>
                  )}
                </div>
              )}
            </div>
            <a
              href="#perfil"
              className="flex items-center gap-2"
              aria-label="Ir a mi perfil"
            >
              <Avatar client={{ name: state.profile.owner }} size="sm" />
              <ChevronDown size={12} className="text-muted" />
            </a>
          </div>
        </header>
        {saveError && (
          <div
            role="alert"
            className="bg-amber-50 px-6 py-3 text-xs text-amber-800"
          >
            {saveError}
          </div>
        )}
        <main
          id="contenido"
          className="mx-auto max-w-[1520px] px-4 pb-8 pt-7 sm:px-8 sm:pt-8"
        >
          {children}
          <footer className="mt-9 flex flex-wrap justify-between gap-2 border-t border-line pt-5 text-[9px] text-[#9aa291]">
            <span>
              © 2026 Dieta Saludable. Hecho para alimentar el bienestar.
            </span>
            <span className="flex flex-wrap items-center gap-3">
              <span
                data-testid="save-status"
                aria-live="polite"
                className={
                  saveStatus === "error" ? "text-red-600" : "text-forest"
                }
              >
                {saveStatus === "saving"
                  ? "Guardando cambios…"
                  : saveStatus === "error"
                    ? "Cambios sin guardar"
                    : "Cambios guardados"}
              </span>
              <span>Prototipo local · Datos de demostración · 29 oct 2026</span>
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div
          role={toast.kind === "error" ? "alert" : "status"}
          className={`fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-40px)] items-start gap-3 rounded-xl border bg-white px-5 py-4 shadow-xl ${toast.kind === "error" ? "border-red-200 text-red-700" : "border-[#d3e0c4] text-forest"}`}
        >
          <span className="max-w-sm text-xs leading-relaxed">
            {toast.message}
          </span>
          <button
            aria-label="Cerrar notificación"
            onClick={() => setToast(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {help && (
        <Modal
          title="Tu cocina, en un solo lugar"
          subtitle="Guía rápida del espacio del oferente"
          onClose={() => setHelp(false)}
        >
          <div className="space-y-5">
            {[
              [
                Utensils,
                "1. Prepara tu catálogo",
                "Registra platos y define ingredientes que se pueden excluir o sustituir.",
                "preparaciones",
              ],
              [
                ClipboardList,
                "2. Escucha y cotiza",
                "Revisa restricciones, ajusta los costos y envía una propuesta con tus políticas.",
                "solicitudes",
              ],
              [
                CalendarDays,
                "3. Organiza tus entregas",
                "Simula la aceptación de una cotización enviada para crear su acuerdo y agenda.",
                "calendario",
              ],
              [
                ChartNoAxesCombined,
                "4. Conoce tu negocio",
                "Consulta ingresos de entregas completadas, clientes recurrentes y acuerdos.",
                "finanzas",
              ],
            ].map(([Icon, title, text, href]) => (
              <a
                key={href}
                className="flex items-start gap-4 rounded-xl bg-canvas p-4 hover:bg-[#edf3e6]"
                href={`#${href}`}
                onClick={() => setHelp(false)}
              >
                <Icon size={22} className="shrink-0 text-forest" />
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="muted mt-1">{text}</p>
                </div>
              </a>
            ))}
            <p className="rounded-lg border border-line p-4 text-xs leading-relaxed text-muted">
              Los cambios se guardan en un archivo local y se recuperan al
              volver a abrir la aplicación. El inicio de sesión, las
              notificaciones y las respuestas del cliente se simulan. No incluye
              cifrado de credenciales ni garantías de una base de datos de
              producción.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
