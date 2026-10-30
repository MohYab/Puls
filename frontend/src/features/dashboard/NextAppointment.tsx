import { useId } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Avatar } from "../../components/Avatar";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import type { Appointment } from "../../types/appointment";
import { formatDuration, formatStartsIn, formatTime, formatTimeRange } from "../../utils/date";
import { birthDateAndAge } from "./dashboardData";

interface NextAppointmentProps {
  appointment: Appointment | null;
  now: Date;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function NextAppointment({ appointment, now, isLoading, isError, onRetry }: NextAppointmentProps) {
  const isReady = !isLoading && !isError;
  if (isReady && appointment) return <NextPatientHero appointment={appointment} now={now} />;

  // Loading, error and empty states use a light card: grey text on dark blue fails contrast.
  return (
    <Card title="Next patient">
      {isLoading && <LoadingMessage />}
      {isError && <ErrorMessage message="Could not load the next patient." onRetry={onRetry} />}
      {/* Without isReady, a failed load would say "No more patients today", which is not true. */}
      {isReady && <EmptyMessage>No more patients today.</EmptyMessage>}
    </Card>
  );
}

// White focus ring: the accent colour does not reach 3:1 against dark blue.
const heroButton =
  "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

function NextPatientHero({ appointment, now }: { appointment: Appointment; now: Date }) {
  const headingId = useId();
  const { startTime, endTime, patient } = appointment;
  const name = `${patient.firstName} ${patient.lastName}`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-5 rounded-2xl bg-primary p-6 text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* The heading stays "Next patient"; the time sits next to it. */}
        <div className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-0.5 text-sm font-semibold">
          <h2 id={headingId} className="text-sm font-semibold text-white">
            Next patient
          </h2>
          <span className="tabular-nums">· {formatTime(startTime)}</span>
        </div>
        <span className="text-sm tabular-nums text-slate-300">{formatStartsIn(startTime, now)}</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-[1_1_15rem]">
          <p className="truncate font-display text-xl font-bold">{name}</p>
          <p className="tabular-nums text-slate-300">{birthDateAndAge(patient.dateOfBirth, now)}</p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <span className="font-semibold">{appointment.appointmentType.name}</span>
          <span className="text-sm tabular-nums text-slate-300">
            {formatTimeRange(startTime, endTime)} · {formatDuration(startTime, endTime)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={`/documentation/${appointment.id}`}
          className={`${heroButton} bg-white text-primary hover:bg-slate-100`}
        >
          <FileText aria-hidden="true" className="size-4" />
          {appointment.hasNote ? "Open documentation" : "Document visit"}
        </Link>
        <Link
          to={`/patients/${appointment.patientId}`}
          className={`${heroButton} border border-white/30 hover:bg-white/10`}
        >
          Open patient
        </Link>
      </div>
    </section>
  );
}