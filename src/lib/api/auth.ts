import { api } from "./client";
import type { User, TokenOutput } from "./types";

// Auth service wraps responses: {"status":"ok","data":{...}}
function unwrap<T>(res: T | { status: string; data: T }): T {
  if (res && typeof res === 'object' && 'data' in res && 'status' in res) {
    return (res as { status: string; data: T }).data;
  }
  return res as T;
}

export const authApi = {
  getAuthUrl: (redirectUrl: string) =>
    api.get<{ auth_url: string }>(`/api/core/auth/url?redirect_url=${encodeURIComponent(redirectUrl)}`),
  exchangeCode: (authResponseUrl: string) =>
    api.post<TokenOutput>('/api/core/auth/token', { auth_response_url: authResponseUrl }),
  refreshToken: (refreshToken: string) =>
    api.post<TokenOutput>('/api/core/auth/refresh', { refresh_token: refreshToken }),

  me: async () =>
    unwrap(await api.get<User>('/api/auth-service/v1/me')),
  updateMe: async (data: Partial<User>) =>
    unwrap(await api.patch<User>('/api/auth-service/v1/me', data)),
  changePassword: (old_password: string, new_password: string) =>
    api.post('/api/auth-service/v1/password', { old_password, new_password }),
  referral: async () =>
    unwrap(await api.get<{ code: string; url: string }>('/api/auth-service/v1/me/referral')),
};
