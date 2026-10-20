import { NotFoundError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";

// Swedish alphabetical order: A–Z, then Å, Ä, Ö. Done in Node so the order
// does not depend on how PostgreSQL was installed (its collation).
const swedish = new Intl.Collator("sv");

function bySwedishName(
  a: { lastName: string; firstName: string },
  b: { lastName: string; firstName: string }
): number {
  return swedish.compare(a.lastName, b.lastName) || swedish.compare(a.firstName, b.firstName);
}

export async function getAllPatients(search?: string) {
  // Every word must match the first or the last name, so "anna andersson" finds Anna Andersson.
  const terms = search?.trim().split(/\s+/).filter(Boolean) ?? [];

  const patients = await prisma.patient.findMany({
    where:
      terms.length > 0
        ? {
            AND: terms.map((term) => ({
              OR: [
                { firstName: { contains: term, mode: "insensitive" as const } },
                { lastName: { contains: term, mode: "insensitive" as const } },
              ],
            })),
          }
        : undefined,
  });

  // No pagination (73 patients), so sorting after the query is fine.
  return patients.sort(bySwedishName);
}

export async function getPatientById(id: string) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      phone: true,
      email: true,
    },
  });

  if (!patient) {
    throw new NotFoundError("Patient not found");
  }

  return patient;
}
