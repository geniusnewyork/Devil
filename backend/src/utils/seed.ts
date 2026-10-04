import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { config } from "../config.js";

export async function runFirstTimeSetup(): Promise<void> {
  console.log("⚡ [SETUP] Checking database initialization...");

  // 1. Check or create Admin account
  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    console.log(`⚡ [SETUP] Creating initial admin user '${config.adminInitialUsername}'...`);
    const passwordHash = await bcrypt.hash(config.adminInitialPassword, 12);

    await prisma.admin.create({
      data: {
        username: config.adminInitialUsername,
        passwordHash,
      },
    });

    console.log("✓ [SETUP] Admin account created with secure hash. Password is not plaintext.");
  }

  // 2. Default Categories
  const defaultCategories = [
    { name: "WEB DEVELOPMENT", slug: "web-development", icon: "Code2", color: "#00F5FF", description: "Frontend, backend, stacks and dev toolchains", sortOrder: 1 },
    { name: "AI TOOLS", slug: "ai-tools", icon: "Cpu", color: "#FF003C", description: "Generative AI, LLMs, neural networks and assistants", sortOrder: 2 },
    { name: "HOSTING & CLOUD", slug: "hosting-cloud", icon: "Server", color: "#00FF66", description: "VPS, serverless, clouds, DNS, CDN and compute", sortOrder: 3 },
    { name: "CYBERSECURITY", slug: "cybersecurity", icon: "ShieldAlert", color: "#DC143C", description: "Pentesting, vulnerability scanners, OSINT and audit", sortOrder: 4 },
    { name: "PROJECTS", slug: "projects", icon: "Layers", color: "#9D00FF", description: "Personal applications, experiments and portfolio", sortOrder: 5 },
    { name: "SOCIAL MEDIA", slug: "social-media", icon: "Share2", color: "#0066FF", description: "Social platforms, profiles and network channels", sortOrder: 6 },
    { name: "BUSINESS", slug: "business", icon: "Briefcase", color: "#EAB308", description: "Invoicing, finance, client hubs and analytics", sortOrder: 7 },
    { name: "DESIGN", slug: "design", icon: "Palette", color: "#EC4899", description: "Figma, icons, UI kits, design systems and assets", sortOrder: 8 },
    { name: "MARKETING", slug: "marketing", icon: "TrendingUp", color: "#F97316", description: "SEO, growth tools, campaigns and email trackers", sortOrder: 9 },
    { name: "PERSONAL", slug: "personal", icon: "User", color: "#8B5CF6", description: "Private notes, bookmarks, dashboards and utilities", sortOrder: 10 },
    { name: "IMPORTANT", slug: "important", icon: "AlertTriangle", color: "#EF4444", description: "High-priority resources, master vaults and keys", sortOrder: 11 },
    { name: "OTHER", slug: "other", icon: "Folder", color: "#64748B", description: "General bookmarks and miscellaneous resources", sortOrder: 12 },
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✓ [SETUP] Categories initialized.");

  // 3. Default Settings
  const defaultSettings = [
    { key: "siteTitle", value: "MONTY GENIUS // SECURE LINK HUB", category: "GENERAL" },
    { key: "siteSubtitle", value: "All my digital tools — one secure place.", category: "GENERAL" },
    { key: "footerText", value: "Designed with ❤️ by Monty Genius", category: "GENERAL" },
    { key: "maintenanceMode", value: "false", category: "SYSTEM" },
    { key: "maintenanceMessage", value: "SYSTEM MAINTENANCE // MONTY GENIUS LINK HUB - Temporarily unavailable.", category: "SYSTEM" },
    { key: "accentColor", value: "#00F5FF", category: "THEME" },
    { key: "cardStyle", value: "cyber-glass", category: "THEME" },
    { key: "rgbEffects", value: "true", category: "THEME" },
    { key: "animationIntensity", value: "normal", category: "THEME" },
    { key: "defaultSorting", value: "Newest", category: "LINKS" },
    { key: "openExternalNewTab", value: "true", category: "LINKS" },
    { key: "showDescriptions", value: "true", category: "LINKS" },
    { key: "showCategories", value: "true", category: "LINKS" },
    { key: "sessionTimeoutDays", value: "7", category: "SECURITY" },
    { key: "maxLoginAttempts", value: "5", category: "SECURITY" },
    { key: "cooldownMinutes", value: "15", category: "SECURITY" },
    { key: "logRetentionDays", value: "90", category: "SECURITY" },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("✓ [SETUP] Settings initialized.");

  // 4. Default Seed Links (if no links exist)
  const linkCount = await prisma.link.count();
  if (linkCount === 0) {
    console.log("⚡ [SETUP] Seeding default starter links...");
    const aiCategory = await prisma.category.findUnique({ where: { slug: "ai-tools" } });
    const devCategory = await prisma.category.findUnique({ where: { slug: "web-development" } });
    const cloudCategory = await prisma.category.findUnique({ where: { slug: "hosting-cloud" } });
    const secCategory = await prisma.category.findUnique({ where: { slug: "cybersecurity" } });

    const starterLinks = [
      {
        title: "GitHub Command Center",
        url: "https://github.com",
        description: "Primary repositories, version control, PRs and deployment actions.",
        categoryId: devCategory?.id || "",
        icon: "GitBranch",
        tags: JSON.stringify(["git", "code", "devops", "repos"]),
        color: "#00F5FF",
        status: "ACTIVE",
        isPinned: true,
        isFavorite: true,
        sortOrder: 1,
        clickCount: 42,
      },
      {
        title: "Anthropic Claude Console",
        url: "https://claude.ai",
        description: "Advanced reasoning model, technical documentation and agent testing.",
        categoryId: aiCategory?.id || "",
        icon: "Cpu",
        tags: JSON.stringify(["ai", "llm", "intelligence", "assistant"]),
        color: "#FF003C",
        status: "ACTIVE",
        isPinned: true,
        isFavorite: true,
        sortOrder: 2,
        clickCount: 88,
      },
      {
        title: "Render Cloud Dashboard",
        url: "https://dashboard.render.com",
        description: "Cloud web services, SQLite persistent storage, background workers and cron jobs.",
        categoryId: cloudCategory?.id || "",
        icon: "Server",
        tags: JSON.stringify(["cloud", "hosting", "production", "deploy"]),
        color: "#00FF66",
        status: "ACTIVE",
        isPinned: false,
        isFavorite: true,
        sortOrder: 3,
        clickCount: 35,
      },
      {
        title: "OWASP Vulnerability Matrix",
        url: "https://owasp.org",
        description: "Security benchmarks, top 10 vulnerabilities, API security checks and defensive hardening.",
        categoryId: secCategory?.id || "",
        icon: "ShieldAlert",
        tags: JSON.stringify(["security", "audit", "cyber", "firewall"]),
        color: "#DC143C",
        status: "ACTIVE",
        isPinned: false,
        isFavorite: true,
        sortOrder: 4,
        clickCount: 19,
      },
      {
        title: "OpenAI Platform",
        url: "https://platform.openai.com",
        description: "API keys, playground, fine-tuning and token analytics.",
        categoryId: aiCategory?.id || "",
        icon: "Zap",
        tags: JSON.stringify(["ai", "api", "gpt"]),
        color: "#9D00FF",
        status: "ACTIVE",
        isPinned: false,
        isFavorite: false,
        sortOrder: 5,
        clickCount: 27,
      },
    ];

    for (const l of starterLinks) {
      if (l.categoryId) {
        await prisma.link.create({ data: l });
      }
    }
    console.log("✓ [SETUP] Starter links seeded.");
  }

  console.log("✓ [SETUP] Database ready.");
}

// Allow direct execution
if (process.argv[1]?.endsWith("seed.ts")) {
  runFirstTimeSetup()
    .then(() => {
      console.log("Setup complete!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Setup failed:", err);
      process.exit(1);
    });
}
