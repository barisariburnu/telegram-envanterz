/**
 * Callback query handlers for the Telegram bot
 * Manages responses to inline keyboard button presses
 */

const { mainMenu, backToMainMenu, createConfirmationMenu } = require("./menus");
const { cleanProductId } = require("./commands");

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
      await bot.editMessageText(
        "Welcome to the Inventory Management Bot! Please select an option:",
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: mainMenu.reply_markup,
        }
      );
    } else if (data === "check_stock") {
      await bot.editMessageText(
        "📊 Stok Kontrol\n\nÜrün ID girin:\n\nÖrnek: `PROD001` veya `AF-PROD001-BTY`",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: backToMainMenu.reply_markup,
        }
      );
    } else if (data === "add_stock") {
      await bot.editMessageText(
        "➕ Stok Ekleme\n\nÜrün ID girin (miktar belirtmezseniz 1 adet eklenir):\n\nÖrnekler:\n• `PROD001` (1 adet ekler)\n• `PROD001 10` (10 adet ekler)",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: backToMainMenu.reply_markup,
        }
      );
    } else if (data === "subtract_stock") {
      await bot.editMessageText(
        "➖ Stok Çıkarma\n\nÜrün ID girin (miktar belirtmezseniz 1 adet çıkarılır):\n\nÖrnekler:\n• `PROD001` (1 adet çıkarır)\n• `PROD001 5` (5 adet çıkarır)",
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: backToMainMenu.reply_markup,
        }
      );
    } else if (
      data.startsWith("confirm_add_") ||
      data.startsWith("confirm_subtract_")
    ) {
      // Extract product ID and amount from callback data
      const parts = data.split("_");
      const action = parts[1]; // 'add' or 'subtract'
      const productId = parts[2];
      const amount = parts[3] ? parseInt(parts[3]) : 1;

      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from("stock")
        .select(
          `
          id, 
          quantity, 
          name, 
          ebujiteri!inner(shopier_id)
        `
        )
        .eq("id", productId)
        .single();

      if (productError || !product) {
        return bot.editMessageText(`❌ Ürün ID ${productId} bulunamadı.`, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: backToMainMenu.reply_markup,
        });
      }

      // Calculate new quantity
      let newQuantity;
      if (action === "add") {
        newQuantity = product.quantity + amount;
      } else {
        // subtract
        // Check if there's enough stock
        if (product.quantity < amount) {
          return bot.editMessageText(
            `❌ Yeterli stok yok. Mevcut miktar: ${product.quantity}.`,
            {
              chat_id: chatId,
              message_id: messageId,
              reply_markup: backToMainMenu.reply_markup,
            }
          );
        }
        newQuantity = product.quantity - amount;
      }

      // Update the stock
      const { error: updateError } = await supabase
        .from("stock")
        .update({ quantity: newQuantity })
        .eq("id", productId);

      if (updateError) {
        console.error("Supabase güncelleme hatası:", updateError);
        return bot.editMessageText(
          "❌ Veritabanı güncellenirken hata oluştu. Lütfen daha sonra tekrar deneyin.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: backToMainMenu.reply_markup,
          }
        );
      }

      // Send success message
      const actionText = action === "add" ? "eklendi" : "çıkarıldı";
      const amountText = action === "add" ? `+${amount}` : `-${amount}`;

      const successMessage = `✅ Ürün stok miktarı başarıyla güncellendi!

  Ürün ID: ${product.id}
  Ürün Adı: ${product.name || "N/A"}
  Miktar: ${amountText} adet ürün ${actionText}
  Yeni Miktar: ${newQuantity}`;

      await bot.editMessageText(successMessage, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: backToMainMenu.reply_markup,
      });
    } else if (data.startsWith("quick_add_") || data.startsWith("quick_subtract_")) {
      // Handle quick action buttons from stock query
      const parts = data.split("_");
      const action = parts[1]; // 'add' or 'subtract'
      const productId = parts[2];
      
      await bot.editMessageText(
        `${action === 'add' ? '➕' : '➖'} Stok ${action === 'add' ? 'Ekleme' : 'Çıkarma'}

Ürün ID: ${productId}

Miktar girin (varsayılan: 1):`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [
                { text: "1", callback_data: `quick_${action}_${productId}_1` },
                { text: "5", callback_data: `quick_${action}_${productId}_5` },
                { text: "10", callback_data: `quick_${action}_${productId}_10` }
              ],
              [
                { text: "🔙 Geri", callback_data: `back_to_stock_${productId}` },
                { text: "🏠 Ana Menü", callback_data: "main_menu" }
              ]
            ]
          }
        }
      );
    } else if (data.startsWith("quick_add_") && data.split("_").length === 4) {
      // Handle quick add with amount
      const parts = data.split("_");
      const productId = parts[2];
      const amount = parseInt(parts[3]);
      
      await processQuickStockUpdate(bot, callbackQuery, supabase, "add", productId, amount);
    } else if (data.startsWith("quick_subtract_") && data.split("_").length === 4) {
      // Handle quick subtract with amount
      const parts = data.split("_");
      const productId = parts[2];
      const amount = parseInt(parts[3]);
      
      await processQuickStockUpdate(bot, callbackQuery, supabase, "subtract", productId, amount);
    } else if (data.startsWith("back_to_stock_")) {
      // Handle back to stock info
      const productId = data.split("_")[3];
      
      // Re-query stock info and show it
      const { handleStockCommand } = require("./commands");
      await handleStockCommand(bot, chatId, productId, supabase);
      
      // Delete the current message since handleStockCommand sends a new one
      try {
        await bot.deleteMessage(chatId, messageId);
      } catch (deleteError) {
        console.error("Mesaj silinirken hata:", deleteError);
      }
      return;
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
      console.error("Hata mesajı gönderilirken hata oluştu:", secondaryError);
    }
  }
}

