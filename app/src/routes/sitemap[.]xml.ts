import { createFileRoute } from "@tanstack/react-router";
import { origin, services } from "../slava/content";
import { localePath, stripLang } from "../slava/i18n";
const paths = [
  "/",
  "/poslugy",
  "/portfolio",
  "/pro-kompaniyu",
  "/kontakty",
  "/pryvatnist",
  ...services.map((s) => "/poslugy/" + s.slug),
];
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
            paths
              .flatMap((p) => [p, localePath("en", p)])
              .map((loc) => {
                const uk = stripLang(loc);
                const link = (lang: "uk" | "en", href: string) =>
                  '<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + origin + href + '"/>';
                return (
                  "<url><loc>" +
                  origin +
                  loc +
                  "</loc>" +
                  link("uk", uk) +
                  link("en", localePath("en", uk)) +
                  "</url>"
                );
              })
              .join("") +
            "</urlset>",
          { headers: { "Content-Type": "application/xml; charset=utf-8" } },
        ),
    },
  },
});
