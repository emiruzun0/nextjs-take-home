import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same "@/..." imports as tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // e2e/ is run by Playwright, not Vitest.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
