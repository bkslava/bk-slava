import { loadConfig } from "./config.mjs";
import { telegramClient } from "./telegram.mjs";
import { createConsultationServer } from "./app.mjs";

try {
  const config = loadConfig();
  const telegram = telegramClient(config);
  await telegram.verify();
  const server = createConsultationServer({ ...config, send: telegram.send });
  server.requestTimeout = 20000;
  server.headersTimeout = 10000;
  server.listen(config.port, config.host, () => console.log(`BK Slava Telegram service ready on port ${config.port}; bot and group verified.`));
  server.on("error", () => { console.error("Telegram service could not listen. Check HOST / PORT."); process.exit(1); });
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 15000).unref();
  });
} catch {
  console.error("Telegram service startup failed. Check server environment, bot/group access and network. Credentials are not logged.");
  process.exitCode = 1;
}
