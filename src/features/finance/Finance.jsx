import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  Wallet,
} from "lucide-react";
import {
  Badge,
  ClientName,
  Empty,
  PageTitle,
  Pagination,
  RevenueChart,
  Stat,
  TextLink,
} from "../../components/UI";
import { useStore } from "../../store/Store";
import {
  dateLabel,
  exportCsv,
  financialData,
  money,
  TODAY,
} from "../../lib/domain";
import { QuoteDetail } from "../sales/Sales";
import { AgreementDetail, AgreementsTable } from "./History";

export default function Finance({ itemId }) {
  const { state } = useStore();
  const [period, setPeriod] = useState("Mensual");
  const [anchor, setAnchor] = useState(TODAY);
  const [tab, setTab] = useState("Acuerdos");
  const [historyPage, setHistoryPage] = useState(1);
  const [quote, setQuote] = useState(null);
  const [agreement, setAgreement] = useState(
    state.agreements.find((a) => a.id === itemId) || null,
  );
  const finances = financialData(state, period, anchor);
  const agreements = [...state.agreements]
    .reverse()
    .filter(
      (a) => a.startDate >= finances.start && a.startDate <= finances.end,
    );
  const quotes = [...state.quotes]
    .reverse()
    .filter(
      (q) =>
        q.state === "Aceptada" &&
        q.issuedDate >= finances.start &&
        q.issuedDate <= finances.end,
    );
  const frequent = state.clients
    .map((c) => ({
      ...c,
      count: state.agreements.filter((a) => a.clientId === c.id).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const historyCount =
    tab === "Acuerdos"
      ? agreements.length
      : tab === "Cotizaciones aprobadas"
        ? quotes.length
        : finances.delivered.length;
  const currentPage = Math.min(
    historyPage,
    Math.max(1, Math.ceil(historyCount / 8)),
  );
  const pageSlice = (entries) =>
    entries.slice((currentPage - 1) * 8, currentPage * 8);
  function download() {
    if (tab === "Acuerdos")
      exportCsv("acuerdos.csv", [
        [
          "Acuerdo",
          "Cotización",
          "Solicitud",
          "Cliente",
          "Inicio",
          "Fin",
          "Modalidad",
          "Total CRC",
        ],
        ...agreements.map((a) => [
          a.id,
          a.quoteId,
          a.requestId,
          state.clients.find((c) => c.id === a.clientId).name,
          a.startDate,
          a.endDate,
          a.mode,
          a.total / 100,
        ]),
      ]);
    else if (tab === "Cotizaciones aprobadas")
      exportCsv("cotizaciones-aprobadas.csv", [
        [
          "Cotización",
          "Solicitud",
          "Cliente",
          "Emisión",
          "Total CRC",
          "Estado",
        ],
        ...quotes.map((q) => [
          q.id,
          q.requestId,
          state.clients.find((c) => c.id === q.clientId).name,
          q.issuedDate,
          q.total / 100,
          q.state,
        ]),
      ]);
    else
      exportCsv("ingresos-por-entregas.csv", [
        [
          "Entrega",
          "Acuerdo",
          "Cliente",
          "Fecha",
          "Preparación",
          "Ingreso CRC",
        ],
        ...finances.delivered.map((d) => [
          d.id,
          d.agreementId,
          state.clients.find((c) => c.id === d.clientId).name,
          d.date,
          d.title,
          d.amount / 100,
        ]),
      ]);
  }
  return (
    <div className="page-enter">
      <PageTitle
        title="El fruto de tu trabajo"
        description="Ingresos, clientes que regresan y un historial para seguir creciendo."
        eyebrow="MI NEGOCIO / FINANZAS"
      >
        <button className="btn" onClick={download}>
          <ArrowDownToLine size={14} />
          Exportar {tab.toLocaleLowerCase()}
        </button>
      </PageTitle>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-lg border border-line bg-[#eef0e9] p-1">
          {["Semanal", "Mensual", "Anual"].map((p) => (
            <button
              key={p}
              onClick={() => {
                setPeriod(p);
                setHistoryPage(1);
              }}
              className={`tab ${p === period ? "tab-active" : ""}`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] text-muted">
            {dateLabel(finances.start, { year: "numeric" })} –{" "}
            {dateLabel(finances.end, { year: "numeric" })}
          </span>
          <input
            aria-label="Fecha de referencia financiera"
            type="date"
            className="input w-auto"
            value={anchor}
            onChange={(e) => {
              if (e.target.value) {
                setAnchor(e.target.value);
                setHistoryPage(1);
              }
            }}
          />
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat
          label="Ingresos devengados"
          value={money(finances.total)}
          note={`Período ${period.toLocaleLowerCase()}`}
          icon={Wallet}
        />
        <Stat
          label="Entregas completadas"
          value={finances.delivered.length}
          note="Servicios que generaron ingresos"
          icon={CheckCircle2}
        />
        <Stat
          label="Promedio por entrega"
          value={money(
            finances.delivered.length
              ? Math.round(finances.total / finances.delivered.length)
              : 0,
          )}
          note="Sobre entregas completadas"
          icon={CalendarDays}
          tint="blue"
        />
        <Stat
          label="Acuerdos del período"
          value={agreements.length}
          note="Según la fecha de inicio"
          icon={FileCheck2}
          tint="orange"
        />
      </div>
      <div className="mb-6 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="section-title">Tus ingresos en perspectiva</h2>
              <p className="muted mt-1">
                Servicios atendidos durante el período seleccionado.
              </p>
            </div>
            <span className="tag bg-[#edf3e4] text-forest">CRC</span>
          </div>
          <RevenueChart data={finances.buckets} />
          <p className="mt-3 text-[10px] text-muted">
            El valor de planes pendientes se reconoce al completar sus entregas.
          </p>
        </section>
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="section-title">Quienes confían en tu cocina</h2>
            <TextLink href="#clientes">Ver clientes</TextLink>
          </div>
          <p className="mb-5 text-[10px] text-muted">
            Frecuencia histórica de contratación
          </p>
          <div className="space-y-5">
            {frequent.map((c) => (
              <a
                key={c.id}
                href={`#clientes/${c.id}`}
                className="flex items-center justify-between gap-3"
              >
                <ClientName client={c} sub={c.preferences[0]} compact />
                <div className="shrink-0 rounded-lg bg-[#f1f5ea] px-2.5 py-1.5 text-[10px] font-medium text-forest">
                  {c.count} planes
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5">
          <div>
            <h2 className="section-title">
              Un historial que cuenta tu progreso
            </h2>
            <p className="muted mt-1">
              Cotizaciones, acuerdos y entregas con sus referencias originales.
            </p>
          </div>
        </div>
        <div className="mx-5 mb-5 flex w-fit max-w-[calc(100%-40px)] gap-1 overflow-auto rounded-lg bg-canvas p-1">
          {["Acuerdos", "Cotizaciones aprobadas", "Entregas completadas"].map(
            (t) => (
              <button
                key={t}
                className={`tab ${tab === t ? "tab-active" : ""}`}
                onClick={() => {
                  setTab(t);
                  setHistoryPage(1);
                }}
              >
                {t}
              </button>
            ),
          )}
        </div>
        {tab === "Acuerdos" ? (
          <AgreementsTable
            agreements={pageSlice(agreements)}
            onSelect={setAgreement}
          />
        ) : tab === "Cotizaciones aprobadas" ? (
          <div className="overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="table-head">
                <tr>
                  {[
                    "COTIZACIÓN / SOLICITUD",
                    "CLIENTE",
                    "EMISIÓN",
                    "DÍAS",
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
                {pageSlice(quotes).map((q) => (
                  <tr key={q.id}>
                    <td className="table-cell">
                      <p className="font-medium">{q.id}</p>
                      <p className="mt-1 text-[10px] text-muted">
                        {q.requestId}
                      </p>
                    </td>
                    <td className="table-cell">
                      <ClientName
                        client={state.clients.find((c) => c.id === q.clientId)}
                        compact
                      />
                    </td>
                    <td className="table-cell text-muted">
                      {dateLabel(q.issuedDate, { year: "numeric" })}
                    </td>
                    <td className="table-cell">{q.duration}</td>
                    <td className="table-cell font-semibold">
                      {money(q.total)}
                    </td>
                    <td className="table-cell">
                      <Badge>{q.state}</Badge>
                    </td>
                    <td className="table-cell">
                      <button
                        className="btn min-h-8 px-3 py-2 text-[10px]"
                        onClick={() => setQuote(q)}
                      >
                        Ver cotización
                        <ArrowRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!quotes.length && <Empty />}
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="table-head">
                <tr>
                  {[
                    "FECHA",
                    "CLIENTE",
                    "PREPARACIÓN",
                    "ACUERDO",
                    "INGRESO",
                    "ESTADO",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageSlice([...finances.delivered].reverse()).map((d) => (
                  <tr key={d.id}>
                    <td className="table-cell text-muted">
                      {dateLabel(d.date)}
                    </td>
                    <td className="table-cell">
                      <ClientName
                        client={state.clients.find((c) => c.id === d.clientId)}
                        compact
                      />
                    </td>
                    <td className="table-cell">{d.title}</td>
                    <td className="table-cell">
                      <button
                        className="font-medium text-forest hover:underline"
                        onClick={() =>
                          setAgreement(
                            state.agreements.find(
                              (a) => a.id === d.agreementId,
                            ),
                          )
                        }
                      >
                        {d.agreementId}
                      </button>
                    </td>
                    <td className="table-cell font-semibold">
                      {money(d.amount)}
                    </td>
                    <td className="table-cell">
                      <Badge>Entregado</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!finances.delivered.length && <Empty />}
          </div>
        )}
        <Pagination
          total={historyCount}
          page={currentPage}
          onChange={setHistoryPage}
        />
        <div className="border-t border-line px-5 py-3.5 text-[10px] text-muted">
          {tab === "Acuerdos"
            ? `${agreements.length} acuerdos según fecha de inicio.`
            : tab === "Cotizaciones aprobadas"
              ? `${quotes.length} cotizaciones aceptadas según fecha de emisión.`
              : `${finances.delivered.length} entregas completadas según fecha de entrega.`}{" "}
          Período: {dateLabel(finances.start)} –{" "}
          {dateLabel(finances.end, { year: "numeric" })}.
        </div>
      </section>
      {quote && <QuoteDetail quote={quote} onClose={() => setQuote(null)} />}
      {agreement && (
        <AgreementDetail
          agreement={state.agreements.find((a) => a.id === agreement.id)}
          onClose={() => setAgreement(null)}
        />
      )}
    </div>
  );
}
