import { Request } from "express";
import { prisma } from "../db.js";

export async function createAuditLog(
  req: Request | null,
  event: string,
  status: "SUCCESS" | "WARNING" | "FAILED" = "SUCCESS",
  resource?: string,
  details?: Record<string, any> | string
) {
  try {
    const ipAddress = req ? (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1" : "SYSTEM";
    const userAgent = req ? req.headers["user-agent"] || "unknown" : "SYSTEM";

    const detailString = typeof details === "object" ? JSON.stringify(details) : details;

    await prisma.auditLog.create({
      data: {
        event,
        ipAddress: ipAddress.split(",")[0].trim(),
        userAgent,
        resource: resource || null,
        status,
        details: detailString || null,
      },
    });
  } catch (error) {
    // Avoid throwing inside logger to prevent crashing critical flows
    console.error("Failed to write audit log:", error);
  }
}
