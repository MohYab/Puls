import { describe, expect, it } from "vitest";
import {
  addDays,
  birthDateAndAge,
  formatLongDate,
  formatRelativeDay,
  formatStartsIn,
  formatWeekRange,
  isSameDay,
  startOfWeek,
  toDateString,
} from "./date";

describe("addDays", () => {
  it("moves to the next calendar day across the switch to winter time", () => {
    // 25 October 2026 has 25 hours in Sweden. Adding 24 hours from just after
    // midnight stays on the same day; adding a calendar day does not.
    const justAfterMidnight = new Date(2026, 9, 25, 0, 30);

    expect(toDateString(addDays(justAfterMidnight, 1))).toBe("2026-10-26");
  });

  it("moves to the previous day across the switch to summer time", () => {
    // 29 March 2026 has 23 hours in Sweden.
    const lateEvening = new Date(2026, 2, 30, 23, 30);

    expect(toDateString(addDays(lateEvening, -1))).toBe("2026-03-29");
  });

  it("keeps the local time of day", () => {
    const morning = new Date(2026, 9, 24, 9, 15);
    const next = addDays(morning, 1);

    expect(next.getHours()).toBe(9);
    expect(next.getMinutes()).toBe(15);
  });

  it("does not change the original date", () => {
    const original = new Date(2026, 9, 24, 9, 0);
    addDays(original, 1);

    expect(toDateString(original)).toBe("2026-10-24");
  });
});

describe("isSameDay", () => {
  it("compares the calendar day, not the time", () => {
    expect(isSameDay(new Date(2026, 9, 24, 7, 0), new Date(2026, 9, 24, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2026, 9, 24, 23, 59), new Date(2026, 9, 25, 0, 0))).toBe(false);
  });
});

import {
  calculateAge,
  formatBirthDate,
  formatDate,
  formatDuration,
  formatTimeRange,
  formatWeekdayDate,
} from "./date";

describe("display formats", () => {
  // 08:30 UTC is 10:30 in Sweden in October (tests run in Europe/Stockholm).
  const start = "2026-10-22T08:30:00.000Z";
  const end = "2026-10-22T09:15:00.000Z";

  it("formats dates, weekdays, ranges and durations", () => {
    expect(formatDate(start)).toBe("22 Oct 2026");
    expect(formatWeekdayDate(start)).toBe("Thu 22 Oct 2026");
    expect(formatTimeRange(start, end)).toBe("10:30–11:15");
    expect(formatDuration(start, end)).toBe("45 min");
  });

  it("shows a date of birth exactly as stored", () => {
    expect(formatBirthDate("1985-03-12T00:00:00.000Z")).toBe("1985-03-12");
  });

  it("formats the calendar's long date", () => {
    // Some ICU versions add a comma after the weekday.
    expect(formatLongDate(new Date(2026, 9, 27))).toMatch(/^Tuesday,? 27 October 2026$/);
  });
});

describe("calculateAge", () => {
  it("adds a year on the birthday, not before", () => {
    const birth = "1985-03-12T00:00:00.000Z";
    expect(calculateAge(birth, new Date(2026, 2, 11))).toBe(40);
    expect(calculateAge(birth, new Date(2026, 2, 12))).toBe(41);
  });
});

describe("startOfWeek", () => {
  it("goes back to Monday, and keeps a Monday as it is", () => {
    expect(startOfWeek(new Date(2026, 9, 28, 14, 30))).toEqual(new Date(2026, 9, 26)); // Wed
    expect(startOfWeek(new Date(2026, 10, 1))).toEqual(new Date(2026, 9, 26)); // Sun
    expect(startOfWeek(new Date(2026, 9, 26, 9))).toEqual(new Date(2026, 9, 26)); // Mon
  });

  it("works in the week clocks go back (25 October 2026)", () => {
    expect(startOfWeek(new Date(2026, 9, 25, 12))).toEqual(new Date(2026, 9, 19));
  });
});

describe("formatWeekRange", () => {
  it("shows the year once within a year, and twice across a new year", () => {
    expect(formatWeekRange(new Date(2026, 9, 26))).toBe("26 Oct – 1 Nov 2026");
    expect(formatWeekRange(new Date(2026, 11, 28))).toBe("28 Dec 2026 – 3 Jan 2027");
  });
});

describe("formatRelativeDay", () => {
  const now = new Date("2026-10-30T10:00:00");
  const local = (dateTime: string) => new Date(dateTime).toISOString();

  it("names today, yesterday and tomorrow", () => {
    expect(formatRelativeDay(local("2026-10-30T08:30:00"), now)).toBe("Today");
    expect(formatRelativeDay(local("2026-10-29T15:00:00"), now)).toBe("Yesterday");
    expect(formatRelativeDay(local("2026-10-31T09:00:00"), now)).toBe("Tomorrow");
  });

  it("gives the date for other days", () => {
    expect(formatRelativeDay(local("2026-10-27T10:30:00"), now)).toBe("27 Oct 2026");
  });
});

describe("formatStartsIn", () => {
  const now = new Date("2026-10-30T10:00:00");
  const at = (time: string) => new Date(`2026-10-30T${time}`).toISOString();

  it("counts minutes, then hours and minutes", () => {
    expect(formatStartsIn(at("10:25:00"), now)).toBe("Starts in 25 min");
    expect(formatStartsIn(at("11:05:00"), now)).toBe("Starts in 1 h 5 min");
    expect(formatStartsIn(at("12:00:00"), now)).toBe("Starts in 2 h");
  });

  it("rounds up, and says Started once the time has passed", () => {
    expect(formatStartsIn(at("10:00:30"), now)).toBe("Starts in 1 min");
    expect(formatStartsIn(at("09:59:00"), now)).toBe("Started");
  });
});

describe("birthDateAndAge", () => {
  it("shows the date of birth and the age on that day", () => {
    const dob = "1985-03-12T00:00:00.000Z";
    expect(birthDateAndAge(dob, new Date("2026-10-30T10:00:00"))).toBe("1985-03-12 · 41 y");
    expect(birthDateAndAge(dob, new Date("2026-03-11T10:00:00"))).toBe("1985-03-12 · 40 y");
  });
});
