import { Router } from "express";
import { getAdvisories, getAdvisoryById } from "../controllers/advisoryController.js";

const router = Router();

router.get("/advisories", getAdvisories);
router.get("/advisories/:id", getAdvisoryById);

export default router;

