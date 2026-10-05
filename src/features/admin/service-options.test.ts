import { beforeEach, describe, expect, it, vi } from "vitest";

import { listAllServiceOptions } from "@/features/admin/service-options";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminService } from "@/types/api";

vi.mock("@/lib/api/endpoints", () => ({ adminApi: { listServices: vi.fn() } }));

const listServices = vi.mocked(adminApi.listServices);
const service = (id: string, name: string) => ({ id, name }) as AdminService;

describe("FAQ service options", () => {
  beforeEach(() => vi.resetAllMocks());

  it("includes every page, including Refrigerator Inspection beyond the first 100 services", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => service(`service-${index}`, `Service ${index}`));
    const refrigerator = service("refrigerator", "Refrigerator Inspection");
    const inactive = { ...service("inactive", "Inactive service"), is_active: false };
    listServices.mockResolvedValueOnce({ count: 102, next: "?page=2", previous: null, results: firstPage });
    listServices.mockResolvedValueOnce({ count: 102, next: null, previous: "?page=1", results: [refrigerator, inactive] });

    expect(await listAllServiceOptions()).toEqual([...firstPage, refrigerator, inactive]);
    expect(listServices.mock.calls).toEqual([[{ page: 1, page_size: 100 }], [{ page: 2, page_size: 100 }]]);
  });

  it("handles an empty catalogue without requesting another page", async () => {
    listServices.mockResolvedValueOnce({ count: 0, next: null, previous: null, results: [] });
    expect(await listAllServiceOptions()).toEqual([]);
    expect(listServices).toHaveBeenCalledTimes(1);
  });

  it("rejects failed later pages instead of returning an incomplete list", async () => {
    listServices.mockResolvedValueOnce({ count: 2, next: "?page=2", previous: null, results: [service("ac", "AC Service")] });
    listServices.mockRejectedValueOnce(new Error("Network error"));
    await expect(listAllServiceOptions()).rejects.toThrow("Network error");
  });
});
