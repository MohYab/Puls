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
  doctor: {
    user: { name: string };
  };
  /** Only sent to doctors (decision #56). Missing for admins and in create/update responses. */
  hasNote?: boolean;
}

// Shape returned by GET /api/patients/:id/appointments (patient history).
export interface PatientAppointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  doctor: {
    id: string;
    user: { name: string };
  };
  appointmentType: {
    id: string;
    name: string;
  };
}
