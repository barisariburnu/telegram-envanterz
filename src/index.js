require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { mainMenu } = require("./menus");
const { isAuthorized } = require("./auth");
const {
  handleStockCommand,
  handleAddCommand,
  handleSubtractCommand,
} = require("./commands");
const { handleCallbackQuery } = require("./callbacks");

// Initialize Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log("Bot is starting...");

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  await bot.sendMessage(
    chatId,
    "Merhaba! Envanter Yönetim Botuna Hoş Geldin!",
    mainMenu
  );
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

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

// Handle /stock command
bot.onText(/\/stock (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  const productId = match[1].trim();
  handleStockCommand(bot, chatId, productId);
});

// Handle /add command with optional amount
bot.onText(/\/add (.+?)(?:\s+(\d+))?$/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  const productId = match[1].trim();
  const amount = match[2] ? match[2].trim() : null;
  handleAddCommand(bot, chatId, productId, amount);
});

// Handle /sub command with optional amount
bot.onText(/\/sub (.+?)(?:\s+(\d+))?$/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, "Bu botu kullanma yetkiniz yok.");
  }

  const productId = match[1].trim();
  const amount = match[2] ? match[2].trim() : null;
  handleSubtractCommand(bot, chatId, productId, amount);
});

// Handle text messages for direct product ID input
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  // Skip if not authorized or if it's a command
  if (!isAuthorized(userId) || !text || text.startsWith("/")) {
    return;
  }

  // Check if this is a response to a menu action by checking recent callback data
  // This is a simple approach - in production you might want to use user sessions
  const parts = text.trim().split(/\s+/);
  const productId = parts[0];
  const amount = parts[1];

  // If it looks like a product ID (alphanumeric), show action menu
  if (/^[A-Za-z0-9\-_]+$/.test(productId)) {
    const actionMenu = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📊 Stok Görüntüle",
              callback_data: `view_stock_${productId}`,
            },
          ],
          [
            {
              text: "➕ 1",
              callback_data: `quick_add_${productId}_1`,
            },
            {
              text: "➕ 2",
              callback_data: `quick_add_${productId}_2`,
            },
            {
              text: "➕ 3",
              callback_data: `quick_add_${productId}_3`,
            },
          ],
          [
            {
              text: "➖ 1",
              callback_data: `quick_sub_${productId}_1`,
            },
            {
              text: "➖ 2",
              callback_data: `quick_sub_${productId}_2`,
            },
            {
              text: "➖ 3",
              callback_data: `quick_sub_${productId}_3`,
            },
          ],
          [{ text: "🔙 Ana Menü", callback_data: "main_menu" }],
        ],
      },
    };

    await bot.sendMessage(
      chatId,
      `⚡ Stok İşlemleri - ${productId}\n\nNe yapmak istiyorsunuz?`,
      actionMenu
    );
  }
});

// Handle callback queries (button clicks)
bot.on("callback_query", async (callbackQuery) => {
  const userId = callbackQuery.from.id;

  if (!isAuthorized(userId)) {
    return bot.answerCallbackQuery(
      callbackQuery.id,
      "Bu botu kullanma yetkiniz yok."
    );
  }

  await handleCallbackQuery(bot, callbackQuery);
});

// Error handling
bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

console.log("Bot is running...");
