import "dotenv/config";
import { prisma } from "../src/utils/prisma.js";
import bcrypt from "bcryptjs";

type Status = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

// A type alias (not an interface) so it is assignable to Prisma's JSON type.
type NoteContent = {
  reasonForVisit: string;
  observation: string;
  assessment: string;
  plan: string;
};

const MS_PER_MINUTE = 60 * 1000;

// PTS (the Swedish telecom regulator) reserves 070-1740605 to 070-1740699 for fictional use.
const FICTIONAL_PHONE_FIRST = 605;
const FICTIONAL_PHONE_COUNT = 95;

function fictionalPhone(index: number): string {
  if (index >= FICTIONAL_PHONE_COUNT) {
    throw new Error("Out of fictional phone numbers");
  }
  return `070-174${String(FICTIONAL_PHONE_FIRST + index).padStart(4, "0")}`;
}

// "Åkesson" -> "akesson": e-mail addresses must be plain ASCII to pass validation.
function toAscii(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function emailFor(firstName: string, lastName: string, domain: string): string {
  return `${toAscii(firstName)}.${toAscii(lastName)}@${domain}`;
}

// A point in time relative to today, e.g. at(-3, 14) = three days ago at 14:00.
function at(daysFromToday: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);
  return date;
}

// Children before parents because of foreign keys. Development databases only.
async function resetDatabase() {
  await prisma.noteShare.deleteMany();
  await prisma.appointmentStatusChange.deleteMany();
  await prisma.clinicalNote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.documentationTemplate.deleteMany();
  await prisma.appointmentType.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.user.deleteMany();
}

async function createDoctor(
  passwordHash: string,
  name: string,
  email: string,
  specialization: string
) {
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "DOCTOR", doctor: { create: { specialization } } },
    include: { doctor: true },
  });
  if (!user.doctor) {
    throw new Error("Doctor profile was not created");
  }
  return user.doctor;
}

// phoneIndex picks a number from the fictional range, null means no phone.
function createPatient(
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  phoneIndex: number | null,
  hasEmail = true
) {
  return prisma.patient.create({
    data: {
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      phone: phoneIndex === null ? null : fictionalPhone(phoneIndex),
      email: hasEmail ? emailFor(firstName, lastName, "example.test") : null,
    },
  });
}

function book(
  doctorId: string,
  patientId: string,
  type: { id: string; duration: number },
  startTime: Date,
  status: Status = "SCHEDULED"
) {
  return prisma.appointment.create({
    data: {
      doctorId,
      patientId,
      appointmentTypeId: type.id,
      startTime,
      endTime: new Date(startTime.getTime() + type.duration * MS_PER_MINUTE),
      status,
    },
  });
}

function addNote(
  appointment: { id: string; patientId: string; doctorId: string },
  content: NoteContent
) {
  return prisma.clinicalNote.create({
    data: {
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      content,
    },
  });
}

// --- Extra doctors and patients (generated schedule, see seedExtraSchedule) ---

const EXTRA_DOCTORS: [string, string, string][] = [
  ["Maja", "Svensson", "Cardiology"],
  ["Oskar", "Larsson", "Dermatology"],
  ["Linnea", "Olsson", "Pediatrics"],
  ["William", "Persson", "Orthopedics"],
  ["Alice", "Karlsson", "Psychiatry"],
  ["Noah", "Gustavsson", "Neurology"],
  ["Elsa", "Pettersson", "Ophthalmology"],
  ["Lucas", "Jonsson", "ENT"],
  ["Astrid", "Jansson", "Gynecology"],
  ["Hugo", "Hansson", "Oncology"],
  ["Freja", "Bengtsson", "Endocrinology"],
  ["Liam", "Jönsson", "Pulmonology"],
  ["Alma", "Lindberg", "Gastroenterology"],
  ["Oliver", "Jakobsson", "Urology"],
  ["Ebba", "Magnusson", "Rheumatology"],
  ["Nils", "Lindström", "Geriatrics"],
  ["Stella", "Olofsson", "Infectious disease"],
  ["Viggo", "Åberg", "Emergency medicine"],
  ["Saga", "Fransson", "Occupational medicine"],
  ["Leo", "Nyström", "Sports medicine"],
  ["Ida", "Lundin", "Anesthesiology"],
  ["Arvid", "Björk", "Radiology"],
  ["Ella", "Hedlund", "Nephrology"],
  ["Alfred", "Sjöberg", "Hematology"],
  ["Signe", "Wallin", "Family medicine"],
];

