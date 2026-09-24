"use client";

import { useMemo, useSyncExternalStore } from "react";

import { serviceCities } from "@/config/design";

export const selectedCityKey = "purple_squad_selected_city";
export const selectedPincodeKey = "purple_squad_selected_pincode";
export const selectedLocationLabelKey = "purple_squad_selected_location_label";
const locationChangeEvent = "purple-squad:location-change";
const serverSnapshot = `${serviceCities[0]}||`;

function readSnapshot() {
  if (typeof window === "undefined") return serverSnapshot;
  return [
    window.localStorage.getItem(selectedCityKey) || serviceCities[0],
    window.localStorage.getItem(selectedPincodeKey) || "",
    window.localStorage.getItem(selectedLocationLabelKey) || "",
  ].join("|");
}

function subscribe(listener: () => void) {
  window.addEventListener(locationChangeEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(locationChangeEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useSelectedLocation() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => serverSnapshot);
  return useMemo(() => {
    const [city, pincode, label] = snapshot.split("|");
    const supportedCity = serviceCities.includes(city as (typeof serviceCities)[number]) ? city : serviceCities[0];
    return { city: supportedCity, pincode, label };
  }, [snapshot]);
}

export function setSelectedLocation({ city, pincode = "", label = "" }: { city: string; pincode?: string; label?: string }) {
  window.localStorage.setItem(selectedCityKey, city);
  window.localStorage.setItem(selectedPincodeKey, pincode);
  window.localStorage.setItem(selectedLocationLabelKey, label);
  window.dispatchEvent(new Event(locationChangeEvent));
}

export function matchSupportedCity(value: string) {
  const normalized = value.toLowerCase();
  return serviceCities.find((city) => normalized.includes(city.toLowerCase())) ?? null;
}
