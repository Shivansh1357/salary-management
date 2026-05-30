import { execSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

/**
 * Spins up an isolated, throwaway SQLite database for integration tests by
 * applying the committed migrations to a fresh temp file. Real SQL, no mocks,
 * no shared state between test files — see ADR 0006.
 */
export function createTestDb(): { prisma: PrismaClient; cleanup: () => Promise<void> } {
  const dir = mkdtempSync(join(tmpdir(), "salary-test-"));
  const url = `file:${join(dir, "test.db")}`;

  execSync("pnpm exec prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "ignore",
  });

  const prisma = new PrismaClient({ datasources: { db: { url } } });

  return {
    prisma,
    async cleanup() {
      await prisma.$disconnect();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}
