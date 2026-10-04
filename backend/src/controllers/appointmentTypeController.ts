import { Request, Response, NextFunction } from "express";
import { getAllAppointmentTypes } from "../services/appointmentTypeService.js";

export async function listAppointmentTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await getAllAppointmentTypes();
    res.json(types);
  } catch (err) {
    next(err);
  }
}
