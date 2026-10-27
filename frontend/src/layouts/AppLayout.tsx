import { useCallback, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { Sidebar } from "./Sidebar";

const MOBILE_NAV_ID = "mobile-nav";

export function AppLayout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* First focusable element: lets keyboard users jump past the menu. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-pop"
      >
        Skip to main content
      </a>

      {/* Sticky, so the user and Log out stay visible on long pages. */}
      <aside className="hidden w-64 shrink-0 md:sticky md:top-0 md:block md:h-screen">
        <Sidebar />
      </aside>

      <MobileNavDrawer id={MOBILE_NAV_ID} isOpen={isMenuOpen} onClose={closeMenu} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b bg-surface px-4 md:justify-end md:px-8">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_NAV_ID}
            className="-ms-2 rounded-lg p-2 text-ink hover:bg-subtle md:hidden"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>

          {/* Part of the project's ethical boundary: always visible. */}
          <span className="truncate rounded-full bg-no-show-bg px-3 py-1 text-xs font-medium text-no-show">
            Prototype – test data only
          </span>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 outline-none md:p-6 lg:p-8"
        >
          {/* key: a new page gets a fresh boundary, so navigating away clears the error. */}
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}