import { useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { AppointmentTypeForm } from "../features/appointmentTypes/AppointmentTypeForm";
import {
  useAdminAppointmentTypes,
  useSetAppointmentTypeActive,
} from "../features/appointmentTypes/useAppointmentTypes";
import type { AppointmentType } from "../types/appointmentType";
import { usePageTitle } from "../hooks/usePageTitle";
import { PageHeader } from "../components/PageHeader";
import { Badge, Plus } from "lucide-react";
import { cellClassName, headRowClassName, tableWrapperClassName } from "../components/tableStyles";
import { Button } from "../components/Button";

type FormTarget = AppointmentType | "new" | null;

export default function AppointmentTypesPage() {
  usePageTitle("Appointment types");
  const { data: types, isPending, isError, error, refetch } = useAdminAppointmentTypes();
  const setActive = useSetAppointmentTypeActive();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [toDeactivate, setToDeactivate] = useState<AppointmentType | null>(null);

  function closeDeactivateDialog() {
    setToDeactivate(null);
    setActive.reset();
  }

  function confirmDeactivate() {
    if (!toDeactivate) return;
    setActive.mutate(
      { id: toDeactivate.id, isActive: false },
      { onSuccess: () => setToDeactivate(null) }
    );
  }

  function activate(type: AppointmentType) {
    setActive.mutate({ id: type.id, isActive: true });
  }

  const isRowPending = (id: string) => setActive.isPending && setActive.variables?.id === id;

  return (
    <div>
      <PageHeader
        title="Appointment types"
        description="Types used when booking. Inactive types cannot be booked; existing appointments are not affected."
        actions={
          <Button onClick={() => setFormTarget("new")}>
            <Plus aria-hidden="true" className="size-4" />
            New type
          </Button>
        }
      />

      <div aria-live="polite">
        {isPending && <LoadingMessage>Loading appointment types...</LoadingMessage>}

        {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}

        {/* Errors from "Activate" (deactivation errors are shown in the dialog). */}
        {setActive.isError && !toDeactivate && (
          <div className="mb-4">
            <ErrorMessage message={setActive.error.message} />
          </div>
        )}

        {types && types.length === 0 && (
          <EmptyMessage>There are no appointment types yet.</EmptyMessage>
        )}

        {types && types.length > 0 && (
          <div className={tableWrapperClassName}>
            <table className="w-full text-sm">
              <thead>
                <tr className={headRowClassName}>
                  <th scope="col" className={`${cellClassName} text-start`}>
                    Name
                  </th>
                  <th scope="col" className={`${cellClassName} text-start`}>
                    Duration
                  </th>
                  <th scope="col" className={`${cellClassName} text-start`}>
                    Status
                  </th>
                  <th scope="col" className={cellClassName}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {types.map((type) => (
                  <tr key={type.id} className="hover:bg-subtle">
                    <td className={cellClassName}>
                      <span
                        className={`block font-semibold ${type.isActive ? "text-ink" : "text-muted"}`}
                      >
                        {type.name}
                      </span>
                      {type.description && (
                        <span className="block text-xs text-muted">{type.description}</span>
                      )}
                    </td>
                    <td className={`${cellClassName} whitespace-nowrap tabular-nums`}>
                      {type.duration} min
                    </td>
                    <td className={cellClassName}>
                      {type.isActive ? (
                        <span className="text-ink">Active</span>
                      ) : (
                        <Badge>Inactive</Badge>
                      )}
                    </td>
                    <td className={`${cellClassName} whitespace-nowrap text-end`}>
                      <span className="inline-flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormTarget(type)}
                          aria-label={`Edit ${type.name}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant={type.isActive ? "outlineDanger" : "secondary"}
                          size="sm"
                          onClick={() => (type.isActive ? setToDeactivate(type) : activate(type))}
                          isPending={isRowPending(type.id)}
                          aria-label={`${type.isActive ? "Deactivate" : "Activate"} ${type.name}`}
                        >
                          {type.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formTarget && (
        <Modal
          title={formTarget === "new" ? "New appointment type" : "Edit appointment type"}
          onClose={() => setFormTarget(null)}
        >
          <AppointmentTypeForm
            appointmentType={formTarget === "new" ? null : formTarget}
            onSuccess={() => setFormTarget(null)}
            onCancel={() => setFormTarget(null)}
          />
        </Modal>
      )}

      {toDeactivate && (
        <ConfirmDialog
          title="Deactivate appointment type"
          message={`"${toDeactivate.name}" will no longer be available for new bookings. Existing appointments are not affected, and you can activate it again later.`}
          confirmLabel="Deactivate"
          cancelLabel="Keep active"
          pendingLabel="Deactivating..."
          isPending={setActive.isPending}
          error={setActive.isError ? setActive.error.message : null}
          onConfirm={confirmDeactivate}
          onCancel={closeDeactivateDialog}
        />
      )}
    </div>
  );
}
