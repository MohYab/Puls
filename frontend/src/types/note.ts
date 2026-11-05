export type VitalKey =
  | "systolic"
  | "diastolic"
  | "heartRate"
  | "temperature"
  | "oxygenSaturation"
  | "respiratoryRate"
  | "weight"
  | "height";

/** Measured values only; a missing key was not measured. */
export type Vitals = Partial<Record<VitalKey, number>>;

/** The four text fields of a note; vital signs are a separate field. */
export type NoteTextField = "reasonForVisit" | "observation" | "assessment" | "plan";

export interface NoteContent {
  reasonForVisit: string;
  observation: string;
  assessment: string;
  plan: string;
  vitals?: Vitals;
}

export interface ClinicalNote {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  templateId: string | null;
  content: NoteContent;
  createdAt: string;
  updatedAt: string;
  appointment: {
    startTime: string;
    appointmentType: { name: string };
  };

  // The author, so a doctor reading a shared note can see who wrote it.
  doctor: { user: { name: string } };
}

export interface NoteShare {
  id: string;
  createdAt: string;
  consentConfirmedAt: string;
  doctor: { id: string; user: { name: string } };
}
