import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { createAuditLog } from "../middleware/audit.js";

const router = Router();

// Default fallback settings
const DEFAULT_SETTINGS: Record<string, { value: string; category: string }> = {
  siteTitle: { value: "MONTY GENIUS // SECURE LINK HUB", category: "GENERAL" },
  siteSubtitle: { value: "All my digital tools — one secure place.", category: "GENERAL" },
  footerText: { value: "Designed with ❤️ by Monty Genius", category: "GENERAL" },
  maintenanceMode: { value: "false", category: "SYSTEM" },
  maintenanceMessage: { value: "SYSTEM MAINTENANCE // MONTY GENIUS LINK HUB - Temporarily unavailable.", category: "SYSTEM" },
  accentColor: { value: "#00F5FF", category: "THEME" },
  cardStyle: { value: "cyber-glass", category: "THEME" },
  rgbEffects: { value: "true", category: "THEME" },
  animationIntensity: { value: "normal", category: "THEME" },
  defaultSorting: { value: "Newest", category: "LINKS" },
  openExternalNewTab: { value: "true", category: "LINKS" },
  showDescriptions: { value: "true", category: "LINKS" },
  showCategories: { value: "true", category: "LINKS" },
  sessionTimeoutDays: { value: "7", category: "SECURITY" },
  maxLoginAttempts: { value: "5", category: "SECURITY" },
  cooldownMinutes: { value: "15", category: "SECURITY" },
  logRetentionDays: { value: "90", category: "SECURITY" },
};

// GET /api/settings/public - Public safe settings
router.get("/public", async (req: Request, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};

    // populate defaults
    Object.keys(DEFAULT_SETTINGS).forEach((k) => {
      map[k] = DEFAULT_SETTINGS[k].value;
    });

    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    res.json({
      success: true,
      data: {
        siteTitle: map.siteTitle,
        siteSubtitle: map.siteSubtitle,
        footerText: map.footerText,
        maintenanceMode: map.maintenanceMode === "true",
        maintenanceMessage: map.maintenanceMessage,
        accentColor: map.accentColor,
        rgbEffects: map.rgbEffects === "true",
        cardStyle: map.cardStyle,
        showDescriptions: map.showDescriptions === "true",
        showCategories: map.showCategories === "true",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "SETTINGS_ERROR", message: "Failed to load public settings" },
    });
  }
});

// GET /api/settings - All settings (Admin)
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};

    Object.keys(DEFAULT_SETTINGS).forEach((k) => {
      map[k] = DEFAULT_SETTINGS[k].value;
    });

    settings.forEach((s) => {
      map[s.key] = s.value;
    });

    res.json({
      success: true,
      data: map,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "SETTINGS_ERROR", message: "Failed to load admin settings" },
    });
  }
});

// PUT /api/settings - Update settings in batch (Admin)
router.put("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const updates: Record<string, string> = req.body;

  if (!updates || typeof updates !== "object") {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_BODY", message: "Expected key-value pair of settings" },
    });
    return;
  }

  try {
    const promises = Object.entries(updates).map(([key, value]) => {
      const category = DEFAULT_SETTINGS[key]?.category || "GENERAL";
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value), category },
        create: { key, value: String(value), category },
      });
    });

    await prisma.$transaction(promises);

    await createAuditLog(
      req,
      "SETTINGS_CHANGED",
      "SUCCESS",
      "SystemSettings",
      `Updated settings: ${Object.keys(updates).join(", ")}`
    );

    res.json({
      success: true,
      data: { message: "Settings successfully updated" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "SAVE_SETTINGS_ERROR", message: "Failed to save settings" },
    });
  }
});

export default router;
