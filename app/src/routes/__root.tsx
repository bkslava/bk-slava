import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { ErrorPage, NotFoundPage, SiteShell } from "../slava/site";
import { isKnownPath, useLang } from "../slava/i18n";
import { ui } from "../slava/text";
import appCss from "../styles.css?url";
import appMeta from "../app-meta.json";
import { origin } from "../slava/content";
import { withBase } from "../slava/base";
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: appMeta.og_title },
      { name: "description", content: appMeta.og_description },
      { name: "theme-color", content: "#063b0c" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "uk_UA" },
      { property: "og:site_name", content: "ТОВ БК Слава" },
      { property: "og:image", content: origin + "/assets/og.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: origin + "/assets/og.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: withBase("/favicon.ico") },
      { rel: "apple-touch-icon", href: withBase("/apple-touch-icon.png") },
      { rel: "manifest", href: withBase("/site.webmanifest") },
      {
        rel: "preload",
        href: withBase("/fonts/manrope-cyrillic.woff2"),
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: Root,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});
const business = {
  uk: {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "ТОВ БК Слава",
    url: origin,
    logo: origin + "/assets/logo-clean.png",
    telephone: "+380676090075",
    email: "m98720141@gmail.com",
    foundingDate: "2006",
    areaServed: [
      { "@type": "City", name: "Київ" },
      { "@type": "AdministrativeArea", name: "Київська область" },
    ],
  },
  en: {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: "BK Slava LLC",
    url: origin + "/en/",
    logo: origin + "/assets/logo-clean.png",
    telephone: "+380676090075",
    email: "m98720141@gmail.com",
    foundingDate: "2006",
    areaServed: [
      { "@type": "City", name: "Kyiv" },
      { "@type": "AdministrativeArea", name: "Kyiv Region" },
    ],
  },
};
function RootShell({ children }: { children: ReactNode }) {
  const lang = useLang();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const englishNotFound = lang === "en" && !isKnownPath(pathname);
  const englishNotFoundTitle = `${ui.en.notFound.title.replace(/\.$/, "")} | ${ui.en.meta.suffix}`;
  return (
    <html lang={lang}>
      <head>
        {englishNotFound ? (
          <>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>{englishNotFoundTitle}</title>
            <meta name="description" content={ui.en.notFound.text} />
            <meta name="theme-color" content="#063b0c" />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={englishNotFoundTitle} />
            <meta property="og:description" content={ui.en.notFound.text} />
            <meta property="og:locale" content={ui.en.meta.locale} />
            <meta property="og:site_name" content={ui.en.meta.suffix} />
            <meta property="og:image" content={origin + "/assets/og.webp"} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={origin + "/assets/og.webp"} />
            <link rel="stylesheet" href={appCss} />
            <link rel="icon" href={withBase("/favicon.ico")} />
            <link rel="apple-touch-icon" href={withBase("/apple-touch-icon.png")} />
            <link rel="manifest" href={withBase("/site.webmanifest")} />
            <link
              rel="preload"
              href={withBase("/fonts/manrope-cyrillic.woff2")}
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            />
          </>
        ) : (
          <HeadContent />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(business[lang]) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
function Root() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteShell>
        <Outlet />
      </SiteShell>
    </QueryClientProvider>
  );
}
