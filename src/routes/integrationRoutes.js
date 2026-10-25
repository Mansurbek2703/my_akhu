const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { db } = require('../db/database');
const config = require('../config');
const {
  generateEventQrDataUrl,
  generateEventQrPayload,
  checkinStudentQr
} = require('../services/qrService');
const { syncEventsFromKpi, KPI_CONFIG } = require('../services/kpiEventService');

/**
 * KPI Tizimini autentifikatsiya qilish middleware-i
 * Bearer token yoki ?token= query parametri orqali tekshiradi
 */
function authenticateKpiSystem(req, res, next) {
  const expectedToken = KPI_CONFIG.apiToken;
  let clientToken = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    clientToken = authHeader.slice(7).trim();
  } else if (req.query.token) {
    clientToken = String(req.query.token).trim();
  } else if (req.headers['x-api-key']) {
    clientToken = String(req.headers['x-api-key']).trim();
  }

  if (!clientToken || clientToken !== expectedToken) {
    return res.status(401).json({
      error: 'Avtorizatsiya rad etildi. KPI API tokeni yaroqsiz yoki ko\'rsatilmagan.'
    });
  }

  next();
}

router.use(authenticateKpiSystem);

/**
 * 1. GET /api/integration/events/:eventId/live-qr
 * Hodimlar platformasi (kpi.akhu.uz) uchun 60 soniyali jonli QR kod
 */
