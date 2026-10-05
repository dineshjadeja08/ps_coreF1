"use client";

import { useMemo, useSyncExternalStore } from "react";

import { serviceCities } from "@/config/design";

export const selectedCityKey = "purple_squad_selected_city";
export const selectedPincodeKey = "purple_squad_selected_pincode";
export const selectedLocationLabelKey = "purple_squad_selected_location_label";
export const selectedAreaSlugKey = "purple_squad_selected_area_slug";
const locationChangeEvent = "purple-squad:location-change";
const serverSnapshot = `${serviceCities[0]}|||`;

function readSnapshot() {
  if (typeof window === "undefined") return serverSnapshot;
  return [
    window.localStorage.getItem(selectedCityKey) || serviceCities[0],
    window.localStorage.getItem(selectedPincodeKey) || "",
    window.localStorage.getItem(selectedLocationLabelKey) || "",
    window.localStorage.getItem(selectedAreaSlugKey) || "",
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
    const [city, pincode, label, areaSlug] = snapshot.split("|");
    const supportedCity = serviceCities.includes(city as (typeof serviceCities)[number]) ? city : serviceCities[0];
    const restoredAreaSlug = areaSlug || (pincode && label && !label.includes("/") ? localitySlug(label) : "");
    return { city: supportedCity, pincode, label, areaSlug: restoredAreaSlug };
  }, [snapshot]);
}

export function setSelectedLocation({ city, pincode = "", label = "", areaSlug = "" }: { city: string; pincode?: string; label?: string; areaSlug?: string }) {
  window.localStorage.setItem(selectedCityKey, city);
  window.localStorage.setItem(selectedPincodeKey, pincode);
  window.localStorage.setItem(selectedLocationLabelKey, label);
  window.localStorage.setItem(selectedAreaSlugKey, areaSlug);
  window.dispatchEvent(new Event(locationChangeEvent));
}

export function localitySlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchSupportedArea(value: string, areas: string[]) {
  const candidate = localitySlug(value);
  if (!candidate) {
    return areas.length === 1 ? { name: areas[0], slug: localitySlug(areas[0]) } : null;
  }
  const matches = areas
    .map((name) => ({ name, slug: localitySlug(name) }))
    .filter((area) => area.slug && (candidate === area.slug || candidate.includes(area.slug) || area.slug.includes(candidate)))
    .sort((left, right) => right.slug.length - left.slug.length);

  if (matches[0]) return matches[0];
  if (areas.length === 1) return { name: areas[0], slug: localitySlug(areas[0]) };
  return null;
}

export function matchSupportedCity(value: string) {
  const normalized = value.toLowerCase();
  return serviceCities.find((city) => normalized.includes(city.toLowerCase())) ?? null;
}
