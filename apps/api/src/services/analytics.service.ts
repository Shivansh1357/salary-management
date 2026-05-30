import type { AnalyticsSummary } from "@salary/shared";
import { buildHistogram, median, sum } from "../domain/statistics.js";
import type { AnalyticsRepository } from "../repositories/employee.repository.js";

/**
 * Salary distribution bands in USD minor units: $50k, $100k, $150k, $200k, $250k.
 * Produces buckets <$50k, $50–100k, …, $250k+.
 */
export const SALARY_BANDS_USD_MINOR = [
  50_000_00, 100_000_00, 150_000_00, 200_000_00, 250_000_00,
];

/**
 * Assembles the org-wide pay analytics. Counts/totals/averages per group are
 * computed in SQL by the repository; median and the distribution are computed
 * here from the active employees' USD salaries.
 */
export class AnalyticsService {
  constructor(private readonly repo: AnalyticsRepository) {}

  async getSummary(): Promise<AnalyticsSummary> {
    const salaries = await this.repo.activeUsdSalaries();
    const headcount = salaries.length;
    const totalPayrollUsdMinor = sum(salaries);
    const averageSalaryUsdMinor =
      headcount === 0 ? 0 : Math.round(totalPayrollUsdMinor / headcount);

    const [byDepartment, byCountry, byLevel] = await Promise.all([
      this.repo.groupStats("department"),
      this.repo.groupStats("country"),
      this.repo.groupStats("level"),
    ]);

    return {
      headcount,
      totalPayrollUsdMinor,
      averageSalaryUsdMinor,
      medianSalaryUsdMinor: median(salaries),
      byDepartment,
      byCountry,
      byLevel,
      distribution: buildHistogram(salaries, SALARY_BANDS_USD_MINOR),
    };
  }
}
