# ТОВ БК Слава / BK Slava

Сайт будівельно-ремонтної компанії ТОВ «БК Слава» (Київ та Київська область): українська та English-версії з перемикачем UA / EN, форма консультації з доставкою заявки в Telegram.

Production: https://slavabud.com.ua (Netlify, сайт `bk-slava`).

## Склад репозиторію

| Каталог | Призначення |
| --- | --- |
| `app/` | Сайт: TanStack Start (React 19, SSR) + Vite + Tailwind. Для production збирається у статичні сторінки (`export-static.mjs`). |
| `netlify-api/` | Окремий Netlify-сайт `bk-slava-telegram-api` (https://api.slavabud.com.ua): Netlify Function `/api/consultation`, що надсилає заявку в Telegram. |
| `telegram-service/` | Спільна логіка валідації/форматування заявки й самостійний Node-сервіс із тим самим API (Docker). |

## Збірка та деплой сайту (Netlify)

Потрібні Node.js 22+ та Bun.

```sh
cd app
bun install --frozen-lockfile
VITE_SITE_ORIGIN=https://slavabud.com.ua \
VITE_CONSULTATION_API_URL=https://api.slavabud.com.ua/api/consultation \
bun run build && node export-static.mjs
netlify deploy --prod --dir dist-pages --site <bk-slava site id>
```

`app/netlify.toml` містить кеш- та security-заголовки; результат збірки — `app/dist-pages/`.

## API форми консультації

`netlify-api/` деплоїться окремо (publish `public`, functions `functions`). Секрети задаються **тільки** у змінних середовища Netlify цього сайту, у репозиторії їх немає:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `ALLOWED_ORIGINS` — дозволені origin сайту, через кому (напр. `https://slavabud.com.ua`)

Форма на сайті знає лише публічну адресу API (`VITE_CONSULTATION_API_URL`). Ніколи не передавайте секрети Telegram через змінні `VITE_*`.

Локальна розробка: `cd app && bun run dev` (сайт) і `bun run dev:telegram` (локальний API; секрети читаються з `.secrets/telegram.env`, який виключений з Git). Шаблон змінних — `telegram-service/.env.example`.

## Перевірка

```sh
cd app
bun run typecheck
bun run test:telegram
```

## Локальний SSR / Docker

`bun run build`, потім `bun run start` (порт 8080, `/health`). Для власного домену задайте `VITE_SITE_ORIGIN` під час збірки та `SITE_ORIGIN` під час запуску. У корені є `Dockerfile` для SSR-версії.
