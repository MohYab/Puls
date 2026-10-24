export type PatientDeactivationReason = "DECEASED" | "MOVED" | "OTHER";

// Shape returned by GET /api/patients and GET /api/patients/:id.
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  deactivatedAt: string | null;
  deactivationReason: PatientDeactivationReason | null;
}

// Kept so existing imports keep working; list and detail now have the same shape.
export type PatientDetail = Patient;

// Body for POST /api/patients and PUT /api/patients/:id.
// Empty phone or email means "not given".
export interface PatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  email: string;
}

export type PatientStatusInput =
  { isActive: false; reason: PatientDeactivationReason } | { isActive: true };

export interface PatientStatusResult {
  patient: Patient;
  cancelledAppointments: number;
  appointmentsKeptWithNote: number;
}
