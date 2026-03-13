"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Agent } from "@/lib/api";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Активен", variant: "success" },
  paused: { label: "Пауза", variant: "warning" },
  draft: { label: "Черновик", variant: "default" },
};

const columns: Column<Agent>[] = [
  { key: "name", label: "Имя" },
  { key: "type", label: "Тип" },
  {
    key: "status",
    label: "Статус",
    render: (agent: Agent) => {
      const s = statusMap[agent.status] || statusMap.draft;
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  },
  { key: "total_messages", label: "Сообщения" },
  {
    key: "created_at",
    label: "Создан",
    render: (agent: Agent) =>
      new Date(agent.created_at).toLocaleDateString("ru-RU"),
  },
];

export default function AgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Demo data while backend agent CRUD API is being built
  const allAgents: Agent[] = [
    {
      id: "a1b2c3d4",
      name: "Маркетолог — ИП Алиев",
      type: "Маркетолог",
      organization_id: 1,
      status: "active",
      model: "GPT-4o",
      description: "Создаёт контент-планы, пишет посты для Instagram и Telegram",
      created_at: "2025-12-01T10:00:00Z",
      updated_at: "2026-03-10T14:30:00Z",
      total_messages: 1847,
      total_dialogues: 234,
    },
    {
      id: "e5f6g7h8",
      name: "HR-рекрутер — TechCorp",
      type: "HR",
      organization_id: 1,
      status: "active",
      model: "Claude 3.5 Sonnet",
      description: "Скринит резюме, проводит первичные интервью, назначает встречи",
      created_at: "2026-01-15T09:00:00Z",
      updated_at: "2026-03-12T11:00:00Z",
      total_messages: 892,
      total_dialogues: 156,
    },
    {
      id: "i9j0k1l2",
      name: "Голосовой — Клиника Аль-Фараби",
      type: "Голосовой",
      organization_id: 1,
      status: "paused",
      model: "GPT-4o",
      description: "Принимает звонки, записывает на приём, отвечает на вопросы",
      created_at: "2026-02-10T08:00:00Z",
      updated_at: "2026-03-08T16:00:00Z",
      total_messages: 421,
      total_dialogues: 89,
    },
    {
      id: "m3n4o5p6",
      name: "Чат-бот — Kaspi Магазин",
      type: "Чат-бот",
      organization_id: 1,
      status: "active",
      model: "GPT-4o-mini",
      description: "Отвечает на вопросы покупателей, помогает с заказами",
      created_at: "2026-02-20T12:00:00Z",
      updated_at: "2026-03-13T09:00:00Z",
      total_messages: 3241,
      total_dialogues: 567,
    },
    {
      id: "q7r8s9t0",
      name: "Аналитик — DataFlow",
      type: "Аналитика",
      organization_id: 1,
      status: "draft",
      model: "Claude 3.5 Sonnet",
      description: "Анализирует данные, строит отчёты, находит инсайты",
      created_at: "2026-03-10T15:00:00Z",
      updated_at: "2026-03-10T15:00:00Z",
      total_messages: 0,
      total_dialogues: 0,
    },
    {
      id: "u1v2w3x4",
      name: "Браузерный — Мониторинг цен",
      type: "Браузерный",
      organization_id: 1,
      status: "active",
      model: "GPT-4o",
      description: "Мониторит цены конкурентов, собирает данные с сайтов",
      created_at: "2026-03-01T10:00:00Z",
      updated_at: "2026-03-13T07:00:00Z",
      total_messages: 156,
      total_dialogues: 42,
    },
  ];

  const agents = allAgents.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Мои агенты</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Управление AI-агентами
          </p>
        </div>
        <Button onClick={() => router.push("/agents/new")}>
          <Plus className="h-4 w-4" />
          Создать агента
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Поиск агентов..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50"
            />
          </div>
        </div>

        {agents.length === 0 && !search ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-2xl bg-violet-600/10 mb-4">
              <Bot className="h-8 w-8 text-violet-400" />
            </div>
            <p className="text-lg font-medium text-white mb-1">
              У вас пока нет агентов
            </p>
            <p className="text-sm text-zinc-500 mb-4">
              Создайте первого AI-агента для вашего бизнеса
            </p>
            <Button onClick={() => router.push("/agents/new")}>
              <Plus className="h-4 w-4" />
              Создать агента
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={agents}
            emptyMessage="Агенты не найдены"
          />
        )}
      </Card>
    </div>
  );
}
