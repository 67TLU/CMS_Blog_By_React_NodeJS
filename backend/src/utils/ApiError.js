export class ApiError extends Error {
  constructor(
    statusCode,
    code,
    message,
    details = undefined,
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;

    if (details !== undefined) {
      this.details = details;
    }

    Error.captureStackTrace?.(this, ApiError);
  }
}