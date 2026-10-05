import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createConsultationServer, validateConsultation } from "./app.mjs";
import { telegramClient, TelegramError, formatConsultation } from "./telegram.mjs";

const origin = "http://localhost:3000";
const form = (overrides = {}) => ({ name: "Тест & <Ім’я>", phone: "+380 (67) 000-00-00", place: "Київ / Kyiv", service: "Turnkey renovation", message: "Рядок один\nLine two & <tag>", consent: true, lang: "en", requestId: randomUUID(), ...overrides });
async function withServer(send, run) {
  const server = createConsultationServer({ origins: [origin], send });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/consultation`;
  const post = (body, extra = {}) => fetch(url, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(body), ...extra });
  try { await run(post, url); }
  finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
}

test("all filled UA/EN fields and consent appear in Telegram, plain text remains intact", () => {
  const values = validateConsultation(form());
  assert.ok(values);
  const text = formatConsultation(values);
  for (const key of ["name", "phone", "place", "service", "message"]) assert.ok(text.includes(values[key]));
  assert.ok(text.includes("Мова сайту: EN"));
  assert.ok(text.includes("Згода на обробку даних: так"));
  const longest = form({ name: "n".repeat(80), place: "p".repeat(120), service: "s".repeat(160), message: "&".repeat(2000) });
  assert.ok(formatConsultation(longest).length < 4096);
});
test("invalid data is rejected server-side", () => {
  for (const override of [{ name: " " }, { name: "x".repeat(81) }, { phone: "123" }, { consent: false }, { consent: "true" }, { lang: "fr" }, { message: "x".repeat(2001) }, { place: "foo\nbar" }, { name: "a\0b" }, { requestId: "bad" }]) assert.equal(validateConsultation(form(override)), null);
});
test("success only after delivery; concurrent requests and retries send once", async () => {
  let calls = 0;
  await withServer(async () => { calls++; await new Promise((resolve) => setTimeout(resolve, 50)); }, async (post) => {
    const values = form();
    const responses = await Promise.all([post(values), post(values), post(values)]);
    for (const response of responses) assert.deepEqual(await response.json(), { ok: true });
    assert.equal(calls, 1);
    assert.equal((await post({ ...values, message: "changed" })).status, 409);
  });
});
test("Telegram rejection returns error; retry is allowed", async () => {
  let calls = 0;
  await withServer(async () => { if (++calls === 1) throw new TelegramError("TELEGRAM_REJECTED"); }, async (post) => {
    const values = form();
    const response = await post(values);
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { ok: false, error: "DELIVERY_FAILED" });
    assert.deepEqual(await (await post(values)).json(), { ok: true });
    assert.equal(calls, 2);
  });
});
test("network errors are redacted and ambiguous delivery is not automatically sent again", async () => {
  let calls = 0;
  await withServer(async () => { calls++; throw new Error("sensitive provider URL"); }, async (post) => {
    const values = form();
    for (let i = 0; i < 2; i++) {
      const response = await post(values);
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), { ok: false, error: "DELIVERY_UNCONFIRMED" });
    }
    assert.equal(calls, 1);
  });
});
test("CORS, methods, malformed/oversized JSON and validation block sends", async () => {
  let calls = 0;
  await withServer(async () => calls++, async (post, url) => {
    assert.equal((await post(form(), { headers: { Origin: "https://untrusted.example", "Content-Type": "application/json" } })).status, 403);
    assert.equal((await post(form(), { headers: { "Content-Type": "application/json" } })).status, 403);
    const preflight = await fetch(url, { method: "OPTIONS", headers: { Origin: origin, "Access-Control-Request-Method": "POST" } });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
    assert.equal((await fetch(url, { headers: { Origin: origin } })).status, 405);
    assert.equal((await post(form(), { headers: { Origin: origin, "Content-Type": "text/plain" } })).status, 415);
    assert.equal((await post(form(), { body: "{" })).status, 400);
    assert.equal((await post(form({ consent: false }))).status, 400);
    assert.equal((await post(form(), { body: JSON.stringify({ message: "x".repeat(18000) }) })).status, 413);
    assert.equal(calls, 0);
  });
});
test("five attempts per IP per ten minutes; forwarded IP cannot bypass default limit", async () => {
  let calls = 0;
  await withServer(async () => calls++, async (post) => {
    for (let i = 0; i < 5; i++) assert.equal((await post(form())).status, 200);
    assert.equal((await post(form(), { headers: { Origin: origin, "Content-Type": "application/json", "X-Forwarded-For": "192.0.2.1" } })).status, 429);
    assert.equal(calls, 5);
  });
});
test("Telegram client requires both HTTP success and ok=true and a matching chat", async () => {
  const config = { token: "fake-token", chatId: "-123" };
  for (const [status, body] of [[200, { ok: false }], [500, { ok: true, result: {} }], [200, { ok: true, result: { message_id: 1, chat: { id: -456 } } }]]) {
    const client = telegramClient(config, async () => new Response(JSON.stringify(body), { status }));
    await assert.rejects(client.send("test"), TelegramError);
  }
  const client = telegramClient(config, async () => { throw new Error("fake-token in provider error"); });
  await assert.rejects(client.send("test"), (error) => error.message === "TELEGRAM_UNAVAILABLE");
});
test("configured group and membership are checked", async () => {
  const client = telegramClient({ token: "fake-token", chatId: "-123" }, async (url) => {
    const result = url.endsWith("getMe") ? { is_bot: true, id: 1 } : url.endsWith("getChat") ? { id: -123, type: "supergroup" } : { status: "administrator" };
    return new Response(JSON.stringify({ ok: true, result }));
  });
  assert.deepEqual(await client.verify(), { botVerified: true, groupVerified: true, membership: "administrator" });
});
