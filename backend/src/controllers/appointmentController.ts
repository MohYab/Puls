import type { Request, Response } from "express";
import {
  createAppointment,
  getAppointmentById,
  getAppointments,
  getPatientAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../services/appointmentService.js";

// Express 5 forwards rejected promises from async handlers to errorHandler,
// so no try/catch is needed (decisions #46).

export async function listAppointments(req: Request, res: Response) {
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const doctorId = typeof req.query.doctorId === "string" ? req.query.doctorId : undefined;
  res.json(await getAppointments({ requestingUser: req.user!, date, doctorId }));
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
