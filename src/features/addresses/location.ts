"use client";

import type { AddressFormValues } from "@/features/addresses/schema";

type DetectedAddress = Partial<AddressFormValues> & {
  latitude: string;
  longitude: string;
};

function locationError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return new Error("Location permission is blocked. Allow location access in your browser, or enter the address manually.");
  if (error.code === error.TIMEOUT) return new Error("Location detection timed out. Move near a window and try again, or enter the address manually.");
  return new Error("Your current location could not be detected. Please retry or enter the address manually.");
}

type BigDataCloudResponse = {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
  postcode?: string;
  countryName?: string;
  localityInfo?: {
    administrative?: Array<{ name?: string; adminLevel?: number; description?: string }>;
    informative?: Array<{ name?: string; description?: string }>;
  };
};

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
          const controller = new AbortController();
          const timeout = window.setTimeout(() => controller.abort(), 10000);
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            { signal: controller.signal },
          );
          window.clearTimeout(timeout);
          if (!response.ok) throw new Error("Reverse geocoding failed.");
          const payload = (await response.json()) as BigDataCloudResponse;
          resolve({
            latitude,
            longitude,
            address_line_1: getStreetAddress(payload),
            locality: payload.locality || "",
            city: payload.city || payload.locality || "",
            state: payload.principalSubdivision || "",
            postal_code: payload.postcode || "",
            country: payload.countryName || "India",
          });
        } catch {
          resolve({ latitude, longitude });
        }
      },
      (error) => reject(locationError(error)),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  });
}

function getStreetAddress(payload: BigDataCloudResponse) {
  const informative = payload.localityInfo?.informative ?? [];
  const route = informative.find((item) => item.description === "route")?.name;
  const neighborhood = informative.find((item) => item.description === "neighbourhood")?.name;
  return [route, neighborhood].filter(Boolean).join(", ");
}
