import test from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../src/data/seed.js";
import {
  acceptanceError,
  addDays,
  dailyUsed,
  financialData,
  periodBounds,
  quoteTotal,
  scheduledDeliveries,
  toCents,
} from "../src/lib/domain.js";

test("Los cálculos conservan céntimos exactos, incluso en planes largos", () => {
  assert.equal(toCents("4500.15"), 450015);
  assert.equal(toCents("0.1"), 10);
  assert.ok(Number.isNaN(toCents("1.005")));
  assert.ok(Number.isNaN(toCents("-10")));
  assert.equal(
    quoteTotal([
      {
        qty: 31,
        base: toCents("4500.15"),
        adjustment: toCents("125.25"),
        special: toCents("0.10"),
      },
    ]),
    14339050,
  );
});
test("Los períodos respetan semanas de lunes a domingo, meses y años", () => {
  assert.deepEqual(periodBounds("Semanal"), ["2026-10-26", "2026-11-01"]);
  assert.deepEqual(periodBounds("Mensual"), ["2026-10-01", "2026-10-31"]);
  assert.deepEqual(periodBounds("Mensual", "2028-02-29"), [
    "2028-02-01",
    "2028-02-29",
  ]);
  assert.deepEqual(periodBounds("Anual"), ["2026-01-01", "2026-12-31"]);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
test("Todos los datos iniciales mantienen trazabilidad y sumas coherentes", () => {
  const state = createSeed();
  for (const request of state.requests) {
    assert.ok(state.clients.some((c) => c.id === request.clientId));
    assert.equal(request.offererId, state.profile.id);
  }
  for (const quote of state.quotes) {
    assert.ok(
      state.requests.some(
        (r) => r.id === quote.requestId && r.clientId === quote.clientId,
      ),
    );
    assert.equal(quote.total, quoteTotal(quote.lines));
    assert.equal(
      quote.duration,
      quote.lines.reduce((n, l) => n + l.qty, 0),
    );
  }
  for (const agreement of state.agreements) {
    const quote = state.quotes.find((q) => q.id === agreement.quoteId);
    assert.equal(quote.state, "Aceptada");
    const deliveries = state.deliveries.filter(
      (d) => d.agreementId === agreement.id,
    );
    assert.equal(deliveries.length, quote.duration);
    assert.equal(
      deliveries.reduce((n, d) => n + d.amount, 0),
      agreement.total,
    );
    for (const d of deliveries) assert.equal(d.clientId, agreement.clientId);
  }
  for (const date of new Set(state.deliveries.map((d) => d.date)))
    assert.ok(dailyUsed(state.deliveries, date) <= state.profile.capacity);
});
test("Una cotización programa todas sus entregas y valida cupos, cobertura y vigencia", () => {
  const state = createSeed();
  const quote = state.quotes.find((q) => q.state === "Enviada");
  assert.equal(acceptanceError(quote, state), "");
  const entries = scheduledDeliveries(quote, "AC-TEST");
  assert.equal(entries.length, 4);
  assert.equal(entries[3].date, "2026-11-05");
  const fullState = {
    ...state,
    deliveries: [
      ...state.deliveries,
      ...Array.from({ length: state.profile.capacity }, (_, i) => ({
        id: `full-${i}`,
        date: "2026-11-04",
      })),
    ],
  };
  assert.match(acceptanceError(quote, fullState), /cupo/);
  assert.match(
    acceptanceError({ ...quote, zone: "Fuera de cobertura" }, state),
    /cobertura/,
  );
  assert.match(
    acceptanceError({ ...quote, validUntil: "2026-10-01" }, state),
    /venció/,
  );
  assert.match(
    acceptanceError(quote, {
      ...state,
      agreements: [...state.agreements, { requestId: quote.requestId }],
    }),
    /ya tiene un acuerdo/,
  );
});
test("Ingresos incluyen únicamente entregas completadas del período", () => {
  const state = createSeed();
  for (const period of ["Semanal", "Mensual", "Anual"]) {
    const data = financialData(state, period);
    assert.equal(
      data.total,
      state.deliveries
        .filter(
          (d) =>
            d.state === "Entregado" &&
            d.date >= data.start &&
            d.date <= data.end,
        )
        .reduce((sum, d) => sum + d.amount, 0),
    );
    assert.equal(
      data.total,
      data.buckets.reduce((sum, b) => sum + b.amount, 0),
    );
  }
  assert.ok(
    financialData(state, "Anual").total > financialData(state, "Mensual").total,
  );
  assert.ok(
    financialData(state, "Mensual").total >
      financialData(state, "Semanal").total,
  );
  assert.equal(financialData(state, "Mensual", "2025-01-01").total, 0);
  assert.equal(financialData(state, "Mensual", "2026-02-01").buckets.length, 4);
  assert.match(
    financialData(state, "Mensual", "2026-04-01").buckets.at(-1).label,
    /29–30/,
  );
});
test("Editar y desactivar un plato o cambiar políticas conserva las cotizaciones históricas", () => {
  const state = createSeed();
  const original = structuredClone(
    state.quotes.find((q) => q.state === "Aceptada"),
  );
  const p = state.preparations.find(
    (p) => p.id === original.lines[0].preparationId,
  );
  p.title = "Título modificado";
  p.state = "Inactivo";
  p.price = 100;
  p.ingredients[0].name = "Ingrediente modificado";
  state.profile.terms = "Políticas nuevas";
  const quote = state.quotes.find((q) => q.id === original.id);
  assert.deepEqual(quote, original);
});
