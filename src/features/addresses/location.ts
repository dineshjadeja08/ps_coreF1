"use client";

import type { AddressFormValues } from "@/features/addresses/schema";

type DetectedAddress = Partial<AddressFormValues> & {
  latitude: string;
  longitude: string;
};

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
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
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
      () => reject(new Error("Location permission was not available.")),
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
