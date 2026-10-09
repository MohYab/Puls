export const CALENDAR_START_HOUR = 7;
export const CALENDAR_END_HOUR = 17;
export const PX_PER_MINUTE = 1.2;
export const CALENDAR_HEIGHT = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60 * PX_PER_MINUTE;

export function minutesSinceCalendarStart(date: Date): number {
  const startOfDay = new Date(date);
  startOfDay.setHours(CALENDAR_START_HOUR, 0, 0, 0);
  return (date.getTime() - startOfDay.getTime()) / 60000;
}