const EXTRA_PATIENTS: [string, string, string][] = [
  ["Malin", "Lundberg", "1983-02-11"],
  ["Emil", "Berg", "1991-06-23"],
  ["Nora", "Axelsson", "1976-09-14"],
  ["Filip", "Lind", "1989-12-05"],
  ["Wilma", "Berglund", "2003-04-17"],
  ["Adam", "Lindqvist", "1965-08-29"],
  ["Selma", "Sandberg", "1997-01-08"],
  ["Isak", "Eklund", "1971-03-26"],
  ["Lilly", "Åkesson", "1986-07-19"],
  ["Theo", "Holmberg", "1994-10-31"],
  ["Vera", "Ström", "1958-05-12"],
  ["Melvin", "Norberg", "1980-11-03"],
  ["Meja", "Lövgren", "2000-02-28"],
  ["Axel", "Bäckström", "1969-06-16"],
  ["Molly", "Sundberg", "1993-09-07"],
  ["Charlie", "Ek", "1974-12-21"],
  ["Elvira", "Håkansson", "1988-04-09"],
  ["Benjamin", "Lindahl", "2005-08-02"],
  ["Lova", "Mårtensson", "1961-01-25"],
  ["Leon", "Nordin", "1982-07-13"],
  ["Sofia", "Blom", "1996-03-04"],
  ["Elliot", "Bergman", "1978-10-18"],
  ["Iris", "Lund", "2002-12-09"],
  ["Max", "Engström", "1955-02-20"],
  ["Alicia", "Söderberg", "1990-05-30"],
  ["Edvin", "Dahl", "1967-11-11"],
  ["Stina", "Lundström", "1984-08-06"],
  ["Melker", "Holmgren", "1999-01-19"],
  ["Tilde", "Åström", "1970-04-27"],
  ["Albin", "Öberg", "1987-06-08"],
  ["Mira", "Hedberg", "1995-10-02"],
  ["Sam", "Lindén", "1963-03-15"],
  ["Ester", "Björklund", "2001-07-24"],
  ["Vincent", "Wikström", "1977-09-01"],
  ["Juni", "Norén", "1981-12-13"],
  ["Gabriel", "Sjödin", "1992-02-06"],
  ["Rut", "Bergqvist", "1959-06-28"],
  ["Frank", "Lindholm", "1985-11-17"],
  ["Leah", "Arvidsson", "1998-04-22"],
  ["Alfred", "Östlund", "1973-08-10"],
  ["Nellie", "Lindgren", "2004-01-31"],
  ["Jonathan", "Fors", "1966-05-05"],
  ["Amanda", "Hult", "1989-07-27"],
  ["Sixten", "Wahlström", "1994-12-16"],
  ["Emilia", "Borg", "1979-02-03"],
  ["Marcus", "Eliasson", "1986-10-25"],
  ["Thea", "Lindvall", "2000-06-14"],
  ["Love", "Söderström", "1952-09-20"],
  ["Lovisa", "Ågren", "1991-03-09"],
  ["Carl", "Dahlström", "1964-11-29"],
  ["Agnes", "Bergström", "1983-05-16"],
  ["Kevin", "Hedman", "1997-08-21"],
  ["Märta", "Öhman", "1975-01-12"],
  ["Daniel", "Strand", "1988-06-03"],
  ["Tuva", "Lundqvist", "2002-10-07"],
  ["Anton", "Westin", "1960-04-18"],
  ["Elin", "Norling", "1993-12-01"],
  ["Rasmus", "Sjöström", "1980-07-06"],
  ["Hilda", "Boman", "1968-02-24"],
  ["Peter", "Ekberg", "1957-09-13"],
  ["Ylva", "Björkman", "1999-05-28"],
];

