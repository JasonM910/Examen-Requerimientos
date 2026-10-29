export const TODAY = "2026-10-29";
export const money = (cents = 0) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(cents / 100);
export const dateLabel = (date, options = {}) =>
  new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    ...options,
  }).format(new Date(`${date}T12:00:00`));
export const addDays = (date, days) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const toCents = (value) => {
  if (!/^\d+(\.\d{0,2})?$/.test(String(value))) return NaN;
  const [whole, decimals = ""] = String(value).split(".");
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : NaN;
};
export const lineTotal = (line) =>
  line.qty * (line.base + line.adjustment + line.special);
export const quoteTotal = (lines) =>
  lines.reduce((sum, line) => sum + lineTotal(line), 0);
export const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
export const dailyUsed = (deliveries, date) =>
  deliveries.filter((d) => d.date === date).length;
export const DELIVERY_STATES = [
  "Pendiente",
  "En preparación",
  "Listo para entrega",
  "Entregado",
];
export function scheduledDeliveries(quote, agreementId) {
  let offset = 0;
  return quote.lines.flatMap((line) =>
    Array.from({ length: line.qty }, () => {
      const date = addDays(quote.startDate, offset++);
      return {
        id: `${agreementId}-E${offset}`,
        agreementId,
        clientId: quote.clientId,
        preparationId: line.preparationId,
        title: line.title,
        date,
        time: quote.time,
        mode: quote.mode,
        address: quote.address,
        zone: quote.zone,
        state: "Pendiente",
        amount: line.base + line.adjustment + line.special,
        modifications: line.modifications,
      };
    }),
  );
}
export function acceptanceError(quote, state) {
  if (quote.state !== "Enviada")
    return "Solo se pueden aceptar cotizaciones enviadas.";
  if (quote.validUntil < TODAY)
    return "La cotización venció. Crea una nueva propuesta desde la solicitud.";
  if (quote.startDate < TODAY)
    return "La fecha de inicio ya pasó. Emite una propuesta con una fecha vigente.";
  if (state.agreements.some((a) => a.requestId === quote.requestId))
    return "Esta solicitud ya tiene un acuerdo.";
  if (
    quote.mode === "Domicilio" &&
    !state.profile.coverage.includes(quote.zone)
  )
    return "La zona de entrega no está dentro de tu cobertura actual.";
  for (const delivery of scheduledDeliveries(quote, "validacion")) {
    if (dailyUsed(state.deliveries, delivery.date) >= state.profile.capacity)
      return `No hay cupo disponible el ${dateLabel(delivery.date)}. Revisa tu capacidad diaria.`;
  }
  return "";
}
export function periodBounds(period, anchor = TODAY) {
  if (period === "Anual")
    return [`${anchor.slice(0, 4)}-01-01`, `${anchor.slice(0, 4)}-12-31`];
  if (period === "Mensual")
    return [
      `${anchor.slice(0, 7)}-01`,
      addDays(`${anchor.slice(0, 7)}-01`, 32).slice(0, 7) + "-01",
    ].map((date, i) => (i ? addDays(date, -1) : date));
  const d = new Date(`${anchor}T12:00:00Z`).getUTCDay();
  const start = addDays(anchor, -(d === 0 ? 6 : d - 1));
  return [start, addDays(start, 6)];
}
export function financialData(state, period, anchor = TODAY) {
  const [start, end] = periodBounds(period, anchor);
  const delivered = state.deliveries.filter(
    (d) => d.state === "Entregado" && d.date >= start && d.date <= end,
  );
  const total = delivered.reduce((sum, d) => sum + d.amount, 0);
  const month = new Intl.DateTimeFormat("es", { month: "short" }).format(
    new Date(`${start}T12:00:00`),
  );
  const buckets =
    period === "Anual"
      ? Array.from({ length: 12 }, (_, i) => ({
          label: [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
          ][i],
          match: (d) => Number(d.date.slice(5, 7)) === i + 1,
        }))
      : period === "Semanal"
        ? Array.from({ length: 7 }, (_, i) => ({
            label: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i],
            match: (d) => d.date === addDays(start, i),
          }))
        : Array.from(
            { length: Math.ceil(Number(end.slice(-2)) / 7) },
            (_, i) => ({
              label: `${i * 7 + 1}–${Math.min((i + 1) * 7, Number(end.slice(-2)))} ${month}`,
              match: (d) =>
                Math.min(
                  4,
                  Math.floor((Number(d.date.slice(8, 10)) - 1) / 7),
                ) === i,
            }),
          );
  return {
    start,
    end,
    delivered,
    total,
    buckets: buckets.map((b) => ({
      label: b.label,
      amount: delivered.filter(b.match).reduce((sum, d) => sum + d.amount, 0),
    })),
  };
}
export function exportCsv(filename, rows) {
  const content =
    "\uFEFF" +
    rows
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(";"),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
