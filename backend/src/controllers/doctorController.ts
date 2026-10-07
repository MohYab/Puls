import { Request, Response, NextFunction } from "express";
import { getAllDoctors } from "../services/doctorService.js";

export async function listDoctors(_req: Request, res: Response, next: NextFunction) {
  try {
    const doctors = await getAllDoctors();
    res.json(doctors);
  } catch (err) {
    next(err);
  }
}
