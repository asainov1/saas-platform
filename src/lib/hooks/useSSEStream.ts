"use client";

import { useState, useCallback, useRef } from "react";

interface SSEEvent {
  type: string;
  data: string;
}

interface UseSSEStreamOptions {
  onToken?: (token: string) => void;
  onToolCallStart?: (data: unknown) => void;
  onToolCallEnd?: (data: unknown) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export function useSSEStream(options: UseSSEStreamOptions = {}) {
  const [streaming, setStreaming] = useState(false);
  const [content, setContent] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const stream = useCallback(
    async (body: Record<string, unknown>) => {
      setStreaming(true);
      setContent("");
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.text();
          options.onError?.(err);
          setStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                const eventType = parsed.type || parsed.event;

                switch (eventType) {
                  case "token":
                    accumulated += parsed.data || parsed.content || "";
                    setContent(accumulated);
                    options.onToken?.(parsed.data || parsed.content || "");
                    break;
                  case "tool_call_start":
                    options.onToolCallStart?.(parsed);
                    break;
                  case "tool_call_end":
                    options.onToolCallEnd?.(parsed);
                    break;
                  case "done":
                    options.onDone?.();
                    break;
                  case "error":
                    options.onError?.(parsed.data || parsed.message || "Unknown error");
                    break;
                }
              } catch {
                accumulated += data;
                setContent(accumulated);
                options.onToken?.(data);
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          options.onError?.(err.message);
        }
      } finally {
        setStreaming(false);
      }
    },
    [options]
  );

  return { stream, stop, streaming, content, setContent };
}
