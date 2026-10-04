import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || "file:./data/monty_genius.db",
  sessionSecret: process.env.SESSION_SECRET || "DEFAULT_DEV_SECRET_KEY_CHANGE_IN_PRODUCTION",
  adminInitialUsername: process.env.ADMIN_INITIAL_USERNAME || "Genius",
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || "Genius",
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10),
  lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES || "15", 10),
  sessionCookieName: "monty_genius_session",
  sessionDurationDays: 7,
};
