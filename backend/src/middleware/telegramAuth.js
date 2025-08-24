const crypto = require('crypto');

// Проверка Telegram initData по документации WebApp
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
function validateInitData(initData, botToken) {
  try {
    if (!initData || !botToken) return false;
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return false;

    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.keys())
      .sort()
      .map((key) => `${key}=${urlParams.get(key)}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calcHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calcHash === hash;
  } catch (e) {
    return false;
  }
}

function telegramAuthMiddleware(req, res, next) {
  try {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    const initData = req.get('X-Telegram-Init-Data');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN не установлен — пропуск проверки initData');
      return next();
    }

    if (!initData) {
      return res.status(401).json({ success: false, error: 'Missing Telegram init data' });
    }

    if (!validateInitData(initData, botToken)) {
      return res.status(401).json({ success: false, error: 'Invalid Telegram init data' });
    }

    next();
  } catch (error) {
    console.error('Ошибка проверки Telegram initData:', error);
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

module.exports = telegramAuthMiddleware;