router.get('/:eventId/live-qr', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Tadbir topilmadi' });
    }

    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);
    const closesAt = new Date(endsAt.getTime() + 5 * 60 * 1000);

    const checkinsCount = db.prepare(`SELECT COUNT(*) as cnt FROM checkin WHERE event_id = ?`).get(eventId).cnt;
    const registeredCount = db.prepare(`SELECT COUNT(*) as cnt FROM event_registration WHERE event_id = ?`).get(eventId).cnt;

    // Hali boshlanmagan
    if (now < startsAt) {
      return res.json({
        status: 'not_started',
        is_active: false,
        message: 'Tadbir davomati hali boshlanmagan. Davomat tadbir boshlanish vaqtida ochiladi.',
        event_id: event.id,
        event_title: event.title,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        closes_at: closesAt.toISOString(),
        time_until_start_seconds: Math.max(0, Math.round((startsAt - now) / 1000)),
        stats: {
          registered_count: registeredCount,
          checkins_count: checkinsCount
        }
      });
    }

    // Tugagan (ends_at + 5 daqiqa o'tib ketgan)
    if (now > closesAt) {
      return res.json({
        status: 'closed',
        is_active: false,
        message: 'Tadbir davomat vaqti yakunlangan (tadbirdan keyingi 5 daqiqalik qo\'shimcha vaqt tugagan).',
        event_id: event.id,
        event_title: event.title,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        closes_at: closesAt.toISOString(),
        stats: {
          registered_count: registeredCount,
          checkins_count: checkinsCount
        }
      });
    }

    // Faol: 60 soniyalik QR yaratish
    const qrData = await generateEventQrDataUrl(event.id);
    const directImageUrl = `${config.baseUrl}/api/integration/events/${event.id}/qr.png?token=${encodeURIComponent(KPI_CONFIG.apiToken)}`;

    res.json({
      status: 'active',
      is_active: true,
      event_id: event.id,
      event_title: event.title,
      starts_at: event.starts_at,
      ends_at: event.ends_at,
      closes_at: closesAt.toISOString(),
      refresh_interval_seconds: 60,
      valid_for_seconds: qrData.valid_for_seconds,
      expires_at: qrData.expires_at,
      qr_image_data_url: qrData.dataUrl,
      qr_image_url: directImageUrl,
      qr_raw_payload: JSON.stringify(qrData.payload),
      stats: {
        registered_count: registeredCount,
        checkins_count: checkinsCount
      }
    });
  } catch (err) {
    console.error('[Integration-LiveQR] Xatolik:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. GET /api/integration/events/:eventId/qr.png
 * To'g'ridan-to'g'ri buzilmagan yuqori sifatli PNG rasm oqimi (<img> tegi uchun)
 */
router.get('/:eventId/qr.png', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);

    if (!event) {
      return res.status(404).send('Tadbir topilmadi');
    }

    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);
    const closesAt = new Date(endsAt.getTime() + 5 * 60 * 1000);

    if (now < startsAt || now > closesAt) {
      // Davomat oynasidan tashqarida: ogohlantiruvchi qizil QR
      const warningPayload = JSON.stringify({
        status: now < startsAt ? 'NOT_STARTED' : 'CLOSED',
        event_id: event.id,
        time: now.toISOString()
      });
      const buffer = await QRCode.toBuffer(warningPayload, {
        width: 500,
        margin: 2,
        color: { dark: '#991B1B', light: '#FEE2E2' }
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.send(buffer);
    }

    const payload = generateEventQrPayload(event.id);
    const buffer = await QRCode.toBuffer(JSON.stringify(payload), {
      width: 500,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0F172A', light: '#FFFFFF' }
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
    res.send(buffer);
  } catch (err) {
    console.error('[Integration-QRPng] Xatolik:', err.message);
    res.status(500).send('QR rasm yaratishda xatolik');
  }
});

/**
 * 3. POST /api/integration/events/:eventId/scan-student-qr
 * Hodimlar platformasi orqali talabaning shaxsiy QR kodini skanerlaganda chaqiriladi
 */
router.post('/:eventId/scan-student-qr', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { qr_payload, staff_id, staff_name } = req.body;

    if (!qr_payload) {
      return res.status(400).json({ error: 'qr_payload parametri yuborilmadi' });
    }

    const staffUser = {
      id: staff_id || 'kpi_staff',
      full_name: staff_name || 'KPI Hodim',
      name: staff_name || 'KPI Hodim'
    };

    const ip = req.ip || '127.0.0.1';
    const result = checkinStudentQr(staffUser, eventId, qr_payload, ip);

    res.json({
      success: true,
      message: 'Davomat muvaffaqiyatli qabul qilindi!',
      ...result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

/**
 * 4. GET /api/integration/events/:eventId/attendance-stats
 * Tadbirning real vaqtdagi davomat va ro'yxatdan o'tganlar statistikasi
 */
router.get('/:eventId/attendance-stats', (req, res) => {
  try {
    const { eventId } = req.params;
    const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Tadbir topilmadi' });
    }

    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);
    const closesAt = new Date(endsAt.getTime() + 5 * 60 * 1000);
    const isWindowOpen = (now >= startsAt && now <= closesAt);

    // Check-in qilganlar ro'yxati
    const checkins = db.prepare(`
      SELECT chk.id as checkin_id, chk.at as checked_in_at, chk.mode, chk.scanned_by,
             st.id as student_id, st.external_id, st.first_name, st.last_name,
             st.group_code, st.program_code, st.course, st.photo_url
      FROM checkin chk
      JOIN student st ON chk.student_id = st.id
      WHERE chk.event_id = ?
      ORDER BY chk.at DESC
    `).all(eventId);

    // Ro'yxatdan o'tganlar ro'yxati
    const registered = db.prepare(`
      SELECT reg.id as registration_id, reg.registered_at, reg.waitlist_pos,
             st.id as student_id, st.external_id, st.first_name, st.last_name,
             st.group_code, st.course, st.photo_url,
             CASE WHEN chk.id IS NOT NULL THEN 1 ELSE 0 END as is_checked_in,
             chk.at as checked_in_at
      FROM event_registration reg
      JOIN student st ON reg.student_id = st.id
      LEFT JOIN checkin chk ON chk.event_id = reg.event_id AND chk.student_id = reg.student_id
      WHERE reg.event_id = ?
      ORDER BY reg.registered_at ASC
    `).all(eventId);

    res.json({
      event: {
        id: event.id,
        title: event.title,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        closes_at: closesAt.toISOString(),
        is_attendance_active: isWindowOpen,
        capacity: event.capacity,
        points: event.points
      },
      summary: {
        registered_count: registered.length,
        checkins_count: checkins.length,
        attendance_percentage: registered.length > 0 ? Math.round((checkins.length / registered.length) * 100) : 0
      },
      checkins,
      registered
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. POST /api/integration/events/sync
 * Qo'lda darhol KPI bilan sinxronlashni chaqirish
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await syncEventsFromKpi();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
