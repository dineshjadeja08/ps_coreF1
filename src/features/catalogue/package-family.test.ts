import { describe, expect, it } from "vitest";

import { packageFamilyKey } from "@/features/catalogue/package-family";

const service = (name: string, short_description = ""): Parameters<typeof packageFamilyKey>[0] => ({
  name,
  short_description,
  category: { id: "appliances", name: "Home Appliances Repair", slug: "home-appliances-repair" },
});

describe("TV and CCTV package families", () => {
  const tv = service("TV Repair & Services");
  const wallMount = service("TV Wall Mount Installation");
  const sizedMount = service("TV Wall Mount - 32 to 43 inch");
  const cctv = service("CCTV Cameras Repair and Installation", "Connect cameras to your TV display");
  const catalogue = [tv, wallMount, sizedMount, cctv];

  it("includes wall mounting in TV services without including CCTV", () => {
    expect(catalogue.filter((item) => packageFamilyKey(item) === packageFamilyKey(tv))).toEqual([tv, wallMount, sizedMount]);
  });

  it("keeps TV repair and wall mounting out of CCTV packages", () => {
    expect(catalogue.filter((item) => packageFamilyKey(item) === packageFamilyKey(cctv))).toEqual([cctv]);
  });

  it("identifies CCTV before TV even under a TV category", () => {
    expect(packageFamilyKey({ ...cctv, category: { ...cctv.category, name: "TV Services" } })).toBe("cctv");
  });

  it("does not treat an arbitrary word containing tv as TV repair", () => {
    expect(packageFamilyKey(service("Network setup", "Smartview configuration"))).toBe("home-appliances-repair");
  });

  it("preserves other appliance families", () => {
    expect(packageFamilyKey(service("Refrigerator Inspection"))).toBe("refrigerator");
    expect(packageFamilyKey(service("AC Repairs"))).toBe("ac");
  });
});
