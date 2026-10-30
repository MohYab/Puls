import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import { getAppointment, getAppointments, getAppointmentsToDocument, updateAppointmentStatus } from "./appointmentService";
import type { AppointmentStatus } from "../../types/appointment";

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
    queryFn: () => getAppointments({ date, doctorId }),
    enabled,
    retry: retryUnlessClientError,
  });
}

/** The calendar: a day (from = to) or a week. */
export function useAppointmentsInRange(
  from: string,
  to: string,
  { doctorId, enabled = true }: UseAppointmentsOptions = {}
) {
  return useQuery({
    queryKey: ["appointments", "list", { from, to, doctorId }],
    queryFn: () => getAppointments({ from, to, doctorId }),
    enabled,
    retry: retryUnlessClientError,
  });
}

/** Doctors only. The key starts with "appointments", so status changes refresh it too. */
export function useAppointmentsToDocument() {
  return useQuery({
    queryKey: ["appointments", "to-document"],
    queryFn: () => getAppointmentsToDocument(),
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

export function useUpdateAppointmentStatus(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ status, reason }: { status: AppointmentStatus; reason?: string }) =>
      updateAppointmentStatus(appointmentId, status, reason),
    // Calendar, dashboard and the detail query all start with "appointments".
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}
