/**
 * Health Controller
 * Endpoint: GET /api/health
 * Returns status: "healthy", timestamp, and uptime
 */

const startTime = Date.now();

export function getHealth(req, res) {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const timestamp = new Date().toISOString();

  const data = {
    status: "healthy",
    timestamp,
    uptime: uptimeSeconds,
    service: "SentinelCore Security Hub API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  };

  res.status(200).json({
    success: true,
    data,
    // Top-level aliases for direct access
    status: "healthy",
    timestamp,
    uptime: uptimeSeconds,
  });
}

