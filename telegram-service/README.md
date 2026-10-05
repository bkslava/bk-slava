# BK Slava Telegram Service

Окремий Node.js HTTP API без додаткових runtime залежностей. Потрібен Node.js 22+.
Використовує вже створеного бота і задану групу. Схема: форма → API → Telegram Bot API → група.
Telegram-контакт сайту `@Alla_301175` збережено.

## Локальний запуск

Із кореня `bk-slava` лише сервіс:

```powershell
node telegram-service/server.mjs
```

Сервіс читає існуючий `.secrets/telegram.env`. Не копіюйте цей файл у `app`, `public`, збірку або репозиторій.
Типово API слухає `http://127.0.0.1:8787`; `GET /health` перевіряє процес без розкриття секретів.
Перед початком роботи перевіряються `getMe`, `getChat`, членство бота та збіг ID групи.

Запуск сайту разом із API з поточної робочої директорії `C:\Users\PC\Desktop\slava`:

```powershell
cd bk-slava/app
bun.cmd run dev:telegram
```

Відкрити `http://127.0.0.1:3000`. Launcher запускає API і Vite, очікує готовності API, прибирає Telegram environment variables перед запуском Vite та завершує обидва процеси при зупинці. Окреме читання secret-файлу відбувається тільки в API-процесі. Для іншого порту API задайте `TELEGRAM_SERVICE_PORT`; порт сайту фіксований 3000, щоб відповідати дозволеним origins. Наявні Node/Bun залежності сайту використовуються без змін lockfile.

## Endpoint і дані

`POST /api/consultation`, JSON із полями існуючої форми:

```json
{
  "name": "Тест",
  "phone": "+380000000000",
  "place": "Київ",
  "service": "Ремонт під ключ",
  "message": "Опис завдання",
  "consent": true,
  "lang": "uk",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

На клієнті і сервері перевіряються ім’я, український телефон і згода. На сервері також перевіряються типи, довжина всіх полів, мова і UUID. Опціональні порожні поля позначаються «Не вказано». Значення UA/EN, Unicode, переноси рядків і спеціальні символи передаються як звичайний текст. Повідомлення містить усі поля, згоду та мову сайту.

`200 {"ok":true}` повертається лише після успішного `sendMessage`, наявності message ID і підтвердження потрібної групи. Відмова Telegram повертає 502; непідтверджена доставка / мережевий збій — 503. Форма зберігає введені значення і показує помилку відповідною мовою. Подвійне натискання заблоковане. Повторний UUID з тим самим вмістом використовує результат попередньої спроби протягом 10 хвилин; інший вміст із цим UUID повертає 409.

API не зберігає заявки у базі даних і не записує їх або Telegram-секрети в логи. У пам’яті залишаються короткочасні хеші запитів, результати та лічильники обмеження частоти. Ліміт — 5 нових спроб на IP за 10 хвилин, тіло — до 16 KiB. CORS дозволяє тільки задані origins. Це не автентифікація користувачів; endpoint публічний. Для масштабування на кілька інстансів потрібне спільне сховище лімітів/UUID або обмеження на рівні reverse proxy.

Якщо Telegram прийняв заявку, але мережа втратила відповідь, API чесно повертає «доставку не підтверджено». Автоматичної повторної відправки немає. Повторна спроба з тим самим UUID отримує попередній результат у межах 10 хвилин. Після завершення цього часу або перезапуску сервісу можливе повторне повідомлення; за потреби користувач може зателефонувати для уточнення.

## Environment variables

| Змінна | Де | Призначення |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Лише API, обов’язкова | Секрет існуючого бота |
| `TELEGRAM_CHAT_ID` | Лише API, обов’язкова | Числовий ID існуючої групи |
| `ALLOWED_ORIGINS` | API | Origins через кому, без шляхів і кінцевого `/`. Локально типово `http://127.0.0.1:3000,http://localhost:3000`; публічно `https://shalomesp11-creator.github.io` |
| `HOST` | API | Типово `127.0.0.1`; для хостингу `0.0.0.0` |
| `PORT` | API | Типово 8787 або порт від хостингу |
| `TELEGRAM_ENV_FILE` | API, опціональна | Абсолютний шлях до іншого локального secret-файлу |
| `TRUST_PROXY` | API, опціональна | Типово 0. Значення 1 лише за довіреним proxy, який перезаписує `X-Forwarded-For` та закриває прямий доступ до API |
| `VITE_CONSULTATION_API_URL` | Публічна збірка сайту | Повна HTTPS адреса `/api/consultation`. Локально порожня: використовується Vite proxy |

