import { describe, expect, it } from "vitest";
import { filterOptions, normalizeSearch, type SearchOption } from "./searchOptions";

const options: SearchOption[] = [
  { value: "1", label: "Anna Andersson", description: "1985-03-12" },
  { value: "2", label: "Anna Berg", description: "1990-07-01" },
  { value: "3", label: "Erik Åhman", description: "1978-11-23" },
  { value: "4", label: "José Ramírez" },
];

const values = (result: SearchOption[]) => result.map((o) => o.value);

describe("normalizeSearch", () => {
  it("lowercases and removes diacritics", () => {
    expect(normalizeSearch("  Åhman José  ")).toBe("ahman jose");
  });

  it("removes Arabic vowel marks", () => {
    // "مُحَمَّد" with marks becomes "محمد"
    expect(normalizeSearch("\u0645\u064F\u062D\u064E\u0645\u0651\u064E\u062F")).toBe(
      "\u0645\u062D\u0645\u062F"
    );
  });
});

describe("filterOptions", () => {
  it("returns all options for an empty or blank query", () => {
    expect(filterOptions(options, "")).toBe(options);
    expect(filterOptions(options, "   ")).toBe(options);
  });

  it("ignores case and diacritics", () => {
    expect(values(filterOptions(options, "AHMAN"))).toEqual(["3"]);
    expect(values(filterOptions(options, "ramirez"))).toEqual(["4"]);
  });

  it("matches every word in any order", () => {
    expect(values(filterOptions(options, "anna"))).toEqual(["1", "2"]);
    expect(values(filterOptions(options, "andersson anna"))).toEqual(["1"]);
  });

  it("searches the description", () => {
    expect(values(filterOptions(options, "anna 1990"))).toEqual(["2"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterOptions(options, "zz")).toEqual([]);
  });
});
