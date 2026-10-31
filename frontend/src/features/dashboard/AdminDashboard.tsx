import { useNow } from "../../hooks/useNow";
import { todayDateString } from "../../utils/date";
import { BookAppointmentButton } from "../appointments/BookAppointmentButton";
import { useAppointments } from "../appointments/useAppointments";
import { useDoctors } from "../doctors/useDoctors";
import { AddPatientButton } from "../patients/AddPatientButton";
import { DashboardHeader } from "./DashboardHeader";
import { DoctorsToday } from "./DoctorsToday";
import { countByStatus, countLabel, groupByDoctor } from "./dashboardData";
import { StatusSummary } from "./StatusSummary";

// Operations only (design-direction.md, principle 3). No note information (decision #56):
// the admin dashboard never asks for /appointments/to-document.
export function AdminDashboard() {
  const now = useNow();
  // Without doctorId, admins get every doctor's appointments.
  const today = useAppointments(todayDateString());
  const doctors = useDoctors();

  const rows = today.data ? groupByDoctor(today.data, now) : [];
  const withoutAppointments = doctors.data ? Math.max(0, doctors.data.length - rows.length) : null;

  const summary = today.data
    ? `${countLabel(today.data.length, "appointment")} · ${countLabel(rows.length, "doctor")} with appointments today`
    : undefined;

  const state = {
    isLoading: today.isLoading,
    isError: today.isError,
    onRetry: () => void today.refetch(),
  };

  return (
    <>
      <DashboardHeader
        date={now}
        title="Today at the clinic"
        summary={summary}
        actions={
          <>
            <AddPatientButton />
            <BookAppointmentButton />
          </>
        }
      />
      <div className="flex flex-col gap-6">
        <StatusSummary counts={today.data ? countByStatus(today.data) : undefined} {...state} />
        <DoctorsToday rows={rows} withoutAppointments={withoutAppointments} {...state} />
      </div>
    </>
  );
}