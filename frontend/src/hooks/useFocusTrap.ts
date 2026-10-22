import { useEffect, type RefObject } from "react";

// Everything that can receive focus with Tab, except disabled controls.
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

// Active traps, most recently opened last. Only the topmost one handles Tab,
// so a dialog opened on top of another dialog keeps the focus to itself.
const activeTraps: symbol[] = [];

/**
 * Keeps Tab and Shift+Tab inside `containerRef` while `active` is true, and
 * wraps from the last focusable element to the first and back.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active) return;

    const id = Symbol("focus-trap");
    activeTraps.push(id);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      if (activeTraps[activeTraps.length - 1] !== id) return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        // Nothing to move to: keep the focus on the container itself.
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      const isInside = current instanceof Node && container.contains(current);

      // Focus is on the container itself (as when a modal opens) or has
      // escaped somehow: bring it to the first or last element.
      if (!isInside || current === container) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      activeTraps.splice(activeTraps.indexOf(id), 1);
    };
  }, [active, containerRef]);
}