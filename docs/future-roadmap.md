# Future roadmap – Puls

**Status:** Draft, written during the degree project (October 2026). Nothing in
this document is part of the MVP. It describes how Puls could grow from a
prototype into a system for real clinics, and is the basis for the "Future
development" section of the report.

## Vision

One system for appointment booking, payments and clinical documentation that
works for a single doctor's private clinic as well as for health centres and
hospitals. The first target market is **Syria**, where many private clinics have
one doctor and a reception.

## Principles

1. **Swedish law as the baseline.** Patient data is handled as required by the
   Swedish Patient Data Act (PDL) and GDPR, even where local law is less strict.
   Designing for the stricter level is the safer choice, and local requirements
   must be investigated before real use in each country.
2. **Nothing that carries history is deleted.** Records, appointments and users
   are deactivated or corrected, never removed (decisions #4, #34, #43, #51).
3. **Least privilege.** Each role sees only what it needs. Reception handles
   bookings and payments but never reads clinical notes.
4. **The patient's consent is data**, not a checkbox: who agreed, to what, when,
   and when it was withdrawn.
5. **Every read of a clinical note is logged**, so that a patient or an
   inspector can see who has had access.

## Who the system is for

|                 | Private clinic (one doctor)                      | Health centre                                        | Hospital                           |
| --------------- | ------------------------------------------------ | ---------------------------------------------------- | ---------------------------------- |
| Staff           | One doctor, often one receptionist               | Several doctors, nurses, reception, an administrator | Many departments and roles         |
| Who administers | The doctor                                       | An administrator                                     | An IT department                   |
| Most important  | Few steps, works on a phone, payment at the desk | Scheduling for many doctors                          | Departments, access per department |

## Phase A – Roles, reception and the Syrian market

**Permissions instead of fixed roles.** Today the API checks two roles
(`authorize("ADMIN")`). Instead, each role is a list of permissions
(`appointments:write`, `patients:deactivate`, `notes:read`), and the API checks
permissions. A new role then becomes configuration, not a code change.

| Role                 | Can                                                                                             | Cannot                 |
| -------------------- | ----------------------------------------------------------------------------------------------- | ---------------------- |
| Receptionist         | Book, move and cancel appointments; register and edit patients; take payments; see the schedule | Read clinical notes    |
| Doctor               | Own appointments and notes; share notes with the patient's consent                              | Change clinic settings |
| Nurse (later)        | Limited documentation                                                                           |                        |
| Clinic administrator | Staff, appointment types, prices, clinic settings                                               | Read clinical notes    |

**Several roles per user.** A doctor running their own clinic is both doctor and
clinic administrator.

**Internationalisation.** Since Syria is the first market:

- Arabic as a language, with right-to-left layout. Tailwind supports this with
  logical properties (`ms-`/`me-` instead of `ml-`/`mr-`), which should be used
  from the start of the redesign.
- All texts through a translation library (for example `react-i18next`).
- Time zone and opening hours per clinic instead of the constants
  `Europe/Stockholm` and 07–17 (decisions #44, #55).
- Phone numbers, addresses and identity numbers in local formats.

## Phase B – Legal baseline (before any real patient data)

Based on the Swedish Patient Data Act:

- **Access log:** every read of a clinical note is stored (who, what, when).
  The patient has the right to see the log.
- **Consent records** as their own table (patient, recipient, scope, given at,
  withdrawn at, how it was given).
- **Blocking (spärr):** the patient can block parts of their record from being
  shared.
- **The patient's own remark:** a patient who disagrees with a note has the
  right to have that recorded in the record.
- **Retention:** records are kept for the required time; destroying them is a
  decision outside the system (in Sweden by IVO).
- **Strong identification** for staff (in Sweden SITHS; the equivalent in Syria
  must be investigated).

## Phase C – Payments (reception)

- A price per appointment type, in the clinic's currency (for example SYP).
- At or after the visit, reception registers a payment: amount, method (cash,
  card, other), who received it, when.
- Receipt for the patient; daily summary for the clinic.
- Payments are kept apart from clinical data: reception sees prices and
  payments, not notes.
- Corrections follow the same rule as statuses: a payment is never edited or
  deleted; a correction is a new entry with a reason.
- Accounting and tax rules differ per country and must be investigated (in
  Sweden, for example, rules on patient fees and cash registers).

## Phase D – Several clinics in one system

- **Clinic** becomes a table. Appointments, records, appointment types and
  prices belong to a clinic.
- **Membership:** a user belongs to one or more clinics, with roles per clinic.
- **Patients:** the same person can be a patient at several clinics; each clinic
  keeps its own record.
- **Isolation:** every query is limited to the user's clinic. To make one
  forgotten check impossible, the database itself enforces it (PostgreSQL
  row-level security).

The MVP today is "one installation, one clinic", which is simpler and safer but
makes sharing between clinics hard.

## Phase E – Sharing between clinics and a patient portal

Sharing a note within a clinic exists in the MVP (decisions #38). Between
clinics it is a different matter: in Sweden it is called _coherent record
keeping_ and requires the patient's consent, a care relationship with the
receiving doctor, and an access log (phase B).

**Who takes the initiative:**

1. **Now and in phase E:** the doctor shares, and the patient's consent is
   recorded, not just a checkbox.
2. **Assisted consent:** the patient confirms in person (on a tablet at the
   clinic) or with a link or code sent by SMS. No account needed, so patients
   who are not used to digital services are not left out.
3. **Later:** the patient shares, approves requests and withdraws consent in a
   patient portal, with strong identification.

The data model already allows this: a share stores who created it
(`createdByUserId`, which can later be a patient) and when consent was confirmed.

## Data model for a real product

The MVP is built for one clinic and a demo. A product used by real clinics
would need these changes in the data model from the start, before more
features are added:

- **Organisation and clinic** as the base of the model, with settings on both
  levels, so a single doctor's clinic and a larger organisation use the same
  structure (see phase D).
- **Booking and visit as separate objects.** A booking is planned; a visit is
  what actually happened. A visit can also happen without a booking (for
  example a walk-in patient).
- **The note's own life cycle:** draft, signed, and corrections as addenda that
  keep the original text. In the MVP, the author can edit a note freely and
  only the template is locked after the first save.
- **Visit status and documentation status as separate fields**, so a completed
  visit with an unfinished note is never ambiguous. The MVP already keeps them
  apart in the interface (status by colour, note by icon).
- **Patient identity per country.** The MVP deliberately stores no personal
  identity number, so duplicates are only detected by name and date of birth.
  A real product must decide how patients are identified in each market, how
  duplicate records are merged, and how corrections are traced.
- **Configurable care types:** appointment types, templates, durations and
  form fields per clinic, without building a new screen for each.

## Operations and security for real use

- Access log for every read of a clinical note, with regular review of the
  log (phase B).
- Separate test and production environments; fictional patients only in test.
- Backups, restore tests and a plan for incidents.
- Documented rules for access across clinics and organisations.

## What the MVP already prepares

| In the MVP                                                                       | Prepares for                                             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `NoteShare` with history, `createdByUserId`, `consentConfirmedAt`                | Patient-initiated sharing, consent records (A, E)        |
| Status history with reason, nothing deleted                                      | Access log and corrections, also for payments (B, C)     |
| Deactivation of patients and doctors                                             | Retention rules (B)                                      |
| `ClinicSettings`                                                                 | A clinic table with time zone, hours and currency (A, D) |
| Times stored in UTC, opening hours checked in the clinic's time zone             | Clinics in other time zones (A)                          |
| Permission rules in one place per area (`readableNotesWhere`, `ownDoctorFilter`) | Permissions instead of fixed roles (A)                   |
| One shared `RequestingUser` type                                                 | Roles per clinic (A, D)                                  |

## Open questions

- Which laws apply to health data in Syria, and what do they require?
- Is there a national electronic identification to use for staff and patients?
- Where may patient data be stored, and must it stay in the country?
- How reliable is the internet connection at the clinics? Is offline use needed?
- Which payment methods are common, and which rules apply to receipts?
- Does a single-doctor clinic want to use the system on a phone or a computer?
