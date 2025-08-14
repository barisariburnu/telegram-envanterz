/**
 * Callback query handlers for the Telegram bot
 * Manages responses to inline keyboard button presses
 */

const { mainMenu, backToMainMenu, postUpdateMenu } = require("./menus");
const { cleanProductId, updateStock } = require("./commands");

/**
 * Handle message edit errors, fallback to new message if content is identical
 */
async function safeEditMessage(bot, chatId, messageId, text, options) {
  try {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      ...options,
    });
  } catch (error) {
    if (error.response?.body?.description?.includes("message is not modified"))
      return;
    if (messageId) {
      await bot.sendMessage(chatId, text, options);
    } else {
      throw error;
    }
  }
}

/**
 * Handle callback queries from inline keyboard buttons
 * @param {Object} bot - Telegram bot instance
 * @param {Object} callbackQuery - Callback query data
 * @param {Object} supabase - Supabase client instance
 */
async function handleCallbackQuery(bot, callbackQuery, supabase) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  try {
    // Acknowledge the callback query
    await bot.answerCallbackQuery(callbackQuery.id);

    // Handle different callback data
    if (data === "main_menu") {
      await safeEditMessage(
        bot,
        chatId,
        messageId,
        "Envanter Yönetim Botuna Hoş Geldiniz! Lütfen bir seçenek seçin:",
        { reply_markup: mainMenu.reply_markup }
      );
    } else if (data === "quick_actions") {
      await safeEditMessage(
        bot,
        chatId,
        messageId,
        "⚡ Stok İşlemleri\n\nSadece ürün kodunu yapıştırın, işlem seçenekleri gösterilecek:\n\nÖrnekler:\n• `PROD001`\n• `AF-PROD001-BTY`\n• `BKP10884`",
        {
          parse_mode: "Markdown",
          reply_markup: backToMainMenu.reply_markup,
        }
      );
    } else if (data.startsWith("quick_add_") || data.startsWith("quick_sub_")) {
      const parts = data.split("_");
      const action = parts[1];
      const productId = parts[2];
      const amount = parts[3] ? parseInt(parts[3]) : null;

      if (amount) {
        await processQuickStockUpdate(
          bot,
          callbackQuery,
          supabase,
          action,
          productId,
          amount
        );
      } else {
        await safeEditMessage(
          bot,
          chatId,
          messageId,
          `${action === "add" ? "➕" : "➖"} Stok ${
            action === "add" ? "Ekleme" : "Çıkarma"
          }\n\nÜrün ID: ${productId}\n\nMiktar girin (varsayılan: 1):`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "1",
                    callback_data: `quick_${action}_${productId}_1`,
                  },
                  {
                    text: "2",
                    callback_data: `quick_${action}_${productId}_2`,
                  },
                  {
                    text: "3",
                    callback_data: `quick_${action}_${productId}_3`,
                  },
                ],
                [
                  {
                    text: "🔙 Geri",
                    callback_data: `back_to_stock_${productId}`,
                  },
                  { text: "🏠 Ana Menü", callback_data: "main_menu" },
                ],
              ],
            },
          }
        );
      }
    } else if (data.startsWith("view_stock_")) {
      const productId = data.replace("view_stock_", "");
      const { handleStockCommand } = require("./commands");
      await handleStockCommand(bot, chatId, productId, supabase);
    } else if (data.startsWith("back_to_stock_")) {
      const productId = data.split("_")[3];
      const { handleStockCommand } = require("./commands");
      await handleStockCommand(bot, chatId, productId, supabase);
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (deleteError) {
        console.error("Mesaj silinirken hata:", deleteError);
      }
    }
  } catch (error) {
    console.error("Callback sorgusu işlenirken hata oluştu:", error);

    // Try to send an error message
    try {
      await bot.editMessageText(
        "❌ Callback sorgusu işlenirken hata oluştu. Lütfen daha sonra tekrar deneyin.",
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: backToMainMenu.reply_markup,
        }
      );
    } catch (secondaryError) {
      // If editing fails (e.g., message content is the same), try sending a new message
      if (
        secondaryError.response &&
        secondaryError.response.body &&
        secondaryError.response.body.description &&
        secondaryError.response.body.description.includes(
          "message is not modified"
        )
      ) {
        try {
          await bot.sendMessage(
            chatId,
            "❌ Callback sorgusu işlenirken hata oluştu. Lütfen daha sonra tekrar deneyin.",
            backToMainMenu
          );
        } catch (tertiaryError) {
          console.error("Yeni mesaj gönderilirken hata oluştu:", tertiaryError);
        }
      } else {
        console.error("Hata mesajı gönderilirken hata oluştu:", secondaryError);
      }
    }
  }
}

/**
 * Process quick stock update from callback buttons
 * @param {Object} bot - Telegram bot instance
 * @param {Object} callbackQuery - Callback query data
 * @param {Object} supabase - Supabase client instance
 * @param {string} action - 'add' or 'sub'
 * @param {string} productId - Product ID
 * @param {number} amount - Amount to update
 */
async function processQuickStockUpdate(
  bot,
  callbackQuery,
  supabase,
  action,
  productId,
  amount
) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const cleanedProductId = cleanProductId(productId);

  try {
    const result = await updateStock(
      cleanedProductId,
      amount,
      action,
      supabase
    );
    await safeEditMessage(bot, chatId, messageId, result.message, {
      parse_mode: "Markdown",
      reply_markup: postUpdateMenu(productId).reply_markup,
    });
  } catch (error) {
    console.error("Stok güncelleme hatası:", error);
    const errorMessage = `❌ ${
      error.message || "İşlem sırasında hata oluştu."
    }`;
    await safeEditMessage(bot, chatId, messageId, errorMessage, {
      reply_markup: backToMainMenu.reply_markup,
    });
  }

  // Eğer özel menü gerekiyorsa, buraya ek işlem eklenebilir
}

module.exports = {
  handleCallbackQuery,
};
