export function notFoundHandler(req, res, next) {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`,
  );

  error.status = 404;
  error.code = "NOT_FOUND";

  next(error);
}

export function errorHandler(err, req, res, next) {
  // Log lỗi server (5xx) vào stderr; client errors (4xx) không cần log
  if (!err.status || err.status >= 500) console.error("[ErrorHandler]", err);
  if (res.headersSent) {
    return next(err);
  }

  // Lỗi CORS
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      error: {
        code: "CORS_ORIGIN_DENIED",
        message: "This origin is not allowed.",
      },
    });
  }

  // JSON gửi lên không hợp lệ
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_JSON",
        message: "Request body contains invalid JSON.",
      },
    });
  }

  // Multer upload errors (file size / number of files).
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, error: { code: "FILE_TOO_LARGE", message: "File vượt quá dung lượng cho phép." } });
  }
  if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ success: false, error: { code: "INVALID_FILE_UPLOAD", message: "Trường file hoặc số lượng file không hợp lệ." } });
  }

  // Lỗi kiểm tra dữ liệu của Zod
  if (err.name === "ZodError" && Array.isArray(err.issues)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request data is invalid.",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  const status = Number(err.status || err.statusCode) || 500;

  // Chỉ cho phép mã HTTP lỗi hợp lệ.
  const safeStatus =
    status >= 400 && status <= 599 ? status : 500;
const defaultCode =
  safeStatus === 404
    ? "NOT_FOUND"
    : safeStatus === 401
      ? "UNAUTHENTICATED"
      : safeStatus === 403
        ? "FORBIDDEN"
        : safeStatus === 409
          ? "CONFLICT"
          : safeStatus === 429
            ? "RATE_LIMITED"
            : safeStatus >= 500
              ? "INTERNAL_SERVER_ERROR"
              : "REQUEST_ERROR";

const code =
  safeStatus >= 500
    ? "INTERNAL_SERVER_ERROR"
    : err.code || defaultCode;

if (safeStatus >= 500) {
  req.log?.error({ err }, "Unhandled application error");
}

const errorResponse = {
  success: false,
  error: {
    code,
    message:
      safeStatus >= 500
        ? "An unexpected error occurred."
        : err.message || "Request failed.",
  },
};

// Chỉ trả details cho lỗi không phải lỗi server.
if (safeStatus < 500 && err.details !== undefined) {
  errorResponse.error.details = err.details;
}

return res.status(safeStatus).json(errorResponse);
}