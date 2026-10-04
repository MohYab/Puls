import { Router } from "express";
import { listAppointmentTypes } from "../controllers/appointmentTypeController.js";

const router = Router();

router.get("/", listAppointmentTypes);

export default router;
