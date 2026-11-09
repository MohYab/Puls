import { useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { StatusBadge } from "../../components/StatusBadge";
import type { Appointment, AppointmentStatus } from "../../types/appointment";
import { STATUS_LABELS, isCorrection, statusTargets } from "../../utils/appointmentStatus";
import { formatDate, formatTime } from "../../utils/date";
import { CorrectStatusDialog } from "./CorrectStatusDialog";
import { useUpdateAppointmentStatus } from "./useAppointments";

type Dialog = { kind: "cancel" } | { kind: "correct"; to: AppointmentStatus } | null;

// The status as a button with a menu of the changes the rules allow (decisions ah, am).
// Workflow changes save at once; cancelling asks first; a correction asks for a reason.
export function StatusMenu({ appointment }: { appointment: Appointment }) {
  const update = useUpdateAppointmentStatus(appointment.id);
  const [dialog, setDialog] = useState<Dialog>(null);

  const targets = statusTargets(appointment);
  const name = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const when = `${formatDate(appointment.startTime)} at ${formatTime(appointment.startTime)}`;

  // Nothing the user may change: just the status.
  if (targets.length === 0) return <StatusBadge status={appointment.status} />;

  function choose(to: AppointmentStatus) {
    update.reset();
    if (isCorrection(appointment.status, to)) setDialog({ kind: "correct", to });
    else if (to === "CANCELLED") setDialog({ kind: "cancel" });
    else update.mutate({ status: to });
  }

  function close() {
    setDialog(null);
    update.reset();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Menu>
        <MenuButton
          disabled={update.isPending}
          // Contains the visible status (WCAG 2.5.3) and the patient, so rows can be told apart.
          aria-label={`Change status for ${name}, now ${STATUS_LABELS[appointment.status]}`}
          className="inline-flex items-center gap-1 rounded-full disabled:opacity-50"
        >
          <StatusBadge status={appointment.status} />
          <ChevronDown aria-hidden="true" className="size-3.5 text-muted" />
        </MenuButton>
        <MenuItems
          anchor="bottom end"
          className="z-50 min-w-36 rounded-lg border bg-surface p-1 shadow-pop [--anchor-gap:4px] focus:outline-none"
        >
          {targets.map((to) => (
            <MenuItem key={to}>
              <button
                type="button"
                onClick={() => choose(to)}
                className="block w-full rounded-md px-3 py-1.5 text-start text-sm text-ink data-focus:bg-subtle"
              >
                {STATUS_LABELS[to]}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      {update.isError && !dialog && (
        <p role="alert" className="text-xs text-danger">
          {update.error.message}
        </p>
      )}

      {dialog?.kind === "cancel" && (
        <ConfirmDialog
          title="Cancel appointment"
          message={`Cancel the appointment with ${name} on ${when}? The time will be free for other bookings. It can be restored later with a reason, if the time is still free.`}
          confirmLabel="Cancel appointment"
          cancelLabel="Keep appointment"
          pendingLabel="Saving..."
          isPending={update.isPending}
          error={update.isError ? update.error.message : null}
          onConfirm={() => update.mutate({ status: "CANCELLED" }, { onSuccess: close })}
          onCancel={close}
        />
      )}

      {dialog?.kind === "correct" && (
        <CorrectStatusDialog
          appointment={appointment}
          defaultStatus={dialog.to}
          onClose={close}
          onDone={close}
        />
      )}
    </div>
  );
}
