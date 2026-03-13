const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const TOKEN_KEY = "flowly_token";
const TOKEN_EXP_KEY = "flowly_token_exp";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`));
  return match ? match[1] : null;
}

export function saveToken(token: string, expiresIn?: number) {
  const maxAge = expiresIn || 60 * 60 * 24 * 7;
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (expiresIn) {
    const expTimestamp = Math.floor(Date.now() / 1000) + expiresIn;
    document.cookie = `${TOKEN_EXP_KEY}=${expTimestamp}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function removeToken() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  document.cookie = `${TOKEN_EXP_KEY}=; path=/; max-age=0`;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export { ApiError };

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        saveToken(data.access_token, data.expires_in);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
      }
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      // Don't remove token or redirect in demo mode
      const tokenMatch = document.cookie.match(/(?:^|; )flowly_token=([^;]*)/);
      const isDemo = tokenMatch && tokenMatch[1].endsWith(".demo");
      if (!isDemo) {
        removeToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    throw new ApiError(
      data.detail || `Request failed: ${res.status}`,
      res.status,
      data
    );
  }

  if (res.status === 204) return null as T;
  return res.json();
}

async function uploadRequest<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(
      data.detail || `Upload failed: ${res.status}`,
      res.status,
      data
    );
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => uploadRequest<T>(path, formData),
};
