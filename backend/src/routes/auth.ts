import { Router, Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { checkLoginCooldown } from "../middleware/rateLimiter.js";
import { createAuditLog } from "../middleware/audit.js";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

// POST /api/auth/login
router.post("/login", checkLoginCooldown, async (req: Request, res: Response): Promise<void> => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parseResult.error.errors[0]?.message || "Invalid input data",
      },
    });
    return;
  }

  const { username, password } = parseResult.data;
  const ipAddress = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1")
    .split(",")[0]
    .trim();
  const userAgent = (req.headers["user-agent"] as string) || "Unknown";

  try {
    const admin = await prisma.admin.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });

    const isPasswordValid = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!admin || !isPasswordValid) {
      // Record failed attempt
      await prisma.loginAttempt.create({
        data: {
          ipAddress,
          userAgent,
          username,
          success: false,
          reason: !admin ? "USER_NOT_FOUND" : "INVALID_CREDENTIALS",
        },
      });

      await createAuditLog(
        req,
        "LOGIN_FAILED",
        "FAILED",
        `Admin:${username}`,
        `Unauthorized login attempt from IP ${ipAddress}`
      );

      // Check failure count
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
      const failCount = await prisma.loginAttempt.count({
        where: {
          ipAddress,
          success: false,
          timestamp: { gte: fifteenMinsAgo },
        },
      });

      let cooldownSecs = 0;
      if (failCount >= 7) {
        cooldownSecs = 15 * 60;
      } else if (failCount >= 4) {
        cooldownSecs = 60;
      }

      res.status(401).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "UNAUTHORIZED ACCESS ATTEMPT DETECTED. AUTHENTICATION FAILED.",
          alertDetails: {
            title: "SECURITY ALERT",
            sub: "ACTIVITY HAS BEEN LOGGED. DO NOT CONTINUE.",
            failedAttempts: failCount,
            cooldownSeconds: cooldownSecs,
            timestamp: new Date().toISOString(),
          },
        },
      });
      return;
    }

    // Success! Record successful login attempt
    await prisma.loginAttempt.create({
      data: {
        ipAddress,
        userAgent,
        username,
        success: true,
      },
    });

    // Create session token
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + config.sessionDurationDays * 24 * 60 * 60 * 1000);

    const session = await prisma.session.create({
      data: {
        token,
        adminId: admin.id,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    await createAuditLog(
      req,
      "LOGIN_SUCCESS",
      "SUCCESS",
      `Admin:${admin.username}`,
      "Successful session established"
    );

    // Set secure HttpOnly cookie
    res.cookie(config.sessionCookieName, token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
        },
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Login route error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "An internal error occurred during authentication.",
      },
    });
  }
});

// GET /api/auth/session - verify current admin session
router.get("/session", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      admin: req.admin,
      authenticated: true,
    },
  });
});

// POST /api/auth/logout - logout current session
router.post("/logout", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.sessionToken) {
      await prisma.session.delete({
        where: { token: req.sessionToken },
      }).catch(() => {});
    }

    await createAuditLog(req, "LOGOUT", "SUCCESS", `Admin:${req.admin?.username}`, "User logged out");

    res.clearCookie(config.sessionCookieName, { path: "/" });
    res.json({
      success: true,
      data: { message: "Successfully logged out" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "LOGOUT_ERROR",
        message: "Failed to cleanly logout session.",
      },
    });
  }
});

// POST /api/auth/logout-all - revoke all sessions for this admin
router.post("/logout-all", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.admin) {
      await prisma.session.deleteMany({
        where: { adminId: req.admin.id },
      });
    }

    await createAuditLog(
      req,
      "LOGOUT_ALL",
      "WARNING",
      `Admin:${req.admin?.username}`,
      "All active administrative sessions terminated"
    );

    res.clearCookie(config.sessionCookieName, { path: "/" });
    res.json({
      success: true,
      data: { message: "All admin sessions terminated" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "LOGOUT_ERROR",
        message: "Failed to terminate all sessions.",
      },
    });
  }
});

// POST /api/auth/change-password
router.post("/change-password", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parseResult.error.errors[0]?.message || "Invalid password format",
      },
    });
    return;
  }

  const { currentPassword, newPassword } = parseResult.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin!.id },
    });

    if (!admin) {
      res.status(404).json({
        success: false,
        error: { code: "ADMIN_NOT_FOUND", message: "Admin account not found" },
      });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      await createAuditLog(
        req,
        "PASSWORD_CHANGE_FAILED",
        "WARNING",
        `Admin:${admin.username}`,
        "Incorrect current password supplied"
      );
      res.status(400).json({
        success: false,
        error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect" },
      });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    // Invalidate other sessions for security
    await prisma.session.deleteMany({
      where: {
        adminId: admin.id,
        token: { not: req.sessionToken },
      },
    });

    await createAuditLog(
      req,
      "PASSWORD_CHANGED",
      "SUCCESS",
      `Admin:${admin.username}`,
      "Password updated; non-current sessions invalidated"
    );

    res.json({
      success: true,
      data: { message: "Password updated successfully" },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to change password" },
    });
  }
});

export default router;
