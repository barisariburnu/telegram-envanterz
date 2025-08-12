/**
 * Command handlers for the Telegram bot
 * Implements logic for /stock and /update commands
 */

const { backToMainMenu, createConfirmationMenu } = require('./menus');

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
    const cleanProductId = productId.trim().toUpperCase();

    // Query the stock table with join to ebujiteri table
    const { data, error } = await supabase
      .from('stock')
      .select(`
        id, 
        quantity
      `)
      .eq('id', cleanProductId)
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
        `❌ ${cleanProductId} ID'li ürün envanterde bulunamadı.`,
        backToMainMenu
      );
    }

    // Send the stock information
    const stockInfo = `📊 Stok Bilgisi:

Ürün ID: ${data.id}
Shopier ID: ${data.ebujiteri ? data.ebujiteri.shopier_id : 'N/A'}
Miktar: ${data.quantity}
Shopier URL: ${data.ebujiteri ? `https://shopier.com/${data.ebujiteri.shopier_id}` : 'N/A'}`;

    return bot.sendMessage(
      chatId,
      stockInfo,
      backToMainMenu
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
    const cleanProductId = productId.trim().toUpperCase();

    // Parse the amount
    const isAddition = amountStr.startsWith('+');
    const isSubtraction = amountStr.startsWith('-');
    
    if (!isAddition && !isSubtraction) {
      return bot.sendMessage(
        chatId,
        '❌ Geçersiz miktar formatı. Stok eklemek için /add, çıkarmak için /subtract komutunu kullanın.',
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
      .eq('id', cleanProductId)
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
        `❌ ${cleanProductId} ID'li ürün envanterde bulunamadı.`,
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
      .eq('id', cleanProductId);

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

module.exports = {
  handleStockCommand,
  handleUpdateCommand
};