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
  const payload = generateEventQrPayload(eventId);
  const payloadStr = JSON.stringify(payload);
  const dataUrl = await QRCode.toDataURL(payloadStr, {
    width: 320,
    margin: 2,
    color: { dark: '#0F172A', light: '#FFFFFF' }
  });
  return {
    payload,
    dataUrl,
    ttl: 60
  };
}

/**
 * Q-02: Talaba QR payloadini generatsiya qilish (Mening QR kodim)
 */
function generateStudentQrPayload(studentId) {
  const ts = Math.floor(Date.now() / 1000);
  const dataToSign = `${studentId}|${ts}`;
  const sig = crypto.createHmac('sha256', QR_SECRET).update(dataToSign).digest('hex');

  return {
    student_id: studentId,
    ts,
    sig
  };
}

async function generateStudentQrDataUrl(studentId) {
  const payload = generateStudentQrPayload(studentId);
  const payloadStr = JSON.stringify(payload);
  const dataUrl = await QRCode.toDataURL(payloadStr, {
    width: 280,
    margin: 2,
    color: { dark: '#0F172A', light: '#FFFFFF' }
  });
  return {
    payload,
    dataUrl,
    ttl: 60
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

  // Q-01: ts ni tekshirish: qabul oynasi +-90s
  const nowTs = Math.floor(Date.now() / 1000);
  if (Math.abs(nowTs - ts) > 90) {
    throw new Error('QR kodi eskirgan (amal qilish muddati 90 soniya). Yangi QR kodni skanerlang (Q-01, AT-12)');
  }

  // Imzo (sig) tekshiruvi
  const secret = event.qr_secret || QR_SECRET;
  const expectedData = `${event_id}|${ts}|${nonce}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(expectedData).digest('hex');
  if (sig !== expectedSig) {
    throw new Error('QR xavfsizlik imzosi yaroqsiz (Q-01)');
  }

  // Q-03: Vaqt oynasi tekshiruvi: boshlanishidan 15 min oldin - tugashidan 30 min keyin
  const now = new Date();
  const startsAt = new Date(event.starts_at);
  const endsAt = new Date(event.ends_at);
  const minAllowedTime = new Date(startsAt.getTime() - 15 * 60 * 1000);
  const maxAllowedTime = new Date(endsAt.getTime() + 30 * 60 * 1000);

  if (now < minAllowedTime) {
    throw new Error('Tadbir hali boshlanmagan. Check-in tadbir boshlanishiga 15 daqiqa qolganda ochiladi (Q-03, AT-10)');
  }
  if (now > maxAllowedTime) {
    throw new Error('Tadbir vaqti tugagan. Check-in yopilgan (Q-03)');
  }

  // Q-04: Bir talaba — bir tadbir — bir check-in
  const existingCheckin = db.prepare(`SELECT * FROM checkin WHERE event_id = ? AND student_id = ?`).get(event_id, studentId);
  if (existingCheckin) {
    throw new Error('Siz ushbu tadbirga allaqachon check-in qilgansiz (Q-04, AT-11)');
  }

  // Q-05: Ro'yxatli tadbirda ro'yxatdan o'tganlik tekshiruvi
  if (event.requires_registration) {
    const reg = db.prepare(`SELECT * FROM event_registration WHERE event_id = ? AND student_id = ?`).get(event_id, studentId);
    if (!reg) {
      throw new Error('Ushbu tadbirga faqat oldindan ro\'yxatdan o\'tgan talabalar check-in qila oladi (Q-05)');
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
 * Tashkilotchi talabaning QR kodini skanerlaganda (2-rejim, kichik tadbirlar)
 */
function checkinStudentQr(staffUser, eventId, studentQrPayloadStr, ip = '127.0.0.1') {
  let payload;
  try {
    payload = typeof studentQrPayloadStr === 'string' ? JSON.parse(studentQrPayloadStr) : studentQrPayloadStr;
  } catch (e) {
    throw new Error('Talaba QR kodi formati noto\'g\'ri');
  }

  const { student_id, ts, sig } = payload;
  if (!student_id || !ts || !sig) throw new Error('Talaba QR kodi to\'liq emas');

  const nowTs = Math.floor(Date.now() / 1000);
  if (Math.abs(nowTs - ts) > 90) {
    throw new Error('Talaba QR kodi eskirgan (90s oyna)');
  }

  const expectedData = `${student_id}|${ts}`;
  const expectedSig = crypto.createHmac('sha256', QR_SECRET).update(expectedData).digest('hex');
  if (sig !== expectedSig) {
    throw new Error('Talaba QR xavfsizlik imzosi mos kelmadi');
  }

  const event = db.prepare(`SELECT * FROM event WHERE id = ?`).get(eventId);
  if (!event) throw new Error('Tadbir topilmadi');

  const existingCheckin = db.prepare(`SELECT * FROM checkin WHERE event_id = ? AND student_id = ?`).get(eventId, student_id);
  if (existingCheckin) {
    throw new Error('Ushbu talaba allaqachon ro\'yxatga olingan');
  }

  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
  const pointEntryId = 'pe_' + crypto.randomBytes(6).toString('hex');
  const checkinId = 'chk_' + crypto.randomBytes(6).toString('hex');
  const nowIso = new Date().toISOString();
  const points = event.points || 5;

  db.prepare(`
    INSERT INTO point_entry (
      id, student_id, item_id, item_version, category_id, base_points, points,
      note, event_date, source, created_by, created_at, status, approver_role,
      approved_by, approved_at, event_id, season_id
    ) VALUES (?, ?, 'i1', 1, ?, ?, ?, ?, ?, 'qr', ?, 'approved', 'dep_yb', ?, ?, ?, ?)
  `).run(
    pointEntryId,
    student_id,
    event.category_id,
    points,
    points,
    `Tashkilotchi tekshiruvi: ${event.title}`,
    nowIso.split('T')[0],
    staffUser.id,
    nowIso,
    staffUser.id,
    nowIso,
    eventId,
    currentSeason.id
  );

  db.prepare(`
    INSERT INTO checkin (id, event_id, student_id, at, mode, scanned_by, entry_id)
    VALUES (?, ?, ?, ?, 'student_qr', ?, ?)
  `).run(checkinId, eventId, student_id, nowIso, staffUser.id, pointEntryId);

  recalculateStudentScores();
  return { success: true, points, student_id };
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
