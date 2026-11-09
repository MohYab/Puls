// One table style for lists (patients, doctors, appointment types).
// relative: screen-reader-only text (absolutely positioned) is otherwise not
// clipped by the scrolling box and makes the whole page wider on a phone.
export const tableWrapperClassName =
  "relative overflow-x-auto rounded-lg border bg-surface shadow-card";
export const headRowClassName = "border-b text-xs font-semibold uppercase tracking-wide text-muted";
export const cellClassName = "px-4 py-3 md:px-5";
