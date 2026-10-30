export const DATA_ENDPOINT = "/api/data";

async function result(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(
      "No se pudo conectar con el archivo de datos. Inicia la aplicación con npm run dev o npm run preview.",
    );
  }
  if (!response.ok)
    throw new Error(body.error || "No se pudieron guardar los datos.");
  return body;
}
export function loadDatabase(signal) {
  return fetch(DATA_ENDPOINT, { cache: "no-store", signal }).then(result);
}
export function saveDatabase(state, revision, signal) {
  return fetch(DATA_ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "If-Match": revision },
    body: JSON.stringify(state),
    signal,
  }).then(result);
}
export async function migrateBrowserData(database, signal) {
  // Import the previous version only while the file still contains the original demo.
  // Once initialized, the JSON file is always authoritative, including manual edits.
  const oldKey = "dieta-saludable-v1";
  const migratedKey = "dieta-json-migrated";
  try {
    if (localStorage.getItem(migratedKey)) return database;
    const legacy = JSON.parse(localStorage.getItem(oldKey) || "null");
    if (
      database.isInitial &&
      legacy?.profile?.id &&
      Array.isArray(legacy.deliveries)
    ) {
      database = await saveDatabase(legacy, database.revision, signal);
      localStorage.removeItem(oldKey);
    }
    localStorage.setItem(migratedKey, "true");
  } catch (error) {
    if (error.name === "AbortError" || signal?.aborted) throw error;
    // Never overwrite the file or discard older browser data after a failed import.
    if (error instanceof SyntaxError || error.name === "SecurityError")
      return database;
    throw error;
  }
  return database;
}
