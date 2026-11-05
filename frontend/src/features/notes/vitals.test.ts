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
    ).toBe(
      "BP\u00A0138/86\u00A0mmHg\u00A0· HR\u00A072/min\u00A0· Temp\u00A036.8\u00A0°C\u00A0· " +
        "SpO₂\u00A098\u00A0%\u00A0· 68.5\u00A0kg\u00A0· 167\u00A0cm"
    );
  });

  it("only allows a line break after a separator", () => {
    const text = formatVitals({ systolic: 138, diastolic: 86, temperature: 36.8, weight: 68.5 });
    // Splitting on ordinary spaces gives whole measurements, each ending with "·" but the last.
    expect(text.split(" ")).toEqual([
      "BP\u00A0138/86\u00A0mmHg\u00A0·",
      "Temp\u00A036.8\u00A0°C\u00A0·",
      "68.5\u00A0kg",
    ]);
  });

  it("shows blood pressure only when both values exist", () => {
    expect(formatVitals({ systolic: 138, heartRate: 72 })).toBe("HR\u00A072/min");
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
