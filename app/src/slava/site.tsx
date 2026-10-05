import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouterState } from "@tanstack/react-router";
import { phone, type Service } from "./content";
import { base, withBase } from "./base";
import { isKnownPath, localePath, stripLang, useI18n } from "./i18n";
import type { Lang } from "./text";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h16m-7-7 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function Close() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function ContactIcon({ kind }: { kind: string }) {
  const paths: Record<string, ReactNode> = {
    phone: <path d="M7 3 4 5c-2 5 6 13 11 15l4-3-4-4-3 2c-3-1-5-3-5-6l2-2-2-4Z" />,
    email: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    telegram: (
      <>
        <path d="m3 11 18-7-4 17-6-5-4 3 1-7 10-6-7 10" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M20 11a8 8 0 0 1-12 7l-5 2 1-5A8 8 0 1 1 20 11Z" />
        <path d="m9 7-2 1c0 4 3 7 7 8l2-2-3-2-1 1c-2-1-3-2-3-3l1-1-1-2Z" />
      </>
    ),
    viber: (
      <>
        <path d="M5 3h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8l-5 3v-3H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="m8 7-1 1c0 4 2 6 6 7l2-2-2-2-1 1-2-2 1-1-3-2ZM13 6c3 0 5 2 5 5m-5-2c1 0 2 1 2 2" />
      </>
    ),
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {paths[kind]}
    </svg>
  );
}
const ContactContext = createContext<(service?: string, focusTarget?: HTMLElement | null) => void>(
  () => {},
);
export function ConsultationButton({
  className = "",
  children,
  service,
  onClick,
  focusTarget,
}: {
  className?: string;
  children?: ReactNode;
  service?: string;
  onClick?: () => void;
  focusTarget?: HTMLElement | null;
}) {
  const open = useContext(ContactContext);
  const { tx } = useI18n();
  return (
    <button
      className={`button-primary ${className}`}
      aria-label={className === "header-consult" ? tx.common.consult : undefined}
      type="button"
      onClick={() => {
        onClick?.();
        open(service, focusTarget);
      }}
    >
      {children ?? tx.common.consult}
      <Arrow diagonal />
    </button>
  );
}
export function Photo({
  name,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 600px) calc(100vw - 40px), (max-width: 900px) 50vw, 45vw",
}: {
  name: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <img
      className={className}
      src={withBase("/assets/" + name + ".webp")}
      srcSet={`${base}/assets/${name}-640.webp 640w, ${base}/assets/${name}-1200.webp 1200w, ${base}/assets/${name}.webp 1920w`}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      width="1920"
      height="1080"
    />
  );
}
// Renders translated lines separated by <br />.
function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}
function Brand() {
  const { tx, href } = useI18n();
  return (
    <a href={href("/")} className="brand" aria-label={tx.common.brandHome}>
      <img src={withBase("/assets/logo-144.webp")} alt={tx.common.logoAlt} width="144" height="144" />
      <span>
        {tx.nav.title.toUpperCase()}
        <small>{tx.common.brandSub}</small>
      </span>
    </a>
  );
}
// UA / EN switch: a plain link to the mirrored page, so the visitor stays on the page they are on.
function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, tx } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  // An unknown address has no mirrored page, so the switch goes to the home page instead.
  const missing = !isKnownPath(pathname);
  const [suffix, setSuffix] = useState("");
  useEffect(() => {
    setSuffix(location.search + location.hash);
  }, [pathname]);
  const options: [Lang, string, string][] = [
    ["uk", "UA", tx.common.langUk],
    ["en", "EN", tx.common.langEn],
  ];
  return (
    <div className={"lang-switch " + className} role="group" aria-label={tx.common.langLabel}>
      {options.map(([code, label, name]) => (
        <a
          key={code}
          href={withBase(localePath(code, missing ? "/" : stripLang(pathname))) + (missing ? "" : suffix)}
          lang={code}
          hrefLang={code}
          aria-label={name}
          aria-current={code === lang ? "true" : undefined}
        >
          {label}
        </a>
      ))}
    </div>
  );
}
function ContactMethods({ large = false }: { large?: boolean }) {
  const { tx } = useI18n();
  return (
    <div className={"contact-methods " + (large ? "large" : "")}>
      <a aria-label={tx.common.phone} href="tel:+380676090075">
        <ContactIcon kind="phone" />
        <span>{tx.common.phone}</span>
        <Arrow diagonal />
      </a>
      <a
        aria-label="WhatsApp"
        href="https://wa.me/380676090075"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ContactIcon kind="whatsapp" />
        <span>WhatsApp</span>
        <Arrow diagonal />
      </a>
      <a aria-label="Viber" href="viber://chat?number=%2B380676090075">
        <ContactIcon kind="viber" />
        <span>Viber</span>
        <Arrow diagonal />
      </a>
      <a
        aria-label="Telegram"
        href="https://t.me/Alla_301175"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ContactIcon kind="telegram" />
        <span>Telegram</span>
        <Arrow diagonal />
      </a>
      <a aria-label="Email" href="mailto:m98720141@gmail.com">
        <ContactIcon kind="email" />
        <span>Email</span>
        <Arrow diagonal />
      </a>
    </div>
  );
}
function Consultation({
  open,
  onOpenChange,
  service,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: string;
  returnFocus: () => void;
}) {
  const { tx, href, data, lang } = useI18n();
  const f = tx.form;
  const [values, setValues] = useState({
    name: "",
    phone: "",
    place: "",
    service: "",
    message: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const [invalidField, setInvalidField] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const requestRef = useRef<{ payload: string; id: string } | null>(null);
  useEffect(() => {
    if (open) {
      setValues((v) => ({ ...v, service }));
      setSaved(false);
      setError("");
      setInvalidField("");
    }
  }, [open, service]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (sendingRef.current) return;
    const digits = values.phone.replace(/\D/g, "");
    const reject = (field: string, message: string) => {
      setInvalidField(field);
      setError(message);
      formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
    };
    if (!values.name.trim()) {
      reject("name", f.errName);
      return;
    }
    if (!/^(380\d{9}|0\d{9})$/.test(digits)) {
      reject("phone", f.errPhone);
      return;
    }
    if (!values.consent) {
      reject("consent", f.errConsent);
      return;
    }
    setError("");
    setInvalidField("");
    sendingRef.current = true;
    setSending(true);
    try {
      const payload = JSON.stringify({ ...values, lang });
      if (requestRef.current?.payload !== payload) {
        requestRef.current = { payload, id: crypto.randomUUID() };
      }
      const response = await fetch(import.meta.env.VITE_CONSULTATION_API_URL || "/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, lang, requestId: requestRef.current.id }),
        signal: AbortSignal.timeout(18000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setError(result.error === "DELIVERY_UNCONFIRMED" ? f.errUnconfirmed : response.status === 429 ? f.errRateLimit : f.errSend);
        return;
      }
      setSaved(true);
    } catch {
      setError(f.errUnconfirmed);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!sendingRef.current) onOpenChange(next); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="consult-panel"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            returnFocus();
          }}
        >
          <Dialog.Close className="close-control" aria-label={f.close} disabled={sending}>
            <Close />
          </Dialog.Close>
          <div className="panel-topline">{f.topline}</div>
          <Dialog.Title>
            <Lines lines={f.title} />
          </Dialog.Title>
          <Dialog.Description>{f.description}</Dialog.Description>
          {saved ? (
            <div className="form-complete" role="status">
              <span className="complete-mark">✓</span>
              <h3>{f.doneTitle}</h3>
              <p>{f.doneDescription}</p>
              <a href="tel:+380676090075" className="notice-phone">
                {phone}
              </a>
              <button className="text-link" onClick={() => {
                setValues({ name: "", phone: "", place: "", service, message: "", consent: false });
                requestRef.current = null;
                setSaved(false);
              }}>
                {f.back}
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={submit} noValidate aria-busy={sending}>
              <div className="form-grid">
                <label>
                  {f.name}
                  <input
                    autoComplete="given-name"
                    name="name"
                    aria-invalid={invalidField === "name"}
                    aria-describedby={invalidField === "name" ? "consultation-error" : undefined}
                    value={values.name}
                    onChange={(e) => setValues({ ...values, name: e.target.value })}
                    placeholder={f.namePlaceholder}
                    required
                    maxLength={80}
                    disabled={sending}
                  />
                </label>
                <label>
                  {f.phone}
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    name="phone"
                    aria-invalid={invalidField === "phone"}
                    aria-describedby={invalidField === "phone" ? "consultation-error" : undefined}
                    value={values.phone}
                    onChange={(e) => setValues({ ...values, phone: e.target.value })}
                    placeholder={f.phonePlaceholder}
                    required
                    maxLength={25}
                    disabled={sending}
                  />
                </label>
              </div>
              <label>
                {f.place}
                <input
                  name="place"
                  autoComplete="address-level2"
                  value={values.place}
                  onChange={(e) => setValues({ ...values, place: e.target.value })}
                  placeholder={f.placePlaceholder}
                  maxLength={120}
                  disabled={sending}
                />
              </label>
              <label>
                {f.what}
                <select
                  name="service"
                  value={values.service}
                  disabled={sending}
                  onChange={(e) => setValues({ ...values, service: e.target.value })}
                >
                  <option value="">{f.choose}</option>
                  {data.services.map((s) => (
                    <option key={s.slug}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label>
                {f.message}
                <textarea
                  name="message"
                  value={values.message}
                  onChange={(e) => setValues({ ...values, message: e.target.value })}
                  placeholder={f.messagePlaceholder}
                  rows={3}
                  maxLength={2000}
                  disabled={sending}
                />
              </label>
              <label className="consent">
                <input
                  type="checkbox"
                  name="consent"
                  required
                  aria-invalid={invalidField === "consent"}
                  aria-describedby={invalidField === "consent" ? "consultation-error" : undefined}
                  checked={values.consent}
                  disabled={sending}
                  onChange={(e) => setValues({ ...values, consent: e.target.checked })}
                />
                <span>
                  {f.consent}{" "}
                  <a href={href("/pryvatnist")} target="_blank" rel="noopener noreferrer">
                    {f.privacyLink}
                  </a>
                  .
                </span>
              </label>
              {error && (
                <p id="consultation-error" className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="form-submit" disabled={sending}>
                {sending ? f.sending : f.submit} <Arrow diagonal />
              </button>
              <p className="form-note">
                {f.direct} <a href="tel:+380676090075">{phone}</a>
              </p>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
const imageRetries = new WeakMap<HTMLImageElement, number>();
function reloadImage(img: HTMLImageElement) {
  const attempt = (imageRetries.get(img) ?? 0) + 1;
  if (attempt > 3) return;
  imageRetries.set(img, attempt);
  const src = img.getAttribute("src");
  const srcset = img.getAttribute("srcset");
  // WebKit keeps a failed request cached for the lifetime of the document, so retry on a fresh URL.
  const bust = (url: string) => url.replace(/[?&]r=\d+$/, "") + "?r=" + attempt;
  img.removeAttribute("srcset");
  img.removeAttribute("src");
  requestAnimationFrame(() => {
    img.loading = "eager";
    if (srcset) {
      img.setAttribute(
        "srcset",
        srcset
          .split(",")
          .map((part) => {
            const [url, size] = part.trim().split(/\s+/);
            return bust(url) + (size ? " " + size : "");
          })
          .join(", "),
      );
    }
    if (src) img.setAttribute("src", bust(src));
  });
}
// Mobile browsers can restore a page (back button / bfcache) with images whose request was cut
// off by the navigation. Re-request every image that ended up broken instead of leaving a hole.
function useImageRecovery() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const heal = () => {
      document.querySelectorAll("img").forEach((img) => {
        if (!img.getAttribute("src") && !img.getAttribute("srcset")) return;
        if (img.complete && img.naturalWidth === 0) reloadImage(img);
      });
    };
    const schedule = (delay = 150) => {
      clearTimeout(timer);
      timer = setTimeout(heal, delay);
    };
    const onPageShow = () => {
      for (const delay of [100, 1200]) setTimeout(heal, delay);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") schedule();
    };
    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) schedule(600);
    };
    schedule(400);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", () => schedule());
    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener("error", onError, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("error", onError, true);
    };
  }, []);
}
export function SiteShell({ children }: { children: ReactNode }) {
  useImageRecovery();
  const { lang, tx, href } = useI18n();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const opener = useRef<HTMLElement | null>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [service, setService] = useState("");
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  // Route patterns are language-neutral; the "/en" prefix is only part of the visible URL.
  const current = stripLang(pathname);
  const links = [
    ["/poslugy", tx.common.services],
    ["/portfolio", tx.common.portfolio],
    ["/pro-kompaniyu", tx.common.about],
    ["/kontakty", tx.common.contacts],
  ];
  const isCurrent = (url: string) => current === url || current.startsWith(url + "/");
  return (
    <ContactContext.Provider
      value={(s, focusTarget) => {
        const active = document.activeElement as HTMLElement;
        opener.current =
          focusTarget || (active.closest(".mobile-menu") ? menuTrigger.current : active);
        setService(s || "");
        setMenu(false);
        setOpen(true);
      }}
    >
      <a className="skip-link" href="#main">
        {tx.common.skip}
      </a>
      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label={tx.nav.main}>
          {links.map(([url, title]) => (
            <a key={url} href={href(url)} aria-current={isCurrent(url) ? "page" : undefined}>
              {title}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-phone" href="tel:+380676090075">
            {phone}
          </a>
          <LangSwitch className="in-header" />
          <ConsultationButton className="header-consult">
            <span>{tx.common.consultShort}</span>
          </ConsultationButton>
          <button
            ref={menuTrigger}
            className="menu-toggle"
            onClick={() => setMenu(true)}
            aria-label={tx.nav.open}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <Dialog.Root open={menu} onOpenChange={setMenu}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            id="mobile-navigation"
            className="mobile-menu"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              if (!open) menuTrigger.current?.focus();
            }}
          >
            <Dialog.Close className="close-control" aria-label={tx.nav.close}>
              <Close />
            </Dialog.Close>
            <Dialog.Title>{tx.nav.title}</Dialog.Title>
            <Dialog.Description>{tx.nav.description}</Dialog.Description>
            <LangSwitch className="in-menu" />
            <nav aria-label={tx.nav.mobile}>
              <a href={href("/")} aria-current={current === "/" ? "page" : undefined}>
                {tx.common.home} <Arrow diagonal />
              </a>
              {links.map(([url, title]) => (
                <a key={url} href={href(url)} aria-current={isCurrent(url) ? "page" : undefined}>
                  {title}
                  <Arrow diagonal />
                </a>
              ))}
            </nav>
            <ConsultationButton className="menu-consult" />
            <a href="tel:+380676090075">{phone}</a>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <Brand />
          <p>
            <Lines lines={tx.footer.tagline} />
          </p>
          <div className="footer-links">
            <a href={href("/poslugy")}>{tx.common.services}</a>
            <a href={href("/portfolio")}>{tx.common.portfolio}</a>
            <a href={href("/pro-kompaniyu")}>{tx.common.about}</a>
            <a href={href("/kontakty")}>{tx.common.contacts}</a>
          </div>
          <div className="footer-contacts">
            <a href="tel:+380676090075">{phone}</a>
            <a href="mailto:m98720141@gmail.com">m98720141@gmail.com</a>
            <ContactMethods />
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {tx.common.company}
          </span>
          <span>{tx.footer.since}</span>
          <a href={href("/pryvatnist")}>{tx.common.privacy}</a>
        </div>
      </footer>
      <Consultation
        open={open}
        onOpenChange={setOpen}
        service={service}
        returnFocus={() => {
          const target = opener.current;
          if (target?.isConnected) target.focus();
          else {
            const fallback = document.querySelector<HTMLElement>(".header-consult");
            if (fallback?.getClientRects().length) fallback.focus();
            else menuTrigger.current?.focus();
          }
        }}
      />
    </ContactContext.Provider>
  );
}
function Intro() {
  const { tx } = useI18n();
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    try {
      if (
        !sessionStorage.getItem("slava-intro-v2-seen") &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setMobile(matchMedia("(max-width: 700px)").matches);
        setVisible(true);
        sessionStorage.setItem("slava-intro-v2-seen", "1");
      }
    } catch {
      // Browsers with session storage disabled can still use the main site.
    }
  }, []);
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(timer);
  }, [visible]);
  return (
    <Dialog.Root open={visible} onOpenChange={setVisible}>
      <Dialog.Portal>
        <Dialog.Content
          className="intro"
          tabIndex={-1}
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            document.getElementById("main")?.focus({ preventScroll: true });
          }}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            video.current?.closest<HTMLElement>(".intro")?.focus();
          }}
        >
          <Dialog.Title className="sr-only">{tx.intro.title}</Dialog.Title>
          <video
            ref={video}
            className={ready ? "ready" : ""}
            autoPlay
            muted
            playsInline
            preload="auto"
            src={withBase(mobile ? "/assets/intro-mobile.mp4" : "/assets/intro.mp4")}
            poster={withBase("/assets/intro-poster.jpg")}
            onCanPlay={() => setReady(true)}
            onEnded={() => setVisible(false)}
            onError={(e) => {
              if (e.currentTarget.error) setVisible(false);
            }}
            onTimeUpdate={(e) =>
              setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 5))
            }
          ></video>
          <div className="intro-caption">
            <span>{tx.intro.caption}</span>
            <span>{tx.intro.tagline}</span>
          </div>
          <button className="intro-skip" onClick={() => setVisible(false)}>
            {tx.intro.skip} <Arrow />
          </button>
          <div className="intro-progress" style={{ transform: `scaleX(${progress})` }} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Home() {
  const { tx, href } = useI18n();
  const h = tx.home;
  return (
    <>
      <Intro />
      <section className="home-hero">
        <Photo name="hero" alt={h.heroAlt} priority sizes="100vw" />
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="hero-kicker">{h.kicker}</span>
          <h1>
            <Lines lines={h.title} />
          </h1>
          <p>{h.lead}</p>
        </div>
        <ConsultationButton className="hero-consult">
          <span>{tx.common.consult}</span>
        </ConsultationButton>
        <span className="hero-caption">{h.caption}</span>
      </section>
      <section className="year-section wrap">
        <div className="year-number">
          <span className="year-eyebrow">{h.yearEyebrow}</span>
          <strong>
            2006<span className="year-dot">.</span>
          </strong>
          <span className="year-baseline">
            {h.yearBaseline} <Arrow diagonal />
          </span>
        </div>
        <div>
          <h2>{h.yearTitle}</h2>
          <p>{h.yearText}</p>
          <a className="text-link" href={href("/pro-kompaniyu")}>
            {h.yearLink} <Arrow diagonal />
          </a>
        </div>
      </section>
      <ServicesDirectory />
      <WorkCarousel />
      <Process />
      <Reviews />
      <ContactBand />
    </>
  );
}
function WorkCarousel() {
  const { tx, href, data } = useI18n();
  const c = tx.carousel;
  const { projects } = data;
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const card = el.firstElementChild as HTMLElement;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      setPosition(Math.round(el.scrollLeft / (card.offsetWidth + gap)));
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
    };
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);
  const move = (direction: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement;
    el.scrollBy({
      left: direction * (card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0)),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };
  return (
    <section className="selected-work wrap" aria-label={c.label}>
      <div className="work-heading">
        <div>
          <span className="eyebrow">{c.eyebrow}</span>
          <h2>
            {c.title}
            <span className="accent-dot">.</span>
          </h2>
        </div>
        <div className="carousel-controls">
          <span aria-live="polite">
            {String(position + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
          <button
            className="round-control previous"
            onClick={() => move(-1)}
            disabled={position === 0}
            aria-label={c.prev}
          >
            <Arrow />
          </button>
          <button
            className="round-control"
            onClick={() => move(1)}
            disabled={atEnd}
            aria-label={c.next}
          >
            <Arrow />
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="work-track"
        tabIndex={0}
        role="group"
        aria-label={c.group}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            move(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {projects.map((p) => (
          <a href={href("/portfolio") + "?project=" + p.id} className="project-link" key={p.id}>
            <div className="image-crop">
              <Photo name={p.image} alt={p.title} />
              <span className="project-open">
                <Arrow diagonal />
              </span>
            </div>
            <div className="project-caption">
              <h3>{p.title}</h3>
              <span>{p.type}</span>
            </div>
          </a>
        ))}
      </div>
      <div className="gallery-foot">
        <span>{c.foot}</span>
        <a className="text-link" href={href("/portfolio")}>
          {c.all} <Arrow />
        </a>
      </div>
    </section>
  );
}
function ServicesDirectory({ full = false }: { full?: boolean }) {
  const { tx, href, data } = useI18n();
  const d = tx.directory;
  const { services } = data;
  const [active, setActive] = useState(0);
  // The row's highlight and the preview below are both driven by `active`. It is set on
  // pointer-down as well as on hover/focus so a touch or press immediately shows the matching
  // image, and a plain tap still follows the link.
  return (
    <section className={"services-directory wrap " + (full ? "directory-full" : "")}>
      <div className="section-heading">
        <h2>{full ? d.titleFull : d.title}</h2>
        <p>{d.text}</p>
      </div>
      <div className="service-index">
        <div className="service-rows">
          {services.map((s, i) => (
            <a
              href={href("/poslugy/" + s.slug)}
              key={s.slug}
              onPointerDown={() => setActive(i)}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(i);
              }}
              onFocus={() => setActive(i)}
              className={active === i ? "active" : ""}
            >
              <span className="row-number">0{i + 1}</span>
              <div>
                <h3>{s.name}</h3>
                <p>{s.short}</p>
              </div>
              <span className="row-arrow">
                <Arrow diagonal />
              </span>
            </a>
          ))}
        </div>
        <div className="service-preview">
          <div className="preview-media">
            {services.map((s, i) => (
              <Photo
                key={s.slug}
                name={s.image}
                alt={active === i ? s.name : ""}
                className={active === i ? "active" : ""}
              />
            ))}
          </div>
          <div className="preview-description">
            <span>
              0{active + 1} / {d.previewLabel}
            </span>
            <h3>{services[active].name}</h3>
            <p>{services[active].short}</p>
            <a className="text-link" href={href("/poslugy/" + services[active].slug)}>
              {d.more} <Arrow diagonal />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
function Reviews() {
  const { tx, data } = useI18n();
  const r = tx.reviews;
  const { reviews } = data;
  const cards = (items: typeof reviews) =>
    items.map((review) => (
      <figure className="review-card" key={review.name + review.place}>
        <span className="review-quote" aria-hidden="true">
          “
        </span>
        <blockquote>{review.text}</blockquote>
        <figcaption>
          <span className="review-name">{review.name}</span>
          <span className="review-place">{review.place}</span>
        </figcaption>
      </figure>
    ));
  return (
    <section className="reviews-section wrap" aria-labelledby="reviews-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{r.eyebrow}</span>
          <h2 id="reviews-heading">
            {r.title}
            <span className="accent-dot">.</span>
          </h2>
        </div>
      </div>
      <div className="reviews-grid">{cards(reviews.slice(0, 3))}</div>
      <details className="reviews-more">
        <summary>
          {r.all + " ("}
          {reviews.length}
          {")"}
          <span aria-hidden="true">+</span>
        </summary>
        <div className="reviews-grid">{cards(reviews.slice(3))}</div>
      </details>
    </section>
  );
}
export function Process() {
  const { tx, data } = useI18n();
  return (
    <section className="process-section">
      <div className="wrap">
        <h2>
          <span className="eyebrow">{tx.process.eyebrow}</span>
          {tx.process.title[0]}
          <br />
          {tx.process.title[1]}
        </h2>
        <div className="process-grid">
          {data.steps.map(([name, text], i) => (
            <div key={name}>
              <span className="step-index">0{i + 1}</span>
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ContactBand() {
  const { tx } = useI18n();
  return (
    <section className="contact-band wrap">
      <div>
        <span className="contact-kicker">{tx.band.kicker}</span>
        <h2>
          <Lines lines={tx.band.title} />
        </h2>
        <a className="contact-big-phone" href="tel:+380676090075">
          {phone}
        </a>
        <ContactMethods />
      </div>
      <ConsultationButton className="contact-consult">
        <span>{tx.common.consult}</span>
      </ConsultationButton>
    </section>
  );
}
function Breadcrumb({ current, service = false }: { current: string; service?: boolean }) {
  const { tx, href } = useI18n();
  return (
    <nav className={`breadcrumb${service ? " breadcrumb-service" : ""}`} aria-label={tx.breadcrumb}>
      <a href={href("/")}>{tx.common.home}</a>
      <span>/</span>
      {service && (
        <>
          <a href={href("/poslugy")}>{tx.common.services}</a>
          <span>/</span>
        </>
      )}
      <span aria-current="page">{current}</span>
    </nav>
  );
}
export function ServicesPage() {
  const { tx } = useI18n();
  const p = tx.servicesPage;
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current={tx.common.services} />
        <h1>
          {p.title[0]}
          <br />
          <span>{p.title[1]}</span>
        </h1>
        <p>{p.text}</p>
      </div>
      <div className="page-banner wrap">
        <Photo name="house" alt={p.bannerAlt} priority sizes="100vw" />
      </div>
      <ServicesDirectory full />
      <Process />
      <ContactBand />
    </>
  );
}
export function ServicePage({ service: s }: { service: Service }) {
  const { tx, href, data } = useI18n();
  const p = tx.servicePage;
  const index = data.services.findIndex((item) => item.slug === s.slug);
  const next = data.services[(index + 1) % data.services.length];
  return (
    <>
      <div className={`page-title service-title wrap service-${s.slug}`}>
        <Breadcrumb current={s.name} service />
        <div className="service-title-grid">
          <div>
            <span className="service-label">{p.label}</span>
            <h1>{s.name}</h1>
            <p>{s.short}</p>
            <ConsultationButton service={s.name} className="service-consult" />
          </div>
          <div className="service-cover">
            <Photo name={s.image} alt={s.name} priority />
          </div>
        </div>
      </div>
      <section className="service-description wrap">
        <h2>
          <Lines lines={p.approach} />
        </h2>
        <p>{s.intro}</p>
      </section>
      <section className="scope-section wrap">
        <div className="section-heading">
          <h2>{p.scopeTitle}</h2>
          <p>{p.scopeText}</p>
        </div>
        <div className="scope-grid">
          {s.scope.map((name, i) => (
            <article key={name}>
              <span>0{i + 1}</span>
              <h3>{name}</h3>
              <p>{s.details[i]}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="service-result">
        <div className="wrap">
          <span>{p.resultLabel}</span>
          <h2>{s.result}</h2>
        </div>
      </div>
      <Process />
      <section className="faq wrap">
        <h2>{p.faqTitle}</h2>
        <div>
          {p.faq.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <a className="next-service wrap" href={href("/poslugy/" + next.slug)}>
        <span>{p.next}</span>
        <h3>{next.name}</h3>
        <Arrow diagonal />
      </a>
      <ContactBand />
    </>
  );
}
function BeforeAfter() {
  const { tx } = useI18n();
  const c = tx.compare;
  const [value, setValue] = useState(50);
  return (
    <div className="comparison">
      <div className="compare-images">
        <Photo name="after" alt={c.afterAlt} sizes="100vw" />
        <div className="compare-before" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <Photo name="before" alt={c.beforeAlt} sizes="100vw" />
        </div>
        <span className="compare-tag before">{c.before}</span>
        <span className="compare-tag after">{c.after}</span>
        <div className="compare-line" style={{ left: value + "%" }}>
          <span>↔</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label={c.slider}
          aria-valuetext={c.valueText(value)}
        />
      </div>
      <p>{c.hint}</p>
    </div>
  );
}
export function Portfolio() {
  const { tx, data } = useI18n();
  const p = tx.portfolioPage;
  const { projects, services } = data;
  const [filter, setFilter] = useState(p.all);
  const [selected, setSelected] = useState<(typeof projects)[number] | null>(null);
  const projectOpener = useRef<HTMLElement | null>(null);
  const handoff = useRef(false);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get("project");
    if (id) setSelected(projects.find((item) => item.id === id) || null);
  }, [projects]);
  const categories = [p.all, ...p.categories];
  const visible = projects.filter((item) => filter === p.all || item.category === filter);
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current={tx.common.portfolio} />
        <h1>
          {p.title}
          <span className="accent-dot">.</span>
        </h1>
        <p>{p.text}</p>
      </div>
      <section className="portfolio-section wrap">
        <div className="portfolio-filters" role="group" aria-label={p.filtersLabel}>
          {categories.map((c) => (
            <button
              aria-pressed={filter === c}
              className={filter === c ? "selected" : ""}
              onClick={() => setFilter(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="filter-count" aria-live="polite">
          {visible.length}
          {p.count(visible.length)}
        </p>
        <div className="portfolio-grid">
          {visible.map((item) => (
            <button
              className="portfolio-project"
              onClick={(e) => {
                projectOpener.current = e.currentTarget;
                handoff.current = false;
                setSelected(item);
              }}
              key={item.id}
            >
              <div className="image-crop">
                <Photo name={item.image} alt={item.title} />
                <span className="project-open">
                  <Arrow diagonal />
                </span>
              </div>
              <div className="project-caption">
                <h2>{item.title}</h2>
                <span>{item.type}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="beforeafter-section wrap">
        <h2>{p.changeTitle}</h2>
        <p>{p.changeText}</p>
        <BeforeAfter />
      </section>
      <ContactBand />
      <Dialog.Root
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />
          <Dialog.Content
            className="project-dialog"
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              if (!handoff.current) {
                const target =
                  projectOpener.current ||
                  document.querySelector<HTMLElement>(".portfolio-filters button");
                target?.focus({ preventScroll: true });
              }
            }}
          >
            <Dialog.Close className="close-control" aria-label={p.closeProject}>
              <Close />
            </Dialog.Close>
            {selected && (
              <>
                <Photo
                  name={selected.image}
                  alt={selected.title}
                  priority
                  sizes="(max-width: 1200px) 90vw, 1080px"
                />
                <div className="project-dialog-text">
                  <span>
                    {selected.type}
                    {" / " + p.visualisation}
                  </span>
                  <Dialog.Title>{selected.title}</Dialog.Title>
                  <Dialog.Description>{selected.text}</Dialog.Description>
                  <ConsultationButton
                    className="project-consult"
                    service={services.find((s) => s.slug === selected.service)?.name}
                    focusTarget={projectOpener.current}
                    onClick={() => {
                      handoff.current = true;
                      setSelected(null);
                    }}
                    children={p.discuss}
                  />
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
export function About() {
  const { tx } = useI18n();
  const a = tx.about;
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current={tx.common.about} />
        <h1>
          {a.title[0]}
          <br />
          <span>{a.title[1]}</span>
        </h1>
        <p>{a.text}</p>
      </div>
      <section className="about-identity wrap">
        <div className="about-logo">
          <img
            src={withBase("/assets/logo-720.webp")}
            alt={a.logoAlt}
            width="720"
            height="720"
            loading="lazy"
          />
        </div>
        <div>
          <h2>{a.heading}</h2>
          <p>{a.p1}</p>
          <p>{a.p2}</p>
          <p>{a.p3}</p>
          <span className="about-since">
            {a.since} <small>{a.sinceSmall}</small>
          </span>
        </div>
      </section>
      <section className="values wrap">
        <h2>
          <Lines lines={a.valuesTitle} />
        </h2>
        <div>
          {a.values.map(([t, p]) => (
            <article key={t}>
              <h3>{t}</h3>
              <p>{p}</p>
              <Arrow diagonal />
            </article>
          ))}
        </div>
      </section>
      <Process />
      <ContactBand />
    </>
  );
}
export function Contacts() {
  const { tx } = useI18n();
  const c = tx.contactsPage;
  return (
    <>
      <div className="page-title wrap">
        <Breadcrumb current={tx.common.contacts} />
        <h1>
          {c.title[0]}
          <br />
          <span>{c.title[1]}</span>
        </h1>
        <p>{c.text}</p>
      </div>
      <section className="contacts-layout wrap">
        <div className="contacts-primary">
          <span>{c.call}</span>
          <a href="tel:+380676090075">{phone}</a>
          <span>{c.write}</span>
          <a className="contact-email" href="mailto:m98720141@gmail.com">
            m98720141@gmail.com
          </a>
          <ContactMethods large />
        </div>
        <div className="contact-invitation">
          <Photo name="material" alt={c.imageAlt} />
          <div>
            <span>{tx.intro.caption}</span>
            <h2>
              <Lines lines={c.invitation} />
            </h2>
            <ConsultationButton className="invitation-consult" />
          </div>
        </div>
      </section>
      <section className="contact-preparation wrap">
        <h2>
          <Lines lines={c.prepTitle} />
        </h2>
        <div>
          <p>{c.p1}</p>
          <p>{c.p2}</p>
          <p>{c.p3}</p>
        </div>
      </section>
    </>
  );
}
export function Privacy() {
  const { tx } = useI18n();
  const p = tx.privacyPage;
  return (
    <div className="legal-page wrap">
      <Breadcrumb current={tx.common.privacy} />
      <h1>{p.title}</h1>
      <p>
        {p.contact} <a href="mailto:m98720141@gmail.com">m98720141@gmail.com</a>. {p.company}
      </p>
      {p.sections.map(([heading, text]) => (
        <Fragment key={heading}>
          <h2>{heading}</h2>
          <p>{text}</p>
        </Fragment>
      ))}
    </div>
  );
}
export function NotFoundPage() {
  const { tx, href } = useI18n();
  return (
    <div className="error-page wrap">
      <span>404</span>
      <h1>{tx.notFound.title}</h1>
      <p>{tx.notFound.text}</p>
      <a href={href("/")}>
        {tx.notFound.home} <Arrow diagonal />
      </a>
    </div>
  );
}
export function ErrorPage() {
  const { tx, href } = useI18n();
  return (
    <div className="error-page wrap">
      <h1>{tx.notFound.errorTitle}</h1>
      <p>{tx.notFound.errorText}</p>
      <a href={href("/")}>
        {tx.notFound.home} <Arrow diagonal />
      </a>
    </div>
  );
}
