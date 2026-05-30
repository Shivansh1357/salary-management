import { faker } from "@faker-js/faker";
import {
  COUNTRIES,
  type CreateEmployeeInput,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  LEVELS,
  type Level,
} from "@salary/shared";
import { fromUsdMinor } from "../domain/currency.js";

/** Target annual base pay per level, in USD (before country/jitter), major units. */
const LEVEL_BASE_USD: Record<Level, number> = {
  L1: 60_000,
  L2: 85_000,
  L3: 110_000,
  L4: 145_000,
  L5: 185_000,
  L6: 240_000,
};

/** Rough cost-of-labor multiplier per country, to make analytics realistic. */
const COUNTRY_FACTOR: Record<string, number> = {
  US: 1.0,
  GB: 0.9,
  DE: 0.95,
  FR: 0.9,
  CA: 0.85,
  AU: 0.88,
  SG: 0.85,
  JP: 0.8,
  IN: 0.35,
  BR: 0.4,
};

const JOB_TITLES_BY_LEVEL: Record<Level, string> = {
  L1: "Associate",
  L2: "Specialist",
  L3: "Senior Specialist",
  L4: "Lead",
  L5: "Principal",
  L6: "Director",
};

/**
 * Deterministically generate `count` plausible employees for seeding. Salaries
 * are derived from a per-level USD target, adjusted by a country factor and
 * jitter, then expressed in the employee's native currency minor units — so the
 * USD-normalized analytics show realistic level/country differences.
 */
export function generateEmployees(count: number, seed = 1337): CreateEmployeeInput[] {
  faker.seed(seed);

  const employees: CreateEmployeeInput[] = [];
  for (let i = 0; i < count; i++) {
    const country = faker.helpers.arrayElement(COUNTRIES);
    const level = faker.helpers.arrayElement(LEVELS);
    const department = faker.helpers.arrayElement(DEPARTMENTS);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const targetUsd = LEVEL_BASE_USD[level] * (COUNTRY_FACTOR[country.code] ?? 1);
    const jitter = faker.number.float({ min: 0.85, max: 1.15 });
    const targetUsdMinor = Math.round(targetUsd * 100 * jitter);
    // Express the USD target in the employee's native currency minor units,
    // honoring that currency's real decimal places (e.g. JPY has none).
    const baseSalary = fromUsdMinor(targetUsdMinor, country.currency);

    employees.push({
      firstName,
      lastName,
      // Index-suffixed for guaranteed uniqueness across 10k rows.
      email: `${firstName}.${lastName}.${i}@acme.test`.toLowerCase().replace(/[^a-z0-9.@]/g, ""),
      department,
      jobTitle: `${JOB_TITLES_BY_LEVEL[level]}, ${department}`,
      level,
      country: country.code,
      currency: country.currency,
      baseSalary,
      employmentType: faker.helpers.weightedArrayElement([
        { weight: 8, value: "full_time" },
        { weight: 1, value: "part_time" },
        { weight: 1, value: "contract" },
      ]) as (typeof EMPLOYMENT_TYPES)[number],
      hireDate: faker.date.between({ from: "2015-01-01", to: "2025-12-31" }).toISOString().slice(0, 10),
      status: faker.helpers.weightedArrayElement([
        { weight: 19, value: "active" as const },
        { weight: 1, value: "inactive" as const },
      ]),
    });
  }
  return employees;
}
