import { test, expect, saved } from "./fixtures.js";
import { createSeed } from "../src/data/seed.js";

async function enter(page) {
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

test("Los cambios permanecen al cerrar la página y abrirla en otro navegador sin localStorage", async ({
  page,
  browser,
}) => {
  await enter(page);
  await page.evaluate(() => {
    window.location.hash = "perfil";
  });
  await page.getByLabel("Nombre del negocio").fill("Cocina que permanece");
  await page.getByLabel("Teléfono", { exact: true }).fill("8888-4321");
  await page
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("se guardaron");
  expect((await saved(page)).profile.name).toBe("Cocina que permanece");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.close();
  const context = await browser.newContext();
  try {
    const reopened = await context.newPage();
    await reopened.goto("http://127.0.0.1:4175/");
    await reopened
      .getByRole("button", { name: "Completar datos de demostración" })
      .click();
    await reopened
      .getByRole("button", { name: "Iniciar sesión", exact: true })
      .click();
    await reopened.evaluate(() => {
      window.location.hash = "perfil";
    });
    await expect(reopened.getByLabel("Nombre del negocio")).toHaveValue(
      "Cocina que permanece",
    );
    await expect(reopened.getByLabel("Teléfono", { exact: true })).toHaveValue(
      "8888-4321",
    );
  } finally {
    await context.close();
  }
});

test("Un error de escritura mantiene el formulario abierto y no muestra un guardado exitoso", async ({
  page,
}) => {
  await enter(page);
  await page.evaluate(() => {
    window.location.hash = "preparaciones/P-01";
  });
  await page
    .getByLabel("Título de la preparación")
    .fill("Nombre que no debe guardarse");
  await page.route("**/api/data", (route) =>
    route.request().method() === "PUT"
      ? route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            error: "No se pudo escribir el archivo de prueba.",
          }),
        })
      : route.continue(),
  );
  await page
    .getByRole("button", { name: "Guardar preparación", exact: true })
    .click();
  await expect(page.getByRole("alert").first()).toContainText(
    "No se pudo escribir",
  );
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByTestId("save-status")).toHaveText(
    "Cambios sin guardar",
  );
  const state = await saved(page);
  expect(state.preparations[0].title).toBe("Bowl de quinoa y vegetales");
});

test("Se importan una vez los datos anteriores y se respetan las ediciones posteriores del JSON", async ({
  page,
}) => {
  const legacy = createSeed();
  legacy.profile.name = "Mi negocio anterior";
  await page.addInitScript(
    (state) =>
      localStorage.setItem("dieta-saludable-v1", JSON.stringify(state)),
    legacy,
  );
  await enter(page);
  expect((await saved(page)).profile.name).toBe("Mi negocio anterior");
  const current = await (await page.request.get("/api/data")).json();
  current.state.profile.name = "Nombre editado en el JSON";
  const response = await page.request.put("/api/data", {
    headers: { "If-Match": current.revision },
    data: current.state,
  });
  expect(response.ok()).toBe(true);
  await page.reload();
  await page.evaluate(() => {
    window.location.hash = "perfil";
  });
  await expect(page.getByLabel("Nombre del negocio")).toHaveValue(
    "Nombre editado en el JSON",
  );
});
