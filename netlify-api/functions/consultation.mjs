import { createHash } from "node:crypto";
import { validateConsultation } from "../../telegram-service/app.mjs";
import { formatConsultation, telegramClient } from "../../telegram-service/telegram.mjs";

// Netlify Functions (v2) adapter for the BK Slava consultation API.
// Same contract as telegram-service/app.mjs. Secrets come only from Netlify environment variables.
// Limits/idempotency live in the memory of one warm function instance (best effort, no database).
const TTL = 10 * 60 * 1000;
const requests = new Map();
const limits = new Map();

function purge(map, now) {
  for (const [key, entry] of map) if (entry.expires <= now) map.delete(key);
}

function origins() {
  return (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export default async function handler(request, context) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  const reply = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
  try {
    const origin = request.headers.get("origin");
    if (!origin || !origins().includes(origin)) return reply(403, { ok: false, error: "ORIGIN_NOT_ALLOWED" });
    const cors = { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...cors, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" },
      });
    }
    if (request.method !== "POST") return reply(405, { ok: false, error: "METHOD_NOT_ALLOWED" }, { ...cors, Allow: "POST, OPTIONS" });
    if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) return reply(415, { ok: false, error: "JSON_REQUIRED" }, cors);
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 16384) return reply(413, { ok: false, error: "BODY_TOO_LARGE" }, cors);
    let body;
    try { body = JSON.parse(raw); }
    catch { return reply(400, { ok: false, error: "INVALID_JSON" }, cors); }
    const values = validateConsultation(body);
    if (!values) return reply(400, { ok: false, error: "INVALID_FORM" }, cors);

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (!token || !chatId) return reply(500, { ok: false, error: "INTERNAL_ERROR" }, cors);

    const now = Date.now();
    purge(requests, now);
    purge(limits, now);
    const hash = createHash("sha256").update(JSON.stringify(values)).digest("hex");
    const existing = requests.get(values.requestId);
    if (existing) {
      if (existing.hash !== hash) return reply(409, { ok: false, error: "REQUEST_CONFLICT" }, cors);
      const result = await existing.promise;
      return reply(result.status, result.body, cors);
    }
    // context.ip is set by the Netlify edge, not by the client.
    const ip = context?.ip || "unknown";
    const rate = limits.get(ip) || { count: 0, expires: now + TTL };
    if (rate.count >= 5) return reply(429, { ok: false, error: "RATE_LIMITED" }, { ...cors, "Retry-After": String(Math.ceil((rate.expires - now) / 1000)) });
    if (requests.size >= 2000 || limits.size >= 2000) return reply(503, { ok: false, error: "BUSY" }, cors);
    rate.count++;
    limits.set(ip, rate);

    const promise = (async () => {
      try {
        await telegramClient({ token, chatId }).send(formatConsultation(values));
        return { status: 200, body: { ok: true } };
      } catch (error) {
        // No raw exception logging: provider exceptions can contain credentials.
        const definite = error?.code === "TELEGRAM_REJECTED";
        return { status: definite ? 502 : 503, body: { ok: false, error: definite ? "DELIVERY_FAILED" : "DELIVERY_UNCONFIRMED" } };
      }
    })();
    requests.set(values.requestId, { hash, promise, expires: now + TTL });
    const result = await promise;
    if (result.body.error === "DELIVERY_FAILED") requests.delete(values.requestId);
    return reply(result.status, result.body, cors);
  } catch {
    return reply(500, { ok: false, error: "INTERNAL_ERROR" });
  }
}

export const config = { path: "/api/consultation" };
