import { useId } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { useAuth } from "../features/auth/useAuth";
import { useClinic } from "../features/clinic/useClinic";
import { navItemsForRole, navItemsInSection, type NavItem } from "./navItems";

const ROLE_LABELS = { DOCTOR: "Doctor", ADMIN: "Administrator" } as const;

const itemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors " +
  "focus-visible:outline-white";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? `${itemBase} bg-white/10 font-medium text-white`
    : `${itemBase} text-slate-200 hover:bg-white/5 hover:text-white`;
}

function NavList({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink to={to} className={navLinkClass} onClick={onNavigate}>
            <Icon aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

interface SidebarProps {
  /** Called after a link is clicked, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: clinic } = useClinic();
  const adminHeadingId = useId();

  const items = navItemsForRole(user?.role);
  const mainItems = navItemsInSection(items, "main");
  const adminItems = navItemsInSection(items, "admin");
  const accountItems = navItemsInSection(items, "account");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex h-full flex-col bg-primary text-white">
      <div className="px-5 pb-6 pt-5">
        <div className="font-display text-xl font-bold">Puls</div>
        {clinic && <div className="mt-0.5 truncate text-xs text-slate-300">{clinic.name}</div>}
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
        <NavList items={mainItems} onNavigate={onNavigate} />

        {adminItems.length > 0 && (
          <div className="mt-6">
            <p
              id={adminHeadingId}
              className="mb-2 px-3 text-xs font-semibold tracking-wide text-slate-300 uppercase"
            >
              Administration
            </p>
            <div aria-labelledby={adminHeadingId} role="group">
              <NavList items={adminItems} onNavigate={onNavigate} />
            </div>
          </div>
        )}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user.name}</div>
              <div className="text-xs text-slate-300">{ROLE_LABELS[user.role]}</div>
            </div>
          </div>
          <NavList items={accountItems} onNavigate={onNavigate} />
          <button
            type="button"
            onClick={handleLogout}
            className={`${itemBase} mt-1 w-full text-slate-200 hover:bg-white/5 hover:text-white`}
          >
            <LogOut aria-hidden="true" className="h-4.5 w-4.5 shrink-0" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
