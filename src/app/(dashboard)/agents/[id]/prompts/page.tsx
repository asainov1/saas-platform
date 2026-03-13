"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";
import type { AgentPrompt } from "@/lib/api";

const promptTypes = [
  { value: "system", label: "Системный промпт" },
  { value: "start", label: "Стартовый промпт" },
  { value: "error", label: "Промпт ошибки" },
  { value: "org_context", label: "Контекст организации" },
];

export default function PromptsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();
  const agentId = Number(params.id);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["prompts", agentId],
    queryFn: () => coreApi.getPrompts(agentId),
    enabled: !!agentId,
  });

  const [editStates, setEditStates] = useState<Record<number, string>>({});
  const [newType, setNewType] = useState("system");
  const [newContent, setNewContent] = useState("");
  const [showNew, setShowNew] = useState(false);

  const updateMutation = useMutation({
    mutationFn: ({ promptId, content }: { promptId: number; content: string }) =>
      coreApi.updatePrompt(agentId, promptId, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompts", agentId] }),
  });

  const createMutation = useMutation({
    mutationFn: () => coreApi.createPrompt(agentId, { type: newType, content: newContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts", agentId] });
      setShowNew(false);
      setNewContent("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (promptId: number) => coreApi.deletePrompt(agentId, promptId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompts", agentId] }),
  });

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Промпты</h2>
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      {showNew && (
        <Card>
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-400">Тип</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
              >
                {promptTypes.map((t) => (
                  <option key={t.value} value={t.value} className="bg-zinc-900">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={6}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Содержимое промпта..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50 resize-none"
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowNew(false)}>
                Отмена
              </Button>
              <Button size="sm" onClick={() => createMutation.mutate()} loading={createMutation.isPending}>
                Создать
              </Button>
            </div>
          </div>
        </Card>
      )}

      {(!prompts || prompts.length === 0) && !showNew ? (
        <Card>
          <p className="text-sm text-zinc-500 text-center py-8">
            Нет промптов. Добавьте первый промпт для агента.
          </p>
        </Card>
      ) : (
        prompts?.map((prompt: AgentPrompt) => {
          const label = promptTypes.find((t) => t.value === prompt.type)?.label || prompt.type;
          const editValue = editStates[prompt.id] ?? prompt.content;

          return (
            <Card key={prompt.id}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-violet-400">{label}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      updateMutation.mutate({ promptId: prompt.id, content: editValue });
                    }}
                    loading={updateMutation.isPending}
                    disabled={editValue === prompt.content}
                  >
                    <Save className="h-3 w-3" />
                    Сохранить
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteMutation.mutate(prompt.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <textarea
                rows={6}
                value={editValue}
                onChange={(e) =>
                  setEditStates((prev) => ({ ...prev, [prompt.id]: e.target.value }))
                }
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50 resize-none font-mono"
              />
            </Card>
          );
        })
      )}
    </div>
  );
}
