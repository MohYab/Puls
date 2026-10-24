import { apiClient } from "../../services/apiClient";
import type { PatientAppointment } from "../../types/appointment";
import type {
  Patient,
  PatientInput,
  PatientStatusInput,
  PatientStatusResult,
} from "../../types/patient";

export function getPatients(search?: string, includeInactive = false) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (includeInactive) params.set("includeInactive", "true");
  const query = params.toString();
  return apiClient.get<Patient[]>(`/patients${query ? `?${query}` : ""}`);
}

export function getPatient(id: string) {
  return apiClient.get<Patient>(`/patients/${id}`);
}

export function getPatientAppointments(id: string) {
  return apiClient.get<PatientAppointment[]>(`/patients/${id}/appointments`);
}

export function createPatient(input: PatientInput) {
  return apiClient.post<Patient>("/patients", input);
}

export function updatePatient(id: string, input: PatientInput) {
  return apiClient.put<Patient>(`/patients/${id}`, input);
}

// Admin only. Deactivation cancels future appointments (see the result counts).
export function setPatientStatus(id: string, input: PatientStatusInput) {
  return apiClient.patch<PatientStatusResult>(`/patients/${id}/status`, input);
}
