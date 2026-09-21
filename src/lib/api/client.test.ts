import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getRefreshToken, setAuthTokens } from "@/features/auth/storage";
import { apiRequest } from "@/lib/api/client";

function installLocalStorage() {
  const data = new Map<string, string>();

  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });

  return data;
}

describe("apiRequest auth behavior", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("attaches access token to protected requests", async () => {
    setAuthTokens({ access: "access-token", refresh: "refresh-token" });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/v1/auth/me/", { auth: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer access-token");
  });

  it("refreshes once on 401 and retries the original protected request", async () => {
    setAuthTokens({ access: "expired-access", refresh: "refresh-token" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ detail: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ access: "new-access", refresh: "rotated-refresh" }), { status: 200, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ ok: boolean }>("/api/v1/auth/me/", { auth: true });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer new-access");
    expect(getRefreshToken()).toBe("rotated-refresh");
  });

  it("restores a missing access token before sending the protected request", async () => {
    window.localStorage.setItem("purple_squad_refresh_token", "refresh-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access: "restored-access", refresh: "rotated-refresh" }), { status: 200, headers: { "content-type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ ok: boolean }>("/api/v1/admin/services/", { auth: true });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("/api/v1/auth/refresh/");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer restored-access");
  });

  it("does not send a protected request when no session token exists", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest("/api/v1/admin/services/", { auth: true })).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
