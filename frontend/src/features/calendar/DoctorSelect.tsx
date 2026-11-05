import { useId } from "react";
import { SearchSelect } from "../../components/SearchSelect";
import type { Doctor } from "../../types/doctor";
import { toDoctorOption } from "../doctors/doctorOptions";

interface DoctorSelectProps {
  doctors: Doctor[];
  value: string;
  onChange: (doctorId: string) => void;
}

// The calendar always shows one doctor, so the choice cannot be cleared:
// an empty field shows the selected doctor again when it closes.
export function DoctorSelect({ doctors, value, onChange }: DoctorSelectProps) {
  const id = useId();

  return (
    <div className="flex w-full items-start gap-2 sm:w-auto">
      <label htmlFor={id} className="mt-2.5 shrink-0 text-sm font-medium text-muted">
        Doctor
      </label>
      <div className="w-full sm:w-72">
        <SearchSelect
          id={id}
          options={doctors.map(toDoctorOption)}
          value={value}
          onChange={(doctorId) => {
            if (doctorId) onChange(doctorId);
          }}
          placeholder="Search doctor"
          noMatchLabel="No doctors match"
        />
      </div>
    </div>
  );
}
