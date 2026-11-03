import type { Patient } from "../../types/patient";
import type { SearchOption } from "../../utils/searchOptions";

/** Name plus date of birth, so two patients with the same name can be told apart. */
export function toPatientOption(patient: Patient): SearchOption {
  return {
    value: patient.id,
    label: `${patient.firstName} ${patient.lastName}`,
    description: `Born ${patient.dateOfBirth.slice(0, 10)}`,
  };
}
