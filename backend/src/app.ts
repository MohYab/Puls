import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import appointmentTypeRoutes from "./routes/appointmentTypes.js";
import appointmentRoutes from "./routes/appointments.js";
import patientRoutes from "./routes/patients.js";
import doctorRoutes from "./routes/doctors.js";
import noteRoutes from "./routes/notes.js";
import documentationTemplateRoutes from "./routes/documentationTemplates.js";

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_FAILED_ATTEMPTS = 10;

interface AppOptions {
  /** Limit failed login attempts. Off in tests, which log in many times. */
  loginRateLimit?: boolean;
}

export function createApp({ loginRateLimit = process.env.NODE_ENV !== "test" }: AppOptions = {}) {
  const app = express();

  // Secure HTTP headers, and no "X-Powered-By: Express".
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  if (loginRateLimit) {
    // Created per app, so every createApp() (and every test) gets its own counter.
    app.use(
      "/api/auth/login",
      rateLimit({
        windowMs: LOGIN_WINDOW_MINUTES * 60 * 1000,
        limit: LOGIN_MAX_FAILED_ATTEMPTS,
        // Only failed attempts count, so switching users during a demo is never blocked.
        skipSuccessfulRequests: true,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: {
          error: {
            code: "TOO_MANY_REQUESTS",
            message: `Too many failed login attempts. Try again in ${LOGIN_WINDOW_MINUTES} minutes.`,
          },
        },
      })
    );
  }

  app.use("/api/auth", authRoutes);
  app.use("/api/appointment-types", appointmentTypeRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/documentation-templates", documentationTemplateRoutes);

  app.use(errorHandler);

  return app;
}
