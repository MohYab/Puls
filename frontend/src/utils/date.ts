export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayDateString(): string {
  return toDateString(new Date());
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("sv-SE");
}

// Date of birth is stored as UTC midnight, so format it in UTC to avoid day shifts.
export function formatBirthDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("sv-SE", { timeZone: "UTC" });
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}