/**
 * Process quick stock update from callback buttons
 * @param {Object} bot - Telegram bot instance
 * @param {Object} callbackQuery - Callback query data
 * @param {Object} supabase - Supabase client instance
 * @param {string} action - 'add' or 'subtract'
 * @param {string} productId - Product ID
 * @param {number} amount - Amount to update
 */
async function processQuickStockUpdate(bot, callbackQuery, supabase, action, productId, amount) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  
  try {
    // Clean the product ID
    const cleanedProductId = cleanProductId(productId);
    
    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("stock")
      .select(`
        id, 
        quantity, 
        name
      `)
      .eq("id", cleanedProductId)
      .single();

    if (productError || !product) {
      return bot.editMessageText(`❌ Ürün ID ${cleanedProductId} bulunamadı.`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: backToMainMenu.reply_markup,
      });
    }

    // Calculate new quantity
    let newQuantity;
    if (action === "add") {
      newQuantity = product.quantity + amount;
    } else {
      // subtract
      if (product.quantity < amount) {
        return bot.editMessageText(
          `❌ Yeterli stok yok. Mevcut miktar: ${product.quantity}.`,
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🔙 Geri", callback_data: `back_to_stock_${productId}` },
                  { text: "🏠 Ana Menü", callback_data: "main_menu" }
                ]
              ]
            }
          }
        );
      }
      newQuantity = product.quantity - amount;
    }

    // Update the stock
    const { error: updateError } = await supabase
      .from("stock")
      .update({ quantity: newQuantity })
      .eq("id", cleanedProductId);

    if (updateError) {
      console.error("Supabase güncelleme hatası:", updateError);
      return bot.editMessageText(
        "❌ Veritabanı güncellenirken hata oluştu. Lütfen daha sonra tekrar deneyin.",
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: backToMainMenu.reply_markup,
        }
      );
    }

    // Send success message with quick actions
    const actionText = action === "add" ? "eklendi" : "çıkarıldı";
    const amountText = action === "add" ? `+${amount}` : `-${amount}`;

    const successMessage = `✅ Stok başarıyla güncellendi!

Ürün ID: ${product.id}
Ürün Adı: ${product.name || "N/A"}
İşlem: ${amountText} adet ${actionText}
Yeni Miktar: ${newQuantity}`;

    await bot.editMessageText(successMessage, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ Tekrar Ekle", callback_data: `quick_add_${productId}` },
            { text: "➖ Tekrar Çıkar", callback_data: `quick_subtract_${productId}` }
          ],
          [
            { text: "📊 Stok Görüntüle", callback_data: `back_to_stock_${productId}` },
            { text: "🏠 Ana Menü", callback_data: "main_menu" }
          ]
        ]
      }
    });
  } catch (error) {
    console.error("Quick stock update hatası:", error);
    await bot.editMessageText(
      "❌ Stok güncellenirken hata oluştu. Lütfen daha sonra tekrar deneyin.",
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: backToMainMenu.reply_markup,
      }
    );
  }
}

module.exports = {
  handleCallbackQuery,
};
