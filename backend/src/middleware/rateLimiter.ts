import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../db.js";

// Global API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP. Please try again later.",
    },
  },
});

// Dynamic security cooldown check for login attempts
export async function checkLoginCooldown(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const ipAddress = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1")
    .split(",")[0]
    .trim();

  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Count recent failed attempts from this IP
    const recentFailures = await prisma.loginAttempt.count({
      where: {
        ipAddress,
        success: false,
        timestamp: { gte: fifteenMinutesAgo },
      },
    });

    if (recentFailures >= 7) {
      // Find latest failure
      const latestFail = await prisma.loginAttempt.findFirst({
        where: { ipAddress, success: false },
        orderBy: { timestamp: "desc" },
      });

      if (latestFail) {
        const lockoutDurationMs = 15 * 60 * 1000; // 15 mins
        const elapsed = Date.now() - new Date(latestFail.timestamp).getTime();
        if (elapsed < lockoutDurationMs) {
          const remainingSecs = Math.ceil((lockoutDurationMs - elapsed) / 1000);
          res.status(429).json({
            success: false,
            error: {
              code: "SECURITY_LOCKOUT",
              message: `High risk activity detected. Access restricted for ${remainingSecs}s.`,
              remainingSeconds: remainingSecs,
              failedAttempts: recentFailures,
              cooldownType: "LONG",
            },
          });
          return;
        }
      }
    } else if (recentFailures >= 4) {
      const latestFail = await prisma.loginAttempt.findFirst({
        where: { ipAddress, success: false },
        orderBy: { timestamp: "desc" },
      });

      if (latestFail) {
        const shortCooldownMs = 60 * 1000; // 60s
        const elapsed = Date.now() - new Date(latestFail.timestamp).getTime();
        if (elapsed < shortCooldownMs) {
          const remainingSecs = Math.ceil((shortCooldownMs - elapsed) / 1000);
          res.status(429).json({
            success: false,
            error: {
              code: "SECURITY_COOLDOWN",
              message: `Multiple failed attempts. Cooldown active for ${remainingSecs}s.`,
              remainingSeconds: remainingSecs,
              failedAttempts: recentFailures,
              cooldownType: "SHORT",
            },
          });
          return;
        }
      }
    }

    next();
  } catch (error) {
    console.error("Cooldown check error:", error);
    next();
  }
}
