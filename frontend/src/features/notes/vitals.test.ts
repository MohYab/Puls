import { describe, expect, it } from "vitest";
import { formatVitals, fromVitalInputs, latestMeasurements, toVitalInputs } from "./vitals";

describe("formatVitals", () => {
  it("lists the measured values in a fixed order with units", () => {
    expect(
      formatVitals({
        height: 167,
        systolic: 138,
        diastolic: 86,
        temperature: 36.8,
        heartRate: 72,
        oxygenSaturation: 98,
        weight: 68.5,
      })
    ).toBe("BP 138/86 mmHg · HR 72/min · Temp 36.8 °C · SpO₂ 98 % · 68.5 kg · 167 cm");
  });

  it("shows blood pressure only when both values exist", () => {
    expect(formatVitals({ systolic: 138, heartRate: 72 })).toBe("HR 72/min");
  });

  it("is empty when nothing was measured", () => {
    expect(formatVitals(undefined)).toBe("");
    expect(formatVitals({})).toBe("");
  });
});

describe("latestMeasurements", () => {
  const note = (startTime: string, vitals?: Record<string, number>) => ({
    content: { vitals },
    appointment: { startTime },
  });

  it("takes the newest value of each measurement, from different visits", () => {
    const result = latestMeasurements([
      note("2026-04-14T09:00:00.000Z", { systolic: 128, diastolic: 82, height: 167 }),
      note("2026-10-22T09:30:00.000Z", { systolic: 138, diastolic: 86, heartRate: 72 }),
      note("2026-06-01T09:00:00.000Z"),
    ]);

    expect(result.map((m) => [m.key, m.value, m.date.slice(0, 10)])).toEqual([
      ["bloodPressure", "138/86", "2026-10-22"],
      ["heartRate", "72", "2026-10-22"],
      ["height", "167", "2026-04-14"],
    ]);
  });

  it("returns nothing when no note has vital signs", () => {
    expect(latestMeasurements([note("2026-10-22T09:30:00.000Z")])).toEqual([]);
  });
});

describe("form conversion", () => {
  it("turns numbers into text and back, with a comma as decimal separator", () => {
    const inputs = toVitalInputs({ systolic: 138, diastolic: 86 });
    expect(inputs.systolic).toBe("138");
    expect(inputs.height).toBe("");

    expect(fromVitalInputs({ ...inputs, temperature: "36,8" })).toEqual({
      systolic: 138,
      diastolic: 86,
      temperature: 36.8,
    });
  });

  it("gives undefined when nothing was measured", () => {
    expect(fromVitalInputs(toVitalInputs(undefined))).toBeUndefined();
  });
});
