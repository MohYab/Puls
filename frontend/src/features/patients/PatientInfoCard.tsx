import { Card } from "../../components/Card";
import { formatBirthDate, formatDate } from "../../utils/date";
import { PATIENT_DEACTIVATION_LABELS } from "./patientLabels";
import type { PatientDetail } from "../../types/patient";

export function PatientInfoCard({ patient }: { patient: PatientDetail }) {
  return (
    <Card title="Patient information">
      <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-sm">
        <dt className="text-gray-500">Name</dt>
        <dd className="text-gray-900">
          {patient.firstName} {patient.lastName}
        </dd>

        <dt className="text-gray-500">Date of birth</dt>
        <dd className="text-gray-900">{formatBirthDate(patient.dateOfBirth)}</dd>

        <dt className="text-gray-500">Phone</dt>
        <dd className="text-gray-900">{patient.phone ?? "–"}</dd>

        <dt className="text-gray-500">Email</dt>
        <dd className="break-all text-gray-900">{patient.email ?? "–"}</dd>

        {!patient.isActive && (
          <>
            <dt className="text-gray-500">Status</dt>
            <dd className="text-gray-900">
              Inactive
              {patient.deactivationReason &&
                ` (${PATIENT_DEACTIVATION_LABELS[patient.deactivationReason].toLowerCase()})`}
              {patient.deactivatedAt && ` since ${formatDate(patient.deactivatedAt)}`}
            </dd>
          </>
        )}
      </dl>
    </Card>
  );
}
