import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { StatusBadge } from "../components/StatusBadge";
import { useAppointment } from "../features/appointments/useAppointments";
import { useAuth } from "../features/auth/useAuth";
import { DocumentationForm } from "../features/notes/DocumentationForm";
import { useNote } from "../features/notes/useNotes";
import { ApiError } from "../services/apiClient";
import { formatDate, formatTime } from "../utils/date";
import { PreviousNotes } from "../features/notes/PreviousNotes";
import { useTemplates } from "../features/documentationTemplates/useTemplates";
import { StateMessage } from "../components/StateMessage";

export default function DocumentationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { user } = useAuth();
  const isDoctor = user?.role === "DOCTOR";

  // Admins have no access to clinical notes, so they never trigger these requests.
  const appointmentQuery = useAppointment(isDoctor ? appointmentId : undefined);
  const noteQuery = useNote(isDoctor ? appointmentId : undefined);
  const templatesQuery = useTemplates(isDoctor);

  if (!isDoctor) {
    return (
      <StateMessage title="No access" text="Only doctors can write and read clinical notes." />
    );
  }

  if (appointmentQuery.isError) {
    const status =
      appointmentQuery.error instanceof ApiError ? appointmentQuery.error.status : null;
    if (status === 404) {
      return (
        <StateMessage
          title="Appointment not found"
          text="The appointment you are looking for does not exist."
        />
      );
    }
    if (status === 403) {
      return <StateMessage title="No access" text="You can only document your own appointments." />;
    }
    return (
      <StateMessage
        title="Could not load appointment"
        text={appointmentQuery.error.message}
        onRetry={() => appointmentQuery.refetch()}
      />
    );
  }

  if (noteQuery.isError) {
    return (
      <StateMessage
        title="Could not load documentation"
        text={noteQuery.error.message}
        onRetry={() => noteQuery.refetch()}
      />
    );
  }

  if (templatesQuery.isError) {
    return (
      <StateMessage
        title="Could not load templates"
        text={templatesQuery.error.message}
        onRetry={() => templatesQuery.refetch()}
      />
    );
  }

  if (appointmentQuery.isPending || noteQuery.isPending || templatesQuery.isPending) {
    return <p className="text-sm text-gray-600">Loading documentation...</p>;
  }

  const appointment = appointmentQuery.data;
  const note = noteQuery.data;

  if (!note && appointment.status === "CANCELLED") {
    return (
      <StateMessage
        title="Appointment cancelled"
        text="A cancelled appointment cannot be documented."
      />
    );
  }

  return (
    <div>
      <Link
        to={`/patients/${appointment.patientId}`}
        className="text-sm text-blue-700 hover:underline"
      >
        ← Back to patient
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Documentation</h1>

      {/*
        DOM order = mobile order: appointment, form, previous notes.
        On lg the form spans two rows on the right, and the previous notes
        land under the appointment card in the left column.
      */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-[auto_1fr] lg:items-start">
        <div className="lg:col-span-1">
          <Card title="Appointment">
            <dl className="grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
              <dt className="text-gray-500">Patient</dt>
              <dd className="text-gray-900">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </dd>

              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-900">
                {formatDate(appointment.startTime)} {formatTime(appointment.startTime)}
              </dd>

              <dt className="text-gray-500">Type</dt>
              <dd className="text-gray-900">{appointment.appointmentType.name}</dd>

              <dt className="text-gray-500">Status</dt>
              <dd>
                <StatusBadge status={appointment.status} />
              </dd>
            </dl>
          </Card>
        </div>

        <div className="lg:col-span-2 lg:row-span-2">
          <Card title="Visit note">
            <DocumentationForm
              appointmentId={appointment.id}
              note={note}
              templates={templatesQuery.data}
            />
          </Card>
        </div>

        <div className="lg:col-span-1">
          <PreviousNotes patientId={appointment.patientId} excludeAppointmentId={appointment.id} />
        </div>
      </div>
    </div>
  );
}
