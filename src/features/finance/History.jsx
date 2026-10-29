import { Badge, ClientName, Empty, Modal, Mode } from "../../components/UI";
import { CalendarDays, CheckCircle2, FileText } from "lucide-react";
import { useStore } from "../../store/Store";
import { dateLabel, money, TODAY } from "../../lib/domain";

export function AgreementsTable({ agreements, onSelect }) {
  const { state } = useStore();
  return (
    <div className="overflow-auto">
      <table className="w-full whitespace-nowrap">
        <thead className="table-head">
          <tr>
            {[
              "ACUERDO",
              "CLIENTE",
              "PERÍODO",
              "MODALIDAD",
              "MONTO TOTAL",
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
          {agreements.map((a) => {
            const entries = state.deliveries.filter(
              (d) => d.agreementId === a.id,
            );
            const completed = entries.every((d) => d.state === "Entregado");
            return (
              <tr key={a.id}>
                <td className="table-cell">
                  <span className="font-medium">{a.id}</span>
                  <p className="mt-1 text-[10px] text-muted">{a.quoteId}</p>
                </td>
                <td className="table-cell">
                  <ClientName
                    client={state.clients.find((c) => c.id === a.clientId)}
                    compact
                  />
                </td>
                <td className="table-cell text-muted">
                  {dateLabel(a.startDate)} –{" "}
                  {dateLabel(a.endDate, { year: "numeric" })}
                </td>
                <td className="table-cell">
                  <Mode mode={a.mode} />
                </td>
                <td className="table-cell font-semibold">{money(a.total)}</td>
                <td className="table-cell">
                  <Badge>
                    {completed
                      ? "Completado"
                      : a.startDate > TODAY
                        ? "Pendiente"
                        : "Activo"}
                  </Badge>
                </td>
                <td className="table-cell">
                  <button
                    className="btn min-h-8 px-3 py-2 text-[10px]"
                    onClick={() => onSelect(a)}
                  >
                    Ver acuerdo
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!agreements.length && <Empty title="No hay acuerdos en este período" />}
    </div>
  );
}
export function AgreementDetail({ agreement, onClose }) {
  const { state } = useStore();
  const entries = state.deliveries
    .filter((d) => d.agreementId === agreement.id)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const completed = entries.filter((d) => d.state === "Entregado");
  const earned = completed.reduce((sum, d) => sum + d.amount, 0);
  return (
    <Modal
      wide
      title={`Acuerdo ${agreement.id}`}
      subtitle={`Solicitud ${agreement.requestId} → Cotización ${agreement.quoteId} → Acuerdo y entregas`}
      onClose={onClose}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ClientName
          client={state.clients.find((c) => c.id === agreement.clientId)}
          sub={`${dateLabel(agreement.startDate)} – ${dateLabel(agreement.endDate, { year: "numeric" })}`}
        />
        <Mode mode={agreement.mode} />
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl bg-canvas p-5">
        {[
          ["Valor del acuerdo", money(agreement.total)],
          ["Ingreso por entregas", money(earned)],
          ["Entregas completadas", `${completed.length} de ${entries.length}`],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[10px] text-muted">{label}</p>
            <p className="mt-2 text-base font-semibold text-forest">{value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-auto rounded-xl border border-line">
        <table className="w-full">
          <thead className="table-head">
            <tr>
              {["FECHA / HORA", "PREPARACIÓN", "IMPORTE", "ESTADO"].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((d) => (
              <tr key={d.id}>
                <td className="table-cell whitespace-nowrap px-4">
                  {dateLabel(d.date)} · {d.time}
                </td>
                <td className="table-cell px-4">
                  <p className="font-medium">{d.title}</p>
                  <p className="mt-1 text-[10px] text-muted">
                    {d.modifications}
                  </p>
                </td>
                <td className="table-cell whitespace-nowrap px-4">
                  {money(d.amount)}
                </td>
                <td className="table-cell px-4">
                  <Badge>{d.state}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button className="btn" onClick={onClose}>
          Cerrar
        </button>
        <a className="btn" href={`#cotizaciones/${agreement.quoteId}`}>
          <FileText size={14} />
          Ver cotización original
        </a>
        <a className="btn btn-primary" href={`#calendario/${entries[0]?.id}`}>
          <CalendarDays size={14} />
          Ver en calendario
        </a>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[10px] text-muted">
        <CheckCircle2 size={13} />
        El ingreso corresponde a entregas completadas; el valor del acuerdo
        incluye todo el plan.
      </p>
    </Modal>
  );
}
