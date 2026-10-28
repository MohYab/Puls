import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import type { Appointment } from "../../types/appointment";
import { AppointmentDetail } from "../appointments/AppointmentDetail";

interface AppointmentPanelProps {
  appointment: Appointment | null;
  onClose: () => void;
}

// Wide screens only: the details next to the calendar instead of in a modal.
export function AppointmentPanel({ appointment, onClose }: AppointmentPanelProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const appointmentId = appointment?.id;

  // Move focus to the panel when an appointment is chosen, so keyboard and
  // screen reader users land on the details they just opened.
  useEffect(() => {
    if (appointmentId) headingRef.current?.focus();
  }, [appointmentId]);

  return (
    <aside
      aria-labelledby={headingId}
      className="rounded-lg border bg-surface p-5 shadow-card xl:sticky xl:top-6"
    >
      {appointment ? (
        <>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 id={headingId} ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
              Appointment
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="rounded-lg p-1.5 text-muted hover:bg-subtle hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          {/* key: a new appointment starts with a fresh form (not in edit mode). */}
          <AppointmentDetail key={appointment.id} appointment={appointment} onClose={onClose} />
        </>
      ) : (
        <>
          <h2 id={headingId} className="sr-only">
            Appointment details
          </h2>
          <p className="text-sm text-muted">Select an appointment in the calendar to see its details.</p>
        </>
      )}
    </aside>
  );
}