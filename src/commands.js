/**
 * Command handlers for the Telegram bot
 * Implements logic for /stock and /update commands
 */

const { backToMainMenu, postUpdateMenu } = require("./menus");

/**
 * Clean product ID by removing prefixes and suffixes
 * @param {string} productId - Raw product ID
 * @returns {string} - Cleaned product ID
 */
function cleanProductId(productId) {
  if (!productId) return "";
  return productId
    .trim()
    .toUpperCase()
    .replace(/^AF-(.*)-BTY$/, "$1")
    .replace(/-G$/, "");
}

/**
 * Handle the /stock command to check stock level
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Telegram chat ID
 * @param {string} productId - Product ID to check
 * @param {Object} supabase - Supabase client instance
 */
async function handleStockCommand(bot, chatId, productId, supabase) {
  try {
    // Validate product ID (now accepts alphanumeric strings)
    if (!productId || productId.trim().length === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Geçersiz ürün ID. Lütfen geçerli bir ürün ID girin.",
        backToMainMenu
      );
    }

    // Clean the product ID
    const cleanedProductId = cleanProductId(productId);

    // Query the stock table with join to ebujiteri table
    const { data, error } = await supabase
      .from("stock")
      .select(
        `
        id, 
        quantity
      `
      )
      .eq("id", cleanedProductId)
      .maybeSingle();

    if (error) {
      console.error("Supabase hatası:", error);
      return bot.sendMessage(
        chatId,
        "❌ Veritabanı sorgulanırken hata oluştu. Lütfen daha sonra tekrar deneyin.",
        backToMainMenu
      );
    }

    if (!data) {
      return bot.sendMessage(
        chatId,
        `❌ ${cleanedProductId} ID'li ürün envanterde bulunamadı.`,
        backToMainMenu
      );
    }

    // Get ebujiteri data if product exists
    const { data: ebujteriData } = await supabase
      .from("ebujiteri")
      .select("shopier_id")
      .eq("id", data.id)
      .maybeSingle();

    data.ebujiteri = ebujteriData;

    // Send the stock information with quick action buttons
    const hasShopierData =
      data.ebujiteri &&
      data.ebujiteri.shopier_id &&
      data.ebujiteri.shopier_id !== "null";
    const stockInfo = `📊 **Stok Bilgisi**:

**Ürün ID**: ${data.id}
**Miktar**: ${data.quantity} adet
**Shopier ID**: ${hasShopierData ? data.ebujiteri.shopier_id : "Yok"}
**Shopier URL**: ${
      hasShopierData
        ? `[Aç](https://shopier.com/${data.ebujiteri.shopier_id})`
        : "Yok"
    }`;

    const quickActionMenu = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ Stok Ekle", callback_data: `quick_add_${data.id}` },
            { text: "➖ Stok Çıkar", callback_data: `quick_sub_${data.id}` },
          ],
          [{ text: "🔙 Ana Menüye Dön", callback_data: "main_menu" }],
        ],
      },
      parse_mode: "Markdown",
    };

    return bot.sendMessage(chatId, stockInfo, quickActionMenu);
  } catch (error) {
    console.error("Error in handleStockCommand:", error);
    return bot.sendMessage(
      chatId,
      "❌ Ürün stok bilgisi alınırken hata oluştu. Lütfen daha sonra tekrar deneyin.",
      backToMainMenu
    );
  }
}

/**
 * Handle the /update command to update stock quantity
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Telegram chat ID
 * @param {string} productId - Product ID to update
 * @param {string} amountStr - Amount string with +/- prefix
 * @param {Object} supabase - Supabase client instance
 */
async function updateStock(cleanedProductId, amount, action, supabase) {
  const { data: product, error: productError } = await supabase
    .from("stock")
    .select("id, quantity")
    .eq("id", cleanedProductId)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) throw new Error(`Ürün bulunamadı: ${cleanedProductId}`);

  const newQuantity =
    action === "add" ? product.quantity + amount : product.quantity - amount;
  if (action === "sub" && newQuantity < 0)
    throw new Error(`Yeterli stok yok: ${product.quantity}`);

  const { error: updateError } = await supabase
    .from("stock")
    .update({ quantity: newQuantity })
    .eq("id", cleanedProductId);
  if (updateError) throw updateError;

  const actionText = action === "add" ? "eklendi" : "çıkarıldı";
  const successMessage = `✅ **Stok Güncellendi!**\n\n**Ürün ID**: ${product.id}\n**İşlem**: ${amount} adet ${actionText}\n**Yeni Miktar**: ${newQuantity}`;

  return { success: true, message: successMessage };
}

// Error handling will be managed by callers

async function handleUpdateCommand(
  bot,
  chatId,
  productId,
  amountStr,
  supabase
) {
  if (!productId || productId.trim().length === 0) {
    return bot.sendMessage(chatId, "❌ Geçersiz ürün ID.", backToMainMenu);
  }

  const cleanedProductId = cleanProductId(productId);
  const sign = amountStr[0];
  const amount = parseInt(amountStr.substring(1));
  if (isNaN(amount) || amount <= 0 || (sign !== "+" && sign !== "-")) {
    return bot.sendMessage(
      chatId,
      "❌ Geçersiz miktar veya format.",
      backToMainMenu
    );
  }

  const action = sign === "+" ? "add" : "sub";
  try {
    const result = await updateStock(
      cleanedProductId,
      amount,
      action,
      supabase
    );
    await bot.sendMessage(chatId, result.message, {
      parse_mode: "Markdown",
      ...postUpdateMenu(cleanedProductId),
    });
  } catch (error) {
    console.error("Stok güncelleme hatası:", error);
    const errorMessage = `❌ ${
      error.message || "İşlem sırasında hata oluştu."
    }`;
    await bot.sendMessage(chatId, errorMessage, backToMainMenu);
  }
}

/**
 * Handle the /add command to add stock
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Telegram chat ID
 * @param {string} productId - Product ID to update
 * @param {string|number} amount - Amount to add (optional, defaults to 1)
 * @param {Object} supabase - Supabase client instance
 */
async function handleAddCommand(bot, chatId, productId, amount, supabase) {
  const amountToAdd = amount ? parseInt(amount) : 1;

  if (!productId || productId.trim().length === 0) {
    return bot.sendMessage(chatId, "❌ Geçersiz ürün ID.", backToMainMenu);
  }

  if (isNaN(amountToAdd) || amountToAdd <= 0) {
    return bot.sendMessage(chatId, "❌ Geçersiz miktar.", backToMainMenu);
  }

  const cleanedProductId = cleanProductId(productId);
  try {
    const result = await updateStock(
      cleanedProductId,
      amountToAdd,
      "add",
      supabase
    );
    await bot.sendMessage(chatId, result.message, {
      parse_mode: "Markdown",
      ...postUpdateMenu(cleanedProductId),
    });
  } catch (error) {
    console.error("Stok güncelleme hatası:", error);
    const errorMessage = `❌ ${
      error.message || "İşlem sırasında hata oluştu."
    }`;
    await bot.sendMessage(chatId, errorMessage, backToMainMenu);
  }
}

/**
 * Handle the /sub command to sub stock
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Telegram chat ID
 * @param {string} productId - Product ID to update
 * @param {string|number} amount - Amount to sub (optional, defaults to 1)
 * @param {Object} supabase - Supabase client instance
 */
async function handleSubtractCommand(bot, chatId, productId, amount, supabase) {
  const amountToSubtract = amount ? parseInt(amount) : 1;

  if (!productId || productId.trim().length === 0) {
    return bot.sendMessage(chatId, "❌ Geçersiz ürün ID.", backToMainMenu);
  }

  if (isNaN(amountToSubtract) || amountToSubtract <= 0) {
    return bot.sendMessage(chatId, "❌ Geçersiz miktar.", backToMainMenu);
  }

  const cleanedProductId = cleanProductId(productId);
  try {
    const result = await updateStock(
      cleanedProductId,
      amountToSubtract,
      "sub",
      supabase
    );
    await bot.sendMessage(chatId, result.message, {
      parse_mode: "Markdown",
      ...postUpdateMenu(cleanedProductId),
    });
  } catch (error) {
    console.error("Stok güncelleme hatası:", error);
    const errorMessage = `❌ ${
      error.message || "İşlem sırasında hata oluştu."
    }`;
    await bot.sendMessage(chatId, errorMessage, backToMainMenu);
  }
}

module.exports = {
  handleStockCommand,
  handleUpdateCommand,
  handleAddCommand,
  handleSubtractCommand,
  cleanProductId,
  updateStock,
};
