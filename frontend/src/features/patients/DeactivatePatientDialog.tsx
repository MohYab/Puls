import { useId, useState } from "react";
import { FormField } from "../../components/FormField";
import { inputClassName } from "../../components/formStyles";
import { Modal } from "../../components/Modal";
import type { Patient, PatientDeactivationReason, PatientStatusResult } from "../../types/patient";
import { PATIENT_DEACTIVATION_LABELS, PATIENT_DEACTIVATION_REASONS } from "./patientLabels";
import { useSetPatientStatus } from "./usePatients";
import { FormError } from "../../components/Feedback";
import { FormActions } from "../../components/FormActions";

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
        <p className="text-sm text-ink">
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

        <FormError message={setStatus.isError ? setStatus.error.message : null} />
        <FormActions
          variant="danger"
          submitLabel="Deactivate patient"
          pendingLabel="Deactivating..."
          cancelLabel="Back"
          isPending={setStatus.isPending}
          onCancel={onClose}
          onConfirm={deactivate}
        />
      </div>
    </Modal>
  );
}
