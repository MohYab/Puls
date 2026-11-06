import type { ReactNode } from "react";
import { formatLongDate } from "../../utils/date";
import { PatientQuickSearch } from "../patients/PatientQuickSearch";

interface DashboardHeaderProps {
  date: Date;
  title: string;
  summary?: string;
  actions?: ReactNode;
}

// Date, greeting or title, one line of summary, patient quick search and the
// main actions (mockup). Both the doctor's and the admin's dashboard use it.
export function DashboardHeader({ date, title, summary, actions }: DashboardHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-muted">{formatLongDate(date)}</p>
        <h1 className="font-display text-2xl font-bold text-ink md:text-[28px]">{title}</h1>
        {summary && <p className="text-muted">{summary}</p>}
      </div>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <div className="w-full sm:w-72">
          <PatientQuickSearch />
        </div>

        {actions && <div className="flex flex-wrap gap-2 *:flex-1 sm:*:flex-none">{actions}</div>}
      </div>
    </div>
  );
}
