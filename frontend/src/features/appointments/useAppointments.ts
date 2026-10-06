import { useQuery } from "@tanstack/react-query";
import { getAppointments } from "./appointmentService";

export function useAppointments(date?: string) {
  return useQuery({
    queryKey: ["appointments", date],
    queryFn: () => getAppointments(date),
  });
}
