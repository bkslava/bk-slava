import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
const staticRoot = path.join(root, "dist/client");
const { default: worker } = await import("./dist/server/server.js");
const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".mp4": "video/mp4",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, process.env.SITE_ORIGIN || "http://127.0.0.1:8080");
    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    const file = path.resolve(staticRoot, "." + decodeURIComponent(url.pathname));
    if (file.startsWith(staticRoot + path.sep)) {
      let info;
      try {
        info = await stat(file);
      } catch {}
      if (info?.isFile()) {
        const bytes = await readFile(file);
        const headers = {
          "Content-Type": types[path.extname(file)] || "application/octet-stream",
          "Cache-Control": url.pathname.startsWith("/assets/")
            ? "public, max-age=86400"
            : "public, max-age=3600",
          "Accept-Ranges": "bytes",
          "X-Content-Type-Options": "nosniff",
        };
        const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || "");
        if (match) {
          const start = Number(match[1]);
          const end = Math.min(match[2] ? Number(match[2]) : bytes.length - 1, bytes.length - 1);
          if (start > end) {
            res.writeHead(416, { "Content-Range": "bytes */" + bytes.length });
            res.end();
            return;
          }
          res.writeHead(206, {
            ...headers,
            "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
            "Content-Length": end - start + 1,
          });
          res.end(req.method === "HEAD" ? undefined : bytes.subarray(start, end + 1));
          return;
        }
        res.writeHead(200, { ...headers, "Content-Length": bytes.length });
        res.end(req.method === "HEAD" ? undefined : bytes);
        return;
      }
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    const response = await worker.fetch(
      new Request(url, { method: req.method, headers: req.headers }),
      {},
      {},
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(req.method === "HEAD" ? undefined : Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Не вдалося завантажити сторінку.");
  }
});
server.listen(Number(process.env.PORT || 8080), "0.0.0.0", () =>
  console.log("BK Slava server ready"),
);
process.on("SIGTERM", () => server.close(() => process.exit(0)));
