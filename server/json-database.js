import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { createSeed } from "../src/data/seed.js";

const collections = [
  "preparations",
  "clients",
  "requests",
  "quotes",
  "agreements",
  "deliveries",
];
const MAX_BYTES = 5 * 1024 * 1024;

function invalid(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
export function validateDatabase(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    typeof value.profile?.id !== "string" ||
    typeof value.profile.name !== "string"
  ) {
    throw invalid(
      "El JSON debe incluir el perfil del oferente y las colecciones del sistema.",
    );
  }
  for (const name of collections) {
    if (
      !Array.isArray(value[name]) ||
      value[name].some((item) => !item || typeof item.id !== "string") ||
      new Set(value[name].map((item) => item.id)).size !== value[name].length
    ) {
      throw invalid(
        `La colección ${name} debe ser una lista de registros con identificadores únicos.`,
      );
    }
  }
  return value;
}
const revisionOf = (value) => createHash("sha256").update(value).digest("hex");

// Replace the complete document only after the temporary file is safely written.
async function writeDatabase(filename, state) {
  validateDatabase(state);
  const text = JSON.stringify(state, null, 2) + "\n";
  if (Buffer.byteLength(text) > MAX_BYTES)
    throw invalid("El archivo JSON supera el límite local de 5 MB.", 413);
  await mkdir(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    const file = await open(temporary, "wx");
    try {
      await file.writeFile(text, "utf8");
      await file.sync();
    } finally {
      await file.close();
    }
    await rename(temporary, filename);
  } finally {
    await unlink(temporary).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
  return { state, revision: revisionOf(text) };
}

async function readDatabase(filename) {
  try {
    const text = await readFile(filename, "utf8");
    let state;
    try {
      state = validateDatabase(JSON.parse(text.replace(/^\uFEFF/, "")));
    } catch {
      throw invalid(
        "No se pudo leer data/db.json. Revisa su formato y estructura; el archivo se conserva sin cambios.",
        500,
      );
    }
    return { state, revision: revisionOf(text) };
  } catch (error) {
    if (error.code === "ENOENT") return writeDatabase(filename, createSeed());
    throw error;
  }
}

async function readBody(request) {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_BYTES)
      throw invalid("El archivo JSON supera el límite local de 5 MB.", 413);
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw invalid("El contenido enviado no es un JSON válido.");
  }
}

export function createDatabaseMiddleware(filename) {
  let operations = Promise.resolve();
  const original = JSON.stringify(createSeed());
  return (request, response, next) => {
    const pathname = request.url?.split("?")[0];
    if (pathname !== "/api/data") return next();
    const send = (status, body) => {
      response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(body));
    };
    // One queue also orders reads after pending writes. A stale page cannot replace newer data.
    operations = operations
      .then(async () => {
        if (!["GET", "PUT"].includes(request.method)) {
          response.setHeader("Allow", "GET, PUT");
          throw invalid("Método no permitido.", 405);
        }
        const current = await readDatabase(filename);
        if (request.method === "GET") {
          send(200, {
            ...current,
            isInitial: JSON.stringify(current.state) === original,
          });
          return;
        }
        const origin = request.headers.origin;
        if (origin && new URL(origin).host !== request.headers.host)
          throw invalid(
            "El guardado solo está disponible desde la aplicación local.",
            403,
          );
        if (!request.headers["content-type"]?.startsWith("application/json"))
          throw invalid("Envía los datos en formato JSON.", 415);
        if (!request.headers["if-match"])
          throw invalid(
            "Falta la versión de los datos que se desean actualizar.",
            428,
          );
        const state = validateDatabase(await readBody(request));
        // Check again after reading the body to detect changes made from the editor.
        const latest = await readDatabase(filename);
        if (request.headers["if-match"] !== latest.revision)
          throw invalid(
            "Los datos cambiaron en otra pestaña o en el archivo. Recarga la página antes de guardar para conservar esos cambios.",
            409,
          );
        send(200, await writeDatabase(filename, state));
      })
      .catch((error) =>
        send(error.status || 500, {
          error: error.status
            ? error.message
            : "No se pudo guardar data/db.json. Revisa que la carpeta permita escritura y vuelve a intentarlo.",
        }),
      );
  };
}

export function jsonDatabasePlugin() {
  const attach = (server) => {
    const filename =
      process.env.DIETA_DATA_FILE ||
      path.join(server.config.root, "data", "db.json");
    server.middlewares.use(createDatabaseMiddleware(filename));
  };
  return {
    name: "dieta-json-database",
    config: () => ({
      server: { watch: { ignored: ["**/data/db.json", "**/data/*.tmp"] } },
    }),
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
