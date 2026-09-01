"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { backendAuthApi } from "@/features/auth/api";
import type { AuthUser } from "@/features/auth/types";
import type { UserProfileUpdateRequest } from "@/types/api";
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
  loginWithOtp: (phoneNumber: string, otp: string) => Promise<AuthUser>;
  loginWithPassword: (phoneNumber: string, password: string) => Promise<AuthUser>;
  signupWithPassword: (body: { phone_number: string; password: string; first_name?: string; last_name?: string; email?: string }) => Promise<AuthUser>;
  loginWithDevPhone: (phoneNumber: string) => Promise<AuthUser>;
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

  const loginWithDevPhone = useCallback(async (phoneNumber: string) => {
    const response = await backendAuthApi.devPhoneLogin(phoneNumber);
    setAuthTokens(response.tokens);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const loginWithOtp = useCallback(async (phoneNumber: string, otp: string) => {
    const response = await backendAuthApi.verifyOtp(phoneNumber, otp);
    setAuthTokens(response.tokens);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const loginWithPassword = useCallback(async (phoneNumber: string, password: string) => {
    const response = await backendAuthApi.passwordLogin({ phone_number: phoneNumber, password });
    setAuthTokens(response.tokens);
    setStoredUser(response.user);
    setUser(response.user);
    return response.user;
  }, []);

  const signupWithPassword = useCallback(
    async (body: { phone_number: string; password: string; first_name?: string; last_name?: string; email?: string }) => {
      const response = await backendAuthApi.passwordSignup(body);
      setAuthTokens(response.tokens);
      setStoredUser(response.user);
      setUser(response.user);
      return response.user;
    },
    [],
  );

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
      loginWithOtp,
      loginWithPassword,
      signupWithPassword,
      loginWithDevPhone,
      restoreSession,
      updateCurrentUser,
      logout,
      consumeReturnPath,
    }),
    [consumeReturnPath, isLoading, loginWithDevPhone, loginWithOtp, loginWithPassword, logout, restoreSession, signupWithPassword, updateCurrentUser, user],
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
