import { useId } from "react";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../../components/Feedback";
import { formatDate } from "../../utils/date";
import { usePatientNotes } from "./useNotes";
import { latestMeasurements } from "./vitals";

// Doctors only: vital signs are clinical data (decision aa). Uses the same query
// as Previous notes, so no extra request.
export function LatestMeasurements({ patientId }: { patientId: string }) {
  const headingId = useId();
  const { data, isPending, isError, refetch } = usePatientNotes(patientId);
  const measurements = data ? latestMeasurements(data) : [];

  return (
    <section aria-labelledby={headingId} className="mb-6">
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2.5">
        <h2 id={headingId} className="text-base font-semibold text-ink">
          Latest measurements
        </h2>
        <span className="text-sm text-muted">From the notes you can read</span>
      </div>

      {isPending && <LoadingMessage>Loading measurements...</LoadingMessage>}
      {isError && <ErrorMessage message="Could not load measurements." onRetry={() => refetch()} />}
      {data && measurements.length === 0 && (
        <EmptyMessage>No measurements recorded yet.</EmptyMessage>
      )}

      {measurements.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {measurements.map((m) => (
            <div key={m.key} className="rounded-lg border bg-surface px-4 py-3 shadow-card">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                {m.label}
              </dt>
              <dd>
                <span className="font-display text-xl font-bold tabular-nums text-ink">
                  {m.value}
                </span>
                {/* "72/min" but "36.8 °C": no space before a rate. */}
                <span
                  className={`text-sm font-medium text-muted ${m.unit.startsWith("/") ? "" : "ms-1"}`}
                >
                  {m.unit}
                </span>
                {/* Values can come from different visits, so each has its own date. */}
                <span className="block text-xs tabular-nums text-muted">{formatDate(m.date)}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
