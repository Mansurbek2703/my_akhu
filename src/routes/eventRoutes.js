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
      requires_registration,
      attendance_open_minutes_before
    } = req.body;

    if (!title || !starts_at || !ends_at || !place || !category_id || !level) {
      return res.status(400).json({ error: 'Majburiy maydonlar to\'ldirilishi shart' });
    }

    const now = new Date();
    const minAllowedStart = new Date(now.getTime() + 10 * 60 * 1000);
    const startsDate = new Date(starts_at);
    const endsDate = new Date(ends_at);

    if (startsDate < minAllowedStart) {
      return res.status(400).json({
        error: `Tadbir boshlanish sanasi va vaqti hozirgi vaqtdan kamida 10 daqiqa keyinga sozlanishi shart! (Eng erta boshlanish vaqti: ${minAllowedStart.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })})`
      });
    }

    if (endsDate <= startsDate) {
      return res.status(400).json({
        error: 'Tadbir tugash vaqti boshlanish vaqtidan keyin bo\'lishi shart!'
      });
    }

    // Q-10: Ball darajadan avtomatik belgilanadi
    const points = LEVEL_POINTS[level] || 5;
    const eventId = 'ev_' + crypto.randomBytes(6).toString('hex');
    const qrSecret = 'sec_' + crypto.randomBytes(12).toString('hex');
    const nowIso = now.toISOString();
    const createdBy = req.headers['x-user-id'] || organizer_unit || 'dep_yb';

    // Anti-fraud talabi: Tadbir yaratuvchi QR kodi har doim qat'iy 5 sekunddan yangilanishi shart!
    const qrRefresh = 5;

    // Davomat boshlanish vaqti: default 5 daqiqa oldin, lekin yaratuvchi/superadmin sozlashi mumkin
    const rawOpenMinutes = Number(attendance_open_minutes_before);
    const attendanceOpenMinutes = (!isNaN(rawOpenMinutes) && rawOpenMinutes >= 0) ? rawOpenMinutes : 5;

    db.prepare(`
      INSERT INTO event (
        id, title, starts_at, ends_at, place, organizer_unit, category_id,
        level, points, capacity, requires_registration, status, qr_secret,
        qr_refresh_seconds, attendance_open_minutes_before, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, 5, ?, ?, ?)
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
      attendanceOpenMinutes,
      createdBy,
      nowIso
    );

    logAudit({
      actor_id: createdBy,
      actor_role: 'staff',
      action: 'CREATE_EVENT',
      object_type: 'event',
      object_id: eventId,
      after: { title, level, points, qr_refresh_seconds: 5, attendance_open_minutes_before: attendanceOpenMinutes },
      ip: req.ip || '127.0.0.1'
    });

    // BARCHA TALABALARGA TELEGRAM BOT ORQALI BILDIRISHNOMA YUBORISH
    try {
      const { broadcastNewEventToStudents } = require('../services/telegramService');
      broadcastNewEventToStudents({
        id: eventId,
        title,
        starts_at,
        ends_at,
        place,
        points,
        attendance_open_minutes_before: attendanceOpenMinutes
      });
    } catch (e) {
      console.error('Broadcast notification error:', e.message);
    }

    res.json({
      success: true,
      event_id: eventId,
      points,
      qr_refresh_seconds: 5,
      attendance_open_minutes_before: attendanceOpenMinutes,
      message: `Tadbir yaratildi (${points} ball, QR yangilanish: 5 soniya, Davomat: tadbirdan ${attendanceOpenMinutes} daqiqa oldin boshlanadi). Barcha talabalarga Telegram bildirishnoma yuborilmoqda!`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/events/:id
 * Tadbirni tahrirlash: Faqat tadbirni yaratgan xodim va Superadmin tadbir tugaguniga qadar tahrirlay oladi!
 */
router.put('/:id', (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.headers['x-user-id'] || 'dep_yb';

    const event = db.prepare('SELECT * FROM event WHERE id = ?').get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    // Huquq tekshiruvi: Superadmin yoki tadbirni yaratgan xodim
    const staff = db.prepare('SELECT * FROM staff_user WHERE id = ?').get(userId);
    let roles = [];
    if (staff && staff.roles) {
      try { roles = JSON.parse(staff.roles); } catch (e) { roles = []; }
    }
    const isSuperadmin = roles.includes('superadmin') || userId === 'superadmin';
    const isCreator = (event.created_by === userId || event.organizer_unit === userId);

    if (!isSuperadmin && !isCreator) {
      return res.status(403).json({ error: 'Faqat tadbirni yaratgan xodim va Superadmin tadbirni tahrirlashi mumkin!' });
    }

    // Vaqt tekshiruvi: Tadbir vaqti tugagunigacha tahrirlash mumkin
    const now = new Date();
    const endsAt = new Date(event.ends_at);
    if (now > endsAt) {
      return res.status(400).json({ error: 'Tadbir vaqti tugagan! Tadbir yakunlangandan keyin uni tahrirlash taqiqlanadi.' });
    }

    const {
      title,
      starts_at,
      ends_at,
      place,
      category_id,
      level,
      capacity,
      requires_registration,
      attendance_open_minutes_before
    } = req.body;

    if (!title || !starts_at || !ends_at || !place || !category_id || !level) {
      return res.status(400).json({ error: 'Majburiy maydonlar to\'ldirilishi shart' });
    }

    const points = LEVEL_POINTS[level] || event.points || 5;

    // Davomat boshlanish vaqti sozlamasi
    let attendanceOpenMinutes = event.attendance_open_minutes_before ?? 5;
    if (attendance_open_minutes_before !== undefined && attendance_open_minutes_before !== null) {
      const rawOpen = Number(attendance_open_minutes_before);
      if (!isNaN(rawOpen) && rawOpen >= 0) {
        attendanceOpenMinutes = rawOpen;
      }
    }

    db.prepare(`
      UPDATE event SET
        title = ?,
        starts_at = ?,
        ends_at = ?,
        place = ?,
        category_id = ?,
        level = ?,
        points = ?,
        capacity = ?,
        requires_registration = ?,
        attendance_open_minutes_before = ?,
        qr_refresh_seconds = 5
      WHERE id = ?
    `).run(
      title,
      starts_at,
      ends_at,
      place,
      category_id,
      level,
      points,
      capacity ? Number(capacity) : null,
      requires_registration ? 1 : 0,
      attendanceOpenMinutes,
      eventId
    );

    logAudit({
      actor_id: userId,
      actor_role: isSuperadmin ? 'superadmin' : 'staff',
      action: 'UPDATE_EVENT',
      object_type: 'event',
      object_id: eventId,
      before: {
        title: event.title,
        starts_at: event.starts_at,
        ends_at: event.ends_at,
        points: event.points,
        attendance_open_minutes_before: event.attendance_open_minutes_before
      },
      after: {
        title,
        starts_at,
        ends_at,
        points,
        attendance_open_minutes_before: attendanceOpenMinutes
      },
      ip: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      points,
      attendance_open_minutes_before: attendanceOpenMinutes,
      message: 'Tadbir ma\'lumotlari muvaffaqiyatli yangilandi!'
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/events/:id/qr
 * Jonli tadbir QR kodi (Har doim qat'iy 5 soniyada yangilanadi)
 */
router.get('/:id/qr', async (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM event WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    const now = new Date();
    const endsAt = new Date(event.ends_at);
    if (now > endsAt) {
      return res.status(400).json({ error: 'Tadbir vaqti tugagan. Davomat tekshiruvi (attendance checking) yakunlangan.' });
    }

    const data = await generateEventQrDataUrl(req.params.id);
    res.json({
      title: event.title,
      points: event.points,
      qr_refresh_seconds: 5,
      ttl: 5,
      attendance_open_minutes_before: event.attendance_open_minutes_before ?? 5,
      qr_data_url: data.dataUrl,
      dataUrl: data.dataUrl,
      payload: data.payload
    });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

/**
 * PUT /api/events/:id/qr-interval
 * QR yangilanish vaqti o'zgartirib bo'lmaydi (har doim qat'iy 5 soniya)
 */
router.put('/:id/qr-interval', (req, res) => {
  return res.status(400).json({
    error: "Soxtalashtirishga qarshi qat'iy xavfsizlik choralari sababli tadbir QR kodi har doim 5 soniyada yangilanadi. Buni o'zgartirish taqiqlanadi!"
  });
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
    SELECT chk.*, chk.at as checked_in_at, st.first_name, st.last_name,
           TRIM(st.first_name || ' ' || COALESCE(st.last_name, '')) as student_name,
           TRIM(st.first_name || ' ' || COALESCE(st.last_name, '')) as full_name,
           st.group_code, st.phone, COALESCE(ev.points, 5) as points
    FROM checkin chk
    JOIN student st ON chk.student_id = st.id
    LEFT JOIN event ev ON chk.event_id = ev.id
    WHERE chk.event_id = ?
    ORDER BY chk.at DESC
  `).all(eventId);

  res.json({
    event_id: eventId,
    registrations,
    checkins: directCheckins,
    participants: directCheckins
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

    // Davomat vaqti tekshiruvi:
    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);
    const openMinutes = (event.attendance_open_minutes_before !== undefined && event.attendance_open_minutes_before !== null)
      ? Number(event.attendance_open_minutes_before)
      : 5;
    const minAllowedTime = new Date(startsAt.getTime() - openMinutes * 60 * 1000);

    if (now < minAllowedTime) {
      return res.status(400).json({ error: `Tadbir davomati hali boshlanmagan. Davomat tadbir boshlanishidan ${openMinutes} daqiqa oldin ochiladi.` });
    }
    if (now > endsAt) {
      return res.status(400).json({ error: 'Tadbir vaqti tugagan. Davomat tekshiruvi (attendance checking) yakunlangan.' });
    }

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

    const student = db.prepare(`
      SELECT * FROM student 
      WHERE id = ? OR external_id = ? OR phone = ? OR telegram_user_id = ?
      LIMIT 1
    `).get(targetStudentId, targetStudentId, targetStudentId, targetStudentId);
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
      const linkedEntries = db.prepare(`SELECT id FROM point_entry WHERE event_id = ?`).all(eventId);
      for (const ent of linkedEntries) {
        db.prepare(`DELETE FROM point_entry_history WHERE entry_id = ?`).run(ent.id);
      }
      db.prepare(`DELETE FROM point_entry WHERE event_id = ?`).run(eventId);
      db.prepare(`DELETE FROM checkin WHERE event_id = ?`).run(eventId);
      db.prepare(`DELETE FROM event_registration WHERE event_id = ?`).run(eventId);
      db.prepare(`DELETE FROM event WHERE id = ?`).run(eventId);

      logAudit({
        actor_id: staffId,
        actor_role: 'staff',
        action: 'DELETE_EVENT',
        object_type: 'event',
        object_id: eventId,
        before: { title: event.title, deleted_points_count: linkedEntries.length },
        ip: req.ip || '127.0.0.1'
      });
    })();

    const { recalculateStudentScores } = require('../services/ratingService');
    recalculateStudentScores();

    res.json({ success: true, message: 'Tadbir va unga tegishli ballar to\'liq o\'chirildi' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
