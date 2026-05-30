import type { ListEmployeesQuery } from "@salary/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createTestDb } from "../test/createTestDb.js";
import type { NewEmployeeRecord } from "./employee.repository.js";
import { PrismaEmployeeRepository } from "./prisma-employee.repository.js";

const { prisma, cleanup } = createTestDb();
const repo = new PrismaEmployeeRepository(prisma);

const record = (over: Partial<NewEmployeeRecord> = {}): NewEmployeeRecord => ({
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@acme.test",
  department: "Engineering",
  jobTitle: "Engineer",
  level: "L5",
  country: "GB",
  currency: "GBP",
  baseSalary: 100_00,
  baseSalaryUsdMinor: 127_00,
  employmentType: "full_time",
  hireDate: "2021-03-01",
  status: "active",
  ...over,
});

const query = (over: Partial<ListEmployeesQuery> = {}): ListEmployeesQuery => ({
  sort: "lastName",
  order: "asc",
  page: 1,
  pageSize: 25,
  ...over,
});

beforeEach(async () => {
  await prisma.employee.deleteMany();
});

afterAll(cleanup);

describe("PrismaEmployeeRepository", () => {
  it("creates and reads back an employee", async () => {
    const created = await repo.create(record());
    const found = await repo.findById(created.id);
    expect(found?.email).toBe("ada@acme.test");
    expect(found?.baseSalaryUsdMinor).toBe(127_00);
    expect(found?.createdAt).toBeInstanceOf(Date);
  });

  it("returns null for a missing id", async () => {
    expect(await repo.findById("nope")).toBeNull();
  });

  it("detects an existing email, excluding a given id", async () => {
    const created = await repo.create(record({ email: "x@acme.test" }));
    expect(await repo.existsByEmail("x@acme.test")).toBe(true);
    expect(await repo.existsByEmail("x@acme.test", created.id)).toBe(false);
    expect(await repo.existsByEmail("other@acme.test")).toBe(false);
  });

  it("updates fields and returns the new record", async () => {
    const created = await repo.create(record());
    const updated = await repo.update(created.id, { jobTitle: "Principal" });
    expect(updated?.jobTitle).toBe("Principal");
  });

  it("returns null when updating a missing id", async () => {
    expect(await repo.update("nope", { jobTitle: "x" })).toBeNull();
  });

  it("deletes by id and reports whether a row was removed", async () => {
    const created = await repo.create(record());
    expect(await repo.delete(created.id)).toBe(true);
    expect(await repo.delete(created.id)).toBe(false);
  });

  describe("list", () => {
    it("paginates and reports the unfiltered total", async () => {
      await repo.create(record({ email: "a@acme.test", lastName: "A" }));
      await repo.create(record({ email: "b@acme.test", lastName: "B" }));
      await repo.create(record({ email: "c@acme.test", lastName: "C" }));
      const result = await repo.list(query({ pageSize: 2, page: 1 }));
      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(2);
    });

    it("filters by department", async () => {
      await repo.create(record({ email: "e@acme.test", department: "Engineering" }));
      await repo.create(record({ email: "s@acme.test", department: "Sales" }));
      const result = await repo.list(query({ department: "Sales" }));
      expect(result.total).toBe(1);
      expect(result.data[0]?.department).toBe("Sales");
    });

    it("searches by name or email (case-insensitive)", async () => {
      await repo.create(record({ email: "grace@acme.test", firstName: "Grace", lastName: "Hopper" }));
      await repo.create(record({ email: "ada@acme.test", firstName: "Ada", lastName: "Lovelace" }));
      const result = await repo.list(query({ search: "hopp" }));
      expect(result.total).toBe(1);
      expect(result.data[0]?.firstName).toBe("Grace");
    });

    it("sorts by base salary descending", async () => {
      await repo.create(record({ email: "lo@acme.test", baseSalary: 50_00 }));
      await repo.create(record({ email: "hi@acme.test", baseSalary: 300_00 }));
      const result = await repo.list(query({ sort: "baseSalary", order: "desc" }));
      expect(result.data[0]?.email).toBe("hi@acme.test");
    });
  });
});
