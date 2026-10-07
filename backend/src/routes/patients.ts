import { Router } from "express";
import { listPatients } from "../controllers/patientController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/", authenticate, listPatients);

export default router;
