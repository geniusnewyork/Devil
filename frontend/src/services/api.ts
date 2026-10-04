import { Category, LinkItem, AnalyticsData, AuditLog, LoginAttempt, PublicSettings } from "../types";

const API_BASE = "/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // send cookies
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const error = new Error(data.error?.message || "An error occurred");
    (error as any).code = data.error?.code;
    (error as any).details = data.error?.alertDetails || data.error;
    (error as any).status = response.status;
    throw error;
  }

  return data.data;
}

export const api = {
  // Public
  getPublicSettings: () => request<PublicSettings>("/settings/public"),
  getLinks: (params?: { category?: string; search?: string; filter?: string; sort?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.search) query.set("search", params.search);
    if (params?.filter) query.set("filter", params.filter);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.status) query.set("status", params.status);
    return request<LinkItem[]>(`/links?${query.toString()}`);
  },
  getCategories: () => request<Category[]>("/categories"),
  recordClick: (linkId: string) => request<{ url: string; clicks: number }>(`/links/${linkId}/click`, { method: "POST" }),

  // Auth
  login: (username: string, password: string) =>
    request<{ admin: { id: string; username: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  checkSession: () => request<{ admin: { id: string; username: string }; authenticated: boolean }>("/auth/session"),
  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),
  logoutAll: () => request<{ message: string }>("/auth/logout-all", { method: "POST" }),
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Admin Link CRUD
  createLink: (link: Partial<LinkItem>) =>
    request<LinkItem>("/links", {
      method: "POST",
      body: JSON.stringify(link),
    }),
  updateLink: (id: string, link: Partial<LinkItem>) =>
    request<LinkItem>(`/links/${id}`, {
      method: "PUT",
      body: JSON.stringify(link),
    }),
  deleteLink: (id: string) =>
    request<{ message: string }>(`/links/${id}`, {
      method: "DELETE",
    }),

  // Admin Category CRUD
  createCategory: (cat: Partial<Category>) =>
    request<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(cat),
    }),
  updateCategory: (id: string, cat: Partial<Category>) =>
    request<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(cat),
    }),
  deleteCategory: (id: string) =>
    request<{ message: string }>(`/categories/${id}`, {
      method: "DELETE",
    }),

  // Admin Analytics & Logs
  getAnalytics: () => request<AnalyticsData>("/analytics"),
  getLogs: (params?: { page?: number; limit?: number; event?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.event) query.set("event", params.event);
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    return request<{ logs: AuditLog[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/logs?${query.toString()}`
    );
  },
  getLoginHistory: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    return request<{ attempts: LoginAttempt[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/logs/logins?${query.toString()}`
    );
  },
  clearLogs: (days: number) =>
    request<{ deletedCount: number }>("/logs/clear", {
      method: "POST",
      body: JSON.stringify({ days }),
    }),

  // Admin Settings
  getAdminSettings: () => request<Record<string, string>>("/settings"),
  updateSettings: (settings: Record<string, string>) =>
    request<{ message: string }>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  // Backup
  importBackup: (backupData: any) =>
    request<{ message: string; importedCategories: number; importedLinks: number; importedSettings: number }>("/backup/import", {
      method: "POST",
      body: JSON.stringify(backupData),
    }),
};
