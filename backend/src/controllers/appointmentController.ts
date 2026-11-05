import type { Request, Response } from "express";
import {
  createAppointment,
  getAppointmentById,
  getAppointments,
  getAppointmentsToDocument,
  getPatientAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../services/appointmentService.js";
import { listAppointmentsQuerySchema } from "../validators/appointmentValidators.js";
import { ValidationError } from "../utils/errors.js";

// Express 5 forwards rejected promises from async handlers to errorHandler,
// so no try/catch is needed (decisions #46).

export async function listAppointments(req: Request, res: Response) {
  // validate() only checks the body, so the query string is parsed here.
  const result = listAppointmentsQuerySchema.safeParse(req.query);
  if (!result.success) {
    throw new ValidationError(result.error.issues[0].message);
  }
  res.json(await getAppointments({ requestingUser: req.user!, ...result.data }));
}

export async function listAppointmentsToDocument(req: Request, res: Response) {
  res.json(await getAppointmentsToDocument(req.user!));
}

export async function createAppointmentHandler(req: Request, res: Response) {
  res.status(201).json(await createAppointment(req.body, req.user!));
}

export async function getAppointmentHandler(req: Request, res: Response) {
  res.json(await getAppointmentById(req.params.id as string, req.user!));
}

export async function updateAppointmentHandler(req: Request, res: Response) {
  res.json(await updateAppointment(req.params.id as string, req.body, req.user!));
}

export async function updateAppointmentStatusHandler(req: Request, res: Response) {
  res.json(await updateAppointmentStatus(req.params.id as string, req.body, req.user!));
}

export async function listPatientAppointments(req: Request, res: Response) {
  res.json(await getPatientAppointments(req.params.id as string, req.user!));
}
