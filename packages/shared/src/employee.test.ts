import { describe, expect, it } from "vitest";
import { createEmployeeSchema } from "./employee.js";

const valid = {
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@acme.test",
  department: "Engineering",
  jobTitle: "Staff Engineer",
  level: "L5",
  country: "GB",
  currency: "GBP",
  baseSalary: 12000000, // 120,000.00 in minor units
  employmentType: "full_time",
  hireDate: "2021-03-01",
};

describe("createEmployeeSchema", () => {
  it("accepts a fully valid employee", () => {
    const parsed = createEmployeeSchema.parse(valid);
    expect(parsed.email).toBe("ada@acme.test");
    expect(parsed.baseSalary).toBe(12000000);
  });

  it("defaults status to active when omitted", () => {
    expect(createEmployeeSchema.parse(valid).status).toBe("active");
  });

  it("rejects an invalid email", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, email: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative salary", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, baseSalary: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer salary (minor units must be whole)", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, baseSalary: 100.5 });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown department", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, department: "Wizardry" });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported currency", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, currency: "XYZ" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from names", () => {
    const parsed = createEmployeeSchema.parse({ ...valid, firstName: "  Ada  " });
    expect(parsed.firstName).toBe("Ada");
  });

  it("rejects an empty first name", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, firstName: "   " });
    expect(result.success).toBe(false);
  });
});
