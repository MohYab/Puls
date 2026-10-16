import { Outlet } from "react-router-dom";
import { StateMessage } from "../../components/StateMessage";
import type { UserRole } from "../../layouts/navItems";
import { useAuth } from "./useAuth";

// Layout route for pages that only some roles may open.
// The backend enforces the same rule; this only avoids showing a broken page.
export function RequireRole({ roles }: { roles: readonly UserRole[] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <StateMessage title="No access" text="You do not have access to this page." />;
  }

  return <Outlet />;
}
