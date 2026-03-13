// ===================== AUTH =====================
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  email_verified: boolean;
  locale: string;
  zoneinfo: string;
  preferred_theme: string;
  date_joined: string;
  last_login: string | null;
}

export interface TokenOutput {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

// ===================== ORGANIZATION =====================
export interface Organization {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

// ===================== ANALYTICS =====================
export interface AnalyticsSummary {
  total_messages: number;
  total_dialogues: number;
  total_function_calls: number;
  avg_processing_time: number;
  conversion_rate: number;
}

export interface HistogramPoint {
  timestamp: string;
  count: number;
}

export interface HistogramData {
  data: HistogramPoint[];
  start_date: string;
  end_date: string;
  step: number;
}

export interface ConversionRate {
  rate: number;
  total_calls: number;
  successful_calls: number;
}

// ===================== BILLING =====================
export interface Transaction {
  id: string;
  organization_id: number;
  type: "real" | "bonus";
  purpose: "income" | "expense";
  source: "card" | "bank" | "manual" | "system" | "balance";
  amount: string;
  description: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface OrganizationBalance {
  organization_id: number;
  balance: string;
}

export interface AutoReplenishment {
  id: string;
  organization_id: number;
  is_enabled: boolean;
  replenishment_amount: string;
  balance_threshold: string;
}

export interface TokenUsage {
  id: string;
  organization_id: number;
  agent_id: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface TokenUsageTotal {
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface TokenUsageGrouped {
  model: string;
  date: string;
  input_tokens: number;
  output_tokens: number;
}

// ===================== NOTIFICATIONS =====================
export interface Notification {
  id: string;
  organization_id: number;
  agent_id: string | null;
  type: string;
  title: string;
  description: string;
  is_read: boolean;
  data: Record<string, unknown>;
  created_at: string;
}

export interface NotificationSettings {
  organization_id: number;
  agent_id: string | null;
  function_errors: boolean;
  channel_disconnection: boolean;
  integration_disconnection: boolean;
  tokens: boolean;
  subscriptions: boolean;
  balance: boolean;
  email_enabled: boolean;
  telegram_enabled: boolean;
}

export interface UnreadCount {
  count: number;
}

// ===================== PAYMENT =====================
export interface Payment {
  id: string;
  payment_id: string;
  organization_id: number;
  agent_id: string | null;
  provider: "stripe" | "yookassa";
  amount: string;
  currency: "RUB" | "USD" | "KZT";
  status: "pending" | "paid" | "failed";
  created_at: string;
}

export interface Subscription {
  id: string;
  organization_id: number;
  plan: string;
  billing_cycle: "monthly" | "yearly";
  status: "active" | "cancelled";
  current_period_end: string;
  created_at: string;
}

// ===================== AGENTS =====================
export interface Agent {
  id: number;
  name: string;
  type: string;
  organization_id: number;
  status: "active" | "paused" | "draft";
  model: string;
  description: string;
  created_at: string;
  updated_at: string;
  total_messages: number;
  total_dialogues: number;
}

export interface AgentDetail extends Agent {
  wait_time: number;
  history_messages_count: number;
  history_dialogues_count: number;
  is_spam_protection_enabled: boolean;
  channels: Channel[];
  functions: AgentFunction[];
  integrations: Integration[];
  prompts: AgentPrompt[];
  llm: AgentLLM | null;
}

export interface Channel {
  id: number;
  agent_id: number;
  type: "telegram" | "whatsapp" | "instagram" | "website" | "wazzup";
  name: string;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

export interface AgentFunction {
  id: number;
  agent_id: number;
  name: string;
  description: string;
  is_active: boolean;
  parameters: Record<string, unknown>;
  integrations: number[];
  post_actions: string[];
  created_at: string;
}

export interface Integration {
  id: number;
  agent_id: number;
  type: "google_drive" | "google_calendar" | "bitrix24" | "amocrm";
  name: string;
  is_active: boolean;
  config: Record<string, unknown>;
  created_at: string;
}

export interface AgentPrompt {
  id: number;
  agent_id: number;
  type: "system" | "start" | "error" | "org_context";
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface AgentLLM {
  id: number;
  agent_id: number;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
}

// ===================== THREADS =====================
export interface Thread {
  id: number;
  agent_id: number;
  external_id: string;
  channel_type: string;
  status: "active" | "paused" | "closed";
  name: string;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

export interface ThreadMessage {
  id: number;
  thread_id: number;
  role: "user" | "assistant" | "system" | "manager";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ===================== RAG =====================
export interface KnowledgeBase {
  id: number;
  agent_id: number;
  name: string;
  description: string;
  collection_name: string;
  top_k: number;
  chunk_size: number;
  chunk_overlap: number;
  documents_count: number;
  created_at: string;
}

// ===================== FOLLOW-UPS =====================
export interface FollowUp {
  id: number;
  agent_id: number;
  trigger_prompt: string;
  trigger_after: number;
  mode: "once" | "recurring";
  schedule_behavior: string;
  is_active: boolean;
  created_at: string;
}

// ===================== PAGINATION =====================
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ===================== INPUTS =====================
export interface CreateAgentInput {
  name: string;
  type?: string;
  description?: string;
}
