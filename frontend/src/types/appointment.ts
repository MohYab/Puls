export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  bookingComment: string | null;
  createdAt: string;
  updatedAt: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  appointmentType: {
    name: string;
    duration: number;
  };
}
