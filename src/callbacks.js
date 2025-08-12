/**
 * Callback query handlers for the Telegram bot
 * Manages responses to inline keyboard button presses
 */

const { mainMenu, backToMainMenu, createConfirmationMenu } = require('./menus');

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
    if (data === 'main_menu') {
      await bot.editMessageText(
        'Welcome to the Inventory Management Bot! Please select an option:',
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: mainMenu.reply_markup
        }
      );
    } 
    else if (data === 'check_stock') {
      await bot.editMessageText(
        'Stok durumunu kontrol etmek için ürün ID girin:\n\nFormat: `/stock <ürün_id>`\n\nÖrnek: `/stock PROD001`',
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: backToMainMenu.reply_markup
        }
      );
    } 
    else if (data === 'add_stock') {
      await bot.editMessageText(
        'Stok eklemek için ürün ID ve miktarı girin:\n\nFormat: `/add <ürün_id> <miktar>`\n\nÖrnek: `/add PROD001 10`',
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: backToMainMenu.reply_markup
        }
      );
    } 
    else if (data === 'subtract_stock') {
      await bot.editMessageText(
        'Stok çıkarmak için ürün ID ve miktarı girin:\n\nFormat: `/subtract <ürün_id> <miktar>`\n\nÖrnek: `/subtract PROD001 5`',
        {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: 'Markdown',
          reply_markup: backToMainMenu.reply_markup
        }
      );
    }
    else if (data.startsWith('confirm_add_') || data.startsWith('confirm_subtract_')) {
      // Extract product ID and amount from callback data
      const parts = data.split('_');
      const action = parts[1]; // 'add' or 'subtract'
      const productId = parts[2];
      const amount = parseInt(parts[3]);
      
      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('stock')
        .select(`
          id, 
          quantity, 
          name, 
          ebujiteri!inner(shopier_id)
        `)
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return bot.editMessageText(
          `❌ Ürün ID ${productId} bulunamadı.`,
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: backToMainMenu.reply_markup
          }
        );
      }

      // Calculate new quantity
      let newQuantity;
      if (action === 'add') {
        newQuantity = product.quantity + amount;
      } else { // subtract
        // Check if there's enough stock
        if (product.quantity < amount) {
          return bot.editMessageText(
            `❌ Yeterli stok yok. Mevcut miktar: ${product.quantity}.`,
            {
              chat_id: chatId,
              message_id: messageId,
              reply_markup: backToMainMenu.reply_markup
            }
          );
        }
        newQuantity = product.quantity - amount;
      }

      // Update the stock
      const { error: updateError } = await supabase
        .from('stock')
        .update({ quantity: newQuantity })
        .eq('id', productId);

      if (updateError) {
        console.error('Supabase güncelleme hatası:', updateError);
        return bot.editMessageText(
          '❌ Veritabanı güncellenirken hata oluştu. Lütfen daha sonra tekrar deneyin.',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: backToMainMenu.reply_markup
          }
        );
      }

      // Send success message
      const actionText = action === 'add' ? 'eklendi' : 'çıkarıldı';
      const amountText = action === 'add' ? `+${amount}` : `-${amount}`;
      
      const successMessage = `✅ Ürün stok miktarı başarıyla güncellendi!

  Ürün ID: ${product.id}
  Ürün Adı: ${product.name || 'N/A'}
  Miktar: ${amountText} adet ürün ${actionText}
  Yeni Miktar: ${newQuantity}`;
      
      await bot.editMessageText(
        successMessage,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: backToMainMenu.reply_markup
        }
      );
    }
  } catch (error) {
    console.error('Callback sorgusu işlenirken hata oluştu:', error);
    
    // Try to send an error message
    try {
      await bot.editMessageText(
        '❌ Callback sorgusu işlenirken hata oluştu. Lütfen daha sonra tekrar deneyin.',
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: backToMainMenu.reply_markup
        }
      );
    } catch (secondaryError) {
      console.error('Hata mesajı gönderilirken hata oluştu:', secondaryError);
    }
  }
}

module.exports = {
  handleCallbackQuery
};