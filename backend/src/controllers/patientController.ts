import type { Request, Response } from "express";
import { getAllPatients, getPatientById } from "../services/patientService.js";

export async function listPatients(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  res.json(await getAllPatients(search));
}

export async function getPatient(req: Request, res: Response) {
  res.json(await getPatientById(req.params.id as string));
}
