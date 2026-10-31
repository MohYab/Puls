import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { StateMessage } from "../components/StateMessage";
import { useAuth } from "../features/auth/useAuth";
import { PreviousNotes } from "../features/notes/PreviousNotes";
import { AppointmentHistory } from "../features/patients/AppointmentHistory";
import { DeactivatePatientDialog } from "../features/patients/DeactivatePatientDialog";
import { PatientForm } from "../features/patients/PatientForm";
import { PatientHeader } from "../features/patients/PatientHeader";
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

  function openDialog(next: "edit" | "deactivate") {
    setNotice(null);
    setDialog(next);
  }

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
      <Link
        to="/patients"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        Back to patients
      </Link>

      {isPending && <LoadingMessage>Loading patient...</LoadingMessage>}

      {isNotFound && (
        <StateMessage
          title="Patient not found"
          text="The patient you are looking for does not exist."
        />
      )}

      {isError && !isNotFound && <ErrorMessage message={error.message} onRetry={() => refetch()} />}

      {patient && (
        <>
          <PatientHeader
            patient={patient}
            actions={
              <>
                <Button variant="secondary" onClick={() => openDialog("edit")}>
                  Edit
                </Button>
                {isAdmin &&
                  (patient.isActive ? (
                    <Button variant="secondary" onClick={() => openDialog("deactivate")}>
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={handleReactivate}
                      isPending={reactivate.isPending}
                      pendingText="Reactivating..."
                    >
                      Reactivate
                    </Button>
                  ))}
              </>
            }
          />

          {notice && (
            <p
              role="status"
              className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900"
            >
              {notice}
            </p>
          )}
          {reactivate.isError && (
            <div className="mb-6">
              <ErrorMessage message={reactivate.error.message} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <AppointmentHistory patientId={patient.id} />
            {user?.role === "DOCTOR" ? (
              <PreviousNotes patientId={patient.id} />
            ) : (
              <Card title="Clinical notes">
                <p className="text-sm text-muted">Clinical notes are only visible to doctors.</p>
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
