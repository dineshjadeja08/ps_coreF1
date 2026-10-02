"use client";

import type { AddressFormValues } from "@/features/addresses/schema";
import { addressesApi } from "@/features/addresses/api";
import type { AddressSuggestion, LocationAddress } from "@/types/api";

type DetectedAddress = Partial<AddressFormValues> & {
  latitude: string;
  longitude: string;
};

const INCOMPLETE_ADDRESS_MESSAGE = "Please pick a more specific location (street or landmark).";

export const round6 = (n: string | number) => Number(Number(n).toFixed(6));

function locationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return new Error("Location permission is blocked. Allow location access in your browser, or search for your address.");
  if (error.code === error.TIMEOUT) return new Error("Location detection timed out. Move near a window and try again, or search for your address.");
  return new Error("Your current location could not be detected. Please retry or search for your address.");
}

export function detectCurrentAddress(): Promise<DetectedAddress> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Location detection is not available on this device."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = String(round6(position.coords.latitude));
        const longitude = String(round6(position.coords.longitude));

        try {
          const payload = await addressesApi.reverseGeocode(latitude, longitude);
          resolve(resolveAddress(payload, latitude, longitude));
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Address lookup failed. Please retry or search for your address."));
        }
      },
      (error) => reject(locationError(error)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

export async function searchAddressSuggestions(query: string) {
  return (await addressesApi.autocomplete(query)).suggestions;
}

export async function resolveAddressSuggestion(suggestion: AddressSuggestion) {
  try {
    const resolved = await addressesApi.geocode(suggestion.id);
    const address = toAddressFormValues(resolved, undefined, undefined, suggestion.main_text);

    // Area-level Google results (for example "Anna Nagar") may not include a
    // postal code. Reverse-geocoding their centre point provides the complete
    // address needed for the service-area check without showing a manual form.
    if ((!address.postal_code || !address.city || !address.state) && address.latitude && address.longitude) {
      try {
        const reverseGeocoded = toAddressFormValues(
          await addressesApi.reverseGeocode(String(round6(address.latitude)), String(round6(address.longitude))),
          address.latitude,
          address.longitude,
        );
        return requireCompleteAddress(mergeAddressDetails(address, reverseGeocoded));
      } catch {
        // Keep the original place details so the caller can show a useful error.
      }
    }

    return requireCompleteAddress(address);
  } catch {
    // Fall back to the prediction fields so the address remains editable.
  }
  if (suggestion.latitude != null && suggestion.longitude != null) {
    try {
      const latitude = String(round6(suggestion.latitude));
      const longitude = String(round6(suggestion.longitude));
      const resolved = await addressesApi.reverseGeocode(latitude, longitude);
      return resolveAddress(resolved, latitude, longitude, suggestion.main_text);
    } catch {
      // Autocomplete data is still a useful editable fallback if reverse lookup is unavailable.
    }
  }
  return requireCompleteAddress(toAddressFormValues(suggestion, undefined, undefined, suggestion.main_text));
}

export function resolveAddress(payload: LocationAddress, fallbackLatitude?: string, fallbackLongitude?: string, fallbackName = "") {
  return requireCompleteAddress(toAddressFormValues(payload, fallbackLatitude, fallbackLongitude, fallbackName));
}

function toAddressFormValues(payload: LocationAddress, fallbackLatitude?: string, fallbackLongitude?: string, fallbackName = ""): DetectedAddress {
  const addressLine = payload.street
    ? [payload.house_number, payload.street].filter(Boolean).join(" ")
    : payload.house_number || fallbackName || payload.formatted_address;
  return {
    latitude: normalizeCoordinate(payload.latitude == null ? fallbackLatitude : payload.latitude),
    longitude: normalizeCoordinate(payload.longitude == null ? fallbackLongitude : payload.longitude),
    address_line_1: addressLine,
    locality: payload.locality,
    city: payload.city,
    state: payload.state,
    postal_code: payload.pincode,
    country: payload.country || "India",
  };
}

function normalizeCoordinate(value: string | number | null | undefined) {
  if (value == null || value === "") return "";
  return Number.isFinite(Number(value)) ? String(round6(value)) : "";
}

function mergeAddressDetails(original: DetectedAddress, enriched: DetectedAddress): DetectedAddress {
  return {
    ...original,
    address_line_1: original.address_line_1 || enriched.address_line_1,
    locality: original.locality || enriched.locality,
    city: original.city || enriched.city,
    state: original.state || enriched.state,
    postal_code: original.postal_code || enriched.postal_code,
    country: original.country || enriched.country,
    latitude: original.latitude || enriched.latitude,
    longitude: original.longitude || enriched.longitude,
  };
}

function requireCompleteAddress(address: DetectedAddress) {
  if (!address.city?.trim() || !address.state?.trim() || !address.postal_code?.trim()) {
    throw new Error(INCOMPLETE_ADDRESS_MESSAGE);
  }
  return address;
}
