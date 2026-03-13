"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AgentSubNavProps {
  agentId: string;
}

const tabs = [
  { key: "overview", label: "Обзор", href: "" },
  { key: "prompts", label: "Промпты", href: "/prompts" },
  { key: "channels", label: "Каналы", href: "/channels" },
  { key: "functions", label: "Функции", href: "/functions" },
  { key: "integrations", label: "Интеграции", href: "/integrations" },
  { key: "dialogues", label: "Диалоги", href: "/dialogues" },
  { key: "chat", label: "Чат", href: "/chat" },
  { key: "knowledge", label: "Знания", href: "/knowledge" },
  { key: "follow-ups", label: "Follow-ups", href: "/follow-ups" },
  { key: "analytics", label: "Аналитика", href: "/analytics" },
  { key: "settings", label: "Настройки", href: "/settings" },
];

export function AgentSubNav({ agentId }: AgentSubNavProps) {
  const pathname = usePathname();
  const basePath = `/agents/${agentId}`;

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`;
    if (href === "") return pathname === basePath;
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`${basePath}${tab.href}`}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            isActive(tab.href)
              ? "text-violet-400 border-violet-600"
              : "text-zinc-500 border-transparent hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
