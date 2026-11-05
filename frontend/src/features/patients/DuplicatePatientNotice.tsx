import { Link } from "react-router-dom";
import { TriangleAlert } from "lucide-react";
import { formatBirthDate } from "../../utils/date";
import { usePatients } from "./usePatients";

interface DuplicatePatientNoticeProps {
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD, as sent in the form. */
  dateOfBirth: string;
  /** The patient being edited, who is not their own duplicate. */
  excludeId?: string;
  /** Closes the dialog before the link navigates. */
  onOpen: () => void;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

// Shown on 409 PATIENT_EXISTS. Two records for one person is a patient safety risk,
// so the duplicate cannot be accepted here: the user opens the existing patient.
export function DuplicatePatientNotice({
  firstName,
  lastName,
  dateOfBirth,
  excludeId,
  onOpen,
}: DuplicatePatientNoticeProps) {
  // Mounted only after a 409, so the search only runs then.
  const { data } = usePatients(`${firstName} ${lastName}`.trim(), { includeInactive: true });
  const existing = data?.find(
    (p) =>
      p.id !== excludeId &&
      same(p.firstName, firstName) &&
      same(p.lastName, lastName) &&
      formatBirthDate(p.dateOfBirth) === dateOfBirth
  );

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-2">
        <p>
          <strong>A patient with the same name and date of birth already exists:</strong>
        </p>
        {existing && (
          <Link
            to={`/patients/${existing.id}`}
            onClick={onOpen}
            className="self-start font-semibold text-accent hover:underline"
          >
            {existing.firstName} {existing.lastName} · {formatBirthDate(existing.dateOfBirth)}
            {!existing.isActive && " (inactive)"}
          </Link>
        )}
      </div>
    </div>
  );
}
