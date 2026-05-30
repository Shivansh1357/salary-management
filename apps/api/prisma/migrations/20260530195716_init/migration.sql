/*
  Warnings:

  - Added the required column `baseSalaryUsdMinor` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "baseSalary" INTEGER NOT NULL,
    "baseSalaryUsdMinor" INTEGER NOT NULL,
    "employmentType" TEXT NOT NULL,
    "hireDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Employee" ("baseSalary", "country", "createdAt", "currency", "department", "email", "employmentType", "firstName", "hireDate", "id", "jobTitle", "lastName", "level", "status", "updatedAt") SELECT "baseSalary", "country", "createdAt", "currency", "department", "email", "employmentType", "firstName", "hireDate", "id", "jobTitle", "lastName", "level", "status", "updatedAt" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE INDEX "Employee_department_idx" ON "Employee"("department");
CREATE INDEX "Employee_country_idx" ON "Employee"("country");
CREATE INDEX "Employee_level_idx" ON "Employee"("level");
CREATE INDEX "Employee_status_idx" ON "Employee"("status");
CREATE INDEX "Employee_lastName_idx" ON "Employee"("lastName");
CREATE INDEX "Employee_baseSalaryUsdMinor_idx" ON "Employee"("baseSalaryUsdMinor");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
