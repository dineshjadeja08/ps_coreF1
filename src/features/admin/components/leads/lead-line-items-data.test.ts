import { describe, expect, it } from "vitest";

import { updateLeadLineItemDraft } from "@/features/admin/components/leads/lead-line-items-data";

describe("lead line-item local adapter", () => {
  it("adds, increments and removes a package draft", () => {
    const added = updateLeadLineItemDraft({}, "package-1", 1);
    expect(added).toEqual({ "package-1": 1 });
    expect(updateLeadLineItemDraft(added, "package-1", 2)).toEqual({ "package-1": 2 });
    expect(updateLeadLineItemDraft(added, "package-1", 0)).toEqual({});
  });
});
