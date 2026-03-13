import { api } from "./client";
import type {
  Organization,
  Agent,
  AgentDetail,
  AgentPrompt,
  AgentLLM,
  AgentFunction,
  Channel,
  Integration,
  Thread,
  ThreadMessage,
  KnowledgeBase,
  FollowUp,
  PaginatedResponse,
  CreateAgentInput,
  TokenOutput,
} from "./types";

export const coreApi = {
  // ==================== Auth ====================
  getAuthUrl: (redirectUrl: string) =>
    api.get<{ auth_url: string }>(`/api/core/auth/url?redirect_url=${encodeURIComponent(redirectUrl)}`),
  exchangeCode: (authResponseUrl: string) =>
    api.post<TokenOutput>('/api/core/auth/token', { auth_response_url: authResponseUrl }),
  refreshToken: (refreshToken: string) =>
    api.post<TokenOutput>('/api/core/auth/refresh', { refresh_token: refreshToken }),

  // ==================== Organizations ====================
  getOrganizations: () =>
    api.get<PaginatedResponse<Organization>>('/api/core/organizations/'),
  getOrganization: (orgId: number) =>
    api.get<Organization>(`/api/core/organizations/${orgId}/`),

  // ==================== Agents CRUD ====================
  getAgents: (orgId: number) =>
    api.get<{ agents: Agent[] }>(`/api/core/agents/${orgId}/`),
  getAgent: (orgId: number, agentId: number) =>
    api.get<AgentDetail>(`/api/core/agents/${orgId}/${agentId}/`),
  createAgent: (orgId: number, body: CreateAgentInput) =>
    api.post<Agent>(`/api/core/agents/${orgId}/`, body),
  updateAgent: (orgId: number, agentId: number, body: Partial<Agent>) =>
    api.patch<Agent>(`/api/core/agents/${orgId}/${agentId}/`, body),
  deleteAgent: (orgId: number, agentId: number) =>
    api.delete(`/api/core/agents/${orgId}/${agentId}/`),

  // ==================== Prompts ====================
  getPrompts: (agentId: number) =>
    api.get<AgentPrompt[]>(`/api/core/agents/${agentId}/prompts/`),
  createPrompt: (agentId: number, body: { type: string; content: string }) =>
    api.post<AgentPrompt>(`/api/core/agents/${agentId}/prompts/`, body),
  updatePrompt: (agentId: number, promptId: number, body: Partial<AgentPrompt>) =>
    api.patch<AgentPrompt>(`/api/core/agents/${agentId}/prompts/${promptId}/`, body),
  deletePrompt: (agentId: number, promptId: number) =>
    api.delete(`/api/core/agents/${agentId}/prompts/${promptId}/`),

  // ==================== LLM ====================
  getLLM: (agentId: number) =>
    api.get<AgentLLM>(`/api/core/agents/${agentId}/llm/`),
  createLLM: (agentId: number, body: { model: string; temperature?: number; max_tokens?: number }) =>
    api.post<AgentLLM>(`/api/core/agents/${agentId}/llm/`, body),
  updateLLM: (agentId: number, llmId: number, body: Partial<AgentLLM>) =>
    api.patch<AgentLLM>(`/api/core/agents/${agentId}/llm/${llmId}/`, body),

  // ==================== Channels ====================
  getChannels: (agentId: number) =>
    api.get<Channel[]>(`/api/core/agents/${agentId}/channels/`),
  createChannel: (agentId: number, body: Partial<Channel>) =>
    api.post<Channel>(`/api/core/agents/${agentId}/channels/`, body),
  updateChannel: (agentId: number, channelId: number, body: Partial<Channel>) =>
    api.patch<Channel>(`/api/core/agents/${agentId}/channels/${channelId}/`, body),
  deleteChannel: (agentId: number, channelId: number) =>
    api.delete(`/api/core/agents/${agentId}/channels/${channelId}/`),
  setTelegramWebhook: (agentId: number, body: { bot_token: string }) =>
    api.post(`/api/core/agents/${agentId}/channels/telegram/set-webhook`, body),
  connectGreenApi: (agentId: number, body: { instance_id: string; api_token: string }) =>
    api.post(`/api/core/agents/${agentId}/channels/greenapi/connect`, body),
  setInstagramWebhook: (agentId: number, body: { access_token: string }) =>
    api.post(`/api/core/agents/${agentId}/channels/instagram/set-webhook`, body),

  // ==================== Functions ====================
  getFunctions: (agentId: number) =>
    api.get<AgentFunction[]>(`/api/core/agents/${agentId}/functions/`),
  createFunction: (agentId: number, body: Partial<AgentFunction>) =>
    api.post<AgentFunction>(`/api/core/agents/${agentId}/functions/`, body),
  updateFunction: (agentId: number, funcId: number, body: Partial<AgentFunction>) =>
    api.patch<AgentFunction>(`/api/core/agents/${agentId}/functions/${funcId}/`, body),
  deleteFunction: (agentId: number, funcId: number) =>
    api.delete(`/api/core/agents/${agentId}/functions/${funcId}/`),

  // ==================== Integrations ====================
  getIntegrations: (agentId: number) =>
    api.get<Integration[]>(`/api/core/agents/${agentId}/integrations/`),
  createIntegration: (agentId: number, body: Partial<Integration>) =>
    api.post<Integration>(`/api/core/agents/${agentId}/integrations/`, body),
  updateIntegration: (agentId: number, intId: number, body: Partial<Integration>) =>
    api.patch<Integration>(`/api/core/agents/${agentId}/integrations/${intId}/`, body),
  deleteIntegration: (agentId: number, intId: number) =>
    api.delete(`/api/core/agents/${agentId}/integrations/${intId}/`),

  // ==================== Threads ====================
  getThreadsByAgent: (agentId: number, params?: { limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    return api.get<PaginatedResponse<Thread>>(`/api/core/threads/by-agent/${agentId}?${q}`);
  },
  getThread: (threadId: number) =>
    api.get<Thread>(`/api/core/threads/${threadId}/`),
  getThreadMessages: (threadId: number, params?: { limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.offset) q.set("offset", String(params.offset));
    return api.get<PaginatedResponse<ThreadMessage>>(`/api/core/threads/${threadId}/messages?${q}`);
  },
  sendThreadMessage: (threadId: number, body: { content: string; role?: string }) =>
    api.post<ThreadMessage>(`/api/core/threads/${threadId}/messages`, body),

  // ==================== RAG ====================
  getKnowledgeBases: (agentId: number) =>
    api.get<KnowledgeBase[]>(`/api/core/agents/${agentId}/rag-agentic/`),
  createKnowledgeBase: (agentId: number, body: Partial<KnowledgeBase>) =>
    api.post<KnowledgeBase>(`/api/core/agents/${agentId}/rag-agentic/`, body),
  updateKnowledgeBase: (agentId: number, kbId: number, body: Partial<KnowledgeBase>) =>
    api.patch<KnowledgeBase>(`/api/core/agents/${agentId}/rag-agentic/${kbId}/`, body),
  deleteKnowledgeBase: (agentId: number, kbId: number) =>
    api.delete(`/api/core/agents/${agentId}/rag-agentic/${kbId}/`),

  // ==================== Follow-ups ====================
  getFollowUps: (agentId: number) =>
    api.get<FollowUp[]>(`/api/core/agents/${agentId}/follow-ups/`),
  createFollowUp: (agentId: number, body: Partial<FollowUp>) =>
    api.post<FollowUp>(`/api/core/agents/${agentId}/follow-ups/`, body),
  updateFollowUp: (agentId: number, fuId: number, body: Partial<FollowUp>) =>
    api.patch<FollowUp>(`/api/core/agents/${agentId}/follow-ups/${fuId}/`, body),
  deleteFollowUp: (agentId: number, fuId: number) =>
    api.delete(`/api/core/agents/${agentId}/follow-ups/${fuId}/`),

  // ==================== Storage ====================
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.upload<{ url: string }>('/api/core/storage/upload', formData);
  },
};
