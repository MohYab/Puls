import { apiClient } from "../../services/apiClient";
import type { Patient, PatientDetail } from "../../types/patient";
import type { PatientAppointment } from "../../types/appointment";

export function getPatients(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient.get<Patient[]>(`/patients${query}`);
}

export function getPatient(id: string) {
  return apiClient.get<PatientDetail>(`/patients/${id}`);
}

export function getPatientAppointments(id: string) {
  return apiClient.get<PatientAppointment[]>(`/patients/${id}/appointments`);
}
