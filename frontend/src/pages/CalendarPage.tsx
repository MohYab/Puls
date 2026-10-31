import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/Button";
import { EmptyMessage, ErrorMessage, LoadingMessage } from "../components/Feedback";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { AppointmentDetail } from "../features/appointments/AppointmentDetail";
import { AppointmentForm } from "../features/appointments/AppointmentForm";
import { useAppointmentsInRange } from "../features/appointments/useAppointments";
import { useAuth } from "../features/auth/useAuth";
import { AppointmentPanel } from "../features/calendar/AppointmentPanel";
import { CalendarToolbar } from "../features/calendar/CalendarToolbar";
import { DayView } from "../features/calendar/DayView";
import { DoctorSelect } from "../features/calendar/DoctorSelect";
import { ViewSwitch } from "../features/calendar/ViewSwitch";
import { WeekView } from "../features/calendar/WeekView";
import type { CalendarView } from "../features/calendar/constants";
import { useDoctors } from "../features/doctors/useDoctors";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  addDays,
  formatLongDate,
  formatWeekRange,
  isSameDay,
  startOfWeek,
  toDateString,
} from "../utils/date";
import { useSearchParams } from "react-router-dom";

// From this width the details sit next to the calendar; below it they open in a modal.
const PANEL_QUERY = "(min-width: 1280px)";
// The week view needs room for seven columns; phones always get the day view.
const WEEK_QUERY = "(min-width: 768px)";

/** Gives focus back to the block that opened the details, so keyboard users keep their place. */
function focusAppointmentBlock(container: HTMLElement | null, appointmentId: string) {
  const blocks = container?.querySelectorAll<HTMLElement>("[data-appointment-id]") ?? [];
  Array.from(blocks)
    .find((block) => block.dataset.appointmentId === appointmentId)
    ?.focus();
}

export default function CalendarPage() {
  usePageTitle("Calendar");
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const hasPanel = useMediaQuery(PANEL_QUERY);
  const canShowWeek = useMediaQuery(WEEK_QUERY);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("day");
  // ?doctor=<id> opens a doctor's calendar directly (the admin dashboard links here).
  const [searchParams, setSearchParams] = useSearchParams();
  const [chosenDoctorId, setChosenDoctorId] = useState<string | null>(() =>
    searchParams.get("doctor")
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The chosen view is kept when the window shrinks, and comes back when it grows.
  const isWeek = canShowWeek && view === "week";
  const weekStart = startOfWeek(currentDate);
  const days = isWeek ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)) : [currentDate];

  const doctorsQuery = useDoctors(isAdmin);

  // Admins see one doctor at a time (one column, no overlapping blocks).
  // Until they choose, the first doctor in alphabetical order is shown.
  // An id that is not an active doctor (e.g. from an old link) falls back to the first one.
  const chosenIsListed = doctorsQuery.data?.some((doctor) => doctor.id === chosenDoctorId) ?? false;
  const doctorId = isAdmin
    ? chosenIsListed && chosenDoctorId
      ? chosenDoctorId
      : doctorsQuery.data?.[0]?.id
    : undefined;
  const canLoadAppointments = !isAdmin || doctorId !== undefined;

  const {
    data: appointments,
    isLoading,
    isError,
    refetch,
  } = useAppointmentsInRange(toDateString(days[0]), toDateString(days[days.length - 1]), {
    doctorId,
    enabled: canLoadAppointments,
  });

  // Looked up in the list, so the details update when the list is refetched (e.g. after a status change).
  const selectedAppointment = appointments?.find((a) => a.id === selectedId) ?? null;

  const today = new Date();
  const isCurrent = isWeek
    ? isSameDay(weekStart, startOfWeek(today))
    : isSameDay(currentDate, today);
  const step = isWeek ? 7 : 1;

  function changeDate(update: (date: Date) => Date) {
    setCurrentDate(update);
    setSelectedId(null);
  }

  function changeView(next: CalendarView) {
    setView(next);
    setSelectedId(null);
  }

  function openDay(day: Date) {
    setCurrentDate(day);
    setView("day");
    setSelectedId(null);
  }

  function changeDoctor(id: string) {
    setChosenDoctorId(id);
    // replace: the back button does not step through every doctor change.
    setSearchParams({ doctor: id }, { replace: true });
    setSelectedId(null);
  }

  const calendarRef = useRef<HTMLDivElement>(null);
  const showPanel = hasPanel && selectedAppointment !== null;

  function closeDetails() {
    // The block stays mounted (only the panel goes away), so it can be focused right away.
    if (selectedId) focusAppointmentBlock(calendarRef.current, selectedId);
    setSelectedId(null);
  }

  const selectAppointment = (appointment: { id: string }) => setSelectedId(appointment.id);

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
        title={isWeek ? formatWeekRange(weekStart) : formatLongDate(currentDate)}
        unit={isWeek ? "week" : "day"}
        isCurrent={isCurrent}
        onPrev={() => changeDate((d) => addDays(d, -step))}
        onNext={() => changeDate((d) => addDays(d, step))}
        onToday={() => changeDate(() => new Date())}
      >
        {canShowWeek && <ViewSwitch value={view} onChange={changeView} />}
        {isAdmin && doctorsQuery.data && doctorsQuery.data.length > 0 && (
          <DoctorSelect
            doctors={doctorsQuery.data}
            value={doctorId ?? ""}
            onChange={changeDoctor}
          />
        )}
      </CalendarToolbar>

      <div
        className={`grid grid-cols-1 gap-6 ${
          showPanel ? "xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start" : ""
        }`}
      >
        <div ref={calendarRef} className="flex min-w-0 flex-col gap-4">
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
                  message={`Could not load appointments for this ${isWeek ? "week" : "day"}.`}
                  onRetry={() => refetch()}
                />
              )}

              {!isLoading &&
                !isError &&
                (isWeek ? (
                  <WeekView
                    days={days}
                    appointments={appointments ?? []}
                    selectedId={selectedId}
                    onAppointmentClick={selectAppointment}
                    onDayClick={openDay}
                  />
                ) : (
                  <DayView
                    date={currentDate}
                    appointments={appointments ?? []}
                    selectedId={selectedId}
                    onAppointmentClick={selectAppointment}
                  />
                ))}
            </>
          )}
        </div>
        {hasPanel && selectedAppointment && (
          <AppointmentPanel appointment={selectedAppointment} onClose={closeDetails} />
        )}{" "}
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
