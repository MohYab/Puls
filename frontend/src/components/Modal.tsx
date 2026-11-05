import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { isTopmostModal, registerModal, unregisterModal } from "./modalStack";
import { X } from "lucide-react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);

  // Keep the latest onClose without re-running the effect (which would steal focus).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const id = registerModal();

    const previouslyFocused = document.activeElement;
    dialogRef.current?.focus();

    // Escape only closes the topmost modal.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isTopmostModal(id)) {
        onCloseRef.current();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unregisterModal(id);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl bg-surface shadow-pop outline-none"
      >
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <h2 id={titleId} className="font-display text-lg font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-subtle hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
