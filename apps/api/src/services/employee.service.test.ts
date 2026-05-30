import type { CreateEmployeeInput } from "@salary/shared";
import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../domain/errors.js";
import { EmployeeService } from "./employee.service.js";
import { createFakeEmployeeRepository } from "./__fixtures__/fakeEmployeeRepository.js";

const input = (over: Partial<CreateEmployeeInput> = {}): CreateEmployeeInput => ({
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@acme.test",
  department: "Engineering",
  jobTitle: "Staff Engineer",
  level: "L5",
  country: "GB",
  currency: "GBP",
  baseSalary: 100_00, // £100.00 minor
  employmentType: "full_time",
  hireDate: "2021-03-01",
  status: "active",
  ...over,
});

const makeService = () => {
  const repo = createFakeEmployeeRepository();
  return { repo, service: new EmployeeService(repo) };
};

describe("EmployeeService.create", () => {
  it("persists the employee and returns a DTO with ISO date strings", async () => {
    const { service } = makeService();
    const created = await service.create(input());
    expect(created.id).toBeTruthy();
    expect(created.email).toBe("ada@acme.test");
    expect(typeof created.createdAt).toBe("string");
  });

  it("computes the USD-normalized salary from native salary + currency", async () => {
    const { service } = makeService();
    const created = await service.create(input({ baseSalary: 100_00, currency: "GBP" }));
    expect(created.baseSalaryUsdMinor).toBe(127_00); // 100.00 GBP * 1.27
  });

  it("rejects a duplicate email with a ConflictError", async () => {
    const { service } = makeService();
    await service.create(input({ email: "dup@acme.test" }));
    await expect(service.create(input({ email: "dup@acme.test" }))).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});

describe("EmployeeService.get", () => {
  it("returns the employee when it exists", async () => {
    const { service } = makeService();
    const created = await service.create(input());
    expect((await service.get(created.id)).id).toBe(created.id);
  });

  it("throws NotFoundError for an unknown id", async () => {
    const { service } = makeService();
    await expect(service.get("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("EmployeeService.list", () => {
  it("returns a paginated envelope echoing page and pageSize", async () => {
    const { service } = makeService();
    await service.create(input({ email: "a@acme.test" }));
    await service.create(input({ email: "b@acme.test" }));
    const result = await service.list({
      page: 1,
      pageSize: 25,
      sort: "lastName",
      order: "asc",
    } as never);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
    expect(result.data).toHaveLength(2);
  });
});

describe("EmployeeService.update", () => {
  it("recomputes the USD salary when base salary changes", async () => {
    const { service } = makeService();
    const created = await service.create(input({ currency: "USD", baseSalary: 100_00 }));
    const updated = await service.update(created.id, { baseSalary: 250_00 });
    expect(updated.baseSalary).toBe(250_00);
    expect(updated.baseSalaryUsdMinor).toBe(250_00); // USD identity
  });

  it("recomputes the USD salary when only the currency changes", async () => {
    const { service } = makeService();
    const created = await service.create(input({ currency: "USD", baseSalary: 100_00 }));
    const updated = await service.update(created.id, { currency: "GBP" });
    expect(updated.baseSalaryUsdMinor).toBe(127_00);
  });

  it("throws NotFoundError when updating a missing employee", async () => {
    const { service } = makeService();
    await expect(service.update("missing", { jobTitle: "x" })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("throws ConflictError when changing email to one already in use", async () => {
    const { service } = makeService();
    await service.create(input({ email: "taken@acme.test" }));
    const other = await service.create(input({ email: "other@acme.test" }));
    await expect(
      service.update(other.id, { email: "taken@acme.test" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("allows an update that keeps the same email (no false conflict)", async () => {
    const { service } = makeService();
    const created = await service.create(input({ email: "keep@acme.test" }));
    const updated = await service.update(created.id, {
      email: "keep@acme.test",
      jobTitle: "Principal Engineer",
    });
    expect(updated.jobTitle).toBe("Principal Engineer");
  });
});

describe("EmployeeService.remove", () => {
  it("deletes an existing employee", async () => {
    const { service } = makeService();
    const created = await service.create(input());
    await service.remove(created.id);
    await expect(service.get(created.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError when deleting a missing employee", async () => {
    const { service } = makeService();
    await expect(service.remove("missing")).rejects.toBeInstanceOf(NotFoundError);
  });
});
