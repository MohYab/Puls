import { Router } from "express";
import { updateNoteHandler } from "../controllers/noteController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { noteContentSchema } from "../validators/noteValidators.js";

const router = Router();

router.put(
  "/:id",
  authenticate,
  authorize("DOCTOR"),
  validate(noteContentSchema),
  updateNoteHandler
);

export default router;
