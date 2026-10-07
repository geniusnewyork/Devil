import { Category, LinkItem, AnalyticsData, AuditLog, LoginAttempt, PublicSettings } from "../types";

// Helper for SHA-256 hashing using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message + "_monty_genius_salt_2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const STORAGE_KEYS = {
  LINKS: "mg_links",
  CATEGORIES: "mg_categories",
  SETTINGS: "mg_settings",
  LOGS: "mg_logs",
  LOGIN_ATTEMPTS: "mg_login_attempts",
  AUTH_HASH: "mg_admin_auth_hash",
  SESSION: "mg_active_session",
  FAILED_COUNT: "mg_failed_count",
  LOCKOUT_TIME: "mg_lockout_time",
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "AI & INTELLIGENCE",
    slug: "ai-tools",
    description: "Neural networks, LLMs, generation tools, and automation",
    icon: "Cpu",
    color: "#00F5FF",
    sortOrder: 1,
    linkCount: 1,
  },
  {
    id: "cat-2",
    name: "WEB DEVELOPMENT",
    slug: "web-development",
    description: "Repositories, frontend frameworks, and developer documentation",
    icon: "Code2",
    color: "#FF003C",
    sortOrder: 2,
    linkCount: 1,
  },
  {
    id: "cat-3",
    name: "CLOUD & HOSTING",
    slug: "cloud-hosting",
    description: "Cloud computing, CDN, databases, and serverless hosting",
    icon: "Server",
    color: "#00FF66",
    sortOrder: 3,
    linkCount: 2,
  },
  {
    id: "cat-4",
    name: "CYBER & SECURITY",
    slug: "cyber-security",
    description: "Network security, vulnerability scanners, and privacy tools",
    icon: "Shield",
    color: "#9D00FF",
    sortOrder: 4,
    linkCount: 1,
  },
  {
    id: "cat-5",
    name: "SOCIAL & MEDIA",
    slug: "social-media",
    description: "Social networks, portfolio channels, and community links",
    icon: "Share2",
    color: "#0066FF",
    sortOrder: 5,
    linkCount: 0,
  },
  {
    id: "cat-6",
    name: "PROJECTS & PERSONAL",
    slug: "projects-personal",
    description: "Active development builds, roadmaps, and personal assets",
    icon: "Briefcase",
    color: "#EAB308",
    sortOrder: 6,
    linkCount: 0,
  },
];

const DEFAULT_LINKS: LinkItem[] = [
  {
    id: "link-1",
    title: "GitHub Repository",
    url: "https://github.com/geniusnewyork/Devil",
    description: "Source code repository and version control",
    categoryId: "cat-2",
    icon: "GitBranch",
    tags: ["GIT", "OPEN_SOURCE", "CODE"],
    color: "#00F5FF",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: true,
    isPinned: true,
    sortOrder: 1,
    clickCount: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[1],
  },
  {
    id: "link-2",
    title: "OpenAI ChatGPT",
    url: "https://chatgpt.com",
    description: "Advanced generative AI intelligence and coding assistant",
    categoryId: "cat-1",
    icon: "Cpu",
    tags: ["AI", "LLM", "ASSISTANT"],
    color: "#00FF66",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: true,
    isPinned: true,
    sortOrder: 2,
    clickCount: 42,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[0],
  },
  {
    id: "link-3",
    title: "Render Dashboard",
    url: "https://dashboard.render.com",
    description: "Cloud web service deployment and live server telemetry",
    categoryId: "cat-3",
    icon: "Server",
    tags: ["CLOUD", "HOSTING", "PRODUCTION"],
    color: "#FF003C",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: true,
    isPinned: false,
    sortOrder: 3,
    clickCount: 19,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[2],
  },
  {
    id: "link-4",
    title: "Cloudflare Radar",
    url: "https://radar.cloudflare.com",
    description: "Global internet traffic insights and cybersecurity attack telemetry",
    categoryId: "cat-4",
    icon: "ShieldAlert",
    tags: ["SECURITY", "TELEMETRY", "CYBER"],
    color: "#9D00FF",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: false,
    isPinned: false,
    sortOrder: 4,
    clickCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[3],
  },
  {
    id: "link-5",
    title: "Vercel Deployments",
    url: "https://vercel.com",
    description: "Next-gen frontend cloud development platform",
    categoryId: "cat-3",
    icon: "Zap",
    tags: ["FRONTEND", "SERVERLESS"],
    color: "#EAB308",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: false,
    isPinned: false,
    sortOrder: 5,
    clickCount: 11,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[2],
  },
  {
    id: "link-vault-1",
    title: "[CLASSIFIED] Hardened Root Bastion",
    url: "https://bastion.internal.genius",
    description: "Encrypted emergency terminal gateway with hardware 2FA key isolation",
    categoryId: "cat-4",
    icon: "Lock",
    tags: ["VAULT", "TOP_SECRET", "ROOT"],
    color: "#FF003C",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: true,
    isPinned: true,
    isHidden: true,
    notes: "Restricted to Admin. Port 2222, hardware token clearance required.",
    sortOrder: 10,
    clickCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[3],
  },
  {
    id: "link-vault-2",
    title: "[CLASSIFIED] Production Database Console",
    url: "https://db.internal.genius",
    description: "Direct read/write database management gateway and SQL cluster explorer",
    categoryId: "cat-3",
    icon: "Database",
    tags: ["VAULT", "CLUSTER", "DATABASE"],
    color: "#00F5FF",
    status: "ACTIVE",
    openInNewTab: true,
    isFavorite: false,
    isPinned: false,
    isHidden: true,
    notes: "Master cryptographic session token needed. Private VPN tunnel only.",
    sortOrder: 11,
    clickCount: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORIES[2],
  },
];

