import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { inputClassName } from "../components/formStyles";
import { Modal } from "../components/Modal";
import { PatientForm } from "../features/patients/PatientForm";
import { usePatients } from "../features/patients/usePatients";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import { formatBirthDate } from "../utils/date";

export default function PatientsPage() {
  usePageTitle("Patients");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const {
    data: patients,
    isPending,
    isError,
    error,
    refetch,
  } = usePatients(debouncedSearch, {
    includeInactive: showInactive,
  });

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-600">Search by name to find a patient.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto"
        >
          + New patient
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="w-full max-w-md">
          <label htmlFor="patient-search" className="sr-only">
            Search patients by name
          </label>
          <input
            id="patient-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            className={inputClassName}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive patients
        </label>
      </div>

      <div className="mt-6" aria-live="polite">
        {isPending && <LoadingMessage>Loading patients...</LoadingMessage>}

        {isError && <ErrorMessage message={error.message} onRetry={() => refetch()} />}

        {patients && patients.length === 0 && (
          <EmptyMessage>
            {debouncedSearch
              ? `No patients match "${debouncedSearch}".`
              : "There are no patients yet."}
          </EmptyMessage>
        )}

        {patients && patients.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date of birth
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className={patient.isActive ? "hover:bg-gray-50" : "text-gray-500"}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                      {!patient.isActive && (
                        <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatBirthDate(patient.dateOfBirth)}</td>
                    <td className="px-4 py-3">{patient.phone ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <Modal title="New patient" onClose={() => setIsFormOpen(false)}>
          <PatientForm
            patient={null}
            onSuccess={(created) => navigate(`/patients/${created.id}`)}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
