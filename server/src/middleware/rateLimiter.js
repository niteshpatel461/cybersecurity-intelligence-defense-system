import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

/**
 * Scanner endpoints rate limiter:
 * Maximum 30 requests per minute per IP for:
 * - POST /api/check-password
 * - POST /api/scan-url
 * - POST /api/report
 */
export const scannerRateLimiter = rateLimit({
  windowMs: config.rateLimit.scannerWindowMs, // 60,000 ms (1 minute)
  limit: config.rateLimit.scannerMax,         // 30 requests
  standardHeaders: "draft-7",                // Combined `RateLimit` header
  legacyHeaders: false,                      // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Maximum ${config.rateLimit.scannerMax} requests per minute allowed for scanner endpoints. Please try again later.`,
    });
  },
});

/**
 * General endpoints rate limiter (e.g. 120 requests/min)
 */
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.generalWindowMs,
  limit: config.rateLimit.generalMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Rate limit exceeded for general endpoints. Please slow down.",
    });
  },
});

