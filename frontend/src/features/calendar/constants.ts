import { CLOSING_HOUR, OPENING_HOUR } from "../../config/openingHours";

// The calendar shows exactly the opening hours, so every bookable time is visible.
export const CALENDAR_START_HOUR = OPENING_HOUR;
export const CALENDAR_END_HOUR = CLOSING_HOUR;
export const PX_PER_MINUTE = 1.2;
export const HOUR_HEIGHT = 60 * PX_PER_MINUTE;
export const CALENDAR_HEIGHT = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * HOUR_HEIGHT;

// Appointments this short (24 px) get a single line: time and patient.
export const COMPACT_MAX_MINUTES = 20;

export function minutesSinceCalendarStart(date: Date): number {
  const startOfDay = new Date(date);
  startOfDay.setHours(CALENDAR_START_HOUR, 0, 0, 0);
  return (date.getTime() - startOfDay.getTime()) / 60000;
}

export type CalendarView = "day" | "week";
