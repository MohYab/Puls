import type { Request, Response } from "express";
import {
  createDoctor,
  getAllDoctors,
  setDoctorActive,
  updateDoctor,
} from "../services/doctorService.js";

export async function listDoctors(req: Request, res: Response) {
  // Inactive doctors are only listed for admins (the doctors page).
  const includeInactive = req.user?.role === "ADMIN" && req.query.includeInactive === "true";
  res.json(await getAllDoctors({ includeInactive }));
}

export async function createDoctorHandler(req: Request, res: Response) {
  res.status(201).json(await createDoctor(req.body));
}

export async function updateDoctorHandler(req: Request, res: Response) {
  res.json(await updateDoctor(req.params.id as string, req.body));
}

export async function updateDoctorStatusHandler(req: Request, res: Response) {
  res.json(await setDoctorActive(req.params.id as string, req.body.isActive));
}
