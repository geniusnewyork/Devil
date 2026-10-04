import { Router, Response } from "express";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalLinks,
      activeLinks,
      disabledLinks,
      maintenanceLinks,
      favoriteLinks,
      pinnedLinks,
      totalCategories,
      totalLogins,
      failedLogins,
      lastLogin,
      lastActivity,
      topLinks,
      recentClicks,
      categoriesWithLinks,
      sevenDaysAttempts,
    ] = await Promise.all([
      prisma.link.count(),
      prisma.link.count({ where: { status: "ACTIVE" } }),
      prisma.link.count({ where: { status: "DISABLED" } }),
      prisma.link.count({ where: { status: "MAINTENANCE" } }),
      prisma.link.count({ where: { isFavorite: true } }),
      prisma.link.count({ where: { isPinned: true } }),
      prisma.category.count(),
      prisma.loginAttempt.count({ where: { success: true } }),
      prisma.loginAttempt.count({ where: { success: false } }),
      prisma.loginAttempt.findFirst({
        where: { success: true },
        orderBy: { timestamp: "desc" },
      }),
      prisma.auditLog.findFirst({
        orderBy: { timestamp: "desc" },
      }),
      prisma.link.findMany({
        take: 8,
        orderBy: { clickCount: "desc" },
        include: { category: { select: { name: true, color: true } } },
      }),
      prisma.linkClick.count(),
      prisma.category.findMany({
        include: {
          _count: { select: { links: true } },
          links: { select: { clickCount: true } },
        },
      }),
      prisma.loginAttempt.findMany({
        where: {
          timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { timestamp: "asc" },
      }),
    ]);

    // Aggregate 7 days login activity by day
    const daysMap: Record<string, { date: string; success: number; failed: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      daysMap[key] = { date: key, success: 0, failed: 0 };
    }

    sevenDaysAttempts.forEach((att) => {
      const key = att.timestamp.toISOString().split("T")[0];
      if (daysMap[key]) {
        if (att.success) daysMap[key].success++;
        else daysMap[key].failed++;
      }
    });

    const categoryDistribution = categoriesWithLinks.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      linkCount: cat._count.links,
      totalClicks: cat.links.reduce((acc, curr) => acc + curr.clickCount, 0),
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalLinks,
          activeLinks,
          disabledLinks,
          maintenanceLinks,
          favoriteLinks,
          pinnedLinks,
          totalCategories,
          totalClicks: recentClicks,
          totalLogins,
          failedLogins,
          lastLoginTime: lastLogin?.timestamp || null,
          lastActivityTime: lastActivity?.timestamp || null,
          lastActivityEvent: lastActivity?.event || null,
        },
        topLinks: topLinks.map((l) => ({
          id: l.id,
          title: l.title,
          url: l.url,
          clicks: l.clickCount,
          categoryName: l.category.name,
          categoryColor: l.category.color,
        })),
        categoryDistribution,
        loginHistoryChart: Object.values(daysMap),
      },
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({
      success: false,
      error: { code: "ANALYTICS_ERROR", message: "Failed to compile system analytics" },
    });
  }
});

export default router;
