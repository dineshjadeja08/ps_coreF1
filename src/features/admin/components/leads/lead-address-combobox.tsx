"use client";

import { Loader2, MapPin, Search } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { resolveAddressSuggestion, searchAddressSuggestions } from "@/features/addresses/location";
import type { AddressSuggestion } from "@/types/api";

type ResolvedAddress = {
  address: string;
  city: string;
  pincode: string;
  latitude: string;
  longitude: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onResolve: (value: ResolvedAddress) => void;
  error?: string;
};

export function LeadAddressCombobox({ value, onChange, onResolve, error }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const requestId = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 3 || !open) {
      return;
    }
    const currentRequest = ++requestId.current;
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddressSuggestions(query);
        if (requestId.current === currentRequest) setSuggestions(results.slice(0, 5));
      } catch {
        if (requestId.current === currentRequest) setSuggestions([]);
      } finally {
        if (requestId.current === currentRequest) setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [open, value]);

  async function selectSuggestion(suggestion: AddressSuggestion) {
    setSearching(true);
    try {
      const resolved = await resolveAddressSuggestion(suggestion);
      const address = suggestion.description || resolved.address_line_1 || value;
      onResolve({
        address,
        city: resolved.city || suggestion.city,
        pincode: resolved.postal_code || suggestion.pincode,
        latitude: resolved.latitude == null ? "" : String(resolved.latitude),
        longitude: resolved.longitude == null ? "" : String(resolved.longitude),
      });
      setOpen(false);
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      void selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <Input
          id="lead-address"
          role="combobox"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="lead-address-listbox"
          aria-activedescendant={activeIndex >= 0 ? `lead-address-option-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-invalid={Boolean(error)}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            setOpen(true);
            setActiveIndex(-1);
            if (nextValue.trim().length < 3) setSuggestions([]);
          }}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Start typing an address"
          autoComplete="off"
          className="h-[50px] pl-11 pr-11"
        />
        {searching ? <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" /> : null}
      </div>
      {open && suggestions.length ? (
        <div id="lead-address-listbox" role="listbox" className="absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-lg border border-border bg-white shadow-xl">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              id={`lead-address-option-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => void selectSuggestion(suggestion)}
              className={`flex min-h-14 w-full gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-primary-subtle focus:outline-none ${index === activeIndex ? "bg-primary-subtle" : ""}`}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 text-sm leading-5">
                <span className="block font-semibold text-foreground">{suggestion.main_text}</span>
                <span className="line-clamp-2 text-secondary">{suggestion.secondary_text || suggestion.description}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
