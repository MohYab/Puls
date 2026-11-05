import type { Request, Response } from "express";
import { getClinicSettings, updateClinicSettings } from "../services/clinicService.js";

export async function getClinicHandler(_req: Request, res: Response) {
  res.json(await getClinicSettings());
}

export async function updateClinicHandler(req: Request, res: Response) {
  res.json(await updateClinicSettings(req.body));
}
