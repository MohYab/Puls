import { Link } from "react-router-dom";
import { Avatar } from "../../components/Avatar";
import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { formatTime } from "../../utils/date";
import { countLabel, type DoctorDay } from "./dashboardData";

interface DoctorsTodayProps {
  rows: DoctorDay[];
  /** Active doctors without appointments today; null while unknown. */
  withoutAppointments: number | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const cell = "px-4 py-3 md:px-5";
const countCell = `${cell} text-center`;

export function DoctorsToday({
  rows,
  withoutAppointments,
  isLoading,
  isError,
  onRetry,
}: DoctorsTodayProps) {
  const isReady = !isLoading && !isError;

  return (
    <Card
      title="Doctors today"
      actions={<span className="text-sm text-muted">Select a doctor to open their calendar</span>}
    >
      {isLoading && <LoadingMessage />}
      {isError && <ErrorMessage message="Could not load today's appointments." onRetry={onRetry} />}
      {isReady && rows.length === 0 && (
        <EmptyMessage>No doctors have appointments today.</EmptyMessage>
      )}

      {isReady && rows.length > 0 && (
        // Scrolls inside the card on a phone instead of widening the page.
        <div className="-mx-4 overflow-x-auto md:-mx-5">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted">
                <th scope="col" className={`${cell} text-start`}>
                  Doctor
                </th>
                <th scope="col" className={countCell}>
                  Appointments
                </th>
                <th scope="col" className={countCell}>
                  Completed
                </th>
                <th scope="col" className={countCell}>
                  No-show
                </th>
                <th scope="col" className={`${cell} text-start`}>
                  Next
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.doctorId} className="hover:bg-subtle">
                  <td className={cell}>
                    <Link
                      to={`/calendar?doctor=${row.doctorId}`}
                      className="inline-flex items-center gap-2.5 font-semibold whitespace-nowrap text-ink hover:underline"
                    >
                      <Avatar name={row.doctorName} size="sm" />
                      {row.doctorName}
                    </Link>
                  </td>
                  <td className={countCell}>{row.count}</td>
                  <td className={countCell}>{row.completed}</td>
                  <td className={countCell}>
                    {row.noShow > 0 ? (
                      <Badge tone="no-show">{row.noShow}</Badge>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                  <td className={cell}>
                    {row.nextStart ? (
                      formatTime(row.nextStart)
                    ) : (
                      <>
                        <span aria-hidden="true" className="text-muted">
                          –
                        </span>
                        <span className="sr-only">None</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isReady && withoutAppointments !== null && withoutAppointments > 0 && (
        <p className="mt-3 text-sm text-muted">
          {countLabel(withoutAppointments, "doctor")} {withoutAppointments === 1 ? "has" : "have"}{" "}
          no appointments today.
        </p>
      )}
    </Card>
  );
}
