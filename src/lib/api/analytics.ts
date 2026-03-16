import { api } from "./client";
import type { AnalyticsSummary, HistogramData, ConversionRate } from "./types";

interface DateRangeParams {
  start_date?: string;
  end_date?: string;
  agent_id?: string;
  step?: number;
}

function buildQuery(params?: DateRangeParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.start_date) q.set("start_date", params.start_date);
  if (params.end_date) q.set("end_date", params.end_date);
  if (params.agent_id) q.set("agent_id", params.agent_id);
  if (params.step) q.set("step", String(params.step));
  const str = q.toString();
  return str ? `?${str}` : "";
}

export const analyticsApi = {
  summaries: (orgId: number, params?: DateRangeParams) =>
    api.get<AnalyticsSummary>(
      `/api/analytics/organizations/${orgId}/summaries${buildQuery(params)}`
    ),

  messageHistogram: (orgId: number, params?: DateRangeParams) =>
    api.get<HistogramData>(
      `/api/analytics/organizations/${orgId}/histogram/messages${buildQuery(params)}`
    ),

  dialogueHistogram: (orgId: number, params?: DateRangeParams) =>
    api.get<HistogramData>(
      `/api/analytics/organizations/${orgId}/histogram/dialogues${buildQuery(params)}`
    ),

  functionHistogram: (orgId: number, params?: DateRangeParams) =>
    api.get<HistogramData>(
      `/api/analytics/organizations/${orgId}/histogram/functions${buildQuery(params)}`
    ),

  conversionRate: (orgId: number, params?: DateRangeParams) =>
    api.get<ConversionRate>(
      `/api/analytics/organizations/${orgId}/rate/function-conversion${buildQuery(params)}`
    ),
};
