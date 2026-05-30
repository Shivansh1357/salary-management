import type { GroupStat } from "@salary/shared";
import { describe, expect, it } from "vitest";
import type { AnalyticsRepository } from "../repositories/employee.repository.js";
import { AnalyticsService } from "./analytics.service.js";

function fakeRepo(over: Partial<{
  salaries: number[];
  groups: Record<string, GroupStat[]>;
}> = {}): AnalyticsRepository {
  const salaries = over.salaries ?? [];
  const groups = over.groups ?? {};
  return {
    async activeUsdSalaries() {
      return salaries;
    },
    async groupStats(field) {
      return groups[field] ?? [];
    },
  };
}

describe("AnalyticsService.getSummary", () => {
  it("reports zeroed totals when there are no employees", async () => {
    const summary = await new AnalyticsService(fakeRepo()).getSummary();
    expect(summary.headcount).toBe(0);
    expect(summary.totalPayrollUsdMinor).toBe(0);
    expect(summary.averageSalaryUsdMinor).toBe(0);
    expect(summary.medianSalaryUsdMinor).toBe(0);
  });

  it("computes headcount, total, average and median from USD salaries", async () => {
    const service = new AnalyticsService(
      fakeRepo({ salaries: [100_00, 200_00, 300_00] }),
    );
    const summary = await service.getSummary();
    expect(summary.headcount).toBe(3);
    expect(summary.totalPayrollUsdMinor).toBe(600_00);
    expect(summary.averageSalaryUsdMinor).toBe(200_00);
    expect(summary.medianSalaryUsdMinor).toBe(200_00);
  });

  it("rounds a fractional average to the nearest minor unit", async () => {
    const service = new AnalyticsService(fakeRepo({ salaries: [100_00, 100_01] }));
    // (10000 + 10001) / 2 = 10000.5 -> 10001
    expect((await service.getSummary()).averageSalaryUsdMinor).toBe(100_01);
  });

  it("includes a salary distribution histogram", async () => {
    const service = new AnalyticsService(fakeRepo({ salaries: [40_000_00, 90_000_00] }));
    const summary = await service.getSummary();
    const totalInBuckets = summary.distribution.reduce((acc, b) => acc + b.count, 0);
    expect(totalInBuckets).toBe(2);
  });

  it("passes through the per-group breakdowns from the repository", async () => {
    const byDepartment: GroupStat[] = [
      { key: "Engineering", headcount: 2, averageSalaryUsdMinor: 150_00, totalSalaryUsdMinor: 300_00 },
    ];
    const service = new AnalyticsService(
      fakeRepo({ salaries: [150_00, 150_00], groups: { department: byDepartment } }),
    );
    const summary = await service.getSummary();
    expect(summary.byDepartment).toEqual(byDepartment);
  });
});
