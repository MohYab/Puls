# Usability test

A small usability test of the Puls MVP, run in week 14 against the public demo.

## Goal

Find out whether a new user can complete the core doctor workflow without help: find a patient, book a visit, document it and find the documentation again.

## Method

| Part                                           | Participants                               | What it gives                         |
| ---------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| Unmoderated test with an anonymous online form | Classmates, teachers and supervisor        | Task success, ease ratings, SUS score |
| Moderated test with think-aloud (1–2 sessions) | Supervisor or a teacher, over screen share | Where users hesitate and why          |

- **Environment:** the public demo, desktop browser. All participants log in as the same demo doctor.
- **Data:** only fictional data. The demo is reseeded before and after the test.
- **Anonymity:** no names or email addresses are collected. Participants state their role and if they have a healthcare experience.

## Tasks

| #   | Task                                                                                             | Checked against                      |
| --- | ------------------------------------------------------------------------------------------------ | ------------------------------------ |
| 1   | Find a given patient and report her most recent blood pressure.                                  | Value in the seed data               |
| 2   | Book an appointment for any patient on any weekday next week.                                    | Booked date and time in the database |
| 3   | Document a completed visit from the "To document" list with the template "General consultation". | Note for the stated patient          |
| 4   | Open the note from the patient's page.                                                           | Self-reported                        |

## Measures

- **Per task:** success (Yes / Partly / No), Single Ease Question (1–7) and an optional comment. Tasks 1–3 also ask for an answer that can be checked.
- **After all tasks:** System Usability Scale (SUS, ten statements, 0–100).

## Design choices

- **Tasks avoid collisions in the shared demo.** Bookings are spread over a week, and each participant chooses any visit to document. A separate seed script (`backend/prisma/usability-seed.ts`) adds 30 completed visits without a note, and leaves out the patient used in task 1 so that the answer cannot change.
- **Task 3 uses an existing completed visit,** because a visit must have started before it can be marked as completed.
- **No admin tasks,** because admin changes would affect every other participant.

## Results

To be filled in after the test period.

### Participants

| Role                  | Form | Moderated |
| --------------------- | ---- | --------- |
| Student               |      |           |
| Teacher or supervisor |      |           |
| Other                 |      |           |

### Task results

| Task | Yes | Partly | No  | Median ease (1–7) | Checked answer correct |
| ---- | --- | ------ | --- | ----------------- | ---------------------- |
| 1    |     |        |     |                   |                        |
| 2    |     |        |     |                   |                        |
| 3    |     |        |     |                   |                        |
| 4    |     |        |     |                   | –                      |

### SUS

| Mean SUS | Median | Lowest | Highest | Participants |
| -------- | ------ | ------ | ------- | ------------ |
|          |        |        |         |              |

### Findings

| #   | Finding | Task | How many | Severity | Action |
| --- | ------- | ---- | -------- | -------- | ------ |
|     |         |      |          |          |        |

**Action** is one of: fixed before the MVP freeze, documented as a limitation, or future development.

## Limitations

- The participants are developers, students and teachers, not healthcare staff.
- The number of participants is small.
- Success is self-reported. Tasks 1–3 have answers that can be checked, task 4 does not.
- Everyone shares one demo account, so participants can see each other's bookings and notes.
- The test does not cover changing a visit's status to Completed.
- The form and the app are in English, but most participants have Swedish as their first language.
