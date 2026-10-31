import { useNow } from "../../hooks/useNow";
import { todayDateString } from "../../utils/date";
import { useAppointments, useAppointmentsToDocument } from "../appointments/useAppointments";
import { useAuth } from "../auth/useAuth";
import { DashboardHeader } from "./DashboardHeader";
import { countByStatus, countLabel, findNextAppointment, greetingFor } from "./dashboardData";
import { NextAppointment } from "./NextAppointment";
import { StatusSummary } from "./StatusSummary";
import { TodaySchedule } from "./TodaySchedule";
import { ToDocumentList } from "./ToDocumentList";
import { BookAppointmentButton } from "../appointments/BookAppointmentButton";

export function DoctorDashboard() {
  const { user } = useAuth();
  // Re-renders every minute: "Starts in" counts down, the next patient moves on,
  // and after midnight the query key switches to the new day.
  const now = useNow();
  const today = useAppointments(todayDateString());
  const toDocument = useAppointmentsToDocument();

  const appointments = today.data ?? [];
  const next = findNextAppointment(appointments, now);

  // Three cards share today's query; each shows all its own states.
  const state = {
    isLoading: today.isLoading,
    isError: today.isError,
    onRetry: () => void today.refetch(),
  };

  const summary = [
    today.data && `${countLabel(today.data.length, "appointment")} today`,
    toDocument.data && `${countLabel(toDocument.data.total, "visit")} to document`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <DashboardHeader
        date={now}
        title={`${greetingFor(now)}, ${user?.name ?? ""}`}
        summary={summary || undefined}
        actions={<BookAppointmentButton doctorId={user?.doctorId ?? undefined} />}
      />

      {/* DOM order is also the order on a phone. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <NextAppointment appointment={next} now={now} {...state} />
          <TodaySchedule
            appointments={appointments}
            nextId={next?.id ?? null}
            now={now}
            {...state}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <ToDocumentList
            data={toDocument.data}
            now={now}
            isLoading={toDocument.isLoading}
            isError={toDocument.isError}
            onRetry={() => void toDocument.refetch()}
          />
          <StatusSummary
            layout="grid"
            counts={today.data ? countByStatus(today.data) : undefined}
            {...state}
          />
        </div>
      </div>
    </>
  );
}
