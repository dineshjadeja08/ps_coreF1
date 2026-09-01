import { describe, expect, it } from "vitest";

import { mapOtpAuthError } from "@/features/auth/errors";
import { ApiError } from "@/lib/api/errors";
import { maskPhone, normalizeIndianPhone, otpSchema, passwordLoginSchema, passwordSignupSchema, phoneLoginSchema } from "@/features/auth/schema";

describe("auth schema and errors", () => {
  it("validates Indian phone numbers and normalizes them for backend OTP", () => {
    expect(phoneLoginSchema.safeParse({ phone: "9876543210" }).success).toBe(true);
    expect(phoneLoginSchema.safeParse({ phone: "12345" }).success).toBe(false);
    expect(normalizeIndianPhone("98765 43210")).toBe("+919876543210");
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalizeIndianPhone("12345")).toBeNull();
  });

  it("validates six digit OTP values", () => {
    expect(otpSchema.safeParse({ otp: "123456" }).success).toBe(true);
    expect(otpSchema.safeParse({ otp: "12345" }).success).toBe(false);
    expect(otpSchema.safeParse({ otp: "abcdef" }).success).toBe(false);
  });

  it("validates temporary password account forms", () => {
    expect(passwordLoginSchema.safeParse({ phone: "9876543210", password: "StrongPass123" }).success).toBe(true);
    expect(passwordLoginSchema.safeParse({ phone: "9876543210", password: "short" }).success).toBe(false);
    expect(
      passwordSignupSchema.safeParse({
        phone: "9876543210",
        password: "StrongPass123",
        firstName: "Viknesh",
        lastName: "",
        email: "",
      }).success,
    ).toBe(true);
  });

  it("masks phone numbers without exposing the full number", () => {
    expect(maskPhone("+919876543210")).toBe("+91 ••••• 3210");
  });

  it("maps backend OTP errors to customer-friendly messages", () => {
    expect(mapOtpAuthError(new ApiError("Invalid or expired OTP.", 400))).toBe("Invalid or expired OTP.");
    expect(mapOtpAuthError(new ApiError("Too many attempts.", 429))).toBe("Too many attempts. Please wait a moment and try again.");
  });
});
