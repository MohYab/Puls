import { apiClient } from "../../services/apiClient";
import type { ClinicalNote, NoteContent, NoteShare } from "../../types/note";

export function getNoteByAppointment(appointmentId: string) {
  return apiClient.get<ClinicalNote>(`/appointments/${appointmentId}/notes`);
}

export function createNote(appointmentId: string, content: NoteContent, templateId?: string) {
  return apiClient.post<ClinicalNote>(`/appointments/${appointmentId}/notes`, {
    ...content,
    templateId,
  });
}

export function updateNote(noteId: string, content: NoteContent) {
  return apiClient.put<ClinicalNote>(`/notes/${noteId}`, content);
}

export function getPatientNotes(patientId: string) {
  return apiClient.get<ClinicalNote[]>(`/patients/${patientId}/notes`);
}

export function getNoteShares(noteId: string) {
  return apiClient.get<NoteShare[]>(`/notes/${noteId}/shares`);
}

// Only called after the author has ticked the consent checkbox in the form.
export function shareNote(noteId: string, doctorId: string) {
  return apiClient.post<NoteShare>(`/notes/${noteId}/shares`, {
    doctorId,
    consentConfirmed: true,
  });
}

export function revokeNoteShare(noteId: string, doctorId: string) {
  return apiClient.delete<void>(`/notes/${noteId}/shares/${doctorId}`);
}
