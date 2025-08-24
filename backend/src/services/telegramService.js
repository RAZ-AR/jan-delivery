const { Telegraf, Markup } = require('telegraf');

class TelegramService {
  constructor() {
    this.bot = null;
    this.webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    this.webAppUrl = process.env.WEB_APP_URL;
    this.adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
    this.initBot();
  }

  initBot() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN не установлен');
      return;
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    // Команды
    this.setupCommands();

    // Webhook
    if (this.webhookUrl) {
      this.bot.telegram.setWebhook(`${this.webhookUrl}/webhook`).then(() => {
        console.log('✅ Telegram webhook установлен');
      }).catch(err => console.error('❌ Ошибка установки webhook:', err));
    } else {
      console.warn('⚠️ TELEGRAM_WEBHOOK_URL не установлен');
    }
  }

  webhookCallback() {
    if (!this.bot) return (req, res) => res.sendStatus(200);
    return this.bot.webhookCallback('/webhook');
  }

  setupCommands() {
    if (!this.bot) return;

    // /start с выбором языка и WebApp кнопкой
    this.bot.start(async (ctx) => {
      const firstName = ctx.from?.first_name || 'there';
      const langKeyboard = Markup.inlineKeyboard([
        [Markup.button.callback('EN', 'lang_en'), Markup.button.callback('SR', 'lang_sr'), Markup.button.callback('RU', 'lang_ru')],
        [Markup.button.webApp('🍽️ Open Menu', this.webAppUrl)]
      ]);

      await ctx.reply(`Welcome, ${firstName}! Choose language and open the menu:`, langKeyboard);
    });

    // Языковые коллбеки (демо, хранение в session не делаем)
    this.bot.action(/lang_(en|sr|ru)/, async (ctx) => {
      const chosen = ctx.match[1];
      const map = { en: 'English', sr: 'Srpski', ru: 'Русский' };
      await ctx.answerCbQuery(`Language set: ${map[chosen]}`);
    });

    // Админская смена статуса: /status <orderId> <status>
    this.bot.hears(/^\/status\s+(\S+)\s+(\S+)/, async (ctx) => {
      if (!this.isAdmin(ctx.from?.id)) return;
      const orderId = ctx.match[1];
      const status = ctx.match[2];
      try {
        // Ленивый импорт, чтобы избежать циклов
        const orderService = require('./orderService');
        const order = await orderService.updateOrderStatus(orderId, status);
        await ctx.reply(`✅ Status updated: ${orderId} → ${status}`);
      } catch (e) {
        await ctx.reply(`❌ Failed to update: ${e.message}`);
      }
    });

    console.log('✅ Telegram команды настроены (Telegraf)');
  }

  isAdmin(userId) {
    if (!userId) return false;
    return this.adminIds.includes(String(userId));
  }

  // Отправка уведомлений
  async sendOrderNotification(userId, orderData) {
    if (!this.bot) return;
    try {
      const message = `🎉 Ваш заказ принят!\n\n` +
        `📋 Заказ #${orderData.id}\n` +
        `💰 Сумма: ${orderData.total} RSD\n` +
        `📍 Адрес: ${orderData.address}\n` +
        `⏱️ Время доставки: ${orderData.estimatedDelivery}`;
      await this.bot.telegram.sendMessage(userId, message);
    } catch (e) {
      console.error('Ошибка отправки уведомления:', e.message);
    }
  }

  async sendStatusUpdate(userId, orderData) {
    if (!this.bot) return;
    try {
      const statusMessages = {
        'confirmed': '✅ Ваш заказ подтвержден и готовится',
        'cooking': '👨‍🍳 Ваш заказ готовится',
        'ready': '📦 Ваш заказ готов и передан курьеру',
        'delivering': '🚗 Курьер уже в пути к вам',
        'delivered': '🎉 Заказ доставлен! Приятного аппетита!'
      };
      const message = `📋 Заказ #${orderData.id}\n${statusMessages[orderData.status] || 'Статус заказа обновлен'}`;
      await this.bot.telegram.sendMessage(userId, message);
    } catch (e) {
      console.error('Ошибка отправки статуса:', e.message);
    }
  }
}

module.exports = new TelegramService();

