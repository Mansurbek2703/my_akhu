const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../db/database');
const { generateEventQrDataUrl } = require('../services/qrService');
const { logAudit } = require('../services/pointService');

const LEVEL_POINTS = {
  klub: 3,
  universitet: 5,
  viloyat: 8,
  respublika: 15,
  xalqaro: 25
};

/**
 * GET /api/events
 * Tadbirlar ro'yxati
 */
router.get('/', (req, res) => {
  const events = db.prepare(`
    SELECT ev.*, cc.name as category_name, cc.color as category_color,
           (SELECT COUNT(*) FROM checkin WHERE event_id = ev.id) as checkins_count,
           (SELECT COUNT(*) FROM event_registration WHERE event_id = ev.id) as registered_count
    FROM event ev
    JOIN catalog_category cc ON ev.category_id = cc.id
    ORDER BY ev.starts_at DESC
  `).all();

  res.json({ events });
});

/**
 * POST /api/events
 * B-04 & Q-10: Yangi tadbir yaratish
 */
router.post('/', (req, res) => {
  try {
    const {
      title,
      starts_at,
      ends_at,
      place,
      organizer_unit,
      category_id,
      level,
      capacity,
      requires_registration
    } = req.body;

    if (!title || !starts_at || !ends_at || !place || !category_id || !level) {
      return res.status(400).json({ error: 'Majburiy maydonlar to\'ldirilishi shart' });
    }

    // Q-10: Ball darajadan avtomatik belgilanadi
    const points = LEVEL_POINTS[level] || 5;
    const eventId = 'ev_' + crypto.randomBytes(6).toString('hex');
    const qrSecret = 'sec_' + crypto.randomBytes(12).toString('hex');
    const now = new Date().toISOString();
    const createdBy = req.headers['x-user-id'] || organizer_unit || 'dep_yb';

    db.prepare(`
      INSERT INTO event (
        id, title, starts_at, ends_at, place, organizer_unit, category_id,
        level, points, capacity, requires_registration, status, qr_secret, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `).run(
      eventId,
      title,
      starts_at,
      ends_at,
      place,
      organizer_unit || 'dep_yb',
      category_id,
      level,
      points,
      capacity ? Number(capacity) : null,
      requires_registration ? 1 : 0,
      qrSecret,
      createdBy,
      now
    );

    logAudit({
      actor_id: createdBy,
      actor_role: 'staff',
      action: 'CREATE_EVENT',
      object_type: 'event',
      object_id: eventId,
      after: { title, level, points },
      ip: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      event_id: eventId,
      points,
      message: `Tadbir yaratildi (${points} ball)`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/events/:id/qr
 * Q-01: Jonli tadbir QR kodi (har 60 soniyada yangilanadi)
 */
router.get('/:id/qr', async (req, res) => {
  try {
    const data = await generateEventQrDataUrl(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

/**
 * GET /api/events/:id/participants
 * Ishtirokchilar ro'yxati
 */
router.get('/:id/participants', (req, res) => {
  const eventId = req.params.id;

  const registrations = db.prepare(`
    SELECT er.*, st.first_name, st.last_name, st.group_code, st.phone,
           chk.at as checked_in_at, chk.mode as checkin_mode
    FROM event_registration er
    JOIN student st ON er.student_id = st.id
    LEFT JOIN checkin chk ON er.event_id = chk.event_id AND er.student_id = chk.student_id
    WHERE er.event_id = ?
    ORDER BY er.registered_at ASC
  `).all(eventId);

  const directCheckins = db.prepare(`
    SELECT chk.*, st.first_name, st.last_name, st.group_code, st.phone
    FROM checkin chk
    JOIN student st ON chk.student_id = st.id
    WHERE chk.event_id = ?
    ORDER BY chk.at DESC
  `).all(eventId);

  res.json({
    event_id: eventId,
    registrations,
    checkins: directCheckins
  });
});

module.exports = router;
