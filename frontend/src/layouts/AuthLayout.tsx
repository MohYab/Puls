import { Outlet } from "react-router-dom";
import { Activity } from "lucide-react";
import { useClinic } from "../features/clinic/useClinic";

export function AuthLayout() {
  const { data: clinic } = useClinic();

  return (
    // dvh: the mobile address bar does not add a scrollbar.
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-accent text-white">
          <Activity aria-hidden="true" className="size-6" />
        </span>
        {/* Not a heading: the page's h1 is "Log in" in the card. */}
        <div>
          <p className="font-display text-2xl font-bold text-ink">Puls</p>
          <p className="mt-0.5 text-sm text-muted">
            {clinic?.name ?? "Appointments and visit documentation"}
          </p>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-surface p-6 shadow-card">
        <Outlet />
      </div>

      {/* Shown before anyone can type anything (ethics: fictional data only). */}
      <p className="flex max-w-sm flex-col items-center gap-1.5 text-center text-xs text-muted">
        {/* Same classes as the label in the app header. */}
        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
          Prototype – test data only
        </span>
        Never enter real patient details.
      </p>
    </main>
  );
}
