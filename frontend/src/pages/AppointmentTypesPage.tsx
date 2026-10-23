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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointment types</h1>
          <p className="mt-1 text-sm text-gray-600">
            Types used when booking. Inactive types cannot be booked; existing appointments are not
            affected.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormTarget("new")}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto"
        >
          + New type
        </button>
      </div>

      <div className="mt-6" aria-live="polite">
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
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Duration
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {types.map((type) => (
                  <tr key={type.id} className={type.isActive ? "" : "text-gray-500"}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{type.name}</div>
                      {type.description && (
                        <div className="text-xs text-gray-500">{type.description}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{type.duration} min</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          type.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {type.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setFormTarget(type)}
                        aria-label={`Edit ${type.name}`}
                        className="text-blue-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => (type.isActive ? setToDeactivate(type) : activate(type))}
                        disabled={isRowPending(type.id)}
                        aria-label={`${type.isActive ? "Deactivate" : "Activate"} ${type.name}`}
                        className="ml-4 text-blue-700 hover:underline disabled:opacity-50"
                      >
                        {isRowPending(type.id)
                          ? "Saving..."
                          : type.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
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
