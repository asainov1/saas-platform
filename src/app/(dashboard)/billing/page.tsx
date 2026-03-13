"use client";

import { useEffect, useState } from "react";
import { Wallet, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/lib/providers/AuthProvider";
import { billingApi } from "@/lib/api";
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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txOffset, setTxOffset] = useState(0);
  const [autoReplenish, setAutoReplenish] = useState<AutoReplenishment | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageGrouped[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    const orgId = user.organization_ids?.[0];
    if (!orgId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const txRes = await billingApi.listTransactions({
          organization_id: orgId,
          limit: LIMIT,
          offset: txOffset,
        });
        setTransactions(txRes.results);
        setTxTotal(txRes.count);
      } catch {
        // Demo transactions
        setBalance("245000");
        setTransactions([
          { id: "t1", organization_id: 1, type: "real", purpose: "income", source: "card", amount: "50000", description: "Пополнение с карты •••• 4242", data: {}, created_at: "2026-03-13T09:00:00Z" },
          { id: "t2", organization_id: 1, type: "real", purpose: "expense", source: "system", amount: "3200", description: "GPT-4o: 45,000 токенов — Маркетолог", data: {}, created_at: "2026-03-12T18:00:00Z" },
          { id: "t3", organization_id: 1, type: "real", purpose: "expense", source: "system", amount: "1800", description: "Claude 3.5: 32,000 токенов — HR-рекрутер", data: {}, created_at: "2026-03-12T14:00:00Z" },
          { id: "t4", organization_id: 1, type: "bonus", purpose: "income", source: "system", amount: "10000", description: "Бонус за реферала", data: {}, created_at: "2026-03-11T10:00:00Z" },
          { id: "t5", organization_id: 1, type: "real", purpose: "expense", source: "system", amount: "4500", description: "GPT-4o: 62,000 токенов — Kaspi Магазин", data: {}, created_at: "2026-03-10T20:00:00Z" },
          { id: "t6", organization_id: 1, type: "real", purpose: "income", source: "card", amount: "100000", description: "Пополнение с карты •••• 4242", data: {}, created_at: "2026-03-08T09:00:00Z" },
          { id: "t7", organization_id: 1, type: "real", purpose: "expense", source: "system", amount: "2100", description: "GPT-4o-mini: 98,000 токенов — Чат-бот", data: {}, created_at: "2026-03-07T16:00:00Z" },
        ]);
        setTxTotal(7);
      }

      try {
        const ar = await billingApi.getAutoReplenishment(orgId);
        setAutoReplenish(ar);
      } catch {
        setAutoReplenish({
          id: "ar1",
          organization_id: 1,
          is_enabled: true,
          replenishment_amount: "50000",
          balance_threshold: "10000",
        });
      }

      try {
        const tu = await billingApi.tokenUsageGrouped(orgId);
        setTokenUsage(tu);
      } catch {
        const demoUsage: TokenUsageGrouped[] = [];
        for (let i = 14; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          demoUsage.push({ model: "GPT-4o", date: dateStr, input_tokens: Math.floor(Math.random() * 50000) + 10000, output_tokens: Math.floor(Math.random() * 20000) + 5000 });
          demoUsage.push({ model: "Claude 3.5", date: dateStr, input_tokens: Math.floor(Math.random() * 30000) + 5000, output_tokens: Math.floor(Math.random() * 15000) + 3000 });
        }
        setTokenUsage(demoUsage);
      }

      setLoading(false);
    };

    load();
  }, [user, authLoading, txOffset]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="chart" />
      </div>
    );
  }

  const orgId = user?.organization_ids?.[0];

  const toggleAutoReplenish = async () => {
    if (!orgId) return;
    try {
      if (autoReplenish) {
        const updated = await billingApi.updateAutoReplenishment(orgId, {
          is_enabled: !autoReplenish.is_enabled,
        });
        setAutoReplenish(updated);
      } else {
        const created = await billingApi.createAutoReplenishment(orgId, {
          is_enabled: true,
          replenishment_amount: "10000",
          balance_threshold: "1000",
        });
        setAutoReplenish(created);
      }
    } catch {}
  };

  // Group token usage by date for chart
  const chartData = tokenUsage.reduce<Record<string, Record<string, string | number>>>(
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

  const models = [...new Set(tokenUsage.map((t) => t.model))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Биллинг</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Управление балансом и расходами
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance card */}
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

        {/* Auto-replenishment */}
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
            <button
              onClick={toggleAutoReplenish}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                autoReplenish?.is_enabled ? "bg-violet-600" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  autoReplenish?.is_enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </Card>
      </div>

      {/* Transactions */}
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

      {/* Token usage chart */}
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
