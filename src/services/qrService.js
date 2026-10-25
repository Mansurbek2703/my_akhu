const crypto = require('crypto');
const QRCode = require('qrcode');
const { db } = require('../db/database');
const config = require('../config');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit } = require('./pointService');

const QR_SECRET = config.secrets.qrHmac;

/**
 * Q-01: Tadbir QR payloadini generatsiya qilish
 * payload: { event_id, ts, nonce, sig }
 */
function generateEventQrPayload(eventId) {
  const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
  if (!event) throw new Error('Tadbir topilmadi');

  const ts = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(4).toString('hex');
  const secret = event.qr_secret || QR_SECRET;
  const dataToSign = `${eventId}|${ts}|${nonce}`;
  const sig = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

  return {
    event_id: eventId,
    ts,
    nonce,
    sig
  };
}

/**
 * Tadbir QR kodi DataURL rasmini yaratish (ekranda/TV da ko'rsatish uchun)
 */
async function generateEventQrDataUrl(eventId) {
  const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
  if (!event) throw new Error('Tadbir topilmadi');
  
  // Tadbir yaratuvchi QR kodi har doim qat'iy 60 sekunddan yangilanadi!
  const ttl = 60;
  const payload = generateEventQrPayload(eventId);
  const payloadStr = JSON.stringify(payload);
  const validForSeconds = 60 - (payload.ts % 60);
  const dataUrl = await QRCode.toDataURL(payloadStr, {
    width: 480,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0F172A', light: '#FFFFFF' }
  });
  return {
    payload,
    dataUrl,
    ttl,
    valid_for_seconds: validForSeconds,
    expires_at: new Date((Math.floor(payload.ts / 60) + 1) * 60 * 1000).toISOString()
  };
}

/**
 * Q-02: Talaba QR payloadini generatsiya qilish (Mening QR kodim)
 */
function generateStudentQrPayload(studentId) {
  const ts = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(4).toString('hex');
  const dataToSign = `${studentId}|${ts}|${nonce}`;
  const sig = crypto.createHmac('sha256', QR_SECRET).update(dataToSign).digest('hex');

  return {
    student_id: studentId,
    ts,
    nonce,
    sig
  };
}

async function generateStudentQrDataUrl(studentId) {
  const payload = generateStudentQrPayload(studentId);
  const payloadStr = JSON.stringify(payload);
  const validForSeconds = 60 - (payload.ts % 60);
  const dataUrl = await QRCode.toDataURL(payloadStr, {
    width: 360,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0F172A', light: '#FFFFFF' }
  });
  return {
    payload,
    dataUrl,
    ttl: 60,
    valid_for_seconds: validForSeconds,
    expires_at: new Date((Math.floor(payload.ts / 60) + 1) * 60 * 1000).toISOString()
  };
}

/**
 * Tadbir QR ini tekshirish va talabani check-in qilish
 * Talaba kamerasi bilan tadbir QR kodini o'qiydi (Asosiy rejim)
 */
