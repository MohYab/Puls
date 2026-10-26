import { Router } from "express";
import { getClinicHandler, updateClinicHandler } from "../controllers/clinicController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { clinicSchema } from "../validators/clinicValidators.js";

const router = Router();

// Public on purpose: the login page shows the clinic name before anyone is
// logged in, and a clinic's name and address are public information.
router.get("/", getClinicHandler);

router.put("/", authenticate, authorize("ADMIN"), validate(clinicSchema), updateClinicHandler);

export default router;