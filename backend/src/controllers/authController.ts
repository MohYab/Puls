import { Request, Response, NextFunction } from "express";
import { login } from "../services/authService.js";

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export function meHandler(req: Request, res: Response) {
  res.json({ user: req.user });
}
