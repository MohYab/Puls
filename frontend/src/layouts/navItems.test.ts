import { describe, expect, it } from "vitest";
import { navItemsForRole, navItemsInSection } from "./navItems";

const paths = (role: Parameters<typeof navItemsForRole>[0]) =>
  navItemsForRole(role).map((item) => item.to);

describe("navItemsForRole", () => {
  it("shows the shared pages and My account to every role", () => {
    for (const role of ["DOCTOR", "ADMIN"] as const) {
      expect(paths(role)).toEqual(
        expect.arrayContaining(["/dashboard", "/calendar", "/patients", "/account"])
      );
    }
  });

  it("shows admin pages only to admins", () => {
    for (const path of ["/admin/doctors", "/admin/appointment-types", "/admin/clinic"]) {
      expect(paths("ADMIN")).toContain(path);
      expect(paths("DOCTOR")).not.toContain(path);
    }
  });

  it("shows no role-restricted pages when the role is unknown", () => {
    expect(paths(undefined).some((path) => path.startsWith("/admin"))).toBe(false);
  });
});

describe("navItemsInSection", () => {
  it("puts every admin page in the Administration section", () => {
    const adminSection = navItemsInSection(navItemsForRole("ADMIN"), "admin").map((i) => i.to);

    expect(adminSection.every((path) => path.startsWith("/admin"))).toBe(true);
    expect(adminSection).toHaveLength(3);
  });

  it("gives a doctor no Administration section", () => {
    expect(navItemsInSection(navItemsForRole("DOCTOR"), "admin")).toEqual([]);
  });
});