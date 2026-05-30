import { z } from "zod";
import {
  COUNTRY_CODES,
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  LEVELS,
} from "./constants.js";

/** Columns the directory may sort by — whitelisted to prevent column injection. */
export const SORTABLE_FIELDS = [
  "lastName",
  "firstName",
  "baseSalary",
  "department",
  "level",
  "hireDate",
  "createdAt",
] as const;
export type SortableField = (typeof SORTABLE_FIELDS)[number];

export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_SIZE = 25;

export const listEmployeesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  country: z.enum(COUNTRY_CODES as [string, ...string[]]).optional(),
  level: z.enum(LEVELS).optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  sort: z.enum(SORTABLE_FIELDS).default("lastName"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).catch(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;

/** Shape of a paginated list response. */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
