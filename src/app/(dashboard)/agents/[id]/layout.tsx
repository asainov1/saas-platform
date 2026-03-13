"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { AgentSubNav } from "@/components/agents/AgentSubNav";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";
import { demoStore } from "@/lib/api/demo-store";

export default function AgentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const { currentOrg } = useOrganization();
  const agentId = Number(params.id);
  const orgId = currentOrg?.id;

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", orgId, agentId],
    queryFn: () => demoStore.isDemoMode() ? demoStore.getAgent(agentId) : coreApi.getAgent(orgId!, agentId),
    enabled: !!orgId && !!agentId,
  });

  const statusMap: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
    active: { label: "Активен", variant: "success" },
    paused: { label: "Пауза", variant: "warning" },
    draft: { label: "Черновик", variant: "default" },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
      </div>
    );
  }

  const status = agent ? statusMap[agent.status] || statusMap.draft : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/agents")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {agent?.name || "Агент"}
            </h1>
            {status && <Badge variant={status.variant}>{status.label}</Badge>}
          </div>
          {agent?.description && (
            <p className="text-sm text-zinc-500 mt-0.5">{agent.description}</p>
          )}
        </div>
      </div>

      <AgentSubNav agentId={String(params.id)} />

      {children}
    </div>
  );
}
