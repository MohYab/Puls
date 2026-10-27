import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { Sidebar } from "./Sidebar";

// Matches Tailwind's md breakpoint (768px), where the fixed sidebar takes over.
const DESKTOP_QUERY = "(min-width: 768px)";

interface MobileNavDrawerProps {
  id: string;
  isOpen: boolean;
  /** Must be stable (useCallback), since it is an effect dependency. */
  onClose: () => void;
}

export function MobileNavDrawer({ id, isOpen, onClose }: MobileNavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  useFocusTrap(panelRef, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    // If the window grows to desktop width, the drawer is hidden by CSS;
    // close it so the open state and the scroll lock do not linger.
    const desktop = window.matchMedia(DESKTOP_QUERY);
    function handleDesktopChange(event: MediaQueryListEvent) {
      if (event.matches) onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleDesktopChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleDesktopChange);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        className="relative h-full w-72 max-w-[85%] shadow-pop"
      >
        {/* Before the links in the DOM so Tab goes from ✕ to the first link. */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute end-3 top-4 rounded-lg p-2 text-white hover:bg-white/10 focus-visible:outline-white"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
        <Sidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
