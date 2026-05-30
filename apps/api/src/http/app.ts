import cors from "cors";
import express, { type Express } from "express";
import type { AnalyticsService } from "../services/analytics.service.js";
import type { EmployeeService } from "../services/employee.service.js";
import { analyticsRouter } from "./analytics.routes.js";
import { employeeRouter } from "./employee.routes.js";
import { errorMiddleware } from "./errorMiddleware.js";

export interface AppDeps {
  employeeService: EmployeeService;
  analyticsService: AnalyticsService;
  /** Allowed CORS origins; defaults to permissive for local/dev use. */
  corsOrigins?: string[];
}

/**
 * Builds the Express app from injected services. Services are passed in (rather
 * than constructed here) so tests can wire real repositories to a test database.
 */
export function createApp({ employeeService, analyticsService, corsOrigins }: AppDeps): Express {
  const app = express();

  app.use(cors(corsOrigins?.length ? { origin: corsOrigins } : undefined));
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/employees", employeeRouter(employeeService));
  app.use("/api/analytics", analyticsRouter(analyticsService));

  app.use(errorMiddleware);

  return app;
}
