import type { Agent, AgentDetail, AgentPrompt, AgentLLM } from "./types";

const AGENTS_KEY = "flowly_demo_agents";
const PROMPTS_KEY = "flowly_demo_prompts";

function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  const match = document.cookie.match(/(?:^|; )flowly_token=([^;]*)/);
  if (!match) return false;
  return match[1].endsWith(".demo");
}

function getStore<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

let nextId = Date.now();

export const demoStore = {
  isDemoMode,

  // ==================== Agents ====================
  getAgents: (): { agents: Agent[] } => {
    return { agents: getStore<Agent>(AGENTS_KEY) };
  },

  getAgent: (agentId: number): AgentDetail => {
    const agents = getStore<Agent>(AGENTS_KEY);
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) throw new Error("Agent not found");
    const prompts = getStore<AgentPrompt>(PROMPTS_KEY).filter((p) => p.agent_id === agentId);
    return {
      ...agent,
      wait_time: 30,
      history_messages_count: 0,
      history_dialogues_count: 0,
      is_spam_protection_enabled: false,
      channels: [],
      functions: [],
      integrations: [],
      prompts,
      llm: null,
    };
  },

  createAgent: (orgId: number, body: { name: string; type?: string; description?: string }): Agent => {
    const agents = getStore<Agent>(AGENTS_KEY);
    const agent: Agent = {
      id: ++nextId,
      name: body.name,
      type: body.type || "chatbot",
      organization_id: orgId,
      status: "active",
      model: "gpt-4o",
      description: body.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_messages: 0,
      total_dialogues: 0,
    };
    agents.push(agent);
    setStore(AGENTS_KEY, agents);
    return agent;
  },

  deleteAgent: (agentId: number): void => {
    setStore(AGENTS_KEY, getStore<Agent>(AGENTS_KEY).filter((a) => a.id !== agentId));
    setStore(PROMPTS_KEY, getStore<AgentPrompt>(PROMPTS_KEY).filter((p) => p.agent_id !== agentId));
  },

  updateAgent: (agentId: number, body: Partial<Agent>): Agent => {
    const agents = getStore<Agent>(AGENTS_KEY);
    const idx = agents.findIndex((a) => a.id === agentId);
    if (idx === -1) throw new Error("Agent not found");
    agents[idx] = { ...agents[idx], ...body, updated_at: new Date().toISOString() };
    setStore(AGENTS_KEY, agents);
    return agents[idx];
  },

  // ==================== Prompts ====================
  getPrompts: (agentId: number): AgentPrompt[] => {
    return getStore<AgentPrompt>(PROMPTS_KEY).filter((p) => p.agent_id === agentId);
  },

  createPrompt: (agentId: number, body: { type: string; content: string }): AgentPrompt => {
    const prompts = getStore<AgentPrompt>(PROMPTS_KEY);
    const prompt: AgentPrompt = {
      id: ++nextId,
      agent_id: agentId,
      type: body.type as AgentPrompt["type"],
      content: body.content,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    prompts.push(prompt);
    setStore(PROMPTS_KEY, prompts);
    return prompt;
  },

  updatePrompt: (agentId: number, promptId: number, body: Partial<AgentPrompt>): AgentPrompt => {
    const prompts = getStore<AgentPrompt>(PROMPTS_KEY);
    const idx = prompts.findIndex((p) => p.id === promptId && p.agent_id === agentId);
    if (idx === -1) throw new Error("Prompt not found");
    prompts[idx] = { ...prompts[idx], ...body };
    setStore(PROMPTS_KEY, prompts);
    return prompts[idx];
  },

  deletePrompt: (agentId: number, promptId: number): void => {
    setStore(PROMPTS_KEY, getStore<AgentPrompt>(PROMPTS_KEY).filter((p) => !(p.id === promptId && p.agent_id === agentId)));
  },

  // ==================== LLM ====================
  createLLM: (agentId: number, body: { model: string }): AgentLLM => ({
    id: ++nextId,
    agent_id: agentId,
    model: body.model,
    temperature: 0.7,
    max_tokens: 4096,
    created_at: new Date().toISOString(),
  }),
};
