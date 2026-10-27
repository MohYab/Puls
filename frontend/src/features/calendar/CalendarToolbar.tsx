import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/Button";
import { formatLongDate } from "../../utils/date";

interface CalendarToolbarProps {
  date: Date;
  isToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  /** Shown at the end of the row, e.g. the admin's doctor filter. */
  children?: ReactNode;
}

const iconButtonClass =
  "inline-flex size-10 items-center justify-center rounded-lg border bg-surface text-ink hover:bg-subtle";

export function CalendarToolbar({
  date,
  isToday,
  onPrevDay,
  onNextDay,
  onToday,
  children,
}: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevDay}
            aria-label="Previous day"
            className={iconButtonClass}
          >
            <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
          <Button variant="secondary" onClick={onToday} disabled={isToday}>
            Today
          </Button>
          <button
            type="button"
            onClick={onNextDay}
            aria-label="Next day"
            className={iconButtonClass}
          >
            <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
        </div>
        <h2 aria-live="polite" className="text-lg font-semibold text-ink">
          {formatLongDate(date)}
        </h2>
      </div>
      {children}
    </div>
  );
}
