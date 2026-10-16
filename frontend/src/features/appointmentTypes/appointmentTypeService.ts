import { apiClient } from "../../services/apiClient";
import type { AppointmentType, AppointmentTypeInput } from "../../types/appointmentType";

// Active types only. Used by the booking form. Keep it without parameters:
// it may be passed directly as a queryFn, which receives a context object.
export function getAppointmentTypes() {
  return apiClient.get<AppointmentType[]>("/appointment-types");
}

// All types including inactive ones (admin only; the backend ignores the flag for doctors).
export function getAllAppointmentTypesIncludingInactive() {
  return apiClient.get<AppointmentType[]>("/appointment-types?includeInactive=true");
}

export function createAppointmentType(input: AppointmentTypeInput) {
  return apiClient.post<AppointmentType>("/appointment-types", input);
}

export function updateAppointmentType(id: string, input: AppointmentTypeInput) {
  return apiClient.put<AppointmentType>(`/appointment-types/${id}`, input);
}

export function setAppointmentTypeActive(id: string, isActive: boolean) {
  return apiClient.patch<AppointmentType>(`/appointment-types/${id}/status`, { isActive });
}
