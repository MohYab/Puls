import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { inputClassName } from "../components/formStyles";
import { usePatients } from "../features/patients/usePatients";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatBirthDate } from "../utils/date";
import { usePageTitle } from "../hooks/usePageTitle";

export default function PatientsPage() {
  usePageTitle("Patients");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data: patients, isPending, isError, error, refetch } = usePatients(debouncedSearch);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
      <p className="mt-1 text-sm text-gray-600">Search by name to find a patient.</p>

      <div className="mt-6">
        <label htmlFor="patient-search" className="sr-only">
          Search patients by name
        </label>
        <input
          id="patient-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className={`${inputClassName} max-w-md`}
        />
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
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatBirthDate(patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{patient.phone ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
