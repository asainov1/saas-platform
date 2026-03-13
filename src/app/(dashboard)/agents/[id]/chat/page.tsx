"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Bot, User, Send, Square } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSSEStream } from "@/lib/hooks/useSSEStream";
import { useOrganization } from "@/lib/providers/OrganizationProvider";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const { currentOrg } = useOrganization();
  const agentId = Number(params.id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { stream, stop, streaming, content } = useSSEStream({
    onDone: () => {
      // content is final, will be captured in the effect below
    },
  });

  useEffect(() => {
    if (!streaming && content) {
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    }
  }, [streaming, content]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, content, streaming]);

  const sendMessage = () => {
    if (!input.trim() || streaming) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");

    stream({
      agent_id: agentId,
      organization_id: currentOrg?.id,
      message: userMsg,
      history: messages.slice(-10),
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Тестовый чат</h2>

      <Card className="flex flex-col h-[600px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && !streaming && (
            <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
              Начните диалог с агентом
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
              )}
              <div
                className={`max-w-lg px-4 py-2.5 rounded-xl text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-zinc-300"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-zinc-400" />
                </div>
              )}
            </div>
          ))}
          {streaming && content && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-violet-400" />
              </div>
              <div className="max-w-lg px-4 py-2.5 rounded-xl text-sm bg-white/5 text-zinc-300 whitespace-pre-wrap">
                {content}
                <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-text-bottom" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-white/5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Введите сообщение..."
            disabled={streaming}
            className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50 disabled:opacity-50"
          />
          {streaming ? (
            <Button variant="danger" onClick={stop}>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={sendMessage} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
