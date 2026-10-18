import { useCallback, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { Sidebar } from "./Sidebar";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { ErrorBoundary } from "../components/ErrorBoundary";

const MOBILE_NAV_ID = "mobile-nav";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 md:block">
        <Sidebar />
      </aside>

      <MobileNavDrawer id={MOBILE_NAV_ID} isOpen={isMenuOpen} onClose={closeMenu} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              aria-controls={MOBILE_NAV_ID}
              className="-ml-2 rounded p-2 hover:bg-gray-100 md:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="truncate text-xs text-gray-500 md:text-sm">
              Prototype – test data only
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="whitespace-nowrap text-sm text-gray-500 hover:text-gray-900"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {/* key: a new page gets a fresh boundary, so navigating away clears the error. */}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
