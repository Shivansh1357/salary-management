import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../domain/errors.js";

/**
 * Translates thrown errors into the standard envelope
 * `{ error: { message, code, details? } }` with the right status code.
 * Zod validation errors → 400; domain AppErrors → their status; else → 500.
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express needs 4 args to treat this as error middleware
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { message: "Validation failed", code: "validation", details: err.flatten() },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.status).json({ error: { message: err.message, code: err.code } });
    return;
  }

  // Unexpected — log server-side, return an opaque 500.
  console.error("Unhandled error:", err);
  res.status(500).json({ error: { message: "Internal server error", code: "internal" } });
}
