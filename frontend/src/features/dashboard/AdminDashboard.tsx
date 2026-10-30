import { useNow } from "../../hooks/useNow";
import { todayDateString } from "../../utils/date";
import { useAppointments } from "../appointments/useAppointments";
import { DashboardHeader } from "./DashboardHeader";
import { countByStatus } from "./dashboardData";
import { StatusSummary } from "./StatusSummary";
import { BookAppointmentButton } from "../appointments/BookAppointmentButton";

// Operations only (design-direction.md, principle 3). No note information (decision #56).
export function AdminDashboard() {
  const now = useNow();
  // Without doctorId, admins get every doctor's appointments.
  const today = useAppointments(todayDateString());

  return (
    <>
      <DashboardHeader
        date={now}
        title="Today at the clinic"
        actions={<BookAppointmentButton />}
      />
      <StatusSummary
        counts={today.data ? countByStatus(today.data) : undefined}
        isLoading={today.isLoading}
        isError={today.isError}
        onRetry={() => void today.refetch()}
      />
    </>
  );
}