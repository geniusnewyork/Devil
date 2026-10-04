import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists if using relative sqlite path
if (config.databaseUrl.startsWith("file:")) {
  const rawPath = config.databaseUrl.replace("file:", "");
  const resolvedDir = path.dirname(path.resolve(process.cwd(), rawPath));
  if (!fs.existsSync(resolvedDir)) {
    fs.mkdirSync(resolvedDir, { recursive: true });
  }
}

export const prisma = new PrismaClient();
