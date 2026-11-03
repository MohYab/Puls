export interface SearchOption {
  value: string;
  label: string;
  /** Second line under the label, e.g. a date of birth. Also searched. */
  description?: string;
}

/**
 * Lowercase and remove diacritics so that "ahman" finds "Åhman", "jose" finds
 * "José" and Arabic text matches with or without vowel marks.
 */
export function normalizeSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase().trim();
}

/**
 * Every word in the query must appear in the label or the description, in any
 * order. An empty query returns all options unchanged.
 */
export function filterOptions(options: SearchOption[], query: string): SearchOption[] {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return options;

  return options.filter((option) => {
    const text = normalizeSearch(`${option.label} ${option.description ?? ""}`);
    return words.every((word) => text.includes(word));
  });
}
