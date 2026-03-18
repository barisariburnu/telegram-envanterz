/**
 * Command handlers for the Telegram bot
 * Implements logic for /stock and /update commands
 */

const { backToMainMenu, postUpdateMenu } = require("./menus");
const { query, queryOne, toggleHolidayMode } = require("./db");

/**
 * Clean product ID by removing prefixes and suffixes
 * Supported formats:
 * - PRODUCTID
 * - AF-PRODUCTID-BTY
 * - PRODUCTID-G
 * - AFB-PRODUCTID
 * @param {string} productId - Raw product ID
 * @returns {string} - Cleaned product ID
 */
function cleanProductId(productId) {
  if (!productId) return "";
  return productId
    .trim()
    .toUpperCase()
    .replace(/^AF-(.*)-BTY$/, "$1")
    .replace(/^AFB-(.*)$/, "$1")
    .replace(/-G$/, "");
}

/**
 * Handle the /stock command to check stock level
 * @param {Object} bot - Telegram bot instance
 * @param {number} chatId - Telegram chat ID
 * @param {string} productId - Product ID to check
 */
async function handleStockCommand(bot, chatId, productId) {
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

    // Query the products table using sku field
    const data = await queryOne(
      "SELECT sku, physical_stock FROM products WHERE sku = $1",
      [cleanedProductId]
    );

    if (!data) {
      return bot.sendMessage(
        chatId,
        `❌ ${cleanedProductId} SKU'lu ürün envanterde bulunamadı.`,
        backToMainMenu
      );
    }

    // Send the stock information with quick action buttons
    const stockInfo = `📊 **Stok Bilgisi**:

**Ürün SKU**: ${data.sku}
**Fiziksel Stok**: ${data.physical_stock} adet`;

    const quickActionMenu = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ Stok Ekle", callback_data: `quick_add_${data.sku}` },
            { text: "➖ Stok Çıkar", callback_data: `quick_sub_${data.sku}` },
          ],
          [{ text: "🔙 Ana Menü", callback_data: "main_menu" }],
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
 * @param {string} cleanedProductId - Cleaned product SKU
 * @param {number} amount - Amount to add/subtract
 * @param {string} action - 'add' or 'sub'
 */
async function updateStock(cleanedProductId, amount, action) {
  const product = await queryOne(
    "SELECT sku, physical_stock FROM products WHERE sku = $1",
    [cleanedProductId]
  );

  if (!product) throw new Error(`Ürün bulunamadı: ${cleanedProductId}`);

  const newQuantity =
    action === "add" ? product.physical_stock + amount : product.physical_stock - amount;
  if (action === "sub" && newQuantity < 0)
    throw new Error(`Yeterli stok yok: ${product.physical_stock}`);

  await query(
    "UPDATE products SET physical_stock = $1 WHERE sku = $2",
    [newQuantity, cleanedProductId]
  );

  const actionText = action === "add" ? "eklendi" : "çıkarıldı";
  const successMessage = `✅ **Stok Güncellendi!**\n\n**Ürün SKU**: ${product.sku}\n**İşlem**: ${amount} adet ${actionText}\n**Yeni Miktar**: ${newQuantity}`;

  return { success: true, message: successMessage };
}

// Error handling will be managed by callers

async function handleUpdateCommand(
  bot,
  chatId,
  productId,
  amountStr
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
      action
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
 */
async function handleAddCommand(bot, chatId, productId, amount) {
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
      "add"
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
 */
async function handleSubtractCommand(bot, chatId, productId, amount) {
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
      "sub"
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

async function handleHolidayModeCommand(bot, chatId, action) {
  const value = action === "ac";

  try {
    await toggleHolidayMode(value);
    const statusText = value ? "🏖️ AÇIK" : "✅ KAPALI";

    await bot.sendMessage(
      chatId,
      `Tatil modu ${statusText} olarak ayarlandı.\nFiziki stoklu ürünler senkronizasyon kuyruğuna alındı.`,
      backToMainMenu
    );
  } catch (err) {
    console.error("Tatil modu değiştirme hatası:", err);
    await bot.sendMessage(
      chatId,
      "❌ Tatil modu değiştirilemedi. Lütfen tekrar deneyin.",
      backToMainMenu
    );
  }
}

module.exports = {
  handleStockCommand,
  handleUpdateCommand,
  handleAddCommand,
  handleSubtractCommand,
  handleHolidayModeCommand,
  cleanProductId,
  updateStock,
};
