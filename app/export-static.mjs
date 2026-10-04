// Static export for GitHub Pages: prerenders every route from the SSR build into dist-pages/.
//
//   VITE_BASE=/bk-slava/ VITE_SITE_ORIGIN=https://<user>.github.io/bk-slava bun run build
//   VITE_BASE=/bk-slava/ VITE_SITE_ORIGIN=https://<user>.github.io/bk-slava node export-static.mjs
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, "dist-pages");
const base = (process.env.VITE_BASE || "/").replace(/\/$/, "");
const siteOrigin = (process.env.VITE_SITE_ORIGIN || "").replace(/\/$/, "");
const host = siteOrigin ? new URL(siteOrigin).origin : "http://127.0.0.1";

const routes = [
  "/",
  "/poslugy",
  "/poslugy/remont-pid-klyuch",
  "/poslugy/gipsokarton",
  "/poslugy/ozdoblennya",
  "/poslugy/demontazh",
  "/poslugy/santehnika-elektryka",
  "/poslugy/steli",
  "/poslugy/zagalnobudivelni-roboty",
  "/portfolio",
  "/pro-kompaniyu",
  "/kontakty",
  "/pryvatnist",
  "/en",
  "/en/poslugy",
  "/en/poslugy/remont-pid-klyuch",
  "/en/poslugy/gipsokarton",
  "/en/poslugy/ozdoblennya",
  "/en/poslugy/demontazh",
  "/en/poslugy/santehnika-elektryka",
  "/en/poslugy/steli",
  "/en/poslugy/zagalnobudivelni-roboty",
  "/en/portfolio",
  "/en/pro-kompaniyu",
  "/en/kontakty",
  "/en/pryvatnist",
];

const { default: worker } = await import("./dist/server/server.js");
// The base root is requested as "<base>/" (the router canonicalises to it); other routes carry no trailing slash.
const get = (route) => {
  const url = route === "/" ? base + "/" : base + route;
  return worker.fetch(new Request(host + url), {}, {});
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, "dist/client"), out, { recursive: true });

for (const route of routes) {
  const response = await get(route);
  if (response.status !== 200) throw new Error(`${route} -> ${response.status}`);
  const file = route === "/" ? "index.html" : route.slice(1) + "/index.html";
  await mkdir(path.dirname(path.join(out, file)), { recursive: true });
  await writeFile(path.join(out, file), await response.text());
  console.log("exported", route);
}

for (const file of ["/sitemap.xml", "/robots.txt"]) {
  const response = await get(file);
  if (response.status !== 200) throw new Error(`${file} -> ${response.status}`);
  let body = await response.text();
  // robots.txt is built from the request origin, which lacks the base path.
  if (siteOrigin) body = body.replace(host + "/sitemap.xml", siteOrigin + "/sitemap.xml");
  await writeFile(path.join(out, file.slice(1)), body);
  console.log("exported", file);
}

const notFound = await get("/__not-found__");
if (notFound.status !== 404) throw new Error("404 page returned " + notFound.status);
await writeFile(path.join(out, "404.html"), await notFound.text());
// The manifest holds root-absolute start_url / icon paths.
const manifestPath = path.join(out, "site.webmanifest");
const manifest = await readFile(manifestPath, "utf8");
await writeFile(manifestPath, manifest.replaceAll("\"/", `"${base}/`));
await writeFile(path.join(out, ".nojekyll"), "");
console.log("exported 404.html");
process.exit(0);
