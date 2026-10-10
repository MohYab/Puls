import { Router } from "express";
import { getPatient, listPatients } from "../controllers/patientController.js";
import { authenticate } from "../middleware/authenticate.js";
import { listPatientAppointments } from "../controllers/appointmentController.js";

const router = Router();

router.get("/", authenticate, listPatients);
router.get("/:id", authenticate, getPatient);
router.get("/:id/appointments", authenticate, listPatientAppointments);

export default router;
