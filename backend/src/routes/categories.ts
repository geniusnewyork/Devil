import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { createAuditLog } from "../middleware/audit.js";

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  slug: z.string().min(1, "Slug is required").max(60).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(250).optional().nullable(),
  icon: z.string().default("Folder"),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color").default("#00F5FF"),
  sortOrder: z.number().int().default(0),
});

// GET /api/categories - Public list with link counts
router.get("/", async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { links: true },
        },
      },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      color: c.color,
      sortOrder: c.sortOrder,
      linkCount: c._count.links,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "FETCH_CATEGORIES_ERROR", message: "Failed to retrieve categories" },
    });
  }
});

// POST /api/categories - Create category (Admin)
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message || "Invalid category details",
      },
    });
    return;
  }

  const { name, slug, description, icon, color, sortOrder } = parsed.data;

  try {
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_CATEGORY", message: "A category with this name or slug already exists" },
      });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon,
        color,
        sortOrder,
      },
    });

    await createAuditLog(
      req,
      "CATEGORY_CREATED",
      "SUCCESS",
      `Category:${category.id}`,
      `Created category "${category.name}"`
    );

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "CREATE_CATEGORY_ERROR", message: "Failed to create category" },
    });
  }
});

// PUT /api/categories/:id - Update category (Admin)
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;
  const parsed = categorySchema.partial().safeParse(req.body);
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
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found" },
      });
      return;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    await createAuditLog(
      req,
      "CATEGORY_UPDATED",
      "SUCCESS",
      `Category:${id}`,
      `Updated category "${updated.name}"`
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "UPDATE_CATEGORY_ERROR", message: "Failed to update category" },
    });
  }
});

// DELETE /api/categories/:id - Delete category (Admin)
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id as string;

  try {
    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Category not found" },
      });
      return;
    }

    const linkCount = await prisma.link.count({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });

    await createAuditLog(
      req,
      "CATEGORY_DELETED",
      "WARNING",
      `Category:${id}`,
      `Deleted category "${existing.name}" (contained ${linkCount} links)`
    );

    res.json({
      success: true,
      data: { message: `Category "${existing.name}" deleted successfully` },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "DELETE_CATEGORY_ERROR", message: "Failed to delete category" },
    });
  }
});

export default router;
