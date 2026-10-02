"use client";

import type { AddressFormValues } from "@/features/addresses/schema";
import { addressesApi } from "@/features/addresses/api";
import type { AddressSuggestion, LocationAddress } from "@/types/api";

type DetectedAddress = Partial<AddressFormValues> & {
  latitude: string;
  longitude: string;
};

function locationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return new Error("Location permission is blocked. Allow location access in your browser, or enter the address manually.");
  if (error.code === error.TIMEOUT) return new Error("Location detection timed out. Move near a window and try again, or enter the address manually.");
  return new Error("Your current location could not be detected. Please retry or enter the address manually.");
}

export function detectCurrentAddress(): Promise<DetectedAddress> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Location detection is not available on this device."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        try {
          const payload = await addressesApi.reverseGeocode(latitude, longitude);
          resolve(toAddressFormValues(payload, latitude, longitude));
        } catch (error) {
          reject(error instanceof Error ? error : new Error("Address lookup failed. Please retry or enter the address manually."));
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
    const address = toAddressFormValues(resolved);

    // Area-level Google results (for example "Anna Nagar") may not include a
    // postal code. Reverse-geocoding their centre point provides the complete
    // address needed for the service-area check without showing a manual form.
    if ((!address.postal_code || !address.city || !address.state) && address.latitude && address.longitude) {
      try {
        const reverseGeocoded = toAddressFormValues(
          await addressesApi.reverseGeocode(address.latitude, address.longitude),
          address.latitude,
          address.longitude,
        );
        return mergeAddressDetails(address, reverseGeocoded);
      } catch {
        // Keep the original place details so the caller can show a useful error.
      }
    }

    return address;
  } catch {
    // Fall back to the prediction fields so the address remains editable.
  }
  if (suggestion.latitude != null && suggestion.longitude != null) {
    try {
      const resolved = await addressesApi.reverseGeocode(String(suggestion.latitude), String(suggestion.longitude));
      return toAddressFormValues(resolved);
    } catch {
      // Autocomplete data is still a useful editable fallback if reverse lookup is unavailable.
    }
  }
  return toAddressFormValues(suggestion);
}

function toAddressFormValues(payload: LocationAddress, fallbackLatitude?: string, fallbackLongitude?: string): DetectedAddress {
  const addressLine = payload.street
    ? [payload.house_number, payload.street].filter(Boolean).join(" ")
    : payload.formatted_address || payload.house_number;
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
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate.toFixed(6) : "";
}

function mergeAddressDetails(original: DetectedAddress, enriched: DetectedAddress): DetectedAddress {
  return {
    ...original,
    address_line_1: enriched.address_line_1 || original.address_line_1,
    locality: enriched.locality || original.locality,
    city: enriched.city || original.city,
    state: enriched.state || original.state,
    postal_code: enriched.postal_code || original.postal_code,
    country: enriched.country || original.country,
    latitude: enriched.latitude || original.latitude,
    longitude: enriched.longitude || original.longitude,
  };
}
