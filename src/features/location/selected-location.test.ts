import { describe, expect, it } from "vitest";

import { localitySlug, matchSupportedArea } from "@/features/location/selected-location";

describe("locality matching", () => {
  it("creates slugs compatible with the SEO area URLs", () => {
    expect(localitySlug("T. Nagar")).toBe("t-nagar");
    expect(localitySlug("K.K. Nagar")).toBe("kk-nagar");
    expect(localitySlug("Parry's Corner")).toBe("parrys-corner");
  });

  it("selects the exact locality from a shared pincode", () => {
    expect(matchSupportedArea("Guindy, Chennai", ["Defence Colony", "Guindy"])).toEqual({
      name: "Guindy",
      slug: "guindy",
    });
  });

  it("uses the only supported locality when reverse geocoding returns a street", () => {
    expect(matchSupportedArea("Vijaya Nagar", ["Velachery"])).toEqual({
      name: "Velachery",
      slug: "velachery",
    });
  });

  it("does not guess between multiple localities", () => {
    expect(matchSupportedArea("GST Road", ["Kadaperi", "Tambaram"])).toBeNull();
  });
});
