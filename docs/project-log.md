# Project log – Puls

Format for each entry: what I did, why, problems and solutions, technical
decisions, what I learned, feedback, scope changes.

---

## Week 1 – Pre-study and scope

**Period:** vecka 36 2026

### Summary of the week

This week I defined what Puls is and what it is not. I created the repository,
wrote a project brief, put the backlog and the most important acceptance
criteria into the repo, and prepared the first meeting with my supervisor.
No application code has been written yet, on purpose: the goal of week 1 was
to make sure the scope is clear before design and setup start.

The result is a defined MVP (login, dashboard, calendar, appointment booking,
patients, documentation) with 15 user stories, prioritised into P1 (must have)
and P2 (should have), and a clear list of what is out of scope.

### Entry 1: Repository and project structure

**What I did**
- Created the GitHub repository "Puls".
- Added README.md, .gitignore and this project log.

**Why**
- To have a clear starting point and to document the work from day one, so
  the final report can be based on this log.
- .gitignore was added early so that .env files and node_modules are never
  committed by mistake.

**Technical decisions**
- Project name: Puls.
- Monorepo with separate /frontend and /backend folders (to be created in
  week 3, not before).
- README states clearly that this is a prototype using test data only.

### Entry 2: Project brief

**What I did**
- Wrote docs/project-brief.md: problem, goal, target users, roles, MVP scope
  and constraints.

**Why**
- To agree on one shared description of the project before designing
  anything. It also becomes the base for the Introduction in the report.

**Technical decisions**
- Definition of done for the MVP: a ~5 minute demo (login → dashboard →
  create appointment → open appointment → write documentation → view history)
  that runs without errors.

### Entry 3: Backlog and user stories

**What I did**
- Wrote docs/backlog.md with 15 user stories (US-01 to US-15) and a list of
  future development that is out of scope.
- Set up a GitHub Project board (ToDo / In Progress / Review / Done).

**Why**
- To have a prioritised list of work that I can follow during the project.

**Technical decisions**
- The backlog is a Markdown file in the repo, not 15 GitHub issues created
  upfront. Requirements often change, so I will write acceptance criteria and
  create an issue right before each story is built. This avoids planning work
  in detail that may be changed later.
- Priorities: P1 = US-01 to US-10, P2 = US-11 to US-15. P3 features (AI,
  speech-to-text, video, SMS, integrations, patient portal, mobile app) are
  out of scope.

### Entry 4: Acceptance criteria

**What I did**
- Wrote docs/acceptance-criteria.md for US-01 (log in), US-05 (create
  appointment) and US-08 (create documentation).

**Why**
- These three stories cover the core of the system: authentication, booking
  and documentation. They also show how the parts connect.
- The criteria will be reused as test cases in week 13.

**Technical decisions (proposed, to be confirmed with supervisor)**
- Doctors can only book for themselves; admins can book for any doctor.
- Booking in the past is not allowed.
- Overlapping appointments for the same doctor are rejected (HTTP 409);
  cancelled appointments do not block a time slot.
- One clinical note per appointment.
- Admins cannot read clinical notes (403). Reason: authentication (who you
  are) and authorization (what you may see) are separate, and an
  administrator should not need access to clinical text.


### Entry 5: Supervisor meeting preparation

**What I did**
- Wrote docs/supervisor-meeting-1.md with an agenda and 11 questions about
  scope, requirements and practical matters.
- Booked the meeting: 

**Why**
- To get concrete feedback on scope and to settle open design questions
  (one note per visit, bookings in the past, admin access to notes) before
  the database is designed.

### Problems and solutions

- (none so far – add anything that came up, for example Git/GitHub setup
  issues)

### What I learned

- (why acceptance criteria help, how to separate
  MVP from future features, difference between authentication and
  authorization)

### Feedback from supervisor

- 

### Scope changes

- No changes to the MVP scope yet.
- Open questions that may change scope after the supervisor meeting:
  one note per visit, bookings in the past, admin access to notes.

### What I would do differently

- 

### Next week (week 2)

- User flows and wireframes (login, dashboard, calendar, booking form,
  documentation).
- ER diagram and architecture diagram.
- Write docs/decisions.md with the key technical decisions.