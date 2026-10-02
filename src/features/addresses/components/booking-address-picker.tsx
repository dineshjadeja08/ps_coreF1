"use client";

import { LocateFixed, Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressesApi } from "@/features/addresses/api";
import { detectCurrentAddress, resolveAddressSuggestion, searchAddressSuggestions } from "@/features/addresses/location";
import type { AddressFormValues } from "@/features/addresses/schema";
import { useAuth } from "@/features/auth/provider";
import { getFriendlyApiMessage } from "@/lib/api/errors";
import type { AddressSuggestion } from "@/types/api";

type BookingAddressPickerProps = {
  isFirstAddress: boolean;
  editing?: boolean;
  submitting: boolean;
  onSave: (values: AddressFormValues) => Promise<void>;
  onCancel: () => void;
};

type ResolvedAddress = Awaited<ReturnType<typeof detectCurrentAddress>>;

export function BookingAddressPicker({ isFirstAddress, editing = false, submitting, onSave, onCancel }: BookingAddressPickerProps) {
  const { user } = useAuth();
  const [detecting, setDetecting] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<ResolvedAddress | null>(null);

  useEffect(() => {
    const search = query.trim();
    if (resolvedAddress || search.length < 3) return;

    let ignore = false;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchAddressSuggestions(search);
        if (!ignore) setSuggestions(results);
      } catch (error) {
        if (!ignore) {
          setSuggestions([]);
          setMessage(getFriendlyApiMessage(error));
        }
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 350);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [query, resolvedAddress]);

  async function saveResolvedAddress(address: ResolvedAddress) {
    const postalCode = address.postal_code?.trim();
    if (!postalCode || !address.city?.trim() || !address.state?.trim()) {
      throw new Error("Please pick a more specific location (street or landmark).");
    }

    const serviceability = await addressesApi.checkServiceability(postalCode);
    if (!serviceability.is_supported) {
      throw new Error("Purple Squad does not serve this pincode yet. Please choose another address.");
    }

    const recipientName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim()
      || user?.customer_profile?.display_name?.trim()
      || "Customer";
    const phone = user?.phone_number?.trim();
    if (!phone) throw new Error("Add a phone number to your profile before booking.");

    await onSave({
      label: "Home",
      recipient_name: recipientName,
      phone,
      address_line_1: address.address_line_1?.trim() || address.locality?.trim() || `${address.city} ${postalCode}`,
      address_line_2: "",
      landmark: "",
      locality: address.locality?.trim() || "",
      city: address.city.trim(),
      state: address.state.trim(),
      postal_code: postalCode,
      country: address.country?.trim() || "India",
      latitude: address.latitude,
      longitude: address.longitude,
      is_default: isFirstAddress,
    });
  }

  async function detectAddress() {
    setDetecting(true);
    setMessage("");
    try {
      setResolvedAddress(await detectCurrentAddress());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not detect this address.");
    } finally {
      setDetecting(false);
    }
  }

  async function selectSuggestion(suggestion: AddressSuggestion) {
    setSelecting(true);
    setSuggestions([]);
    setMessage("");
    try {
      setQuery(suggestion.description);
      setResolvedAddress(await resolveAddressSuggestion(suggestion));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not resolve this address. Please search again.");
    } finally {
      setSelecting(false);
    }
  }

  async function saveSelection() {
    if (!resolvedAddress) return;
    setMessage("");
    try {
      await saveResolvedAddress(resolvedAddress);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this address. Please try again.");
    }
  }

  function changeSelection() {
    setResolvedAddress(null);
    setQuery("");
    setSuggestions([]);
    setMessage("");
  }

  const busy = detecting || selecting || submitting;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground">{editing ? "Change service address" : "Choose service address"}</h3>
          <p className="mt-1 text-sm text-secondary">
            Detect your location or search for an address, then confirm the resolved location.
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Close address picker" onClick={onCancel} disabled={busy}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {resolvedAddress ? (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">Resolved address</p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                {[resolvedAddress.address_line_1, resolvedAddress.locality, resolvedAddress.city, resolvedAddress.state, resolvedAddress.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={() => void saveSelection()} disabled={busy}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editing ? "Update address" : "Save address"}
            </Button>
            <Button type="button" variant="outline" onClick={changeSelection} disabled={busy}>Change</Button>
          </div>
        </div>
      ) : (
        <>
          <Button type="button" variant="outline" className="mt-4 h-12 w-full justify-start" onClick={() => void detectAddress()} disabled={busy}>
            {detecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            {detecting ? "Detecting location..." : "Detect my location"}
          </Button>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                setMessage("");
                if (value.trim().length < 3) {
                  setSuggestions([]);
                  setSearching(false);
                }
              }}
              className="h-12 pl-10 pr-10"
              placeholder="Search for area, street or landmark"
              autoComplete="off"
              disabled={busy}
            />
            {searching || selecting ? <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-primary" /> : null}
            {suggestions.length ? (
              <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-primary-subtle"
                    onClick={() => void selectSuggestion(suggestion)}
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-foreground">{suggestion.main_text}</span>
                      <span className="mt-0.5 block truncate text-xs text-secondary">{suggestion.secondary_text || suggestion.description}</span>
                    </span>
                  </button>
                ))}
                <div className="border-t border-border px-3 py-2 text-right text-[10px] font-semibold text-muted-foreground">Powered by Google</div>
              </div>
            ) : null}
          </div>
        </>
      )}

      {message ? <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">{message}</p> : null}
    </div>
  );
}
