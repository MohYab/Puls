import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { AccountInput, PasswordChangeInput } from "../../types/account";
import { changePassword, getAccount, updateAccount } from "./accountService";

const accountKey = ["account"] as const;

export function useAccount() {
  return useQuery({
    queryKey: accountKey,
    queryFn: () => getAccount(),
    retry: retryUnlessClientError,
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AccountInput) => updateAccount(input),
    onSuccess: (account) => {
      queryClient.setQueryData(accountKey, account);
      // The name also appears in doctor lists and as the author of notes.
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: PasswordChangeInput) => changePassword(input),
  });
}
