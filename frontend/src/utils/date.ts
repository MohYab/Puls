// One date and time format for the whole app (docs/design-direction.md).

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return toDateString(new Date());
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const timeFormat = new Intl.DateTimeFormat("sv-SE", { hour: "2-digit", minute: "2-digit" });

/** "22 Oct 2026" */
export function formatDate(isoString: string): string {
  return dateFormat.format(new Date(isoString));
}

/** "Thu 22 Oct 2026" */
export function formatWeekdayDate(isoString: string): string {
  const date = new Date(isoString);
  return `${weekdayFormat.format(date)} ${dateFormat.format(date)}`;
}

/** "10:30" (24-hour) */
export function formatTime(isoString: string): string {
  return timeFormat.format(new Date(isoString));
}

/** "10:30–11:15" */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)}–${formatTime(endIso)}`;
}

/** "22 Oct 2026 10:30" */
export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}

/** "45 min" */
export function formatDuration(startIso: string, endIso: string): string {
  const minutes = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  return `${minutes} min`;
}

// Date of birth is stored as UTC midnight, so the first ten characters are the date.
/** "1985-03-12" */
export function formatBirthDate(isoString: string): string {
  return isoString.slice(0, 10);
}

/** Age in whole years on the given day. */
export function calculateAge(birthIso: string, today: Date = new Date()): number {
  const [year, month, day] = birthIso.slice(0, 10).split("-").map(Number);
  let age = today.getFullYear() - year;
  const hadBirthday =
    today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
  if (!hadBirthday) age -= 1;
  return age;
}

/**
 * Returns a new date moved by whole calendar days, keeping the local time.
 * Uses setDate instead of adding 24 hours, because a day is 23 or 25 hours
 * long when daylight saving time starts or ends.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateString(a) === toDateString(b);
}

/** "Tuesday 27 October 2026" – the calendar's date heading. */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
