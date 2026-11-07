import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  rateLimit: {
    scannerMax: parseInt(process.env.RATE_LIMIT_SCANNER_MAX || "30", 10),
    scannerWindowMs: parseInt(process.env.RATE_LIMIT_SCANNER_WINDOW_MS || "60000", 10),
    generalMax: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || "120", 10),
    generalWindowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS || "60000", 10),
  },
  databaseUrl: process.env.DATABASE_URL || "file:./data/sentinelcore.db",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

