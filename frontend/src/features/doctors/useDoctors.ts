import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { Doctor, DoctorInput, NewDoctorInput } from "../../types/doctor";
import {
  createDoctor,
  getAllDoctorsIncludingInactive,
  getDoctors,
  setDoctorActive,
  updateDoctor,
} from "./doctorService";

export const doctorKeys = {
  all: ["doctors"] as const,
  active: ["doctors", "active"] as const,
  admin: ["doctors", "admin"] as const,
};

// Defined outside the hooks so TanStack Query can reuse the sorted result between renders.
function sortByName(doctors: Doctor[]) {
  return [...doctors].sort((a, b) => a.user.name.localeCompare(b.user.name, "sv"));
}

// Active doctors only (calendar, booking, sharing).
export function useDoctors(enabled = true) {
  return useQuery({
    queryKey: doctorKeys.active,
    queryFn: () => getDoctors(),
    select: sortByName,
    enabled,
    retry: retryUnlessClientError,
  });
}

export function useAdminDoctors() {
  return useQuery({
    queryKey: doctorKeys.admin,
    queryFn: () => getAllDoctorsIncludingInactive(),
    select: sortByName,
    retry: retryUnlessClientError,
  });
}

// Doctor names also appear in the calendar, appointment history and notes.
function useInvalidateAfterDoctorChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: doctorKeys.all });
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };
}

export function useCreateDoctor() {
  const invalidate = useInvalidateAfterDoctorChange();
  return useMutation({
    mutationFn: (input: NewDoctorInput) => createDoctor(input),
    onSuccess: invalidate,
  });
}

export function useUpdateDoctor(id: string) {
  const invalidate = useInvalidateAfterDoctorChange();
  return useMutation({
    mutationFn: (input: DoctorInput) => updateDoctor(id, input),
    onSuccess: invalidate,
  });
}

export function useSetDoctorActive() {
  const invalidate = useInvalidateAfterDoctorChange();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setDoctorActive(id, isActive),
    onSuccess: invalidate,
  });
}
