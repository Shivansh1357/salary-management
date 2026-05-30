import { prisma } from "./db/prisma.js";
import { createApp } from "./http/app.js";
import { PrismaAnalyticsRepository } from "./repositories/prisma-analytics.repository.js";
import { PrismaEmployeeRepository } from "./repositories/prisma-employee.repository.js";
import { AnalyticsService } from "./services/analytics.service.js";
import { EmployeeService } from "./services/employee.service.js";

const port = Number(process.env.PORT ?? 4000);
const corsOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const app = createApp({
  employeeService: new EmployeeService(new PrismaEmployeeRepository(prisma)),
  analyticsService: new AnalyticsService(new PrismaAnalyticsRepository(prisma)),
  corsOrigins,
});

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

// Graceful shutdown so the SQLite connection is released cleanly.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => {
      void prisma.$disconnect().then(() => process.exit(0));
    });
  });
}
