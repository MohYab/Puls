import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPatient, getPatientAppointments, getPatients } from "./patientService";
import { ApiError } from "../../services/apiClient";

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ["patients", "list", search ?? ""],
    queryFn: () => getPatients(search),
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", "detail", id],
    queryFn: () => getPatient(id!),
    enabled: !!id,
    // Don't retry client errors like 404; retrying can't fix them.
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status < 500) && failureCount < 2,
  });
}

export function usePatientAppointments(id: string | undefined) {
  return useQuery({
    queryKey: ["appointments", "byPatient", id],
    queryFn: () => getPatientAppointments(id!),
    enabled: !!id,
  });
}
