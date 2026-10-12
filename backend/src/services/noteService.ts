import { prisma } from "../utils/prisma.js";
import { AppError, NotFoundError, ValidationError } from "../utils/errors.js";
import type { CreateNoteInput, NoteContentInput } from "../validators/noteValidators.js";
import { getPatientById } from "./patientService.js";

interface RequestingUser {
  role: "DOCTOR" | "ADMIN";
  doctorId: string | null;
}

// Appointment info is included so the patient's note list can show date and type.
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
} as const;

// --- Permissions -----------------------------------------------------------
// canReadNote / readableNotesWhere are the ONE place that decides who may read
// notes. Today: only the doctor who wrote it. Sharing between doctors (week 12)
// changes these two functions, not the endpoints.

function canReadNote(note: { doctorId: string }, user: RequestingUser): boolean {
  return user.role === "DOCTOR" && user.doctorId === note.doctorId;
}

function readableNotesWhere(doctorId: string) {
  return { doctorId };
}

// Admins have no access to clinical notes at all.
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

// --- Use cases -------------------------------------------------------------

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
  if (!canReadNote(note, user)) {
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
