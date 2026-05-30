import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../test/createTestDb.js";
import { PrismaAnalyticsRepository } from "./prisma-analytics.repository.js";

const { prisma, cleanup } = createTestDb();
const repo = new PrismaAnalyticsRepository(prisma);

let seq = 0;
function insert(over: { department?: string; usd?: number; status?: string }) {
  seq += 1;
  return prisma.employee.create({
    data: {
      firstName: "Test",
      lastName: `User${seq}`,
      email: `user${seq}@acme.test`,
      department: over.department ?? "Engineering",
      jobTitle: "Engineer",
      level: "L3",
      country: "US",
      currency: "USD",
      baseSalary: over.usd ?? 100_00,
      baseSalaryUsdMinor: over.usd ?? 100_00,
      employmentType: "full_time",
      hireDate: "2021-01-01",
      status: over.status ?? "active",
    },
  });
}

beforeEach(async () => {
  await prisma.employee.deleteMany();
  seq = 0;
});

afterAll(cleanup);

describe("PrismaAnalyticsRepository", () => {
  it("returns USD salaries of active employees only", async () => {
    await insert({ usd: 100_00 });
    await insert({ usd: 200_00 });
    await insert({ usd: 999_00, status: "inactive" });
    const salaries = await repo.activeUsdSalaries();
    expect(salaries.sort((a, b) => a - b)).toEqual([100_00, 200_00]);
  });

  it("groups active employees by department with headcount, total and average", async () => {
    await insert({ department: "Engineering", usd: 100_00 });
    await insert({ department: "Engineering", usd: 200_00 });
    await insert({ department: "Sales", usd: 300_00 });
    await insert({ department: "Sales", usd: 999_00, status: "inactive" });

    const stats = await repo.groupStats("department");
    const eng = stats.find((s) => s.key === "Engineering");
    const sales = stats.find((s) => s.key === "Sales");

    expect(eng).toEqual({
      key: "Engineering",
      headcount: 2,
      totalSalaryUsdMinor: 300_00,
      averageSalaryUsdMinor: 150_00,
    });
    expect(sales).toMatchObject({ headcount: 1, totalSalaryUsdMinor: 300_00 });
  });

  it("returns an empty array when there are no employees", async () => {
    expect(await repo.groupStats("country")).toEqual([]);
    expect(await repo.activeUsdSalaries()).toEqual([]);
  });
});
