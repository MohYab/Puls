import type { Request, Response } from "express";
import { login } from "../services/authService.js";

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;
  res.json(await login(email, password));
}

export function meHandler(req: Request, res: Response) {
  res.json({ user: req.user });
}
