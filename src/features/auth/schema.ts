import { z } from "zod";

export const phoneLoginSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid 10 digit mobile number.")
    .regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6 digit OTP."),
});

export type PhoneLoginFormValues = z.infer<typeof phoneLoginSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;

export function normalizeIndianPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withoutCountry = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;

  if (!/^[6-9]\d{9}$/.test(withoutCountry)) {
    return null;
  }

  return `+91${withoutCountry}`;
}

export function maskPhone(phone: string) {
  const last = phone.replace(/\D/g, "").slice(-4);
  return `+91 ••••• ${last}`;
}
