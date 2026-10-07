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

export default router;
