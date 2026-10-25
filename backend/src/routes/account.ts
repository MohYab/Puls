import { Router } from "express";
import {
  changePasswordHandler,
  getAccountHandler,
  updateAccountHandler,
} from "../controllers/accountController.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { accountSchema, passwordChangeSchema } from "../validators/accountValidators.js";

// The logged-in user's own account. Every route acts on req.user only, so
// there is no id in the URL that could point at someone else.
const router = Router();

router.get("/", authenticate, getAccountHandler);
router.put("/", authenticate, validate(accountSchema), updateAccountHandler);
router.put("/password", authenticate, validate(passwordChangeSchema), changePasswordHandler);

export default router;
