import { Router } from "express";
import { listTemplates } from "../controllers/documentationTemplateController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, authorize("DOCTOR"), listTemplates);

export default router;
