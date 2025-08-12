/**
 * Menu definitions for the Telegram bot
 * Contains inline keyboard layouts for different bot functionalities
 */

// Main menu with primary options
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "📊 Stok Kontrol", callback_data: "check_stock" }],
      [
        { text: "➕ Stok Ekle", callback_data: "add_stock" },
        { text: "➖ Stok Çıkar", callback_data: "subtract_stock" },
      ],
    ],
  },
};

/**
 * Create a back to main menu button
 * @returns {Object} Telegram inline keyboard markup
 */
const backToMainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔙 Ana Menüye Dön", callback_data: "main_menu" }],
    ],
  },
};

/**
 * Create a confirmation menu for stock updates
 * @param {string} action - The action being confirmed (add/subtract)
 * @param {string} productId - The product ID being updated
 * @param {number} amount - The amount to update
 * @returns {Object} Telegram inline keyboard markup
 */
function createConfirmationMenu(action, productId, amount) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "✅ Onayla",
            callback_data: `confirm_${action}_${productId}_${amount}`,
          },
          {
            text: "❌ İptal",
            callback_data: "main_menu",
          },
        ],
      ],
    },
  };
}

module.exports = {
  mainMenu,
  backToMainMenu,
  createConfirmationMenu,
};
