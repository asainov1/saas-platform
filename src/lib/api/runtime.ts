import { api } from "./client";

export const runtimeApi = {
  stream: (body: {
    agent_id: number;
    organization_id?: number;
    message: string;
    history?: { role: string; content: string }[];
  }) =>
    fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
