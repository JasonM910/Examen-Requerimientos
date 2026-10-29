import { test, expect } from "@playwright/test";

test("Borradores recuperables, validación de duración, rechazo y políticas históricas", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Completar datos de demostración" })
    .click();
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await page.evaluate(() => {
    window.location.hash = "solicitudes/SOL-024";
  });
  await page.getByRole("button", { name: "Elaborar cotización" }).click();
  await page.getByLabel("Días preparación 1", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByRole("alert")).toContainText("exactamente 5 días");
  await page.getByLabel("Días preparación 1", { exact: true }).fill("3");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const draft = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("dieta-saludable-v1")).quotes.at(-1),
  );
  expect(draft.state).toBe("Borrador");
  await page.evaluate(() => {
    window.location.hash = "cotizaciones";
  });
  await page.getByRole("button", { name: "Borradores", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page
    .getByRole("checkbox", { name: /Revisé las restricciones/ })
    .check();
  await page.getByRole("button", { name: "Enviar cotización" }).click();
  await expect(
    page.getByRole("heading", { name: "Tu propuesta ya está enviada" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar ventana" }).click();
  await page.evaluate(() => {
    window.location.hash = "perfil";
  });
  await page
    .getByLabel("Condiciones de servicio")
    .fill("Condiciones nuevas para futuras propuestas.");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("se guardaron");
  await page.evaluate((id) => {
    window.location.hash = `cotizaciones/${id}`;
  }, draft.id);
  await expect(page.getByRole("dialog")).toContainText(draft.policies.terms);
  await expect(page.getByRole("dialog")).not.toContainText(
    "Condiciones nuevas para futuras propuestas.",
  );
  await page
    .getByRole("button", { name: "Simular respuesta del cliente", exact: true })
    .click();
  await page.getByRole("button", { name: "Rechazar propuesta" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("dieta-saludable-v1")),
  );
  expect(state.quotes.filter((q) => q.requestId === "SOL-024")).toHaveLength(1);
  expect(state.quotes.find((q) => q.id === draft.id).state).toBe("Rechazada");
  expect(state.requests.find((r) => r.id === "SOL-024").state).toBe(
    "En revisión",
  );
  expect(state.agreements.some((a) => a.requestId === "SOL-024")).toBe(false);
  await page.evaluate(() => {
    window.location.hash = "solicitudes/SOL-024";
  });
  await expect(
    page.getByRole("button", { name: "Elaborar cotización" }),
  ).toBeVisible();
});
