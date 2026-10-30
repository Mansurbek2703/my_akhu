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

const config = require('../config');

// Qat'iy avtorizatsiya: Tadbirlar bo'limiga faqat tizimga kirgan xodimlar yoki to'g'ri TV tokeni
function authenticateStaffOrTv(req, res, next) {
  const tvToken = req.query.token || req.headers['x-tv-token'];
  if (tvToken && tvToken === config.secrets.tvToken) {
    req.staffUser = { id: 'tv_display', roles: ['observer'] };
    return next();
  }

  const userId = req.headers['x-user-id'] || req.query.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Avtorizatsiyadan o'tilmagan. Iltimos, login va parol orqali tizimga kiring." });
  }

  if (userId === 'superadmin') {
    req.staffUser = { id: 'superadmin', full_name: 'Superadmin', roles: ['superadmin'] };
    return next();
  }

  const user = db.prepare(`SELECT * FROM staff_user WHERE (LOWER(id) = LOWER(?) OR LOWER(COALESCE(passport_id, '')) = LOWER(?)) AND active = 1`).get(userId, userId);
  if (!user) {
    return res.status(401).json({ error: "Foydalanuvchi topilmadi yoki hisob faol emas." });
  }

  let roles = [];
  try { roles = JSON.parse(user.roles); } catch (e) { roles = [user.roles]; }
  let permissions = [];
  try { permissions = JSON.parse(user.permissions || '[]'); } catch (e) { permissions = []; }
  req.staffUser = { ...user, roles, permissions };
  next();
}

router.use(authenticateStaffOrTv);

/**
 * GET /api/events
 * Tadbirlar ro'yxati
 */
router.get('/', (req, res) => {
  const events = db.prepare(`
    SELECT ev.*, 
           COALESCE(ev.photo_url, ev.image_url) as photo_url,
           COALESCE(ev.image_url, ev.photo_url) as image_url,
           cc.name as category_name, cc.color as category_color,
           (SELECT COUNT(*) FROM checkin WHERE event_id = ev.id) as checkins_count,
           (SELECT COUNT(*) FROM event_registration WHERE event_id = ev.id) as registered_count
    FROM event ev
    JOIN catalog_category cc ON ev.category_id = cc.id
    ORDER BY ev.starts_at DESC
  `).all();

  res.json({ events });
});

/**
 * GET /api/events/search-leads
 * Tashabbuskor xodim yoki talabani qidirish
 */
