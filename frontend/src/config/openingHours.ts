// Mirrors backend/src/utils/openingHours.ts. The calendar shows the same hours.
export const OPENING_HOUR = 7;
export const CLOSING_HOUR = 17;

const pad = (hour: number) => String(hour).padStart(2, "0");
export const OPENING_TIME = `${pad(OPENING_HOUR)}:00`;
export const CLOSING_TIME = `${pad(CLOSING_HOUR)}:00`;
