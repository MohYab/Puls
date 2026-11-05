import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
  it("uses the first and last name and skips titles", () => {
    expect(initials("Anna Andersson")).toBe("AA");
    expect(initials("Dr. Erik Lindqvist")).toBe("EL");
    expect(initials("Johan")).toBe("J");
    expect(initials("  ")).toBe("");
  });
});
