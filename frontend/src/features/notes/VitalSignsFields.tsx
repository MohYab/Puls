import { useId } from "react";
import type { FieldErrors, UseFormRegister, UseFormRegisterReturn } from "react-hook-form";
import { inputClassName } from "../../components/formStyles";
import { VITAL_LIMITS } from "../../config/vitals";
import type { NoteFormValues } from "../../schemas/noteSchemas";
import type { VitalKey } from "../../types/note";
import { SectionNumber } from "./SectionNumber";

const SINGLE_FIELDS: { key: Exclude<VitalKey, "systolic" | "diastolic">; label: string }[] = [
  { key: "heartRate", label: "Heart rate" },
  { key: "temperature", label: "Temperature" },
  { key: "oxygenSaturation", label: "SpO₂" },
  { key: "respiratoryRate", label: "Respiratory rate" },
  { key: "weight", label: "Weight" },
  { key: "height", label: "Height" },
];

interface VitalSignsFieldsProps {
  number: number;
  register: UseFormRegister<NoteFormValues>;
  errors: FieldErrors<NoteFormValues>;
}

export function VitalSignsFields({ number, register, errors }: VitalSignsFieldsProps) {
  const id = useId();
  const vitalErrors = errors.vitals;
  const bpError = vitalErrors?.systolic?.message ?? vitalErrors?.diastolic?.message;

  return (
    <div role="group" aria-labelledby={`${id}-heading`} className="flex gap-3">
      <SectionNumber number={number} />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 id={`${id}-heading`} className="text-sm font-semibold text-ink">
            Vital signs
          </h3>
          <p className="text-sm text-muted">
            Optional. Leave a field empty if it was not measured.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Two inputs, one measurement: a fieldset gives them a shared name. */}
          <fieldset className="sm:col-span-2 flex flex-col gap-1">
            <legend className="mb-1 text-sm font-medium text-ink">Blood pressure</legend>
            <div className="flex items-center gap-2">
              <UnitInput
                id={`${id}-systolic`}
                ariaLabel="Systolic, mmHg"
                registration={register("vitals.systolic")}
                invalid={Boolean(vitalErrors?.systolic)}
                errorId={`${id}-bp-error`}
              />
              <span aria-hidden="true" className="text-muted">
                /
              </span>
              <UnitInput
                id={`${id}-diastolic`}
                ariaLabel="Diastolic, mmHg"
                unit="mmHg"
                registration={register("vitals.diastolic")}
                invalid={Boolean(vitalErrors?.diastolic)}
                errorId={`${id}-bp-error`}
              />
            </div>
            {bpError && (
              <p id={`${id}-bp-error`} className="text-xs font-medium text-danger">
                {bpError}
              </p>
            )}
          </fieldset>

          {SINGLE_FIELDS.map(({ key, label }) => {
            const { unit, step } = VITAL_LIMITS[key];
            const error = vitalErrors?.[key]?.message;
            return (
              <div key={key} className="flex flex-col gap-1">
                <label htmlFor={`${id}-${key}`} className="text-sm font-medium text-ink">
                  {label}
                  {/* The unit is shown inside the field; screen readers get it here. */}
                  <span className="sr-only">, {unit}</span>
                </label>
                <UnitInput
                  id={`${id}-${key}`}
                  unit={unit}
                  decimal={step === 0.1}
                  registration={register(`vitals.${key}`)}
                  invalid={Boolean(error)}
                  errorId={`${id}-${key}-error`}
                />
                {error && (
                  <p id={`${id}-${key}-error`} className="text-xs font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface UnitInputProps {
  id: string;
  registration: UseFormRegisterReturn;
  invalid: boolean;
  errorId: string;
  unit?: string;
  decimal?: boolean;
  ariaLabel?: string;
}

function UnitInput({
  id,
  registration,
  invalid,
  errorId,
  unit,
  decimal = false,
  ariaLabel,
}: UnitInputProps) {
  return (
    <span className="relative flex flex-1 items-center">
      <input
        id={id}
        {...registration}
        type="text"
        inputMode={decimal ? "decimal" : "numeric"}
        autoComplete="off"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        className={`${inputClassName} tabular-nums ${unit ? "pe-14" : ""}`}
      />
      {unit && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-e-3 text-sm text-muted"
        >
          {unit}
        </span>
      )}
    </span>
  );
}
