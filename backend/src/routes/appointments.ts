import { Router } from "express";
import { listAppointments } from "../controllers/appointmentController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.get("/", authenticate, listAppointments);

export default router;
