import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError, ValidationError } from "../utils/errors.js";
import type {
  CreateNoteInput,
  NoteContentInput,
  ShareNoteInput,
} from "../validators/noteValidators.js";
import { getPatientById } from "./patientService.js";

interface RequestingUser {
  userId: string;
  role: "DOCTOR" | "ADMIN";
  doctorId: string | null;
}

// Appointment info is included so the patient's note list can show date and type.
// The author's name lets a recipient see who shared the note.
const noteSelect = {
  id: true,
  appointmentId: true,
  patientId: true,
  doctorId: true,
  templateId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  appointment: {
    select: { startTime: true, appointmentType: { select: { name: true } } },
  },
  doctor: { select: { user: { select: { name: true } } } },
} as const;

const shareSelect = {
  id: true,
  createdAt: true,
  consentConfirmedAt: true,
  doctor: { select: { id: true, user: { select: { name: true } } } },
} as const;

// --- Permissions -----------------------------------------------------------
// These functions are the ONE place that decides who may read and share notes.
//
// Read:   the author, or a doctor the note has an active share with.
// Write:  only the author (write access is never shared).
// Share:  only the author. A future patient login would extend canManageShares.
// Admins have no access to clinical notes at all.

function readableNotesWhere(doctorId: string) {
  return {
    OR: [{ doctorId }, { shares: { some: { doctorId, revokedAt: null } } }],
  };
}

// Derived from readableNotesWhere so the read rule exists in one place only.
async function canReadNote(noteId: string, user: RequestingUser): Promise<boolean> {
  if (user.role !== "DOCTOR" || !user.doctorId) return false;
  const count = await prisma.clinicalNote.count({
    where: { id: noteId, ...readableNotesWhere(user.doctorId) },
  });
  return count > 0;
}

function canManageShares(note: { doctorId: string }, user: RequestingUser): boolean {
  return user.role === "DOCTOR" && user.doctorId === note.doctorId;
}

function requireDoctorId(user: RequestingUser): string {
  if (user.role !== "DOCTOR" || !user.doctorId) {
    throw new AppError(403, "FORBIDDEN", "Only doctors can access clinical notes");
  }
  return user.doctorId;
}

async function findOwnAppointment(appointmentId: string, doctorId: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }
  if (appointment.doctorId !== doctorId) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this appointment");
  }
  return appointment;
}

async function findNoteForSharing(noteId: string, user: RequestingUser) {
  requireDoctorId(user);
  const note = await prisma.clinicalNote.findUnique({
    where: { id: noteId },
    select: { id: true, doctorId: true },
  });
  if (!note) {
    throw new NotFoundError("Note not found");
  }
  if (!canManageShares(note, user)) {
    throw new AppError(403, "FORBIDDEN", "Only the author can manage sharing for this note");
  }
  return note;
}

// --- Use cases: notes --------------------------------------------------------

// The documentation page is for the doctor who owns the appointment; recipients
// of a shared note read it on the patient page instead.
export async function getNoteByAppointment(appointmentId: string, user: RequestingUser) {
  const doctorId = requireDoctorId(user);
  await findOwnAppointment(appointmentId, doctorId);

  const note = await prisma.clinicalNote.findUnique({
    where: { appointmentId },
    select: noteSelect,
  });
  if (!note) {
    throw new NotFoundError("No note has been written for this appointment");
  }
  if (!(await canReadNote(note.id, user))) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this note");
  }
  return note;
}

export async function createNote(
  appointmentId: string,
  input: CreateNoteInput,
  user: RequestingUser
) {
  const doctorId = requireDoctorId(user);
  const appointment = await findOwnAppointment(appointmentId, doctorId);

  if (appointment.status === "CANCELLED") {
    throw new AppError(409, "APPOINTMENT_CANCELLED", "Cannot document a cancelled appointment");
  }

  const existing = await prisma.clinicalNote.findUnique({ where: { appointmentId } });
  if (existing) {
    throw new AppError(
      409,
      "NOTE_EXISTS",
      "This appointment already has a note. Edit the existing note instead"
    );
  }

  const { templateId, ...content } = input;
  if (templateId) {
    const template = await prisma.documentationTemplate.findUnique({ where: { id: templateId } });
    if (!template) {
      throw new ValidationError("Documentation template not found");
    }
  }

  return prisma.clinicalNote.create({
    data: {
      appointmentId,
      patientId: appointment.patientId,
      doctorId,
      templateId: templateId ?? null,
      content,
    },
    select: noteSelect,
  });
}

export async function updateNote(noteId: string, input: NoteContentInput, user: RequestingUser) {
  const doctorId = requireDoctorId(user);

  const existing = await prisma.clinicalNote.findUnique({ where: { id: noteId } });
  if (!existing) {
    throw new NotFoundError("Note not found");
  }
  // Write access is never shared: only the author may edit.
  if (existing.doctorId !== doctorId) {
    throw new AppError(403, "FORBIDDEN", "You can only edit notes you have written");
  }

  return prisma.clinicalNote.update({
    where: { id: noteId },
    data: { content: input },
    select: noteSelect,
  });
}

export async function listPatientNotes(patientId: string, user: RequestingUser) {
  const doctorId = requireDoctorId(user);
  await getPatientById(patientId); // 404 if the patient does not exist

  return prisma.clinicalNote.findMany({
    where: { patientId, ...readableNotesWhere(doctorId) },
    orderBy: { appointment: { startTime: "desc" } },
    select: noteSelect,
  });
}

// --- Use cases: sharing ------------------------------------------------------

export async function listNoteShares(noteId: string, user: RequestingUser) {
  await findNoteForSharing(noteId, user);

  return prisma.noteShare.findMany({
    where: { noteId, revokedAt: null },
    orderBy: { createdAt: "asc" },
    select: shareSelect,
  });
}

export async function shareNote(noteId: string, input: ShareNoteInput, user: RequestingUser) {
  const note = await findNoteForSharing(noteId, user);

  if (input.doctorId === note.doctorId) {
    throw new ValidationError("You cannot share a note with yourself");
  }

  const recipient = await prisma.doctor.findUnique({ where: { id: input.doctorId } });
  if (!recipient) {
    throw new ValidationError("Doctor not found");
  }

  const activeShare = await prisma.noteShare.findFirst({
    where: { noteId, doctorId: input.doctorId, revokedAt: null },
  });
  if (activeShare) {
    throw new AppError(409, "NOTE_ALREADY_SHARED", "The note is already shared with this doctor");
  }

  return prisma.noteShare.create({
    data: {
      noteId,
      doctorId: input.doctorId,
      createdByUserId: user.userId,
      consentConfirmedAt: new Date(),
    },
    select: shareSelect,
  });
}

export async function revokeNoteShare(noteId: string, doctorId: string, user: RequestingUser) {
  await findNoteForSharing(noteId, user);

  const activeShare = await prisma.noteShare.findFirst({
    where: { noteId, doctorId, revokedAt: null },
  });
  if (!activeShare) {
    throw new NotFoundError("The note is not shared with this doctor");
  }

  // Kept as history: the row is marked as revoked, not deleted.
  await prisma.noteShare.update({
    where: { id: activeShare.id },
    data: { revokedAt: new Date() },
  });
}
