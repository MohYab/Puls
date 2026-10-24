import { Router } from "express";
import {
  createPatientHandler,
  getPatient,
  listPatients,
  updatePatientHandler,
  updatePatientStatusHandler,
} from "../controllers/patientController.js";
import { listPatientAppointments } from "../controllers/appointmentController.js";
import { listPatientNotesHandler } from "../controllers/noteController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { patientSchema, patientStatusSchema } from "../validators/patientValidators.js";

const router = Router();

router.get("/", authenticate, listPatients);
router.post("/", authenticate, validate(patientSchema), createPatientHandler);

router.get("/:id", authenticate, getPatient);
router.put("/:id", authenticate, validate(patientSchema), updatePatientHandler);
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(patientStatusSchema),
  updatePatientStatusHandler
);

router.get("/:id/appointments", authenticate, listPatientAppointments);
router.get("/:id/notes", authenticate, authorize("DOCTOR"), listPatientNotesHandler);

export default router;
