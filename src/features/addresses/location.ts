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
        const latitude = position.coords.latitude.toFixed(7);
        const longitude = position.coords.longitude.toFixed(7);

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
  const addressLine = [payload.house_number, payload.street].filter(Boolean).join(" ") || payload.formatted_address;
  return {
    latitude: payload.latitude == null ? (fallbackLatitude ?? "") : String(payload.latitude),
    longitude: payload.longitude == null ? (fallbackLongitude ?? "") : String(payload.longitude),
    address_line_1: addressLine,
    locality: payload.locality,
    city: payload.city,
    state: payload.state,
    postal_code: payload.pincode,
    country: payload.country || "India",
  };
}
