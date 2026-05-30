// Generate the production Postgres schema from the canonical SQLite schema by
// swapping only the datasource provider. One source of truth (schema.prisma);
// no model drift between local SQLite and production Postgres. Run in the
// Render build before `prisma db push`.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, "schema.prisma"), "utf8");

if (!source.includes('provider = "sqlite"')) {
  throw new Error("Expected the canonical schema to use the sqlite provider");
}

const pg = source.replace('provider = "sqlite"', 'provider = "postgresql"');
writeFileSync(join(here, "schema.pg.prisma"), pg);
console.log("Wrote prisma/schema.pg.prisma (postgresql)");
