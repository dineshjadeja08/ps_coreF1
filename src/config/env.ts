const defaultApiBaseUrl = "http://127.0.0.1:8000";

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "",
  supportWhatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "",
  devPhoneLogin: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_DEV_PHONE_LOGIN === "true",
    phone: process.env.NEXT_PUBLIC_DEV_LOGIN_PHONE ?? "",
  },
};
