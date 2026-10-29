export const CLINIC_TIME_ZONE = "Europe/Stockholm";

/**
 * Calendar days in the API are counted in the server's time zone (decision #57).
 * Fail at startup instead of silently returning the wrong days.
 */
export function assertClinicTimeZone(): void {
  const actual = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (actual !== CLINIC_TIME_ZONE) {
    throw new Error(
      `The server must run with TZ=${CLINIC_TIME_ZONE}, but runs in ${actual}. Set TZ in backend/.env.`
    );
  }
}