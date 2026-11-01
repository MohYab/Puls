import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "../components/Card";
import { LoadingMessage } from "../components/Feedback";
import { StateMessage } from "../components/StateMessage";
import { useAppointment } from "../features/appointments/useAppointments";
import { useAuth } from "../features/auth/useAuth";
import { useTemplates } from "../features/documentationTemplates/useTemplates";
import { DocumentationForm } from "../features/notes/DocumentationForm";
import { NoteSharing } from "../features/notes/NoteSharing";
import { PreviousNotes } from "../features/notes/PreviousNotes";
import { useNote } from "../features/notes/useNotes";
import { VisitHeader } from "../features/notes/VisitHeader";
import { usePageTitle } from "../hooks/usePageTitle";
import { ApiError } from "../services/apiClient";

export default function DocumentationPage() {
  usePageTitle("Documentation");
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
    return <LoadingMessage>Loading documentation...</LoadingMessage>;
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
      {/* The patient page is the right context whether the doctor came from the
          dashboard, the calendar or the patient (decision ab). */}
      <Link
        to={`/patients/${appointment.patientId}`}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        Back to patient
      </Link>

      <h1 className="mb-5 font-display text-2xl font-bold text-ink md:text-[28px]">
        Visit documentation
      </h1>

      <VisitHeader appointment={appointment} />

      {/* DOM order = phone order: the note before the earlier documentation. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <Card title="Visit note">
          <DocumentationForm
            appointmentId={appointment.id}
            note={note}
            templates={templatesQuery.data}
          />
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          {/* A note can only be shared once it has been saved. */}
          {note && <NoteSharing note={note} />}
          <PreviousNotes patientId={appointment.patientId} excludeAppointmentId={appointment.id} />
        </div>
      </div>
    </div>
  );
}
