import { Router } from "express";
import { listAppointmentTypes } from "../controllers/appointmentTypeController.js";
import { authenticate } from "../middleware/authenticate.js";
//import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/", authenticate, listAppointmentTypes);
// Framtida skriv-endpoints (POST/PUT) läggs till senare i projektet, t.ex.:
// router.post("/", authenticate, authorize("ADMIN"), createAppointmentType);

export default router;
