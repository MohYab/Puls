import type { PatientDeactivationReason } from "../../types/patient";

export const PATIENT_DEACTIVATION_REASONS: readonly PatientDeactivationReason[] = [
  "DECEASED",
  "MOVED",
  "OTHER",
];

export const PATIENT_DEACTIVATION_LABELS: Record<PatientDeactivationReason, string> = {
  DECEASED: "Deceased",
  MOVED: "Moved",
  OTHER: "Other",
};
