require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { getMainMenu } = require("./menus");
const { isAuthorized } = require("./auth");
const {
  handleStockCommand,
  handleAddCommand,
  handleSubtractCommand,
  handleHolidayModeCommand,
} = require("./commands");
const { handleCallbackQuery } = require("./callbacks");

// ─── Sabitler ────────────────────────────────────────────────────────────────
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Art arda bu kadar polling hatası gelirse process.exit(1) çağrılır.
 * Docker'ın restart: always politikası konteyneri otomatik yeniden başlatır.
 */
const MAX_CONSECUTIVE_ERRORS = 15;

/** Geçici hata durumunda process.exit öncesi bekleme süresi (ms) */
const EXIT_DELAY_MS = 3000;

// ─── Bot Başlatma ─────────────────────────────────────────────────────────────
let pollingErrorCount = 0;
let exitScheduled = false;

const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 1000,
    autoStart: true,
    params: { timeout: 10 },
  },
});

console.log(`[${new Date().toISOString()}] Bot başlatıldı.`);

// ─── Yardımcı ─────────────────────────────────────────────────────────────────

/**
 * Hata geçici mi? (Telegram sunucu taraflı veya ağ zaman aşımı)
 * @param {Error} error
 * @returns {boolean}
 */
function isTransientError(error) {
  if (error.code === "EFATAL" || error.code === "ETELEGRAM") return true;
  if (error.response) {
    return [502, 503, 504].includes(error.response.statusCode);
  }
  return false;
}

// ─── Komut Handler'ları ───────────────────────────────────────────────────────

// /start
bot.onText(/\/start/, async (msg) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  const menu = await getMainMenu();
  await bot.sendMessage(chatId, "Merhaba! Envanter Yönetim Botuna Hoş Geldin!", menu);
});

// /help
bot.onText(/\/help/, (msg) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  bot.sendMessage(
    chatId,
    "📋 **Kullanım Kılavuzu**\n\n" +
      "**Komutlar:**\n" +
      "• `/start` - Ana menüyü göster\n" +
      "• `/help` - Bu yardım mesajını göster\n" +
      "• `/stock <ürün_id>` - Stok durumunu kontrol et\n" +
      "• `/add <ürün_id> [miktar]` - Stok ekle (varsayılan: 1)\n" +
      "• `/sub <ürün_id> [miktar]` - Stok çıkar (varsayılan: 1)\n\n" +
      "**Hızlı Kullanım:**\n" +
      "• Sadece ürün ID yazarak stok sorgulayabilirsiniz\n" +
      "• Stok sorguladıktan sonra hızlı ekleme/çıkarma butonları görünür\n" +
      "• Menüden seçim yaparak rehberli işlem yapabilirsiniz\n\n" +
      "**Desteklenen Formatlar:**\n" +
      "• `PRODUCTID`\n" +
      "• `AF-PRODUCTID-BTY`\n" +
      "• `PRODUCTID-G`\n" +
      "• `AFB-PRODUCTID`",
    { parse_mode: "Markdown" }
  );
});

// /stock <id>
bot.onText(/\/stock (.+)/, (msg, match) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  handleStockCommand(bot, chatId, match[1].trim());
});

// /add <id> [miktar]
bot.onText(/\/add (.+?)(?:\s+(\d+))?$/, (msg, match) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  handleAddCommand(bot, chatId, match[1].trim(), match[2] ?? null);
});

// /sub <id> [miktar]
bot.onText(/\/sub (.+?)(?:\s+(\d+))?$/, (msg, match) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  handleSubtractCommand(bot, chatId, match[1].trim(), match[2] ?? null);
});

// /tatil ac|kapat
bot.onText(/\/tatil (ac|kapat)/, async (msg, match) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  await handleHolidayModeCommand(bot, chatId, match[1]);
});

// ─── Mesaj Handler'ı (Doğrudan ürün ID girişi) ───────────────────────────────
bot.on("message", async (msg) => {
  const { id: chatId } = msg.chat;
  const { id: userId } = msg.from;
  const text = msg.text;

  if (!isAuthorized(userId) || !text || text.startsWith("/")) return;

  const [productId] = text.trim().split(/\s+/);

  if (!/^[A-Za-z0-9\-_]+$/.test(productId)) return;

  await bot.sendMessage(
    chatId,
    `⚡ Stok İşlemleri - ${productId}\n\nNe yapmak istiyorsunuz?`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📊 Stok Görüntüle", callback_data: `view_stock_${productId}` }],
          [
            { text: "➕ 1", callback_data: `quick_add_${productId}_1` },
            { text: "➕ 2", callback_data: `quick_add_${productId}_2` },
            { text: "➕ 3", callback_data: `quick_add_${productId}_3` },
          ],
          [
            { text: "➖ 1", callback_data: `quick_sub_${productId}_1` },
            { text: "➖ 2", callback_data: `quick_sub_${productId}_2` },
            { text: "➖ 3", callback_data: `quick_sub_${productId}_3` },
          ],
          [{ text: "🔙 Ana Menü", callback_data: "main_menu" }],
        ],
      },
    }
  );
});

// ─── Callback Query Handler'ı ─────────────────────────────────────────────────
bot.on("callback_query", async (callbackQuery) => {
  const { id: userId } = callbackQuery.from;

  if (!isAuthorized(userId)) {
    return bot.answerCallbackQuery(callbackQuery.id, "Bu botu kullanma yetkiniz yok.");
  }

  await handleCallbackQuery(bot, callbackQuery);
});

// ─── Polling Hata Yönetimi ───────────────────────────────────────────────────
bot.on("polling_error", (error) => {
  const timestamp = new Date().toISOString();

  if (!isTransientError(error)) {
    // Kritik hata → hemen çık, Docker yeniden başlatsın
    console.error(`[${timestamp}] KRİTİK polling hatası:`, error.message);
    process.exit(1);
    return;
  }

  pollingErrorCount++;
  console.warn(
    `[${timestamp}] Geçici polling hatası (${pollingErrorCount}/${MAX_CONSECUTIVE_ERRORS}): ` +
      `${error.code ?? error.message}`
  );

  // Art arda çok fazla hata → process'i sonlandır, Docker otomatik restart yapar
  if (pollingErrorCount >= MAX_CONSECUTIVE_ERRORS && !exitScheduled) {
    exitScheduled = true;
    console.error(
      `[${timestamp}] ${MAX_CONSECUTIVE_ERRORS} art arda hata oluştu. ` +
        `${EXIT_DELAY_MS / 1000}s sonra yeniden başlatılıyor...`
    );
    setTimeout(() => process.exit(1), EXIT_DELAY_MS);
  }
});

// Başarılı her polling döngüsünde hata sayacını sıfırla
bot.on("polling", () => {
  if (pollingErrorCount > 0) {
    console.log(`[${new Date().toISOString()}] Polling düzeldi, hata sayacı sıfırlandı.`);
    pollingErrorCount = 0;
    exitScheduled = false;
  }
});

// ─── Process Hata Yakalama ────────────────────────────────────────────────────
process.on("uncaughtException", (error) => {
  console.error(`[${new Date().toISOString()}] Yakalanmamış hata:`, error.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error(`[${new Date().toISOString()}] İşlenmeyen Promise reddi:`, reason);
  process.exit(1);
});

console.log(`[${new Date().toISOString()}] Bot çalışıyor.`);
