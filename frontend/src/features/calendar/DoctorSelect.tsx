import { useId } from "react";
import { inputClassName } from "../../components/formStyles";
import type { Doctor } from "../../types/doctor";

interface DoctorSelectProps {
  doctors: Doctor[];
  value: string;
  onChange: (doctorId: string) => void;
}

export function DoctorSelect({ doctors, value, onChange }: DoctorSelectProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="shrink-0 text-sm text-gray-600">
        Doctor
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} sm:w-72`}
      >
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
