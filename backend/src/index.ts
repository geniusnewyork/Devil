import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { runFirstTimeSetup } from "./utils/seed.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.js";
import linksRoutes from "./routes/links.js";
import categoriesRoutes from "./routes/categories.js";
import logsRoutes from "./routes/logs.js";
import analyticsRoutes from "./routes/analytics.js";
import settingsRoutes from "./routes/settings.js";
import backupRoutes from "./routes/backup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Hardening with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS setup
app.use(
  cors({
    origin: config.isProduction ? false : ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(cookieParser(config.sessionSecret));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limit API endpoints
app.use("/api", apiLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/links", linksRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/backup", backupRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ONLINE",
    brand: "MONTY GENIUS",
    timestamp: new Date().toISOString(),
  });
});

// Production Static Serving
const possiblePaths = [
  path.resolve(process.cwd(), "frontend/dist"),
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../../../frontend/dist"),
];
const frontendDistPath = possiblePaths.find((p) => fs.existsSync(p));

if (frontendDistPath) {
  console.log(`⚡ [SERVER] Serving frontend from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// Global error handler
app.use(errorHandler);

// Server startup with automatic migration and first-run seed
async function startServer() {
  try {
    // Run setup (creates admin with hashed 'Genius' if missing, default categories, default settings)
    await runFirstTimeSetup();

    app.listen(config.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║         MONTY GENIUS // SECURE LINK HUB                  ║
║         STATUS: ONLINE                                    ║
║         PORT: ${config.port}                                       ║
║         ENV:  ${config.env}                                 ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("Critical failure during server startup:", error);
    process.exit(1);
  }
}

export { app, startServer };

const isMainModule = process.argv[1] && /[/\\]index\.(ts|js)$/.test(process.argv[1]);
if (isMainModule) {
  startServer();
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down Monty Genius Link Hub...");
  await prisma.$disconnect();
  process.exit(0);
});
