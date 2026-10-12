import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import { getPatient, getPatientAppointments, getPatients } from "./patientService";

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ["patients", "list", search ?? ""],
    queryFn: () => getPatients(search),
    placeholderData: keepPreviousData,
    retry: retryUnlessClientError,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", "detail", id],
    queryFn: () => getPatient(id!),
    enabled: !!id,
    retry: retryUnlessClientError,
  });
}

export function usePatientAppointments(id: string | undefined) {
  return useQuery({
    queryKey: ["appointments", "byPatient", id],
    queryFn: () => getPatientAppointments(id!),
    enabled: !!id,
    retry: retryUnlessClientError,
  });
}