const GENERIC_NOTES: NoteContent[] = [
  {
    reasonForVisit: "Cold symptoms for several days.",
    observation: "Mild sore throat, no fever.",
    assessment: "Viral upper respiratory infection.",
    plan: "Rest and fluids. Contact the clinic if symptoms worsen.",
  },
  {
    reasonForVisit: "Follow-up of previous visit.",
    observation: "Symptoms have improved.",
    assessment: "Recovering as expected.",
    plan: "No further follow-up needed.",
  },
  {
    reasonForVisit: "Routine check-up.",
    observation: "Normal findings.",
    assessment: "Good general health.",
    plan: "Return if any new symptoms appear.",
  },
  {
    reasonForVisit: "Knee pain.",
    observation: "Mild swelling, normal range of motion.",
    assessment: "Overuse strain.",
    plan: "Light exercise and rest. Re-evaluate in four weeks.",
  },
];

// Every extra doctor gets four appointments at their own fixed hour (so a doctor never
// double-books), spread over different days. Past visits are COMPLETED; every other past
// visit has a note, the rest are "completed but not yet documented".
const EXTRA_DAY_OFFSETS = [-5, -2, 1, 4];

async function seedExtraSchedule(
  doctors: { id: string }[],
  patients: { id: string }[],
  types: { id: string; duration: number }[]
) {
  for (const [i, doctor] of doctors.entries()) {
    const hour = 8 + (i % 9);

    for (const [k, baseOffset] of EXTRA_DAY_OFFSETS.entries()) {
      const dayOffset = baseOffset + (i % 3);
      const patient = patients[(i * EXTRA_DAY_OFFSETS.length + k) % patients.length];
      const type = types[(i + k) % types.length];
      if (!patient || !type) {
        throw new Error("Seed data lookup failed");
      }

      const status: Status = dayOffset < 0 ? "COMPLETED" : "SCHEDULED";
      const appointment = await book(doctor.id, patient.id, type, at(dayOffset, hour), status);

      const note = GENERIC_NOTES[(i + k) % GENERIC_NOTES.length];
      if (status === "COMPLETED" && k % 2 === 0 && note) {
        await addNote(appointment, note);
      }
    }
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed a production database");
  }

  await resetDatabase();

  const passwordHash = await bcrypt.hash("password123", 10);

  // --- Users and doctors (all use the password "password123") ---
  const erik = await createDoctor(
    passwordHash,
    "Dr. Erik Lindqvist",
    "erik@puls.test",
    "General practice"
  );
  const sara = await createDoctor(
    passwordHash,
    "Dr. Sara Nilsson",
    "sara@puls.test",
    "Internal medicine"
  );
  const johan = await createDoctor(
    passwordHash,
    "Dr. Johan Ekström",
    "johan@puls.test",
    "Family medicine"
  );

  // Extra doctors log in with <first>.<last>@puls.test (ASCII), e.g. liam.jonsson@puls.test
  const extraDoctors = await Promise.all(
    EXTRA_DOCTORS.map(([first, last, specialization]) =>
      createDoctor(
        passwordHash,
        `Dr. ${first} ${last}`,
        emailFor(first, last, "puls.test"),
        specialization
      )
    )
  );

  await prisma.user.create({
    data: { name: "Admin User", email: "admin@puls.test", passwordHash, role: "ADMIN" },
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

  // Inactive type: shows how a type that is no longer offered looks for admin,
  // and lets the tests check that doctors never see inactive types.
  await prisma.appointmentType.create({
    data: {
      name: "Group education",
      duration: 60,
      description: "Group sessions, no longer offered",
      isActive: false,
    },
  });

  // --- Core patients used in the scenarios below (dummy data, some without contact info) ---
  const [anna, bo, carin, david, eva, folke, gunilla, hans, ingrid, jonas, karin, lars] =
    await Promise.all([
      createPatient("Anna", "Andersson", "1985-03-12", 0),
      createPatient("Bo", "Bergström", "1972-07-25", 1),
      createPatient("Carin", "Carlsson", "1990-11-02", 2),
      createPatient("David", "Dahlberg", "1968-01-30", 3),
      createPatient("Eva", "Eriksson", "1995-05-18", 4),
      createPatient("Folke", "Forsberg", "1950-09-09", 5, false),
      createPatient("Gunilla", "Gustafsson", "1979-12-04", 6),
      createPatient("Hans", "Holm", "1988-06-21", 7),
      createPatient("Ingrid", "Isaksson", "2001-02-14", null),
      createPatient("Jonas", "Johansson", "1963-10-07", null),
      createPatient("Karin", "Karlsson", "1992-08-29", 10),
      createPatient("Lars", "Lindgren", "1977-04-03", 11),
    ]);

  // --- Extra patients in one query. Contact info is missing for some, by a simple rule. ---
  const extraPatients = await prisma.patient.createManyAndReturn({
    data: EXTRA_PATIENTS.map(([firstName, lastName, dateOfBirth], i) => ({
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      phone: i % 11 === 5 ? null : fictionalPhone(12 + i),
      email: i % 7 === 3 ? null : emailFor(firstName, lastName, "example.test"),
    })),
  });

  // --- Documentation templates ---
  // Field keys, not labels: the frontend takes the labels from its own NOTE_FIELDS list.
  const sections = ["reasonForVisit", "observation", "assessment", "plan"];
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
        templateContent: { sections: ["reasonForVisit", "observation", "plan"] },
      },
    }),
  ]);

  // ===== Dr. Erik Lindqvist =====
  const davidAnnual = await book(erik.id, david.id, annual, at(-30, 10), "COMPLETED");
  await addNote(davidAnnual, {
    reasonForVisit: "Annual health check-up.",
    observation: "Blood pressure 128/82. Weight stable since last year.",
    assessment: "Mildly elevated blood pressure, otherwise healthy.",
    plan: "Re-check blood pressure in three months.\nEncourage regular walks.",
  });

  const evaRoutine = await book(erik.id, eva.id, routine, at(-7, 13), "COMPLETED");
  await addNote(evaRoutine, {
    reasonForVisit: "Recurring headaches for two weeks.",
    observation: "No neurological findings.",
    assessment: "Likely tension headache.",
    plan: "Advise rest and hydration. Follow up if no improvement.",
  });

  await book(erik.id, folke.id, followUp, at(-3, 14), "COMPLETED"); // completed, not yet documented
  await book(erik.id, bo.id, vaccination, at(-2, 9, 30), "NO_SHOW");
  await book(erik.id, gunilla.id, routine, at(-1, 15), "CANCELLED");

  const annaToday = await book(erik.id, anna.id, routine, at(0, 9), "COMPLETED");
  await addNote(annaToday, {
    reasonForVisit: "Annual check-up for general health.",
    observation: "Blood pressure normal, no concerns.",
    assessment: "Patient in good general health.",
    plan: "Routine follow-up in 12 months.",
  });
  await book(erik.id, bo.id, followUp, at(0, 10));
  await book(erik.id, carin.id, annual, at(0, 11, 30));
  await book(erik.id, hans.id, routine, at(0, 13), "CONFIRMED");
  await book(erik.id, ingrid.id, vaccination, at(0, 14));

  await book(erik.id, jonas.id, annual, at(1, 9));
  await book(erik.id, karin.id, routine, at(1, 10, 30));
  await book(erik.id, lars.id, followUp, at(1, 13, 30));
  await book(erik.id, anna.id, followUp, at(3, 11));
  await book(erik.id, david.id, followUp, at(7, 9));

  // ===== Dr. Sara Nilsson =====
  const annaRoutineSara = await book(sara.id, anna.id, routine, at(-21, 10), "COMPLETED");
  await addNote(annaRoutineSara, {
    reasonForVisit: "Persistent cough after a cold.",
    observation: "Lungs clear on examination.",
    assessment: "Post-viral cough.",
    plan: "Wait and see for two weeks.",
  });

  const karinAnnual = await book(sara.id, karin.id, annual, at(-10, 9), "COMPLETED");
  await addNote(karinAnnual, {
    reasonForVisit: "Annual check-up.",
    observation: "Normal blood tests.",
    assessment: "Good general health.",
    plan: "Next check-up in 12 months.",
  });

  const larsRoutine = await book(sara.id, lars.id, routine, at(-5, 11), "COMPLETED");
  await addNote(larsRoutine, {
    reasonForVisit: "Lower back pain after lifting.",
    observation: "Reduced range of motion, no nerve involvement.",
    assessment: "Muscle strain.",
    plan: "Stay active. Over-the-counter pain relief if needed.",
  });

  await book(sara.id, eva.id, followUp, at(0, 9, 30), "CONFIRMED");
  await book(sara.id, david.id, routine, at(0, 10, 30));
  await book(sara.id, gunilla.id, annual, at(0, 13));
  await book(sara.id, hans.id, vaccination, at(0, 15));

  await book(sara.id, bo.id, routine, at(1, 9));
  await book(sara.id, ingrid.id, followUp, at(1, 11));
  await book(sara.id, carin.id, routine, at(2, 14));
  await book(sara.id, folke.id, annual, at(4, 10));

  // ===== Dr. Johan Ekström =====
  const jonasRoutine = await book(johan.id, jonas.id, routine, at(-12, 13), "COMPLETED");
  await addNote(jonasRoutine, {
    reasonForVisit: "Follow-up on blood pressure medication.",
    observation: "Blood pressure within target.",
    assessment: "Treatment effective.",
    plan: "Continue current treatment.",
  });

  const ingridAnnual = await book(johan.id, ingrid.id, annual, at(-4, 9), "COMPLETED");
  await addNote(ingridAnnual, {
    reasonForVisit: "Annual check-up.",
    observation: "Normal examination.",
    assessment: "Healthy.",
    plan: "Routine follow-up in 12 months.",
  });

  await book(johan.id, eva.id, vaccination, at(-1, 10), "COMPLETED"); // completed, not yet documented

  await book(johan.id, lars.id, annual, at(0, 8, 30));
  await book(johan.id, folke.id, routine, at(0, 10));
  await book(johan.id, carin.id, followUp, at(0, 14, 30));

  await book(johan.id, david.id, routine, at(1, 9, 30));
  await book(johan.id, gunilla.id, followUp, at(1, 15));
  await book(johan.id, hans.id, routine, at(5, 10), "CANCELLED");

  // ===== Extra doctors: generated light schedule =====
  await seedExtraSchedule(extraDoctors, extraPatients, [routine, followUp, annual, vaccination]);

  const [doctors, patients, appointments, notes] = await Promise.all([
    prisma.doctor.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.clinicalNote.count(),
  ]);
  console.log(
    `Seed data created: ${doctors} doctors, ${patients} patients, ${appointments} appointments, ${notes} notes.`
  );
}

// Sharing scenario: Sara has shared her note about Anna with Johan.
// Johan has no appointments with Anna, so the shared note is his only access.
// Looked up through relations, so it does not depend on variable names or
// pick the wrong patient if two patients share a name.
async function seedNoteShares() {
  const saraNoteForAnna = await prisma.clinicalNote.findFirstOrThrow({
    where: {
      doctor: { user: { email: "sara@puls.test" } },
      patient: { firstName: "Anna", lastName: "Andersson" },
    },
    select: { id: true, doctor: { select: { userId: true } } },
  });
  const johanDoctor = await prisma.doctor.findFirstOrThrow({
    where: { user: { email: "johan@puls.test" } },
  });

  await prisma.noteShare.create({
    data: {
      noteId: saraNoteForAnna.id,
      doctorId: johanDoctor.id,
      createdByUserId: saraNoteForAnna.doctor.userId,
      consentConfirmedAt: new Date(),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await seedNoteShares();
  });
