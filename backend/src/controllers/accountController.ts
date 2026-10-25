import type { Request, Response } from "express";
import { changePassword, getAccount, updateAccount } from "../services/accountService.js";

export async function getAccountHandler(req: Request, res: Response) {
  res.json(await getAccount(req.user!.userId));
}

export async function updateAccountHandler(req: Request, res: Response) {
  res.json(await updateAccount(req.user!, req.body));
}

export async function changePasswordHandler(req: Request, res: Response) {
  await changePassword(req.user!.userId, req.body);
  res.status(204).end();
}
