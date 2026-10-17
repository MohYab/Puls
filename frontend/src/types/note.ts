export interface NoteContent {
  reasonForVisit: string;
  observation: string;
  assessment: string;
  plan: string;
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
