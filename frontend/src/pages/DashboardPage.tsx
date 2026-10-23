import { ErrorMessage } from "../components/Feedback";
import { useAppointments } from "../features/appointments/useAppointments";
import { TodaySchedule } from "../features/dashboard/TodaySchedule";
import { NextAppointment } from "../features/dashboard/NextAppointment";
import { todayDateString } from "../utils/date";
import { usePageTitle } from "../hooks/usePageTitle";

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const {
    data: appointments,
    isLoading,
    isError,
    error,
    refetch,
  } = useAppointments(todayDateString());

  const now = new Date();
  const next =
    appointments?.find(
      (a) => new Date(a.startTime) > now && a.status !== "CANCELLED" && a.status !== "COMPLETED"
    ) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h1>
      </div>

      {isError ? (
        <ErrorMessage
          message={error?.message ?? "Could not load today's schedule."}
          onRetry={() => refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TodaySchedule appointments={appointments ?? []} isLoading={isLoading} />
          <NextAppointment appointment={next} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}
