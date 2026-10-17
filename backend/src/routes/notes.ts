import { Router } from "express";
import {
  listNoteSharesHandler,
  revokeNoteShareHandler,
  shareNoteHandler,
  updateNoteHandler,
} from "../controllers/noteController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { noteContentSchema, shareNoteSchema } from "../validators/noteValidators.js";

const router = Router();

router.put(
  "/:id",
  authenticate,
  authorize("DOCTOR"),
  validate(noteContentSchema),
  updateNoteHandler
);

router.get("/:id/shares", authenticate, authorize("DOCTOR"), listNoteSharesHandler);

router.post(
  "/:id/shares",
  authenticate,
  authorize("DOCTOR"),
  validate(shareNoteSchema),
  shareNoteHandler
);

// Revokes the active share. The row is kept as history (revokedAt is set).
router.delete("/:id/shares/:doctorId", authenticate, authorize("DOCTOR"), revokeNoteShareHandler);

export default router;
