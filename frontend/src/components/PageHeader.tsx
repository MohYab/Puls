import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Primary action(s), shown at the end of the row (full width on mobile). */
  actions?: ReactNode;
  back?: { to: string; label: string };
}

// The same heading row on every page (design-direction.md, Layout).
export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink md:text-[28px]">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {actions && (
          <div className="flex w-full flex-wrap gap-2 sm:w-auto *:flex-1 sm:*:flex-none">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
