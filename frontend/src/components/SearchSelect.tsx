import { useLayoutEffect, useRef, useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { inputClassName } from "./formStyles";
import { filterOptions, type SearchOption } from "../utils/searchOptions";

interface SearchSelectProps {
  id: string;
  options: SearchOption[];
  /** The selected option's value, or "" for none. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Start of the message when nothing matches, e.g. "No patients match". */
  noMatchLabel: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function SearchSelect({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  noMatchLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: SearchSelectProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === value) ?? null;
  const filtered = filterOptions(options, query);
  const showNoMatch = query.trim() !== "" && filtered.length === 0;
  const noMatchId = `${id}-no-match`;
  const describedBy =
    [ariaDescribedBy, showNoMatch ? noMatchId : null].filter(Boolean).join(" ") || undefined;

  // Headless UI sets aria-describedby on the input from its own <Description>
  // components and overwrites ours, so the field's error and hint would not be
  // read out. Set it on the element after every render instead.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (describedBy) input.setAttribute("aria-describedby", describedBy);
    else input.removeAttribute("aria-describedby");
  });

  return (
    <Combobox
      value={selected}
      onChange={(option: SearchOption | null) => onChange(option?.value ?? "")}
      onClose={() => setQuery("")}
      disabled={disabled}
      immediate
    >
      <div className="relative">
        <ComboboxInput
          ref={inputRef}
          id={id}
          displayValue={(option: SearchOption | null) => option?.label ?? ""}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={ariaInvalid}
          className={`${inputClassName} pe-9`}
        />
        <ComboboxButton
          aria-label="Show options"
          className="absolute inset-y-0 inset-e-0 flex items-center px-2.5 text-muted"
        >
          <ChevronUpDownIcon />
        </ComboboxButton>
      </div>

      <ComboboxOptions
        anchor="bottom start"
        modal={false}
        className="z-50 max-h-64 w-(--input-width) overflow-auto rounded-lg border bg-surface p-1 text-sm shadow-lg [--anchor-gap:4px] empty:invisible"
      >
        {filtered.map((option) => (
          <ComboboxOption
            key={option.value}
            value={option}
            className="group flex cursor-default items-start gap-2 rounded-md px-2 py-1.5 data-focus:bg-subtle"
          >
            <CheckIcon />
            <span className="min-w-0">
              <span className="block truncate text-ink group-data-selected:font-semibold">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-xs text-muted">{option.description}</span>
              )}
            </span>
          </ComboboxOption>
        ))}
      </ComboboxOptions>

      {showNoMatch && (
        <p id={noMatchId} role="status" className="mt-1 text-sm text-muted">
          {noMatchLabel} "{query.trim()}".
        </p>
      )}
    </Combobox>
  );
}

function ChevronUpDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M6 8l4-4 4 4M6 12l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="invisible mt-0.5 size-4 shrink-0 text-accent group-data-selected:visible"
    >
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
