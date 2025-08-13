/**
 * Command handlers for the Telegram bot
 * Implements logic for /stock and /update commands
 */

const { backToMainMenu, createConfirmationMenu } = require('./menus');

/**
 * Clean product ID by removing prefixes and suffixes
 * @param {string} productId - Raw product ID
 * @returns {string} - Cleaned product ID
 */
function cleanProductId(productId) {
  if (!productId) return '';
  
  let cleaned = productId.trim().toUpperCase();
  
  // Remove AF- prefix and -BTY suffix (AF-PRODUCTID-BTY format)
  if (cleaned.startsWith('AF-') && cleaned.endsWith('-BTY')) {
    cleaned = cleaned.substring(3, cleaned.length - 4);
  }
  // Remove -G suffix (PRODUCTID-G format)
  else if (cleaned.endsWith('-G')) {
    cleaned = cleaned.substring(0, cleaned.length - 2);
  }
  
  return cleaned;
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
        '❌ Geçersiz ürün ID. Lütfen geçerli bir ürün ID girin.',
        backToMainMenu
      );
    }

    // Clean the product ID
    const cleanedProductId = cleanProductId(productId);

    // Query the stock table with join to ebujiteri table
    const { data, error } = await supabase
      .from('stock')
      .select(`
        id, 
        quantity
      `)
      .eq('id', cleanedProductId)
      .single();

    if (data && !error) {
      const { data: ebujteriData } = await supabase
        .from('ebujiteri')
        .select('shopier_id')
        .eq('id', data.id)
        .single();
      
      data.ebujiteri = ebujteriData;
    }

    if (error) {
      console.error('Supabase hatası:', error);
      return bot.sendMessage(
        chatId, 
        '❌ Veritabanı sorgulanırken hata oluştu. Lütfen daha sonra tekrar deneyin.',
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

    // Send the stock information with quick action buttons
    const stockInfo = `📊 Stok Bilgisi:

Ürün ID: ${data.id}
Shopier ID: ${data.ebujiteri ? data.ebujiteri.shopier_id : 'N/A'}
Miktar: ${data.quantity}
Shopier URL: ${data.ebujiteri ? `https://shopier.com/${data.ebujiteri.shopier_id}` : 'N/A'}`;

    const quickActionMenu = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "➕ Stok Ekle", callback_data: `quick_add_${data.id}` },
            { text: "➖ Stok Çıkar", callback_data: `quick_sub_${data.id}` }
          ],
          [
            { text: "🔙 Ana Menüye Dön", callback_data: "main_menu" }
          ]
        ]
      }
    };

    return bot.sendMessage(
      chatId,
      stockInfo,
      quickActionMenu
    );
  } catch (error) {
    console.error('Error in handleStockCommand:', error);
    return bot.sendMessage(
      chatId,
      '❌ Ürün stok bilgisi alınırken hata oluştu. Lütfen daha sonra tekrar deneyin.',
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
async function handleUpdateCommand(bot, chatId, productId, amountStr, supabase) {
  try {
    // Validate product ID (now accepts alphanumeric strings)
    if (!productId || productId.trim().length === 0) {
      return bot.sendMessage(
        chatId, 
        '❌ Geçersiz ürün ID. Lütfen geçerli bir ürün ID girin.',
        backToMainMenu
      );
    }

    // Clean the product ID
    const cleanedProductId = cleanProductId(productId);

    // Parse the amount
    const isAddition = amountStr.startsWith('+');
    const isSubtraction = amountStr.startsWith('-');
    
    if (!isAddition && !isSubtraction) {
      return bot.sendMessage(
        chatId,
        '❌ Geçersiz miktar formatı. Stok eklemek için /add, çıkarmak için /sub komutunu kullanın.',
        backToMainMenu
      );
    }

    const amount = parseInt(amountStr.substring(1));
    
    if (isNaN(amount) || amount <= 0) {
      return bot.sendMessage(
        chatId,
        '❌ Geçersiz miktar. Lütfen pozitif bir sayı girin.',
        backToMainMenu
      );
    }

    // Check if product exists    
      const { data: product, error: productError } = await supabase
      .from('stock')
      .select(`
        id, 
        quantity
      `)
      .eq('id', cleanedProductId)
      .single();

    if (product && !productError) {
      const { data: ebujteriData } = await supabase
        .from('ebujiteri')
        .select('shopier_id')
        .eq('id', product.id)
        .single();
      
      product.ebujiteri = ebujteriData;
    }

    if (productError || !product) {
      return bot.sendMessage(
        chatId,
        `❌ ${cleanedProductId} ID'li ürün envanterde bulunamadı.`,
        backToMainMenu
      );
    }

    // For subtraction, check if there's enough stock
    if (isSubtraction && product.quantity < amount) {
      return bot.sendMessage(
        chatId,
        `❌ Yeterli stok yok. Mevcut miktar: ${product.quantity}.`,
        backToMainMenu
      );
    }

    // Calculate new quantity
    const newQuantity = isAddition 
      ? product.quantity + amount 
      : product.quantity - amount;

    // Update the stock
    const { error: updateError } = await supabase
      .from('stock')
      .update({ quantity: newQuantity })
      .eq('id', cleanedProductId);

    if (updateError) {
      console.error('Supabase güncelleme hatası:', updateError);
      return bot.sendMessage(
        chatId,
        '❌ Veritabanı güncellenirken hata oluştu. Lütfen daha sonra tekrar deneyin.',
        backToMainMenu
      );
    }

    // Send success message
    const action = isAddition ? 'eklendi' : 'çıkarıldı';
    const successMessage = `✅ Envanter başarıyla güncellendi!

Ürün ID: ${product.id}
İşlem: ${amount} adet ürün ${action}
Yeni Miktar: ${newQuantity}`;

    return bot.sendMessage(
      chatId,
      successMessage,
      backToMainMenu
    );
  } catch (error) {
    console.error('Error in handleUpdateCommand:', error);
    return bot.sendMessage(
      chatId,
      '❌ Ürün stok güncellenirken hata oluştu. Lütfen daha sonra tekrar deneyin.',
      backToMainMenu
    );
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
  
  if (isNaN(amountToAdd) || amountToAdd <= 0) {
    return bot.sendMessage(
      chatId,
      '❌ Geçersiz miktar. Lütfen pozitif bir sayı girin.',
      backToMainMenu
    );
  }
  
  return handleUpdateCommand(bot, chatId, productId, `+${amountToAdd}`, supabase);
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
  
  if (isNaN(amountToSubtract) || amountToSubtract <= 0) {
    return bot.sendMessage(
      chatId,
      '❌ Geçersiz miktar. Lütfen pozitif bir sayı girin.',
      backToMainMenu
    );
  }
  
  return handleUpdateCommand(bot, chatId, productId, `-${amountToSubtract}`, supabase);
}

module.exports = {
  handleStockCommand,
  handleUpdateCommand,
  handleAddCommand,
  handleSubtractCommand,
  cleanProductId
};