function checkinEventQr(studentId, qrPayloadStr, { deviceHint = null, ip = '127.0.0.1' } = {}) {
  let payload;
  try {
    payload = typeof qrPayloadStr === 'string' ? JSON.parse(qrPayloadStr) : qrPayloadStr;
  } catch (e) {
    throw new Error('QR payload formati noto\'g\'ri');
  }

  const { event_id, ts, nonce, sig } = payload;
  if (!event_id || !ts || !nonce || !sig) {
    throw new Error('QR kodi to\'liq emas yoki noto\'g\'ri formatda');
  }

  const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(event_id);
  if (!event) throw new Error('Tadbir topilmadi');

  // Anti-fraud chorasi: Tadbir yaratuvchining QR kodi har doim 60 sekunddan yangilanadi!
  // Ruxsat etilgan vaqt oralig'i: 60 soniya + 15 soniya tarmoq buferi (jami 75s)
  const refreshSec = 60;
  const allowedWindow = refreshSec + 15;
  const nowTs = Math.floor(Date.now() / 1000);
  if (Math.abs(nowTs - ts) > allowedWindow) {
    throw new Error(`QR kodi eskirgan (amal qilish muddati 60 soniya). Ekranda har 60 sekundda yangilanayotgan yangi QR kodni skanerlang!`);
  }

  // Imzo (sig) tekshiruvi
  const secret = event.qr_secret || QR_SECRET;
  const expectedData = `${event_id}|${ts}|${nonce}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(expectedData).digest('hex');
  if (sig !== expectedSig) {
    throw new Error('QR xavfsizlik imzosi yaroqsiz');
  }

  // Davomat vaqti tekshiruvi:
  // Talab bo'yicha: Davomat tadbir boshlanish vaqtida ochiladi va tadbir tugaganidan keyin 5 daqiqa davom etadi!
  const now = new Date();
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);
  const closesAt = new Date(endsAt.getTime() + 5 * 60 * 1000);

  if (now < startsAt) {
    throw new Error(`Tadbir davomati hali boshlanmagan. Davomat faqat tadbir rejalashtirilgan boshlanish vaqtida ochiladi.`);
  }
  if (now > closesAt) {
    throw new Error('Tadbir vaqti tugagan. Davomat tekshiruvi (attendance checking) yakunlangan (tadbirdan so\'ng 5 daqiqalik qo\'shimcha vaqt tugadi).');
  }

  // Q-04: Bir talaba — bir tadbir — bir check-in
  const existingCheckin = db.prepare(`SELECT * FROM checkin WHERE event_id = ? AND student_id = ?`).get(event_id, studentId);
  if (existingCheckin) {
    throw new Error('Siz ushbu tadbirga allaqachon check-in qilgansiz (Q-04, AT-11)');
  }

  // Q-05: Ro'yxatli tadbirda ro'yxatdan o'tganlik tekshiruvi (QR scan orqali avtomatik ro'yxatga olib davomat qilinadi)
  if (event.requires_registration) {
    const reg = db.prepare(`SELECT * FROM event_registration WHERE event_id = ? AND student_id = ?`).get(event_id, studentId);
    if (!reg) {
      try {
        registerForEvent(studentId, event_id);
      } catch (regErr) {
        throw new Error(regErr.message || 'Ushbu tadbirga ro\'yxatdan o\'tish imkoni bo\'lmadi');
      }
    }
  }

  // Q-08: Aldov belgilari auditi
  if (deviceHint) {
    const recentDeviceCheckins = db.prepare(`
      SELECT COUNT(*) as cnt FROM checkin
      WHERE device_hint = ? AND at >= ?
    `).get(deviceHint, new Date(Date.now() - 2 * 60 * 1000).toISOString()).cnt;
    if (recentDeviceCheckins >= 3) {
      logAudit({
        actor_id: studentId,
        actor_role: 'student',
        action: 'FRAUD_SUSPECT_DEVICE_CHECKIN',
        object_type: 'event',
        object_id: event_id,
        after: { deviceHint, count: recentDeviceCheckins + 1 },
        ip
      });
    }
  }

  // Q-06: Check-in muvaffaqiyatli: PointEntry darhol approved yaratiladi
  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
  const pointEntryId = 'pe_' + crypto.randomBytes(6).toString('hex');
  const checkinId = 'chk_' + crypto.randomBytes(6).toString('hex');
  const nowIso = now.toISOString();

  // Band tanlash: tadbir kategoriyasiga mos
  let itemId = 'i1';
  if (event.category_id === '2') itemId = 'm1';
  else if (event.category_id === '5') itemId = 'p1';
  else if (event.level === 'klub') itemId = 'i2';

  const category = db.prepare(`SELECT * FROM catalog_category WHERE id = ?`).get(event.category_id) || { approver_role: 'dep_yb' };
  const points = event.points || 5;

  const tx = db.transaction(() => {
    // 1. PointEntry
    db.prepare(`
      INSERT INTO point_entry (
        id, student_id, item_id, item_version, category_id, base_points, points,
        note, event_date, source, created_by, created_at, status, approver_role,
        approved_by, approved_at, event_id, season_id
      ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 'qr', 'system', ?, 'approved', ?, 'system', ?, ?, ?)
    `).run(
      pointEntryId,
      studentId,
      itemId,
      event.category_id,
      points,
      points,
      `QR check-in: ${event.title}`,
      nowIso.split('T')[0],
      nowIso,
      category.approver_role,
      nowIso,
      event_id,
      currentSeason.id
    );

    // 2. History
    db.prepare(`
      INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
      VALUES (?, NULL, 'approved', 'system', ?, 'QR check-in orqali avtomatik yozildi (Q-06)')
    `).run(pointEntryId, nowIso);

    // 3. Checkin yozuvi
    db.prepare(`
      INSERT INTO checkin (id, event_id, student_id, at, mode, device_hint, entry_id)
      VALUES (?, ?, ?, ?, 'event_qr', ?, ?)
    `).run(checkinId, event_id, studentId, nowIso, deviceHint, pointEntryId);

    // Audit
    logAudit({
      actor_id: studentId,
      actor_role: 'student',
      action: 'QR_CHECKIN_SUCCESS',
      object_type: 'event',
      object_id: event_id,
      after: { points, entry_id: pointEntryId },
      ip
    });
  });

  tx();
  recalculateStudentScores();

  const studentTotal = db.prepare(`SELECT total FROM student_score WHERE student_id = ?`).get(studentId);

  return {
    success: true,
    points,
    event_title: event.title,
    student_total: studentTotal ? studentTotal.total : points,
    message: `Tabriklaymiz! ${event.title} tadbiri uchun +${points} ball yozildi!`
  };
}

/**
 * Tashkilotchi talabaning QR kodini skanerlaganda (2-rejim: hodim talabani skanerlaydi)
 */
function checkinStudentQr(staffUser, eventId, studentQrPayloadStr, ip = '127.0.0.1') {
  let payload;
  try {
    payload = typeof studentQrPayloadStr === 'string' ? JSON.parse(studentQrPayloadStr) : studentQrPayloadStr;
  } catch (e) {
    throw new Error('Talaba QR kodi formati noto\'g\'ri');
  }

  const { student_id, ts, sig, nonce } = payload;
  if (!student_id || !ts || !sig) throw new Error('Talaba QR kodi to\'liq emas');

  const nowTs = Math.floor(Date.now() / 1000);
  // 60 soniya + 15 soniya bufer (jami 75 soniya)
  if (Math.abs(nowTs - ts) > 75) {
    throw new Error('Talaba QR kodi eskirgan (amal qilish muddati 60 soniya). Talaba ilovasida yangilangan QR kodni skanerlang.');
  }

  // Imzo tekshiruvi (nonce bilan yoki nonce-siz orqaga moslik)
  const expectedWithNonce = nonce ? crypto.createHmac('sha256', QR_SECRET).update(`${student_id}|${ts}|${nonce}`).digest('hex') : null;
  const expectedWithoutNonce = crypto.createHmac('sha256', QR_SECRET).update(`${student_id}|${ts}`).digest('hex');

  if (sig !== expectedWithNonce && sig !== expectedWithoutNonce) {
    throw new Error('Talaba QR xavfsizlik imzosi mos kelmadi');
  }

  const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
  if (!event) throw new Error('Tadbir topilmadi');

  // Davomat vaqti tekshiruvi (tadbir boshlanishidan to yakunidan keyingi 5 daqiqagacha)
  const now = new Date();
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);
  const closesAt = new Date(endsAt.getTime() + 5 * 60 * 1000);

  if (now < startsAt) {
    throw new Error('Tadbir davomati hali boshlanmagan. Davomat faqat tadbir rejalashtirilgan boshlanish vaqtida ochiladi.');
  }
  if (now > closesAt) {
    throw new Error('Tadbir davomat vaqti yakunlangan (tadbirdan so\'ng 5 daqiqalik qo\'shimcha vaqt tugadi).');
  }

  const student = db.prepare(`SELECT * FROM student WHERE id = ? AND status = 'active'`).get(student_id);
  if (!student) {
    throw new Error('Talaba bazada topilmadi yoki hisobi faol emas');
  }

  const existingCheckin = db.prepare(`SELECT * FROM checkin WHERE event_id = ? AND student_id = ?`).get(eventId, student_id);
  if (existingCheckin) {
    throw new Error(`Ushbu talaba (${student.first_name} ${student.last_name}) tadbirga allaqachon ro'yxatga olingan`);
  }

  // Agar tadbir oldindan ro'yxat talab qilsa, avtomatik ro'yxatga qo'shamiz
  if (event.requires_registration) {
    const reg = db.prepare(`SELECT * FROM event_registration WHERE event_id = ? AND student_id = ?`).get(eventId, student_id);
    if (!reg) {
      try { registerForEvent(student_id, eventId); } catch(e) {}
    }
  }

  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
  const pointEntryId = 'pe_' + crypto.randomBytes(6).toString('hex');
  const checkinId = 'chk_' + crypto.randomBytes(6).toString('hex');
  const nowIso = now.toISOString();
  const points = event.points || 5;
  const staffIdentifier = (staffUser && (staffUser.full_name || staffUser.id || staffUser.name)) || 'KPI Hodim';

  let itemId = 'i1';
  if (event.category_id === '2') itemId = 'm1';
  else if (event.category_id === '5') itemId = 'p1';
  else if (event.level === 'klub') itemId = 'i2';

  const category = db.prepare(`SELECT * FROM catalog_category WHERE id = ?`).get(event.category_id) || { approver_role: 'dep_yb' };

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO point_entry (
        id, student_id, item_id, item_version, category_id, base_points, points,
        note, event_date, source, created_by, created_at, status, approver_role,
        approved_by, approved_at, event_id, season_id
      ) VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, 'qr', ?, ?, 'approved', ?, ?, ?, ?, ?)
    `).run(
      pointEntryId,
      student_id,
      itemId,
      event.category_id,
      points,
      points,
      `Hodim skaner tekshiruvi: ${event.title}`,
      nowIso.split('T')[0],
      staffIdentifier,
      nowIso,
      category.approver_role,
      staffIdentifier,
      nowIso,
      eventId,
      currentSeason.id
    );

    db.prepare(`
      INSERT INTO checkin (id, event_id, student_id, at, mode, scanned_by, entry_id)
      VALUES (?, ?, ?, ?, 'student_qr', ?, ?)
    `).run(checkinId, eventId, student_id, nowIso, staffIdentifier, pointEntryId);
  });

  tx();
  recalculateStudentScores();

  // Telegram orqali xabar yuborish
  try {
    const { notifyStudentEventCheckin } = require('./telegramService');
    notifyStudentEventCheckin(student_id, event, points);
  } catch (e) {
    console.error('Checkin student telegram notify error:', e.message);
  }

  return {
    success: true,
    points,
    student_id,
    checked_in_at: nowIso,
    event_title: event.title,
    student: {
      id: student.id,
      external_id: student.external_id,
      first_name: student.first_name,
      last_name: student.last_name,
      full_name: `${student.first_name} ${student.last_name}`,
      group_code: student.group_code,
      program_code: student.program_code,
      course: student.course,
      photo_url: student.photo_url || null
    }
  };
}

/**
 * Tadbirga oldindan ro'yxatdan o'tish (M-05, AT-13)
 */
function registerForEvent(studentId, eventId) {
  const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
  if (!event) throw new Error('Tadbir topilmadi');

  const existing = db.prepare(`SELECT * FROM event_registration WHERE event_id = ? AND student_id = ?`).get(eventId, studentId);
  if (existing) {
    return { success: true, already_registered: true, message: 'Siz allaqachon ro\'yxatdan o\'tgansiz' };
  }

  // Capacity tekshiruvi
  let waitlistPos = null;
  if (event.capacity) {
    const currentRegCount = db.prepare(`
      SELECT COUNT(*) as cnt FROM event_registration WHERE event_id = ? AND waitlist_pos IS NULL
    `).get(eventId).cnt;

    if (currentRegCount >= event.capacity) {
      // Navbatga qo'yish (waitlist)
      const waitlistCount = db.prepare(`
        SELECT COUNT(*) as cnt FROM event_registration WHERE event_id = ? AND waitlist_pos IS NOT NULL
      `).get(eventId).cnt;
      waitlistPos = waitlistCount + 1;
    }
  }

  const regId = 'reg_' + crypto.randomBytes(6).toString('hex');
  const nowIso = new Date().toISOString();

  db.prepare(`
    INSERT INTO event_registration (id, event_id, student_id, registered_at, waitlist_pos, no_show)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(regId, eventId, studentId, nowIso, waitlistPos);

  if (waitlistPos) {
    return {
      success: true,
      in_waitlist: true,
      waitlist_pos: waitlistPos,
      message: `Joylar to'lgan. Siz kutish navbatiga qo'shildingiz (navbatingiz: ${waitlistPos})`
    };
  }

  return {
    success: true,
    in_waitlist: false,
    message: 'Tadbirga muvaffaqiyatli ro\'yxatdan o\'tdingiz!'
  };
}

module.exports = {
  generateEventQrPayload,
  generateEventQrDataUrl,
  generateStudentQrPayload,
  generateStudentQrDataUrl,
  checkinEventQr,
  checkinStudentQr,
  registerForEvent
};
