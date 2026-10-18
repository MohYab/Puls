# Backlog – Puls

Priority: P1 = must have, P2 = should have, P3 = out of scope (future).

## User stories

| ID    | As a...      | I want to...                              | So that...                            | Prio | Status          |
| ----- | ------------ | ----------------------------------------- | ------------------------------------- | ---- | --------------- |
| US-01 | Doctor/Admin | log in                                    | I can access my workspace             | P1   | Done (week 5–6) |
| US-02 | Doctor       | see today's appointments                  | I understand my schedule quickly      | P1   | Done (week 7)   |
| US-03 | Doctor       | see my next appointment                   | I know what is coming next            | P1   | Done (week 7)   |
| US-04 | Doctor       | see my calendar                           | I can plan my working day             | P1   | Done (week 8) ¹ |
| US-05 | Doctor       | create an appointment                     | I can book a patient                  | P1   | Done (week 8) ² |
| US-06 | Doctor       | edit an appointment                       | I can correct scheduling changes      | P1   | Done (week 8)   |
| US-07 | Doctor       | cancel an appointment                     | unavailable times are freed           | P1   | Done (week 8)   |
| US-08 | Doctor       | create documentation after an appointment | the visit is documented               | P1   | Done (week 10)  |
| US-09 | Doctor       | edit documentation                        | I can correct mistakes                | P1   | Done (week 10)  |
| US-10 | Doctor       | view a patient's appointment history      | I understand previous visits          | P1   | Done (week 9)   |
| US-11 | Doctor       | search for a patient                      | I can find the correct patient        | P2   | Done (week 9)   |
| US-12 | Doctor       | use a documentation template              | repetitive documentation is easier    | P2   | Done (week 11)  |
| US-13 | Doctor       | see previous documentation                | I have context for future visits      | P2   | Done (week 10)  |
| US-14 | Admin        | see appointments across doctors           | I can manage the schedule             | P2   | Done (week 12)  |
| US-15 | Admin        | manage appointment types                  | the organization has fixed categories | P2   | Done (week 12)  |
| US-16 | Doctor       | share a note with another doctor          | a colleague has context for a visit   | P2   | Done (week 12)  |
| US-17 | Doctor/Admin | change the status of an appointment       | the schedule shows what happened      | P2   | Done (v.43)     |

¹ Day view only. The week view was moved to future development (decisions #41).
² 404 for an unknown patient or doctor is planned for week 13 (see acceptance criteria).

## Moved out of the MVP during the project

| Item                                   | Why                                            | Decision |
| -------------------------------------- | ---------------------------------------------- | -------- |
| Calendar week view                     | Admin features and sharing gave more value     | #41      |
| Warning for unsaved changes            | `useBlocker` requires a data router            | #27      |
| Patient login and patient consent      | Needs strong identification and access logging | #18, #38 |
| Admin user management (`/admin/users`) | COULD, not needed for the demo                 | –        |

## Future development

AI-assisted documentation, speech-to-text, video appointments, SMS/email
integration, external healthcare system integrations, advanced permissions,
patient portal with patient-controlled sharing and consent, access logging
(Patient Data Act), calendar week view, warning for unsaved changes,
searchable patient and doctor pickers, mobile app, advanced analytics.
