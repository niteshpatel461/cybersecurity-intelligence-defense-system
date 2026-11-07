import { Router } from "express";
import { submitIncidentReport } from "../controllers/reportController.js";
import { scannerRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Rate limit: 30 requests per minute per IP
router.post("/report", scannerRateLimiter, submitIncidentReport);

export default router;

