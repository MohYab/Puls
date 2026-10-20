import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { Role } from "../types/requestingUser.js";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have access to this resource"));
    }

    next();
  };
}
