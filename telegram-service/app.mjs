import http from "node:http";
import { createHash } from "node:crypto";
import { formatConsultation } from "./telegram.mjs";

const TTL = 10 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validateConsultation(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const values = {};
  for (const [key, limit] of Object.entries({ name: 80, phone: 25, place: 120, service: 160, message: 2000 })) {
    if (typeof body[key] !== "string" || body[key].length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(body[key])) return null;
    values[key] = body[key].trim();
    if (key !== "message" && /[\r\n]/.test(values[key])) return null;
  }
  if (!values.name || !/^(380\d{9}|0\d{9})$/.test(values.phone.replace(/\D/g, "")) || body.consent !== true) return null;
  if (!["uk", "en"].includes(body.lang) || typeof body.requestId !== "string" || !UUID.test(body.requestId)) return null;
  return { ...values, consent: true, lang: body.lang, requestId: body.requestId };
}

export function createConsultationServer({ origins, trustProxy = false, send }) {
  const requests = new Map();
  const limits = new Map();
  function purge(map, now) {
    for (const [key, entry] of map) if (entry.expires <= now) map.delete(key);
  }
  return http.createServer(async (req, res) => {
    const reply = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
      res.end(JSON.stringify(body));
    };
    try {
      const pathname = new URL(req.url, "http://localhost").pathname;
      if (pathname === "/health" && req.method === "GET") return reply(200, { ok: true, service: "bk-slava-telegram-service" });
      if (pathname !== "/api/consultation") return reply(404, { ok: false, error: "NOT_FOUND" });
      const origin = req.headers.origin;
      if (!origin || !origins.includes(origin)) return reply(403, { ok: false, error: "ORIGIN_NOT_ALLOWED" });
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Max-Age", "600");
        res.writeHead(204);
        return res.end();
      }
      if (req.method !== "POST") {
        res.setHeader("Allow", "POST, OPTIONS");
        return reply(405, { ok: false, error: "METHOD_NOT_ALLOWED" });
      }
      if (!(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) return reply(415, { ok: false, error: "JSON_REQUIRED" });
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16384) return reply(413, { ok: false, error: "BODY_TOO_LARGE" });
        chunks.push(chunk);
      }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
      catch { return reply(400, { ok: false, error: "INVALID_JSON" }); }
      const values = validateConsultation(body);
      if (!values) return reply(400, { ok: false, error: "INVALID_FORM" });
      const now = Date.now();
      purge(requests, now);
      purge(limits, now);
      const hash = createHash("sha256").update(JSON.stringify(values)).digest("hex");
      const existing = requests.get(values.requestId);
      if (existing) {
        if (existing.hash !== hash) return reply(409, { ok: false, error: "REQUEST_CONFLICT" });
        const result = await existing.promise;
        return reply(result.status, result.body);
      }
      // Only trust forwarded IPs behind a trusted reverse proxy that overwrites the header.
      const ip = trustProxy ? String(req.headers["x-forwarded-for"] || req.socket.remoteAddress).split(",")[0].trim() : req.socket.remoteAddress;
      const rate = limits.get(ip) || { count: 0, expires: now + TTL };
      if (rate.count >= 5) {
        res.setHeader("Retry-After", String(Math.ceil((rate.expires - now) / 1000)));
        return reply(429, { ok: false, error: "RATE_LIMITED" });
      }
      if (requests.size >= 2000 || limits.size >= 2000) return reply(503, { ok: false, error: "BUSY" });
      rate.count++;
      limits.set(ip, rate);
      const promise = (async () => {
        try {
          await send(formatConsultation(values));
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
      return reply(result.status, result.body);
    } catch {
      if (!res.headersSent) reply(500, { ok: false, error: "INTERNAL_ERROR" });
      else res.end();
    }
  });
}
