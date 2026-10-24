import { useId, useState } from "react";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { Modal } from "../../components/Modal";
import type { Patient, PatientDeactivationReason, PatientStatusResult } from "../../types/patient";
import { PATIENT_DEACTIVATION_LABELS, PATIENT_DEACTIVATION_REASONS } from "./patientLabels";
import { useSetPatientStatus } from "./usePatients";

interface DeactivatePatientDialogProps {
  patient: Patient;
  onClose: () => void;
  onDone: (result: PatientStatusResult) => void;
}

function isReason(value: string): value is PatientDeactivationReason {
  return (PATIENT_DEACTIVATION_REASONS as readonly string[]).includes(value);
}

export function DeactivatePatientDialog({
  patient,
  onClose,
  onDone,
}: DeactivatePatientDialogProps) {
  const formId = useId();
  const setStatus = useSetPatientStatus(patient.id);
  const [reason, setReason] = useState<PatientDeactivationReason | "">("");
  const [submitted, setSubmitted] = useState(false);

  function deactivate() {
    setSubmitted(true);
    if (!reason) return;
    setStatus.mutate({ isActive: false, reason }, { onSuccess: onDone });
  }

  return (
    <Modal title="Deactivate patient" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-700">
          {patient.firstName} {patient.lastName} will no longer appear in the patient list and
          cannot be booked. Future appointments are cancelled. Earlier appointments and clinical
          notes are kept.
        </p>

        <FormField
          id={`${formId}-reason`}
          label="Reason"
          error={submitted && !reason ? "Choose a reason" : undefined}
        >
          {(field) => (
            <select
              {...field}
              value={reason}
              onChange={(e) => setReason(isReason(e.target.value) ? e.target.value : "")}
              className={inputClassName}
            >
              <option value="">Select reason</option>
              {PATIENT_DEACTIVATION_REASONS.map((value) => (
                <option key={value} value={value}>
                  {PATIENT_DEACTIVATION_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </FormField>

        {setStatus.isError && (
          <p role="alert" className="text-sm text-red-600">
            {setStatus.error.message}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={setStatus.isPending}
            className="rounded border px-4 py-2 text-sm disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={deactivate}
            disabled={setStatus.isPending}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {setStatus.isPending ? "Deactivating..." : "Deactivate patient"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
