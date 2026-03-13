"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AgentAnalyticsPage() {
  const params = useParams();
  const { currentOrg } = useOrganization();
  const agentId = String(params.id);
  const orgId = currentOrg?.id;

  const { data: histogram, isLoading } = useQuery({
    queryKey: ["agent-histogram", orgId, agentId],
    queryFn: () => analyticsApi.messageHistogram(orgId!, { agent_id: agentId }),
    enabled: !!orgId,
  });

  if (isLoading) return <Skeleton variant="chart" />;

  const chartData = histogram?.data?.map((p) => ({
    date: new Date(p.timestamp).toLocaleDateString("ru-RU"),
    count: p.count,
  })) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Аналитика агента</h2>

      <Card title="Сообщения по дням">
        {chartData.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center">Нет данных</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fill="rgba(139,92,246,0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
