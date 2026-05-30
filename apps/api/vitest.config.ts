import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Integration tests create their own SQLite file per worker; run files
    // sequentially so they don't contend over the same on-disk database.
    fileParallelism: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
