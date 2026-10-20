import type { Request, Response } from "express";
import { getAllTemplates } from "../services/documentationTemplateService.js";

export async function listTemplates(_req: Request, res: Response) {
  res.json(await getAllTemplates());
}
