import { useState } from "react";
import {
  ArrowRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  Search,
  Sprout,
  Users,
} from "lucide-react";
import {
  Avatar,
  Badge,
  ClientName,
  Empty,
  Modal,
  PageTitle,
  Stat,
} from "../../components/UI";
import { useStore } from "../../store/Store";
import { money } from "../../lib/domain";
import { AgreementDetail } from "../finance/History";

export default function Clients({ itemId }) {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState(
    state.clients.find((c) => c.id === itemId) || null,
  );
  const [agreement, setAgreement] = useState(null);
  const data = state.clients
    .map((client) => ({
      ...client,
      plans: state.agreements.filter((a) => a.clientId === client.id).length,
      earned: state.deliveries
        .filter((d) => d.clientId === client.id && d.state === "Entregado")
        .reduce((s, d) => s + d.amount, 0),
      historicalPreferences: [
        ...new Set([
          ...client.preferences,
          ...state.requests
            .filter((r) => r.clientId === client.id)
            .flatMap((r) => r.restrictions),
        ]),
      ],
    }))
    .sort((a, b) => b.plans - a.plans);
  const clients = data.filter(
    (c) =>
      `${c.name} ${c.historicalPreferences.join(" ")}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()) &&
      (filter === "Todos" || c.plans > 1),
  );
  const current = data.find((c) => c.id === selected?.id);
  return (
    <div className="page-enter">
      <PageTitle
        title="Personas que vuelven a tu mesa"
        description="Conoce a tus clientes, sus preferencias y la historia que construyen contigo."
        eyebrow="MI NEGOCIO / CLIENTES"
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Clientes registrados"
          value={data.length}
          note="Personas con solicitudes"
          icon={Users}
        />
        <Stat
          label="Clientes frecuentes"
          value={data.filter((c) => c.plans > 1).length}
          note="Con más de un plan contratado"
          icon={Heart}
          tint="orange"
        />
        <Stat
          label="Planes contratados"
          value={state.agreements.length}
          note="Acuerdos concretados"
          icon={Sprout}
        />
      </div>
      <div className="panel overflow-hidden">
        <div className="flex flex-wrap justify-between gap-4 p-5">
          <div className="flex rounded-lg bg-canvas p-1">
            {["Todos", "Frecuentes"].map((f) => (
              <button
                key={f}
                className={`tab ${filter === f ? "tab-active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-muted" />
            <input
              aria-label="Buscar cliente"
              className="input pl-9"
              placeholder="Nombre o preferencia"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                {[
                  "CLIENTE",
                  "PREFERENCIAS REGISTRADAS",
                  "PLANES CONTRATADOS",
                  "INGRESOS GENERADOS",
                  "",
                ].map((h, i) => (
                  <th key={i} className="px-5 py-3.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="table-cell">
                    <ClientName client={c} sub={c.zone} />
                  </td>
                  <td className="table-cell">
                    <div className="flex max-w-60 flex-wrap gap-1.5">
                      {c.historicalPreferences.map((p) => (
                        <span
                          key={p}
                          className="tag bg-[#f0f3e8] text-[#839564]"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="rounded-lg bg-canvas px-3 py-1.5 font-semibold text-forest">
                      {c.plans}
                    </span>
                  </td>
                  <td className="table-cell whitespace-nowrap font-semibold">
                    {money(c.earned)}
                  </td>
                  <td className="table-cell">
                    <button
                      className="btn min-h-8 whitespace-nowrap px-3 py-2 text-[10px]"
                      onClick={() => setSelected(c)}
                    >
                      Ver cliente
                      <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!clients.length && <Empty />}
      </div>
      {current && (
        <Modal
          wide
          title="Una relación que se alimenta"
          subtitle="Preferencias e historial de contratación"
          onClose={() => setSelected(null)}
        >
          <div className="mb-6 flex items-center gap-4">
            <Avatar client={current} size="lg" />
            <div>
              <h3 className="text-xl font-semibold">{current.name}</h3>
              <p className="muted mt-1">
                {current.plans} planes contratados · {money(current.earned)} en
                servicios atendidos
              </p>
            </div>
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {current.historicalPreferences.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
          </div>
          <div className="mb-6 flex flex-wrap gap-5 rounded-xl bg-canvas p-4 text-xs text-muted">
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              {current.zone}
            </span>
            {current.plans > 0 && (
              <>
                <span className="flex items-center gap-2">
                  <Phone size={14} />
                  {current.phone}
                </span>
                <span className="flex items-center gap-2">
                  <Mail size={14} />
                  {current.email}
                </span>
              </>
            )}
          </div>
          <h3 className="section-title mb-4">Historial de planes</h3>
          <div className="space-y-3">
            {state.agreements
              .filter((a) => a.clientId === current.id)
              .reverse()
              .map((a) => (
                <button
                  key={a.id}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-line p-4 text-left hover:bg-canvas"
                  onClick={() => {
                    setAgreement(a);
                    setSelected(null);
                  }}
                >
                  <div>
                    <span className="text-xs font-semibold">{a.id}</span>
                    <p className="mt-1 text-[10px] text-muted">
                      {a.startDate} – {a.endDate} · {a.quoteId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-forest">
                      {money(a.total)}
                    </span>
                    <ArrowRight size={14} className="text-muted" />
                  </div>
                </button>
              ))}
            {!current.plans && (
              <Empty
                title="Todavía no tiene planes contratados"
                text="Sus acuerdos aparecerán al aceptar una cotización."
              />
            )}
          </div>
        </Modal>
      )}
      {agreement && (
        <AgreementDetail
          agreement={agreement}
          onClose={() => setAgreement(null)}
        />
      )}
    </div>
  );
}
