import "dotenv/config";
import { prisma } from "../src/utils/prisma.js";

// Extra test data for the usability test.
// Adds completed visits without a note for Dr. Erik Lindqvist

const DOCTOR_EMAIL = "erik@puls.test";
const APPOINTMENT_TYPE_NAME = "Follow-up visit";
const VISIT_COUNT = 30;
const EXCLUDED_PATIENT = { firstName: "Anna", lastName: "Andersson" } as const;
const MARKER = "Usability test";
// Start times (hour, minute) on each weekday.
const SLOTS: ReadonlyArray<readonly [number, number]> = [
  [8, 30],
  [15, 30],
];
const MS_PER_MINUTE = 60 * 1000;

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

// Weekdays before today, newest first.
function previousWeekdays(count: number): Date[] {
  const days: Date[] = [];
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  while (days.length < count) {
    day.setDate(day.getDate() - 1);
    if (!isWeekend(day)) {
      days.push(new Date(day));
    }
  }
  return days;
}

async function main() {
  const existing = await prisma.appointment.count({ where: { bookingComment: MARKER } });
  if (existing > 0) {
    throw new Error(
      `Found ${existing} usability test visits. Run the normal seed first, then this script once.`
    );
  }

  const doctor = await prisma.doctor.findFirstOrThrow({
    where: { user: { email: DOCTOR_EMAIL } },
  });
  const type = await prisma.appointmentType.findFirstOrThrow({
    where: { name: APPOINTMENT_TYPE_NAME },
  });
  const patients = await prisma.patient.findMany({
    where: { isActive: true, NOT: EXCLUDED_PATIENT },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
  if (patients.length < VISIT_COUNT) {
    throw new Error("Need at least one active patient besides Anna Andersson.");
  }

  const durationMs = type.duration * MS_PER_MINUTE;
  const days = previousWeekdays(Math.ceil(VISIT_COUNT / SLOTS.length) + 3);
  let created = 0;

  for (const day of days) {
    for (const [hour, minute] of SLOTS) {
      if (created === VISIT_COUNT) break;

      const startTime = new Date(day);
      startTime.setHours(hour, minute, 0, 0);
      const endTime = new Date(startTime.getTime() + durationMs);

      // Skip the slot if the doctor already has a visit at that time.
      const overlapping = await prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: { not: "CANCELLED" },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
      if (overlapping > 0) continue;

      await prisma.appointment.create({
        data: {
          doctorId: doctor.id,
          patientId: patients[created % patients.length].id,
          appointmentTypeId: type.id,
          startTime,
          endTime,
          status: "COMPLETED",
          bookingComment: MARKER,
        },
      });
      created++;
    }
  }

  if (created < VISIT_COUNT) {
    throw new Error(`Only ${created} of ${VISIT_COUNT} visits could be created.`);
  }
  console.log(`Created ${created} completed visits without a note for ${DOCTOR_EMAIL}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
