import { useState } from "react";
import { Link } from "react-router-dom";
import { usePatients } from "../features/patients/usePatients";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { formatBirthDate } from "../utils/date";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const { data: patients, isPending, isError, error, refetch } = usePatients(debouncedSearch);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Patients</h1>
      <p className="mt-1 text-sm text-slate-600">Search by name to find a patient.</p>

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
          className="w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
        />
      </div>

      <div className="mt-6" aria-live="polite">
        {isPending && <p className="text-sm text-slate-600">Loading patients...</p>}

        {isError && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">
              {error instanceof Error ? error.message : "Could not load patients."}
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

        {patients && patients.length === 0 && (
          <p className="text-sm text-slate-600">
            {debouncedSearch
              ? `No patients match "${debouncedSearch}".`
              : "There are no patients yet."}
          </p>
        )}

        {patients && patients.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
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
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {patient.firstName} {patient.lastName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatBirthDate(patient.dateOfBirth)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{patient.phone ?? "–"}</td>
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
