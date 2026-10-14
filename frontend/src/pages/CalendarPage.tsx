import { useState } from "react";
import { useAppointments } from "../features/appointments/useAppointments";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { DayView } from "../features/calendar/DayView";
import { AppointmentForm } from "../features/appointments/AppointmentForm";
import { AppointmentDetail } from "../features/appointments/AppointmentDetail";
import { Modal } from "../components/Modal";
import { ErrorMessage, LoadingMessage } from "../components/Feedback";
import { addDays, isSameDay, toDateString } from "../utils/date";
import type { Appointment } from "../types/appointment";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const {
    data: appointments,
    isLoading,
    isError,
    refetch,
  } = useAppointments(toDateString(currentDate));

  return (
    <div className="flex flex-col gap-4">
      <CalendarToolbar
        date={currentDate}
        isToday={isSameDay(currentDate, new Date())}
        onPrevDay={() => setCurrentDate((d) => addDays(d, -1))}
        onNextDay={() => setCurrentDate((d) => addDays(d, 1))}
        onToday={() => setCurrentDate(new Date())}
        onNewAppointment={() => setIsFormOpen(true)}
      />

      {isLoading && <LoadingMessage>Loading appointments...</LoadingMessage>}

      {isError && (
        <ErrorMessage
          message="Could not load appointments for this day."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <DayView
          appointments={appointments ?? []}
          onAppointmentClick={(appointment) => setSelectedAppointment(appointment)}
        />
      )}

      {isFormOpen && (
        <Modal title="New appointment" onClose={() => setIsFormOpen(false)}>
          <AppointmentForm
            defaultDate={currentDate}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </Modal>
      )}

      {selectedAppointment && (
        <Modal title="Appointment" onClose={() => setSelectedAppointment(null)}>
          <AppointmentDetail
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
          />
        </Modal>
      )}
    </div>
  );
}
