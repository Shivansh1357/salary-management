/**
 * Analytics DTOs returned by GET /api/analytics/summary. All monetary figures
 * are USD-normalized integer minor units (cents) — see ADR 0003 / 0005.
 * Computation lives in the API's analytics service; these are the contract.
 */

export interface GroupStat {
  /** Group key, e.g. department name, country code, or level. */
  key: string;
  headcount: number;
  /** Average base salary for the group, USD minor units. */
  averageSalaryUsdMinor: number;
  /** Total base salary for the group, USD minor units. */
  totalSalaryUsdMinor: number;
}

export interface HistogramBucket {
  /** Inclusive lower bound of the bucket, USD minor units. */
  fromUsdMinor: number;
  /** Exclusive upper bound, USD minor units; null for the open-ended top bucket. */
  toUsdMinor: number | null;
  count: number;
}

export interface AnalyticsSummary {
  headcount: number;
  totalPayrollUsdMinor: number;
  averageSalaryUsdMinor: number;
  medianSalaryUsdMinor: number;
  byDepartment: GroupStat[];
  byCountry: GroupStat[];
  byLevel: GroupStat[];
  distribution: HistogramBucket[];
}
