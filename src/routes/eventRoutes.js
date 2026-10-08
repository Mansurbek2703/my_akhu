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
    const event = db.prepare('SELECT title, points FROM event WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });
    const data = await generateEventQrDataUrl(req.params.id);
    res.json({
      title: event.title,
      points: event.points,
      qr_data_url: data.dataUrl,
      dataUrl: data.dataUrl,
      payload: data.payload,
      ttl: data.ttl
    });
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

/**
 * POST /api/events/:id/checkin-student
 * 2-rejim: Xodim talabaning shaxsiy QR kodini yoki ID sini kiritib tadbirga check-in qilishi
 */
router.post('/:id/checkin-student', (req, res) => {
  try {
    const eventId = req.params.id;
    const { student_id, student_query, qr_payload } = req.body;
    const staffId = req.headers['x-user-id'] || 'dep_yb';

    const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    let targetStudentId = student_id;

    // 1. Agar QR payload kelgan bo'lsa
    if (qr_payload) {
      let parsedPayload = null;
      try {
        parsedPayload = typeof qr_payload === 'string' ? JSON.parse(qr_payload) : qr_payload;
      } catch (e) {
        if (typeof qr_payload === 'string' && qr_payload.startsWith('STU:')) {
          targetStudentId = qr_payload.replace('STU:', '').trim();
        } else {
          targetStudentId = String(qr_payload).trim();
        }
      }

      if (parsedPayload && parsedPayload.student_id) {
        targetStudentId = parsedPayload.student_id;
      }
    }

    // 2. Agar qidiruv so'rovi (ID, external_id, telefon) kelgan bo'lsa
    if (!targetStudentId && student_query) {
      const q = String(student_query).trim();
      const st = db.prepare(`
        SELECT id FROM student 
        WHERE id = ? OR external_id = ? OR phone = ? OR telegram_user_id = ?
        LIMIT 1
      `).get(q, q, q, q);
      if (st) targetStudentId = st.id;
    }

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Talaba aniqlanmadi (ID yoki QR kod noto\'g\'ri)' });
    }

    const student = db.prepare(`SELECT * FROM student WHERE id = ? OR external_id = ?`).get(targetStudentId, targetStudentId);
    if (!student) {
      return res.status(404).json({ error: 'Talaba tizimdan topilmadi' });
    }

    // Allaqachon check-in qilinganmi?
    const existingCheckin = db.prepare(`SELECT * FROM checkin WHERE event_id = ? AND student_id = ?`).get(eventId, student.id);
    if (existingCheckin) {
      return res.status(400).json({ error: `Talaba (${student.first_name} ${student.last_name}) ushbu tadbirga allaqachon qabul qilingan!` });
    }

    const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
    const pointEntryId = 'pe_' + crypto.randomBytes(6).toString('hex');
    const checkinId = 'chk_' + crypto.randomBytes(6).toString('hex');
    const nowIso = new Date().toISOString();
    const points = event.points || 5;

    db.transaction(() => {
      // 1. Point entry
      db.prepare(`
        INSERT INTO point_entry (
          id, student_id, item_id, item_version, category_id, base_points, points,
          note, event_date, source, created_by, created_at, status, approver_role,
          approved_by, approved_at, event_id, season_id
        ) VALUES (?, ?, 'i1', 1, ?, ?, ?, ?, ?, 'qr', ?, ?, 'approved', ?, ?, ?, ?, ?)
      `).run(
        pointEntryId,
        student.id,
        event.category_id,
        points,
        points,
        `Tadbir check-in (Xodim orqali): ${event.title}`,
        nowIso.split('T')[0],
        staffId,
        nowIso,
        event.organizer_unit || 'dep_yb',
        staffId,
        nowIso,
        eventId,
        currentSeason.id
      );

      // 2. History
      db.prepare(`
        INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
        VALUES (?, NULL, 'approved', ?, ?, 'Xodim tomonidan talaba QR / ID tekshiruvi orqali tasdiqlandi')
      `).run(pointEntryId, staffId, nowIso);

      // 3. Checkin
      db.prepare(`
        INSERT INTO checkin (id, event_id, student_id, at, mode, scanned_by, entry_id)
        VALUES (?, ?, ?, ?, 'student_qr', ?, ?)
      `).run(checkinId, eventId, student.id, nowIso, staffId, pointEntryId);

      // 4. Audit
      logAudit({
        actor_id: staffId,
        actor_role: 'staff',
        action: 'STAFF_STUDENT_CHECKIN',
        object_type: 'event',
        object_id: eventId,
        after: { student_id: student.id, points, entry_id: pointEntryId },
        ip: req.ip || '127.0.0.1'
      });
    })();

    const { recalculateStudentScores } = require('../services/ratingService');
    recalculateStudentScores();

    res.json({
      success: true,
      points,
      student: {
        id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        group_code: student.group_code
      },
      message: `${student.first_name} ${student.last_name} tadbirga muvaffaqiyatli qabul qilindi (+${points} ball)!`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/events/:id
 * Tadbirni o'chirish (Superadmin yoki tashkilotchi)
 */
router.delete('/:id', (req, res) => {
  try {
    const eventId = req.params.id;
    const staffId = req.headers['x-user-id'] || 'dep_yb';

    const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    db.transaction(() => {
      db.prepare(`DELETE FROM checkin WHERE event_id = ?`).run(eventId);
      db.prepare(`DELETE FROM event_registration WHERE event_id = ?`).run(eventId);
      db.prepare(`DELETE FROM event WHERE id = ?`).run(eventId);

      logAudit({
        actor_id: staffId,
        actor_role: 'staff',
        action: 'DELETE_EVENT',
        object_type: 'event',
        object_id: eventId,
        before: { title: event.title },
        ip: req.ip || '127.0.0.1'
      });
    })();

    res.json({ success: true, message: 'Tadbir o\'chirildi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
