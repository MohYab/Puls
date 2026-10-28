import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/Button";

interface CalendarToolbarProps {
  /** "Tuesday 27 October 2026" or "26 Oct – 1 Nov 2026". */
  title: string;
  unit: "day" | "week";
  /** Today is already visible, so the Today button is disabled. */
  isCurrent: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  /** Shown at the end of the row: the view switch and the admin's doctor filter. */
  children?: ReactNode;
}

const iconButtonClass =
  "inline-flex size-10 items-center justify-center rounded-lg border bg-surface text-ink hover:bg-subtle";

export function CalendarToolbar({
  title,
  unit,
  isCurrent,
  onPrev,
  onNext,
  onToday,
  children,
}: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            aria-label={`Previous ${unit}`}
            className={iconButtonClass}
          >
            <ChevronLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
          <Button variant="secondary" onClick={onToday} disabled={isCurrent}>
            Today
          </Button>
          <button
            type="button"
            onClick={onNext}
            aria-label={`Next ${unit}`}
            className={iconButtonClass}
          >
            <ChevronRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </button>
        </div>
        <h2 aria-live="polite" className="text-lg font-semibold text-ink">
          {title}
        </h2>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}