import { test as base, expect } from "@playwright/test";
import { createSeed } from "../src/data/seed.js";

export const test = base.extend({
  database: [
    async ({ request }, use) => {
      const current = await request.get("/api/data");
      const { revision } = await current.json();
      const reset = await request.put("/api/data", {
        headers: { "If-Match": revision },
        data: createSeed(),
      });
      expect(reset.ok()).toBe(true);
      await use();
    },
    { auto: true },
  ],
});
export { expect };

export async function saved(page) {
  await expect(page.getByTestId("save-status")).not.toHaveText(
    "Guardando cambios…",
  );
  const response = await page.request.get("/api/data");
  expect(response.ok()).toBe(true);
  return (await response.json()).state;
}
