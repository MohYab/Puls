import { useNow } from "../../hooks/useNow";
import { todayDateString } from "../../utils/date";
import { useAppointments } from "../appointments/useAppointments";
import { countByStatus, findNextAppointment } from "./dashboardData";
import { NextAppointment } from "./NextAppointment";
import { StatusSummary } from "./StatusSummary";
import { TodaySchedule } from "./TodaySchedule";
import { ToDocumentList } from "./ToDocumentList";

export function DoctorDashboard() {
  // Re-renders every minute: the next patient moves on as time passes,
  // and after midnight the query key switches to the new day.
  const now = useNow();
  const today = useAppointments(todayDateString());
  const appointments = today.data ?? [];

  // Three cards share one query; each shows all its own states (design-direction.md, 8).
  const state = {
    isLoading: today.isLoading,
    isError: today.isError,
    onRetry: () => void today.refetch(),
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <NextAppointment appointment={findNextAppointment(appointments, now)} {...state} />
      <div className="lg:col-span-2">
        <StatusSummary counts={today.data ? countByStatus(today.data) : undefined} {...state} />
      </div>
      <div className="lg:col-span-2">
        <TodaySchedule appointments={appointments} {...state} />
      </div>
      {/* Its own query: unaffected when today's appointments fail to load. */}
      <ToDocumentList />
    </div>
  );
}