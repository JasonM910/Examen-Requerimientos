import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { jsonDatabasePlugin } from "./server/json-database.js";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), jsonDatabasePlugin()],
});
