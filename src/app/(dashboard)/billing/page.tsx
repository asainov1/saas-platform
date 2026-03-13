"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/lib/providers/AuthProvider";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery } from "@tanstack/react-query";
import { billingApi, paymentsApi } from "@/lib/api";
import type { Transaction, AutoReplenishment, TokenUsageGrouped } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";

const LIMIT = 10;

const purposeMap: Record<string, { label: string; variant: "success" | "danger" }> = {
  income: { label: "Пополнение", variant: "success" },
  expense: { label: "Списание", variant: "danger" },
};

const txColumns: Column<Transaction>[] = [
  {
    key: "created_at",
    label: "Дата",
    render: (t: Transaction) =>
      new Date(t.created_at).toLocaleDateString("ru-RU"),
  },
  {
    key: "purpose",
    label: "Тип",
    render: (t: Transaction) => {
      const p = purposeMap[t.purpose] || purposeMap.expense;
      return <Badge variant={p.variant}>{p.label}</Badge>;
    },
  },
  { key: "description", label: "Описание" },
  {
    key: "amount",
    label: "Сумма",
    render: (t: Transaction) => {
      const isIncome = t.purpose === "income";
      return (
        <span className={isIncome ? "text-emerald-400" : "text-red-400"}>
          {isIncome ? "+" : "-"}
          {parseFloat(t.amount).toLocaleString("ru-RU")} ₸
        </span>
      );
    },
  },
  { key: "source", label: "Источник" },
];

export default function BillingPage() {
  const { loading: authLoading } = useAuth();
  const { currentOrg, loading: orgLoading } = useOrganization();
  const router = useRouter();
  const [txOffset, setTxOffset] = useState(0);
  const orgId = currentOrg?.id;

  const { data: balanceData } = useQuery({
    queryKey: ["balance", orgId],
    queryFn: () => billingApi.getBalance(orgId!),
    enabled: !!orgId,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["transactions", orgId, txOffset],
    queryFn: () => billingApi.listTransactions({ organization_id: orgId!, limit: LIMIT, offset: txOffset }),
    enabled: !!orgId,
  });

  const { data: autoReplenish } = useQuery({
    queryKey: ["auto-replenish", orgId],
    queryFn: () => billingApi.getAutoReplenishment(orgId!),
    enabled: !!orgId,
  });

  const { data: tokenUsage } = useQuery({
    queryKey: ["token-usage-grouped", orgId],
    queryFn: () => billingApi.tokenUsageGrouped(orgId!),
    enabled: !!orgId,
  });

  const loading = authLoading || orgLoading;

  if (loading || txLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="chart" />
      </div>
    );
  }

  const balance = balanceData?.balance || "0";
  const transactions = txData?.results || [];
  const txTotal = txData?.count || 0;
  const usageData = tokenUsage || [];

  const chartData = usageData.reduce<Record<string, Record<string, string | number>>>(
    (acc, item) => {
      const date = new Date(item.date).toLocaleDateString("ru-RU");
      if (!acc[date]) acc[date] = { date };
      acc[date][`${item.model}_in`] = item.input_tokens;
      acc[date][`${item.model}_out`] = item.output_tokens;
      return acc;
    },
    {}
  );
  const chartArr = Object.values(chartData);
  const models = [...new Set(usageData.map((t) => t.model))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Биллинг</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Управление балансом и расходами
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-violet-600/10">
              <Wallet className="h-5 w-5 text-violet-400" />
            </div>
            <span className="text-sm text-zinc-500">Баланс</span>
          </div>
          <p className="text-3xl font-bold text-white mb-4">
            {parseFloat(balance).toLocaleString("ru-RU")} ₸
          </p>
          <Button className="w-full">Пополнить</Button>
        </Card>

        <Card title="Автопополнение" className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">
                Автоматическое пополнение при низком балансе
              </p>
              {autoReplenish && (
                <p className="text-xs text-zinc-500 mt-1">
                  Порог: {parseFloat(autoReplenish.balance_threshold).toLocaleString("ru-RU")} ₸
                  {" | "}
                  Сумма: {parseFloat(autoReplenish.replenishment_amount).toLocaleString("ru-RU")} ₸
                </p>
              )}
            </div>
            <Toggle
              checked={autoReplenish?.is_enabled || false}
              onChange={() => {}}
            />
          </div>
        </Card>
      </div>

      <Card title="Транзакции">
        <Table
          columns={txColumns}
          data={transactions}
          emptyMessage="Нет транзакций"
          keyExtractor={(t) => t.id}
        />
        <Pagination
          total={txTotal}
          limit={LIMIT}
          offset={txOffset}
          onOffsetChange={setTxOffset}
        />
      </Card>

      <Card title="Использование токенов">
        {chartArr.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center">
            Нет данных по токенам
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartArr}>
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
                <Legend />
                {models.map((m, i) => (
                  <Bar
                    key={m}
                    dataKey={`${m}_in`}
                    name={`${m} (вход)`}
                    fill={i === 0 ? "#8b5cf6" : "#6d28d9"}
                    radius={[4, 4, 0, 0]}
                    stackId={m}
                  />
                ))}
                {models.map((m, i) => (
                  <Bar
                    key={`${m}_out`}
                    dataKey={`${m}_out`}
                    name={`${m} (выход)`}
                    fill={i === 0 ? "#a78bfa" : "#7c3aed"}
                    radius={[4, 4, 0, 0]}
                    stackId={m}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="flex justify-center">
        <Button
          variant="secondary"
          onClick={() => router.push("/billing/plans")}
        >
          Посмотреть тарифы
        </Button>
      </div>
    </div>
  );
}
