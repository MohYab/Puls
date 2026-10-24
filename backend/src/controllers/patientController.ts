import type { Request, Response } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  setPatientActive,
  updatePatient,
} from "../services/patientService.js";

export async function listPatients(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  // Doctors and admins may include inactive patients, e.g. to read a deceased patient's records.
  const includeInactive = req.query.includeInactive === "true";
  res.json(await getAllPatients(search, includeInactive));
}

export async function getPatient(req: Request, res: Response) {
  res.json(await getPatientById(req.params.id as string));
}

export async function createPatientHandler(req: Request, res: Response) {
  res.status(201).json(await createPatient(req.body));
}

export async function updatePatientHandler(req: Request, res: Response) {
  res.json(await updatePatient(req.params.id as string, req.body));
}

export async function updatePatientStatusHandler(req: Request, res: Response) {
  res.json(await setPatientActive(req.params.id as string, req.body, req.user!));
}
