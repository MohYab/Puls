import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET!;

interface JwtPayload {
  userId: string;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "No token provided"));
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(authHeader.slice("Bearer ".length), JWT_SECRET) as JwtPayload;
  } catch {
    return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }

  // Read role and status from the database on every request, so a deactivated
  // user (or a changed role) takes effect immediately, not when the token expires.
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true, isActive: true, doctor: { select: { id: true } } },
  });
  if (!user || !user.isActive) {
    return next(new AppError(401, "UNAUTHORIZED", "Your account is no longer active"));
  }

  req.user = { userId: payload.userId, role: user.role, doctorId: user.doctor?.id ?? null };
  next();
}
