import { Router } from "express";
import { listDoctors } from "../controllers/doctorController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/", authenticate, listDoctors);

export default router;
