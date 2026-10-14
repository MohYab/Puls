import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { StateMessage } from "../components/StateMessage";
import { useAuth } from "../features/auth/useAuth";
import { PreviousNotes } from "../features/notes/PreviousNotes";
import { AppointmentHistory } from "../features/patients/AppointmentHistory";
import { PatientInfoCard } from "../features/patients/PatientInfoCard";
import { usePatient } from "../features/patients/usePatients";
import { ApiError } from "../services/apiClient";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: patient, isPending, isError, error, refetch } = usePatient(id);

  const isNotFound = isError && error instanceof ApiError && error.status === 404;

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
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h1>

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
        </>
      )}
    </div>
  );
}
