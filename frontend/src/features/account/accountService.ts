import { apiClient } from "../../services/apiClient";
import type { Account, AccountInput, PasswordChangeInput } from "../../types/account";

export function getAccount() {
  return apiClient.get<Account>("/account");
}

export function updateAccount(input: AccountInput) {
  return apiClient.put<Account>("/account", input);
}

export function changePassword(input: PasswordChangeInput) {
  return apiClient.put<void>("/account/password", input);
}
