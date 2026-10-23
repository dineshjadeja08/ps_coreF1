import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/admin/admin-shell", () => ({ AdminShell: () => null }));
const { categories } = vi.hoisted(() => ({ categories: vi.fn() }));
vi.mock("@/features/catalogue/server", () => ({ getServiceCategoriesForSeo: categories, getServicesForSeo: vi.fn() }));

import { generateMetadata } from "./services/page";
import { metadata as admin } from "./admin/layout";
import { metadata as login } from "./login/layout";
import { metadata as profile } from "./profile/layout";
import { metadata as bookings } from "./bookings/layout";
import { metadata as cart } from "./cart/layout";
import { metadata as checkout } from "./book/layout";
import { metadata as confirmation } from "./booking-success/layout";
import { metadata as technician } from "./technician/layout";

describe("public and private indexing rules", () => {
  it.each([admin, login, profile, bookings, cart, checkout, confirmation, technician])("noindexes private route trees", (metadata) => {
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates).toBeUndefined();
  });
  it("keeps the main listing indexable and canonicalizes category filters to category URLs", async () => {
    categories.mockResolvedValue([{ slug: "ac-services", name: "AC Services" }]);
    const listing = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(listing.robots).toMatchObject({ index: true });
    const filtered = await generateMetadata({ searchParams: Promise.resolve({ category: "ac-services" }) });
    expect(filtered.robots).toMatchObject({ index: false });
    expect(filtered.alternates).toEqual({ canonical: "https://purplesquad.in/services/ac-services" });
    const search = await generateMetadata({ searchParams: Promise.resolve({ q: "AC" }) });
    expect(search.robots).toMatchObject({ index: false });
    expect(search.alternates).toEqual({ canonical: "https://purplesquad.in/services" });
  });
});
