import type { CalendarView } from "./constants";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
];

interface ViewSwitchProps {
  value: CalendarView;
  onChange: (view: CalendarView) => void;
}

export function ViewSwitch({ value, onChange }: ViewSwitchProps) {
  return (
    <div role="group" aria-label="Calendar view" className="inline-flex rounded-lg border bg-surface p-0.5">
      {VIEWS.map((view) => {
        const isActive = view.value === value;
        return (
          <button
            key={view.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(view.value)}
            className={`h-9 rounded-md px-3 text-sm font-medium ${
              isActive ? "bg-primary text-white" : "text-muted hover:text-ink"
            }`}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}