router.get('/search-leads', (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ staff: [], students: [] });
    }

    const staff = db.prepare(`
      SELECT id, full_name, username, roles, photo_url 
      FROM staff_user 
      WHERE (LOWER(full_name) LIKE LOWER(?) OR LOWER(username) LIKE LOWER(?)) AND active = 1 
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`);

    const students = db.prepare(`
      SELECT id, first_name, last_name, group_code, photo_url 
      FROM student 
      WHERE (LOWER(first_name || ' ' || last_name) LIKE LOWER(?) OR LOWER(id) LIKE LOWER(?)) AND status = 'active'
      LIMIT 10
    `).all(`%${q}%`, `%${q}%`);

    res.json({ staff, students });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/events
 * Yangi tadbir yaratish (Tashabbuskor va 4 ta bo'lim kelishuvi bilan)
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
      attendance_open_minutes_before,
      lead_type = 'self',
      lead_id = null,
      lead_name = null,
      lead_group = null,
      lead_points = 0,
      req_xb_note = null,
      req_atm_note = null,
      req_ob_note = null,
      agreement_xb_note = null,
      agreement_atm_note = null,
      agreement_ob_note = null,
      is_direct_publish = false
    } = req.body;

    // Har ikki nom bilan kelishi mumkin: req_xb_note yoki agreement_xb_note
    const finalReqXb = (req_xb_note || agreement_xb_note || '').trim() || null;
    const finalReqAtm = (req_atm_note || agreement_atm_note || '').trim() || null;
    const finalReqOb = (req_ob_note || agreement_ob_note || '').trim() || null;

    if (!title || !starts_at || !ends_at || !place || !category_id || !level) {
      return res.status(400).json({ error: 'Majburiy maydonlar to\'ldirilishi shart' });
    }

    const now = new Date();
    const startsDate = new Date(starts_at);
    const endsDate = new Date(ends_at);

    if (endsDate <= startsDate) {
      return res.status(400).json({
        error: 'Tadbir tugash vaqti boshlanish vaqtidan keyin bo\'lishi shart!'
      });
    }

    const isSuperadmin = (req.staffUser.roles || []).includes('superadmin');
    const shouldDirectPublish = Boolean(is_direct_publish && isSuperadmin);

    const points = LEVEL_POINTS[level] || 5;
    const eventId = 'ev_' + crypto.randomBytes(6).toString('hex');
    const qrSecret = 'sec_' + crypto.randomBytes(12).toString('hex');
    const nowIso = now.toISOString();
    const createdBy = req.staffUser.id;
    const photoUrl = (req.body.photo_url || req.body.image_url) ? String(req.body.photo_url || req.body.image_url).trim() : null;

    const finalLeadType = lead_type || 'self';
    const finalLeadId = lead_id || (finalLeadType === 'self' ? req.staffUser.id : null);
    const finalLeadName = lead_name || (finalLeadType === 'self' ? req.staffUser.full_name : null);
    const finalLeadGroup = lead_group || null;
    const finalLeadPoints = Number(lead_points) || 0;

    const initialStatus = shouldDirectPublish ? 'published' : 'pending_agreement';
    const initialDeptStatus = shouldDirectPublish ? 'agreed' : 'pending';
    const initialFinalStatus = shouldDirectPublish ? 'approved' : 'pending';

    db.prepare(`
      INSERT INTO event (
        id, title, starts_at, ends_at, place, photo_url, image_url, organizer_unit, category_id,
        level, points, capacity, requires_registration, status, qr_secret,
        qr_refresh_seconds, attendance_open_minutes_before, created_by, created_at,
        lead_type, lead_id, lead_name, lead_group, lead_points, lead_rewarded,
        req_xb_note, req_atm_note, req_ob_note,
        agreement_xb_status, agreement_atm_status, agreement_ob_status, approval_final_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 60, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventId,
      title,
      starts_at,
      ends_at,
      place,
      photoUrl,
      photoUrl,
      organizer_unit || req.staffUser.full_name || 'AKHU',
      category_id,
      level,
      points,
      capacity ? Number(capacity) : null,
      requires_registration ? 1 : 0,
      initialStatus,
      qrSecret,
      attendance_open_minutes_before !== undefined ? Number(attendance_open_minutes_before) : 5,
      createdBy,
      nowIso,
      finalLeadType,
      finalLeadId,
      finalLeadName,
      finalLeadGroup,
      finalLeadPoints,
      finalReqXb,
      finalReqAtm,
      finalReqOb,
      initialDeptStatus,
      initialDeptStatus,
      initialDeptStatus,
      initialFinalStatus
    );

    logAudit({
      actor_id: createdBy,
      actor_role: (req.staffUser.roles && req.staffUser.roles[0]) || 'staff',
      action: 'CREATE_EVENT',
      object_type: 'event',
      object_id: eventId,
      after: { title, level, points, status: initialStatus, lead_name: finalLeadName },
      ip: req.ip || '127.0.0.1'
    });

    // Agar darhol chop etilgan bo'lsa (superadmin)
    if (shouldDirectPublish) {
      try {
        const { broadcastNewEventToStudents } = require('../services/telegramService');
        broadcastNewEventToStudents({
          id: eventId,
          title,
          starts_at,
          ends_at,
          place,
          photo_url: photoUrl,
          image_url: photoUrl,
          points,
          attendance_open_minutes_before: 5
        });
      } catch (e) {}
    } else {
      // 3 ta kelishuvchi bo'lim xodimlariga Telegram orqali xabar yuborish (o'ziga tegishli talab bilan birga!)
      try {
        const { sendTelegramMessage } = require('../services/telegramService');
        const departments = [
          { code: 'dep_xb', name: "Xo'jalik bo'limi", reqNote: finalReqXb || "Zal, stol, stul va moddiy baza imkoniyatlari" },
          { code: 'dep_atm', name: "Axborot texnologiyalari markazi", reqNote: finalReqAtm || "Mikrofon, proyektor, internet va IT jihozlar" },
          { code: 'dep_ob', name: "O'quv bo'limi", reqNote: finalReqOb || "Bo'sh xona/zal va dars jadvaliga xalaqit bermaslik" }
        ];
        const startsStr = new Date(starts_at).toLocaleString('uz-UZ', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        for (const dept of departments) {
          const staffUsers = db.prepare(`SELECT telegram_user_id FROM staff_user WHERE roles LIKE ? AND active = 1 AND telegram_user_id IS NOT NULL`).all(`%${dept.code}%`);
          for (const su of staffUsers) {
            sendTelegramMessage(su.telegram_user_id, 
              `📅 <b>Yangi Tadbir Kelishuvi!</b>\n\n` +
              `🏢 <b>Sizning bo'limingiz:</b> ${dept.name}\n` +
              `📌 <b>Tadbir:</b> ${title}\n` +
              `📍 <b>Joyi:</b> ${place}\n` +
              `⏰ <b>Vaqti:</b> ${startsStr}\n` +
              `👤 <b>Tashabbuskor:</b> ${finalLeadName || req.staffUser.full_name}\n\n` +
              `📋 <b>Sizning bo'limdan so'ralgan talab:</b>\n<i>${dept.reqNote}</i>\n\n` +
              `⚡️ <i>Iltimos, tizimga kirib o'z bo'limingiz qarorini bildiring (Tasdiqlash yoki Rad etish).</i>`
            ).catch(() => {});
          }
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      event_id: eventId,
      status: initialStatus,
      points,
      message: shouldDirectPublish 
        ? `Tadbir to'g'ridan-to'g'ri e'lon qilindi (${points} ball).` 
        : `Tadbir yaratildi va 4 ta bo'lim kelishuviga yuborildi.`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/events/:id/agree
 * Xo'jalik bo'limi (xb), Axborot texnologiyalari markazi (atm) yoki O'quv bo'limi (ob) kelishuvi
 */
