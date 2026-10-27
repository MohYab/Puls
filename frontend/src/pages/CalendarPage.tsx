import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { useAppointments } from "../features/appointments/useAppointments";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { DayView } from "../features/calendar/DayView";
import { DoctorSelect } from "../features/calendar/DoctorSelect";
import { AppointmentForm } from "../features/appointments/AppointmentForm";
import { AppointmentDetail } from "../features/appointments/AppointmentDetail";
import { useAuth } from "../features/auth/useAuth";
import { useDoctors } from "../features/doctors/useDoctors";
import { Modal } from "../components/Modal";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { addDays, isSameDay, toDateString } from "../utils/date";
import type { Appointment } from "../types/appointment";
import { usePageTitle } from "../hooks/usePageTitle";

export default function CalendarPage() {
  usePageTitle("Calendar");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [chosenDoctorId, setChosenDoctorId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const doctorsQuery = useDoctors(isAdmin);

  // Admins see one doctor at a time (one column, no overlapping blocks).
  // Until they choose, the first doctor in alphabetical order is shown.
  const doctorId = isAdmin ? (chosenDoctorId ?? doctorsQuery.data?.[0]?.id) : undefined;
  const canLoadAppointments = !isAdmin || doctorId !== undefined;

  const {
    data: appointments,
    isLoading,
    isError,
    refetch,
  } = useAppointments(toDateString(currentDate), { doctorId, enabled: canLoadAppointments });

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Calendar"
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus aria-hidden="true" className="size-4" />
            Book appointment
          </Button>
        }
      />

      <CalendarToolbar
        date={currentDate}
        isToday={isSameDay(currentDate, new Date())}
        onPrevDay={() => setCurrentDate((d) => addDays(d, -1))}
        onNextDay={() => setCurrentDate((d) => addDays(d, 1))}
        onToday={() => setCurrentDate(new Date())}
      >
        {isAdmin && doctorsQuery.data && doctorsQuery.data.length > 0 && (
          <DoctorSelect
            doctors={doctorsQuery.data}
            value={doctorId ?? ""}
            onChange={setChosenDoctorId}
          />
        )}
      </CalendarToolbar>

      <div className="flex flex-col gap-4">
        {isAdmin && doctorsQuery.isPending && <LoadingMessage>Loading doctors...</LoadingMessage>}

        {isAdmin && doctorsQuery.isError && (
          <ErrorMessage
            message="Could not load the list of doctors."
            onRetry={() => doctorsQuery.refetch()}
          />
        )}

        {isAdmin && doctorsQuery.data?.length === 0 && (
          <EmptyMessage>There are no doctors yet.</EmptyMessage>
        )}

        {canLoadAppointments && (
          <>
            {isLoading && <LoadingMessage>Loading appointments...</LoadingMessage>}

            {isError && (
              <ErrorMessage
                message="Could not load appointments for this day."
                onRetry={() => refetch()}
              />
            )}

            {!isLoading && !isError && (
              <DayView
                date={currentDate}
                appointments={appointments ?? []}
                onAppointmentClick={(appointment) => setSelectedAppointment(appointment)}
              />
            )}
          </>
        )}
      </div>

      {isFormOpen && (
        <Modal title="Book appointment" onClose={() => setIsFormOpen(false)}>
          <AppointmentForm
            defaultDate={currentDate}
            defaultDoctorId={doctorId}
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
