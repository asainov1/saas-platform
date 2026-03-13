"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { authApi, removeToken, saveToken } from "@/lib/api";
import type { User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const match = document.cookie.match(/(?:^|; )flowly_token_exp=([^;]*)/);
    if (!match) return;

    const exp = parseInt(match[1], 10);
    if (isNaN(exp)) return;

    const msUntilExpiry = (exp * 1000) - Date.now();
    const refreshIn = Math.max(msUntilExpiry - 2 * 60 * 1000, 5000);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            saveToken(data.access_token, data.expires_in);
            scheduleRefresh();
          }
        }
      } catch {
        // Refresh failed silently
      }
    }, refreshIn);
  }, []);

  const refreshUser = useCallback(async () => {
    // Check for demo token first — skip API call entirely
    const match = document.cookie.match(/(?:^|; )flowly_token=([^;]*)/);
    if (match && match[1].endsWith(".demo")) {
      try {
        const payload = JSON.parse(atob(match[1].split(".")[1]));
        if (payload.email) {
          setUser({
            id: payload.user_id || 1,
            email: payload.email,
            first_name: payload.first_name || "Demo",
            last_name: payload.last_name || "User",
            phone_number: null,
            is_active: true,
            is_staff: false,
            is_superuser: payload.is_superuser || false,
            email_verified: true,
            locale: "ru",
            zoneinfo: "Asia/Almaty",
            preferred_theme: "dark",
            date_joined: new Date().toISOString(),
            last_login: new Date().toISOString(),
          });
          return;
        }
      } catch { /* not a valid demo token */ }
    }

    try {
      const u = await authApi.me();
      setUser(u);
      scheduleRefresh();
    } catch {
      setUser(null);
    }
  }, [scheduleRefresh]);

  useEffect(() => {
    const token = document.cookie.match(/(?:^|; )flowly_token=([^;]*)/);
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [refreshUser]);

  const logout = useCallback(async () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    removeToken();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
