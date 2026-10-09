import { apiClient } from "../../services/apiClient";
import type { AppointmentType } from "../../types/appointmentType";

export function getAppointmentTypes() {
  return apiClient.get<AppointmentType[]>("/appointment-types");
}
