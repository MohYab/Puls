import { useState } from "react";
import { useAppointments } from "../features/appointments/useAppointments";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { DayView } from "../features/calendar/DayView";
import { AppointmentForm } from "../features/appointments/AppointmentForm";
import { AppointmentDetail } from "../features/appointments/AppointmentDetail";
import { Modal } from "../components/Modal";
import { toDateString } from "../utils/date";
import type { Appointment } from "../types/appointment";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { data: appointments, isLoading } = useAppointments(toDateString(currentDate));

  function handlePrevDay() {
    setCurrentDate((d) => new Date(d.getTime() - 24 * 60 * 60 * 1000));
  }

  function handleNextDay() {
    setCurrentDate((d) => new Date(d.getTime() + 24 * 60 * 60 * 1000));
  }

  return (
    <div className="flex flex-col gap-4">
      <CalendarToolbar
        date={currentDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onNewAppointment={() => setIsFormOpen(true)}
      />

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
      {!isLoading && (
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
