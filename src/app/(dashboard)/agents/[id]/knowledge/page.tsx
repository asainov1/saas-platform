"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

export default function KnowledgePage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const agentId = Number(params.id);

  const { data: knowledgeBases, isLoading } = useQuery({
    queryKey: ["knowledge", agentId],
    queryFn: () => coreApi.getKnowledgeBases(agentId),
    enabled: !!agentId,
  });

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [topK, setTopK] = useState("5");
  const [chunkSize, setChunkSize] = useState("512");
  const [chunkOverlap, setChunkOverlap] = useState("50");

  const createMutation = useMutation({
    mutationFn: () =>
      coreApi.createKnowledgeBase(agentId, {
        name: newName,
        description: newDesc,
        top_k: Number(topK),
        chunk_size: Number(chunkSize),
        chunk_overlap: Number(chunkOverlap),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge", agentId] });
      setShowNew(false);
      setNewName("");
      setNewDesc("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (kbId: number) => coreApi.deleteKnowledgeBase(agentId, kbId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledge", agentId] }),
  });

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Базы знаний</h2>
        <Button size="sm" onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4" />
          Создать
        </Button>
      </div>

      {(!knowledgeBases || knowledgeBases.length === 0) ? (
        <EmptyState
          icon={<Database className="h-8 w-8 text-violet-400" />}
          title="Нет баз знаний"
          description="Создайте базу знаний и загрузите документы для RAG"
          action={
            <Button size="sm" onClick={() => setShowNew(true)}>
              <Plus className="h-4 w-4" />
              Создать базу знаний
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {knowledgeBases.map((kb) => (
            <Card key={kb.id}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{kb.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{kb.description}</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(kb.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-zinc-500 space-y-1">
                <p>Документов: {kb.documents_count}</p>
                <p>top_k: {kb.top_k} · chunk: {kb.chunk_size} · overlap: {kb.chunk_overlap}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Новая база знаний">
        <div className="space-y-4">
          <Input label="Название" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label="Описание" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="top_k" type="number" value={topK} onChange={(e) => setTopK(e.target.value)} />
            <Input label="Chunk size" type="number" value={chunkSize} onChange={(e) => setChunkSize(e.target.value)} />
            <Input label="Overlap" type="number" value={chunkOverlap} onChange={(e) => setChunkOverlap(e.target.value)} />
          </div>
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
