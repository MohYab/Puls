import { initials } from "../utils/initials";

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm" } as const;

// Decorative: the name is always shown next to it, so screen readers skip it.
export function Avatar({ name, size = "md" }: { name: string; size?: keyof typeof sizes }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-subtle font-semibold text-accent ${sizes[size]}`}
    >
      {initials(name)}
    </span>
  );
}
