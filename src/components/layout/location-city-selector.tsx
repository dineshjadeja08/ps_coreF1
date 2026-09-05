"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, LocateFixed, MapPin, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceCities } from "@/config/design";
import { cn } from "@/lib/utils";

const selectedCityKey = "purple_squad_selected_city";
const selectedPincodeKey = "purple_squad_selected_pincode";

type LocationCitySelectorProps = {
  compact?: boolean;
  className?: string;
};

export function LocationCitySelector({ compact = false, className }: LocationCitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window === "undefined") return serviceCities[0];
    const savedCity = window.localStorage.getItem(selectedCityKey);
    return savedCity && serviceCities.includes(savedCity as (typeof serviceCities)[number]) ? savedCity : serviceCities[0];
  });
  const [pincode, setPincode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(selectedPincodeKey) ?? "";
  });
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "denied" | "ready">("idle");

  function chooseCity(city: string) {
    setSelectedCity(city);
    window.localStorage.setItem(selectedCityKey, city);
    setOpen(false);
  }

  function savePincode() {
    const cleaned = pincode.trim();
    if (!cleaned) return;
    window.localStorage.setItem(selectedPincodeKey, cleaned);
    setOpen(false);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      () => setGeoStatus("ready"),
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "touch-target inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 text-left transition hover:border-primary/30 hover:bg-primary-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            compact ? "h-10" : "h-12",
            className,
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-muted-foreground">Location</span>
            <span className="block truncate text-sm font-bold text-foreground">{selectedCity}</span>
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[calc(var(--z-overlay)+1)] rounded-t-xl border border-border bg-surface p-5 shadow-[var(--shadow-float)] focus:outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-xl font-bold text-foreground">Choose service location</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-6 text-secondary">
                Purple Squad currently serves Chennai, Bangalore, and Coimbatore.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" aria-label="Close location selector">
                <X className="h-5 w-5" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-5 grid gap-3">
            {serviceCities.map((city) => {
              const active = city === selectedCity;
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => chooseCity(city)}
                  className={cn(
                    "touch-target flex items-center justify-between rounded-lg border px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                    active ? "border-primary bg-primary-subtle text-primary" : "border-border bg-white text-foreground hover:border-primary/40",
                  )}
                >
                  <span className="font-bold">{city}</span>
                  {active ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-border bg-soft-surface p-4">
            <label htmlFor="location-pincode" className="text-sm font-bold text-foreground">
              Check by pincode
            </label>
            <div className="mt-3 flex gap-2">
              <Input
                id="location-pincode"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter pincode"
              />
              <Button type="button" onClick={savePincode} disabled={pincode.trim().length < 6}>
                Save
              </Button>
            </div>
          </div>

          <Button type="button" variant="outline" className="mt-4 w-full" onClick={useCurrentLocation}>
            <LocateFixed className="h-4 w-4" />
            {geoStatus === "loading" ? "Detecting location..." : "Use current location"}
          </Button>
          {geoStatus === "denied" ? (
            <p className="mt-3 text-sm text-secondary">Location permission was not available. You can still browse by choosing a city.</p>
          ) : null}
          {geoStatus === "ready" ? (
            <p className="mt-3 text-sm text-success">Location detected. Please choose the nearest supported city to continue.</p>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
