import { z } from "zod";
import {
  COUNTRY_CODES,
  CURRENCIES,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  LEVELS,
} from "./constants.js";

const nonEmptyTrimmed = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`);

/** Salary is stored in integer minor units (cents) — see ADR 0005. */
const salaryMinor = z
  .number()
  .int("Salary must be a whole number of minor units")
  .nonnegative("Salary cannot be negative");

export const createEmployeeSchema = z.object({
  firstName: nonEmptyTrimmed("First name"),
  lastName: nonEmptyTrimmed("Last name"),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  department: z.enum(DEPARTMENTS),
  jobTitle: nonEmptyTrimmed("Job title"),
  level: z.enum(LEVELS),
  country: z.enum(COUNTRY_CODES as [string, ...string[]]),
  currency: z.enum(CURRENCIES),
  baseSalary: salaryMinor,
  employmentType: z.enum(EMPLOYMENT_TYPES),
  hireDate: z.string().date(),
  status: z.enum(EMPLOYEE_STATUSES).default("active"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

/** Updates are partial; every field is optional but validated when present. */
export const updateEmployeeSchema = createEmployeeSchema.partial();
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

/** A persisted employee as returned by the API. */
export const employeeSchema = createEmployeeSchema.extend({
  id: z.string(),
  status: z.enum(EMPLOYEE_STATUSES),
  /** USD-normalized salary in minor units, computed server-side (ADR 0003). */
  baseSalaryUsdMinor: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Employee = z.infer<typeof employeeSchema>;
