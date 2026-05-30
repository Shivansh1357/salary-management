import { defineConfig } from "tsup";

/**
 * Bundle the server for production. The workspace package @salary/shared is
 * inlined (noExternal) so the deployed artifact needs no TypeScript runtime;
 * node_modules deps (express, @prisma/client, zod, cors) stay external.
 */
export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  platform: "node",
  target: "node20",
  outDir: "dist",
  clean: true,
  noExternal: ["@salary/shared"],
});
