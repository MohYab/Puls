import "express";
import type { RequestingUser } from "./requestingUser.js";

declare global {
  namespace Express {
    interface Request {
      user?: RequestingUser;
    }
  }
}
