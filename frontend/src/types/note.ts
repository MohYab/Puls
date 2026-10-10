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
}
