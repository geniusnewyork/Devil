import { Router, Response } from "express";
import { prisma } from "../db.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { createAuditLog } from "../middleware/audit.js";

const router = Router();

// GET /api/logs - Audit logs with pagination & filters
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(5, parseInt((req.query.limit as string) || "20", 10)));
    const skip = (page - 1) * limit;

    const { event, status, search, startDate, endDate } = req.query;

    const where: any = {};

    if (event && typeof event === "string" && event !== "ALL") {
      where.event = event;
    }

    if (status && typeof status === "string" && status !== "ALL") {
      where.status = status;
    }

    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim();
      where.OR = [
        { details: { contains: q } },
        { resource: { contains: q } },
        { ipAddress: { contains: q } },
        { event: { contains: q } },
      ];
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
    ]);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "FETCH_LOGS_ERROR", message: "Failed to retrieve audit logs" },
    });
  }
});

// GET /api/logs/logins - Dedicated Login History
router.get("/logins", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(5, parseInt((req.query.limit as string) || "25", 10)));
    const skip = (page - 1) * limit;

    const [total, attempts] = await Promise.all([
      prisma.loginAttempt.count(),
      prisma.loginAttempt.findMany({
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
    ]);

    // Parse simple user agent strings into Browser / OS
    const formatted = attempts.map((a) => {
      let browser = "Unknown";
      let os = "Unknown";
      const ua = a.userAgent || "";

      if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
      else if (ua.includes("Edg")) browser = "Edge";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

      if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
      else if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("Macintosh")) os = "macOS";
      else if (ua.includes("Linux")) os = "Linux";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

      return {
        id: a.id,
        timestamp: a.timestamp,
        status: a.success ? "SUCCESS" : "FAILED",
        reason: a.reason,
        ip: a.ipAddress,
        browser,
        os,
        userAgent: a.userAgent,
      };
    });

    res.json({
      success: true,
      data: {
        attempts: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "FETCH_LOGIN_HISTORY_ERROR", message: "Failed to retrieve login history" },
    });
  }
});

// POST /api/logs/clear - Clear logs older than X days
router.post("/clear", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const days = parseInt(req.body.days || "30", 10);
  if (isNaN(days) || days < 1) {
    res.status(400).json({
      success: false,
      error: { code: "INVALID_PARAM", message: "Invalid days parameter" },
    });
    return;
  }

  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const deleted = await prisma.auditLog.deleteMany({
      where: { timestamp: { lt: cutoffDate } },
    });

    await createAuditLog(
      req,
      "LOGS_CLEARED",
      "WARNING",
      "AuditLog",
      `Purged ${deleted.count} audit logs older than ${days} days`
    );

    res.json({
      success: true,
      data: { deletedCount: deleted.count },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "CLEAR_LOGS_ERROR", message: "Failed to purge old logs" },
    });
  }
});

// GET /api/logs/export/json
router.get("/export/json", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 2000,
    });

    res.setHeader("Content-Disposition", "attachment; filename=monty_genius_audit_logs.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(logs, null, 2));
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EXPORT_ERROR", message: "Failed to export logs as JSON" },
    });
  }
});

// GET /api/logs/export/csv
router.get("/export/csv", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 2000,
    });

    const header = "ID,Timestamp,Event,Status,Resource,IPAddress,UserAgent,Details\n";
    const rows = logs
      .map((l) => {
        const escape = (val: any) => `"${String(val || "").replace(/"/g, '""')}"`;
        return [
          escape(l.id),
          escape(l.timestamp.toISOString()),
          escape(l.event),
          escape(l.status),
          escape(l.resource),
          escape(l.ipAddress),
          escape(l.userAgent),
          escape(l.details),
        ].join(",");
      })
      .join("\n");

    res.setHeader("Content-Disposition", "attachment; filename=monty_genius_audit_logs.csv");
    res.setHeader("Content-Type", "text/csv");
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "EXPORT_ERROR", message: "Failed to export logs as CSV" },
    });
  }
});

export default router;
