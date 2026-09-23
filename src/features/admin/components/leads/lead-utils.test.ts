import { describe, expect, it } from "vitest";

import {
  calculateDraftTotal,
  extractPincode,
  formatLeadStatus,
  isValidIndianMobile,
  leadCreateSchema,
  normalizeIndianMobile,
} from "@/features/admin/components/leads/lead-utils";

describe("lead helpers", () => {
  it("normalizes and validates Indian mobile numbers", () => {
    expect(normalizeIndianMobile("+91 98765 43210")).toBe("9876543210");
    expect(isValidIndianMobile("9876543210")).toBe(true);
    expect(isValidIndianMobile("1234567890")).toBe(false);
  });

  it("validates the create request fields", () => {
    expect(leadCreateSchema.safeParse({
      customer_name: "Viknesh",
      primary_mobile: "+91 98765 43210",
      required_service: "service-id",
      city: "Chennai",
      address: "12 Anna Nagar, Chennai 600040",
      pincode: "600040",
      latitude: "13.085",
      longitude: "80.210",
    }).success).toBe(true);
  });

  it("extracts pincodes and formats open status", () => {
    expect(extractPincode("Anna Nagar, Chennai 600040")).toBe("600040");
    expect(formatLeadStatus("NEW")).toBe("OPEN");
    expect(formatLeadStatus("FOLLOW_UP")).toBe("FOLLOW UP");
  });

  it("calculates optimistic line-item totals", () => {
    expect(calculateDraftTotal([{ quantity: 2, unitCost: "299" }, { quantity: 1, unitCost: 500 }])).toBe(1098);
  });
});
