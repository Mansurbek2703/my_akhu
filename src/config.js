const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  domain: process.env.DOMAIN || 'my.akhu.uz',
  baseUrl: process.env.BASE_URL || 'https://my.akhu.uz',
  dbPath: process.env.DATABASE_PATH || path.join(__dirname, '../data/akhu_talabalar.db'),
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8749111682:AAHbYXMyb6TBgeLXo6E2DCE_jUQM7ogJy50',
    botUsername: process.env.TELEGRAM_BOT_USERNAME || 'akhu_talabalar_bot',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '@akhu_talabalar_news'
  },
  secrets: {
    jwt: process.env.JWT_SECRET || 'akhu_talabalar_jwt_secret_2026',
    qrHmac: process.env.QR_HMAC_SECRET || 'akhu_qr_hmac_secret_key_al_xorazmiy_2026',
    dataEncryption: process.env.DATA_ENCRYPTION_KEY || 'akhu_data_aes256_key_32chars!',
    tvToken: process.env.TV_ACCESS_TOKEN || 'akhu_tv_display_token_2026_xyz'
  },
  uploadDir: path.join(__dirname, '../uploads'),
  timeZone: 'Asia/Tashkent'
};
