import { describe, expect, it } from "vitest";
import { navItemsForRole } from "./navItems";

const paths = (role: Parameters<typeof navItemsForRole>[0]) =>
  navItemsForRole(role).map((item) => item.to);

describe("navItemsForRole", () => {
  it("shows the shared pages to every role", () => {
    for (const role of ["DOCTOR", "ADMIN"] as const) {
      expect(paths(role)).toEqual(expect.arrayContaining(["/dashboard", "/calendar", "/patients"]));
    }
  });

  it("shows admin pages only to admins", () => {
    expect(paths("ADMIN")).toContain("/admin/appointment-types");
    expect(paths("DOCTOR")).not.toContain("/admin/appointment-types");
  });

  it("shows no role-restricted pages when the role is unknown", () => {
    expect(paths(undefined)).not.toContain("/admin/appointment-types");
  });
});
