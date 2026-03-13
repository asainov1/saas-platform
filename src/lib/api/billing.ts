import { api } from "./client";
import type {
  Transaction,
  OrganizationBalance,
  AutoReplenishment,
  TokenUsage,
  TokenUsageTotal,
  TokenUsageGrouped,
  PaginatedResponse,
} from "./types";

export const billingApi = {
  getBalance: (orgId: number) =>
    api.get<OrganizationBalance>(`/api/billing/balance/${orgId}`),

  listTransactions: (params?: {
    organization_id?: number;
    limit?: number;
    offset?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.organization_id) q.set("organization_id", String(params.organization_id));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    return api.get<PaginatedResponse<Transaction>>(`/api/billing/transactions?${q}`);
  },

  getAutoReplenishment: (orgId: number) =>
    api.get<AutoReplenishment>(
      `/api/billing/organizations/${orgId}/auto-replenishment`
    ),

  createAutoReplenishment: (orgId: number, data: Partial<AutoReplenishment>) =>
    api.post<AutoReplenishment>(
      `/api/billing/organizations/${orgId}/auto-replenishment`,
      data
    ),

  updateAutoReplenishment: (orgId: number, data: Partial<AutoReplenishment>) =>
    api.patch<AutoReplenishment>(
      `/api/billing/organizations/${orgId}/auto-replenishment`,
      data
    ),

  tokenUsage: (params?: {
    organization_id?: number;
    limit?: number;
    offset?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.organization_id) q.set("organization_id", String(params.organization_id));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    return api.get<PaginatedResponse<TokenUsage>>(`/api/billing/token-usage?${q}`);
  },

  tokenUsageTotal: (orgId?: number) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.get<TokenUsageTotal>(`/api/billing/token-usage/total${q}`);
  },

  tokenUsageGrouped: (orgId?: number) => {
    const q = orgId ? `?organization_id=${orgId}` : "";
    return api.get<TokenUsageGrouped[]>(`/api/billing/token-usage/grouped${q}`);
  },
};
