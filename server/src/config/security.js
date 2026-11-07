import { config } from "./env.js";

/**
 * Build dynamic CORS origin validator
 */
function getOrigins() {
  const allowed = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
  ]);

  if (config.corsOrigin) {
    config.corsOrigin.split(",").forEach((origin) => {
      const trimmed = origin.trim();
      if (trimmed) allowed.add(trimmed);
    });
  }

  if (config.frontendUrl) {
    allowed.add(config.frontendUrl.trim());
  }

  return allowed;
}

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, server-to-server, mobile apps)
    if (!origin) return callback(null, true);

    const allowedOrigins = getOrigins();
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    // In development mode, allow localhost on any port
    if (!config.isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...Array.from(getOrigins())],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: config.isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: config.isProduction
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
};

