const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  domain: process.env.DOMAIN || 'my.akhu.uz',
  baseUrl: process.env.BASE_URL || 'https://my.akhu.uz',
  dbPath: process.env.DATABASE_PATH || path.join(__dirname, '../data/akhu_talabalar.db'),
  usePostgres: process.env.USE_POSTGRES !== 'false',
  pg: {
    host: process.env.PG_HOST || (process.env.NODE_ENV === 'production' ? '127.0.0.1' : '192.168.1.2'),
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    database: process.env.PG_DATABASE || 'akhu_rating',
    user: process.env.PG_USER || 'akhu_admin',
    password: process.env.PG_PASSWORD || 'AkhuAdmin2026!'
  },
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
  hikcentral: {
    enabled: process.env.HIKCENTRAL_ENABLED === 'True' || process.env.HIKCENTRAL_ENABLED === 'true',
    host: process.env.HIKCENTRAL_HOST || 'https://172.20.20.8',
    appKey: process.env.HIKCENTRAL_APP_KEY || '35525590',
    appSecret: process.env.HIKCENTRAL_APP_SECRET || 'KkW8WbxTG5X6S9bSN3BU',
    verifySsl: process.env.HIKCENTRAL_VERIFY_SSL === 'True' || process.env.HIKCENTRAL_VERIFY_SSL === 'true'
  },
  uploadDir: path.join(__dirname, '../uploads'),
  timeZone: 'Asia/Tashkent'
};
