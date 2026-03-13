import { api } from "./client";
import type { User, TokenOutput } from "./types";

export const authApi = {
  getAuthUrl: (redirectUrl: string) =>
    api.get<{ auth_url: string }>(`/api/core/auth/url?redirect_url=${encodeURIComponent(redirectUrl)}`),
  exchangeCode: (authResponseUrl: string) =>
    api.post<TokenOutput>('/api/core/auth/token', { auth_response_url: authResponseUrl }),
  refreshToken: (refreshToken: string) =>
    api.post<TokenOutput>('/api/core/auth/refresh', { refresh_token: refreshToken }),

  me: async () => {
    const res = await api.get<{ status: string; data: User } | User>('/api/auth-service/v1/me');
    // API wraps response in { status, data }
    if ('data' in res && 'status' in res) return res.data;
    return res;
  },
  updateMe: async (data: Partial<User>) => {
    const res = await api.patch<{ status: string; data: User } | User>('/api/auth-service/v1/me/', data);
    if ('data' in res && 'status' in res) return res.data;
    return res;
  },
  changePassword: (old_password: string, new_password: string) =>
    api.post('/api/auth-service/v1/password/', { old_password, new_password }),
  referral: () =>
    api.get<{ code: string; url: string }>('/api/auth-service/v1/me/referral/'),
};
