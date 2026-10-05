export class TelegramError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export function telegramClient({ token, chatId }, fetchImpl = fetch) {
  async function call(method, payload = {}) {
    try {
      const response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000),
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true || !data.result) throw new TelegramError("TELEGRAM_REJECTED");
      return data.result;
    } catch (error) {
      // Never expose a fetch error, URL, Telegram description, token or payload.
      if (error instanceof TelegramError) throw error;
      throw new TelegramError("TELEGRAM_UNAVAILABLE");
    }
  }
  return {
    async verify() {
      const bot = await call("getMe");
      const chat = await call("getChat", { chat_id: chatId });
      if (!bot.is_bot || !["group", "supergroup"].includes(chat.type) || String(chat.id) !== chatId) {
        throw new TelegramError("TELEGRAM_GROUP_MISMATCH");
      }
      const member = await call("getChatMember", { chat_id: chatId, user_id: bot.id });
      if (["left", "kicked"].includes(member.status) || (member.status === "restricted" && !member.can_send_messages)) {
        throw new TelegramError("TELEGRAM_NO_SEND_PERMISSION");
      }
      return { botVerified: true, groupVerified: true, membership: member.status };
    },
    async send(text) {
      const result = await call("sendMessage", {
        chat_id: chatId,
        text,
        link_preview_options: { is_disabled: true },
      });
      if (!Number.isInteger(result.message_id) || result.message_id <= 0 || String(result.chat?.id) !== chatId) {
        throw new TelegramError("TELEGRAM_DELIVERY_UNCONFIRMED");
      }
      return { messageId: result.message_id };
    },
  };
}

export function formatConsultation(values) {
  const optional = (s) => s || "Не вказано";
  // Plain text preserves UA/EN, line breaks, &, < and > without markup errors.
  return [
    "📩 Нова заявка — БК Слава",
    "",
    `Ім’я: ${values.name}`,
    `Телефон: ${values.phone}`,
    `Об’єкт / населений пункт: ${optional(values.place)}`,
    `Напрямок робіт: ${optional(values.service)}`,
    "",
    "Опис завдання:",
    optional(values.message),
    "",
    `Мова сайту: ${values.lang === "en" ? "EN" : "UA"}`,
    "Згода на обробку даних: так",
  ].join("\n");
}
