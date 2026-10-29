import { useEffect, useId, useRef } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Leaf,
  MapPin,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { initials, money } from "../lib/domain";

export function Brand({ light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${light ? "bg-white/15 text-lime" : "bg-forest text-lime"}`}
      >
        <Leaf size={24} strokeWidth={1.7} />
      </span>
      <div>
        <div
          className={`text-[17px] font-bold tracking-[-0.6px] ${light ? "text-white" : "text-forest"}`}
        >
          dieta saludable<span className="text-lime">.</span>
        </div>
        <div
          className={`mt-0.5 whitespace-nowrap text-[7px] font-semibold tracking-[1.6px] ${light ? "text-white/60" : "text-muted"}`}
        >
          BIENESTAR EN CADA PLATO
        </div>
      </div>
    </div>
  );
}
export function PageTitle({ title, description, children, eyebrow }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-1px] sm:text-[29px]">
          {title}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
export function Pagination({ total, page, pageSize = 8, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-[10px] text-muted">
      <span>
        {total
          ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} registros`
          : "Sin registros"}
      </span>
      <div className="flex items-center gap-3">
        <button
          aria-label="Página anterior"
          className="icon-btn size-7"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>
        <span>
          Página {page} de {pages}
        </span>
        <button
          aria-label="Página siguiente"
          className="icon-btn size-7"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
export function Field({ label, children, hint, className = "" }) {
  const id = useId();
  return (
    <div className={className}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {typeof children === "function" ? children(id) : children}
      {hint && <p className="mt-1.5 text-[10px] text-muted">{hint}</p>}
    </div>
  );
}
export function Badge({ children }) {
  const colors = {
    Nueva: "bg-[#eaf1e3] text-[#63833c]",
    Activo: "bg-[#eaf1e3] text-forest",
    Aceptada: "bg-[#eaf1e3] text-forest",
    Entregado: "bg-[#eaf1e3] text-forest",
    Completado: "bg-[#eaf1e3] text-forest",
    "En preparación": "bg-[#fff3df] text-[#ad7d2a]",
    "En revisión": "bg-[#fff3df] text-[#ad7d2a]",
    Pendiente: "bg-[#f2f2ed] text-[#878874]",
    Enviada: "bg-[#eaf0fb] text-[#627cac]",
    Cotizada: "bg-[#eaf0fb] text-[#627cac]",
    "Listo para entrega": "bg-[#e8f0ef] text-[#4f8980]",
    Inactivo: "bg-[#f1f1ed] text-[#8b8e85]",
    Rechazada: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`tag whitespace-nowrap ${colors[children] || "bg-[#f0f3ea] text-forest"}`}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}
export function Avatar({ client, size = "md" }) {
  const colors = {
    rose: "bg-[#f4e8e7] text-[#aa7f7c]",
    blue: "bg-[#e6edf4] text-[#6f8da9]",
    amber: "bg-[#f6eddd] text-[#b39b65]",
    green: "bg-[#e8efdf] text-[#809764]",
    purple: "bg-[#ece7f1] text-[#9882ac]",
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${size === "lg" ? "size-14 text-base" : size === "sm" ? "size-8 text-[10px]" : "size-9 text-[11px]"} ${colors[client?.color] || colors.green}`}
    >
      {initials(client?.name || "Alma Verde")}
    </span>
  );
}
export function ClientName({ client, sub, compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar client={client} size={compact ? "sm" : "md"} />
      <div className="min-w-0">
        <div className="font-medium">{client.name}</div>
        {sub && <div className="mt-1 text-[10px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}
export function Modal({ title, subtitle, children, onClose, wide = false }) {
  const ref = useRef(null);
  const heading = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function keydown(e) {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const elements = ref.current?.querySelectorAll(
        'button:not(:disabled), input, select, textarea, a[href], [tabindex="0"]',
      );
      if (!elements?.length) return;
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault();
        last.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#15291d]/35 p-3 backdrop-blur-[3px] sm:p-7"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={heading}
        tabIndex={-1}
        className={`max-h-[94dvh] w-full overflow-auto rounded-2xl bg-white shadow-2xl outline-none ${wide ? "max-w-5xl" : "max-w-2xl"}`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-5 sm:px-7">
          <div>
            <h2 id={heading} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="muted mt-1">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Cerrar ventana"
            className="icon-btn"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </header>
        <div className="p-5 sm:p-7">{children}</div>
      </section>
    </div>
  );
}
export function Empty({
  title = "No hay resultados",
  text = "Prueba con otros filtros para encontrar lo que buscas.",
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
      <Inbox className="mb-4 text-[#a5b59a]" size={32} strokeWidth={1.3} />
      <h3 className="font-medium">{title}</h3>
      <p className="muted mt-2">{text}</p>
    </div>
  );
}
export function Stat({
  label,
  value,
  note,
  icon: Icon,
  positive = true,
  trend,
  tint = "green",
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span
          className={`flex size-9 items-center justify-center rounded-lg ${tint === "orange" ? "bg-[#fbf1e5] text-[#b8945e]" : tint === "blue" ? "bg-[#edf1f6] text-[#8295b0]" : "bg-[#eef3e7] text-[#78935b]"}`}
        >
          <Icon size={18} strokeWidth={1.6} />
        </span>
      </div>
      <div className="mt-2.5 text-[27px] font-semibold tracking-[-1px]">
        {value}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${positive ? "text-forest" : "text-amber-600"}`}
          >
            {positive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trend}
          </span>
        )}
        {note}
      </div>
    </div>
  );
}
export function RevenueChart({ data, compact = false }) {
  const id = useId().replaceAll(":", "");
  const max = Math.max(...data.map((b) => b.amount), 10000) * 1.2;
  const width = 640,
    height = compact ? 185 : 220,
    left = 58,
    right = 22,
    top = 20,
    bottom = 32;
  const plotH = height - top - bottom,
    plotW = width - left - right;
  const points = data.map((b, i) => [
    left + (i * plotW) / Math.max(1, data.length - 1),
    height - bottom - (b.amount / max) * plotH,
  ]);
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.join(",")}`).join(" ");
  return (
    <svg
      role="img"
      aria-label="Ingresos por período de entregas completadas"
      viewBox={`0 0 ${width} ${height}`}
      className="w-full overflow-visible"
    >
      <desc>
        {data.map((b) => `${b.label}: ${money(b.amount)}`).join(". ")}
      </desc>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#94ae71" stopOpacity=".23" />
          <stop offset="100%" stopColor="#94ae71" stopOpacity=".015" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => {
        const y = top + (i * plotH) / 3;
        return (
          <g key={i}>
            <line
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              stroke="#edf0e8"
              strokeDasharray="4 4"
            />
            <text
              x={left - 10}
              y={y + 3}
              textAnchor="end"
              fill="#9aa294"
              fontSize="9"
            >
              ₡{Math.round((max / 100 / 1000) * (1 - i / 3))} mil
            </text>
          </g>
        );
      })}
      <path
        d={`${path} L${width - right},${height - bottom} L${left},${height - bottom} Z`}
        fill={`url(#${id})`}
      />
      <path
        d={path}
        fill="none"
        stroke="#7b9a56"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p[0]}
            cy={p[1]}
            r="3.5"
            fill="white"
            stroke="#7b9a56"
            strokeWidth="2"
          >
            <title>
              {data[i].label}: {money(data[i].amount)}
            </title>
          </circle>
          <text
            x={p[0]}
            y={height - 8}
            textAnchor="middle"
            fill="#9aa294"
            fontSize="9"
          >
            {data[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}
export function PolicyBox({ policies }) {
  return (
    <div className="rounded-xl border border-[#e0e8d7] bg-[#f6f8f0] p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-forest">
        <ShieldCheck size={16} />
        Políticas de servicio incluidas
      </div>
      <p className="text-xs leading-relaxed text-[#748268]">{policies.terms}</p>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        <span>
          <strong className="font-medium">Cancelaciones:</strong>{" "}
          {policies.cancellationHours} horas antes.
        </span>
        <span>
          <strong className="font-medium">Modificaciones:</strong>{" "}
          {policies.changeHours} horas antes.
        </span>
      </div>
    </div>
  );
}
export function Mode({ mode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
      {mode === "Domicilio" ? <Truck size={13} /> : <MapPin size={13} />}
      {mode === "Domicilio" ? "A domicilio" : "Retiro en local"}
    </span>
  );
}
export function TextLink({ href, children }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-[11px] font-medium text-forest hover:underline"
    >
      {children}
      <ChevronRight size={13} />
    </a>
  );
}
export function CheckNote({ children }) {
  return (
    <span className="flex items-center gap-2 text-xs text-forest">
      <Check size={14} />
      {children}
    </span>
  );
}
