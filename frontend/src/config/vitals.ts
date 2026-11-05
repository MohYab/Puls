import type { VitalKey } from "../types/note";

// Plausibility limits for vital signs. Mirrors backend/src/validators/noteValidators.ts;
// the backend decides. Fixed SI units.

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

export const VITAL_KEYS = Object.keys(VITAL_LIMITS) as VitalKey[];