Ніколи не встановлюйте `VITE_TELEGRAM_BOT_TOKEN` або інші клієнтські змінні із Telegram-секретами. При встановлених серверних environment variables їх значення мають пріоритет над локальним env-файлом.

## Перевірки

Із кореня `bk-slava`:

```powershell
node telegram-service/verify.mjs
# Наступна команда реально надсилає одне явно позначене тестове повідомлення:
node telegram-service/verify.mjs --send-test
node --test telegram-service/service.test.mjs
```

Із `app`, при запущеному `dev:telegram`:

```powershell
node check-telegram-form.mjs
```

Без `REAL_TELEGRAM_TEST=1` браузерні тести симулюють доставку, не засмічуючи групу. Скрипт перевіряє UA/EN, 1440/390/320 px, обраний напрямок, усі дані форми, валідацію, очікування доставки, success-state, 502, `200 ok=false`, мережевий збій, 429, збереження даних та локальний proxy.

Для реальної перевірки саме статичного експорту GitHub Pages локально: зупиніть попередній API, додайте `http://127.0.0.1:3001` до `ALLOWED_ORIGINS` та запустіть сервіс. Із `app` у другому терміналі:

```powershell
$env:VITE_BASE='/bk-slava/'
$env:VITE_CONSULTATION_API_URL='http://127.0.0.1:8787/api/consultation'
bun.cmd run build
node export-static.mjs
$env:STATIC_TEST='1'
$env:REAL_TELEGRAM_TEST='1'
node check-telegram-form.mjs
node ../telegram-service/check-secrets.mjs
```

Це надсилає **чотири** тестові заявки: UA/EN на desktop/mobile. 320 px перевіряється із симуляцією доставки. Тимчасовий статичний сервер тесту слухає 3001, endpoint — на іншому origin 8787: перевіряється справжній CORS/preflight. Звіти та PNG зберігаються локально у `refs/qa/telegram/`, який ігнорується Git. Secret-скан перевіряє `dist/client`, `dist-pages`, `public` і відстежувані Git файли без виведення токена.

## Майбутнє розгортання

1. Розгорнути тільки серверні runtime файли `config.mjs`, `telegram.mjs`, `app.mjs`, `server.mjs` на Node.js 22+ з HTTPS перед сервісом. Або з кореня проєкту: `docker build -t bk-slava-telegram ./telegram-service`; цей Docker-контекст дозволяє тільки runtime файли. Для контейнера вже встановлено `HOST=0.0.0.0`.
2. Через secret/environment settings хостингу встановити актуальні `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALLOWED_ORIGINS=https://shalomesp11-creator.github.io`, `HOST=0.0.0.0` та потрібний `PORT`. `.secrets/telegram.env` не завантажувати. Задати політику автоматичного перезапуску процесу.
3. Перебудувати сайт із реальною HTTPS адресою API (не локальною тестовою адресою):

```powershell
cd app
$env:VITE_BASE='/bk-slava/'
$env:VITE_SITE_ORIGIN='https://shalomesp11-creator.github.io/bk-slava'
$env:VITE_CONSULTATION_API_URL='https://YOUR-API-HOST/api/consultation'
bun.cmd run build
node export-static.mjs
node ../telegram-service/check-secrets.mjs
```

4. Після окремого рішення про публікацію опублікувати **лише вміст `app/dist-pages`** на GitHub Pages. На GitHub Pages серверний код не виконується. Зміна URL API потребує нової збірки сайту.
5. Після розгортання перевірити форму на публічній UA/EN версії, HTTPS і доставку в ту саму групу.

Поточна реалізація та всі перевірки виконуються локально. GitHub, бот, username, група та налаштування Telegram не змінюються.

Методи провайдера: [офіційна Telegram Bot API документація](https://core.telegram.org/bots/api#sendmessage).
