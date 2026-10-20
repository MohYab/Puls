import type { Request, Response } from "express";
import {
  createAppointmentType,
  getAllAppointmentTypes,
  setAppointmentTypeActive,
  updateAppointmentType,
} from "../services/appointmentTypeService.js";

export async function listAppointmentTypes(req: Request, res: Response) {
  // Only admins can see inactive types; for doctors the flag is ignored.
  const includeInactive = req.user?.role === "ADMIN" && req.query.includeInactive === "true";
  res.json(await getAllAppointmentTypes({ includeInactive }));
}

export async function createAppointmentTypeHandler(req: Request, res: Response) {
  res.status(201).json(await createAppointmentType(req.body));
}

export async function updateAppointmentTypeHandler(req: Request, res: Response) {
  res.json(await updateAppointmentType(req.params.id as string, req.body));
}

export async function updateAppointmentTypeStatusHandler(req: Request, res: Response) {
  res.json(await setAppointmentTypeActive(req.params.id as string, req.body.isActive));
}
