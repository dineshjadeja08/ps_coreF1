"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, ChevronDown, Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceCities } from "@/config/design";
import { addressesApi } from "@/features/addresses/api";
import { detectCurrentAddress, resolveAddressSuggestion, searchAddressSuggestions } from "@/features/addresses/location";
import { usePublicServiceAreas } from "@/features/catalogue/queries";
import { matchSupportedCity, setSelectedLocation, useSelectedLocation } from "@/features/location/selected-location";
import { cn } from "@/lib/utils";
import type { AddressSuggestion } from "@/types/api";

type LocationCitySelectorProps = { compact?: boolean; className?: string; headerStyle?: boolean };

export function LocationCitySelector({ compact = false, className, headerStyle = false }: LocationCitySelectorProps) {
  const location = useSelectedLocation();
  const [open, setOpen] = useState(false);
  const [pincode, setPincode] = useState(location.pincode);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");
  const serviceAreas = usePublicServiceAreas(location.city);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddressSuggestions(query);
        if (active) setSuggestions(results);
      } catch (error) {
        if (active) {
          setSuggestions([]);
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "Address search is temporarily unavailable.");
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  function chooseCity(city: string) {
    setSelectedLocation({ city });
    setOpen(false);
  }

  async function applyDetectedLocation(values: { city?: string; postal_code?: string; locality?: string; address_line_1?: string }, label = "") {
    const city = matchSupportedCity(`${values.city ?? ""} ${label}`);
    if (!city) {
      setStatus("error");
      setMessage("Purple Squad currently serves addresses in Chennai and Coimbatore only.");
      return;
    }
    const detectedPincode = values.postal_code?.trim() ?? "";
    if (detectedPincode) {
      const availability = await addressesApi.checkServiceability(detectedPincode);
      if (!availability.is_supported) {
        setStatus("error");
        setMessage(`We do not serve ${detectedPincode} yet. Choose another address in ${city}.`);
        return;
      }
    }
    setSelectedLocation({ city, pincode: detectedPincode, label: label || values.locality || values.address_line_1 || city });
    setPincode(detectedPincode);
    setStatus("success");
    setMessage("");
    setOpen(false);
  }

  async function savePincode() {
    const cleaned = pincode.trim();
    if (cleaned.length !== 6) return;
    setStatus("loading");
    setMessage("");
    try {
      const availability = await addressesApi.checkServiceability(cleaned);
      if (!availability.is_supported) {
        setStatus("error");
        setMessage("This pincode is not serviceable yet.");
        return;
      }
      const areaCity = String(availability.service_area?.city ?? location.city);
      const city = matchSupportedCity(areaCity) ?? location.city;
      const label = String(availability.service_area?.name ?? `${city} ${cleaned}`);
      setSelectedLocation({ city, pincode: cleaned, label });
      setStatus("success");
      setOpen(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not check this pincode.");
    }
  }

  async function detectLocation() {
    setStatus("loading");
    setMessage("");
    try {
      const detected = await detectCurrentAddress();
      await applyDetectedLocation(detected, detected.locality || detected.address_line_1 || "Current location");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Your location could not be detected.");
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) setPincode(location.pincode); }}>
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
          <div className="flex items-start justify-between gap-4"><div><Dialog.Title className="text-xl font-bold text-foreground">Choose service location</Dialog.Title><Dialog.Description className="mt-1 text-sm leading-6 text-secondary">Search your address or choose Chennai or Coimbatore.</Dialog.Description></div><Dialog.Close asChild><Button type="button" variant="ghost" size="icon" aria-label="Close location selector"><X className="h-5 w-5" /></Button></Dialog.Close></div>

          <div className="relative mt-5">
            <label htmlFor="home-location-search" className="text-sm font-bold text-foreground">Search address</label>
            <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" /><Input id="home-location-search" value={searchQuery} onChange={(event) => { const value = event.target.value; setSearchQuery(value); if (value.trim().length < 3) { setSuggestions([]); setSearching(false); } }} placeholder="Search area, street or landmark" className="pl-9 pr-10" autoComplete="off" />{searching ? <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" /> : null}</div>
            {suggestions.length ? <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-border bg-white shadow-[var(--shadow-card)]">{suggestions.map((suggestion) => <button key={suggestion.id} type="button" onClick={async () => { setStatus("loading"); setMessage(""); try { const resolved = await resolveAddressSuggestion(suggestion); await applyDetectedLocation(resolved, suggestion.description); setSuggestions([]); setSearchQuery(""); } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "Could not select this address."); } }} className="flex w-full gap-3 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-primary-soft"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{suggestion.main_text}</span><span className="mt-0.5 block truncate text-xs text-secondary">{suggestion.secondary_text || suggestion.description}</span></span></button>)}</div> : null}
          </div>

          <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => void detectLocation()} disabled={status === "loading"}><LocateFixed className="h-4 w-4" />{status === "loading" ? "Detecting location..." : "Use current location"}</Button>
          <div className="mt-5 grid grid-cols-2 gap-3">{serviceCities.map((city) => { const active = city === location.city; return <button key={city} type="button" onClick={() => chooseCity(city)} className={cn("touch-target flex items-center justify-between rounded-lg border px-4 py-3 text-left transition", active ? "border-primary bg-primary-subtle text-primary" : "border-border bg-white text-foreground hover:border-primary/40")}><span className="font-bold">{city}</span>{active ? <Check className="h-4 w-4" /> : null}</button>; })}</div>
          <div className="mt-5 rounded-lg border border-border bg-soft-surface p-4"><label htmlFor="location-pincode" className="text-sm font-bold text-foreground">Check by pincode</label><div className="mt-3 flex gap-2"><Input id="location-pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))} placeholder="Enter pincode" /><Button type="button" onClick={() => void savePincode()} disabled={pincode.trim().length < 6 || status === "loading"}>Apply</Button></div></div>
          {serviceAreas.data?.length ? <div className="mt-4"><p className="text-xs font-bold uppercase tracking-wide text-secondary">Serviceable areas in {location.city}</p><div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto">{serviceAreas.data.map((area) => <button key={area.id} type="button" onClick={() => { setSelectedLocation({ city: area.city, pincode: area.postal_code, label: area.name }); setOpen(false); }} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-secondary hover:border-primary/40 hover:text-primary">{area.name} · {area.postal_code}</button>)}</div></div> : null}
          {message ? <p className={cn("mt-4 rounded-lg p-3 text-sm", status === "error" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}>{message}</p> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
