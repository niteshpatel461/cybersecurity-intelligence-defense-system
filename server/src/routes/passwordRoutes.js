import { Router } from "express";
import { checkPassword } from "../controllers/passwordController.js";
import { scannerRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Rate limit: 30 requests per minute per IP
router.post("/check-password", scannerRateLimiter, checkPassword);

export default router;

