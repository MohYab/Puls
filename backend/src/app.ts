import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler.js";
import { parseCorsOrigins } from "./utils/runtimeConfig.js";
import authRoutes from "./routes/auth.js";
import appointmentTypeRoutes from "./routes/appointmentTypes.js";
import appointmentRoutes from "./routes/appointments.js";
import patientRoutes from "./routes/patients.js";
import doctorRoutes from "./routes/doctors.js";
import noteRoutes from "./routes/notes.js";
import documentationTemplateRoutes from "./routes/documentationTemplates.js";
import accountRoutes from "./routes/account.js";
import clinicRoutes from "./routes/clinic.js";

const LOGIN_WINDOW_MINUTES = 15;
const LOGIN_MAX_FAILED_ATTEMPTS = 10;

interface AppOptions {
  /** Limit failed login attempts. Off in tests, which log in many times. */
  loginRateLimit?: boolean;
}

export function createApp({ loginRateLimit = process.env.NODE_ENV !== "test" }: AppOptions = {}) {
  const app = express();

  // Render (and most hosts) put a proxy in front of the app. Trust exactly one
  // hop, so req.ip is the visitor's address and the login rate limit is per
  // visitor instead of shared by everyone.
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  // Secure HTTP headers, and no "X-Powered-By: Express".
  app.use(helmet());
  // Only the listed origins may read responses in a browser. Without a list
  // (development, phone testing) every origin is allowed, as before.
  const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
  app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : true }));
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
  app.use("/api/account", accountRoutes);
  app.use("/api/appointment-types", appointmentTypeRoutes);
  app.use("/api/appointments", appointmentRoutes);
  app.use("/api/patients", patientRoutes);
  app.use("/api/doctors", doctorRoutes);
  app.use("/api/clinic", clinicRoutes);
  app.use("/api/notes", noteRoutes);
  app.use("/api/documentation-templates", documentationTemplateRoutes);

  app.use(errorHandler);

  return app;
}
