import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/lib/api/client";
import { technicianApi } from "@/lib/api/endpoints";

vi.mock("@/lib/api/client", () => ({ apiRequest: vi.fn().mockResolvedValue({}) }));

describe("technician job API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends arrival to the authenticated assigned-job endpoint", async () => {
    await technicianApi.markArrived("job-1");
    expect(apiRequest).toHaveBeenCalledWith("/api/v1/technician/jobs/job-1/arrived/", { method: "POST", body: {}, auth: true });
  });

  it("paginates active jobs independently of job history", async () => {
    await technicianApi.listJobs({ page: 2, job_status: "active" });
    expect(apiRequest).toHaveBeenCalledWith("/api/v1/technician/jobs/", { auth: true, query: { page: 2, page_size: 25, job_status: "active" } });
    await technicianApi.listJobs({ page: 1, job_status: "history" });
    expect(apiRequest).toHaveBeenLastCalledWith("/api/v1/technician/jobs/", { auth: true, query: { page: 1, page_size: 25, job_status: "history" } });
  });
});
