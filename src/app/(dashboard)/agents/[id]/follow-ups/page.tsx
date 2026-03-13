"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

export default function FollowUpsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const agentId = Number(params.id);

  const { data: followUps, isLoading } = useQuery({
    queryKey: ["follow-ups", agentId],
    queryFn: () => coreApi.getFollowUps(agentId),
    enabled: !!agentId,
  });

  const [showNew, setShowNew] = useState(false);
  const [triggerPrompt, setTriggerPrompt] = useState("");
  const [triggerAfter, setTriggerAfter] = useState("3600");
  const [mode, setMode] = useState("once");

  const createMutation = useMutation({
    mutationFn: () =>
      coreApi.createFollowUp(agentId, {
        trigger_prompt: triggerPrompt,
        trigger_after: Number(triggerAfter),
        mode: mode as "once" | "recurring",
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-ups", agentId] });
      setShowNew(false);
      setTriggerPrompt("");
      setTriggerAfter("3600");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ fuId, isActive }: { fuId: number; isActive: boolean }) =>
      coreApi.updateFollowUp(agentId, fuId, { is_active: isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-ups", agentId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (fuId: number) => coreApi.deleteFollowUp(agentId, fuId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-ups", agentId] }),
  });

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Follow-ups</h2>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      {(!followUps || followUps.length === 0) ? (
        <EmptyState
          icon={<Clock className="h-8 w-8 text-violet-400" />}
          title="Нет follow-ups"
          description="Настройте автоматические follow-up сообщения для пользователей"
          action={
            <Button size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" />
              Создать follow-up
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => (
            <Card key={fu.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-white">{fu.trigger_prompt}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Через {Math.floor(fu.trigger_after / 60)} мин · {fu.mode === "once" ? "Один раз" : "Повторяющийся"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={fu.is_active}
                    onChange={(checked) => toggleMutation.mutate({ fuId: fu.id, isActive: checked })}
                  />
                  <button
                    onClick={() => deleteMutation.mutate(fu.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Новый follow-up">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Промпт</label>
            <textarea
              rows={3}
              value={triggerPrompt}
              onChange={(e) => setTriggerPrompt(e.target.value)}
              placeholder="Сообщение для отправки..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50 resize-none"
            />
          </div>
          <Input
            label="Через (секунд)"
            type="number"
            value={triggerAfter}
            onChange={(e) => setTriggerAfter(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-400">Режим</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
            >
              <option value="once" className="bg-zinc-900">Один раз</option>
              <option value="recurring" className="bg-zinc-900">Повторяющийся</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNew(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!triggerPrompt}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
