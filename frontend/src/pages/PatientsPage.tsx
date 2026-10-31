import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { Badge } from "../components/Badge";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { inputClassName } from "../components/formStyles";
import { PageHeader } from "../components/PageHeader";
import { AddPatientButton } from "../features/patients/AddPatientButton";
import { usePatients } from "../features/patients/usePatients";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePageTitle } from "../hooks/usePageTitle";
import { birthDateAndAge } from "../utils/date";

const cell = "px-4 py-3 md:px-5";

export default function PatientsPage() {
  usePageTitle("Patients");
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const {
    data: patients,
    isPending,
    isError,
    error,
    refetch,
  } = usePatients(debouncedSearch, { includeInactive: showInactive });

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Search by name to find a patient."
        actions={<AddPatientButton variant="primary" />}
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
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
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="size-4 accent-accent"
          />
          Show inactive patients
        </label>
      </div>

      {/* Screen readers hear when the results change. */}
      <div aria-live="polite">
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
          <div className="overflow-x-auto rounded-lg border bg-surface shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs font-semibold uppercase tracking-wide text-muted">
                  <th scope="col" className={`${cell} text-start`}>
                    Name
                  </th>
                  <th scope="col" className={`${cell} text-start`}>
                    Date of birth
                  </th>
                  <th scope="col" className={`${cell} text-start`}>
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patients.map((patient) => {
                  const name = `${patient.firstName} ${patient.lastName}`;
                  return (
                    <tr key={patient.id} className="hover:bg-subtle">
                      <td className={cell}>
                        <span className="flex items-center gap-3">
                          <Avatar name={name} size="sm" />
                          <Link
                            to={`/patients/${patient.id}`}
                            className={`font-semibold hover:underline ${patient.isActive ? "text-ink" : "text-muted"}`}
                          >
                            {name}
                          </Link>
                          {/* Not grey text alone: the badge says it in words. */}
                          {!patient.isActive && <Badge>Inactive</Badge>}
                        </span>
                      </td>
                      <td className={`${cell} whitespace-nowrap tabular-nums`}>
                        {birthDateAndAge(patient.dateOfBirth)}
                      </td>
                      <td className={`${cell} whitespace-nowrap tabular-nums`}>
                        {patient.phone ?? <span className="text-muted">–</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
