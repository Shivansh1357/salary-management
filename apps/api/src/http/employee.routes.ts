import { createEmployeeSchema, listEmployeesQuerySchema, updateEmployeeSchema } from "@salary/shared";
import { Router } from "express";
import type { EmployeeService } from "../services/employee.service.js";
import { asyncHandler } from "./asyncHandler.js";

export function employeeRouter(service: EmployeeService): Router {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const query = listEmployeesQuerySchema.parse(req.query);
      res.json(await service.list(query));
    }),
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const input = createEmployeeSchema.parse(req.body);
      res.status(201).json(await service.create(input));
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      res.json(await service.get(req.params.id!));
    }),
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const input = updateEmployeeSchema.parse(req.body);
      res.json(await service.update(req.params.id!, input));
    }),
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      await service.remove(req.params.id!);
      res.status(204).send();
    }),
  );

  return router;
}
