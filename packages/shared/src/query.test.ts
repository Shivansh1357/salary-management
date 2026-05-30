import { describe, expect, it } from "vitest";
import { listEmployeesQuerySchema } from "./query.js";

describe("listEmployeesQuerySchema", () => {
  it("applies defaults when query is empty", () => {
    const q = listEmployeesQuerySchema.parse({});
    expect(q.page).toBe(1);
    expect(q.pageSize).toBe(25);
    expect(q.sort).toBe("lastName");
    expect(q.order).toBe("asc");
  });

  it("coerces numeric strings from the querystring", () => {
    const q = listEmployeesQuerySchema.parse({ page: "3", pageSize: "50" });
    expect(q.page).toBe(3);
    expect(q.pageSize).toBe(50);
  });

  it("clamps pageSize to the maximum", () => {
    expect(listEmployeesQuerySchema.parse({ pageSize: "9999" }).pageSize).toBe(100);
  });

  it("rejects page below 1", () => {
    expect(listEmployeesQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("accepts whitelisted sort fields", () => {
    expect(listEmployeesQuerySchema.parse({ sort: "baseSalary" }).sort).toBe("baseSalary");
  });

  it("rejects a non-whitelisted sort field (no arbitrary column injection)", () => {
    expect(listEmployeesQuerySchema.safeParse({ sort: "password" }).success).toBe(false);
  });

  it("keeps optional filters undefined when absent", () => {
    const q = listEmployeesQuerySchema.parse({});
    expect(q.department).toBeUndefined();
    expect(q.search).toBeUndefined();
  });

  it("passes through valid filters", () => {
    const q = listEmployeesQuerySchema.parse({
      search: "ada",
      department: "Engineering",
      country: "GB",
      level: "L5",
      status: "active",
    });
    expect(q).toMatchObject({
      search: "ada",
      department: "Engineering",
      country: "GB",
      level: "L5",
      status: "active",
    });
  });

  it("rejects an invalid status filter", () => {
    expect(listEmployeesQuerySchema.safeParse({ status: "retired" }).success).toBe(false);
  });
});
