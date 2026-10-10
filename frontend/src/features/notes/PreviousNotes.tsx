import { Link } from "react-router-dom";
import { Card } from "../../components/Card";
import { formatDateTime } from "../../utils/date";
import { NOTE_FIELDS } from "./noteFields";
import { usePatientNotes } from "./useNotes";

interface PreviousNotesProps {
  patientId: string;
  // Used on the documentation page, where the current note is already shown in the form.
  excludeAppointmentId?: string;
}

export function PreviousNotes({ patientId, excludeAppointmentId }: PreviousNotesProps) {
  const { data, isPending, isError, error, refetch } = usePatientNotes(patientId);
  const notes = data?.filter((note) => note.appointmentId !== excludeAppointmentId);

  return (
    <Card title="Previous documentation">
      {isPending && <p className="text-sm text-gray-600">Loading documentation...</p>}

      {isError && (
        <div role="alert" className="text-sm">
          <p className="text-red-700">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded border border-red-300 px-3 py-1.5 text-red-700"
          >
            Try again
          </button>
        </div>
      )}

      {notes && notes.length === 0 && (
        <p className="text-sm text-gray-600">No earlier documentation for this patient.</p>
      )}

      {notes && notes.length > 0 && (
        <ul className="flex flex-col gap-3">
          {notes.map((note, index) => (
            <li key={note.id}>
              <details open={index === 0} className="rounded border">
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-900">
                  {formatDateTime(note.appointment.startTime)} ·{" "}
                  {note.appointment.appointmentType.name}
                </summary>
                <div className="border-t px-3 py-3">
                  <dl className="flex flex-col gap-3 text-sm">
                    {NOTE_FIELDS.filter(({ name }) => note.content[name]).map(({ name, label }) => (
                      <div key={name}>
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="whitespace-pre-wrap text-gray-900">{note.content[name]}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    to={`/documentation/${note.appointmentId}`}
                    className="mt-3 inline-block text-sm text-blue-700 hover:underline"
                  >
                    Open documentation
                  </Link>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
