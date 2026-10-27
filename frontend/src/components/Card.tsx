import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  /** Shown at the end of the title row, e.g. a link or a small button. */
  actions?: ReactNode;
  variant?: "default" | "highlight";
  children: ReactNode;
}

export function Card({ title, actions, variant = "default", children }: CardProps) {
  const shape = variant === "highlight" ? "rounded-2xl" : "rounded-lg";
  return (
    <section className={`${shape} border bg-surface p-4 shadow-card md:p-5`}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}