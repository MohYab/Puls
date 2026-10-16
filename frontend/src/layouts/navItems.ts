// Same values as the role in the JWT / AuthUser. If types/auth.ts already
// exports a Role type, import that instead of declaring it here.
export type UserRole = "DOCTOR" | "ADMIN";

export interface NavItem {
  to: string;
  label: string;
  /** Roles that see the item. Omit to show it for every role. */
  roles?: readonly UserRole[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/calendar", label: "Calendar" },
  { to: "/patients", label: "Patients" },
  { to: "/admin/appointment-types", label: "Appointment types", roles: ["ADMIN"] },
];

export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role))
  );
}
