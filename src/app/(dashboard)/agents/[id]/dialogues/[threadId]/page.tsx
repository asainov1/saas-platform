"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Bot, User, Shield, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";

export default function ThreadDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const threadId = Number(params.threadId);
  const [message, setMessage] = useState("");

  const { data: thread } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => coreApi.getThread(threadId),
    enabled: !!threadId,
  });

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => coreApi.getThreadMessages(threadId, { limit: 50 }),
    enabled: !!threadId,
  });

  const sendMutation = useMutation({
    mutationFn: () => coreApi.sendThreadMessage(threadId, { content: message, role: "manager" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread-messages", threadId] });
      setMessage("");
    },
  });

  const messages = messagesData?.results || [];

  const roleIcon: Record<string, React.ReactNode> = {
    user: <User className="h-4 w-4 text-zinc-400" />,
    assistant: <Bot className="h-4 w-4 text-violet-400" />,
    system: <Shield className="h-4 w-4 text-amber-400" />,
    manager: <User className="h-4 w-4 text-emerald-400" />,
  };

  if (isLoading) return <Skeleton variant="card" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {thread?.name || `Диалог #${threadId}`}
        </h2>
      </div>

      <Card className="flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              Нет сообщений
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} ${
                msg.role === "system" ? "justify-center" : ""
              }`}
            >
              {msg.role !== "user" && msg.role !== "system" && (
                <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  {roleIcon[msg.role] || roleIcon.assistant}
                </div>
              )}
              <div
                className={`max-w-md px-4 py-2.5 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : msg.role === "system"
                    ? "bg-amber-500/10 text-amber-300 text-xs"
                    : msg.role === "manager"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-white/5 text-zinc-300"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  {roleIcon.user}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-3 border-t border-white/5">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && message.trim() && sendMutation.mutate()}
            placeholder="Написать как менеджер..."
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50"
          />
          <Button
            onClick={() => sendMutation.mutate()}
            disabled={!message.trim()}
            loading={sendMutation.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
