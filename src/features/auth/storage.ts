import type { AuthTokens, AuthUser, IntendedRoute } from "@/features/auth/types";

const accessTokenKey = "purple_squad_access_token";
const refreshTokenKey = "purple_squad_refresh_token";
const userKey = "purple_squad_user";
const intendedRouteKey = "purple_squad_intended_route";

function safeStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAccessToken() {
  return safeStorage()?.getItem(accessTokenKey) ?? null;
}

export function getRefreshToken() {
  return safeStorage()?.getItem(refreshTokenKey) ?? null;
}

export function setAccessToken(access: string) {
  safeStorage()?.setItem(accessTokenKey, access);
}

export function setAuthTokens(tokens: Pick<AuthTokens, "access" | "refresh">) {
  const storage = safeStorage();
  storage?.setItem(accessTokenKey, tokens.access);
  storage?.setItem(refreshTokenKey, tokens.refresh);
}

export function getStoredUser() {
  const raw = safeStorage()?.getItem(userKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    safeStorage()?.removeItem(userKey);
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  safeStorage()?.setItem(userKey, JSON.stringify(user));
}

export function clearStoredSession() {
  const storage = safeStorage();
  storage?.removeItem(accessTokenKey);
  storage?.removeItem(refreshTokenKey);
  storage?.removeItem(userKey);
}

export function saveIntendedRoute(route: IntendedRoute) {
  safeStorage()?.setItem(intendedRouteKey, JSON.stringify(route));
}

export function consumeIntendedRoute() {
  const storage = safeStorage();
  const raw = storage?.getItem(intendedRouteKey);
  if (!raw) return null;
  storage?.removeItem(intendedRouteKey);

  try {
    return JSON.parse(raw) as IntendedRoute;
  } catch {
    return null;
  }
}

export function getIntendedPathWithFallback(fallback = "/") {
  const intended = consumeIntendedRoute();
  return intended?.path || fallback;
}
