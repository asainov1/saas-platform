"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";
import { LLM_MODELS } from "@/lib/constants/models";

export default function AgentSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();
  const agentId = Number(params.id);
  const orgId = currentOrg?.id;

  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", orgId, agentId],
    queryFn: () => coreApi.getAgent(orgId!, agentId),
    enabled: !!orgId && !!agentId,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [waitTime, setWaitTime] = useState("5");
  const [historyMessages, setHistoryMessages] = useState("20");
  const [historyDialogues, setHistoryDialogues] = useState("5");
  const [spamProtection, setSpamProtection] = useState(false);
  const [model, setModel] = useState("gpt-4o");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description || "");
      setWaitTime(String(agent.wait_time || 5));
      setHistoryMessages(String(agent.history_messages_count || 20));
      setHistoryDialogues(String(agent.history_dialogues_count || 5));
      setSpamProtection(agent.is_spam_protection_enabled || false);
      setModel(agent.llm?.model || agent.model || "gpt-4o");
    }
  }, [agent]);

  const updateMutation = useMutation({
    mutationFn: () =>
      coreApi.updateAgent(orgId!, agentId, {
        name,
        description,
        wait_time: Number(waitTime),
        history_messages_count: Number(historyMessages),
        history_dialogues_count: Number(historyDialogues),
        is_spam_protection_enabled: spamProtection,
      } as Partial<import("@/lib/api").Agent>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", orgId, agentId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => coreApi.deleteAgent(orgId!, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      router.push("/agents");
    },
  });

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-white">Настройки агента</h2>

      <Card title="Основное">
        <div className="space-y-4">
          <Input
            label="Имя агента"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Модель</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
            >
              {LLM_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-zinc-900">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Параметры">
        <div className="space-y-4">
          <Input
            label="Время ожидания (сек)"
            type="number"
            value={waitTime}
            onChange={(e) => setWaitTime(e.target.value)}
          />
          <Input
            label="Лимит сообщений в истории"
            type="number"
            value={historyMessages}
            onChange={(e) => setHistoryMessages(e.target.value)}
          />
          <Input
            label="Лимит диалогов в истории"
            type="number"
            value={historyDialogues}
            onChange={(e) => setHistoryDialogues(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Защита от спама</span>
            <Toggle checked={spamProtection} onChange={setSpamProtection} />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="danger" onClick={() => setShowDelete(true)}>
          Удалить агента
        </Button>
        <Button
          onClick={() => updateMutation.mutate()}
          loading={updateMutation.isPending}
        >
          Сохранить
        </Button>
      </div>

      {updateMutation.isSuccess && (
        <p className="text-sm text-emerald-400">Сохранено</p>
      )}

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Удалить агента"
        description={`Вы уверены, что хотите удалить агента "${agent?.name}"? Все данные будут потеряны.`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
