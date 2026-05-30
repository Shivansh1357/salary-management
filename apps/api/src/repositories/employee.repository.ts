import type { GroupStat, ListEmployeesQuery } from "@salary/shared";

/** A persisted employee row. Dates are native `Date`s at this layer. */
export interface EmployeeRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  jobTitle: string;
  level: string;
  country: string;
  currency: string;
  baseSalary: number;
  baseSalaryUsdMinor: number;
  employmentType: string;
  hireDate: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Fields written on create/update; the USD figure is computed by the service. */
export type NewEmployeeRecord = Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">;

/**
 * Persistence boundary for employees. Services depend on this interface, never
 * on Prisma — see ADR 0001 / 0006. The Prisma implementation is the only place
 * the ORM is imported; the interface is what makes services unit-testable.
 */
export interface EmployeeRepository {
  create(data: NewEmployeeRecord): Promise<EmployeeRecord>;
  findById(id: string): Promise<EmployeeRecord | null>;
  list(query: ListEmployeesQuery): Promise<{ data: EmployeeRecord[]; total: number }>;
  /** Returns the updated record, or null if no employee has that id. */
  update(id: string, data: Partial<NewEmployeeRecord>): Promise<EmployeeRecord | null>;
  /** Returns true if a row was deleted, false if the id did not exist. */
  delete(id: string): Promise<boolean>;
  /** Whether an email is already taken, optionally excluding one employee id. */
  existsByEmail(email: string, exceptId?: string): Promise<boolean>;
}

/** Read model for analytics aggregation (see AnalyticsService). */
export interface AnalyticsRepository {
  /** USD-normalized salaries of active employees, for median/histogram. */
  activeUsdSalaries(): Promise<number[]>;
  /** Per-group headcount and salary totals/averages (USD), computed in SQL. */
  groupStats(field: "department" | "country" | "level"): Promise<GroupStat[]>;
}
