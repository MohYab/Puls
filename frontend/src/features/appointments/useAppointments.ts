import { useQuery } from "@tanstack/react-query";
import { getAppointment, getAppointments } from "./appointmentService";
import { retryUnlessClientError } from "../../utils/queryRetry";

export function useAppointments(date?: string) {
  return useQuery({
    queryKey: ["appointments", date],
    queryFn: () => getAppointments(date),
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
