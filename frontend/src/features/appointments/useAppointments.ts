import { useQuery } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import { getAppointment, getAppointments } from "./appointmentService";

interface UseAppointmentsOptions {
  doctorId?: string;
  enabled?: boolean;
}

export function useAppointments(
  date?: string,
  { doctorId, enabled = true }: UseAppointmentsOptions = {}
) {
  return useQuery({
    // doctorId must be part of the key, otherwise all doctors would share one cache entry.
    queryKey: ["appointments", "list", { date, doctorId }],
    queryFn: () => getAppointments(date, doctorId),
    enabled,
    retry: retryUnlessClientError,
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ["appointments", "detail", id],
    queryFn: () => getAppointment(id!),
    enabled: !!id,
    retry: retryUnlessClientError,
  });
}
