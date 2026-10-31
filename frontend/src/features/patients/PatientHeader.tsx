import { useId, type ReactNode } from "react";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import type { PatientAppointment } from "../../types/appointment";
import type { Patient } from "../../types/patient";
import { birthDateAndAge, formatDate, formatTime, formatWeekdayDate } from "../../utils/date";
import { BookAppointmentButton } from "../appointments/BookAppointmentButton";
import { useAuth } from "../auth/useAuth";
import { findNextPatientAppointment } from "./patientData";
import { PATIENT_DEACTIVATION_LABELS } from "./patientLabels";
import { usePatientAppointments } from "./usePatients";

interface PatientHeaderProps {
  patient: Patient;
  /** Edit, deactivate or reactivate: the page owns their dialogs. */
  actions?: ReactNode;
}

export function PatientHeader({ patient, actions }: PatientHeaderProps) {
  const headingId = useId();
  const { user } = useAuth();
  // Same query as the history card: one request, one cache entry.
  const history = usePatientAppointments(patient.id);
  const next = history.data ? findNextPatientAppointment(history.data) : null;
  const name = `${patient.firstName} ${patient.lastName}`;

  return (
    <section
      aria-labelledby={headingId}
      className="mb-6 flex flex-wrap items-center gap-6 rounded-lg border bg-surface p-5 shadow-card md:p-6"
    >
      <div className="flex min-w-0 flex-[1_1_20rem] items-center gap-4">
        <Avatar name={name} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 id={headingId} className="font-display text-2xl font-bold text-ink md:text-[28px]">
              {name}
            </h1>
            {!patient.isActive && <Badge>Inactive</Badge>}
          </div>
          <p className="font-semibold tabular-nums text-ink">
            {birthDateAndAge(patient.dateOfBirth)}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="tabular-nums">{patient.phone ?? "No phone"}</span>
            <span className="break-all">{patient.email ?? "No email"}</span>
          </p>
          {!patient.isActive && (
            <p className="mt-1 text-sm text-muted">{deactivatedText(patient)}</p>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-2.5 sm:w-auto sm:items-end">
        <div className="flex flex-wrap gap-2">
          {actions}
          {/* An inactive patient cannot be booked (400 PATIENT_INACTIVE). */}
          {patient.isActive && <BookAppointmentButton patientId={patient.id} />}
        </div>
        {patient.isActive && (
          <NextLine
            next={next}
            isLoading={history.isPending}
            isError={history.isError}
            showDoctor={user?.role === "ADMIN"}
          />
        )}
      </div>
    </section>
  );
}

function deactivatedText(patient: Patient): string {
  const reason = patient.deactivationReason
    ? ` (${PATIENT_DEACTIVATION_LABELS[patient.deactivationReason].toLowerCase()})`
    : "";
  const since = patient.deactivatedAt ? ` ${formatDate(patient.deactivatedAt)}` : "";
  return `Deactivated${since}${reason}`;
}

interface NextLineProps {
  next: PatientAppointment | null;
  isLoading: boolean;
  isError: boolean;
  /** Admins see every doctor's appointments, so the doctor is named. */
  showDoctor: boolean;
}

function NextLine({ next, isLoading, isError, showDoctor }: NextLineProps) {
  if (isLoading) return <p className="text-sm text-muted">Loading next appointment...</p>;
  // Never "No upcoming appointment" when we do not know (decision #25).
  if (isError) return <p className="text-sm text-muted">Could not load the next appointment.</p>;
  if (!next) return <p className="text-sm text-muted">No upcoming appointment</p>;

  return (
    <p className="text-sm text-ink">
      Next:{" "}
      <span className="font-semibold tabular-nums">
        {formatWeekdayDate(next.startTime)}, {formatTime(next.startTime)}
      </span>{" "}
      · {next.appointmentType.name}
      {showDoctor && ` · ${next.doctor.user.name}`}
    </p>
  );
}
