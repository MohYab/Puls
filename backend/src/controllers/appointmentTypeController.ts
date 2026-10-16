import { Request, Response, NextFunction } from "express";
import {
  createAppointmentType,
  getAllAppointmentTypes,
  setAppointmentTypeActive,
  updateAppointmentType,
} from "../services/appointmentTypeService.js";

export async function listAppointmentTypes(req: Request, res: Response, next: NextFunction) {
  try {
    // Only admins can see inactive types; for doctors the flag is ignored.
    const includeInactive = req.user?.role === "ADMIN" && req.query.includeInactive === "true";
    const types = await getAllAppointmentTypes({ includeInactive });
    res.json(types);
  } catch (err) {
    next(err);
  }
}

export async function createAppointmentTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const type = await createAppointmentType(req.body);
    res.status(201).json(type);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentTypeHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const type = await updateAppointmentType(req.params.id as string, req.body);
    res.json(type);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentTypeStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const type = await setAppointmentTypeActive(req.params.id as string, req.body.isActive);
    res.json(type);
  } catch (err) {
    next(err);
  }
}
