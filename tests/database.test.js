import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createDatabaseMiddleware } from "../server/json-database.js";

async function temporaryDatabase(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "dieta-json-test-"));
  t.after(async () => {
    assert.equal(
      path.dirname(path.resolve(directory)),
      path.resolve(os.tmpdir()),
    );
    await rm(directory, { recursive: true, force: true });
  });
  return path.join(directory, "db.json");
}
async function startServer(filename) {
  const middleware = createDatabaseMiddleware(filename);
  const server = createServer((request, response) =>
    middleware(request, response, () => {
      response.writeHead(404);
      response.end();
    }),
  );
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}/api/data`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
const put = (url, data, revision) =>
  fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "If-Match": revision },
    body: JSON.stringify(data),
  });

test("Los cambios se escriben en JSON y sobreviven al reinicio del servidor", async (t) => {
  const filename = await temporaryDatabase(t);
  const first = await startServer(filename);
  let data;
  try {
    const initial = await (await fetch(first.url)).json();
    data = initial.state;
    data.profile.name = "Mi cocina persistente";
    data.preparations[0].description =
      "Descripción modificada y guardada en disco.";
    data.deliveries[0].state = "Listo para entrega";
    const saved = await put(first.url, data, initial.revision);
    assert.equal(saved.status, 200);
    assert.deepEqual(JSON.parse(await readFile(filename, "utf8")), data);
  } finally {
    await first.close();
  }
  const second = await startServer(filename);
  try {
    assert.deepEqual((await (await fetch(second.url)).json()).state, data);
  } finally {
    await second.close();
  }
});

test("Se leen ediciones manuales y se bloquean guardados de pestañas desactualizadas", async (t) => {
  const filename = await temporaryDatabase(t);
  const server = await startServer(filename);
  try {
    const original = await (await fetch(server.url)).json();
    const manual = structuredClone(original.state);
    manual.profile.name = "Editado desde el archivo";
    await writeFile(filename, JSON.stringify(manual, null, 2), "utf8");
    const conflict = await put(server.url, original.state, original.revision);
    assert.equal(conflict.status, 409);
    assert.match((await conflict.json()).error, /otra pestaña o en el archivo/);
    const loaded = await (await fetch(server.url)).json();
    assert.equal(loaded.state.profile.name, manual.profile.name);
    assert.notEqual(loaded.revision, original.revision);
  } finally {
    await server.close();
  }
});

test("Un JSON dañado se conserva y produce un error sin reiniciar datos", async (t) => {
  const filename = await temporaryDatabase(t);
  const broken = '{"profile":';
  await writeFile(filename, broken, "utf8");
  const server = await startServer(filename);
  try {
    const response = await fetch(server.url);
    assert.equal(response.status, 500);
    assert.match((await response.json()).error, /se conserva sin cambios/);
    assert.equal(await readFile(filename, "utf8"), broken);
  } finally {
    await server.close();
  }
});

test("Las solicitudes inválidas no reemplazan el archivo y los guardados sucesivos se ordenan", async (t) => {
  const filename = await temporaryDatabase(t);
  const server = await startServer(filename);
  try {
    const initial = await (await fetch(server.url)).json();
    assert.equal(
      (await put(server.url, { profile: {} }, initial.revision)).status,
      400,
    );
    const missingVersion = await fetch(server.url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initial.state),
    });
    assert.equal(missingVersion.status, 428);
    const first = structuredClone(initial.state);
    first.profile.name = "Primer cambio";
    const second = structuredClone(initial.state);
    second.profile.name = "Cambio desactualizado";
    const results = await Promise.all([
      put(server.url, first, initial.revision),
      put(server.url, second, initial.revision),
    ]);
    assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);
    const final = await (await fetch(server.url)).json();
    assert.ok(
      [first.profile.name, second.profile.name].includes(
        final.state.profile.name,
      ),
    );
    const unrelated = await fetch(server.url.replace("/api/data", "/api/otro"));
    assert.equal(unrelated.status, 404);
  } finally {
    await server.close();
  }
});
