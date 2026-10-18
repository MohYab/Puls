import { useState } from "react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { Appointment, AppointmentStatus } from "../../types/appointment";
import { STATUS_PHRASES, isFinalStatus, workflowTargets } from "../../utils/appointmentStatus";
import { formatDate, formatTime } from "../../utils/date";
import { useUpdateAppointmentStatus } from "./useAppointments";

const BUTTON_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirm",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
  CANCELLED: "Cancel appointment",
};

const secondaryButton = "rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50";
const dangerButton =
  "rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50";

interface AppointmentStatusActionsProps {
  appointment: Appointment;
  onDone: () => void;
}

// Workflow buttons for an appointment that is not final yet.
export function AppointmentStatusActions({ appointment, onDone }: AppointmentStatusActionsProps) {
  const updateStatus = useUpdateAppointmentStatus(appointment.id);
  const [pendingFinal, setPendingFinal] = useState<AppointmentStatus | null>(null);

  const targets = workflowTargets(appointment.status, appointment.startTime);
  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const when = `${formatDate(appointment.startTime)} at ${formatTime(appointment.startTime)}`;

  function change(status: AppointmentStatus) {
    updateStatus.mutate({ status }, { onSuccess: onDone });
  }

  // Final statuses cannot be undone by a doctor, so they ask first.
  function handleClick(status: AppointmentStatus) {
    updateStatus.reset();
    if (isFinalStatus(status)) {
      setPendingFinal(status);
    } else {
      change(status);
    }
  }

  function closeDialog() {
    setPendingFinal(null);
    updateStatus.reset();
  }

  function dialogMessage(status: AppointmentStatus): string {
    const question =
      status === "CANCELLED"
        ? `Cancel the appointment with ${patientName} on ${when}? The time will be free for other bookings.`
        : `Mark the appointment with ${patientName} on ${when} as ${STATUS_PHRASES[status]}?`;
    return `${question} The status cannot be changed afterwards, except by an administrator.`;
  }

  if (targets.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {targets.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => handleClick(status)}
            disabled={updateStatus.isPending}
            className={status === "CANCELLED" ? dangerButton : secondaryButton}
          >
            {BUTTON_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Errors from "Confirm" (final statuses show their errors in the dialog). */}
      {updateStatus.isError && !pendingFinal && (
        <p role="alert" className="text-sm text-red-600">
          {updateStatus.error.message}
        </p>
      )}

      {pendingFinal && (
        <ConfirmDialog
          title={BUTTON_LABELS[pendingFinal]}
          message={dialogMessage(pendingFinal)}
          confirmLabel={BUTTON_LABELS[pendingFinal]}
          cancelLabel={pendingFinal === "CANCELLED" ? "Keep appointment" : "Back"}
          pendingLabel="Saving..."
          isPending={updateStatus.isPending}
          error={updateStatus.isError ? updateStatus.error.message : null}
          onConfirm={() => change(pendingFinal)}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
