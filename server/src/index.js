import app from "./app.js";
import { config } from "./config/env.js";

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
=====================================================
  🛡️  SENTINELCORE SECURITY HUB API
=====================================================
  [✓] Status: Active & Listening
  [✓] Port: ${PORT}
  [✓] Environment: ${config.nodeEnv}
  [✓] CORS Allowed: ${config.corsOrigin}
  [✓] Rate Limiting: 30 req/min for scanner endpoints
  [✓] Base URL: http://localhost:${PORT}
  [✓] Health Check: http://localhost:${PORT}/api/health
=====================================================
`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\n[SentinelCore] Received ${signal}. Initiating graceful termination...`);
  server.close(() => {
    console.log("[SentinelCore] HTTP server closed cleanly. Exiting process.");
    process.exit(0);
  });

  // Force shutdown if connections do not close in 10s
  setTimeout(() => {
    console.error("[SentinelCore] Forced shutdown: connections did not close in time.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;

