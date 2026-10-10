import { Router } from "express";
import { listAppointments } from "../controllers/appointmentController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { createAppointmentSchema } from "../validators/appointmentValidators.js";
import { createAppointmentHandler } from "../controllers/appointmentController.js";
import {
  updateAppointmentSchema,
  updateStatusSchema,
} from "../validators/appointmentValidators.js";
import {
  getAppointmentHandler,
  updateAppointmentHandler,
  updateAppointmentStatusHandler,
} from "../controllers/appointmentController.js";
import { createNoteHandler, getAppointmentNoteHandler } from "../controllers/noteController.js";
import { noteContentSchema } from "../validators/noteValidators.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, listAppointments);
router.post("/", authenticate, validate(createAppointmentSchema), createAppointmentHandler);
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
  validate(noteContentSchema),
  createNoteHandler
);

export default router;
