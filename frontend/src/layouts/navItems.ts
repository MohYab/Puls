import {
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../types/auth";

// Kept as an alias so existing imports (RequireRole) keep working.
export type UserRole = Role;

// main: everyday work. admin: configuration (only admins). account: the user's own.
export type NavSection = "main" | "admin" | "account";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  section: NavSection;
  /** Roles that see the item. Omit to show it for every role. */
  roles?: readonly UserRole[];
}

// The menu only lists modules that exist (design-direction.md, decision 4).
export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "main" },
  { to: "/calendar", label: "Calendar", icon: CalendarDays, section: "main" },
  { to: "/patients", label: "Patients", icon: Users, section: "main" },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope, section: "admin", roles: ["ADMIN"] },
  {
    to: "/admin/appointment-types",
    label: "Appointment types",
    icon: ClipboardList,
    section: "admin",
    roles: ["ADMIN"],
  },
  { to: "/admin/clinic", label: "Clinic settings", icon: Building2, section: "admin", roles: ["ADMIN"] },
  { to: "/account", label: "My account", icon: UserRound, section: "account" },
];

export function navItemsForRole(role: UserRole | undefined): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role))
  );
}

export function navItemsInSection(items: NavItem[], section: NavSection): NavItem[] {
  return items.filter((item) => item.section === section);
}