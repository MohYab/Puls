import { useQuery } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import { getAppointment, getAppointments } from "./appointmentService";

export function useAppointments(date?: string) {
  return useQuery({
    queryKey: ["appointments", date],
    queryFn: () => getAppointments(date),
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
