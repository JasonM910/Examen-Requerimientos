import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  PackageCheck,
  Search,
  Truck,
  Utensils,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Empty,
  Field,
  Modal,
  Mode,
  PageTitle,
} from "../../components/UI";
import { useStore } from "../../store/Store";
import {
  addDays,
  dailyUsed,
  dateLabel,
  DELIVERY_STATES,
  money,
  periodBounds,
  TODAY,
} from "../../lib/domain";

export default function Calendar({ itemId }) {
  const { state } = useStore();
  const initial = state.deliveries.find((d) => d.id === itemId);
  const [date, setDate] = useState(initial?.date || TODAY);
  const [selected, setSelected] = useState(initial?.id || null);
  const [view, setView] = useState("Mes");
  const [filter, setFilter] = useState("Todos");
  const [mode, setMode] = useState("Todas");
  const [search, setSearch] = useState("");
  const firstMonth = date.slice(0, 7) + "-01";
  const firstDay = new Date(`${firstMonth}T12:00:00Z`).getUTCDay();
  const monthStart = addDays(firstMonth, -(firstDay === 0 ? 6 : firstDay - 1));
  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
  const weekStart = addDays(date, -(dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const dates = Array.from(
    {
      length:
        view === "Mes"
          ? Math.ceil(
              ((firstDay === 0 ? 6 : firstDay - 1) +
                Number(periodBounds("Mensual", date)[1].slice(-2))) /
                7,
            ) * 7
          : 7,
    },
    (_, i) => addDays(view === "Mes" ? monthStart : weekStart, i),
  );
  const matches = (d) =>
    (filter === "Todos" || d.state === filter) &&
    (mode === "Todas" || d.mode === mode) &&
    `${d.title} ${state.clients.find((c) => c.id === d.clientId).name}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase());
  const entries = state.deliveries
    .filter((d) => d.date === date && matches(d))
    .sort((a, b) => a.time.localeCompare(b.time));
  const used = dailyUsed(state.deliveries, date);
  function move(direction) {
    if (view === "Semana") setDate(addDays(date, direction * 7));
    else {
      const d = new Date(`${date}T12:00:00Z`);
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() + direction);
      setDate(d.toISOString().slice(0, 10));
    }
  }
  return (
    <div className="page-enter">
      <PageTitle
        title="Todo a su tiempo, todo en su punto"
        description="Organiza tu cocina y acompaña cada preparación hasta su entrega."
        eyebrow="GESTIÓN / CALENDARIO"
      >
        <a href="#cotizaciones" className="btn">
          <CalendarDays size={14} />
          Programar desde una cotización
        </a>
      </PageTitle>
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          [CalendarDays, String(used).padStart(2, "0"), "Entregas del día"],
          [
            Utensils,
            String(
              state.deliveries.filter(
                (d) => d.date === date && d.state === "En preparación",
              ).length,
            ).padStart(2, "0"),
            "En preparación",
          ],
          [
            Truck,
            String(
              state.deliveries.filter(
                (d) => d.date === date && d.mode === "Domicilio",
              ).length,
            ).padStart(2, "0"),
            "A domicilio",
          ],
          [
            CheckCircle2,
            `${used} / ${state.profile.capacity}`,
            "Capacidad diaria utilizada",
          ],
        ].map(([Icon, value, label]) => (
          <div key={label} className="panel flex items-center gap-4 p-5">
            <span className="rounded-lg bg-[#eef3e7] p-2.5 text-[#8ba26c]">
              <Icon size={19} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-xl font-semibold">{value}</p>
              <p className="mt-1 text-[10px] text-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
          <div className="flex items-center gap-3">
            <h2 className="min-w-36 text-base font-semibold capitalize">
              {dateLabel(date, {
                month: "long",
                year: "numeric",
                day: undefined,
              })}
            </h2>
            <button
              className="icon-btn size-7"
              aria-label="Período anterior"
              onClick={() => move(-1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="icon-btn size-7"
              aria-label="Período siguiente"
              onClick={() => move(1)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="btn min-h-8 px-3 py-1.5 text-[10px]"
              onClick={() => setDate(TODAY)}
            >
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              className="input w-auto text-[11px]"
              aria-label="Fecha de agenda"
              value={date}
              onChange={(e) => {
                if (e.target.value) setDate(e.target.value);
              }}
            />
            <div className="flex rounded-lg bg-canvas p-1">
              {["Mes", "Semana"].map((v) => (
                <button
                  key={v}
                  className={`tab px-3 ${v === view ? "tab-active" : ""}`}
                  onClick={() => setView(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-line bg-[#fafbf7]">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((d) => (
            <div
              key={d}
              className="py-3 text-center text-[9px] font-medium tracking-widest text-muted"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {dates.map((day, index) => {
            const events = state.deliveries.filter(
              (d) => d.date === day && matches(d),
            );
            return (
              <button
                key={day}
                aria-label={`Ver entregas ${day}`}
                aria-pressed={day === date}
                onClick={() => setDate(day)}
                className={`relative min-h-[80px] border-b border-line p-1.5 text-left sm:min-h-[108px] sm:p-3 ${index % 7 !== 6 ? "border-r" : ""} ${day === date ? "bg-[#f0f5e8] ring-1 ring-inset ring-[#b7cd9a]" : day.slice(0, 7) !== date.slice(0, 7) ? "bg-[#fafbf8] text-[#b4baad]" : "hover:bg-canvas"}`}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-[10px] ${day === TODAY ? "bg-forest text-white" : ""}`}
                >
                  {Number(day.slice(-2))}
                </span>
                {events.length > 0 && (
                  <>
                    <div className="mt-2 hidden space-y-1 sm:block">
                      {events.slice(0, view === "Semana" ? 4 : 1).map((d) => (
                        <div
                          key={d.id}
                          className={`truncate rounded px-1.5 py-1 text-[8px] ${d.state === "Entregado" ? "bg-[#eaf0e0] text-[#7e9461]" : d.state === "En preparación" ? "bg-[#fbf0db] text-[#ae9056]" : "bg-[#e7edf0] text-[#77949c]"}`}
                        >
                          {d.time} ·{" "}
                          {
                            state.clients
                              .find((c) => c.id === d.clientId)
                              .name.split(" ")[0]
                          }
                        </div>
                      ))}
                    </div>
                    <span className="mt-1 block text-[8px] text-[#91a477] sm:text-[9px]">
                      {events.length} entrega{events.length === 1 ? "" : "s"}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex gap-4 text-[9px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#8aa16b]" />
              Entregado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#c0a065]" />
              En preparación
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#8ba2ac]" />
              Programado
            </span>
          </div>
          <span className="text-[9px] text-muted">
            Los acuerdos aceptados generan la agenda de entregas.
          </span>
        </div>
      </div>
      <section className="panel mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="section-title capitalize">
              Entregas · {dateLabel(date, { weekday: "long", month: "long" })}
            </h2>
            <p className="muted mt-1">
              {used} preparaciones programadas ·{" "}
              {Math.max(0, state.profile.capacity - used)} cupos disponibles
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-3 text-muted" />
              <input
                aria-label="Buscar entrega"
                placeholder="Cliente o preparación"
                className="input w-44 pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filtrar modalidad"
              className="input w-auto"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="Todas">Toda modalidad</option>
              <option>Domicilio</option>
              <option>Retiro</option>
            </select>
            <select
              aria-label="Filtrar estado de entrega"
              className="input w-auto"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Todos">Todos los estados</option>
              {DELIVERY_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="table-head">
              <tr>
                {[
                  "HORA",
                  "CLIENTE / PREPARACIÓN",
                  "ACUERDO",
                  "MODALIDAD",
                  "ESTADO",
                  "",
                ].map((h, i) => (
                  <th key={i} className="px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((d) => (
                <tr key={d.id}>
                  <td className="table-cell">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Clock3 size={12} className="text-muted" />
                      {d.time}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <Avatar
                        client={state.clients.find((c) => c.id === d.clientId)}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">
                          {state.clients.find((c) => c.id === d.clientId).name}
                        </p>
                        <p className="mt-1 text-[10px] text-muted">{d.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell text-muted">{d.agreementId}</td>
                  <td className="table-cell">
                    <Mode mode={d.mode} />
                  </td>
                  <td className="table-cell">
                    <Badge>{d.state}</Badge>
                  </td>
                  <td className="table-cell">
                    <button
                      className="btn min-h-8 px-3 py-2 text-[10px]"
                      onClick={() => setSelected(d.id)}
                    >
                      Ver entrega
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!entries.length && (
          <Empty
            title="Un día con espacio para más"
            text="No hay entregas que coincidan con esta fecha y filtros."
          />
        )}
      </section>
      {selected && (
        <DeliveryDetail
          delivery={state.deliveries.find((d) => d.id === selected)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
function DeliveryDetail({ delivery, onClose }) {
  const { state, update, notify } = useStore();
  const client = state.clients.find((c) => c.id === delivery.clientId);
  const agreement = state.agreements.find((a) => a.id === delivery.agreementId);
  const [reschedule, setReschedule] = useState(false);
  const [date, setDate] = useState(delivery.date);
  const [time, setTime] = useState(delivery.time);
  const [error, setError] = useState("");
  const index = DELIVERY_STATES.indexOf(delivery.state);
  async function advance() {
    const next = DELIVERY_STATES[index + 1];
    const saved = await update((s) => ({
      ...s,
      deliveries: s.deliveries.map((d) =>
        d.id === delivery.id ? { ...d, state: next } : d,
      ),
    }));
    if (!saved) return;
    notify(
      next === "Entregado"
        ? "Entrega completada. El ingreso se refleja en Finanzas."
        : `Entrega actualizada: ${next}.`,
    );
  }
  async function save(e) {
    e.preventDefault();
    if (date < TODAY) {
      setError("Selecciona una fecha actual o futura.");
      return;
    }
    if (
      date !== delivery.date &&
      dailyUsed(state.deliveries, date) >= state.profile.capacity
    ) {
      setError("La fecha seleccionada no tiene cupos disponibles.");
      return;
    }
    const saved = await update((s) => {
      const deliveries = s.deliveries.map((d) =>
        d.id === delivery.id ? { ...d, date, time } : d,
      );
      const dates = deliveries
        .filter((d) => d.agreementId === agreement.id)
        .map((d) => d.date)
        .sort();
      return {
        ...s,
        deliveries,
        agreements: s.agreements.map((a) =>
          a.id === agreement.id
            ? { ...a, startDate: dates[0], endDate: dates.at(-1) }
            : a,
        ),
      };
    });
    if (!saved) return;
    setReschedule(false);
    notify("Entrega reprogramada. El acuerdo refleja sus nuevas fechas.");
  }
  return (
    <Modal
      title="De tu cocina a su mesa"
      subtitle={`${delivery.id} · Acuerdo ${delivery.agreementId}`}
      onClose={onClose}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar client={client} size="lg" />
          <div>
            <h3 className="text-base font-semibold">{client.name}</h3>
            <p className="mt-1 text-xs text-muted">{delivery.title}</p>
          </div>
        </div>
        <Badge>{delivery.state}</Badge>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-canvas p-5">
        <div>
          <p className="mb-2 text-[10px] text-muted">Fecha y hora</p>
          <p className="text-xs font-semibold">
            {dateLabel(delivery.date, { year: "numeric" })} · {delivery.time} h
          </p>
        </div>
        <div>
          <p className="mb-2 text-[10px] text-muted">Modalidad acordada</p>
          <Mode mode={delivery.mode} />
        </div>
        <div className="col-span-2">
          <p className="mb-2 text-[10px] text-muted">
            {delivery.mode === "Domicilio"
              ? "Dirección de entrega"
              : "Punto de retiro"}
          </p>
          <p className="flex items-center gap-2 text-xs">
            <MapPin size={13} className="shrink-0 text-[#91a278]" />
            {delivery.address}
          </p>
        </div>
        <div className="col-span-2 border-t border-line pt-3 text-[11px] text-muted">
          Contacto: {client.phone} · {client.email}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold">Personalizaciones</h3>
        <p className="rounded-lg border border-line p-3 text-xs leading-6 text-muted">
          {delivery.modifications}
        </p>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs text-muted">Importe de esta entrega</span>
        <span className="text-sm font-semibold text-forest">
          {money(delivery.amount)}
        </span>
      </div>
      <h3 className="mb-5 text-xs font-semibold">Seguimiento de la entrega</h3>
      <div className="mb-6 grid grid-cols-4">
        {DELIVERY_STATES.map((s, i) => {
          const Icon = [Clock3, Utensils, PackageCheck, CheckCircle2][i];
          return (
            <div
              key={s}
              className="relative flex flex-col items-center text-center"
            >
              {i < 3 && (
                <span
                  className={`absolute left-1/2 right-[-50%] top-4 h-px ${i < index ? "bg-forest" : "bg-line"}`}
                />
              )}
              <span
                className={`relative z-10 flex size-9 items-center justify-center rounded-full ${i <= index ? "bg-forest text-white" : "bg-canvas text-[#b2b9a8]"}`}
              >
                <Icon size={16} />
              </span>
              <p
                className={`mt-3 px-1 text-[9px] ${i <= index ? "font-medium text-forest" : "text-muted"}`}
              >
                {s}
              </p>
            </div>
          );
        })}
      </div>
      {delivery.state === "Entregado" && (
        <p className="mb-5 rounded-lg bg-[#edf4e5] p-3 text-center text-xs text-forest">
          Entrega completada e incluida en el historial de ingresos.
        </p>
      )}
      {reschedule && (
        <form
          onSubmit={save}
          className="mb-5 space-y-4 rounded-xl border border-line p-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nueva fecha">
              {(id) => (
                <input
                  id={id}
                  required
                  type="date"
                  min={TODAY}
                  value={date}
                  className="input"
                  onChange={(e) => setDate(e.target.value)}
                />
              )}
            </Field>
            <Field label="Hora">
              {(id) => (
                <input
                  id={id}
                  required
                  type="time"
                  value={time}
                  className="input"
                  onChange={(e) => setTime(e.target.value)}
                />
              )}
            </Field>
          </div>
          {error && (
            <p role="alert" className="text-xs text-red-700">
              {error}
            </p>
          )}
          <button className="btn btn-primary" type="submit">
            <Check size={13} />
            Guardar horario
          </button>
        </form>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <button className="btn" onClick={onClose}>
          Cerrar
        </button>
        {index < 3 && (
          <>
            <button className="btn" onClick={() => setReschedule(!reschedule)}>
              {reschedule ? "Cancelar ajuste" : "Ajustar horario"}
            </button>
            <button className="btn btn-primary" onClick={advance}>
              {
                [
                  "Iniciar preparación",
                  "Marcar listo para entrega",
                  "Marcar como entregado",
                ][index]
              }
              <ArrowRight size={14} />
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
