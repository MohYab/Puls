import { Request, Response, NextFunction } from "express";
import { getAppointments } from "../services/appointmentService.js";

export async function listAppointments(req: Request, res: Response, next: NextFunction) {
  try {
    const date = typeof req.query.date === "string" ? req.query.date : undefined;
    const appointments = await getAppointments({
      requestingUser: req.user!,
      date,
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}
