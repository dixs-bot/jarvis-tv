"use client";

import { forwardRef } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
  autoFocus?: boolean;
}

export const SearchBox = forwardRef<HTMLInputElement, Props>(function SearchBox(
  { value, onChange, placeholder = "Search channels…", label, autoFocus },
  ref,
) {
  return (
    <div className="search">
      <SearchIcon className="search__icon" />
      <input
        ref={ref}
        data-focusable
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        className="search__input"
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search__clear" data-focusable onClick={() => onChange("")} aria-label="Clear search">
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
});
