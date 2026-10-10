import { apiClient } from "../../services/apiClient";
import type { ClinicalNote, NoteContent } from "../../types/note";

export function getNoteByAppointment(appointmentId: string) {
  return apiClient.get<ClinicalNote>(`/appointments/${appointmentId}/notes`);
}

export function createNote(appointmentId: string, content: NoteContent) {
  return apiClient.post<ClinicalNote>(`/appointments/${appointmentId}/notes`, content);
}

export function updateNote(noteId: string, content: NoteContent) {
  return apiClient.put<ClinicalNote>(`/notes/${noteId}`, content);
}

export function getPatientNotes(patientId: string) {
  return apiClient.get<ClinicalNote[]>(`/patients/${patientId}/notes`);
}
