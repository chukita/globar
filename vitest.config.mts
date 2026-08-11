import { defineConfig } from "vitest/config";
import path from "path";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: [
      // Exacto y con prioridad sobre el alias "@/*" de abajo: las pruebas usan
      // Postgres en memoria (src/test/db.ts) en vez de conectarse a la DB real.
      { find: /^@\/db$/, replacement: path.resolve(root, "src/test/db.ts") },
      { find: "@", replacement: path.resolve(root, "src") },
    ],
  },
});
