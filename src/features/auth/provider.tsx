"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { backendAuthApi } from "@/features/auth/api";
import type { AuthUser } from "@/features/auth/types";
import type { AdminMfaRequiredResponse, OtpDeliveryChannel, UserProfileUpdateRequest } from "@/types/api";
import {
  clearStoredSession,
  consumeIntendedRoute,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAuthTokens,
  setStoredUser,
} from "@/features/auth/storage";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithNameAndPhone: (name: string, phoneNumber: string) => Promise<AuthUser>;
  loginWithPassword: (phoneNumber: string, password: string) => Promise<AuthUser>;
  startAdminMfa: (phoneNumber: string, password: string, channel: OtpDeliveryChannel) => Promise<AdminMfaRequiredResponse>;
  completeAdminMfa: (challengeId: string, otp: string) => Promise<AuthUser>;
  restoreSession: () => Promise<AuthUser | null>;
  updateCurrentUser: (body: UserProfileUpdateRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  consumeReturnPath: (fallback?: string) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const access = getAccessToken();
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
    }

    if (!access) {
      clearStoredSession();
      setUser(null);
      return null;
    }

    try {
      const currentUser = await backendAuthApi.me();
      setStoredUser(currentUser);
      setUser(currentUser);
      return currentUser;
    } catch {
      clearStoredSession();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function init() {
      const cachedUser = getStoredUser();
      const hasAccessToken = Boolean(getAccessToken());

      // Render the authenticated shell from the locally stored session immediately.
      // /auth/me remains the source of truth and refreshes/revokes it in the background.
      if (cachedUser && hasAccessToken && active) {
        setUser(cachedUser);
        setIsLoading(false);
      }
      try {
        await restoreSession();
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      active = false;
    };
  }, [restoreSession]);

  const loginWithNameAndPhone = useCallback(async (name: string, phoneNumber: string) => {
    const response = await backendAuthApi.customerAccess({ name, phone_number: phoneNumber });
    setAuthTokens(response.tokens);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const loginWithPassword = useCallback(async (phoneNumber: string, password: string) => {
    const response = await backendAuthApi.passwordLogin({ phone_number: phoneNumber, password });
    if ("mfa_required" in response) {
      throw new Error("Administrator accounts must complete MFA in the admin login portal.");
    }
    setAuthTokens(response.tokens);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const startAdminMfa = useCallback(async (phoneNumber: string, password: string, channel: OtpDeliveryChannel) => {
    const response = await backendAuthApi.passwordLogin({ phone_number: phoneNumber, password, channel });
    if (!("mfa_required" in response)) {
      throw new Error("This account is not an administrator account.");
    }
    return response;
  }, []);

  const completeAdminMfa = useCallback(async (challengeId: string, otp: string) => {
    const response = await backendAuthApi.verifyAdminMfa(challengeId, otp);
    setAuthTokens(response.tokens);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const updateCurrentUser = useCallback(async (body: UserProfileUpdateRequest) => {
    const updatedUser = await backendAuthApi.updateMe(body);
    setStoredUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await backendAuthApi.logout(refresh);
      }
    } catch {
      // Local session cleanup should still complete if the refresh token is already invalid server-side.
    } finally {
      clearStoredSession();
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const consumeReturnPath = useCallback((fallback = "/") => {
    const intended = consumeIntendedRoute();
    return intended?.path || fallback;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      loginWithNameAndPhone,
      loginWithPassword,
      startAdminMfa,
      completeAdminMfa,
      restoreSession,
      updateCurrentUser,
      logout,
      consumeReturnPath,
    }),
    [completeAdminMfa, consumeReturnPath, isLoading, loginWithNameAndPhone, loginWithPassword, logout, restoreSession, startAdminMfa, updateCurrentUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
