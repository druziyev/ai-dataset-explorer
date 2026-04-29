/* ── API client — talks to FastAPI backend ── */

import type { UploadResponse, EdaResponse, ChartsResponse } from "../types";

const API_BASE = "/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail || "Request failed", res.status);
  }
  return res.json();
}

/** Upload a dataset file */
export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: form,
  });
  return handleResponse<UploadResponse>(res);
}

/** Get EDA results */
export async function getEda(sessionId: string): Promise<EdaResponse> {
  const res = await fetch(`${API_BASE}/eda/${sessionId}`);
  return handleResponse<EdaResponse>(res);
}

/** Get auto-generated charts */
export async function getCharts(sessionId: string): Promise<ChartsResponse> {
  const res = await fetch(`${API_BASE}/charts/${sessionId}`);
  return handleResponse<ChartsResponse>(res);
}

/** Stream chat response via SSE */
export async function streamChat(
  sessionId: string,
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/chat/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: "Chat failed" }));
      onError(body.detail || "Chat request failed");
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("Streaming not supported");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.done) {
              onDone();
              return;
            }
            if (data.token) {
              onToken(data.token);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Network error");
  }
}
