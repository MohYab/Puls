import "dotenv/config";
import { prisma } from "../src/utils/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // --- Doctor user ---
  const doctorUser = await prisma.user.create({
    data: {
      name: "Dr. Erik Lindqvist",
      email: "erik@puls.test",
      passwordHash,
      role: "DOCTOR",
      doctor: {
        create: {
          specialization: "General practice",
        },
      },
    },
    include: { doctor: true },
  });

  // --- Admin user ---
  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@puls.test",
      passwordHash,
      role: "ADMIN",
    },
  });

  // --- Appointment types ---
  const [routine, followUp, annual, vaccination] = await Promise.all([
    prisma.appointmentType.create({
      data: { name: "Routine consultation", duration: 30, description: "Standard visit" },
    }),
    prisma.appointmentType.create({
      data: { name: "Follow-up visit", duration: 15, description: "Short follow-up" },
    }),
    prisma.appointmentType.create({
      data: { name: "Annual check-up", duration: 45, description: "Yearly health review" },
    }),
    prisma.appointmentType.create({
      data: { name: "Vaccination", duration: 15, description: "Vaccine administration" },
    }),
  ]);

  // --- Patients (dummy data only) ---
  const [patientA, patientB, patientC] = await Promise.all([
    prisma.patient.create({
      data: {
        firstName: "Anna",
        lastName: "Andersson",
        dateOfBirth: new Date("1985-03-12"),
        phone: "070-1234567",
        email: "anna.andersson@example.test",
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Bo",
        lastName: "Bergström",
        dateOfBirth: new Date("1972-07-25"),
        phone: "070-2345678",
        email: "bo.bergstrom@example.test",
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Carin",
        lastName: "Carlsson",
        dateOfBirth: new Date("1990-11-02"),
        phone: "070-3456789",
        email: "carin.carlsson@example.test",
      },
    }),
  ]);

  // --- Documentation templates ---
  const sections = ["Reason for visit", "Observation", "Assessment", "Plan"];
  await Promise.all([
    prisma.documentationTemplate.create({
      data: {
        name: "General consultation",
        description: "Standard template for most visits",
        templateContent: { sections },
      },
    }),
    prisma.documentationTemplate.create({
      data: {
        name: "Follow-up visit",
        description: "For short follow-up appointments",
        templateContent: { sections },
      },
    }),
    prisma.documentationTemplate.create({
      data: {
        name: "Annual check-up",
        description: "For yearly health reviews",
        templateContent: { sections },
      },
    }),
    prisma.documentationTemplate.create({
      data: {
        name: "Vaccination",
        description: "For vaccination visits",
        templateContent: { sections: ["Reason for visit", "Observation", "Plan"] },
      },
    }),
  ]);

  // --- A couple of example appointments ---
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patientA.id,
      doctorId: doctorUser.doctor!.id,
      appointmentTypeId: routine.id,
      startTime: today,
      endTime: new Date(today.getTime() + 30 * 60 * 1000),
      status: "COMPLETED",
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patientB.id,
      doctorId: doctorUser.doctor!.id,
      appointmentTypeId: followUp.id,
      startTime: new Date(today.getTime() + 60 * 60 * 1000),
      endTime: new Date(today.getTime() + 75 * 60 * 1000),
      status: "SCHEDULED",
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patientC.id,
      doctorId: doctorUser.doctor!.id,
      appointmentTypeId: annual.id,
      startTime: new Date(today.getTime() + 150 * 60 * 1000),
      endTime: new Date(today.getTime() + 195 * 60 * 1000),
      status: "SCHEDULED",
    },
  });

  // --- Example clinical note for the completed appointment ---
  await prisma.clinicalNote.create({
    data: {
      appointmentId: appointment1.id,
      patientId: patientA.id,
      doctorId: doctorUser.doctor!.id,
      content: {
        reasonForVisit: "Annual check-up for general health.",
        observation: "Blood pressure normal, no concerns.",
        assessment: "Patient in good general health.",
        plan: "Routine follow-up in 12 months.",
      },
    },
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
