import { apiClient } from "../../services/apiClient";
import type { Clinic, ClinicInput } from "../../types/clinic";

export function getClinic() {
  return apiClient.get<Clinic>("/clinic");
}

export function updateClinic(input: ClinicInput) {
  return apiClient.put<Clinic>("/clinic", input);
}