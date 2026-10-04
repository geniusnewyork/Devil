import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { createAuditLog } from "../middleware/audit.js";

const router = Router();

// URL Validator helper
function isValidUrl(val: string): boolean {
  try {
    const url = new URL(val);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

const linkInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  url: z.string().refine(isValidUrl, "Must be a valid HTTP or HTTPS URL"),
  description: z.string().max(500).optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  icon: z.string().default("Globe"),
  tags: z.array(z.string()).default([]),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color").default("#00F5FF"),
  status: z.enum(["ACTIVE", "DISABLED", "MAINTENANCE"]).default("ACTIVE"),
  openInNewTab: z.boolean().default(true),
  isFavorite: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// Helper to check if requester is admin without throwing 401
async function isReqAdmin(req: Request): Promise<boolean> {
  const token = req.cookies[config.sessionCookieName] || req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) return false;
  try {
    const session = await prisma.session.findUnique({
      where: { token },
    });
    return !!session && new Date() <= session.expiresAt;
  } catch {
    return false;
  }
}

// GET /api/links - Public or Admin list
router.get("/", async (req: Request, res: Response) => {
  try {
    const isAdmin = await isReqAdmin(req);
    const { category, search, filter, sort, status } = req.query;

    const where: any = {};

    // Public users only see ACTIVE links
    if (!isAdmin) {
      where.status = "ACTIVE";
    } else if (status && typeof status === "string") {
      where.status = status;
    }

    if (category && typeof category === "string" && category !== "ALL") {
      where.categoryId = category;
    }

    if (filter === "FAVORITES") {
      where.isFavorite = true;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { url: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Determine sorting
    let orderBy: any[] = [{ isPinned: "desc" }];

    switch (sort) {
      case "A-Z":
        orderBy.push({ title: "asc" });
        break;
      case "Z-A":
        orderBy.push({ title: "desc" });
        break;
      case "Oldest":
        orderBy.push({ createdAt: "asc" });
        break;
      case "Most Used":
        orderBy.push({ clickCount: "desc" });
        break;
      case "Newest":
      default:
        orderBy.push({ sortOrder: "asc" }, { createdAt: "desc" });
        break;
    }

    const links = await prisma.link.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    // Format parsed tags
    const formatted = links.map((l) => ({
      ...l,
      tags: typeof l.tags === "string" ? JSON.parse(l.tags || "[]") : l.tags,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({
      success: false,
      error: { code: "FETCH_LINKS_ERROR", message: "Failed to retrieve links" },
    });
  }
});

// POST /api/links/:id/click - Track link usage
router.post("/:id/click", async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const ipAddress = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1")
    .split(",")[0]
    .trim();
  const userAgent = (req.headers["user-agent"] as string) || "Unknown";
  const referer = req.headers["referer"] || null;

  try {
    const link = await prisma.link.findUnique({ where: { id } });
    if (!link) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Link not found" },
      });
      return;
    }

    // If disabled and requester is not admin, prevent access
    const isAdmin = await isReqAdmin(req);
    if (!isAdmin && link.status === "DISABLED") {
      res.status(403).json({
        success: false,
        error: { code: "LINK_DISABLED", message: "This link is currently inactive" },
      });
      return;
    }

    // Increment click count & add record
    await prisma.$transaction([
      prisma.link.update({
        where: { id },
        data: { clickCount: { increment: 1 } },
      }),
      prisma.linkClick.create({
        data: {
          linkId: id,
          ipAddress,
          userAgent,
          referer: typeof referer === "string" ? referer : null,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        url: link.url,
        openInNewTab: link.openInNewTab,
        clicks: link.clickCount + 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "CLICK_ERROR", message: "Failed to record click" },
    });
  }
});

// POST /api/links - Create link (Admin)
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = linkInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message || "Invalid link details",
      },
    });
    return;
  }

  const { title, url, description, categoryId, icon, tags, color, status, openInNewTab, isFavorite, isPinned, sortOrder } = parsed.data;

  try {
    const link = await prisma.link.create({
      data: {
        title,
        url,
        description: description || null,
        categoryId,
        icon,
        tags: JSON.stringify(tags),
        color,
        status,
        openInNewTab,
        isFavorite,
        isPinned,
        sortOrder,
      },
      include: {
        category: true,
      },
    });

    await createAuditLog(
      req,
      "LINK_CREATED",
      "SUCCESS",
      `Link:${link.id}`,
      `Created link "${link.title}" (${link.url})`
    );

    res.status(201).json({
      success: true,
      data: {
        ...link,
        tags,
      },
    });
  } catch (error) {
    console.error("Create link error:", error);
    res.status(500).json({
      success: false,
      error: { code: "CREATE_LINK_ERROR", message: "Failed to create link" },
    });
  }
});

// PUT /api/links/:id - Update link (Admin)
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const parsed = linkInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message || "Invalid update data",
      },
    });
    return;
  }

  try {
    const existing = await prisma.link.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Link not found" },
      });
      return;
    }

    const data: any = { ...parsed.data };
    if (parsed.data.tags !== undefined) {
      data.tags = JSON.stringify(parsed.data.tags);
    }

    const updated = await prisma.link.update({
      where: { id },
      data,
      include: { category: true },
    });

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await createAuditLog(
        req,
        parsed.data.status === "ACTIVE" ? "LINK_ENABLED" : "LINK_DISABLED",
        "SUCCESS",
        `Link:${id}`,
        `Status changed from ${existing.status} to ${parsed.data.status}`
      );
    } else {
      await createAuditLog(
        req,
        "LINK_UPDATED",
        "SUCCESS",
        `Link:${id}`,
        `Updated link "${updated.title}"`
      );
    }

    res.json({
      success: true,
      data: {
        ...updated,
        tags: typeof updated.tags === "string" ? JSON.parse(updated.tags) : updated.tags,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_LINK_ERROR", message: "Failed to update link" },
    });
  }
});

// DELETE /api/links/:id - Delete link (Admin)
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const existing = await prisma.link.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Link not found" },
      });
      return;
    }

    await prisma.link.delete({ where: { id } });

    await createAuditLog(
      req,
      "LINK_DELETED",
      "WARNING",
      `Link:${id}`,
      `Deleted link "${existing.title}" (${existing.url})`
    );

    res.json({
      success: true,
      data: { message: `Link "${existing.title}" deleted successfully` },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "DELETE_LINK_ERROR", message: "Failed to delete link" },
    });
  }
});

export default router;
