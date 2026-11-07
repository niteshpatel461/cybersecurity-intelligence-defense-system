/**
 * Centralized Error Handling Middleware
 * Guarantees uniform JSON structure: { success: boolean, error: string }
 */

export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

export function globalErrorHandler(err, req, res, next) {
  // Handle JSON parse errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "Malformed JSON payload in request body.",
    });
  }

  // Handle CORS errors
  if (err.message && err.message.startsWith("CORS policy blocked")) {
    return res.status(403).json({
      success: false,
      error: err.message,
    });
  }

  // Handle payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: "Request entity too large. Payload exceeds allowable limit (100kb).",
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "An internal server error occurred. SentinelCore incident response logged."
      : err.message || "An unexpected error occurred.";

  if (process.env.NODE_ENV !== "test" && statusCode === 500) {
    console.error("[SentinelCore Unhandled Error]:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

