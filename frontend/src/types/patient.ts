export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

// GET /api/patients/:id returns the patient without createdAt.
export type PatientDetail = Omit<Patient, "createdAt">;
