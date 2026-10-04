export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon: string;
  color: string;
  sortOrder: number;
  linkCount?: number;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  icon: string;
  tags: string[];
  color: string;
  status: "ACTIVE" | "DISABLED" | "MAINTENANCE";
  openInNewTab: boolean;
  isFavorite: boolean;
  isPinned: boolean;
  sortOrder: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
}

export interface AuditLog {
  id: string;
  event: string;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
  resource: string | null;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details: string | null;
}

export interface LoginAttempt {
  id: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED";
  reason?: string | null;
  ip: string;
  browser: string;
  os: string;
  userAgent?: string | null;
}

export interface AnalyticsSummary {
  totalLinks: number;
  activeLinks: number;
  disabledLinks: number;
  maintenanceLinks: number;
  favoriteLinks: number;
  pinnedLinks: number;
  totalCategories: number;
  totalClicks: number;
  totalLogins: number;
  failedLogins: number;
  lastLoginTime: string | null;
  lastActivityTime: string | null;
  lastActivityEvent: string | null;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  topLinks: Array<{
    id: string;
    title: string;
    url: string;
    clicks: number;
    categoryName: string;
    categoryColor: string;
  }>;
  categoryDistribution: Array<{
    id: string;
    name: string;
    color: string;
    linkCount: number;
    totalClicks: number;
  }>;
  loginHistoryChart: Array<{
    date: string;
    success: number;
    failed: number;
  }>;
}

export interface PublicSettings {
  siteTitle: string;
  siteSubtitle: string;
  footerText: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  accentColor: string;
  rgbEffects: boolean;
  cardStyle: string;
  showDescriptions: boolean;
  showCategories: boolean;
}

export type ToastType = "success" | "warning" | "error" | "security";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
