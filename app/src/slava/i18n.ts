import { useRouterState } from "@tanstack/react-router";
import { projects, services, steps } from "./content";
import { projectsEn, reviewDraftsEn, servicesEn, stepsEn } from "./content-en";
import { reviewDrafts } from "./review-drafts";
import { withBase } from "./base";
import { ui, type Lang } from "./text";

// Ukrainian lives at the site root, English under "/en". Page slugs are identical in both,
// so the language switch is a prefix swap and keeps the visitor on the same page.
export const langFromPath = (pathname: string): Lang =>
  /^\/en(\/|$)/.test(pathname) ? "en" : "uk";
export const stripLang = (pathname: string) => pathname.replace(/^\/en(?=\/|$)/, "") || "/";
export const localePath = (lang: Lang, path: string) =>
  lang === "en" ? "/en" + (path === "/" ? "/" : path) : path;

const knownPaths = new Set([
  "/",
  "/poslugy",
  "/portfolio",
  "/pro-kompaniyu",
  "/kontakty",
  "/pryvatnist",
  ...services.map((s) => "/poslugy/" + s.slug),
]);
// True when the address (with or without the language prefix) is one of the site's pages.
export const isKnownPath = (pathname: string) =>
  knownPaths.has(stripLang(pathname).replace(/(.)\/$/, "$1"));

const content = {
  uk: { services, projects, steps, reviews: reviewDrafts },
  en: { services: servicesEn, projects: projectsEn, steps: stepsEn, reviews: reviewDraftsEn },
};
export const getContent = (lang: Lang) => content[lang];

export function useLang(): Lang {
  return useRouterState({ select: (state) => langFromPath(state.location.pathname) });
}
export function useI18n() {
  const lang = useLang();
  return {
    lang,
    tx: ui[lang],
    data: content[lang],
    // Internal link in the current language (path given without language prefix).
    href: (path: string) => withBase(localePath(lang, path)),
  };
}
