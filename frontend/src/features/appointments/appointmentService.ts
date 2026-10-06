import { apiClient } from "../../services/apiClient";
import type { Appointment } from "../../types/appointment";

export function getAppointments(date?: string) {
  const query = date ? `?date=${date}` : "";
  return apiClient.get<Appointment[]>(`/appointments${query}`);
}
