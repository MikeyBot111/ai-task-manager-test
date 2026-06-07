export type Priority = "Vysoká" | "Střední" | "Nízká";

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  done: number;
  not_done: number;
  upcoming: number;
  by_priority: Record<Priority, number>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "tm_token";
const USER_KEY = "tm_user";

export function saveAuth(auth: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, auth.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 204) return undefined as unknown as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data && (data.detail as string)) || `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return data as T;
}

// ----- Auth -----
export const api = {
  register(payload: { email: string; username: string; password: string }) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login(payload: { username: string; password: string }) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request<User>("/api/auth/me");
  },

  // ----- Tasks -----
  listTasks(params: { status?: string; priority?: string } = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.priority) search.set("priority", params.priority);
    const qs = search.toString();
    return request<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
  },
  createTask(payload: {
    title: string;
    description?: string | null;
    due_date?: string | null;
    priority: Priority;
  }) {
    return request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateTask(
    id: number,
    payload: Partial<{
      title: string;
      description: string | null;
      due_date: string | null;
      priority: Priority;
      is_done: boolean;
    }>,
  ) {
    return request<Task>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  toggleTask(id: number) {
    return request<Task>(`/api/tasks/${id}/toggle`, { method: "POST" });
  },
  deleteTask(id: number) {
    return request<void>(`/api/tasks/${id}`, { method: "DELETE" });
  },
  dashboard() {
    return request<DashboardStats>("/api/tasks/dashboard");
  },
};
