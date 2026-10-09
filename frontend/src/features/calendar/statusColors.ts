import type { AppointmentStatus } from "../../types/appointment";

export const statusBorderColors: Record<AppointmentStatus, string> = {
  SCHEDULED: "border-l-blue-500 bg-blue-50",
  CONFIRMED: "border-l-green-500 bg-green-50",
  COMPLETED: "border-l-gray-400 bg-gray-50",
  CANCELLED: "border-l-red-400 bg-red-50 opacity-60",
  NO_SHOW: "border-l-yellow-500 bg-yellow-50",
};
