import { defineConfig } from "vitest/config";
import path from "path";
import os from "os";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Seteado acá (no en el test file) porque src/lib/uploads.ts lee
    // process.env.UPLOAD_DIR una sola vez, al importarse — un `import`
    // en el test file se resuelve antes que cualquier código de su propio
    // cuerpo (hoisting de ES modules), así que asignarlo ahí llega tarde.
    env: {
      UPLOAD_DIR: path.join(os.tmpdir(), "globar-test-uploads"),
    },
    // Cada archivo de test arranca su propia instancia de PGlite (Postgres
    // en memoria vía WASM) y corre las migraciones desde cero en beforeAll.
    // Con varios archivos en paralelo eso compite por CPU y se pasa del
    // hookTimeout default (10s) — no es un test lento, es contención.
    // fileParallelism:false corre los archivos secuenciales (más lento en
    // total, pero cada uno con la máquina para él solo) y el timeout más
    // alto da margen igual.
    fileParallelism: false,
    hookTimeout: 30_000,
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
