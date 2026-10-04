// Deploy base path ("" for a host root, "/bk-slava" for GitHub Pages project sites).
export const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
export const withBase = (path: string) => base + path;
