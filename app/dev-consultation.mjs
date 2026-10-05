import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const app = fileURLToPath(new URL("./", import.meta.url));
const port = process.env.TELEGRAM_SERVICE_PORT || "8787";
// Only the API child reads .secrets/telegram.env. Vite never receives those secrets.
const clientEnv = { ...process.env };
for (const key of Object.keys(clientEnv)) if (/^(?:VITE_)?TELEGRAM_/i.test(key)) delete clientEnv[key];
delete clientEnv.PORT;
delete clientEnv.VITE_CONSULTATION_API_URL;
clientEnv.CONSULTATION_PROXY_TARGET = `http://127.0.0.1:${port}`;
const api = spawn(process.execPath, ["../telegram-service/server.mjs"], { cwd: app, stdio: "inherit", env: { ...process.env, PORT: port, HOST: "127.0.0.1" } });
let vite;
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  api.kill();
  vite?.kill();
  setTimeout(() => process.exit(code), 500).unref();
}
api.on("error", () => stop(1));
api.on("exit", (code) => stop(code || 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop());
try {
  let ready = false;
  for (let attempt = 0; attempt < 100 && !stopping; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      ready = response.ok && (await response.json()).service === "bk-slava-telegram-service";
      if (ready) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready || stopping) throw new Error("API not ready");
  vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "dev", "--host", "127.0.0.1", "--port", "3000", "--strictPort"], { cwd: app, stdio: "inherit", env: clientEnv });
  vite.on("error", () => stop(1));
  vite.on("exit", (code) => stop(code || 0));
} catch {
  console.error("Could not start the local site and Telegram service.");
  stop(1);
}
