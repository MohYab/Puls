import { Request, Response, NextFunction } from "express";
import { getAllPatients } from "../services/patientService.js";

export async function listPatients(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const patients = await getAllPatients(search);
    res.json(patients);
  } catch (err) {
    next(err);
  }
}
