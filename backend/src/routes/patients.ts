import { Router } from "express";
import { getPatient, listPatients } from "../controllers/patientController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { listPatientAppointments } from "../controllers/appointmentController.js";
import { listPatientNotesHandler } from "../controllers/noteController.js";

const router = Router();

router.get("/", authenticate, listPatients);
router.get("/:id", authenticate, getPatient);
router.get("/:id/appointments", authenticate, listPatientAppointments);
router.get("/:id/notes", authenticate, authorize("DOCTOR"), listPatientNotesHandler);

export default router;
