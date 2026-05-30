import type { PrismaClient } from "@prisma/client";
import type { GroupStat } from "@salary/shared";
import type { AnalyticsRepository } from "./employee.repository.js";

/** Analytics consider active employees only — that is "how we pay people". */
const ACTIVE = { status: "active" } as const;

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async activeUsdSalaries(): Promise<number[]> {
    const rows = await this.prisma.employee.findMany({
      where: ACTIVE,
      select: { baseSalaryUsdMinor: true },
    });
    return rows.map((r) => r.baseSalaryUsdMinor);
  }

  async groupStats(field: "department" | "country" | "level"): Promise<GroupStat[]> {
    // SQL aggregation — counts/sums/averages computed in the database, not in app.
    const groups = await this.prisma.employee.groupBy({
      by: [field],
      where: ACTIVE,
      _count: { _all: true },
      _sum: { baseSalaryUsdMinor: true },
      _avg: { baseSalaryUsdMinor: true },
    });

    return groups.map((g) => ({
      key: g[field],
      headcount: g._count._all,
      totalSalaryUsdMinor: g._sum.baseSalaryUsdMinor ?? 0,
      averageSalaryUsdMinor: Math.round(g._avg.baseSalaryUsdMinor ?? 0),
    }));
  }
}
