import { Router } from "express";
import { loginHandler, meHandler } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema } from "../validators/authValidators.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

router.post("/login", validate(loginSchema), loginHandler);
router.get("/me", authenticate, meHandler);

export default router;
