import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Badge } from "../../components/Badge";
import { inputClassName } from "../../components/formStyles";
import { hasOpenModal } from "../../components/modalStack";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { Patient } from "../../types/patient";
import { toPatientOption } from "./patientOptions";
import { usePatients } from "./usePatients";

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS = 8;
const DEBOUNCE_MS = 250;

const IS_APPLE = typeof navigator !== "undefined" && /Mac|iPhone|iPad/i.test(navigator.userAgent);
const SHORTCUT_LABEL = IS_APPLE ? "⌘K" : "Ctrl K";

// Search patients by name, birth year or date of birth from anywhere on the
// dashboard, and open the selected patient's page. Ctrl+K / ⌘K focuses the field.
export function PatientQuickSearch() {
  const id = useId();
  const statusId = `${id}-status`;
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const term = query.trim();
  const debouncedTerm = useDebouncedValue(term, DEBOUNCE_MS);
  const canSearch = debouncedTerm.length >= MIN_SEARCH_LENGTH;

  const { data, isFetching, isError } = usePatients(canSearch ? debouncedTerm : undefined, {
    includeInactive: true,
    enabled: canSearch,
  });

  // keepPreviousData can still hold an older result, so only show data for a valid search.
  const matches = canSearch && !isError ? (data ?? []) : [];
  const results = matches.slice(0, MAX_RESULTS);
  const isSearching = term.length >= MIN_SEARCH_LENGTH && (debouncedTerm !== term || isFetching);

  const message = statusMessage({
    term,
    isSearching,
    isError,
    total: matches.length,
    shown: results.length,
  });

  // Headless UI overwrites aria-describedby on the input (see SearchSelect),
  // so set it on the element after every render.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (message) input.setAttribute("aria-describedby", statusId);
    else input.removeAttribute("aria-describedby");
  });

  // Ctrl+K / ⌘K. A modifier is required: single-key shortcuts conflict with
  // screen reader and speech input commands (WCAG 2.1.4).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut =
        event.key.toLowerCase() === "k" &&
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey;
      // Focus must stay inside an open modal's focus trap.
      if (!isShortcut) return;
      event.preventDefault();
      if (hasOpenModal()) return;
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function openPatient(patient: Patient | null) {
    if (!patient) return;
    setQuery("");
    navigate(`/patients/${patient.id}`);
  }

  return (
    <div role="search" className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Search patients
      </label>

      <Combobox value={null} onChange={openPatient} onClose={() => setQuery("")}>
        {/* Headless UI selects the active option on Tab, which here would open a
            patient. Stop Tab before it reaches the input's handlers, but keep the
            browser's default so focus still moves on. */}
        <div
          className="relative"
          onKeyDownCapture={(event) => {
            if (event.key === "Tab") event.stopPropagation();
          }}
        >
          <SearchIcon />
          <ComboboxInput
            ref={inputRef}
            id={id}
            displayValue={() => ""}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patients"
            autoComplete="off"
            aria-keyshortcuts="Control+K Meta+K"
            className={`${inputClassName} ps-9 sm:pe-16`}
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 inset-e-2 my-auto hidden h-6 items-center rounded border bg-subtle px-1.5 font-sans text-xs text-muted sm:flex"
          >
            {SHORTCUT_LABEL}
          </kbd>
        </div>

        <ComboboxOptions
          anchor="bottom start"
          modal={false}
          className="z-50 max-h-80 w-(--input-width) min-w-64 overflow-auto rounded-lg border bg-surface p-1 text-sm shadow-lg [--anchor-gap:4px] empty:invisible"
        >
          {results.map((patient) => {
            const option = toPatientOption(patient);
            return (
              <ComboboxOption
                key={patient.id}
                value={patient}
                className="flex cursor-default flex-col rounded-md px-2 py-1.5 data-focus:bg-subtle"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`truncate ${patient.isActive ? "text-ink" : "text-muted"}`}>
                    {option.label}
                  </span>
                  {!patient.isActive && <Badge>Inactive</Badge>}
                </span>
                <span className="text-xs text-muted">{option.description}</span>
              </ComboboxOption>
            );
          })}
        </ComboboxOptions>
      </Combobox>

      {/* Always in the DOM so screen readers announce changes to it. From sm it
          floats under the field so the header does not jump when a message appears. */}
      <p
        id={statusId}
        role="status"
        className="mt-1 text-xs text-muted empty:hidden sm:absolute sm:inset-x-0 sm:top-full"
      >
        {message}
      </p>
    </div>
  );
}

interface StatusInput {
  term: string;
  isSearching: boolean;
  isError: boolean;
  total: number;
  shown: number;
}

function statusMessage({ term, isSearching, isError, total, shown }: StatusInput): string | null {
  if (term === "") return null;
  if (term.length < MIN_SEARCH_LENGTH) {
    return `Type at least ${MIN_SEARCH_LENGTH} characters to search.`;
  }
  if (isError && !isSearching) return "Couldn't search patients. Try again in a moment.";
  if (shown === 0) return isSearching ? "Searching…" : `No patients match "${term}".`;
  if (total > shown) return `Showing ${shown} of ${total}. Keep typing to narrow the search.`;
  return null;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 inset-s-2.5 my-auto size-4 text-muted"
    >
      <circle cx="9" cy="9" r="5.5" />
      <path d="M13 13l3.5 3.5" strokeLinecap="round" />
    </svg>
  );
}
