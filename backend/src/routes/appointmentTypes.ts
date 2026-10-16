import { Router } from "express";
import {
  createAppointmentTypeHandler,
  listAppointmentTypes,
  updateAppointmentTypeHandler,
  updateAppointmentTypeStatusHandler,
} from "../controllers/appointmentTypeController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  appointmentTypeSchema,
  appointmentTypeStatusSchema,
} from "../validators/appointmentTypeValidators.js";

const router = Router();

router.get("/", authenticate, listAppointmentTypes);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(appointmentTypeSchema),
  createAppointmentTypeHandler
);

router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(appointmentTypeSchema),
  updateAppointmentTypeHandler
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(appointmentTypeStatusSchema),
  updateAppointmentTypeStatusHandler
);

export default router;
