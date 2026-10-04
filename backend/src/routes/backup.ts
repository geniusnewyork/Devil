import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { createAuditLog } from "../middleware/audit.js";

const router = Router();

// GET /api/backup/export/json - Complete system backup export
router.get("/export/json", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [links, categories, settings, logs] = await Promise.all([
      prisma.link.findMany({ include: { category: true } }),
      prisma.category.findMany(),
      prisma.setting.findMany(),
      prisma.auditLog.findMany({ take: 1000, orderBy: { timestamp: "desc" } }),
    ]);

    const backupPayload = {
      version: "1.0.0",
      system: "MONTY_GENIUS_SECURE_LINK_HUB",
      exportedAt: new Date().toISOString(),
      exportedBy: req.admin?.username || "Admin",
      data: {
        categories,
        links,
        settings,
        logs,
      },
    };

    await createAuditLog(
      req,
      "BACKUP_CREATED",
      "SUCCESS",
      "SystemBackup",
      `Exported full JSON snapshot with ${links.length} links and ${categories.length} categories`
    );

    res.setHeader("Content-Disposition", `attachment; filename=monty_genius_backup_${Date.now()}.json`);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(backupPayload, null, 2));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "BACKUP_EXPORT_ERROR", message: "Failed to export backup JSON" },
    });
  }
});

// GET /api/backup/export/links-csv
router.get("/export/links-csv", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const links = await prisma.link.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    const header = "ID,Title,URL,Category,Status,Favorite,Pinned,Clicks,Description,Tags\n";
    const rows = links
      .map((l) => {
        const escape = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
        return [
          escape(l.id),
          escape(l.title),
          escape(l.url),
          escape(l.category.name),
          escape(l.status),
          escape(l.isFavorite),
          escape(l.isPinned),
          escape(l.clickCount),
          escape(l.description),
          escape(l.tags),
        ].join(",");
      })
      .join("\n");

    res.setHeader("Content-Disposition", `attachment; filename=monty_genius_links_${Date.now()}.csv`);
    res.setHeader("Content-Type", "text/csv");
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "CSV_EXPORT_ERROR", message: "Failed to export links as CSV" },
    });
  }
});

// Schema for validating JSON import
const backupImportSchema = z.object({
  version: z.string(),
  system: z.string(),
  data: z.object({
    categories: z
      .array(
        z.object({
          name: z.string(),
          slug: z.string(),
          description: z.string().nullable().optional(),
          icon: z.string().default("Folder"),
          color: z.string().default("#00F5FF"),
          sortOrder: z.number().default(0),
        })
      )
      .optional(),
    links: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          description: z.string().nullable().optional(),
          categoryId: z.string().optional(),
          category: z.object({ slug: z.string(), name: z.string() }).optional(),
          icon: z.string().default("Globe"),
          tags: z.any().optional(),
          color: z.string().default("#00F5FF"),
          status: z.enum(["ACTIVE", "DISABLED", "MAINTENANCE"]).default("ACTIVE"),
          openInNewTab: z.boolean().default(true),
          isFavorite: z.boolean().default(false),
          isPinned: z.boolean().default(false),
          sortOrder: z.number().default(0),
          clickCount: z.number().default(0),
        })
      )
      .optional(),
    settings: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          category: z.string().default("GENERAL"),
        })
      )
      .optional(),
  }),
});

// POST /api/backup/import - Validate & restore from backup JSON
router.post("/import", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = backupImportSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_BACKUP_SCHEMA",
        message: "The provided backup file is invalid or corrupted. " + parseResult.error.errors[0]?.message,
      },
    });
    return;
  }

  const { data } = parseResult.data;

  try {
    let importedCategories = 0;
    let importedLinks = 0;
    let importedSettings = 0;

    // Execute in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Process Categories
      const categoryMap = new Map<string, string>(); // slug -> id

      if (data.categories && data.categories.length > 0) {
        for (const cat of data.categories) {
          const upserted = await tx.category.upsert({
            where: { slug: cat.slug },
            update: {
              name: cat.name,
              description: cat.description || null,
              icon: cat.icon,
              color: cat.color,
              sortOrder: cat.sortOrder,
            },
            create: {
              name: cat.name,
              slug: cat.slug,
              description: cat.description || null,
              icon: cat.icon,
              color: cat.color,
              sortOrder: cat.sortOrder,
            },
          });
          categoryMap.set(cat.slug, upserted.id);
          importedCategories++;
        }
      }

      // Existing categories map fallback
      const allExistingCats = await tx.category.findMany();
      allExistingCats.forEach((c) => {
        categoryMap.set(c.slug, c.id);
        categoryMap.set(c.name, c.id);
      });

      // Default category if none exists
      let defaultCatId = allExistingCats[0]?.id;
      if (!defaultCatId) {
        const fallbackCat = await tx.category.create({
          data: {
            name: "OTHER",
            slug: "other",
            description: "General links",
          },
        });
        defaultCatId = fallbackCat.id;
        categoryMap.set("other", defaultCatId);
      }

      // 2. Process Links
      if (data.links && data.links.length > 0) {
        for (const link of data.links) {
          let targetCatId = defaultCatId;

          if (link.category?.slug && categoryMap.has(link.category.slug)) {
            targetCatId = categoryMap.get(link.category.slug)!;
          } else if (link.categoryId) {
            const hasCat = allExistingCats.some((c) => c.id === link.categoryId);
            if (hasCat) targetCatId = link.categoryId;
          }

          let tagsStr = "[]";
          if (Array.isArray(link.tags)) tagsStr = JSON.stringify(link.tags);
          else if (typeof link.tags === "string") tagsStr = link.tags;

          await tx.link.create({
            data: {
              title: link.title,
              url: link.url,
              description: link.description || null,
              categoryId: targetCatId,
              icon: link.icon || "Globe",
              tags: tagsStr,
              color: link.color || "#00F5FF",
              status: link.status || "ACTIVE",
              openInNewTab: link.openInNewTab ?? true,
              isFavorite: link.isFavorite ?? false,
              isPinned: link.isPinned ?? false,
              sortOrder: link.sortOrder ?? 0,
              clickCount: link.clickCount ?? 0,
            },
          });
          importedLinks++;
        }
      }

      // 3. Process Settings
      if (data.settings && data.settings.length > 0) {
        for (const s of data.settings) {
          await tx.setting.upsert({
            where: { key: s.key },
            update: { value: s.value, category: s.category },
            create: { key: s.key, value: s.value, category: s.category },
          });
          importedSettings++;
        }
      }
    });

    await createAuditLog(
      req,
      "BACKUP_RESTORED",
      "WARNING",
      "SystemBackup",
      `Restored ${importedLinks} links, ${importedCategories} categories, ${importedSettings} settings`
    );

    res.json({
      success: true,
      data: {
        message: "Backup restored successfully",
        importedCategories,
        importedLinks,
        importedSettings,
      },
    });
  } catch (error) {
    console.error("Backup restore error:", error);
    res.status(500).json({
      success: false,
      error: { code: "RESTORE_FAILED", message: "Failed to process backup file data." },
    });
  }
});

export default router;
