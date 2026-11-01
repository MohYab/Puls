// Vital signs: one list of measurements, units and limits for the whole frontend.
// The limits mirror backend/src/validators/noteValidators.ts; the backend decides.

export type VitalKey =
  | "systolic"
  | "diastolic"
  | "heartRate"
  | "temperature"
  | "oxygenSaturation"
  | "respiratoryRate"
  | "weight"
  | "height";

export type Vitals = Partial<Record<VitalKey, number>>;

export interface VitalLimit {
  min: number;
  max: number;
  /** 1 = whole numbers, 0.1 = one decimal. */
  step: 1 | 0.1;
  unit: string;
}

export const VITAL_LIMITS: Record<VitalKey, VitalLimit> = {
  systolic: { min: 50, max: 260, step: 1, unit: "mmHg" },
  diastolic: { min: 30, max: 160, step: 1, unit: "mmHg" },
  heartRate: { min: 20, max: 250, step: 1, unit: "/min" },
  temperature: { min: 30, max: 45, step: 0.1, unit: "°C" },
  oxygenSaturation: { min: 50, max: 100, step: 1, unit: "%" },
  respiratoryRate: { min: 4, max: 60, step: 1, unit: "/min" },
  weight: { min: 0.5, max: 400, step: 0.1, unit: "kg" },
  height: { min: 30, max: 250, step: 1, unit: "cm" },
};

export type MeasureKey =
  | "bloodPressure"
  | "heartRate"
  | "temperature"
  | "oxygenSaturation"
  | "respiratoryRate"
  | "weight"
  | "height";

interface Measure {
  key: MeasureKey;
  label: string;
  /** In the one-line summary; empty for weight and height, which read well with the unit alone. */
  short: string;
  unit: string;
  /** The value as text, or null when it was not measured. */
  read: (vitals: Vitals) => string | null;
}

const single = (key: VitalKey) => (vitals: Vitals) =>
  vitals[key] === undefined ? null : String(vitals[key]);

/** In display order. Blood pressure is one measurement made of two fields. */
export const MEASURES: readonly Measure[] = [
  {
    key: "bloodPressure",
    label: "Blood pressure",
    short: "BP",
    unit: "mmHg",
    read: (v) =>
      v.systolic !== undefined && v.diastolic !== undefined ? `${v.systolic}/${v.diastolic}` : null,
  },
  { key: "heartRate", label: "Heart rate", short: "HR", unit: "/min", read: single("heartRate") },
  {
    key: "temperature",
    label: "Temperature",
    short: "Temp",
    unit: "°C",
    read: single("temperature"),
  },
  {
    key: "oxygenSaturation",
    label: "SpO₂",
    short: "SpO₂",
    unit: "%",
    read: single("oxygenSaturation"),
  },
  {
    key: "respiratoryRate",
    label: "Respiratory rate",
    short: "RR",
    unit: "/min",
    read: single("respiratoryRate"),
  },
  { key: "weight", label: "Weight", short: "", unit: "kg", read: single("weight") },
  { key: "height", label: "Height", short: "", unit: "cm", read: single("height") },
];

/** "72/min" but "36.8 °C" and "98 %": SI puts a space before units, not before "/min". */
export function withUnit(value: string, unit: string): string {
  return unit.startsWith("/") ? `${value}${unit}` : `${value} ${unit}`;
}

/** "BP 138/86 mmHg · HR 72/min · Temp 36.8 °C · 68.5 kg", or "" when nothing was measured. */
export function formatVitals(vitals: Vitals | undefined): string {
  if (!vitals) return "";
  return MEASURES.flatMap((measure) => {
    const value = measure.read(vitals);
    if (value === null) return [];
    const text = withUnit(value, measure.unit);
    return [measure.short ? `${measure.short} ${text}` : text];
  }).join(" · ");
}

export interface LatestMeasurement {
  key: MeasureKey;
  label: string;
  value: string;
  unit: string;
  /** Start of the visit the value was recorded at. */
  date: string;
}

/** Only what this function needs from a note, so it does not depend on the whole type. */
interface NoteWithVitals {
  content: { vitals?: Vitals };
  appointment: { startTime: string };
}

/**
 * The newest value of each measurement, which may come from different visits
 * (blood pressure from October, height from April). Each keeps its own date.
 */
export function latestMeasurements(notes: readonly NoteWithVitals[]): LatestMeasurement[] {
  const newestFirst = [...notes].sort(
    (a, b) => Date.parse(b.appointment.startTime) - Date.parse(a.appointment.startTime)
  );

  return MEASURES.flatMap((measure) => {
    for (const note of newestFirst) {
      const value = note.content.vitals ? measure.read(note.content.vitals) : null;
      if (value !== null) {
        return [
          {
            key: measure.key,
            label: measure.label,
            value,
            unit: measure.unit,
            date: note.appointment.startTime,
          },
        ];
      }
    }
    return [];
  });
}
