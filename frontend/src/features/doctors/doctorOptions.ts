import type { Doctor } from "../../types/doctor";
import type { SearchOption } from "../../utils/searchOptions";

export function toDoctorOption(doctor: Doctor): SearchOption {
  return {
    value: doctor.id,
    label: doctor.user.name,
    description: doctor.specialization ?? undefined,
  };
}
