import { Router } from "express";
import type { AnalyticsService } from "../services/analytics.service.js";
import { asyncHandler } from "./asyncHandler.js";

export function analyticsRouter(service: AnalyticsService): Router {
  const router = Router();

  router.get(
    "/summary",
    asyncHandler(async (_req, res) => {
      res.json(await service.getSummary());
    }),
  );

  return router;
}
