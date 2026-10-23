import { describe, expect, it, vi } from "vitest";

import { loadAllPages } from "./load-all-pages";

describe("loadAllPages", () => {
  it("loads entries beyond the first page", async () => {
    const fetchPage = vi.fn(async (page: number) => ({
      count: 3,
      next: page < 3 ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: [page],
    }));

    await expect(loadAllPages(fetchPage)).resolves.toEqual([1, 2, 3]);
    expect(fetchPage.mock.calls).toEqual([[1], [2], [3]]);
  });

  it("does not report a partial list when a later page fails", async () => {
    const fetchPage = vi.fn(async (page: number) => {
      if (page === 2) throw new Error("Page unavailable");
      return { count: 2, next: "?page=2", previous: null, results: [1] };
    });

    await expect(loadAllPages(fetchPage)).rejects.toThrow("Page unavailable");
  });
});
