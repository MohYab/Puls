import { describe, expect, it } from "vitest";
import { addDays, isSameDay, toDateString } from "./date";

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

import { calculateAge, formatBirthDate, formatDate, formatDuration, formatTimeRange, formatWeekdayDate } from "./date";

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
});

describe("calculateAge", () => {
  it("adds a year on the birthday, not before", () => {
    const birth = "1985-03-12T00:00:00.000Z";
    expect(calculateAge(birth, new Date(2026, 2, 11))).toBe(40);
    expect(calculateAge(birth, new Date(2026, 2, 12))).toBe(41);
  });
});