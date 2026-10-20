// The clinic's opening hours, in the clinic's own time zone. Times are stored
// in UTC (decisions #6), so the check must not depend on the server's time zone.
export const CLINIC_TIME_ZONE = "Europe/Stockholm";
export const OPENING_HOUR = 7;
export const CLOSING_HOUR = 17;

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: CLINIC_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function minutesOfDay(date: Date): number {
  const parts = timeFormat.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  return hour * 60 + minute;
}

function clinicDate(date: Date): string {
  return dateFormat.format(date); // e.g. "2026-10-20"
}

const pad = (hour: number) => String(hour).padStart(2, "0");
export const OPENING_HOURS_LABEL = `${pad(OPENING_HOUR)}:00 and ${pad(CLOSING_HOUR)}:00`;

// Starts at or after opening, ends at or before closing, on the same day.
export function isWithinOpeningHours(start: Date, end: Date): boolean {
  return (
    clinicDate(start) === clinicDate(end) &&
    minutesOfDay(start) >= OPENING_HOUR * 60 &&
    minutesOfDay(end) <= CLOSING_HOUR * 60
  );
}
