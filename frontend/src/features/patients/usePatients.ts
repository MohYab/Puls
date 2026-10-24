import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { PatientInput, PatientStatusInput } from "../../types/patient";
import {
  createPatient,
  getPatient,
  getPatientAppointments,
  getPatients,
  setPatientStatus,
  updatePatient,
} from "./patientService";

interface UsePatientsOptions {
  includeInactive?: boolean;
}

export function usePatients(search?: string, { includeInactive = false }: UsePatientsOptions = {}) {
  return useQuery({
    queryKey: ["patients", "list", search ?? "", includeInactive],
    queryFn: () => getPatients(search, includeInactive),
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

// Patient names also appear in the calendar and appointment lists.
function useInvalidateAfterPatientChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };
}

// Creates a patient, or updates one when an id is given.
export function useSavePatient(existingId?: string) {
  const invalidate = useInvalidateAfterPatientChange();
  return useMutation({
    mutationFn: (input: PatientInput) =>
      existingId ? updatePatient(existingId, input) : createPatient(input),
    onSuccess: invalidate,
  });
}

export function useSetPatientStatus(id: string) {
  const invalidate = useInvalidateAfterPatientChange();
  return useMutation({
    mutationFn: (input: PatientStatusInput) => setPatientStatus(id, input),
    onSuccess: invalidate,
  });
}
