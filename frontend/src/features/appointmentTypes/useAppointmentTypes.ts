import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { AppointmentTypeInput } from "../../types/appointmentType";
import {
  createAppointmentType,
  getAllAppointmentTypesIncludingInactive,
  getAppointmentTypes,
  setAppointmentTypeActive,
  updateAppointmentType,
} from "./appointmentTypeService";

export const appointmentTypeKeys = {
  all: ["appointmentTypes"] as const,
  active: ["appointmentTypes", "active"] as const,
  admin: ["appointmentTypes", "admin"] as const,
};

// Active types only, for booking and editing appointments.
export function useAppointmentTypes() {
  return useQuery({
    queryKey: appointmentTypeKeys.active,
    queryFn: () => getAppointmentTypes(),
    retry: retryUnlessClientError,
  });
}

export function useAdminAppointmentTypes() {
  return useQuery({
    queryKey: appointmentTypeKeys.admin,
    queryFn: () => getAllAppointmentTypesIncludingInactive(),
    retry: retryUnlessClientError,
  });
}

function useInvalidateAfterTypeChange() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: appointmentTypeKeys.all });
    // Calendar and history show type names, so a rename must show there too.
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  };
}

// Creates a new type, or updates an existing one when an id is given.
export function useSaveAppointmentType(existingId: string | undefined) {
  const invalidate = useInvalidateAfterTypeChange();

  return useMutation({
    mutationFn: (input: AppointmentTypeInput) =>
      existingId ? updateAppointmentType(existingId, input) : createAppointmentType(input),
    onSuccess: invalidate,
  });
}

export function useSetAppointmentTypeActive() {
  const invalidate = useInvalidateAfterTypeChange();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setAppointmentTypeActive(id, isActive),
    onSuccess: invalidate,
  });
}
