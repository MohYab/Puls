import { AppError, NotFoundError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";
import type { RequestingUser } from "../types/requestingUser.js";
import type { PatientInput, PatientStatusInput } from "../validators/patientValidators.js";

// Swedish alphabetical order: A–Z, then Å, Ä, Ö. Done in Node so the order
// does not depend on how PostgreSQL was installed (its collation).
const swedish = new Intl.Collator("sv");

function bySwedishName(
  a: { lastName: string; firstName: string },
  b: { lastName: string; firstName: string }
): number {
  return swedish.compare(a.lastName, b.lastName) || swedish.compare(a.firstName, b.firstName);
}

const patientSelect = {
  id: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  phone: true,
  email: true,
  isActive: true,
  deactivatedAt: true,
  deactivationReason: true,
} as const;

const REASON_LABELS = { DECEASED: "deceased", MOVED: "moved", OTHER: "other reason" } as const;

// Date of birth is stored as UTC midnight (see formatBirthDate in the frontend).
function toBirthDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function toData(input: PatientInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: toBirthDate(input.dateOfBirth),
    phone: input.phone || null,
    email: input.email || null,
  };
}

// Without a personal identity number (deliberately not stored), the same name
// and date of birth is the best available signal of a duplicate record.
async function assertNotDuplicate(input: PatientInput, excludeId?: string) {
  const existing = await prisma.patient.findFirst({
    where: {
      firstName: { equals: input.firstName, mode: "insensitive" },
      lastName: { equals: input.lastName, mode: "insensitive" },
      dateOfBirth: toBirthDate(input.dateOfBirth),
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(
      409,
      "PATIENT_EXISTS",
      "A patient with the same name and date of birth already exists"
    );
  }
}

// --- Queries -----------------------------------------------------------------

export async function getAllPatients(search?: string, includeInactive = false) {
  // Every word must match the first or the last name, so "anna andersson" finds Anna Andersson.
  const terms = search?.trim().split(/\s+/).filter(Boolean) ?? [];

  const patients = await prisma.patient.findMany({
    where: {
      ...(!includeInactive && { isActive: true }),
      ...(terms.length > 0 && {
        AND: terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" as const } },
            { lastName: { contains: term, mode: "insensitive" as const } },
          ],
        })),
      }),
    },
    select: patientSelect,
  });

  // No pagination (about 75 patients), so sorting after the query is fine.
  return patients.sort(bySwedishName);
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUnique({ where: { id }, select: patientSelect });
  if (!patient) {
    throw new NotFoundError("Patient not found");
  }
  return patient;
}

// --- Create and edit (doctors and admins) -------------------------------------

export async function createPatient(input: PatientInput) {
  await assertNotDuplicate(input);
  return prisma.patient.create({ data: toData(input), select: patientSelect });
}

export async function updatePatient(id: string, input: PatientInput) {
  await getPatientById(id); // 404 if the patient does not exist
  await assertNotDuplicate(input, id);
  return prisma.patient.update({ where: { id }, data: toData(input), select: patientSelect });
}

// --- Deactivate and reactivate (admin) ----------------------------------------

export async function setPatientActive(
  id: string,
  input: PatientStatusInput,
  requestingUser: RequestingUser
) {
  const patient = await getPatientById(id);

  if (patient.isActive === input.isActive) {
    throw new AppError(
      409,
      "PATIENT_STATUS_UNCHANGED",
      `The patient is already ${patient.isActive ? "active" : "inactive"}`
    );
  }

  if (input.isActive) {
    // Reactivation does not restore cancelled appointments; they are rebooked if needed.
    const updated = await prisma.patient.update({
      where: { id },
      data: { isActive: true, deactivatedAt: null, deactivationReason: null },
      select: patientSelect,
    });
    return { patient: updated, cancelledAppointments: 0, appointmentsKeptWithNote: 0 };
  }

  const reason = `Patient deactivated (${REASON_LABELS[input.reason]})`;
  const now = new Date();

  // Everything in one transaction: the patient is never inactive with
  // appointments left open, and every cancellation is in the history.
  return prisma.$transaction(async (tx) => {
    const future = await tx.appointment.findMany({
      where: {
        patientId: id,
        startTime: { gt: now },
        status: { in: ["SCHEDULED", "CONFIRMED"] },
      },
      select: { id: true, status: true, note: { select: { id: true } } },
    });

    // An appointment with a clinical note is never cancelled (decisions #43);
    // it is left for an admin to review.
    const toCancel = future.filter((appointment) => !appointment.note);

    for (const appointment of toCancel) {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: "CANCELLED" },
      });
      await tx.appointmentStatusChange.create({
        data: {
          appointmentId: appointment.id,
          fromStatus: appointment.status,
          toStatus: "CANCELLED",
          changedByUserId: requestingUser.userId,
          reason,
        },
      });
    }

    const updated = await tx.patient.update({
      where: { id },
      data: { isActive: false, deactivatedAt: now, deactivationReason: input.reason },
      select: patientSelect,
    });

    return {
      patient: updated,
      cancelledAppointments: toCancel.length,
      appointmentsKeptWithNote: future.length - toCancel.length,
    };
  });
}
