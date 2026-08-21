import type { AuthLoginResponse, TokenPair, User } from "@/types/api";

export type AuthUser = User;
export type AuthTokens = TokenPair;
export type BackendLoginResponse = AuthLoginResponse;

export type LoginStep = "phone" | "otp" | "success";

export type IntendedRoute = {
  path: string;
  serviceSlug?: string;
};
