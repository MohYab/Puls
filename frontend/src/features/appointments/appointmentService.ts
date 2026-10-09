import { apiClient } from "../../services/apiClient";
import type { Appointment } from "../../types/appointment";

export function getAppointments(date?: string) {
  const query = date ? `?date=${date}` : "";
  return apiClient.get<Appointment[]>(`/appointments${query}`);
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  appointmentTypeId: string;
  startTime: string;
}

export function createAppointment(payload: CreateAppointmentPayload) {
  return apiClient.post<Appointment>("/appointments", payload);
}

export interface UpdateAppointmentPayload {
  appointmentTypeId?: string;
  startTime?: string;
}

export function updateAppointment(id: string, payload: UpdateAppointmentPayload) {
  return apiClient.put<Appointment>(`/appointments/${id}`, payload);
}

export function cancelAppointment(id: string) {
  return apiClient.patch<Appointment>(`/appointments/${id}/status`, { status: "CANCELLED" });
}
