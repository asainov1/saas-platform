"use client";

import { useParams } from "next/navigation";
import { Link2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

const integrationTypes = [
  { type: "google_drive", label: "Google Drive", icon: "GD" },
  { type: "google_calendar", label: "Google Calendar", icon: "GC" },
  { type: "bitrix24", label: "Bitrix24", icon: "B24" },
  { type: "amocrm", label: "AmoCRM", icon: "AMO" },
];

export default function IntegrationsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const agentId = Number(params.id);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["integrations", agentId],
    queryFn: () => coreApi.getIntegrations(agentId),
    enabled: !!agentId,
  });

  const deleteMutation = useMutation({
    mutationFn: (intId: number) => coreApi.deleteIntegration(agentId, intId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["integrations", agentId] }),
  });

  if (isLoading) return <Skeleton variant="card" />;

  const connectedTypes = new Set(integrations?.map((i) => i.type));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Интеграции</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrationTypes.map((it) => {
          const connected = integrations?.find((i) => i.type === it.type);
          return (
            <Card key={it.type}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 text-xs font-bold">
                  {it.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{it.label}</p>
                  <Badge variant={connected?.is_active ? "success" : "default"}>
                    {connected ? "Подключён" : "Не подключён"}
                  </Badge>
                </div>
              </div>
              {connected ? (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteMutation.mutate(connected.id)}
                >
                  Отключить
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  Подключить (скоро)
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
