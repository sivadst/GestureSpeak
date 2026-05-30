const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("gs_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export function createWebSocket(clientId: string): WebSocket {
  return new WebSocket(`${WS_URL}/ws/gesture/${clientId}`);
}

export const api = {
  // Auth
  register: (data: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
  }) => apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => apiFetch("/api/auth/me"),

  // Gestures
  recognizeGesture: (frame: string, language: string) =>
    apiFetch("/api/gestures/recognize", {
      method: "POST",
      body: JSON.stringify({ frame, language }),
    }),

  getSupportedGestures: (language: string = "en") =>
    apiFetch(`/api/gestures/supported?language=${language}`),

  getLanguages: () => apiFetch("/api/gestures/languages"),

  getHistory: (limit: number = 50) =>
    apiFetch(`/api/gestures/history?limit=${limit}`),

  getStats: () => apiFetch("/api/gestures/stats"),

  // Health
  health: () => apiFetch("/api/health"),
};
