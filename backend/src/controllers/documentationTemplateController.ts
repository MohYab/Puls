import type { Request, Response, NextFunction } from "express";
import { getAllTemplates } from "../services/documentationTemplateService.js";

export async function listTemplates(_req: Request, res: Response, next: NextFunction) {
  try {
    const templates = await getAllTemplates();
    res.json(templates);
  } catch (err) {
    next(err);
  }
}
