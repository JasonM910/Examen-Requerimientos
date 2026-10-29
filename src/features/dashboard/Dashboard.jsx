import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Leaf,
  Plus,
  Sprout,
  Wallet,
} from "lucide-react";
import {
  Badge,
  ClientName,
  Mode,
  PageTitle,
  RevenueChart,
  Stat,
  TextLink,
} from "../../components/UI";
import { useStore } from "../../store/Store";
import {
  addDays,
  dateLabel,
  exportCsv,
  financialData,
  money,
  TODAY,
} from "../../lib/domain";

export default function Dashboard() {
  const { state } = useStore();
  const [period, setPeriod] = useState("Mensual");
  const [day, setDay] = useState(TODAY);
  const finances = financialData(state, period);
  const pending = state.requests.filter((r) =>
    ["Nueva", "En revisión"].includes(r.state),
  );
  const today = state.deliveries
    .filter((d) => d.date === day)
    .sort((a, b) => a.time.localeCompare(b.time));
  const completed = today.filter((d) => d.state === "Entregado").length;
  const activePlans = state.agreements.filter(
    (a) => a.startDate <= TODAY && a.endDate >= TODAY,
  ).length;
  const currentDay = new Date(`${day}T12:00:00Z`).getUTCDay();
  const monday = addDays(day, -(currentDay === 0 ? 6 : currentDay - 1));
  const favorite = state.preparations
    .filter((p) => p.state === "Activo")
    .map((p) => ({
      ...p,
      count: state.deliveries.filter((d) => d.preparationId === p.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  const exportSummary = () =>
    exportCsv("resumen-dieta-saludable.csv", [
      ["Período", "Inicio", "Fin", "Ingresos CRC", "Entregas completadas"],
      [
        period,
        finances.start,
        finances.end,
        finances.total / 100,
        finances.delivered.length,
      ],
    ]);
  return (
    <div className="page-enter">
      <PageTitle
        title="Un buen día para hacer la diferencia"
        description="Hola, Mariana. Así va tu cocina hoy, jueves 29 de octubre."
        eyebrow="TU COCINA, DE UN VISTAZO"
      >
        <button className="btn" onClick={exportSummary}>
          <ArrowDownToLine size={14} />
          Exportar resumen
        </button>
        <a href="#calendario" className="btn">
          <CalendarDays size={14} />
          29 oct, 2026
        </a>
      </PageTitle>
      <section className="relative mb-6 flex min-h-[194px] overflow-hidden rounded-xl bg-[#28553d] text-white">
        <div className="relative z-10 w-full px-7 py-7 sm:w-[67%] sm:px-8">
          <div className="mb-3 flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[1.8px] text-[#c1d6a8]">
            <Sprout size={13} />
            ALIMENTAR BIEN ES CUIDAR
          </div>
          <h2 className="text-[26px] font-medium leading-[1.25] tracking-[-0.8px]">
            Tu talento en la cocina.
            <br />
            <span className="text-[#d6e7b5]">
              Su bienestar, todos los días.
            </span>
          </h2>
          <p className="mt-3 max-w-md text-[11px] leading-relaxed text-[#bdd0bb]">
            Cada plan es una oportunidad para transformar la alimentación de
            alguien.
          </p>
          <a
            href="#solicitudes"
            className="mt-5 inline-flex items-center gap-2 text-[11px] font-medium text-white"
          >
            Revisar mis solicitudes <ArrowRight size={13} />
          </a>
        </div>
        <div className="absolute right-0 top-0 hidden h-full w-[40%] sm:block">
          <img
            src="/images/bowl.jpg"
            alt="Bowl saludable de vegetales frescos"
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#28553d] via-[#28553d]/10 to-transparent" />
        </div>
        <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-lg border border-white/30 bg-white/95 px-3 py-2.5 text-forest lg:flex">
          <span className="flex size-7 items-center justify-center rounded-full bg-[#edf3e1]">
            <Leaf size={15} />
          </span>
          <div>
            <div className="text-[10px] font-semibold">
              Fresco. Cercano. Personalizado.
            </div>
            <div className="mt-0.5 text-[8px] text-muted">
              Así se cocina el bienestar.
            </div>
          </div>
        </div>
      </section>
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
        <Stat
          label={`Ingresos · ${period.toLowerCase()}`}
          value={money(finances.total)}
          note={`${finances.delivered.length} entregas completadas`}
          icon={Wallet}
        />
        <Stat
          label="Solicitudes por revisar"
          value={String(pending.length).padStart(2, "0")}
          note="Esperan tu propuesta"
          icon={ClipboardList}
          tint="orange"
        />
        <Stat
          label="Entregas de hoy"
          value={String(
            state.deliveries.filter((d) => d.date === TODAY).length,
          ).padStart(2, "0")}
          note="Entre domicilio y retiro"
          icon={CalendarDays}
          tint="blue"
        />
        <Stat
          label="Planes activos"
          value={String(activePlans).padStart(2, "0")}
          note="Alimentación con continuidad"
          icon={Sprout}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <div>
              <h2 className="section-title">Así crece tu negocio</h2>
              <p className="mt-1 text-[10px] text-muted">
                Ingresos de entregas completadas
              </p>
            </div>
            <div className="flex rounded-lg bg-canvas p-1">
              {["Semanal", "Mensual", "Anual"].map((p) => (
                <button
                  key={p}
                  className={`tab px-3 py-1.5 text-[10px] ${p === period ? "tab-active" : ""}`}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-baseline gap-2 px-5 pb-3 pt-5">
            <strong className="text-[24px] font-semibold tracking-tight">
              {money(finances.total)}
            </strong>
            <span className="text-[10px] text-muted">
              {dateLabel(finances.start)} – {dateLabel(finances.end)}
            </span>
          </div>
          <div className="px-4 pb-4">
            <RevenueChart data={finances.buckets} compact />
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
            <span className="flex items-center gap-1.5 text-[9px] text-muted">
              <span className="size-1.5 rounded-full bg-[#8da76e]" />
              Ingresos por servicios atendidos
            </span>
            <TextLink href="#finanzas">Ver finanzas</TextLink>
          </div>
        </section>
        <section className="panel">
          <div className="flex items-center justify-between px-5 pb-4 pt-5">
            <h2 className="section-title">Tu agenda</h2>
            <TextLink href="#calendario">Ver todo</TextLink>
          </div>
          <div className="mx-5 flex items-center justify-between">
            <span className="text-[11px] font-medium capitalize">
              {dateLabel(day, {
                month: "long",
                year: "numeric",
                day: undefined,
              })}
            </span>
            <div className="flex">
              <button
                className="icon-btn size-6"
                aria-label="Semana anterior"
                onClick={() => setDay(addDays(day, -7))}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="icon-btn size-6"
                aria-label="Semana siguiente"
                onClick={() => setDay(addDays(day, 7))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="mx-4 mt-3 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(monday, i);
              return (
                <button
                  key={date}
                  onClick={() => setDay(date)}
                  aria-label={`Ver agenda del ${date}`}
                  className={`flex flex-col items-center gap-2 rounded-lg py-2 ${day === date ? "bg-forest text-white" : "text-muted hover:bg-canvas"}`}
                >
                  <span className="text-[8px]">
                    {["L", "M", "M", "J", "V", "S", "D"][i]}
                  </span>
                  <span className="text-xs font-medium">
                    {Number(date.slice(-2))}
                  </span>
                  <span
                    className={`size-1 rounded-full ${state.deliveries.some((d) => d.date === date) ? (day === date ? "bg-lime" : "bg-[#a3b38d]") : "bg-transparent"}`}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-line px-5">
            <div className="flex items-center justify-between py-3">
              <span className="text-[10px] text-muted">
                {today.length} entregas · {dateLabel(day)}
              </span>
              <span className="text-[9px] text-forest">
                {completed}/{today.length} completadas
              </span>
            </div>
            {today.slice(0, 2).map((d) => (
              <a
                key={d.id}
                href={`#calendario/${d.id}`}
                className="flex items-start gap-3 border-t border-line py-3"
              >
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f5eb] text-[#8da76e]">
                  <Clock3 size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <span className="truncate text-[11px] font-medium">
                      {state.clients.find((c) => c.id === d.clientId).name}
                    </span>
                    <span className="text-[9px] text-muted">{d.time}</span>
                  </div>
                  <p className="mt-1 truncate text-[9px] text-muted">
                    {d.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Mode mode={d.mode} />
                    <Badge>{d.state}</Badge>
                  </div>
                </div>
              </a>
            ))}
            {!today.length && (
              <p className="muted py-6 text-center">
                Tu cocina tiene un respiro este día.
              </p>
            )}
            {today.length > 2 && (
              <a
                href="#calendario"
                className="block pb-3 text-center text-[10px] text-forest"
              >
                + {today.length - 2} entregas más
              </a>
            )}
          </div>
        </section>
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <h2 className="section-title">Nuevas oportunidades</h2>
              <p className="mt-1 text-[10px] text-muted">
                Planes que esperan un toque de tu cocina
              </p>
            </div>
            <TextLink href="#solicitudes">Ver solicitudes</TextLink>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="table-head">
                <tr>
                  {["CLIENTE", "PLAN SOLICITADO", "DURACIÓN", "ESTADO", ""].map(
                    (t, i) => (
                      <th key={i} className="px-5 py-3">
                        {t}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 3).map((r) => (
                  <tr key={r.id}>
                    <td className="table-cell">
                      <ClientName
                        client={state.clients.find((c) => c.id === r.clientId)}
                        sub={r.id}
                        compact
                      />
                    </td>
                    <td className="table-cell text-muted">
                      {r.restrictions[0]}
                    </td>
                    <td className="table-cell text-muted">{r.duration} días</td>
                    <td className="table-cell">
                      <Badge>{r.state}</Badge>
                    </td>
                    <td className="table-cell">
                      <a
                        href={`#solicitudes/${r.id}`}
                        aria-label={`Revisar ${r.id}`}
                        className="icon-btn size-7"
                      >
                        <ArrowRight size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!pending.length && (
              <p className="muted p-8 text-center">
                Todas las solicitudes están al día.
              </p>
            )}
          </div>
        </section>
        <section className="panel px-5 py-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Los favoritos de tu cocina</h2>
            <TextLink href="#preparaciones">Catálogo</TextLink>
          </div>
          <div className="space-y-4">
            {favorite.map((p, i) => (
              <a
                key={p.id}
                href={`#preparaciones/${p.id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={p.image}
                  alt=""
                  className="size-12 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-medium">
                    {p.title}
                  </div>
                  <div className="mt-1.5 text-[9px] text-muted">
                    {p.category} · {p.count} entregas programadas
                  </div>
                </div>
                <span className="text-[10px] text-[#a6b198]">0{i + 1}</span>
              </a>
            ))}
          </div>
          <a
            href="#preparaciones/nueva"
            className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#dce4d1] py-3 text-[10px] font-medium text-forest"
          >
            <Plus size={13} />
            Crear una nueva preparación
          </a>
        </section>
      </div>
      <div className="mt-5 flex items-center gap-2 text-[10px] text-muted">
        <CheckCheck size={14} className="text-[#8da76e]" />
        Todo listo para que te concentres en lo que mejor haces: cocinar.
      </div>
    </div>
  );
}
