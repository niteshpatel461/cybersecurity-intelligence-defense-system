import { Router } from "express";
import { scanTargetUrl } from "../controllers/scanController.js";
import { scannerRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Rate limit: 30 requests per minute per IP
router.post("/scan-url", scannerRateLimiter, scanTargetUrl);

export default router;

