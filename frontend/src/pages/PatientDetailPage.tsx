import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { StateMessage } from "../components/StateMessage";
import { useAuth } from "../features/auth/useAuth";
import { PreviousNotes } from "../features/notes/PreviousNotes";
import { AppointmentHistory } from "../features/patients/AppointmentHistory";
import { DeactivatePatientDialog } from "../features/patients/DeactivatePatientDialog";
import { PatientForm } from "../features/patients/PatientForm";
import { PatientInfoCard } from "../features/patients/PatientInfoCard";
import { usePatient, useSetPatientStatus } from "../features/patients/usePatients";
import { usePageTitle } from "../hooks/usePageTitle";
import { ApiError } from "../services/apiClient";
import type { PatientStatusResult } from "../types/patient";

function deactivationNotice({
  cancelledAppointments,
  appointmentsKeptWithNote,
}: PatientStatusResult) {
  const plural = (count: number) => (count === 1 ? "appointment was" : "appointments were");
  let text = "Patient deactivated.";
  text +=
    cancelledAppointments > 0
      ? ` ${cancelledAppointments} future ${plural(cancelledAppointments)} cancelled.`
      : " There were no future appointments to cancel.";
  if (appointmentsKeptWithNote > 0) {
    text += ` ${appointmentsKeptWithNote} future ${plural(appointmentsKeptWithNote)} kept because ${appointmentsKeptWithNote === 1 ? "it has" : "they have"} a clinical note; please review.`;
  }
  return text;
}

export default function PatientDetailPage() {
  usePageTitle("Patient");
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { data: patient, isPending, isError, error, refetch } = usePatient(id);
  const reactivate = useSetPatientStatus(id ?? "");
  const [dialog, setDialog] = useState<"edit" | "deactivate" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isNotFound = isError && error instanceof ApiError && error.status === 404;

  function handleReactivate() {
    setNotice(null);
    reactivate.mutate(
      { isActive: true },
      {
        onSuccess: () =>
          setNotice(
            "Patient reactivated. Cancelled appointments are not restored; book them again if needed."
          ),
      }
    );
  }

  return (
    <div>
      <Link to="/patients" className="text-sm text-blue-700 hover:underline">
        ← Back to patients
      </Link>

      {isPending && (
        <div className="mt-6">
          <LoadingMessage>Loading patient...</LoadingMessage>
        </div>
      )}

      {isNotFound && (
        <StateMessage
          title="Patient not found"
          text="The patient you are looking for does not exist."
        />
      )}

      {isError && !isNotFound && (
        <div className="mt-6">
          <ErrorMessage message={error.message} onRetry={() => refetch()} />
        </div>
      )}

      {patient && (
        <>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              {!patient.isActive && (
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setDialog("edit");
                }}
                className="rounded border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Edit
              </button>
              {isAdmin &&
                (patient.isActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setDialog("deactivate");
                    }}
                    className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleReactivate}
                    disabled={reactivate.isPending}
                    className="rounded border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {reactivate.isPending ? "Reactivating..." : "Reactivate"}
                  </button>
                ))}
            </div>
          </div>

          {notice && (
            <p
              role="status"
              className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900"
            >
              {notice}
            </p>
          )}
          {reactivate.isError && (
            <div className="mt-4">
              <ErrorMessage message={reactivate.error.message} />
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <PatientInfoCard patient={patient} />
            </div>
            <div className="lg:col-span-2">
              <AppointmentHistory patientId={patient.id} />
            </div>
          </div>

          <div className="mt-6">
            {user?.role === "DOCTOR" ? (
              <PreviousNotes patientId={patient.id} />
            ) : (
              <Card title="Documentation">
                <p className="text-sm text-gray-600">Clinical notes are only visible to doctors.</p>
              </Card>
            )}
          </div>

          {dialog === "edit" && (
            <Modal title="Edit patient" onClose={() => setDialog(null)}>
              <PatientForm
                patient={patient}
                onSuccess={() => {
                  setDialog(null);
                  setNotice("Patient details saved.");
                }}
                onCancel={() => setDialog(null)}
              />
            </Modal>
          )}

          {dialog === "deactivate" && (
            <DeactivatePatientDialog
              patient={patient}
              onClose={() => setDialog(null)}
              onDone={(result) => {
                setDialog(null);
                setNotice(deactivationNotice(result));
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
