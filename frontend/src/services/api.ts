import { Category, LinkItem, AnalyticsData, AuditLog, LoginAttempt, PublicSettings } from "../types";
import { localDb } from "./localDb";

const API_BASE = "/api";
let isBackendActive: boolean | null = null;

async function checkBackend(): Promise<boolean> {
  if (isBackendActive !== null) return isBackendActive;

  // If on github.io, run directly in high-performance standalone client mode
  if (typeof window !== "undefined" && window.location.hostname.endsWith("github.io")) {
    isBackendActive = false;
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/health`, { method: "GET" });
    isBackendActive = res.ok;
    return isBackendActive;
  } catch {
    isBackendActive = false;
    return false;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
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
  getPublicSettings: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getPublicSettings();
    try {
      return await request<PublicSettings>("/settings/public");
    } catch {
      return localDb.getPublicSettings();
    }
  },

  getLinks: async (params?: { category?: string; search?: string; filter?: string; sort?: string; status?: string; vault?: boolean }) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getLinks(params);
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.search) query.set("search", params.search);
      if (params?.filter) query.set("filter", params.filter);
      if (params?.sort) query.set("sort", params.sort);
      if (params?.status) query.set("status", params.status);
      if (params?.vault) query.set("vault", "true");
      return await request<LinkItem[]>(`/links?${query.toString()}`);
    } catch {
      return localDb.getLinks(params);
    }
  },

  getCategories: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getCategories();
    try {
      return await request<Category[]>("/categories");
    } catch {
      return localDb.getCategories();
    }
  },

  recordClick: async (linkId: string) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.recordClick(linkId);
    try {
      return await request<{ url: string; clicks: number }>(`/links/${linkId}/click`, { method: "POST" });
    } catch {
      return localDb.recordClick(linkId);
    }
  },

  // Auth
  login: async (username: string, password: string) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return await localDb.login(username, password);
    try {
      return await request<{ admin: { id: string; username: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
    } catch (err) {
      if ((err as any).status === 404 || (err as any).status === 502) {
        return await localDb.login(username, password);
      }
      throw err;
    }
  },

  checkSession: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.checkSession();
    try {
      return await request<{ admin: { id: string; username: string }; authenticated: boolean }>("/auth/session");
    } catch {
      return localDb.checkSession();
    }
  },

  logout: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.logout();
    try {
      return await request<{ message: string }>("/auth/logout", { method: "POST" });
    } catch {
      return localDb.logout();
    }
  },

  logoutAll: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.logoutAll();
    try {
      return await request<{ message: string }>("/auth/logout-all", { method: "POST" });
    } catch {
      return localDb.logoutAll();
    }
  },

  changePassword: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return await localDb.changePassword(data);
    try {
      return await request<{ message: string }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return await localDb.changePassword(data);
    }
  },

  // Admin Link CRUD
  createLink: async (link: Partial<LinkItem>) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.createLink(link);
    try {
      return await request<LinkItem>("/links", {
        method: "POST",
        body: JSON.stringify(link),
      });
    } catch {
      return localDb.createLink(link);
    }
  },

  updateLink: async (id: string, link: Partial<LinkItem>) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.updateLink(id, link);
    try {
      return await request<LinkItem>(`/links/${id}`, {
        method: "PUT",
        body: JSON.stringify(link),
      });
    } catch {
      return localDb.updateLink(id, link);
    }
  },

  deleteLink: async (id: string) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.deleteLink(id);
    try {
      return await request<{ message: string }>(`/links/${id}`, {
        method: "DELETE",
      });
    } catch {
      return localDb.deleteLink(id);
    }
  },

  // Admin Category CRUD
  createCategory: async (cat: Partial<Category>) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.createCategory(cat);
    try {
      return await request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify(cat),
      });
    } catch {
      return localDb.createCategory(cat);
    }
  },

  updateCategory: async (id: string, cat: Partial<Category>) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.updateCategory(id, cat);
    try {
      return await request<Category>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(cat),
      });
    } catch {
      return localDb.updateCategory(id, cat);
    }
  },

  deleteCategory: async (id: string) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.deleteCategory(id);
    try {
      return await request<{ message: string }>(`/categories/${id}`, {
        method: "DELETE",
      });
    } catch {
      return localDb.deleteCategory(id);
    }
  },

  // Admin Analytics & Logs
  getAnalytics: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getAnalytics();
    try {
      return await request<AnalyticsData>("/analytics");
    } catch {
      return localDb.getAnalytics();
    }
  },

  getLogs: async (params?: { page?: number; limit?: number; event?: string; status?: string; search?: string }) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getLogs(params);
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", params.page.toString());
      if (params?.limit) query.set("limit", params.limit.toString());
      if (params?.event) query.set("event", params.event);
      if (params?.status) query.set("status", params.status);
      if (params?.search) query.set("search", params.search);
      return await request<{ logs: AuditLog[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
        `/logs?${query.toString()}`
      );
    } catch {
      return localDb.getLogs(params);
    }
  },

  getLoginHistory: async (params?: { page?: number; limit?: number }) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getLoginHistory(params);
    try {
      const query = new URLSearchParams();
      if (params?.page) query.set("page", params.page.toString());
      if (params?.limit) query.set("limit", params.limit.toString());
      return await request<{ attempts: LoginAttempt[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
        `/logs/logins?${query.toString()}`
      );
    } catch {
      return localDb.getLoginHistory(params);
    }
  },

  clearLogs: async (days: number) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.clearLogs(days);
    try {
      return await request<{ deletedCount: number }>("/logs/clear", {
        method: "POST",
        body: JSON.stringify({ days }),
      });
    } catch {
      return localDb.clearLogs(days);
    }
  },

  // Admin Settings
  getAdminSettings: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.getAdminSettings();
    try {
      return await request<Record<string, string>>("/settings");
    } catch {
      return localDb.getAdminSettings();
    }
  },

  updateSettings: async (settings: Record<string, string>) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.updateSettings(settings);
    try {
      return await request<{ message: string }>("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
    } catch {
      return localDb.updateSettings(settings);
    }
  },

  // Backup & Restore
  exportJson: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) {
      localDb.exportBackupJson();
    } else {
      window.open("/api/backup/export/json", "_blank");
    }
  },

  exportLinksCsv: async () => {
    const hasBackend = await checkBackend();
    if (!hasBackend) {
      localDb.exportLinksCsv();
    } else {
      window.open("/api/backup/export/links-csv", "_blank");
    }
  },

  importBackup: async (backupData: any) => {
    const hasBackend = await checkBackend();
    if (!hasBackend) return localDb.importBackup(backupData);
    try {
      return await request<{ message: string; importedCategories: number; importedLinks: number; importedSettings: number }>("/backup/import", {
        method: "POST",
        body: JSON.stringify(backupData),
      });
    } catch {
      return localDb.importBackup(backupData);
    }
  },
};
