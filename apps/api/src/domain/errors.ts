/**
 * Domain errors carry an HTTP status and a stable machine code. The HTTP error
 * middleware maps these to the standard `{ error: { message, code } }` envelope,
 * so services stay framework-agnostic.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "not_found");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409, "conflict");
  }
}
