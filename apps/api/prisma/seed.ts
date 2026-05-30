import { PrismaClient } from "@prisma/client";
import { toUsdMinor } from "../src/domain/currency.js";
import { generateEmployees } from "../src/seed/generateEmployees.js";

/** Number of employees to seed (10,000 per the brief; override with SEED_COUNT). */
const COUNT = Number(process.env.SEED_COUNT ?? 10_000);
const BATCH_SIZE = 1_000;

const prisma = new PrismaClient();

async function main() {
  // Idempotent for deploys: only seed an empty database unless forced, so a
  // restart in production preserves any edits a reviewer has made.
  const existing = await prisma.employee.count();
  if (existing > 0 && process.env.FORCE_SEED !== "true") {
    console.log(`Database already has ${existing.toLocaleString()} employees — skipping seed.`);
    return;
  }

  console.log(`Seeding ${COUNT.toLocaleString()} employees…`);
  await prisma.employee.deleteMany();

  // Deterministic generation, then attach the computed USD-normalized salary.
  const employees = generateEmployees(COUNT).map((e) => ({
    ...e,
    baseSalaryUsdMinor: toUsdMinor(e.baseSalary, e.currency),
  }));

  for (let i = 0; i < employees.length; i += BATCH_SIZE) {
    await prisma.employee.createMany({ data: employees.slice(i, i + BATCH_SIZE) });
    process.stdout.write(`\r  inserted ${Math.min(i + BATCH_SIZE, employees.length)}/${employees.length}`);
  }

  const total = await prisma.employee.count();
  console.log(`\nDone. ${total.toLocaleString()} employees in the database.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
