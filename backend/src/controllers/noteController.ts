import type { Request, Response } from "express";
import {
  createNote,
  getNoteByAppointment,
  listNoteShares,
  listPatientNotes,
  revokeNoteShare,
  shareNote,
  updateNote,
} from "../services/noteService.js";

export async function getAppointmentNoteHandler(req: Request, res: Response) {
  res.json(await getNoteByAppointment(req.params.id as string, req.user!));
}

export async function createNoteHandler(req: Request, res: Response) {
  res.status(201).json(await createNote(req.params.id as string, req.body, req.user!));
}

export async function updateNoteHandler(req: Request, res: Response) {
  res.json(await updateNote(req.params.id as string, req.body, req.user!));
}

export async function listPatientNotesHandler(req: Request, res: Response) {
  res.json(await listPatientNotes(req.params.id as string, req.user!));
}

export async function listNoteSharesHandler(req: Request, res: Response) {
  res.json(await listNoteShares(req.params.id as string, req.user!));
}

export async function shareNoteHandler(req: Request, res: Response) {
  res.status(201).json(await shareNote(req.params.id as string, req.body, req.user!));
}

export async function revokeNoteShareHandler(req: Request, res: Response) {
  await revokeNoteShare(req.params.id as string, req.params.doctorId as string, req.user!);
  res.status(204).end();
}
