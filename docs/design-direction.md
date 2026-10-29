# Design direction – Puls

The visual direction and the design decisions for the redesign (phase 3).
The mockups are in `docs/design/`. This document is the source of truth when
the mockups and the code disagree.

**Direction:** calm, clinical and clear. A navy sidebar, light work surfaces,
a petrol accent, generous spacing and consistent components. Healthcare
workplace UX before visual effects.

## Design decisions

1. **Colour shows the booking status, nothing else.** Calendar blocks,
   badges and history rows are coloured by the appointment status. Whether a
   visit has a note is shown with an icon and a text ("Note", "To document"),
   never with a colour.
2. **Red only for errors and destructive actions.** A cancelled appointment is
   a normal outcome and is grey.
3. **The dashboard shows the work, Administration configures the system.**
   The admin dashboard shows today's operations (appointments by status,
   doctors today). Doctors, appointment types and clinic settings live only
   under the Administration section of the menu.
4. **The menu only shows modules that exist.** No empty "Reports" or
   "Tasks" pages. Main: Dashboard, Calendar, Patients. Administration (admin
   only): Doctors, Appointment types, Clinic settings. The user's name, My
   account and Log out are at the bottom of the sidebar.
5. **Say exactly what is locked.** The documentation template is locked after
   the first save; the note can still be edited by its author. Every save
   updates "Last saved".
6. **Logical directions.** Use `ms-`/`me-`, `ps-`/`pe-`, `inset-s-`/`inset-e-` and
   `text-start` instead of left and right, so a right-to-left language
   (Arabic) can be added later without rewriting the layout.
7. **Fonts are delivered with the app** (`@fontsource`), not loaded from
   Google Fonts, so no visitor's IP address is sent to a third party.
8. **Every component has all its states designed**, not only the default:
   hover, focus, disabled, loading, empty, error and no access.

## Tokens

Defined once in `frontend/src/index.css` with Tailwind v4 `@theme`, and used
as classes (`bg-surface`, `text-muted`, `border-border`).

| Token     | Value     | Use                                           |
| --------- | --------- | --------------------------------------------- |
| `primary` | `#0F2942` | Sidebar, primary buttons, headings            |
| `accent`  | `#0F766E` | Links, focus ring, highlights, accent buttons |
| `ink`     | `#0B1C30` | Body text                                     |
| `muted`   | `#64748B` | Secondary text, form control borders          |
| `canvas`  | `#F8FAFC` | Page background                               |
| `surface` | `#FFFFFF` | Cards, dialogs, inputs                        |
| `subtle`  | `#F1F5F9` | Table headers, hover, inactive rows           |
| `border`  | `#E2E8F0` | Decorative borders and dividers               |
| `danger`  | `#B91C1C` | Errors and destructive actions only           |

### Appointment status

Text colour on a tinted background. Every pair meets WCAG AA (4.5:1).

| Status    | Text      | Background | Contrast |
| --------- | --------- | ---------- | -------- |
| Scheduled | `#0369A1` | `#F0F9FF`  | 5.57     |
| Confirmed | `#0F766E` | `#F0FDFA`  | 5.25     |
| Completed | `#047857` | `#ECFDF5`  | 5.21     |
| No-show   | `#B45309` | `#FFFBEB`  | 4.84     |
| Cancelled | `#475569` | `#F1F5F9`  | 6.92     |

### Contrast rules

- Text: at least 4.5:1 (WCAG 1.4.3).
- Borders of inputs and buttons: at least 3:1 (WCAG 1.4.11). Decorative
  borders may be lighter.
- White on `primary` 14.83, on `accent` 5.47, on `danger` 6.47.

## Typography

| Role    | Font                  | Weight | Size  |
| ------- | --------------------- | ------ | ----- |
| Display | Plus Jakarta Sans     | 700    | 36 px |
| Heading | Plus Jakarta Sans     | 700    | 28 px |
| Title   | Plus Jakarta Sans     | 600    | 18 px |
| Body    | Inter                 | 400    | 14 px |
| Label   | Inter, upper case     | 600    | 12 px |
| Numbers | Inter, `tabular-nums` | –      | –     |

Times, measurements and counts use tabular numbers so they line up in columns.

**Dates and times:** one format in the whole app, all from `utils/date.ts`.
Dates "22 Oct 2026", with weekday "Thu 22 Oct 2026"; times 24-hour "10:30";
ranges "10:30–11:15"; date of birth "1985-03-12".

## Shape and elevation

| Token                           | Value                       |
| ------------------------------- | --------------------------- |
| Radius (cards, buttons, inputs) | 8 px                        |
| Radius (highlight cards)        | 16 px                       |
| Card                            | 1 px `border`, light shadow |
| Popover and dialog              | Stronger shadow             |
| Button and input height         | 40 px                       |

## Components and their states

| Component                       | Variants                                      | States                                          |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| `Button`                        | primary, accent, secondary, ghost, danger     | hover, focus, disabled, pending ("Saving…")     |
| `Badge`                         | one per appointment status; neutral; inactive | –                                               |
| `Input`, `Select`, `Textarea`   | with unit ("mmHg")                            | focus, error (red border and message), disabled |
| `Card`                          | default, highlight                            | –                                               |
| `Avatar`                        | initials                                      | –                                               |
| `Dialog` (Modal, ConfirmDialog) | default, destructive                          | open with focus trap, pending, error            |
| `Combobox`                      | doctors, patients                             | open, active option, no match, loading          |
| Feedback                        | loading, empty, error with "Try again"        | –                                               |
| `StateMessage`                  | not found, no access                          | –                                               |

**Focus:** every interactive element shows a 2 px `accent` ring with 2 px
offset when focused with the keyboard (`focus-visible`).

**Icons:** `lucide-react`, 16–20 px, always with a text label or an
`aria-label`.

## Layout

- Desktop first, works from 375 px. Below 768 px the sidebar becomes the
  drawer.
- Page: heading and short description at the top, primary action at the end
  of the same row (full width on mobile).
- Detail panels (calendar) are a side panel on desktop and a dialog on mobile.
