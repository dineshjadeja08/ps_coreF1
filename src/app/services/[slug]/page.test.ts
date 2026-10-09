import { beforeEach, describe, expect, it, vi } from "vitest";

const { categories, detail, notFound } = vi.hoisted(() => ({ categories: vi.fn(), detail: vi.fn(), notFound: vi.fn(() => { throw new Error("HTTP 404"); }) }));
vi.mock("@/features/catalogue/server", () => ({ getServiceCategoriesForSeo: categories, getServiceDetailForSeo: detail, getServiceReviewsForSeo: vi.fn(), getServicesForSeo: vi.fn() }));
vi.mock("next/navigation", async (original) => ({ ...await original<object>(), notFound }));

import Page, { generateMetadata } from "./page";

describe("service route resource validation", () => {
  beforeEach(() => { categories.mockResolvedValue([]); detail.mockReset(); notFound.mockClear(); });
  it("rejects unknown slugs during metadata and page rendering", async () => {
    detail.mockResolvedValue(null);
    const props = { params: Promise.resolve({ slug: "not-a-service" }) };
    await expect(generateMetadata(props)).rejects.toThrow("HTTP 404");
    await expect(Page(props)).rejects.toThrow("HTTP 404");
  });
  it("does not mislabel a backend outage as a missing service", async () => {
    detail.mockRejectedValue(new Error("Catalogue request failed: 503"));
    await expect(Page({ params: Promise.resolve({ slug: "real-service" }) })).rejects.toThrow("503");
    expect(notFound).not.toHaveBeenCalled();
  });
});
