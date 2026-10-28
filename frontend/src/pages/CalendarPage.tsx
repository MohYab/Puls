import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/Button";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { AppointmentDetail } from "../features/appointments/AppointmentDetail";
import { AppointmentForm } from "../features/appointments/AppointmentForm";
import { useAppointments } from "../features/appointments/useAppointments";
import { useAuth } from "../features/auth/useAuth";
import { AppointmentPanel } from "../features/calendar/AppointmentPanel";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { DayView } from "../features/calendar/DayView";
import { DoctorSelect } from "../features/calendar/DoctorSelect";
import { useDoctors } from "../features/doctors/useDoctors";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePageTitle } from "../hooks/usePageTitle";
import { addDays, isSameDay, toDateString } from "../utils/date";

// From this width the details sit next to the calendar; below it they open in a modal.
const PANEL_QUERY = "(min-width: 1280px)";

export default function CalendarPage() {
  usePageTitle("Calendar");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const hasPanel = useMediaQuery(PANEL_QUERY);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [chosenDoctorId, setChosenDoctorId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  // Looked up in the list, so the details update when the list is refetched (e.g. after a status change).
  const selectedAppointment = appointments?.find((a) => a.id === selectedId) ?? null;

  function changeDate(update: (date: Date) => Date) {
    setCurrentDate(update);
    setSelectedId(null);
  }

  function changeDoctor(id: string) {
    setChosenDoctorId(id);
    setSelectedId(null);
  }

  const closeDetails = () => setSelectedId(null);

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
        onPrevDay={() => changeDate((d) => addDays(d, -1))}
        onNextDay={() => changeDate((d) => addDays(d, 1))}
        onToday={() => changeDate(() => new Date())}
      >
        {isAdmin && doctorsQuery.data && doctorsQuery.data.length > 0 && (
          <DoctorSelect doctors={doctorsQuery.data} value={doctorId ?? ""} onChange={changeDoctor} />
        )}
      </CalendarToolbar>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
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
                  selectedId={selectedId}
                  onAppointmentClick={(appointment) => setSelectedId(appointment.id)}
                />
              )}
            </>
          )}
        </div>

        {hasPanel && <AppointmentPanel appointment={selectedAppointment} onClose={closeDetails} />}
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

      {!hasPanel && selectedAppointment && (
        <Modal title="Appointment" onClose={closeDetails}>
          <AppointmentDetail appointment={selectedAppointment} onClose={closeDetails} />
        </Modal>
      )}
    </div>
  );
}