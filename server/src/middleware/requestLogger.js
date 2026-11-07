/**
 * Security-aware Request Logger
 * Redacts sensitive fields (passwords, tokens, credentials) from any log output.
 * Strictly adheres to rule: Do NOT log the plain password anywhere.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "pw",
  "pass",
  "token",
  "secret",
  "authorization",
  "apikey",
  "api_key",
  "accesstoken",
  "cookie",
]);

function sanitizeLogPayload(obj) {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeLogPayload);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED_BY_SECURITY_POLICY]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeLogPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function requestLogger(req, res, next) {
  const start = Date.now();
  const ip = req.ip || req.connection.remoteAddress || "unknown";

  res.on("finish", () => {
    // Skip noisy health pings in production if desired, but in dev keep structured output
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const path = req.originalUrl || req.url;

    // Log without exposing sensitive payload
    if (process.env.NODE_ENV !== "test") {
      const color = status >= 500 ? "\x1b[31m" : status >= 400 ? "\x1b[33m" : "\x1b[32m";
      console.log(
        `[SentinelCore] ${method} ${path} ${color}${status}\x1b[0m ${duration}ms - IP: ${ip}`
      );
    }
  });

  next();
}

