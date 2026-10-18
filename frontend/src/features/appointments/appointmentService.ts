import { apiClient } from "../../services/apiClient";
import type { Appointment, AppointmentStatus } from "../../types/appointment";

export function getAppointments(date?: string, doctorId?: string) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (doctorId) params.set("doctorId", doctorId);
  const query = params.toString();
  return apiClient.get<Appointment[]>(`/appointments${query ? `?${query}` : ""}`);
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

// reason is required by the API when an admin corrects a final status.
export function updateAppointmentStatus(id: string, status: AppointmentStatus, reason?: string) {
  return apiClient.patch<Appointment>(`/appointments/${id}/status`, { status, reason });
}

export function getAppointment(id: string) {
  return apiClient.get<Appointment>(`/appointments/${id}`);
}
