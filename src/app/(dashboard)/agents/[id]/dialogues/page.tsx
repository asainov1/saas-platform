"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuery } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

const LIMIT = 20;

const statusMap: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Активен", variant: "success" },
  paused: { label: "Пауза", variant: "warning" },
  closed: { label: "Закрыт", variant: "default" },
};

export default function DialoguesPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = Number(params.id);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["threads", agentId, offset],
    queryFn: () => coreApi.getThreadsByAgent(agentId, { limit: LIMIT, offset }),
    enabled: !!agentId,
  });

  if (isLoading) return <Skeleton variant="card" />;

  const threads = data?.results || [];
  const total = data?.count || 0;

  if (threads.length === 0 && offset === 0) {
    return (
      <EmptyState
        icon={<MessagesSquare className="h-8 w-8 text-violet-400" />}
        title="Нет диалогов"
        description="Диалоги появятся, когда пользователи начнут общаться с агентом"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Диалоги</h2>

      <div className="space-y-2">
        {threads.map((thread) => {
          const s = statusMap[thread.status] || statusMap.active;
          return (
            <Card
              key={thread.id}
              className="cursor-pointer hover:bg-white/[0.04] transition-colors"
            >
              <div
                onClick={() => router.push(`/agents/${params.id}/dialogues/${thread.id}`)}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {thread.name || `Диалог #${thread.id}`}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {thread.channel_type} · {thread.messages_count} сообщений
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={s.variant}>{s.label}</Badge>
                  <span className="text-xs text-zinc-500">
                    {new Date(thread.updated_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Pagination total={total} limit={LIMIT} offset={offset} onOffsetChange={setOffset} />
    </div>
  );
}
