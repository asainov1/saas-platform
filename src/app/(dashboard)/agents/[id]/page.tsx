"use client";

import { useParams } from "next/navigation";
import { Bot, MessageSquare, MessagesSquare, Cpu } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

export default function AgentOverviewPage() {
  const params = useParams();
  const { currentOrg } = useOrganization();
  const agentId = Number(params.id);
  const orgId = currentOrg?.id;

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", orgId, agentId],
    queryFn: () => coreApi.getAgent(orgId!, agentId),
    enabled: !!orgId && !!agentId,
  });

  if (isLoading || !agent) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Сообщения"
          value={agent.total_messages}
        />
        <StatCard
          icon={<MessagesSquare className="h-5 w-5" />}
          label="Диалоги"
          value={agent.total_dialogues}
        />
        <StatCard
          icon={<Cpu className="h-5 w-5" />}
          label="Модель"
          value={agent.llm?.model || agent.model || "—"}
        />
        <StatCard
          icon={<Bot className="h-5 w-5" />}
          label="Каналы"
          value={agent.channels?.length || 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Информация">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Тип</span>
              <span className="text-white">{agent.type || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Создан</span>
              <span className="text-white">
                {new Date(agent.created_at).toLocaleDateString("ru-RU")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">ID</span>
              <span className="text-zinc-400 font-mono text-xs">{agent.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Время ожидания</span>
              <span className="text-white">{agent.wait_time} сек</span>
            </div>
          </div>
        </Card>

        <Card title="Каналы">
          {agent.channels && agent.channels.length > 0 ? (
            <div className="space-y-2">
              {agent.channels.map((ch) => (
                <div key={ch.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                  <span className="text-sm text-white capitalize">{ch.type}</span>
                  <Badge variant={ch.is_active ? "success" : "default"}>
                    {ch.is_active ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Нет подключённых каналов</p>
          )}
        </Card>
      </div>
    </div>
  );
}
