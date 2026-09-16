import { env } from "@/config/env";
import { clearStoredSession, getAccessToken, getRefreshToken, setAuthTokens } from "@/features/auth/storage";
import { ApiError, parseApiErrorPayload } from "@/lib/api/errors";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
  auth?: boolean;
  skipAuthRefresh?: boolean;
  query?: Record<string, string | number | boolean | null | undefined>;
};

let refreshPromise: Promise<string | null> | null = null;

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const url = new URL(path, baseUrl);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function downloadAuthenticatedFile(path: string, fallbackFilename: string) {
  let accessToken = getAccessToken();
  let response = await fetch(buildUrl(path), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (response.status === 401) {
    accessToken = await refreshAccessTokenOnce();
    if (accessToken) {
      response = await fetch(buildUrl(path), { headers: { Authorization: `Bearer ${accessToken}` } });
    }
  }
  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    const parsed = parseApiErrorPayload(payload);
    throw new ApiError(parsed.message, response.status, payload, parsed.fieldErrors);
  }
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? fallbackFilename;
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { body, token, auth, skipAuthRefresh, query, headers, ...init } = options;
  const accessToken = token ?? (auth ? getAccessToken() : null);

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !skipAuthRefresh) {
    const refreshedAccess = await refreshAccessTokenOnce();
    if (refreshedAccess) {
      return apiRequest<T>(path, {
        ...options,
        token: refreshedAccess,
        skipAuthRefresh: true,
      });
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const parsed = parseApiErrorPayload(payload);
    throw new ApiError(parsed.message, response.status, payload, parsed.fieldErrors);
  }

  return payload as T;
}

async function refreshAccessTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearStoredSession();
    return null;
  }

  try {
    const response = await fetch(buildUrl("/api/v1/auth/refresh/"), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) {
      clearStoredSession();
      return null;
    }

    const payload = (await response.json()) as { access?: string; refresh?: string };
    if (!payload.access) {
      clearStoredSession();
      return null;
    }

    setAuthTokens({ access: payload.access, refresh: payload.refresh ?? refresh });
    return payload.access;
  } catch {
    clearStoredSession();
    return null;
  }
}
