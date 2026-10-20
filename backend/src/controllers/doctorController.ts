import type { Request, Response } from "express";
import { getAllDoctors } from "../services/doctorService.js";

export async function listDoctors(_req: Request, res: Response) {
  res.json(await getAllDoctors());
}
