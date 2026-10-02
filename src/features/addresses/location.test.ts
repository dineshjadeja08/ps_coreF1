import { beforeEach, describe, expect, it, vi } from "vitest";

import { addressesApi } from "@/features/addresses/api";
import { resolveAddressSuggestion } from "@/features/addresses/location";
import type { AddressSuggestion, LocationAddress } from "@/types/api";

vi.mock("@/features/addresses/api", () => ({
  addressesApi: {
    geocode: vi.fn(),
    reverseGeocode: vi.fn(),
  },
}));

const suggestion = {
  id: "anna-nagar-place-id",
  description: "Anna Nagar, Chennai, Tamil Nadu, India",
  main_text: "Anna Nagar",
  secondary_text: "Chennai, Tamil Nadu, India",
} as AddressSuggestion;

const broadResult = {
  formatted_address: "Anna Nagar, Chennai, Tamil Nadu, India",
  house_number: "",
  street: "",
  locality: "Anna Nagar",
  city: "Chennai",
  state: "Tamil Nadu",
  pincode: "",
  country: "India",
  latitude: 13.0850174,
  longitude: 80.2101342,
  supported_city: true,
  serviceable: true,
} as LocationAddress;

describe("address suggestion resolution", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reverse-geocodes an area result when Google omits its pincode", async () => {
    vi.mocked(addressesApi.geocode).mockResolvedValue(broadResult);
    vi.mocked(addressesApi.reverseGeocode).mockResolvedValue({
      ...broadResult,
      formatted_address: "2nd Avenue, Anna Nagar, Chennai, Tamil Nadu 600040, India",
      street: "2nd Avenue",
      pincode: "600040",
    });

    const result = await resolveAddressSuggestion(suggestion);

    expect(addressesApi.reverseGeocode).toHaveBeenCalledWith("13.085017", "80.210134");
    expect(result.postal_code).toBe("600040");
    expect(result.address_line_1).toBe("2nd Avenue");
  });

  it("rounds Google coordinates to the backend's six-decimal limit", async () => {
    vi.mocked(addressesApi.geocode).mockResolvedValue({ ...broadResult, pincode: "600040" });

    const result = await resolveAddressSuggestion(suggestion);

    expect(result.latitude).toBe("13.085017");
    expect(result.longitude).toBe("80.210134");
    expect(addressesApi.reverseGeocode).not.toHaveBeenCalled();
  });
});
