import { Link } from "react-router-dom";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { formatDate } from "../../utils/date";
import { useAuth } from "../auth/useAuth";
import { NOTE_FIELDS } from "./noteFields";
import { usePatientNotes } from "./useNotes";
import { formatVitals } from "./vitals";

interface PreviousNotesProps {
  patientId: string;
  // Used on the documentation page, where the current note is already shown in the form.
  excludeAppointmentId?: string;
}

export function PreviousNotes({ patientId, excludeAppointmentId }: PreviousNotesProps) {
  const { user } = useAuth();
  const { data, isPending, isError, error, refetch } = usePatientNotes(patientId);
  const notes = data?.filter((note) => note.appointmentId !== excludeAppointmentId);

  return (
    <Card title="Previous documentation">
      {isPending && <LoadingMessage>Loading documentation...</LoadingMessage>}
      {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}
      {notes && notes.length === 0 && (
        <EmptyMessage>No earlier documentation for this patient.</EmptyMessage>
      )}

      {notes && notes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {notes.map((note, index) => {
            const isOwn = note.doctorId === user?.doctorId;
            const vitals = formatVitals(note.content.vitals);
            return (
              <li key={note.id}>
                <details open={index === 0} className="rounded-lg border px-3.5 py-3">
                  <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
                    <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
                      {note.appointment.appointmentType.name}
                      {/* Neutral: colour only means booking status (design-direction.md, 1). */}
                      {!isOwn && <Badge>Shared by {note.doctor.user.name}</Badge>}
                    </span>
                    <span className="text-sm tabular-nums text-muted">
                      {formatDate(note.appointment.startTime)} · {note.doctor.user.name}
                    </span>
                  </summary>

                  {vitals && (
                    <p className="mt-2.5 rounded-md bg-subtle px-2.5 py-1.5 text-sm tabular-nums text-ink">
                      {vitals}
                    </p>
                  )}

                  <dl className="mt-2.5 flex flex-col gap-2 text-sm">
                    {NOTE_FIELDS.filter(({ name }) => note.content[name]).map(({ name, label }) => (
                      <div key={name}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                          {label}
                        </dt>
                        <dd className="whitespace-pre-wrap text-ink">{note.content[name]}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Shared notes are read-only and belong to another doctor's appointment. */}
                  {isOwn && (
                    <Link
                      to={`/documentation/${note.appointmentId}`}
                      className="mt-2.5 inline-block text-sm font-semibold text-accent hover:underline"
                    >
                      Open documentation
                    </Link>
                  )}
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
