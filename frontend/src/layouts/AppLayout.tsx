import { Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate } from "react-router-dom";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white p-4 flex flex-col gap-2">
        <div className="text-lg font-semibold mb-4">Puls</div>
        <nav className="flex flex-col gap-1">
          <a href="/dashboard" className="hover:bg-gray-800 rounded px-2 py-1">
            Dashboard
          </a>
          <a href="/calendar" className="hover:bg-gray-800 rounded px-2 py-1">
            Calendar
          </a>
          <a href="/patients" className="hover:bg-gray-800 rounded px-2 py-1">
            Patients
          </a>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center px-6 py-3 border-b bg-white">
          <span className="text-sm text-gray-500">Prototype – test data only</span>
          <div className="flex items-center gap-3">
            <span className="text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
