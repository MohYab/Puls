import { Link, useParams } from "react-router-dom";
import { AppointmentHistory } from "../features/patients/AppointmentHistory";
import { PatientInfoCard } from "../features/patients/PatientInfoCard";
import { usePatient } from "../features/patients/usePatients";
import { ApiError } from "../services/apiClient";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isPending, isError, error, refetch } = usePatient(id);

  const isNotFound = isError && error instanceof ApiError && error.status === 404;

  return (
    <div>
      <Link to="/patients" className="text-sm text-blue-700 hover:underline">
        ← Back to patients
      </Link>

      {isPending && <p className="mt-6 text-sm text-gray-600">Loading patient...</p>}

      {isNotFound && (
        <div className="mt-6">
          <h1 className="text-2xl font-semibold text-gray-900">Patient not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            The patient you are looking for does not exist.
          </p>
        </div>
      )}

      {isError && !isNotFound && (
        <div role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error instanceof Error ? error.message : "Could not load patient."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {patient && (
        <>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h1>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <PatientInfoCard patient={patient} />
            </div>
            <div className="lg:col-span-2">
              <AppointmentHistory patientId={patient.id} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
