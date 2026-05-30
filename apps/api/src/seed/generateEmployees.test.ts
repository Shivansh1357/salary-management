import { COUNTRIES, type Level } from "@salary/shared";
import { describe, expect, it } from "vitest";
import { toUsdMinor } from "../domain/currency.js";
import { generateEmployees } from "./generateEmployees.js";

const currencyOf = (code: string) => COUNTRIES.find((c) => c.code === code)!.currency;

describe("generateEmployees", () => {
  it("generates the requested number of employees", () => {
    expect(generateEmployees(50, 1)).toHaveLength(50);
  });

  it("is deterministic for a given seed", () => {
    expect(generateEmployees(20, 42)).toEqual(generateEmployees(20, 42));
  });

  it("produces different data for different seeds", () => {
    const a = generateEmployees(20, 1)[0]!.email;
    const b = generateEmployees(20, 2)[0]!.email;
    expect(a).not.toBe(b);
  });

  it("gives every employee a unique email", () => {
    const emails = generateEmployees(500, 7).map((e) => e.email);
    expect(new Set(emails).size).toBe(500);
  });

  it("sets each employee's currency to match their country", () => {
    for (const emp of generateEmployees(200, 3)) {
      expect(emp.currency).toBe(currencyOf(emp.country));
    }
  });

  it("uses whole, positive base salaries (integer minor units)", () => {
    for (const emp of generateEmployees(200, 5)) {
      expect(Number.isInteger(emp.baseSalary)).toBe(true);
      expect(emp.baseSalary).toBeGreaterThan(0);
    }
  });

  it("keeps native salaries within the 32-bit INT storage range", () => {
    // Regression: low-denomination currencies (JPY/INR) must not overflow.
    for (const emp of generateEmployees(2000, 9)) {
      expect(emp.baseSalary).toBeLessThan(2_147_483_647);
    }
  });

  it("pays higher levels more on average (USD-normalized)", () => {
    const employees = generateEmployees(2000, 11);
    const meanUsd = (level: Level) => {
      const xs = employees
        .filter((e) => e.level === level)
        .map((e) => toUsdMinor(e.baseSalary, e.currency));
      return xs.reduce((a, b) => a + b, 0) / xs.length;
    };
    expect(meanUsd("L6")).toBeGreaterThan(meanUsd("L1"));
  });
});
