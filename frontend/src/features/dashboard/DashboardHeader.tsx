import type { ReactNode } from "react";
import { formatLongDate } from "../../utils/date";

interface DashboardHeaderProps {
  date: Date;
  title: string;
  summary?: string;
  actions?: ReactNode;
}

// Date, greeting or title, one line of summary, and the main actions (mockup).
export function DashboardHeader({ date, title, summary, actions }: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-muted">{formatLongDate(date)}</p>
        <h1 className="font-display text-2xl font-bold text-ink md:text-[28px]">{title}</h1>
        {summary && <p className="text-muted">{summary}</p>}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap gap-2 sm:w-auto *:flex-1 sm:*:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
