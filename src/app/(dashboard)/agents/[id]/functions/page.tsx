"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

export default function FunctionsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const agentId = Number(params.id);

  const { data: functions, isLoading } = useQuery({
    queryKey: ["functions", agentId],
    queryFn: () => coreApi.getFunctions(agentId),
    enabled: !!agentId,
  });

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      coreApi.createFunction(agentId, { name: newName, description: newDesc, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["functions", agentId] });
      setShowNew(false);
      setNewName("");
      setNewDesc("");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ funcId, isActive }: { funcId: number; isActive: boolean }) =>
      coreApi.updateFunction(agentId, funcId, { is_active: isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["functions", agentId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (funcId: number) => coreApi.deleteFunction(agentId, funcId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["functions", agentId] }),
  });

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Функции</h2>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" />
          Добавить
        </Button>
      </div>

      {(!functions || functions.length === 0) ? (
        <EmptyState
          icon={<Zap className="h-8 w-8 text-violet-400" />}
          title="Нет функций"
          description="Добавьте функции, чтобы агент мог выполнять действия"
          action={
            <Button size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" />
              Добавить функцию
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {functions.map((fn) => (
            <Card key={fn.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{fn.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{fn.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={fn.is_active}
                    onChange={(checked) => toggleMutation.mutate({ funcId: fn.id, isActive: checked })}
                  />
                  <button
                    onClick={() => deleteMutation.mutate(fn.id)}
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

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Новая функция">
        <div className="space-y-4">
          <Input
            label="Название"
            placeholder="send_email"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Описание"
            placeholder="Отправляет email указанному адресату"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowNew(false)}>
              Отмена
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              loading={createMutation.isPending}
              disabled={!newName}
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
