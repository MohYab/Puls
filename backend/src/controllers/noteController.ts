import type { Request, Response, NextFunction } from "express";
import {
  createNote,
  getNoteByAppointment,
  listPatientNotes,
  updateNote,
} from "../services/noteService.js";

export async function getAppointmentNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await getNoteByAppointment(req.params.id as string, req.user!);
    res.json(note);
  } catch (err) {
    next(err);
  }
}

export async function createNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await createNote(req.params.id as string, req.body, req.user!);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
}

export async function updateNoteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const note = await updateNote(req.params.id as string, req.body, req.user!);
    res.json(note);
  } catch (err) {
    next(err);
  }
}

export async function listPatientNotesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notes = await listPatientNotes(req.params.id as string, req.user!);
    res.json(notes);
  } catch (err) {
    next(err);
  }
}
