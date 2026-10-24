import { useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { DoctorForm } from "../features/doctors/DoctorForm";
import { useAdminDoctors, useSetDoctorActive } from "../features/doctors/useDoctors";
import { usePageTitle } from "../hooks/usePageTitle";
import { ApiError } from "../services/apiClient";
import type { Doctor } from "../types/doctor";

type FormTarget = Doctor | "new" | null;

export default function DoctorsPage() {
  usePageTitle("Doctors");
  const { data: doctors, isPending, isError, error, refetch } = useAdminDoctors();
  const setActive = useSetDoctorActive();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [toDeactivate, setToDeactivate] = useState<Doctor | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function closeDeactivateDialog() {
    setToDeactivate(null);
    setActive.reset();
  }

  function confirmDeactivate() {
    if (!toDeactivate) return;
    const name = toDeactivate.user.name;
    setActive.mutate(
      { id: toDeactivate.id, isActive: false },
      {
        onSuccess: () => {
          setToDeactivate(null);
          setNotice(`${name} was deactivated and can no longer log in.`);
        },
      }
    );
  }

  function activate(doctor: Doctor) {
    setNotice(null);
    setActive.mutate(
      { id: doctor.id, isActive: true },
      { onSuccess: () => setNotice(`${doctor.user.name} was activated and can log in again.`) }
    );
  }

  // The API explains what is blocking; add where to fix it.
  function deactivateErrorMessage(): string | null {
    if (!setActive.isError) return null;
    const message = setActive.error.message;
    if (setActive.error instanceof ApiError && setActive.error.code === "DOCTOR_HAS_APPOINTMENTS") {
      return `${message} Choose the doctor in the calendar to find the appointments.`;
    }
    return message;
  }

  const isRowPending = (id: string) => setActive.isPending && setActive.variables?.id === id;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Doctors</h1>
          <p className="mt-1 text-sm text-gray-600">
            Doctors are never deleted. An inactive doctor cannot log in or be booked; their notes
            and appointments are kept.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNotice(null);
            setFormTarget("new");
          }}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto"
        >
          + New doctor
        </button>
      </div>

      {notice && (
        <p
          role="status"
          className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900"
        >
          {notice}
        </p>
      )}

      <div className="mt-6" aria-live="polite">
        {isPending && <LoadingMessage>Loading doctors...</LoadingMessage>}

        {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}

        {/* Errors from "Activate" (deactivation errors are shown in the dialog). */}
        {setActive.isError && !toDeactivate && (
          <div className="mb-4">
            <ErrorMessage message={setActive.error.message} />
          </div>
        )}

        {doctors && doctors.length === 0 && <EmptyMessage>There are no doctors yet.</EmptyMessage>}

        {doctors && doctors.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Email
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
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className={doctor.user.isActive ? "" : "text-gray-500"}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{doctor.user.name}</div>
                      {doctor.specialization && (
                        <div className="text-xs text-gray-600">{doctor.specialization}</div>
                      )}
                    </td>
                    <td className="break-all px-4 py-3">{doctor.user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          doctor.user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {doctor.user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setNotice(null);
                          setFormTarget(doctor);
                        }}
                        aria-label={`Edit ${doctor.user.name}`}
                        className="text-blue-700 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotice(null);
                          if (doctor.user.isActive) {
                            setToDeactivate(doctor);
                          } else {
                            activate(doctor);
                          }
                        }}
                        disabled={isRowPending(doctor.id)}
                        aria-label={`${doctor.user.isActive ? "Deactivate" : "Activate"} ${doctor.user.name}`}
                        className="ml-4 text-blue-700 hover:underline disabled:opacity-50"
                      >
                        {isRowPending(doctor.id)
                          ? "Saving..."
                          : doctor.user.isActive
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
          title={formTarget === "new" ? "New doctor" : "Edit doctor"}
          onClose={() => setFormTarget(null)}
        >
          <DoctorForm
            doctor={formTarget === "new" ? null : formTarget}
            onSuccess={() => {
              setNotice(formTarget === "new" ? "Doctor created." : "Doctor details saved.");
              setFormTarget(null);
            }}
            onCancel={() => setFormTarget(null)}
          />
        </Modal>
      )}

      {toDeactivate && (
        <ConfirmDialog
          title="Deactivate doctor"
          message={`${toDeactivate.user.name} will no longer be able to log in or be booked. Their notes and earlier appointments are kept, and you can activate them again later.`}
          confirmLabel="Deactivate"
          cancelLabel="Keep active"
          pendingLabel="Deactivating..."
          isPending={setActive.isPending}
          error={deactivateErrorMessage()}
          onConfirm={confirmDeactivate}
          onCancel={closeDeactivateDialog}
        />
      )}
    </div>
  );
}
