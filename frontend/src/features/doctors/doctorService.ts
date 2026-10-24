import { apiClient } from "../../services/apiClient";
import type { Doctor, DoctorInput, NewDoctorInput } from "../../types/doctor";

// Active doctors only: calendar, booking and sharing.
export function getDoctors() {
  return apiClient.get<Doctor[]>("/doctors");
}

// All doctors including inactive ones (admin only).
export function getAllDoctorsIncludingInactive() {
  return apiClient.get<Doctor[]>("/doctors?includeInactive=true");
}

export function createDoctor(input: NewDoctorInput) {
  return apiClient.post<Doctor>("/doctors", input);
}

export function updateDoctor(id: string, input: DoctorInput) {
  return apiClient.put<Doctor>(`/doctors/${id}`, input);
}

export function setDoctorActive(id: string, isActive: boolean) {
  return apiClient.patch<Doctor>(`/doctors/${id}/status`, { isActive });
}
