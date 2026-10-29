import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  MailCheck,
  MapPin,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import {
  Avatar,
  Badge,
  ClientName,
  Empty,
  Field,
  Modal,
  Mode,
  PageTitle,
  Pagination,
  PolicyBox,
} from "../../components/UI";
import { useStore } from "../../store/Store";
import {
  addDays,
  dateLabel,
  lineTotal,
  money,
  quoteTotal,
  TODAY,
  toCents,
} from "../../lib/domain";

export function Requests({ itemId }) {
  const { state, update } = useStore();
  const [filter, setFilter] = useState("Por revisar");
  const [search, setSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [selected, setSelected] = useState(
    state.requests.find((r) => r.id === itemId) || null,
  );
  const [composing, setComposing] = useState(null);
  const filtered = state.requests.filter(
    (r) =>
      (filter === "Todas" ||
        (filter === "Por revisar" &&
          ["Nueva", "En revisión"].includes(r.state)) ||
        filter === r.state) &&
      `${r.id} ${state.clients.find((c) => c.id === r.clientId).name}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const currentPage = Math.min(
    tablePage,
    Math.max(1, Math.ceil(filtered.length / 8)),
  );
  function open(request) {
    if (request.state === "Nueva")
      update((s) => ({
        ...s,
        requests: s.requests.map((r) =>
          r.id === request.id ? { ...r, state: "En revisión" } : r,
        ),
      }));
    setSelected(request);
  }
  return (
    <div className="page-enter">
      <PageTitle
        title="Cada persona, un plan diferente"
        description="Escucha lo que necesitan y conviértelo en una propuesta a su medida."
        eyebrow="GESTIÓN / SOLICITUDES"
      >
        <span className="btn btn-soft">
          <ClipboardList size={14} />
          {
            state.requests.filter((r) =>
              ["Nueva", "En revisión"].includes(r.state),
            ).length
          }{" "}
          por revisar
        </span>
      </PageTitle>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-canvas p-1">
            {["Por revisar", "Cotizada", "Aceptada", "Todas"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setTablePage(1);
                }}
                className={`tab ${filter === f ? "tab-active" : ""}`}
              >
                {f === "Cotizada"
                  ? "Cotizadas"
                  : f === "Aceptada"
                    ? "Aceptadas"
                    : f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input
              className="input pl-9"
              aria-label="Buscar solicitud"
              placeholder="Buscar cliente o solicitud"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setTablePage(1);
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="table-head">
              <tr>
                {[
                  "CLIENTE / SOLICITUD",
                  "NECESIDADES ALIMENTICIAS",
                  "DURACIÓN",
                  "INICIO",
                  "MODALIDAD",
                  "ESTADO",
                  "",
                ].map((h, i) => (
                  <th key={i} className="px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice((currentPage - 1) * 8, currentPage * 8)
                .map((r) => (
                  <tr key={r.id} className="hover:bg-[#fcfdf9]">
                    <td className="table-cell">
                      <ClientName
                        client={state.clients.find((c) => c.id === r.clientId)}
                        sub={`${r.id} · ${dateLabel(r.sentDate)}`}
                      />
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {r.restrictions.map((t) => (
                          <span
                            key={t}
                            className="tag bg-[#f0f3e8] text-[#81945b]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                      {r.allergies.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-[#b28b53]">
                          <AlertCircle size={11} />
                          Alergias registradas
                        </div>
                      )}
                    </td>
                    <td className="table-cell text-muted">{r.duration} días</td>
                    <td className="table-cell text-muted">
                      {dateLabel(r.startDate)}
                    </td>
                    <td className="table-cell">
                      <Mode mode={r.mode} />
                    </td>
                    <td className="table-cell">
                      <Badge>{r.state}</Badge>
                    </td>
                    <td className="table-cell">
                      <button
                        className="btn min-h-8 px-3 py-2 text-[10px]"
                        onClick={() => open(r)}
                      >
                        Revisar
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <Empty />}
        <Pagination
          total={filtered.length}
          page={currentPage}
          onChange={setTablePage}
        />
      </div>
      {selected && (
        <RequestDetail
          request={state.requests.find((r) => r.id === selected.id)}
          onClose={() => setSelected(null)}
          onCompose={() => {
            setComposing(selected);
            setSelected(null);
          }}
        />
      )}
      {composing && (
        <QuoteComposer request={composing} onClose={() => setComposing(null)} />
      )}
    </div>
  );
}
function RequestDetail({ request, onClose, onCompose }) {
  const { state } = useStore();
  const client = state.clients.find((c) => c.id === request.clientId);
  const quote = [...state.quotes]
    .reverse()
    .find((q) => q.requestId === request.id && q.state !== "Rechazada");
  return (
    <Modal
      wide
      title={`Solicitud ${request.id}`}
      subtitle={`Recibida el ${dateLabel(request.sentDate, { year: "numeric" })} · ${state.profile.name}`}
      onClose={onClose}
    >
      <div className="grid gap-7 md:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <Avatar client={client} size="lg" />
            <div>
              <h3 className="text-lg font-semibold">{client.name}</h3>
              <div className="mt-2">
                <Badge>{request.state}</Badge>
              </div>
            </div>
          </div>
          <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl bg-canvas p-4">
            {[
              [CalendarDays, `${request.duration} días`, "Duración del plan"],
              [Clock3, dateLabel(request.startDate), "Fecha de inicio"],
              [
                MapPin,
                request.mode === "Domicilio" ? "Domicilio" : "Retiro",
                request.time + " h",
              ],
            ].map(([Icon, value, label]) => (
              <div key={label}>
                <Icon size={16} className="mb-2 text-[#91a278]" />
                <p className="text-xs font-semibold">{value}</p>
                <p className="mt-1 text-[10px] text-muted">{label}</p>
              </div>
            ))}
          </div>
          <h3 className="mb-3 text-xs font-semibold">
            Necesidades alimenticias
          </h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {request.restrictions.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          <div className="mb-5 rounded-xl border border-[#f0e3ca] bg-[#fcf8ef] p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#a58247]">
              <AlertCircle size={15} />
              Alergias e ingredientes excluidos
            </h4>
            <p className="text-xs leading-6 text-[#95815e]">
              <strong className="font-medium">Alergias:</strong>{" "}
              {request.allergies.join(", ") || "No reportadas"}
              <br />
              <strong className="font-medium">Excluir:</strong>{" "}
              {request.excluded.join(", ") || "Sin exclusiones adicionales"}
            </p>
          </div>
          <h3 className="mb-2 text-xs font-semibold">
            Observaciones del cliente
          </h3>
          <p className="rounded-xl border border-line p-4 text-xs leading-6 text-muted">
            “{request.notes}”
          </p>
          <div className="mt-5 text-xs">
            <span className="font-medium">Zona de atención:</span>
            <p className="muted mt-1">{request.zone}</p>
          </div>
        </div>
        <div className="rounded-xl bg-canvas p-5">
          <h3 className="mb-4 text-xs font-semibold">
            Preparaciones solicitadas
          </h3>
          <div className="space-y-4">
            {request.preparationIds.map((id) => {
              const p = state.preparations.find((p) => p.id === id);
              return (
                <div key={id}>
                  <img
                    src={p.image}
                    alt=""
                    className="mb-2 h-24 w-full rounded-lg object-cover"
                  />
                  <h4 className="text-xs font-medium">{p.title}</h4>
                  <p className="mt-1 text-[10px] text-muted">
                    Desde {money(p.price)} · {p.category}
                  </p>
                  {p.state === "Inactivo" && (
                    <span className="mt-1 block text-[10px] text-amber-700">
                      Inactiva; selecciona una alternativa al cotizar.
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-6 border-t border-line pt-4 text-[10px] leading-5 text-muted">
            {request.state === "Aceptada"
              ? `Contacto confirmado: ${client.email} · ${client.phone}`
              : "Los datos de contacto y la dirección exacta se habilitan al concretar el acuerdo."}
          </p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3 border-t border-line pt-5">
        <button className="btn" onClick={onClose}>
          Cerrar
        </button>
        {quote ? (
          <a className="btn btn-primary" href={`#cotizaciones/${quote.id}`}>
            <FileText size={14} />
            Ver cotización
          </a>
        ) : (
          <button className="btn btn-primary" onClick={onCompose}>
            <Plus size={14} />
            Elaborar cotización
          </button>
        )}
      </div>
    </Modal>
  );
}
export function Quotes({ itemId }) {
  const { state } = useStore();
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [selected, setSelected] = useState(
    state.quotes.find((q) => q.id === itemId) || null,
  );
  const [composing, setComposing] = useState(null);
  const quotes = [...state.quotes]
    .reverse()
    .filter(
      (q) =>
        (filter === "Todas" || q.state === filter) &&
        `${q.id} ${state.clients.find((c) => c.id === q.clientId).name}`
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()),
    );
  const currentPage = Math.min(
    tablePage,
    Math.max(1, Math.ceil(quotes.length / 8)),
  );
  return (
    <div className="page-enter">
      <PageTitle
        title="Propuestas que abren posibilidades"
        description="Precios claros, planes personalizados y tus condiciones siempre presentes."
        eyebrow="GESTIÓN / COTIZACIONES"
      >
        <a className="btn btn-primary" href="#solicitudes">
          <Plus size={14} />
          Cotizar una solicitud
        </a>
      </PageTitle>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          ["Enviada", "En espera de respuesta"],
          ["Aceptada", "Cotizaciones aceptadas"],
          ["Borrador", "Borradores en proceso"],
        ].map(([status, label]) => (
          <div key={status} className="panel p-5">
            <span className="text-[11px] text-muted">{label}</span>
            <p className="mt-3 text-2xl font-semibold">
              {state.quotes.filter((q) => q.state === status).length}
            </p>
          </div>
        ))}
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap justify-between gap-3 p-5">
          <div className="flex max-w-full gap-1 overflow-auto rounded-lg bg-canvas p-1">
            {["Todas", "Enviada", "Aceptada", "Borrador", "Rechazada"].map(
              (f) => (
                <button
                  key={f}
                  className={`tab ${filter === f ? "tab-active" : ""}`}
                  onClick={() => {
                    setFilter(f);
                    setTablePage(1);
                  }}
                >
                  {f === "Todas"
                    ? "Todas"
                    : f === "Borrador"
                      ? "Borradores"
                      : f + "s"}
                </button>
              ),
            )}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input
              aria-label="Buscar cotización"
              className="input pl-9"
              placeholder="Buscar cotización o cliente"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setTablePage(1);
              }}
            />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="table-head">
              <tr>
                {[
                  "COTIZACIÓN",
                  "CLIENTE",
                  "PLAN",
                  "EMISIÓN",
                  "TOTAL",
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
              {quotes.slice((currentPage - 1) * 8, currentPage * 8).map((q) => (
                <tr key={q.id}>
                  <td className="table-cell">
                    <span className="font-medium">{q.id}</span>
                    <p className="mt-1 text-[10px] text-muted">{q.requestId}</p>
                  </td>
                  <td className="table-cell">
                    <ClientName
                      client={state.clients.find((c) => c.id === q.clientId)}
                      compact
                    />
                  </td>
                  <td className="table-cell text-muted">{q.duration} días</td>
                  <td className="table-cell text-muted">
                    {dateLabel(q.issuedDate)}
                  </td>
                  <td className="table-cell font-semibold">{money(q.total)}</td>
                  <td className="table-cell">
                    <Badge>{q.state}</Badge>
                  </td>
                  <td className="table-cell">
                    <button
                      className="btn min-h-8 px-3 py-2 text-[10px]"
                      onClick={() =>
                        q.state === "Borrador"
                          ? setComposing(q)
                          : setSelected(q)
                      }
                    >
                      {q.state === "Borrador" ? "Continuar" : "Ver detalle"}
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!quotes.length && <Empty />}
        <Pagination
          total={quotes.length}
          page={currentPage}
          onChange={setTablePage}
        />
      </div>
      {selected &&
        (selected.state === "Borrador" ? (
          <QuoteComposer
            request={state.requests.find((r) => r.id === selected.requestId)}
            existing={selected}
            onClose={() => setSelected(null)}
          />
        ) : (
          <QuoteDetail
            quote={state.quotes.find((q) => q.id === selected.id)}
            onClose={() => setSelected(null)}
          />
        ))}
      {composing && (
        <QuoteComposer
          request={state.requests.find((r) => r.id === composing.requestId)}
          existing={composing}
          onClose={() => setComposing(null)}
        />
      )}
    </div>
  );
}
function defaultLines(request, preparations) {
  let selected = request.preparationIds
    .map((id) => preparations.find((p) => p.id === id && p.state === "Activo"))
    .filter(Boolean);
  if (!selected.length)
    selected = preparations.filter((p) => p.state === "Activo").slice(0, 1);
  return selected
    .map((p, i) => ({
      preparationId: p.id,
      title: p.title,
      qty:
        Math.floor(request.duration / selected.length) +
        (i < request.duration % selected.length ? 1 : 0),
      base: p.price,
      adjustment: 0,
      special: 0,
      modifications:
        p.ingredients
          .filter(
            (ing) =>
              request.excluded.some(
                (e) => e.toLocaleLowerCase() === ing.name.toLocaleLowerCase(),
              ) && ing.exclude,
          )
          .map((ing) => `Excluir ${ing.name}`)
          .join("; ") || "Preparación base según restricciones",
      ingredientSnapshot: structuredClone(p.ingredients),
    }))
    .filter((l) => l.qty);
}
export function QuoteComposer({ request, existing, onClose }) {
  const { state, update, notify } = useStore();
  const [lines, setLines] = useState(() =>
    (existing?.lines || defaultLines(request, state.preparations)).map((l) => ({
      ...l,
      baseInput: String(l.base / 100),
      adjustmentInput: String(l.adjustment / 100),
      specialInput: String(l.special / 100),
    })),
  );
  const [startDate, setStartDate] = useState(
    existing?.startDate || request.startDate,
  );
  const [validUntil, setValidUntil] = useState(
    existing?.validUntil || addDays(TODAY, 3),
  );
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(null);
  const client = state.clients.find((c) => c.id === request.clientId);
  const validPreparations = state.preparations.filter(
    (p) => p.state === "Activo",
  );
  const total = quoteTotal(lines);
  const count = lines.reduce((sum, l) => sum + Number(l.qty || 0), 0);
  function change(i, key, value) {
    setLines((prev) =>
      prev.map((l, n) => (n === i ? { ...l, [key]: value } : l)),
    );
  }
  function changePrice(i, key, value) {
    setLines((prev) =>
      prev.map((l, n) =>
        n === i ? { ...l, [key + "Input"]: value, [key]: toCents(value) } : l,
      ),
    );
  }
  function choose(i, id) {
    const p = validPreparations.find((p) => p.id === id);
    setLines((prev) =>
      prev.map((l, n) =>
        n === i
          ? {
              ...l,
              preparationId: p.id,
              title: p.title,
              base: p.price,
              baseInput: String(p.price / 100),
              modifications: "Preparación base según restricciones",
              ingredientSnapshot: structuredClone(p.ingredients),
            }
          : l,
      ),
    );
  }
  function save(status) {
    if (
      !lines.length ||
      count !== request.duration ||
      lines.some(
        (l) =>
          !Number.isInteger(l.qty) ||
          l.qty < 1 ||
          !validPreparations.some((p) => p.id === l.preparationId) ||
          !Number.isFinite(l.base) ||
          l.base <= 0 ||
          !Number.isFinite(l.adjustment) ||
          !Number.isFinite(l.special),
      ) ||
      !Number.isSafeInteger(total)
    ) {
      setError(
        `Revisa los importes y distribuye exactamente ${request.duration} días entre las preparaciones activas.`,
      );
      return;
    }
    if (startDate < TODAY || validUntil < TODAY || validUntil > startDate) {
      setError(
        "Revisa las fechas: la vigencia debe ser actual y no puede superar el inicio del plan.",
      );
      return;
    }
    if (status === "Enviada" && !checked) {
      setError(
        "Confirma la revisión de restricciones y alergias antes de enviar la propuesta.",
      );
      return;
    }
    const quote = {
      id: existing?.id || `COT-${Date.now().toString().slice(-7)}`,
      requestId: request.id,
      clientId: request.clientId,
      offererId: state.profile.id,
      issuedDate: TODAY,
      validUntil,
      startDate,
      duration: count,
      lines: lines.map((line) => ({
        preparationId: line.preparationId,
        title: line.title,
        qty: line.qty,
        base: line.base,
        adjustment: line.adjustment,
        special: line.special,
        modifications: line.modifications,
        ingredientSnapshot: line.ingredientSnapshot,
      })),
      total,
      state: status,
      policies: structuredClone(state.profile),
      mode: request.mode,
      time: request.time,
      address: request.address,
      zone: request.zone,
    };
    update((s) => ({
      ...s,
      quotes: existing
        ? s.quotes.map((q) => (q.id === existing.id ? quote : q))
        : [...s.quotes, quote],
      requests: s.requests.map((r) =>
        r.id === request.id
          ? { ...r, state: status === "Enviada" ? "Cotizada" : "En revisión" }
          : r,
      ),
    }));
    if (status === "Enviada") {
      setSent(quote);
      notify(
        "Cotización enviada en la simulación. Lista para recibir una respuesta.",
      );
    } else {
      notify("Borrador guardado. Puedes continuar desde Cotizaciones.");
      onClose();
    }
  }
  if (sent) return <QuoteDetail quote={sent} onClose={onClose} justSent />;
  return (
    <Modal
      wide
      title="Una propuesta a su medida"
      subtitle={`${request.id} · ${client.name} · Plan de ${request.duration} días`}
      onClose={onClose}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas p-4">
        <ClientName
          client={client}
          sub={`${request.restrictions.join(" · ")} · ${request.duration} entregas`}
        />
        <Mode mode={request.mode} />
        <span className="text-xs text-muted">
          {request.time} h · {request.zone}
        </span>
      </div>
      <div className="mb-5 rounded-lg border border-[#ede2cc] bg-[#fcf8ef] px-4 py-3 text-[11px] leading-5 text-[#a08455]">
        <strong>Alergias:</strong>{" "}
        {request.allergies.join(", ") || "No reportadas"} ·{" "}
        <strong>Excluir:</strong>{" "}
        {request.excluded.join(", ") || "Sin exclusiones"}
        <br />
        {request.notes}
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Inicio del plan"
          hint="Una entrega por día consecutivo, a la hora solicitada."
        >
          {(id) => (
            <input
              id={id}
              type="date"
              className="input"
              min={TODAY}
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          )}
        </Field>
        <Field label="Cotización válida hasta">
          {(id) => (
            <input
              id={id}
              type="date"
              className="input"
              min={TODAY}
              max={startDate}
              required
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          )}
        </Field>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="section-title">Desglose del plan</h3>
          <p className="muted mt-1">
            Todos los importes están en colones por entrega.
          </p>
        </div>
        <span
          className={`tag ${count === request.duration ? "bg-[#edf3e6] text-forest" : "bg-amber-50 text-amber-700"}`}
        >
          {count} de {request.duration} días
        </span>
      </div>
      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="rounded-xl border border-line p-4">
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_90px_auto]">
              <Field label={`Preparación ${index + 1}`}>
                {(id) => (
                  <select
                    id={id}
                    className="input"
                    value={line.preparationId}
                    onChange={(e) => choose(index, e.target.value)}
                  >
                    {validPreparations.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Días / entregas">
                {(id) => (
                  <input
                    id={id}
                    aria-label={`Días preparación ${index + 1}`}
                    type="number"
                    min="1"
                    max={request.duration}
                    className="input"
                    value={line.qty}
                    onChange={(e) =>
                      change(index, "qty", Number(e.target.value))
                    }
                  />
                )}
              </Field>
              <button
                className="icon-btn mb-0.5"
                aria-label={`Quitar preparación ${index + 1}`}
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["base", "Precio base (CRC)"],
                ["adjustment", "Modificaciones (CRC)"],
                ["special", "Ing. especiales (CRC)"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  {(id) => (
                    <input
                      id={id}
                      aria-label={`${label} preparación ${index + 1}`}
                      type="number"
                      min={key === "base" ? "0.01" : "0"}
                      max="1000000"
                      step="0.01"
                      className="input"
                      value={line[key + "Input"]}
                      onChange={(e) => changePrice(index, key, e.target.value)}
                    />
                  )}
                </Field>
              ))}
              <div>
                <span className="label">Subtotal · {line.qty} días</span>
                <div className="rounded-lg bg-[#f3f6ed] px-3 py-2.5 text-sm font-semibold text-forest">
                  {Number.isFinite(lineTotal(line))
                    ? money(lineTotal(line))
                    : "Revisa el importe"}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Field label="Detalle de personalizaciones e ingredientes especiales">
                {(id) => (
                  <input
                    id={id}
                    className="input"
                    placeholder="Ej. Excluir ajonjolí, sustituir quinoa por arroz integral"
                    value={line.modifications}
                    onChange={(e) =>
                      change(index, "modifications", e.target.value)
                    }
                  />
                )}
              </Field>
            </div>
            <p className="mt-2 text-[10px] leading-5 text-muted">
              Opciones del catálogo:{" "}
              {line.ingredientSnapshot
                .filter((i) => i.exclude || i.substitute)
                .map(
                  (i) =>
                    `${i.name} (${[i.exclude && "excluible", i.substitute && `sustituible por ${i.alternative}`].filter(Boolean).join(", ")})`,
                )
                .join(" · ") || "Sin modificaciones configuradas"}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          className="btn btn-soft"
          disabled={!validPreparations.length}
          onClick={() => {
            const p = validPreparations[0];
            setLines([
              ...lines,
              {
                ...defaultLines(
                  { ...request, duration: 1, preparationIds: [p.id] },
                  state.preparations,
                )[0],
                baseInput: String(p.price / 100),
                adjustmentInput: "0",
                specialInput: "0",
              },
            ]);
          }}
        >
          <Plus size={13} />
          Agregar preparación
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted">Total del plan</span>
          <strong
            className="text-2xl font-semibold tracking-tight text-forest"
            data-testid="quote-total"
          >
            {Number.isFinite(total) ? money(total) : "—"}
          </strong>
        </div>
      </div>
      <p className="mb-5 mt-2 text-right text-[10px] text-muted">
        Total = días × (base + modificaciones + ingredientes especiales).
        Incluye entrega según modalidad acordada.
      </p>
      <PolicyBox policies={state.profile} />
      <label className="mt-5 flex items-start gap-3 rounded-lg border border-line p-4 text-xs leading-5">
        <input
          className="mt-0.5 shrink-0"
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            setError("");
          }}
        />
        Revisé las restricciones, alergias, exclusiones y la viabilidad de las
        preparaciones de este plan.
      </label>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700"
        >
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <button className="btn" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn" onClick={() => save("Borrador")}>
          Guardar borrador
        </button>
        <button className="btn btn-primary" onClick={() => save("Enviada")}>
          <Send size={14} />
          Enviar cotización
        </button>
      </div>
      <p className="mt-3 text-right text-[10px] text-muted">
        El envío al cliente se representa dentro de esta demostración.
      </p>
    </Modal>
  );
}
export function QuoteDetail({ quote, onClose, justSent = false }) {
  const { state, update, acceptQuote, notify } = useStore();
  const [response, setResponse] = useState(false);
  const client = state.clients.find((c) => c.id === quote.clientId);
  const agreement = state.agreements.find((a) => a.quoteId === quote.id);
  const firstDelivery = state.deliveries.find(
    (d) => d.agreementId === agreement?.id,
  );
  function decline() {
    update((s) => ({
      ...s,
      quotes: s.quotes.map((q) =>
        q.id === quote.id ? { ...q, state: "Rechazada" } : q,
      ),
      requests: s.requests.map((r) =>
        r.id === quote.requestId ? { ...r, state: "En revisión" } : r,
      ),
    }));
    notify(
      "Respuesta simulada: el cliente rechazó la propuesta. Puedes cotizar nuevamente.",
    );
    setResponse(false);
    onClose();
  }
  return (
    <Modal
      wide
      title={`Cotización ${quote.id}`}
      subtitle={`${quote.requestId} · Emitida el ${dateLabel(quote.issuedDate, { year: "numeric" })}`}
      onClose={onClose}
    >
      {justSent && (
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#edf4e5] p-4 text-forest">
          <MailCheck size={24} />
          <div>
            <h3 className="text-sm font-semibold">
              Tu propuesta ya está enviada
            </h3>
            <p className="mt-1 text-xs">
              Envío simulado a {client.name}. Puedes continuar el flujo
              simulando su respuesta.
            </p>
          </div>
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ClientName
          client={client}
          sub={`${quote.duration} días · ${dateLabel(quote.startDate)} al ${dateLabel(addDays(quote.startDate, quote.duration - 1))}`}
        />
        <div className="flex items-center gap-3">
          <Mode mode={quote.mode} />
          <Badge>{quote.state}</Badge>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl bg-canvas p-4">
        <div>
          <p className="text-[10px] text-muted">Vigencia</p>
          <p className="mt-2 text-xs font-medium">
            {dateLabel(quote.validUntil, { year: "numeric" })}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted">Horario de entrega</p>
          <p className="mt-2 text-xs font-medium">{quote.time} h</p>
        </div>
        <div>
          <p className="text-[10px] text-muted">Zona</p>
          <p className="mt-2 text-xs font-medium">{quote.zone}</p>
        </div>
      </div>
      <div className="overflow-auto rounded-xl border border-line">
        <table className="w-full">
          <thead className="table-head">
            <tr>
              {[
                "PREPARACIÓN",
                "DÍAS",
                "BASE",
                "MODIFIC.",
                "ESPECIALES",
                "SUBTOTAL",
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quote.lines.map((l, i) => (
              <tr key={i}>
                <td className="table-cell px-4">
                  <p className="min-w-40 font-medium">{l.title}</p>
                  <p className="mt-1 text-[10px] leading-5 text-muted">
                    {l.modifications}
                  </p>
                </td>
                <td className="table-cell px-4">{l.qty}</td>
                <td className="table-cell whitespace-nowrap px-4">
                  {money(l.base)}
                </td>
                <td className="table-cell whitespace-nowrap px-4">
                  {money(l.adjustment)}
                </td>
                <td className="table-cell whitespace-nowrap px-4">
                  {money(l.special)}
                </td>
                <td className="table-cell whitespace-nowrap px-4 font-semibold">
                  {money(lineTotal(l))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-6 mt-5 flex items-center justify-end gap-8">
        <span className="text-sm text-muted">Total del plan</span>
        <span className="text-2xl font-semibold text-forest">
          {money(quote.total)}
        </span>
      </div>
      <PolicyBox policies={quote.policies} />
      {agreement && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce5d1] bg-[#f6f8f1] p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-forest" size={22} />
            <div>
              <p className="text-xs font-semibold">Acuerdo {agreement.id}</p>
              <p className="mt-1 text-[10px] text-muted">
                {quote.duration} entregas vinculadas ·{" "}
                {dateLabel(agreement.startDate)} –{" "}
                {dateLabel(agreement.endDate)}
              </p>
            </div>
          </div>
          <a
            href={`#calendario/${firstDelivery?.id || ""}`}
            className="btn btn-soft"
          >
            <CalendarDays size={14} />
            Ver entregas
          </a>
        </div>
      )}
      {response && (
        <div className="mt-5 rounded-xl border border-[#dbe3d3] p-5">
          <h3 className="text-sm font-semibold">
            Simular respuesta del cliente
          </h3>
          <p className="muted mt-2">
            La aceptación creará un acuerdo y {quote.duration} entregas
            consecutivas. Se revisarán cobertura y cupos disponibles antes de
            programarlas.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (acceptQuote(quote.id)) {
                  setResponse(false);
                  onClose();
                  window.location.hash = `#cotizaciones/${quote.id}`;
                }
              }}
            >
              <Check size={14} />
              Aceptar propuesta
            </button>
            <button className="btn btn-danger" onClick={decline}>
              Rechazar propuesta
            </button>
            <button className="btn" onClick={() => setResponse(false)}>
              Volver
            </button>
          </div>
        </div>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <button className="btn" onClick={onClose}>
          Cerrar
        </button>
        {quote.state === "Enviada" && !response && (
          <button className="btn btn-primary" onClick={() => setResponse(true)}>
            Simular respuesta del cliente
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </Modal>
  );
}
