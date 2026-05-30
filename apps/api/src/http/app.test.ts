import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaAnalyticsRepository } from "../repositories/prisma-analytics.repository.js";
import { PrismaEmployeeRepository } from "../repositories/prisma-employee.repository.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { EmployeeService } from "../services/employee.service.js";
import { createTestDb } from "../test/createTestDb.js";
import { createApp } from "./app.js";

const { prisma, cleanup } = createTestDb();
const app: Express = createApp({
  employeeService: new EmployeeService(new PrismaEmployeeRepository(prisma)),
  analyticsService: new AnalyticsService(new PrismaAnalyticsRepository(prisma)),
});

const payload = (over: Record<string, unknown> = {}) => ({
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@acme.test",
  department: "Engineering",
  jobTitle: "Engineer",
  level: "L5",
  country: "GB",
  currency: "GBP",
  baseSalary: 100_00,
  employmentType: "full_time",
  hireDate: "2021-03-01",
  ...over,
});

beforeEach(async () => {
  await prisma.employee.deleteMany();
});

afterAll(cleanup);

describe("GET /api/health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /api/employees", () => {
  it("creates an employee and returns 201 with the USD salary computed", async () => {
    const res = await request(app).post("/api/employees").send(payload());
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.baseSalaryUsdMinor).toBe(127_00);
  });

  it("returns 400 with a validation envelope for bad input", async () => {
    const res = await request(app).post("/api/employees").send(payload({ email: "nope" }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("validation");
    expect(res.body.error.details).toBeTruthy();
  });

  it("returns 409 for a duplicate email", async () => {
    await request(app).post("/api/employees").send(payload({ email: "dup@acme.test" }));
    const res = await request(app).post("/api/employees").send(payload({ email: "dup@acme.test" }));
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("conflict");
  });
});

describe("GET /api/employees", () => {
  it("returns a paginated list", async () => {
    await request(app).post("/api/employees").send(payload({ email: "a@acme.test" }));
    await request(app).post("/api/employees").send(payload({ email: "b@acme.test" }));
    const res = await request(app).get("/api/employees?pageSize=1");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pageSize).toBe(1);
  });

  it("filters by department", async () => {
    await request(app).post("/api/employees").send(payload({ email: "e@acme.test", department: "Engineering" }));
    await request(app).post("/api/employees").send(payload({ email: "s@acme.test", department: "Sales" }));
    const res = await request(app).get("/api/employees?department=Sales");
    expect(res.body.total).toBe(1);
  });

  it("returns 400 for an invalid sort field", async () => {
    const res = await request(app).get("/api/employees?sort=password");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/employees/:id", () => {
  it("returns the employee", async () => {
    const created = await request(app).post("/api/employees").send(payload());
    const res = await request(app).get(`/api/employees/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("ada@acme.test");
  });

  it("returns 404 for a missing employee", async () => {
    const res = await request(app).get("/api/employees/missing");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("not_found");
  });
});

describe("PATCH /api/employees/:id", () => {
  it("updates and returns the employee", async () => {
    const created = await request(app).post("/api/employees").send(payload());
    const res = await request(app)
      .patch(`/api/employees/${created.body.id}`)
      .send({ jobTitle: "Principal Engineer" });
    expect(res.status).toBe(200);
    expect(res.body.jobTitle).toBe("Principal Engineer");
  });

  it("returns 404 when updating a missing employee", async () => {
    const res = await request(app).patch("/api/employees/missing").send({ jobTitle: "x" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/employees/:id", () => {
  it("returns 204 on success", async () => {
    const created = await request(app).post("/api/employees").send(payload());
    const res = await request(app).delete(`/api/employees/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it("returns 404 when deleting a missing employee", async () => {
    const res = await request(app).delete("/api/employees/missing");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/analytics/summary", () => {
  it("returns org-wide pay analytics", async () => {
    await request(app).post("/api/employees").send(payload({ email: "a@acme.test", currency: "USD", baseSalary: 100_00 }));
    await request(app).post("/api/employees").send(payload({ email: "b@acme.test", currency: "USD", baseSalary: 300_00 }));
    const res = await request(app).get("/api/analytics/summary");
    expect(res.status).toBe(200);
    expect(res.body.headcount).toBe(2);
    expect(res.body.totalPayrollUsdMinor).toBe(400_00);
    expect(res.body.averageSalaryUsdMinor).toBe(200_00);
    expect(Array.isArray(res.body.byDepartment)).toBe(true);
    expect(Array.isArray(res.body.distribution)).toBe(true);
  });
});
