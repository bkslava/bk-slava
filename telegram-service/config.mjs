import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function loadConfig() {
  const envFile = process.env.TELEGRAM_ENV_FILE || fileURLToPath(new URL("../.secrets/telegram.env", import.meta.url));
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required on the server.");
  if (!/^-\d+$/.test(chatId)) throw new Error("TELEGRAM_CHAT_ID must be a numeric Telegram group ID.");
  const origins = (process.env.ALLOWED_ORIGINS || "http://127.0.0.1:3000,http://localhost:3000")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (!origins.length || origins.some((s) => new URL(s).origin !== s)) {
    throw new Error("ALLOWED_ORIGINS must contain exact origins without paths or trailing slashes.");
  }
  const port = Number(process.env.PORT || 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT.");
  return { token, chatId, origins, port, host: process.env.HOST || "127.0.0.1", trustProxy: process.env.TRUST_PROXY === "1" };
}
