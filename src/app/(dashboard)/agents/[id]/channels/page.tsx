"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

const channelTypes = [
  { type: "telegram" as const, label: "Telegram", icon: "TG" },
  { type: "whatsapp" as const, label: "WhatsApp", icon: "WA" },
  { type: "instagram" as const, label: "Instagram", icon: "IG" },
  { type: "website" as const, label: "Website Chat", icon: "WB" },
  { type: "wazzup" as const, label: "Wazzup", icon: "WZ" },
];

export default function ChannelsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const agentId = Number(params.id);

  const { data: channels, isLoading } = useQuery({
    queryKey: ["channels", agentId],
    queryFn: () => coreApi.getChannels(agentId),
    enabled: !!agentId,
  });

  const [connectType, setConnectType] = useState<string | null>(null);
  const [botToken, setBotToken] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [apiToken, setApiToken] = useState("");

  const telegramMutation = useMutation({
    mutationFn: () => coreApi.setTelegramWebhook(agentId, { bot_token: botToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels", agentId] });
      setConnectType(null);
      setBotToken("");
    },
  });

  const greenApiMutation = useMutation({
    mutationFn: () => coreApi.connectGreenApi(agentId, { instance_id: instanceId, api_token: apiToken }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels", agentId] });
      setConnectType(null);
      setInstanceId("");
      setApiToken("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ channelId, isActive }: { channelId: number; isActive: boolean }) =>
      coreApi.updateChannel(agentId, channelId, { is_active: isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["channels", agentId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (channelId: number) => coreApi.deleteChannel(agentId, channelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["channels", agentId] }),
  });

  if (isLoading) return <Skeleton variant="card" />;

  const connectedTypes = new Set(channels?.map((c) => c.type));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Каналы</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channelTypes.map((ct) => {
          const connected = channels?.find((c) => c.type === ct.type);
          return (
            <Card key={ct.type} className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-violet-600/10 flex items-center justify-center text-violet-400 text-sm font-bold">
                  {ct.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{ct.label}</p>
                  <Badge variant={connected?.is_active ? "success" : "default"}>
                    {connected ? (connected.is_active ? "Подключён" : "Неактивен") : "Не подключён"}
                  </Badge>
                </div>
              </div>
              {connected ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => toggleMutation.mutate({ channelId: connected.id, isActive: !connected.is_active })}
                  >
                    {connected.is_active ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                    {connected.is_active ? "Откл." : "Вкл."}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteMutation.mutate(connected.id)}
                  >
                    Удалить
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setConnectType(ct.type)}
                >
                  <Plus className="h-3 w-3" />
                  Подключить
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Telegram connect modal */}
      <Modal
        open={connectType === "telegram"}
        onClose={() => setConnectType(null)}
        title="Подключить Telegram"
      >
        <div className="space-y-4">
          <Input
            label="Bot Token"
            placeholder="123456789:ABCDefGHIjklMNO..."
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConnectType(null)}>
              Отмена
            </Button>
            <Button
              onClick={() => telegramMutation.mutate()}
              loading={telegramMutation.isPending}
              disabled={!botToken}
            >
              Подключить
            </Button>
          </div>
        </div>
      </Modal>

      {/* WhatsApp connect modal */}
      <Modal
        open={connectType === "whatsapp"}
        onClose={() => setConnectType(null)}
        title="Подключить WhatsApp"
      >
        <div className="space-y-4">
          <Input
            label="Instance ID"
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
          />
          <Input
            label="API Token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConnectType(null)}>
              Отмена
            </Button>
            <Button
              onClick={() => greenApiMutation.mutate()}
              loading={greenApiMutation.isPending}
              disabled={!instanceId || !apiToken}
            >
              Подключить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Generic connect modal for other types */}
      <Modal
        open={!!connectType && !["telegram", "whatsapp"].includes(connectType)}
        onClose={() => setConnectType(null)}
        title={`Подключить ${channelTypes.find((c) => c.type === connectType)?.label}`}
      >
        <p className="text-sm text-zinc-400 mb-4">
          Подключение этого канала будет доступно в ближайшее время.
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setConnectType(null)}>
            Закрыть
          </Button>
        </div>
      </Modal>
    </div>
  );
}
