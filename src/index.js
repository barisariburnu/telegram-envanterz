require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const { mainMenu } = require('./menus');
const { isAuthorized } = require('./auth');
const { handleStockCommand, handleUpdateCommand } = require('./commands');
const { handleCallbackQuery } = require('./callbacks');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

console.log('Bot is starting...');

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, 'Bu botu kullanma yetkiniz yok.');
  }
  
  await bot.sendMessage(
    chatId,
    'Merhaba! Envanter Yönetim Botuna Hoş Geldin! Lütfen bir seçenek seç:',
    mainMenu
  );
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, 'Bu botu kullanma yetkiniz yok.');
  }
  
  bot.sendMessage(
    chatId,
    'Kullanılabilir komutlar:\n\n' +
    '/start - Ana menüyü göster\n' +
    '/help - Bu yardım mesajını göster\n' +
    '/stock <product_id> - Ürün stok seviyesini kontrol et\n' +
    '/add <product_id> <amount> - Ürün stok miktarını ekle\n' +
    '/subtract <product_id> <amount> - Ürün stok miktarını çıkar'
  );
});

// Handle /stock command
bot.onText(/\/stock (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, 'Bu botu kullanma yetkiniz yok.');
  }
  
  const productId = match[1].trim();
  handleStockCommand(bot, chatId, productId, supabase);
});

// Handle /add command
bot.onText(/\/add (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, 'Bu botu kullanma yetkiniz yok.');
  }
  
  const productId = match[1].trim();
  const amountStr = '+' + match[2].trim();
  handleUpdateCommand(bot, chatId, productId, amountStr, supabase);
});

// Handle /subtract command
bot.onText(/\/subtract (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  if (!isAuthorized(userId)) {
    return bot.sendMessage(chatId, 'Bu botu kullanma yetkiniz yok.');
  }
  
  const productId = match[1].trim();
  const amountStr = '-' + match[2].trim();
  handleUpdateCommand(bot, chatId, productId, amountStr, supabase);
});

// Handle callback queries (button clicks)
bot.on('callback_query', async (callbackQuery) => {
  const userId = callbackQuery.from.id;
  
  if (!isAuthorized(userId)) {
    return bot.answerCallbackQuery(callbackQuery.id, 'Bu botu kullanma yetkiniz yok.');
  }
  
  await handleCallbackQuery(bot, callbackQuery, supabase);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot is running...');