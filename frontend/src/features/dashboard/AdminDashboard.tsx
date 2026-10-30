import { todayDateString } from "../../utils/date";
import { useAppointments } from "../appointments/useAppointments";
import { countByStatus } from "./dashboardData";
import { StatusSummary } from "./StatusSummary";

// Operations only (design-direction.md, principle 3). No note information (decision #56).
export function AdminDashboard() {
  // Without doctorId, admins get every doctor's appointments.
  const today = useAppointments(todayDateString());

  return (
    <div className="grid grid-cols-1 gap-6">
      <StatusSummary
        title="Today by status, all doctors"
        counts={today.data ? countByStatus(today.data) : undefined}
        isLoading={today.isLoading}
        isError={today.isError}
        onRetry={() => today.refetch()}
      />
    </div>
  );
}