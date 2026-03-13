import { api } from "./client";
import type { User, TokenOutput } from "./types";

export const authApi = {
  getAuthUrl: (redirectUrl: string) =>
    api.get<{ auth_url: string }>(`/api/core/auth/url?redirect_url=${encodeURIComponent(redirectUrl)}`),
  exchangeCode: (authResponseUrl: string) =>
    api.post<TokenOutput>('/api/core/auth/token', { auth_response_url: authResponseUrl }),
  refreshToken: (refreshToken: string) =>
    api.post<TokenOutput>('/api/core/auth/refresh', { refresh_token: refreshToken }),

  me: () =>
    api.get<User>('/api/auth-service/v1/me'),
  updateMe: (data: Partial<User>) =>
    api.patch<User>('/api/auth-service/v1/me', data),
  changePassword: (old_password: string, new_password: string) =>
    api.post('/api/auth-service/v1/password', { old_password, new_password }),
  referral: () =>
    api.get<{ code: string; url: string }>('/api/auth-service/v1/me/referral'),
};