router.post('/:id/agree', (req, res) => {
  try {
    const eventId = req.params.id;
    const department = req.body.department || req.body.dept;
    const { status, note } = req.body; // department: 'xb' | 'atm' | 'ob', status: 'agreed' | 'rejected'

    if (!['xb', 'atm', 'ob'].includes(department)) {
      return res.status(400).json({ error: "Noto'g'ri bo'lim ko'rsatildi (xb, atm yoki ob bo'lishi kerak)" });
    }
    if (!['agreed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Holat 'agreed' yoki 'rejected' bo'lishi kerak" });
    }
    if (!note || !note.trim()) {
      return res.status(400).json({ error: "Kelishuv yoki rad etish bo'yicha izoh yozilishi shart!" });
    }

    const event = db.prepare('SELECT * FROM event WHERE id = ?').get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    // Ruxsat tekshiruvi: faqat tegishli bo'lim yoki superadmin
    const roles = req.staffUser.roles || [];
    const targetRole = `dep_${department}`;
    const isSuperadmin = roles.includes('superadmin');
    const isAuthorized = isSuperadmin || roles.includes(targetRole);

    if (!isAuthorized) {
      return res.status(403).json({ error: `Ushbu kelishuvni tasdiqlash uchun sizda ${targetRole} roli bo'lishi kerak!` });
    }

    const now = new Date().toISOString();
    const approverName = req.staffUser.full_name || req.staffUser.username || req.staffUser.id;

    db.prepare(`
      UPDATE event 
      SET agreement_${department}_status = ?,
          agreement_${department}_note = ?,
          agreement_${department}_by = ?,
          agreement_${department}_at = ?
      WHERE id = ?
    `).run(status, note.trim(), approverName, now, eventId);

    logAudit({
      actor_id: req.staffUser.id,
      actor_role: targetRole,
      action: `EVENT_AGREEMENT_${department.toUpperCase()}`,
      object_type: 'event',
      object_id: eventId,
      after: { department, status, note },
      ip: req.ip || '127.0.0.1'
    });

    // Yangilangan tadbirni o'qish
    const updated = db.prepare('SELECT * FROM event WHERE id = ?').get(eventId);

    // Agar bo'lim rad etgan bo'lsa (rejected) — Tadbir yaratuvchisiga Telegram orqali xabar yuborish!
    if (status === 'rejected' && event.created_by) {
      try {
        const { sendTelegramMessage } = require('../services/telegramService');
        const creator = db.prepare('SELECT telegram_user_id, full_name FROM staff_user WHERE id = ?').get(event.created_by);
        if (creator && creator.telegram_user_id) {
          const deptNames = { xb: "Xo'jalik bo'limi", atm: "Axborot texnologiyalari markazi (ATM)", ob: "O'quv bo'limi" };
          sendTelegramMessage(creator.telegram_user_id,
            `❌ <b>Tadbir bo'lim tomonidan rad etildi!</b>\n\n` +
            `🏢 <b>Bo'lim:</b> ${deptNames[department] || department}\n` +
            `📌 <b>Tadbir:</b> ${event.title}\n` +
            `👤 <b>Rad etuvchi:</b> ${approverName}\n` +
            `📝 <b>Rad etish sababi:</b> ${note.trim()}\n\n` +
            `⚠️ <i>Iltimos, rad etish sababini o'rganib, talab yoki sharoitni o'zgartirgan holda tadbirni qayta kelishishga yuboring.</i>`
          ).catch(() => {});
        }
      } catch (e) {}
    }

    // Agar 3 ta bo'lim ham rozi bo'lgan bo'lsa (agreed), Ish yurituvchi (dep_iy) ga Telegram orqali xabar yuborish
    if (updated.agreement_xb_status === 'agreed' && 
        updated.agreement_atm_status === 'agreed' && 
        updated.agreement_ob_status === 'agreed' &&
        updated.approval_final_status === 'pending') {
      try {
        const { sendTelegramMessage } = require('../services/telegramService');
        const iyUsers = db.prepare(`SELECT telegram_user_id FROM staff_user WHERE (roles LIKE '%dep_iy%' OR roles LIKE '%superadmin%') AND active = 1 AND telegram_user_id IS NOT NULL`).all();
        for (const u of iyUsers) {
          sendTelegramMessage(u.telegram_user_id,
            `📑 <b>Tadbir Yakuniy Tasdiqqa Tayyor!</b>\n\n` +
            `📌 <b>Tadbir:</b> ${updated.title}\n` +
            `✅ <b>Xo'jalik bo'limi:</b> Kelishilgan\n` +
            `✅ <b>Axborot texnologiyalari:</b> Kelishilgan\n` +
            `✅ <b>O'quv bo'limi:</b> Kelishilgan\n\n` +
            `<i>Ish yurituvchi sifatida tadbirni yakuniy tasdiqlab, chop etishingiz mumkin.</i>`
          ).catch(() => {});
        }
      } catch (e) {}
    }

    res.json({
      success: true,
      message: `${department.toUpperCase()} bo'limi qarori muvaffaqiyatli saqlandi.`
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/events/:id/resubmit-agreement
 * Rad etilgan tadbirni talab/izohini yangilab qayta kelishishga yuborish
 */
router.post('/:id/resubmit-agreement', (req, res) => {
  try {
    const eventId = req.params.id;
    const { dept, note } = req.body; // dept: 'xb' | 'atm' | 'ob' | 'all'

    const event = db.prepare('SELECT * FROM event WHERE id = ?').get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    const isCreator = event.created_by && String(event.created_by).toLowerCase() === String(req.staffUser.id).toLowerCase();
    const isSuperadmin = (req.staffUser.roles || []).includes('superadmin');
    if (!isCreator && !isSuperadmin) {
      return res.status(403).json({ error: "Faqat tadbir tashkilotchisi yoki Superadmin qayta kelishishga yuborishi mumkin!" });
    }

    const deptsToReset = dept === 'all' 
      ? ['xb', 'atm', 'ob'] 
      : (['xb', 'atm', 'ob'].includes(dept) ? [dept] : ['xb', 'atm', 'ob']);

    for (const d of deptsToReset) {
      const noteParam = (note && note.trim()) ? note.trim() : null;
      if (noteParam) {
        db.prepare(`
          UPDATE event 
          SET agreement_${d}_status = 'pending',
              agreement_${d}_at = NULL,
              req_${d}_note = ?,
              status = 'pending_agreement'
          WHERE id = ?
        `).run(noteParam, eventId);
      } else {
        db.prepare(`
          UPDATE event 
          SET agreement_${d}_status = 'pending',
              agreement_${d}_at = NULL,
              status = 'pending_agreement'
          WHERE id = ?
        `).run(eventId);
      }
    }

    // Tegishli bo'limlarga Telegram xabarnoma yuborish
    try {
      const { sendTelegramMessage } = require('../services/telegramService');
      const deptNames = { xb: "Xo'jalik bo'limi", atm: "Axborot texnologiyalari markazi (ATM)", ob: "O'quv bo'limi" };
      for (const d of deptsToReset) {
        const staffUsers = db.prepare(`SELECT telegram_user_id FROM staff_user WHERE roles LIKE ? AND active = 1 AND telegram_user_id IS NOT NULL`).all(`%dep_${d}%`);
        for (const su of staffUsers) {
          sendTelegramMessage(su.telegram_user_id,
            `🔄 <b>Tadbir Qayta Kelishuvga Yuborildi!</b>\n\n` +
            `🏢 <b>Bo'lim:</b> ${deptNames[d]}\n` +
            `📌 <b>Tadbir:</b> ${event.title}\n` +
            `👤 <b>Tashabbuskor:</b> ${req.staffUser.full_name}\n` +
            `📝 <b>Yangilangan talab / izoh:</b> ${note || 'Talab qayta ko\'rib chiqish uchun yuborildi'}\n\n` +
            `⚡️ <i>Iltimos, tizimga kirib qayta ko'rib chiqing va tasdiqlang.</i>`
          ).catch(() => {});
        }
      }
    } catch (e) {}

    logAudit({
      actor_id: req.staffUser.id,
      actor_role: isSuperadmin ? 'superadmin' : 'staff',
      action: 'EVENT_RESUBMIT_AGREEMENT',
      object_type: 'event',
      object_id: eventId,
      after: { deptsToReset, note },
      ip: req.ip || '127.0.0.1'
    });

    res.json({
      success: true,
      message: "Tadbir muvaffaqiyatli qayta kelishuvga yuborildi!"
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/events/:id/final-approve
 * Ish yurituvchi (dep_iy) yoki Superadmin tomonidan tadbirni yakuniy tasdiqlash
 */
router.post('/:id/final-approve', (req, res) => {
  try {
    const eventId = req.params.id;
    const { status, note } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Holat 'approved' yoki 'rejected' bo'lishi kerak" });
    }

    const event = db.prepare('SELECT * FROM event WHERE id = ?').get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    // Ruxsat tekshiruvi: faqat Ish yurituvchi yoki superadmin
    const roles = req.staffUser.roles || [];
    const isSuperadmin = roles.includes('superadmin');
    const isIshYurituvchi = roles.includes('dep_iy');

    if (!isSuperadmin && !isIshYurituvchi) {
      return res.status(403).json({ error: "Yakuniy tasdiqlash huquqi faqat Ish yurituvchi yoki Superadminga tegishli!" });
    }

    const now = new Date().toISOString();
    const approverName = req.staffUser.full_name || req.staffUser.username || req.staffUser.id;
    const finalEventStatus = status === 'approved' ? 'published' : 'cancelled';

    db.prepare(`
      UPDATE event 
      SET approval_final_status = ?,
          approval_final_note = ?,
          approved_by = ?,
          approved_at = ?,
          status = ?
      WHERE id = ?
    `).run(status, (note || '').trim(), approverName, now, finalEventStatus, eventId);

    logAudit({
      actor_id: req.staffUser.id,
      actor_role: isSuperadmin ? 'superadmin' : 'dep_iy',
      action: status === 'approved' ? 'EVENT_FINAL_APPROVED' : 'EVENT_FINAL_REJECTED',
      object_type: 'event',
      object_id: eventId,
      after: { status, finalEventStatus, note },
      ip: req.ip || '127.0.0.1'
    });

    if (status === 'approved') {
      // 1. Agar talaba tashabbuskor (lead_type === 'student') bo'lsa va ball berilmagan bo'lsa
      if (event.lead_type === 'student' && event.lead_id && (Number(event.lead_points) > 0) && event.lead_rewarded !== 1) {
        try {
          const student = db.prepare('SELECT * FROM student WHERE id = ?').get(event.lead_id);
          if (student) {
            const season = db.prepare('SELECT * FROM season WHERE is_current = 1 LIMIT 1').get() || { id: '2026-2027' };
            const entryId = 'pe_' + crypto.randomBytes(8).toString('hex');
            const leadPts = Number(event.lead_points);

            // Katalog bandini aniqlash: masalan i6 (20 ball) yoki i3 (10 ball) yoki i7 (30 ball)
            let itemId = 'i3';
            let catId = '1';
            if (leadPts >= 30) itemId = 'i7';
            else if (leadPts >= 20) itemId = 'i6';
            else if (leadPts >= 15) { itemId = 'm3'; catId = '2'; }

            db.prepare(`
              INSERT INTO point_entry (
                id, student_id, item_id, item_version, category_id, base_points, points,
                note, event_date, source, created_by, created_at, status, approver_role,
                approved_by, approved_at, event_id, season_id
              ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 'system', ?, ?, 'approved', 'dep_iy', ?, ?, ?, ?)
            `).run(
              entryId,
              student.id,
              itemId,
              catId,
              leadPts,
              leadPts,
              `Tadbir tashabbuskori va tashkilotchisi: "${event.title}"`,
              event.starts_at.slice(0, 10),
              req.staffUser.id,
              now,
              req.staffUser.id,
              now,
              eventId,
              season.id
            );

            db.prepare('UPDATE event SET lead_rewarded = 1 WHERE id = ?').run(eventId);

            // Reytingni qayta hisoblash
            const { recalculateStudentScores } = require('../services/ratingService');
            recalculateStudentScores();

            // Talabaga xabar
            const { notifyStudent } = require('../services/telegramService');
            notifyStudent(student.id, 'N-01', {
              points: leadPts,
              item_name: `Tadbir tashabbuskori ("${event.title}")`,
              category_name: 'Ijtimoiy faollik & Tashkilotchilik',
              dept_name: "Ish yurituvchi"
            });
          }
        } catch (e) {
          console.error('Lead student reward error:', e.message);
        }
      }

      // 2. Barcha talabalarga Telegram orqali xabar yuborish
      try {
        const { broadcastNewEventToStudents } = require('../services/telegramService');
        broadcastNewEventToStudents({
          id: eventId,
          title: event.title,
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          place: event.place,
          photo_url: event.photo_url || event.image_url,
          image_url: event.image_url || event.photo_url,
          points: event.points,
          attendance_open_minutes_before: event.attendance_open_minutes_before || 5
        });
      } catch (e) {
        console.error('Broadcast error:', e.message);
      }
    }

    res.json({
      success: true,
      message: status === 'approved' 
        ? "Tadbir muvaffaqiyatli tasdiqlandi va barcha talabalarga e'lon qilindi!" 
        : "Tadbir rad etildi va bekor qilindi."
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
    const userId = req.staffUser.id;

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

    let photoUrl = event.photo_url || event.image_url;
    if (req.body.photo_url !== undefined) {
      photoUrl = req.body.photo_url ? String(req.body.photo_url).trim() : null;
    } else if (req.body.image_url !== undefined) {
      photoUrl = req.body.image_url ? String(req.body.image_url).trim() : null;
    }

    db.prepare(`
      UPDATE event SET
        title = ?,
        starts_at = ?,
        ends_at = ?,
        place = ?,
        photo_url = ?,
        image_url = ?,
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
      photoUrl,
      photoUrl,
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

    // QAT'IY XAVFSIZLIK: Bu tadbir QR si talabalarga KO'RINMAYDI!
    // Bu faqat tadbir yaratgan xodimga va superadminning profilida ko'rinadi!
    const requesterId = req.staffUser ? String(req.staffUser.id).toLowerCase() : '';
    const requesterRoles = req.staffUser?.roles || [];
    const isSuperadmin = requesterRoles.includes('superadmin') || requesterId === 'superadmin';
    const isCreator = event.created_by && String(event.created_by).toLowerCase() === requesterId;

    if (!isSuperadmin && !isCreator) {
      return res.status(403).json({
        error: "Ruxsat etilmagan. Ushbu tadbir dinamik QR kodi faqat tadbir yaratuvchisi va Superadminga ko'rinadi (talabalar va begona shaxslarga ko'rinmaydi)!"
      });
    }

    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);
    // Tadbir boshlanish vaqtidan 5 daqiqa oldin ochiladi!
    const opensAt = new Date(startsAt.getTime() - 5 * 60 * 1000);

    if (now < opensAt) {
      const waitSeconds = Math.max(1, Math.ceil((opensAt.getTime() - now.getTime()) / 1000));
      return res.status(400).json({
        error: `Tadbir QR kodi va skaneri tadbir boshlanishidan 5 daqiqa oldin avtomatik ochiladi!`,
        is_locked: true,
        opens_at: opensAt.toISOString(),
        starts_at: event.starts_at,
        wait_seconds: waitSeconds
      });
    }

    if (now > endsAt) {
      return res.status(400).json({ error: 'Tadbir vaqti tugagan. Davomat tekshiruvi (attendance checking) yakunlangan.' });
    }

    const data = await generateEventQrDataUrl(req.params.id);
    res.json({
      title: event.title,
      points: event.points,
      qr_refresh_seconds: 10,
      ttl: 10,
      attendance_open_minutes_before: 5,
      qr_data_url: data.dataUrl,
      dataUrl: data.dataUrl,
      payload: data.payload,
      is_locked: false,
      valid_for_seconds: data.valid_for_seconds
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
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
    const staffId = req.staffUser.id;

    const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
    if (!event) return res.status(404).json({ error: 'Tadbir topilmadi' });

    // QAT'IY XAVFSIZLIK: Skaner faqat tadbir yaratuvchisi va Superadminga ochiq
    const requesterId = req.staffUser ? String(req.staffUser.id).toLowerCase() : '';
    const requesterRoles = req.staffUser?.roles || [];
    const isSuperadmin = requesterRoles.includes('superadmin') || requesterId === 'superadmin';
    const isCreator = event.created_by && String(event.created_by).toLowerCase() === requesterId;

    if (!isSuperadmin && !isCreator) {
      return res.status(403).json({
        error: "Ruxsat etilmagan. Ushbu tadbir davomat skaneri faqat tadbir tashkilotchisi va Superadminga ochiq!"
      });
    }

    // Davomat vaqti tekshiruvi: 5 daqiqa oldin ochiladi
    const now = new Date();
    const startsAt = new Date(event.starts_at);
    const endsAt = new Date(event.ends_at);
    const minAllowedTime = new Date(startsAt.getTime() - 5 * 60 * 1000);

    if (now < minAllowedTime) {
      const waitSeconds = Math.max(1, Math.ceil((minAllowedTime.getTime() - now.getTime()) / 1000));
      return res.status(400).json({
        error: `Tadbir skaneri tadbir boshlanishidan 5 daqiqa oldin ochiladi!`,
        is_locked: true,
        opens_at: minAllowedTime.toISOString(),
        wait_seconds: waitSeconds
      });
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

    try {
      const { notifyStudentEventCheckin } = require('../services/telegramService');
      notifyStudentEventCheckin(student.id, event, points);
    } catch (e) {}

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
    const staffId = req.staffUser.id;

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
