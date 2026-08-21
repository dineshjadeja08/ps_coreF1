import { describe, expect, it } from "vitest";

import { addressSchema, emptyAddressValues } from "@/features/addresses/schema";

describe("address schema", () => {
  it("accepts a valid address payload from the OpenAPI contract", () => {
    const result = addressSchema.safeParse({
      ...emptyAddressValues,
      recipient_name: "Viknesh",
      phone: "9876543210",
      address_line_1: "12 Example Street",
      city: "Tirupattur",
      state: "Tamil Nadu",
      postal_code: "635601",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required address fields", () => {
    const result = addressSchema.safeParse({
      ...emptyAddressValues,
      recipient_name: "",
      phone: "",
      address_line_1: "",
      postal_code: "",
    });

    expect(result.success).toBe(false);
  });
});
