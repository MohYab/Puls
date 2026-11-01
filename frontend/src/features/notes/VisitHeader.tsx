import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { StatusBadge } from "../../components/StatusBadge";
import type { Appointment } from "../../types/appointment";
import { birthDateAndAge, formatTimeRange, formatWeekdayDate } from "../../utils/date";

// Which visit is being documented: the patient and the appointment, at a glance.
export function VisitHeader({ appointment }: { appointment: Appointment }) {
  const { patient } = appointment;
  const name = `${patient.firstName} ${patient.lastName}`;

  return (
    <section
      aria-label="Appointment"
      className="mb-6 flex flex-wrap items-center gap-6 rounded-lg border bg-surface p-5 shadow-card md:px-6"
    >
      <div className="flex min-w-0 flex-[1_1_16rem] items-center gap-3.5">
        <Avatar name={name} />
        <div className="min-w-0 leading-snug">
          <Link
            to={`/patients/${appointment.patientId}`}
            className="font-display text-lg font-bold text-ink hover:underline"
          >
            {name}
          </Link>
          <p className="tabular-nums text-muted">{birthDateAndAge(patient.dateOfBirth)}</p>
        </div>
      </div>

      {/* A description list: each label is read together with its value. */}
      <dl className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Appointment</dt>
          <dd className="font-semibold tabular-nums text-ink">
            {formatWeekdayDate(appointment.startTime)},{" "}
            {formatTimeRange(appointment.startTime, appointment.endTime)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Type</dt>
          <dd className="font-semibold text-ink">{appointment.appointmentType.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Doctor</dt>
          <dd className="font-semibold text-ink">{appointment.doctor.user.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Status</dt>
          <dd>
            <StatusBadge status={appointment.status} />
          </dd>
        </div>
      </dl>
    </section>
  );
}
