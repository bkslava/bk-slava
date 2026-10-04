# ТОВ «БК Слава» / BK Slava

Сайт будівельно-ремонтної компанії ТОВ «БК Слава» (Київ та Київська область) — українська та English-версії з перемикачем UA / EN.

- Публічний сайт: https://bkslava.github.io/bk-slava/
- English-версія: https://bkslava.github.io/bk-slava/en/

## Стек

TanStack Start (React 19, SSR) + Vite + Tailwind. Для GitHub Pages SSR-збірка prerender-иться у статичні сторінки для кожного маршруту (UA та EN), разом із `sitemap.xml`, `robots.txt` та `404.html`.

## Локальний запуск

Потрібні Node.js 22+ та Bun.

```sh
cd app
bun install --frozen-lockfile
bun run dev --host 127.0.0.1 --port 3000
```

`bun run build` перевіряє TypeScript і створює збірку в `app/dist`; `bun run start` запускає її на порту 8080.

## GitHub Pages

Статична версія публікується з гілки `gh-pages` з base-path `/bk-slava/`:

```sh
cd app
VITE_BASE=/bk-slava/ VITE_SITE_ORIGIN=https://bkslava.github.io/bk-slava bun run build
VITE_BASE=/bk-slava/ VITE_SITE_ORIGIN=https://bkslava.github.io/bk-slava node export-static.mjs
```

Результат — `app/dist-pages/`; його вміст кладеться в корінь гілки `gh-pages`.

## Власний домен / Docker

Для власного домену встановіть `VITE_SITE_ORIGIN` під час збірки та `SITE_ORIGIN` під час запуску. У репозиторії є `Dockerfile` для запуску SSR-версії (`app/serve.mjs`, порт 8080, `/health`).

