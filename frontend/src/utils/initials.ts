// "Dr. Anna Andersson" → "AA", "Johan" → "J". Titles such as "Dr." are skipped.
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word && !word.endsWith("."));
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}
