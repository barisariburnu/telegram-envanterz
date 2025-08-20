/**
 * Menu definitions for the Telegram bot
 * Contains inline keyboard layouts for different bot functionalities
 */

// Main menu with primary options
const mainMenu = {
  reply_markup: {
    inline_keyboard: [
      [{ text: "📊 Stok İşlemleri", callback_data: "quick_actions" }],
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
      [{ text: "🔙 Ana Menü", callback_data: "main_menu" }],
    ],
  },
};

function postUpdateMenu(productId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "➕ Ekle", callback_data: `quick_add_${productId}` },
          { text: "➖ Çıkar", callback_data: `quick_sub_${productId}` },
        ],
        [
          {
            text: "📊 Stok Görüntüle",
            callback_data: `view_stock_${productId}`,
          },
          { text: "🏠 Ana Menü", callback_data: "main_menu" },
        ],
      ],
    },
  };
}

module.exports = {
  mainMenu,
  backToMainMenu,
  postUpdateMenu,
};
