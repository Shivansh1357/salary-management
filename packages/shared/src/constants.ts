/**
 * Reference data shared by API and web. Kept deliberately small and explicit:
 * a curated set of departments, levels, and supported countries/currencies is
 * enough for the assessment and keeps validation total.
 */

export const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Sales",
  "Marketing",
  "Customer Success",
  "Finance",
  "People",
  "Legal",
  "Operations",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

/** Career levels, junior (L1) to principal/exec (L6). */
export const LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6"] as const;
export type Level = (typeof LEVELS)[number];

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "intern"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYEE_STATUSES = ["active", "inactive"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

/**
 * Supported countries with their default currency. Multi-country is core to the
 * brief; this curated list keeps currency normalization (ADR 0003) total.
 */
export const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "BR", name: "Brazil", currency: "BRL" },
] as const;
export type CountryCode = (typeof COUNTRIES)[number]["code"];

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as readonly CountryCode[];

export const CURRENCIES = ["USD", "GBP", "INR", "EUR", "CAD", "AUD", "SGD", "JPY", "BRL"] as const;
export type Currency = (typeof CURRENCIES)[number];
