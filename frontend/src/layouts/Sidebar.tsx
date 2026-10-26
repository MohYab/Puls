import { NavLink } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { navItemsForRole } from "./navItems";
import { useClinic } from "../features/clinic/useClinic";

interface SidebarProps {
  /** Called after a link is clicked, e.g. to close the mobile drawer. */
  onNavigate?: () => void;
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded px-2 py-1 hover:bg-gray-800 ${isActive ? "bg-gray-800 font-medium" : ""}`;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user } = useAuth();
  const items = navItemsForRole(user?.role);
  const { data: clinic } = useClinic();

  return (
    <div className="flex h-full flex-col gap-2 bg-gray-900 p-4 text-white">
        <div className="mb-4">
          <div className="text-lg font-semibold">Puls</div>
          {clinic && <div className="text-xs text-gray-300">{clinic.name}</div>}
        </div>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={onNavigate}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
