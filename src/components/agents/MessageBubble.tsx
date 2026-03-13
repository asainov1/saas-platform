"use client";

import { Bot, User, Shield } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "manager";
  content: string;
  timestamp?: string;
}

const roleIcons = {
  user: <User className="h-4 w-4 text-zinc-400" />,
  assistant: <Bot className="h-4 w-4 text-violet-400" />,
  system: <Shield className="h-4 w-4 text-amber-400" />,
  manager: <User className="h-4 w-4 text-emerald-400" />,
};

const roleStyles = {
  user: "bg-violet-600 text-white",
  assistant: "bg-white/5 text-zinc-300",
  system: "bg-amber-500/10 text-amber-300 text-xs",
  manager: "bg-emerald-500/10 text-emerald-300",
};

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""} ${isSystem ? "justify-center" : ""}`}>
      {!isUser && !isSystem && (
        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
          {roleIcons[role]}
        </div>
      )}
      <div className={`max-w-md px-4 py-2.5 rounded-xl text-sm whitespace-pre-wrap ${roleStyles[role]}`}>
        {content}
        {timestamp && (
          <p className="text-[10px] opacity-50 mt-1">
            {new Date(timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
      {isUser && (
        <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          {roleIcons.user}
        </div>
      )}
    </div>
  );
}
