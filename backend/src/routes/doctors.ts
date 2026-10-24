import { Router } from "express";
import {
  createDoctorHandler,
  listDoctors,
  updateDoctorHandler,
  updateDoctorStatusHandler,
} from "../controllers/doctorController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import {
  createDoctorSchema,
  doctorStatusSchema,
  updateDoctorSchema,
} from "../validators/doctorValidators.js";

const router = Router();

router.get("/", authenticate, listDoctors);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDoctorSchema),
  createDoctorHandler
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDoctorSchema),
  updateDoctorHandler
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("ADMIN"),
  validate(doctorStatusSchema),
  updateDoctorStatusHandler
);

export default router;
