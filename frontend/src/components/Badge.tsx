import type { ReactNode } from "react";

export type BadgeTone =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "no-show"
  | "cancelled"
  | "neutral"
  | "accent";

const tones: Record<BadgeTone, string> = {
  scheduled: "bg-scheduled-bg text-scheduled",
  confirmed: "bg-confirmed-bg text-confirmed",
  completed: "bg-completed-bg text-completed",
  "no-show": "bg-no-show-bg text-no-show",
  cancelled: "bg-cancelled-bg text-cancelled",
  neutral: "bg-subtle text-ink",
  accent: "bg-accent-subtle text-accent",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}