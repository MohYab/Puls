import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appointmentTypeRoutes from "./routes/appointmentTypes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/appointment-types", appointmentTypeRoutes);

app.use("/api/appointment-types", appointmentTypeRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
