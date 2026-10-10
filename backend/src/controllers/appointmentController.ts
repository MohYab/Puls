import { Request, Response, NextFunction } from "express";
import { getAppointments, getPatientAppointments } from "../services/appointmentService.js";
import { createAppointment } from "../services/appointmentService.js";
import {
  updateAppointment,
  updateAppointmentStatus,
  getAppointmentById,
} from "../services/appointmentService.js";

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

export async function createAppointmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await createAppointment(req.body, req.user!);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function getAppointmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await getAppointmentById(req.params.id as string, req.user!);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await updateAppointment(req.params.id as string, req.body, req.user!);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const appointment = await updateAppointmentStatus(req.params.id as string, req.body, req.user!);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function listPatientAppointments(req: Request, res: Response, next: NextFunction) {
  try {
    const appointments = await getPatientAppointments(req.params.id as string, req.user!);
    res.json(appointments);
  } catch (error) {
    next(error);
  }
}
