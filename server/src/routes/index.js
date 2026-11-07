import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import advisoryRoutes from "./advisoryRoutes.js";
import passwordRoutes from "./passwordRoutes.js";
import scanRoutes from "./scanRoutes.js";
import reportRoutes from "./reportRoutes.js";

const apiRouter = Router();

// Mount all required endpoints
apiRouter.use(healthRoutes);
apiRouter.use(advisoryRoutes);
apiRouter.use(passwordRoutes);
apiRouter.use(scanRoutes);
apiRouter.use(reportRoutes);

export default apiRouter;

