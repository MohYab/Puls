import { Router } from "express";
import {
  createAppointmentHandler,
  getAppointmentHandler,
  listAppointments,
  listAppointmentsToDocument,
  updateAppointmentHandler,
  updateAppointmentStatusHandler,
} from "../controllers/appointmentController.js";
import { createNoteHandler, getAppointmentNoteHandler } from "../controllers/noteController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
  updateStatusSchema,
} from "../validators/appointmentValidators.js";
import { createNoteSchema } from "../validators/noteValidators.js";

const router = Router();

router.get("/", authenticate, listAppointments);
router.post("/", authenticate, validate(createAppointmentSchema), createAppointmentHandler);

// Must come before "/:id", or Express matches "to-document" as an id (first match wins).
router.get("/to-document", authenticate, authorize("DOCTOR"), listAppointmentsToDocument);

router.get("/:id", authenticate, getAppointmentHandler);
router.put("/:id", authenticate, validate(updateAppointmentSchema), updateAppointmentHandler);
router.patch(
  "/:id/status",
  authenticate,
  validate(updateStatusSchema),
  updateAppointmentStatusHandler
);

router.get("/:id/notes", authenticate, authorize("DOCTOR"), getAppointmentNoteHandler);
router.post(
  "/:id/notes",
  authenticate,
  authorize("DOCTOR"),
  validate(createNoteSchema),
  createNoteHandler
);

export default router;
