import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/config/env", () => ({ env: { apiBaseUrl: "https://backend.example" } }));
import { getAllServicesForSeo, getServiceDetailForSeo } from "./server";

afterEach(() => vi.unstubAllGlobals());

describe("server catalogue discovery", () => {
  it("follows every service page and deduplicates overlapping IDs", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(Response.json({ results: [{ id: "1", slug: "ac" }], next: "https://untrusted.example/next" }))
      .mockResolvedValueOnce(Response.json({ results: [{ id: "1", slug: "ac" }, { id: "2", slug: "washing" }], next: null }));
    vi.stubGlobal("fetch", fetcher);
    expect(await getAllServicesForSeo()).toHaveLength(2);
    expect(String(fetcher.mock.calls[1][0])).toBe("https://backend.example/api/v1/services/?page_size=100&page=2");
  });
  it("does not publish partial pagination after an upstream failure", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(Response.json({ results: [{ id: "1" }], next: "next" }))
      .mockResolvedValueOnce(new Response(null, { status: 503 })));
    await expect(getAllServicesForSeo()).rejects.toThrow("503");
  });
  it("distinguishes missing services from server failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    expect(await getServiceDetailForSeo("missing")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));
    await expect(getServiceDetailForSeo("available")).rejects.toThrow("500");
  });
});
