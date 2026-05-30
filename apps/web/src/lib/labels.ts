import { COUNTRIES } from "@salary/shared";

/** Human-friendly employment-type labels. */
export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};

const COUNTRY_NAME = new Map<string, string>(COUNTRIES.map((c) => [c.code, c.name]));

export function countryName(code: string): string {
  return COUNTRY_NAME.get(code) ?? code;
}

export function employmentTypeLabel(value: string): string {
  return EMPLOYMENT_TYPE_LABELS[value] ?? value;
}
