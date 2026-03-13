"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Bot, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Table, type Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";
import { demoStore } from "@/lib/api/demo-store";
import type { Agent } from "@/lib/api";

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Активен", variant: "success" },
  paused: { label: "Пауза", variant: "warning" },
  draft: { label: "Черновик", variant: "default" },
};

export default function AgentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentOrg, loading: orgLoading } = useOrganization();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);

  const orgId = currentOrg?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["agents", orgId],
    queryFn: () => {
      if (demoStore.isDemoMode()) return demoStore.getAgents();
      return coreApi.getAgents(orgId!);
    },
    enabled: !!orgId,
  });

  const deleteMutation = useMutation({
    mutationFn: (agentId: number) => {
      if (demoStore.isDemoMode()) {
        demoStore.deleteAgent(agentId);
        return Promise.resolve();
      }
      return coreApi.deleteAgent(orgId!, agentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents", orgId] });
      setDeleteTarget(null);
    },
  });

  const allAgents = data?.agents || [];
  const agents = allAgents.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.type.toLowerCase().includes(search.toLowerCase())
  );

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
    {
      key: "id",
      label: "",
      render: (agent: Agent) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(agent);
          }}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
    );
  }

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
            onRowClick={(agent) => router.push(`/agents/${agent.id}`)}
          />
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Удалить агента"
        description={`Вы уверены, что хотите удалить агента "${deleteTarget?.name}"? Это действие нельзя отменить.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
