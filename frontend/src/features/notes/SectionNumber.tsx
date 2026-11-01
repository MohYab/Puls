// The number is visual order only, so screen readers skip it.
export function SectionNumber({ number }: { number: number }) {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-subtle text-xs font-bold text-ink"
    >
      {number}
    </span>
  );
}
