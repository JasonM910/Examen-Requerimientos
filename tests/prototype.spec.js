import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { financialData, money } from "../src/lib/domain.js";

async function login(page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Completar datos de demostración" })
    .click();
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Un buen día para hacer la diferencia" }),
  ).toBeVisible();
}
async function go(page, path) {
  await page.evaluate((path) => {
    window.location.hash = path;
  }, path);
}
async function saved(page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("dieta-saludable-v1")),
  );
}
async function shot(page, path) {
  await fs.mkdir(`evidencias/${path.split("/").slice(0, -1).join("/")}`, {
    recursive: true,
  });
  await page.screenshot({
    path: `evidencias/${path}.png`,
    fullPage: (await page.getByRole("dialog").count()) === 0,
    animations: "disabled",
  });
}

test("Acceso validado, navegación, búsqueda, notificaciones y cierre de sesión", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#finanzas");
  await expect(
    page.getByRole("heading", { name: "Qué bueno verte de nuevo" }),
  ).toBeVisible();
  await page.getByLabel("Correo electrónico").fill("persona@ejemplo.cr");
  await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("no coinciden");
  await page
    .getByRole("button", { name: "Completar datos de demostración" })
    .click();
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "El fruto de tu trabajo" }),
  ).toBeVisible();
  await go(page, "inicio");
  await expect(
    page.getByRole("heading", { name: "Un buen día para hacer la diferencia" }),
  ).toBeVisible();
  await shot(page, "00-resumen-del-oferente");
  await page.getByLabel("Buscar en la aplicación").fill("Valentina");
  await expect(
    page.getByText("Cliente", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Valentina Rojas Cliente", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Preferencias e historial",
  );
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.getByLabel("Buscar en la aplicación").fill("Valentina");
  await page
    .getByRole("link", { name: "Valentina Rojas Cliente", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Preferencias e historial",
  );
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.getByRole("button", { name: "Ver notificaciones" }).click();
  await expect(
    page.getByRole("heading", { name: "Notificaciones" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Marcar como leídas" }).click();
  expect((await saved(page)).readNotifications).toBe(true);
  await page.getByRole("button", { name: "Ver notificaciones" }).click();
  const download = page.waitForEvent("download");
  await go(page, "inicio");
  await page.getByRole("button", { name: "Exportar resumen" }).click();
  expect((await download).suggestedFilename()).toBe(
    "resumen-dieta-saludable.csv",
  );
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Qué bueno verte de nuevo" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Qué bueno verte de nuevo" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("Flujo 1: registrar, personalizar, editar y dar de baja conservando el historial", async ({
  page,
}) => {
  await login(page);
  await go(page, "preparaciones");
  await page.getByRole("button", { name: "Nueva preparación" }).click();
  const dialog = page.getByRole("dialog");
  await page
    .getByLabel("Título de la preparación")
    .fill("Bowl de arroz integral y tofu");
  await page
    .getByLabel("Descripción", { exact: true })
    .fill(
      "Arroz integral, tofu a la plancha y vegetales de temporada. Una opción vegana que se adapta a tus preferencias.",
    );
  await page.getByLabel("Precio base (CRC)", { exact: true }).fill("4800.25");
  await page.getByLabel("Energía (kcal)").fill("430");
  await page.getByLabel("Proteína (g)", { exact: true }).fill("22");
  await page.getByLabel("Carbohidratos (g)").fill("51");
  await page.getByLabel("Grasas (g)").fill("14");
  await page
    .getByLabel("Ingrediente 1", { exact: true })
    .fill("Arroz integral");
  await page.getByLabel("Sustituir ingrediente 1").check();
  await page.getByLabel("Alternativa permitida").fill("Quinoa");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page.getByLabel("Ingrediente 2", { exact: true }).fill("Tofu");
  await page.getByLabel("Sustituir ingrediente 2").check();
  await page.getByLabel("Alternativa permitida").nth(1).fill("Garbanzos");
  await page.getByRole("button", { name: "Agregar", exact: true }).click();
  await page
    .getByLabel("Ingrediente 3", { exact: true })
    .fill("Semillas de ajonjolí");
  await page.getByLabel("Excluir ingrediente 3").check();
  await page.setViewportSize({ width: 1440, height: 1250 });
  await expect(dialog).toContainText("Ingredientes y posibilidades");
  await shot(
    page,
    "flujo-1-preparaciones/01-registro-e-ingredientes-personalizables",
  );
  await page.getByRole("button", { name: "Guardar preparación" }).click();
  await expect(dialog).toHaveCount(0);
  await page.getByLabel("Buscar preparación").fill("Bowl de arroz integral");
  await expect(
    page.getByRole("heading", { name: "Bowl de arroz integral y tofu" }),
  ).toBeVisible();
  await shot(page, "flujo-1-preparaciones/02-preparacion-publicada");
  await page.getByRole("button", { name: "Ver y editar", exact: true }).click();
  await page
    .getByLabel("Título de la preparación")
    .fill("Bowl de arroz integral, tofu y vegetales");
  await page.getByRole("button", { name: "Guardar preparación" }).click();
  await page
    .getByRole("button", {
      name: "Dar de baja Bowl de arroz integral, tofu y vegetales",
    })
    .click();
  await page.getByRole("button", { name: "Confirmar baja" }).click();
  await expect(
    page.getByRole("article").getByText("Inactivo", { exact: true }),
  ).toBeVisible();
  const state = await saved(page);
  expect(state.preparations).toHaveLength(7);
  expect(state.preparations.at(-1).state).toBe("Inactivo");
  await page.reload();
  await page.getByLabel("Buscar preparación").fill("Bowl de arroz integral");
  await expect(
    page.getByRole("article").getByText("Inactivo", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Reactivar Bowl de arroz integral, tofu y vegetales",
    })
    .click();
  await page.getByRole("button", { name: "Reactivar", exact: true }).click();
  expect((await saved(page)).preparations.at(-1).state).toBe("Activo");
});

test("Flujos 2 y 3: revisar, cotizar con decimales, enviar, aceptar y completar una entrega", async ({
  page,
}) => {
  await login(page);
  await go(page, "solicitudes/SOL-024");
  await expect(page.getByRole("dialog")).toContainText("Valentina Rojas");
  await expect(page.getByRole("dialog")).toContainText(
    "Frutos secos, Ajonjolí",
  );
  await shot(page, "flujo-2-cotizacion/01-solicitud-y-restricciones");
  await page.getByRole("button", { name: "Elaborar cotización" }).click();
  await page
    .getByLabel("Modificaciones (CRC) preparación 1", { exact: true })
    .fill("125.25");
  await page
    .getByLabel("Ing. especiales (CRC) preparación 1", { exact: true })
    .fill("200.10");
  await page
    .getByLabel("Detalle de personalizaciones e ingredientes especiales")
    .first()
    .fill(
      "Excluir semillas de ajonjolí. Preparar con utensilios separados, sin frutos secos. Ingredientes especiales: vegetales orgánicos.",
    );
  await expect(page.getByTestId("quote-total")).toHaveText(money(2227605));
  await page.getByRole("button", { name: "Enviar cotización" }).click();
  await expect(page.getByRole("alert")).toContainText("Confirma la revisión");
  await page
    .getByRole("checkbox", { name: /Revisé las restricciones/ })
    .check();
  await page.setViewportSize({ width: 1440, height: 1600 });
  await shot(page, "flujo-2-cotizacion/02-desglose-calculos-y-politicas");
  await page.getByRole("button", { name: "Enviar cotización" }).click();
  await expect(
    page.getByRole("heading", { name: "Tu propuesta ya está enviada" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await shot(page, "flujo-2-cotizacion/03-cotizacion-enviada");
  const quote = (await saved(page)).quotes.at(-1);
  expect(quote.total).toBe(2227605);
  expect(quote.state).toBe("Enviada");
  await page
    .getByRole("button", { name: "Simular respuesta del cliente", exact: true })
    .click();
  await page.getByRole("button", { name: "Aceptar propuesta" }).click();
  await expect
    .poll(async () =>
      (await saved(page)).agreements.some((a) => a.quoteId === quote.id),
    )
    .toBe(true);
  const state = await saved(page);
  const agreement = state.agreements.find((a) => a.quoteId === quote.id);
  const deliveries = state.deliveries.filter(
    (d) => d.agreementId === agreement.id,
  );
  expect(deliveries).toHaveLength(5);
  expect(deliveries.reduce((sum, d) => sum + d.amount, 0)).toBe(quote.total);
  await go(page, `calendario/${deliveries[0].id}`);
  await expect(page.getByRole("dialog")).toContainText(
    "Bowl de quinoa y vegetales",
  );
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.getByLabel("Buscar entrega").fill("Valentina");
  await shot(page, "flujo-3-calendario/01-plan-aceptado-en-la-agenda");
  await page.getByRole("button", { name: "Ver entrega", exact: true }).click();
  await page.getByRole("button", { name: "Iniciar preparación" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByText("En preparación", { exact: true })
      .first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Marcar listo para entrega" }).click();
  await page.getByRole("button", { name: "Marcar como entregado" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Entrega completada e incluida en el historial de ingresos",
  );
  await shot(page, "flujo-3-calendario/02-entrega-completada");
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.reload();
  expect(
    (await saved(page)).deliveries.find((d) => d.id === deliveries[0].id).state,
  ).toBe("Entregado");
  await go(page, "finanzas");
  await page.getByLabel("Fecha de referencia financiera").fill("2026-11-02");
  await expect(
    page.getByText(money(482535), { exact: true }).first(),
  ).toBeVisible();
});

test("Flujo 4: filtrar ingresos, clientes frecuentes, cotizaciones y acuerdos", async ({
  page,
}) => {
  await login(page);
  await go(page, "finanzas");
  const seed = await page.evaluate(async () => {
    const { createSeed } = await import("/src/data/seed.js");
    return createSeed();
  });
  await page.getByRole("button", { name: "Semanal", exact: true }).click();
  await expect(
    page
      .getByText(money(financialData(seed, "Semanal").total), { exact: true })
      .first(),
  ).toBeVisible();
  await shot(
    page,
    "flujo-4-metricas/01-ingresos-semanales-y-clientes-frecuentes",
  );
  await page.getByRole("button", { name: "Anual", exact: true }).click();
  await expect(
    page
      .getByText(money(financialData(seed, "Anual").total), { exact: true })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cotizaciones aprobadas", exact: true })
    .click();
  await shot(page, "flujo-4-metricas/02-ingresos-anuales-e-historial-aprobado");
  await page
    .getByRole("button", { name: "Ver cotización", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Políticas de servicio incluidas",
  );
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.getByRole("button", { name: "Acuerdos", exact: true }).click();
  const firstId = await page.locator("tbody tr").first().textContent();
  await page
    .getByRole("button", { name: "Página siguiente", exact: true })
    .click();
  await expect(page.locator("tbody tr").first()).not.toHaveText(firstId);
  await page
    .getByRole("button", { name: "Página anterior", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ver acuerdo", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText("Cotización");
  await shot(page, "flujo-4-metricas/03-acuerdo-y-trazabilidad-de-entregas");
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar acuerdos" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("acuerdos.csv");
  const content = await fs.readFile(await file.path(), "utf8");
  expect(content).toContain("Cotización");
  expect(content).toContain("AC-");
  await go(page, "clientes");
  await page.getByRole("button", { name: "Frecuentes", exact: true }).click();
  await page.getByRole("button", { name: "Ver cliente" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("planes contratados");
  await expect(page.getByRole("dialog")).toContainText("Historial de planes");
  await shot(page, "flujo-4-metricas/04-cliente-frecuente-y-preferencias");
  await go(page, "finanzas");
  await page.getByLabel("Fecha de referencia financiera").fill("2025-01-01");
  await expect(page.getByText("No hay acuerdos en este período")).toBeVisible();
  await expect(page.getByText(money(0), { exact: true }).first()).toBeVisible();
});

test("Perfil validado, cobertura, capacidad y políticas transmitidas a una cotización", async ({
  page,
}) => {
  await login(page);
  await go(page, "perfil");
  await page.getByLabel("Correo de contacto público").fill("incorrecto");
  await expect(page.getByText("Ingresa un correo válido.")).toBeVisible();
  await page
    .getByLabel("Correo de contacto público")
    .fill("cocina@almaverde.cr");
  await page.getByLabel("Preparaciones diarias").fill("2");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .first()
    .click();
  await expect(page.getByRole("alert")).toContainText("al menos 10");
  await page.getByLabel("Preparaciones diarias").fill("10");
  await page.getByLabel("Distrito", { exact: true }).fill("Pital");
  await page.getByRole("button", { name: "Agregar zona" }).click();
  await page
    .getByLabel("Condiciones de servicio")
    .fill(
      "Condiciones de prueba: ingredientes de temporada y pago al confirmar el plan.",
    );
  await page.getByLabel("Aviso para cancelaciones (horas)").fill("72");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("se guardaron");
  await page
    .getByRole("button", { name: "Ver perfil público", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("San Carlos · Pital");
  await expect(page.getByRole("dialog")).toContainText("72 horas antes");
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await go(page, "solicitudes/SOL-024");
  await page.getByRole("button", { name: "Elaborar cotización" }).click();
  await expect(page.getByRole("dialog")).toContainText("Condiciones de prueba");
  await page.getByLabel("Inicio del plan", { exact: true }).fill("2026-10-29");
  await page.getByLabel("Cotización válida hasta").fill("2026-10-29");
  await page
    .getByRole("checkbox", { name: /Revisé las restricciones/ })
    .check();
  await page.getByRole("button", { name: "Enviar cotización" }).click();
  await page
    .getByRole("button", { name: "Simular respuesta del cliente", exact: true })
    .click();
  const agreementsBefore = (await saved(page)).agreements.length;
  await page.getByRole("button", { name: "Aceptar propuesta" }).click();
  await expect(page.getByRole("alert")).toContainText("No hay cupo");
  expect((await saved(page)).agreements).toHaveLength(agreementsBefore);
});

test("Reprogramación valida cupos y actualiza las fechas del acuerdo", async ({
  page,
}) => {
  await login(page);
  await go(page, "calendario/AC-041-E5");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Ajustar horario" }).click();
  await page.getByLabel("Nueva fecha").fill("2026-11-04");
  await page.getByLabel("Hora", { exact: true }).fill("13:45");
  await page.getByRole("button", { name: "Guardar horario" }).click();
  await expect(page.getByRole("dialog")).toContainText("13:45 h");
  const state = await saved(page);
  expect(state.deliveries.find((d) => d.id === "AC-041-E5").date).toBe(
    "2026-11-04",
  );
  expect(state.agreements.find((a) => a.id === "AC-041").endDate).toBe(
    "2026-11-04",
  );
});

test("Diseño móvil navegable, sin desbordamiento y con formularios operativos", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await shot(page, "05-vista-movil");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page.getByRole("link", { name: "Preparaciones", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Preparaciones con tu sello" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Ver y editar", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Ingredientes y posibilidades",
  );
  await page
    .getByLabel("Título de la preparación")
    .fill("Bowl de quinoa móvil");
  await page.getByRole("button", { name: "Guardar preparación" }).click();
  await expect(
    page.getByRole("heading", { name: "Bowl de quinoa móvil" }),
  ).toBeVisible();
  for (const route of [
    "solicitudes",
    "cotizaciones",
    "calendario",
    "clientes",
    "finanzas",
    "perfil",
  ]) {
    await go(page, route);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `Overflow en ${route}`,
    ).toBe(true);
  }
});
