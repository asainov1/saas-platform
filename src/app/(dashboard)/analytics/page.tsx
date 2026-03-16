"use client";

import { useEffect, useState } from "react";
import { MessageSquare, MessagesSquare, Zap, Clock } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { analyticsApi } from "@/lib/api";
import type { AnalyticsSummary, HistogramPoint } from "@/lib/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

type Range = "7d" | "30d" | "90d";

function getDateRange(range: Range) {
  const end = new Date();
  const start = new Date();
  let step = 1;
  if (range === "7d") start.setDate(end.getDate() - 7);
  else if (range === "30d") start.setDate(end.getDate() - 30);
  else { start.setDate(end.getDate() - 90); step = 7; }
  return {
    start_date: start.toISOString().split("T")[0],
    end_date: end.toISOString().split("T")[0],
    step,
  };
}

export default function AnalyticsPage() {
  const { loading: authLoading } = useAuth();
  const { currentOrg, loading: orgLoading } = useOrganization();
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [messageHist, setMessageHist] = useState<HistogramPoint[]>([]);
  const [dialogueHist, setDialogueHist] = useState<HistogramPoint[]>([]);
  const [convRate, setConvRate] = useState(0);

  useEffect(() => {
    if (authLoading || orgLoading || !currentOrg) return;
    const orgId = currentOrg.id;

    const params = getDateRange(range);
    setLoading(true);

    const load = async () => {
      try {
        const s = await analyticsApi.summaries(orgId, params);
        setSummary(s);
      } catch {
        setSummary(null);
      }

      try {
        const m = await analyticsApi.messageHistogram(orgId, params);
        setMessageHist(m.data);
      } catch {
        setMessageHist([]);
      }

      try {
        const d = await analyticsApi.dialogueHistogram(orgId, params);
        setDialogueHist(d.data);
      } catch {
        setDialogueHist([]);
      }

      try {
        const c = await analyticsApi.conversionRate(orgId, params);
        setConvRate(c.rate);
      } catch {
        setConvRate(0);
      }

      setLoading(false);
    };

    load();
  }, [currentOrg, authLoading, orgLoading, range]);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  if (authLoading || orgLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
        <Skeleton variant="chart" />
      </div>
    );
  }

  const chartMessages = messageHist.map((p) => ({
    date: formatDate(p.timestamp),
    count: p.count,
  }));

  const chartDialogues = dialogueHist.map((p) => ({
    date: formatDate(p.timestamp),
    count: p.count,
  }));

  const radialData = [
    { name: "Конверсия", value: Math.round(convRate * 100), fill: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Аналитика</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Статистика по вашим агентам
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-white/5">
          {(["7d", "30d", "90d"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                range === r
                  ? "bg-violet-600 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {r === "7d" ? "7 дней" : r === "30d" ? "30 дней" : "90 дней"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Сообщения"
          value={summary?.total_messages ?? 0}
        />
        <StatCard
          icon={<MessagesSquare className="h-5 w-5" />}
          label="Диалоги"
          value={summary?.total_dialogues ?? 0}
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          label="Вызовы функций"
          value={summary?.total_function_calls ?? 0}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Ср. время (мс)"
          value={Math.round(summary?.avg_processing_time ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Сообщения">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartMessages}>
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
        </Card>

        <Card title="Диалоги">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDialogues}>
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
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Конверсия">
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width={200} height={200}>
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background={{ fill: "rgba(255,255,255,0.05)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -ml-4">
            <p className="text-3xl font-bold text-white">
              {Math.round(convRate * 100)}%
            </p>
            <p className="text-sm text-zinc-500">Конверсия</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
