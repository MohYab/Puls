import { useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyMessage, ErrorMessage, LoadingMessage, SuccessMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { DoctorForm } from "../features/doctors/DoctorForm";
import { useAdminDoctors, useSetDoctorActive } from "../features/doctors/useDoctors";
import { usePageTitle } from "../hooks/usePageTitle";
import { ApiError } from "../services/apiClient";
import type { Doctor } from "../types/doctor";
import { Button } from "../components/Button";
import { Plus, Badge } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { PageHeader } from "../components/PageHeader";
import { tableWrapperClassName, headRowClassName, cellClassName } from "../components/tableStyles";

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
      <PageHeader
        title="Doctors"
        description="Doctors are never deleted. An inactive doctor cannot log in or be booked; their notes and appointments are kept."
        actions={
          <Button
            onClick={() => {
              setNotice(null);
              setFormTarget("new");
            }}
          >
            <Plus aria-hidden="true" className="size-4" />
            New doctor
          </Button>
        }
      />

      {notice && (
        <div className="mb-4">
          <SuccessMessage>{notice}</SuccessMessage>
        </div>
      )}

      <div aria-live="polite">
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
          <div className={tableWrapperClassName}>
            <table className="w-full text-sm">
              <thead>
                <tr className={headRowClassName}>
                  <th scope="col" className={`${cellClassName} text-start`}>
                    Name
                  </th>
                  <th scope="col" className={`${cellClassName} text-start`}>
                    Email
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
                {doctors.map((doctor) => {
                  const { name, email, isActive } = doctor.user;
                  return (
                    <tr key={doctor.id} className="hover:bg-subtle">
                      <td className={cellClassName}>
                        <span className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <span className="min-w-0">
                            <span
                              className={`block font-semibold ${isActive ? "text-ink" : "text-muted"}`}
                            >
                              {name}
                            </span>
                            {doctor.specialization && (
                              <span className="block text-xs text-muted">
                                {doctor.specialization}
                              </span>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className={`${cellClassName} break-all`}>{email}</td>
                      <td className={cellClassName}>
                        {/* In words, not colour alone. */}
                        {isActive ? (
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
                            onClick={() => {
                              setNotice(null);
                              setFormTarget(doctor);
                            }}
                            aria-label={`Edit ${name}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant={isActive ? "outlineDanger" : "secondary"}
                            size="sm"
                            onClick={() => {
                              setNotice(null);
                              if (isActive) setToDeactivate(doctor);
                              else activate(doctor);
                            }}
                            isPending={isRowPending(doctor.id)}
                            aria-label={`${isActive ? "Deactivate" : "Activate"} ${name}`}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
