import { apiClient } from "../../services/apiClient";
import type { LoginResponse } from "../../types/auth";

export function loginRequest(email: string, password: string) {
  return apiClient.post<LoginResponse>("/auth/login", { email, password });
}
