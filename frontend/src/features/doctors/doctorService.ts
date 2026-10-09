import { apiClient } from "../../services/apiClient";
import type { Doctor } from "../../types/doctor";

export function getDoctors() {
  return apiClient.get<Doctor[]>("/doctors");
}
