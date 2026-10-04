import { pageHead } from "./content";
import { getContent } from "./i18n";
import { ui, type Lang } from "./text";

// Per-page <head> data, shared by the Ukrainian routes and their /en counterparts.
export const heads = {
  home: (lang: Lang) =>
    pageHead(ui[lang].meta.homeTitle, "/", ui[lang].meta.homeText, "og", lang),
  services: (lang: Lang) =>
    pageHead(ui[lang].common.services, "/poslugy", ui[lang].meta.servicesText, "house", lang),
  portfolio: (lang: Lang) =>
    pageHead(ui[lang].common.portfolio, "/portfolio", ui[lang].meta.portfolioText, "hero", lang),
  about: (lang: Lang) =>
    pageHead(ui[lang].common.about, "/pro-kompaniyu", ui[lang].meta.aboutText, "material", lang),
  contacts: (lang: Lang) =>
    pageHead(ui[lang].common.contacts, "/kontakty", ui[lang].meta.contactsText, "material", lang),
  privacy: (lang: Lang) =>
    pageHead(ui[lang].common.privacy, "/pryvatnist", ui[lang].meta.privacyText, "og", lang),
  service: (lang: Lang, slug: string) => {
    const s = getContent(lang).services.find((item) => item.slug === slug)!;
    return pageHead(s.name, "/poslugy/" + slug, s.intro, s.image, lang);
  },
};
export const serviceFor = (lang: Lang, slug: string) =>
  getContent(lang).services.find((item) => item.slug === slug)!;
