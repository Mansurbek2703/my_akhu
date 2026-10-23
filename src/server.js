const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { initSchema } = require('./db/database');
const { initBackgroundJobs } = require('./services/cronService');
const { handleTelegramWebhook, startTelegramPolling } = require('./services/telegramService');

// Initialize Database Schema if not exists
initSchema();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static frontend assets
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/app', require('./routes/appRoutes'));
app.use('/api/tutor', require('./routes/tutorRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/observe', require('./routes/observeRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

// Telegram Bot Webhook endpoint
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await handleTelegramWebhook(req.body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(200).send('OK'); // Telegram expects 200 always
  }
});

// HTML Pages Routing
app.get('/miniapp', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/miniapp.html'));
});

// TV Screen Route: Barcha login qilgan xodimlar va maxsus token uchun ruxsat
app.get('/tv', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/tv.html'));
});

// Brauzerdan tadbir check-in ga kirishga urinishlarni butunlay to'sish (hech narsa ochilmasligi kerak)
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (p === '/checkin' || p === '/event/checkin' || p === '/qr-checkin' || (p.startsWith('/events/') && p.endsWith('/checkin'))) {
    return res.status(403).send('Kirish taqiqlangan! Tadbir QR kodini faqat Telegram Mini App ichidagi skaner orqali o\'qish mumkin.');
  }
  next();
});

// SPA Fallback to index.html (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Background Jobs (recalculate scores, cron)
initBackgroundJobs();

// Start Telegram Polling (ensures bot responds immediately to all users)
startTelegramPolling();

// Start Server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏛️ AKHU TALABALAR TIZIMI (1-BOSQICH) ISHGA TUSHDI!`);
  console.log(`🌐 Server manzili: http://0.0.0.0:${config.port}`);
  console.log(`📊 Kuzatuv va Boshqaruv: http://localhost:${config.port}/`);
  console.log(`📱 Telegram Mini App:    http://localhost:${config.port}/miniapp`);
  console.log(`📺 Katta Ekran (TV):     http://localhost:${config.port}/tv?token=${config.secrets.tvToken}`);
  console.log(`🤖 Telegram Bot Webhook: http://localhost:${config.port}/api/telegram/webhook`);
  console.log(`====================================================`);
});

module.exports = { app, server };
