import { randomUUID } from "node:crypto";
import { loadConfig } from "./config.mjs";
import { telegramClient, formatConsultation } from "./telegram.mjs";

try {
  const telegram = telegramClient(loadConfig());
  console.log(JSON.stringify(await telegram.verify()));
  if (process.argv.includes("--send-test")) {
    const result = await telegram.send(formatConsultation({
      name: "ТЕСТ інтеграції — не заявка клієнта",
      phone: "+380000000000",
      place: "Локальна перевірка БК Слава",
      service: "Перевірка Telegram Bot API",
      message: `Тестове повідомлення. Бот, група й доставка перевіряються локально. ID перевірки: ${randomUUID()}`,
      lang: "uk",
    }));
    console.log(JSON.stringify({ delivered: true, messageId: result.messageId }));
  }
} catch {
  console.error("Telegram verification failed. Check local secrets, permissions and network; credentials are not logged.");
  process.exitCode = 1;
}