const DEFAULT_SETTINGS: Record<string, string> = {
  siteTitle: "MONTY GENIUS // SECURE LINK HUB",
  siteSubtitle: "ALL MY DIGITAL TOOLS — ONE SECURE PLACE",
  footerText: "Designed with ❤️ by Monty Genius",
  accentColor: "#00F5FF",
  maintenanceMode: "false",
  maintenanceMessage: "MONTY GENIUS LINK HUB is currently undergoing scheduled cryptographic upgrade. Access is restricted.",
  rgbEffects: "true",
  cardStyle: "cyber",
  showDescriptions: "true",
  showCategories: "true",
  defaultSorting: "Newest",
  openInNewTab: "true",
  logRetentionDays: "30",
};

export class LocalDbService {
  private static instance: LocalDbService;

  private constructor() {
    this.init();
  }

  public static getInstance(): LocalDbService {
    if (!LocalDbService.instance) {
      LocalDbService.instance = new LocalDbService();
    }
    return LocalDbService.instance;
  }

  private init() {
    if (typeof window === "undefined") return;

    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LINKS)) {
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(DEFAULT_LINKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      const initialLogs: AuditLog[] = [
        {
          id: "log-init",
          timestamp: new Date().toISOString(),
          event: "SYSTEM_INITIALIZED",
          status: "SUCCESS",
          resource: "System",
          details: "Monty Genius client-side cryptographic storage initialized",
          ipAddress: "127.0.0.1",
          userAgent: navigator.userAgent,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(initialLogs));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_HASH)) {
      sha256("Genius").then((h) => {
        localStorage.setItem(STORAGE_KEYS.AUTH_HASH, h);
      });
    }
  }

  // LOGGING
  private addLog(event: string, status: "SUCCESS" | "FAILED" | "WARNING", resource: string, details?: string) {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || "[]");
    const newLog: AuditLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      event,
      status,
      resource,
      details: details || null,
      ipAddress: "Client Browser",
      userAgent: navigator.userAgent,
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 200)));
  }

  // PUBLIC
  public getPublicSettings(): PublicSettings {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || "{}");
    return {
      siteTitle: raw.siteTitle || DEFAULT_SETTINGS.siteTitle,
      siteSubtitle: raw.siteSubtitle || DEFAULT_SETTINGS.siteSubtitle,
      footerText: raw.footerText || DEFAULT_SETTINGS.footerText,
      maintenanceMode: raw.maintenanceMode === "true",
      maintenanceMessage: raw.maintenanceMessage || DEFAULT_SETTINGS.maintenanceMessage,
      accentColor: raw.accentColor || DEFAULT_SETTINGS.accentColor,
      rgbEffects: raw.rgbEffects !== "false",
      cardStyle: raw.cardStyle || "cyber",
      showDescriptions: raw.showDescriptions !== "false",
      showCategories: raw.showCategories !== "false",
    };
  }

  public getCategories(): Category[] {
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    return categories.map((cat) => ({
      ...cat,
      linkCount: links.filter((l) => l.categoryId === cat.id).length,
    }));
  }

  public getLinks(params?: { category?: string; search?: string; filter?: string; sort?: string; status?: string; vault?: boolean }): LinkItem[] {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const categories = this.getCategories();
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const populated = links.map((l) => ({
      ...l,
      category: catMap.get(l.categoryId),
    }));

    const session = this.checkSession();
    const isAdmin = session.authenticated;

    let filtered = populated;

    // Security Clearance: Non-admin visitors NEVER see hidden vault links
    if (!isAdmin) {
      filtered = filtered.filter((l) => !l.isHidden);
    } else {
      if (params?.vault) {
        filtered = filtered.filter((l) => !!l.isHidden);
      }
    }

    if (params?.category && params.category !== "ALL") {
      filtered = filtered.filter((l) => l.categoryId === params.category);
    }

    if (params?.filter === "FAVORITES") {
      filtered = filtered.filter((l) => l.isFavorite);
    }

    if (params?.status && params.status !== "ALL") {
      filtered = filtered.filter((l) => l.status === params.status);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description?.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      switch (params?.sort) {
        case "A-Z":
          return a.title.localeCompare(b.title);
        case "Z-A":
          return b.title.localeCompare(a.title);
        case "Most Used":
          return b.clickCount - a.clickCount;
        case "Oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }

  public recordClick(linkId: string): { url: string; clicks: number } {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const link = links.find((l) => l.id === linkId);
    if (link) {
      // Guard hidden link
      if (link.isHidden) {
        const session = this.checkSession();
        if (!session.authenticated) {
          return { url: "", clicks: 0 };
        }
      }
      link.clickCount = (link.clickCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
      return { url: link.url, clicks: link.clickCount };
    }
    return { url: "", clicks: 0 };
  }

  // AUTH
  public async login(username: string, password: string): Promise<{ admin: { id: string; username: string } }> {
    const lockoutStr = localStorage.getItem(STORAGE_KEYS.LOCKOUT_TIME);
    if (lockoutStr) {
      const lockoutEnd = parseInt(lockoutStr, 10);
      const remainingSecs = Math.ceil((lockoutEnd - Date.now()) / 1000);
      if (remainingSecs > 0) {
        const error = new Error("Security lockout active. Please wait.");
        (error as any).code = "ACCESS_DENIED";
        (error as any).details = {
          title: "SECURITY ALERT",
          sub: "ACCOUNT TEMPORARILY LOCKED OUT",
          failedAttempts: parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_COUNT) || "5", 10),
          cooldownSeconds: remainingSecs,
          timestamp: new Date().toISOString(),
        };
        throw error;
      }
    }

    const inputHash = await sha256(password);
    let targetHash = localStorage.getItem(STORAGE_KEYS.AUTH_HASH);
    if (!targetHash) {
      targetHash = await sha256("Genius");
      localStorage.setItem(STORAGE_KEYS.AUTH_HASH, targetHash);
    }

    if (inputHash !== targetHash) {
      const currentFail = parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_COUNT) || "0", 10) + 1;
      localStorage.setItem(STORAGE_KEYS.FAILED_COUNT, currentFail.toString());

      let cooldownSecs = 0;
      if (currentFail >= 7) {
        cooldownSecs = 15 * 60;
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_TIME, (Date.now() + cooldownSecs * 1000).toString());
      } else if (currentFail >= 4) {
        cooldownSecs = 60;
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_TIME, (Date.now() + cooldownSecs * 1000).toString());
      }

      this.addLog("LOGIN_FAILED", "FAILED", `Admin:${username}`, "Incorrect password attempt");

      const attempts: LoginAttempt[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS) || "[]");
      attempts.unshift({
        id: "att-" + Date.now(),
        timestamp: new Date().toISOString(),
        status: "FAILED",
        reason: "INVALID_CREDENTIALS",
        ip: "Client Browser",
        browser: "Chrome",
        os: "Windows",
        userAgent: navigator.userAgent,
      });
      localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(attempts.slice(0, 50)));

      const error = new Error("UNAUTHORIZED ACCESS ATTEMPT DETECTED. AUTHENTICATION FAILED.");
      (error as any).code = "ACCESS_DENIED";
      (error as any).details = {
        title: "SECURITY ALERT",
        sub: "ACTIVITY HAS BEEN LOGGED. DO NOT CONTINUE.",
        failedAttempts: currentFail,
        cooldownSeconds: cooldownSecs,
        timestamp: new Date().toISOString(),
      };
      throw error;
    }

    // Success
    localStorage.removeItem(STORAGE_KEYS.FAILED_COUNT);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIME);
    const sessionToken = "token-" + Date.now() + "-" + Math.random().toString(36).substr(2, 8);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ token: sessionToken, username, expiresAt: Date.now() + 86400000 * 7 }));

    this.addLog("LOGIN_SUCCESS", "SUCCESS", `Admin:${username}`, "Authenticated session established");

    const attempts: LoginAttempt[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS) || "[]");
    attempts.unshift({
      id: "att-" + Date.now(),
      timestamp: new Date().toISOString(),
      status: "SUCCESS",
      ip: "Client Browser",
      browser: "Chrome",
      os: "Windows",
      userAgent: navigator.userAgent,
    });
    localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(attempts.slice(0, 50)));

    return { admin: { id: "admin-root", username } };
  }

  public checkSession(): { admin: { id: string; username: string }; authenticated: boolean } {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return { admin: { id: "", username: "" }, authenticated: false };
    try {
      const session = JSON.parse(raw);
      if (session.expiresAt && session.expiresAt > Date.now()) {
        return { admin: { id: "admin-root", username: session.username || "Genius" }, authenticated: true };
      }
    } catch {}
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    return { admin: { id: "", username: "" }, authenticated: false };
  }

  public logout(): { message: string } {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.addLog("LOGOUT", "SUCCESS", "Admin:Genius", "Session closed");
    return { message: "Logged out successfully" };
  }

  public logoutAll(): { message: string } {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.addLog("LOGOUT_ALL", "SUCCESS", "Admin:Genius", "All sessions terminated");
    return { message: "All sessions terminated" };
  }

  public async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
    const curHash = await sha256(data.currentPassword);
    const targetHash = localStorage.getItem(STORAGE_KEYS.AUTH_HASH) || (await sha256("Genius"));
    if (curHash !== targetHash) {
      throw new Error("Current password is incorrect");
    }
    const newHash = await sha256(data.newPassword);
    localStorage.setItem(STORAGE_KEYS.AUTH_HASH, newHash);
    this.addLog("PASSWORD_CHANGED", "SUCCESS", "Admin:Genius", "Master password rotated successfully");
    return { message: "Password updated successfully" };
  }

  // LINK CRUD
  public createLink(linkData: Partial<LinkItem>): LinkItem {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const categories = this.getCategories();
    const category = categories.find((c) => c.id === linkData.categoryId);

    const newLink: LinkItem = {
      id: "link-" + Date.now(),
      title: linkData.title || "Untitled Link",
      url: linkData.url || "https://",
      description: linkData.description || "",
      categoryId: linkData.categoryId || categories[0]?.id || "cat-1",
      icon: linkData.icon || "Globe",
      tags: Array.isArray(linkData.tags) ? linkData.tags : [],
      color: linkData.color || "#00F5FF",
      status: linkData.status || "ACTIVE",
      openInNewTab: linkData.openInNewTab !== false,
      isFavorite: !!linkData.isFavorite,
      isPinned: !!linkData.isPinned,
      isHidden: !!linkData.isHidden,
      notes: linkData.notes || null,
      sortOrder: linkData.sortOrder || 0,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category,
    };

    links.unshift(newLink);
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    this.addLog("LINK_CREATED", "SUCCESS", `Link:${newLink.id}`, `Created link "${newLink.title}"`);
    return newLink;
  }

  public updateLink(id: string, linkData: Partial<LinkItem>): LinkItem {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const idx = links.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Link not found");

    const categories = this.getCategories();
    const updated = {
      ...links[idx],
      ...linkData,
      updatedAt: new Date().toISOString(),
      category: categories.find((c) => c.id === (linkData.categoryId || links[idx].categoryId)),
    };

    links[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    this.addLog("LINK_UPDATED", "SUCCESS", `Link:${id}`, `Updated link "${updated.title}"`);
    return updated;
  }

  public deleteLink(id: string): { message: string } {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const target = links.find((l) => l.id === id);
    const filtered = links.filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(filtered));
    this.addLog("LINK_DELETED", "WARNING", `Link:${id}`, `Deleted link "${target?.title || id}"`);
    return { message: "Link deleted" };
  }

  // CATEGORY CRUD
  public createCategory(catData: Partial<Category>): Category {
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
    const newCat: Category = {
      id: "cat-" + Date.now(),
      name: catData.name || "New Category",
      slug: (catData.name || "new").toLowerCase().replace(/[^a-z0-9]/g, "-"),
      description: catData.description || "",
      icon: catData.icon || "Folder",
      color: catData.color || "#00F5FF",
      sortOrder: catData.sortOrder || categories.length + 1,
      linkCount: 0,
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.addLog("CATEGORY_CREATED", "SUCCESS", `Category:${newCat.id}`, `Created category "${newCat.name}"`);
    return newCat;
  }

  public updateCategory(id: string, catData: Partial<Category>): Category {
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Category not found");

    const updated = {
      ...categories[idx],
      ...catData,
    };
    categories[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    this.addLog("CATEGORY_UPDATED", "SUCCESS", `Category:${id}`, `Updated category "${updated.name}"`);
    return updated;
  }

  public deleteCategory(id: string): { message: string } {
    const categories: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]");
    const target = categories.find((c) => c.id === id);
    const filtered = categories.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    this.addLog("CATEGORY_DELETED", "WARNING", `Category:${id}`, `Deleted category "${target?.name || id}"`);
    return { message: "Category deleted" };
  }

  // ANALYTICS & LOGS
  public getAnalytics(): AnalyticsData {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const categories = this.getCategories();
    const attempts: LoginAttempt[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS) || "[]");

    const activeLinks = links.filter((l) => l.status === "ACTIVE").length;
    const disabledLinks = links.filter((l) => l.status === "DISABLED").length;
    const maintenanceLinks = links.filter((l) => l.status === "MAINTENANCE").length;
    const favoriteLinks = links.filter((l) => l.isFavorite).length;
    const pinnedLinks = links.filter((l) => l.isPinned).length;
    const totalClicks = links.reduce((sum, l) => sum + (l.clickCount || 0), 0);
    const successfulLogins = attempts.filter((a) => a.status === "SUCCESS").length;
    const failedLogins = attempts.filter((a) => a.status === "FAILED").length;

    const catMap = new Map<string, number>();
    const catClicks = new Map<string, number>();
    links.forEach((l) => {
      catMap.set(l.categoryId, (catMap.get(l.categoryId) || 0) + 1);
      catClicks.set(l.categoryId, (catClicks.get(l.categoryId) || 0) + (l.clickCount || 0));
    });

    const categoryDistribution = categories.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      linkCount: catMap.get(c.id) || 0,
      totalClicks: catClicks.get(c.id) || 0,
    }));

    const sortedByClicks = [...links].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
    const topLinks = sortedByClicks.slice(0, 5).map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      clicks: l.clickCount,
      categoryName: l.category?.name || "General",
      categoryColor: l.color || "#00F5FF",
    }));

    return {
      summary: {
        totalLinks: links.length,
        activeLinks,
        disabledLinks,
        maintenanceLinks,
        favoriteLinks,
        pinnedLinks,
        totalCategories: categories.length,
        totalClicks,
        totalLogins: successfulLogins,
        failedLogins,
        lastLoginTime: attempts.find((a) => a.status === "SUCCESS")?.timestamp || null,
        lastActivityTime: new Date().toISOString(),
        lastActivityEvent: "LOCAL_HEARTBEAT",
      },
      categoryDistribution,
      topLinks,
      loginHistoryChart: [
        { date: "Day 1", success: 1, failed: 0 },
        { date: "Day 2", success: 2, failed: 1 },
        { date: "Day 3", success: successfulLogins || 3, failed: failedLogins || 0 },
      ],
    };
  }

  public getLogs(params?: { page?: number; limit?: number; event?: string; status?: string; search?: string }): {
    logs: AuditLog[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  } {
    let logs: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || "[]");

    if (params?.event && params.event !== "ALL") {
      logs = logs.filter((l) => l.event === params.event);
    }
    if (params?.status && params.status !== "ALL") {
      logs = logs.filter((l) => l.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.event.toLowerCase().includes(q) ||
          (l.resource && l.resource.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q))
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const total = logs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const pagedLogs = logs.slice((page - 1) * limit, page * limit);

    return {
      logs: pagedLogs,
      pagination: { total, page, limit, totalPages },
    };
  }

  public clearLogs(days: number): { deletedCount: number } {
    const logs: AuditLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || "[]");
    const cutoff = Date.now() - days * 86400000;
    const kept = logs.filter((l) => new Date(l.timestamp).getTime() >= cutoff);
    const deletedCount = logs.length - kept.length;
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(kept));
    this.addLog("LOGS_CLEARED", "WARNING", "System:Audit", `Purged ${deletedCount} logs older than ${days} days`);
    return { deletedCount };
  }

  public getLoginHistory(params?: { page?: number; limit?: number }): {
    attempts: LoginAttempt[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  } {
    const attempts: LoginAttempt[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS) || "[]");
    const page = params?.page || 1;
    const limit = params?.limit || 15;
    const total = attempts.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      attempts: attempts.slice((page - 1) * limit, page * limit),
      pagination: { total, page, limit, totalPages },
    };
  }

  // SETTINGS
  public getAdminSettings(): Record<string, string> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  }

  public updateSettings(newSettings: Record<string, string>): { message: string } {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    this.addLog("SETTINGS_CHANGED", "SUCCESS", "System:Config", "Global settings parameters updated");
    return { message: "Settings updated" };
  }

  // BACKUP
  public exportBackupJson(): void {
    const snapshot = {
      version: "1.0.0",
      brand: "MONTY GENIUS",
      exportedAt: new Date().toISOString(),
      data: {
        links: JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]"),
        categories: JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || "[]"),
        settings: JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || "{}"),
        logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || "[]"),
      },
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monty_genius_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public exportLinksCsv(): void {
    const links: LinkItem[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LINKS) || "[]");
    const header = "Title,URL,Category,Icon,Status,Favorite,Pinned,Clicks,Created\n";
    const rows = links
      .map(
        (l) =>
          `"${l.title.replace(/"/g, '""')}","${l.url}","${l.categoryId}","${l.icon}","${l.status}",${l.isFavorite},${l.isPinned},${l.clickCount},"${l.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monty_genius_links_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public importBackup(payload: any): { importedLinks: number; importedCategories: number; importedSettings: number } {
    if (!payload?.data) throw new Error("Invalid backup format");
    const { links, categories, settings, logs } = payload.data;
    if (Array.isArray(links)) localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(links));
    if (Array.isArray(categories)) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    if (settings && typeof settings === "object") localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (Array.isArray(logs)) localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

    this.addLog("BACKUP_RESTORED", "SUCCESS", "System:DisasterRecovery", "Imported snapshot archive");
    return {
      importedLinks: links?.length || 0,
      importedCategories: categories?.length || 0,
      importedSettings: Object.keys(settings || {}).length,
    };
  }
}

export const localDb = LocalDbService.getInstance();
