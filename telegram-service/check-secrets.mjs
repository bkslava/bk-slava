import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "./config.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const { token } = loadConfig();
let checked = 0;
let failed = false;
const needles = [token, encodeURIComponent(token)];
async function inspect(file, publicFile = false) {
  const content = await readFile(file);
  checked++;
  if (needles.some((s) => content.includes(Buffer.from(s))) || (publicFile && /TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID/.test(content.toString("utf8")))) failed = true;
}
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.isFile()) await inspect(file, true);
  }
}
for (const dir of ["app/dist/client", "app/dist-pages", "app/public"]) await walk(path.join(root, dir));
const tracked = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: root, encoding: "utf8" }).split("\0").filter(Boolean);
if (tracked.some((file) => file.startsWith(".secrets/"))) failed = true;
for (const file of tracked) await inspect(path.join(root, file));
execFileSync("git", ["check-ignore", "--quiet", ".secrets/telegram.env"], { cwd: root });
console.log(JSON.stringify({ secretScanPassed: !failed, checkedFiles: checked, secretFileIgnored: true }));
process.exitCode = failed ? 1 : 0;
