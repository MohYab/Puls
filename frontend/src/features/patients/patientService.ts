import { apiClient } from "../../services/apiClient";
import type { Patient } from "../../types/patient";

export function getPatients(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return apiClient.get<Patient[]>(`/patients${query}`);
}
