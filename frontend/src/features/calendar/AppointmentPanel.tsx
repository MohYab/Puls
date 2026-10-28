import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { hasOpenModal } from "../../components/modalStack";
import type { Appointment } from "../../types/appointment";
import { AppointmentDetail } from "../appointments/AppointmentDetail";

interface AppointmentPanelProps {
  appointment: Appointment;
  onClose: () => void;
}

// Wide screens only: the details next to the calendar instead of in a modal.
// Shown only while an appointment is selected. It is not modal: no focus trap,
// the calendar stays reachable with Tab.
export function AppointmentPanel({ appointment, onClose }: AppointmentPanelProps) {
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the panel when an appointment is chosen, so keyboard and
  // screen reader users land on the details they just opened.
  useEffect(() => {
    headingRef.current?.focus();
  }, [appointment.id]);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Escape closes the panel, unless a modal (e.g. the cancel confirmation) is open:
  // then Escape belongs to the modal. defaultPrevented lets a widget that handles
  // Escape itself (e.g. an open listbox) keep the key.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || hasOpenModal()) return;
      onCloseRef.current();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside
      aria-labelledby={headingId}
      className="rounded-lg border bg-surface p-5 shadow-card xl:sticky xl:top-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold outline-none"
        >
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
    </aside>
  );
}
