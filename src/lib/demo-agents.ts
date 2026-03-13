// Demo agents are no longer used - all agent data comes from the real API.
// This file is kept for backwards compatibility but can be safely removed.

import type { Agent } from "@/lib/api/types";

export function getDemoAgents(): Agent[] {
  return [];
}

export function addDemoAgent(_agent: Agent): void {
  // no-op
}

export function getTypeName(typeId: string): string {
  const typeNameMap: Record<string, string> = {
    chatbot: "Чат-бот",
    marketer: "Маркетолог",
    hr: "HR",
    browser: "Браузерный",
    voice: "Голосовой",
    analytics: "Аналитика",
  };
  return typeNameMap[typeId] || typeId;
}
