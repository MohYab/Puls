import { prisma } from "../utils/prisma.js";
import type { ClinicInput } from "../validators/clinicValidators.js";

const CLINIC_ID = 1;

const clinicSelect = {
  name: true,
  addressLine: true,
  postalCode: true,
  city: true,
  phone: true,
  email: true,
} as const;

// Used before an admin has saved anything (e.g. a fresh database without seed).
const DEFAULT_CLINIC = {
  name: "Puls",
  addressLine: null,
  postalCode: null,
  city: null,
  phone: null,
  email: null,
};

export async function getClinicSettings() {
  const clinic = await prisma.clinicSettings.findUnique({
    where: { id: CLINIC_ID },
    select: clinicSelect,
  });
  return clinic ?? DEFAULT_CLINIC;
}

export async function updateClinicSettings(input: ClinicInput) {
  const data = {
    name: input.name,
    addressLine: input.addressLine || null,
    postalCode: input.postalCode || null,
    city: input.city || null,
    phone: input.phone || null,
    email: input.email || null,
  };
  return prisma.clinicSettings.upsert({
    where: { id: CLINIC_ID },
    create: { id: CLINIC_ID, ...data },
    update: data,
    select: clinicSelect,
  });
}