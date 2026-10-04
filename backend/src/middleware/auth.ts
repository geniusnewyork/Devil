import { Request, Response, NextFunction } from "express";
import { prisma } from "../db.js";
import { config } from "../config.js";

export interface AuthenticatedRequest extends Request {
  admin?: {
    id: string;
    username: string;
  };
  sessionToken?: string;
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies[config.sessionCookieName] || req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required to access this resource.",
      },
    });
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!session) {
      res.clearCookie(config.sessionCookieName);
      res.status(401).json({
        success: false,
        error: {
          code: "SESSION_INVALID",
          message: "Invalid or expired session. Please log in again.",
        },
      });
      return;
    }

    if (new Date() > session.expiresAt) {
      // Session has expired
      await prisma.session.delete({ where: { token } }).catch(() => {});
      res.clearCookie(config.sessionCookieName);
      res.status(401).json({
        success: false,
        error: {
          code: "SESSION_EXPIRED",
          message: "Your session has expired. Please authenticate again.",
        },
      });
      return;
    }

    req.admin = session.admin;
    req.sessionToken = token;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to authenticate session.",
      },
    });
  }
}
