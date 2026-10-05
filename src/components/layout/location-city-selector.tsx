"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, LocateFixed, Loader2, MapPin, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { servicePathForLocation } from "@/constants/routes";
import { addressesApi } from "@/features/addresses/api";
import { detectCurrentAddress, resolveAddressSuggestion, searchAddressSuggestions } from "@/features/addresses/location";
import { matchSupportedArea, matchSupportedCity, setSelectedLocation, useSelectedLocation } from "@/features/location/selected-location";
import { cn } from "@/lib/utils";
import type { AddressSuggestion } from "@/types/api";

type LocationCitySelectorProps = { compact?: boolean; className?: string; headerStyle?: boolean };

export function LocationCitySelector({ compact = false, className, headerStyle = false }: LocationCitySelectorProps) {
  const router = useRouter();
  const location = useSelectedLocation();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!open || query.length < 3) return;

    let ignore = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddressSuggestions(query);
        if (!ignore) setSuggestions(results);
      } catch (error) {
        if (!ignore) {
          setSuggestions([]);
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Could not search for this address.");
        }
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [open, searchQuery]);

  async function applyLocation(cityValue: string, postalCode: string, label: string, locality = label) {
    const cleaned = postalCode.trim();
    if (!cleaned) throw new Error("We could not find a pincode for this location. Please search for another nearby address.");

    const availability = await addressesApi.checkServiceability(cleaned);
    if (!availability.is_supported) throw new Error("This location is not serviceable yet.");

    const areaCity = String(availability.service_area?.city ?? cityValue ?? location.city);
    const city = matchSupportedCity(areaCity) ?? location.city;
    const selectedArea = matchSupportedArea(locality, availability.areas) ?? matchSupportedArea(label, availability.areas);
    const locationLabel = selectedArea?.name ?? String(availability.service_area?.name ?? label ?? `${city} ${cleaned}`);
    setSelectedLocation({ city, pincode: cleaned, label: locationLabel, areaSlug: selectedArea?.slug ?? "" });
    setStatus("success");
    setOpen(false);
    const { pathname, search, hash } = window.location;
    const nextPath = servicePathForLocation(pathname, selectedArea?.slug ?? "", city);
    if (nextPath && nextPath !== pathname) {
      router.replace(`${nextPath}${search}${hash}`, { scroll: false });
    }
  }

  async function detectCurrentLocation() {
    setStatus("loading");
    setMessage("");
    try {
      const detected = await detectCurrentAddress();
      const label = detected.locality || detected.address_line_1 || "Current location";
      await applyLocation(detected.city ?? "", detected.postal_code ?? "", label, detected.locality || label);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not detect your current location.");
    }
  }

  async function chooseSuggestion(suggestion: AddressSuggestion) {
    setStatus("loading");
    setMessage("");
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    try {
      const resolved = await resolveAddressSuggestion(suggestion);
      const label = suggestion.main_text || suggestion.description;
      await applyLocation(resolved.city ?? "", resolved.postal_code ?? "", label, resolved.locality || label);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not use this address.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) { setSearchQuery(""); setSuggestions([]); setMessage(""); setStatus("idle"); } }}>
      <Dialog.Trigger asChild>
        <button type="button" className={cn("touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 text-left transition hover:border-primary/30 hover:bg-primary-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", compact ? "h-10" : "h-12", headerStyle && "h-auto min-h-11 border-0 bg-transparent px-0 hover:bg-transparent", className)}>
          <MapPin className={cn("h-4 w-4 shrink-0 text-primary", headerStyle && "h-5 w-5")} />
          <span className="min-w-0">
            {headerStyle ? <><span className="flex items-center gap-1 truncate text-sm font-extrabold text-primary">{location.city}<ChevronDown className="h-3.5 w-3.5" /></span><span className="mt-0.5 block max-w-40 truncate text-[11px] font-medium text-zinc-500">{location.label || (location.pincode ? `Service area · ${location.pincode}` : "Choose your service location")}</span></> : <><span className="block truncate text-xs font-semibold text-muted-foreground">Location</span><span className="block truncate text-sm font-bold text-foreground">{location.label || location.city}</span></>}
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[calc(var(--z-overlay)+1)] max-h-[90dvh] overflow-y-auto rounded-t-xl border border-border bg-surface p-5 shadow-[var(--shadow-float)] focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl">
          <div className="flex items-start justify-between gap-4"><div><Dialog.Title className="text-xl font-bold text-foreground">Choose service location</Dialog.Title><Dialog.Description className="mt-1 text-sm leading-6 text-secondary">Use your current location or search for your area, street, or landmark.</Dialog.Description></div><Dialog.Close asChild><Button type="button" variant="ghost" size="icon" aria-label="Close location selector"><X className="h-5 w-5" /></Button></Dialog.Close></div>

          <Button type="button" variant="outline" className="mt-5 h-14 w-full justify-start gap-3" onClick={() => void detectCurrentLocation()} disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <LocateFixed className="h-5 w-5 text-primary" />}
            {status === "loading" ? "Finding your location..." : "Use current location"}
          </Button>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value;
                setSearchQuery(value);
                setMessage("");
                if (value.trim().length < 3) setSuggestions([]);
              }}
              className="h-12 pl-10 pr-10"
              placeholder="Search for area, street or landmark"
              autoComplete="off"
            />
            {searching ? <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" /> : null}
            {suggestions.length ? (
              <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
                {suggestions.map((suggestion) => (
                  <button key={suggestion.id} type="button" className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-primary-subtle" onClick={() => void chooseSuggestion(suggestion)}>
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold text-foreground">{suggestion.main_text}</span><span className="mt-0.5 block truncate text-xs text-secondary">{suggestion.secondary_text || suggestion.description}</span></span>
                  </button>
                ))}
                <div className="border-t border-border px-3 py-2 text-right text-[10px] font-semibold text-muted-foreground">Powered by Google</div>
              </div>
            ) : null}
          </div>

          {message ? <p className={cn("mt-4 rounded-lg p-3 text-sm", status === "error" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>{message}</p> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
