import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../services/apiClient";
import { retryUnlessClientError } from "../../utils/queryRetry";
import type { NoteContent } from "../../types/note";
import { createNote, getNoteByAppointment, getPatientNotes, updateNote } from "./noteService";

export const noteKeys = {
  byAppointment: (appointmentId: string | undefined) =>
    ["notes", "byAppointment", appointmentId] as const,
  byPatient: (patientId: string | undefined) => ["notes", "byPatient", patientId] as const,
};

// Resolves to null when the appointment has no note yet (a normal state, not an error).
export function useNote(appointmentId: string | undefined) {
  return useQuery({
    queryKey: noteKeys.byAppointment(appointmentId),
    queryFn: async () => {
      try {
        return await getNoteByAppointment(appointmentId!);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: !!appointmentId,
    retry: retryUnlessClientError,
  });
}

export function usePatientNotes(patientId: string | undefined) {
  return useQuery({
    queryKey: noteKeys.byPatient(patientId),
    queryFn: () => getPatientNotes(patientId!),
    enabled: !!patientId,
    retry: retryUnlessClientError,
  });
}

// Creates the note the first time and updates it afterwards (one note per appointment).
export function useSaveNote(appointmentId: string, existingNoteId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: NoteContent) =>
      existingNoteId ? updateNote(existingNoteId, content) : createNote(appointmentId, content),
    onSuccess: (note) => {
      queryClient.setQueryData(noteKeys.byAppointment(appointmentId), note);
      queryClient.invalidateQueries({ queryKey: noteKeys.byPatient(note.patientId) });
    },
  });
}
