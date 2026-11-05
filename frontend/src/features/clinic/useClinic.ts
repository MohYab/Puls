import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { ClinicInput } from "../../types/clinic";
import { getClinic, updateClinic } from "./clinicService";

const clinicKey = ["clinic"] as const;

// The clinic rarely changes, so it is not refetched on every page.
const FIVE_MINUTES = 5 * 60 * 1000;

export function useClinic() {
  return useQuery({
    queryKey: clinicKey,
    queryFn: () => getClinic(),
    staleTime: FIVE_MINUTES,
    retry: retryUnlessClientError,
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClinicInput) => updateClinic(input),
    onSuccess: (clinic) => queryClient.setQueryData(clinicKey, clinic),
  });
}
