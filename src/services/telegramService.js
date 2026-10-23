const crypto = require('crypto');
const { db } = require('../db/database');
const config = require('../config');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit, awardWelcomeBonus } = require('./pointService');

const BOT_TOKEN = config.telegram.botToken;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SUPERADMIN_TG_ID = '1202082857';

let isPolling = false;
let pollingOffset = 0;

/**
 * Telegram API ga xabar yuborish
 */
async function sendTelegramMessage(chatId, text, options = {}) {
  try {
    const url = `${TELEGRAM_API}/sendMessage`;
    const body = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    return data;
  } catch (err) {
    console.error('Telegram sendMessage error:', err.message);
    return null;
  }
}

/**
 * Telegram API ga rasm (photo) bilan xabar yuborish
 */
async function sendTelegramPhoto(chatId, photo, caption = '', options = {}) {
  try {
    const url = `${TELEGRAM_API}/sendPhoto`;
    const body = {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: 'HTML',
      ...options
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    return data;
  } catch (err) {
    console.error('Telegram sendPhoto error:', err.message);
    return null;
  }
}

/**
 * Telegram Callback Query ga javob qaytarish
 */
async function answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
  try {
    const url = `${TELEGRAM_API}/answerCallbackQuery`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert
      })
    });
  } catch (err) {
    console.error('answerCallbackQuery error:', err.message);
  }
}

/**
 * Telegram xabarini tahrirlash
 */
async function editTelegramMessage(chatId, messageId, text, options = {}) {
  try {
    const url = `${TELEGRAM_API}/editMessageText`;
    const body = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...options
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return await resp.json();
  } catch (err) {
    console.error('editTelegramMessage error:', err.message);
    return null;
  }
}

/**
 * Telegram User ID yoki username bo'yicha Telegram chat ma'lumotlarini (username, ism, familiya) olish
 * @param {string|number} target - Telegram User ID (masalan: 1202082857) yoki @username
 */
async function resolveTelegramChatInfo(target) {
  if (!target) return { success: false, error: "Telegram ID ko'rsatilmadi" };
  try {
    let raw = String(target).trim();
    if (!raw) return { success: false, error: "Telegram ID bo'sh" };

    // Agar @ siz username kiritilgan bo'lsa (lekin faqat raqam bo'lmasa)
    let chatParam = raw;
    if (!/^-?\d+$/.test(raw) && !raw.startsWith('@')) {
      chatParam = `@${raw}`;
    }

    const url = `${TELEGRAM_API}/getChat?chat_id=${encodeURIComponent(chatParam)}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.ok && data.result) {
      const res = data.result;
      const username = res.username ? res.username.replace(/^@/, '') : null;
      return {
        success: true,
        id: String(res.id),
        username: username,
        firstName: res.first_name || null,
        lastName: res.last_name || null,
        title: res.title || null
      };
    } else {
      const desc = data.description || 'Chat topilmadi';
      const isNotStarted = desc.toLowerCase().includes('chat not found');
      return {
        success: false,
        not_started: isNotStarted,
        error: desc
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * M-01: Telegram WebApp initData ni bot token bilan HMAC tekshirish
 */
function verifyTelegramInitData(initData) {
  if (!initData) return null;
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    urlParams.delete('hash');
    const params = [];
    for (const [key, val] of urlParams.entries()) {
      params.push(`${key}=${val}`);
    }
    params.sort();
    const dataCheckString = params.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    const userStr = urlParams.get('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Telegram Bot foydalanuvchisi faoliyatini qayd qilish (Audit & Monitoring)
 */
function recordBotActivity(telegramUserId, actionType, details, meta = {}) {
  try {
    const tgId = String(telegramUserId);
    const nowIso = new Date().toISOString();
    const student = meta.studentId 
      ? db.prepare('SELECT id, phone FROM student WHERE id = ?').get(meta.studentId)
      : db.prepare('SELECT id, phone FROM student WHERE telegram_user_id = ?').get(tgId);
    
    const studentId = student ? student.id : (meta.studentId || null);
    const phone = meta.phone || (student ? student.phone : null);

    // 1. Foydalanuvchini telegram_bot_user jadvalida saqlash yoki yangilash
    const existing = db.prepare('SELECT telegram_user_id FROM telegram_bot_user WHERE telegram_user_id = ?').get(tgId);
    if (!existing) {
      db.prepare(`
        INSERT INTO telegram_bot_user (
          telegram_user_id, username, first_name, last_name, phone, student_id, started_at, last_seen_at, actions_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        tgId,
        meta.username || null,
        meta.firstName || null,
        meta.lastName || null,
        phone,
        studentId,
        nowIso,
        nowIso
      );
    } else {
      db.prepare(`
        UPDATE telegram_bot_user SET
          last_seen_at = ?,
          actions_count = actions_count + 1,
          username = COALESCE(?, username),
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          student_id = COALESCE(?, student_id)
        WHERE telegram_user_id = ?
      `).run(
        nowIso,
        meta.username || null,
        meta.firstName || null,
        meta.lastName || null,
        phone,
        studentId,
        tgId
      );
    }

    // 2. Amallar jurnaliga kiritish
    db.prepare(`
      INSERT INTO telegram_bot_log (telegram_user_id, student_id, action_type, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(tgId, studentId, actionType, typeof details === 'object' ? JSON.stringify(details) : String(details), nowIso);

  } catch (err) {
    console.error('recordBotActivity error:', err.message);
  }
}

/**
 * Yangi tadbir e'lon qilinganda bot orqali barcha talabalarga bildirishnoma tarqatish
 */
async function broadcastNewEventToStudents(event) {
  if (!event) return;
  try {
    const students = db.prepare(`
      SELECT id, first_name, last_name, telegram_user_id
      FROM student
      WHERE telegram_user_id IS NOT NULL AND status = 'active'
    `).all();

    if (!students || students.length === 0) return;

    const startsDate = new Date(event.starts_at);
    const dateFormatted = startsDate.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = startsDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const attOpenMin = event.attendance_open_minutes_before ?? 5;

    const text = `📢 <b>YANGI TADBIR E'LON QILINDI!</b> 🎓\n\n` +
      `🏆 <b>${event.title}</b>\n` +
      `⭐ Ball: <b>+${event.points} ball</b>\n` +
      `📍 O'tkazilish joyi: <b>${event.place}</b>\n` +
      `📅 Sana: <b>${dateFormatted}</b>\n` +
      `🕒 Boshlanish vaqti: <b>${timeFormatted}</b>\n` +
      `⏱️ Davomat boshlanadi: <b>Tadbirdan ${attOpenMin} daqiqa oldin</b>\n\n` +
      `<i>Tadbir boshlanganda Telegram Mini App orqali QR kodni skanerlab ballingizni qo'lga kiriting!</i>`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '📱 Tadbirlarni ko\'rish (Mini App)', web_app: { url: `${config.baseUrl}/miniapp` } }
        ]
      ]
    };

    // Orqa fonda xavfsiz asinxron yuborish
    (async () => {
      let sentCount = 0;
      let rawPhoto = event.photo_url || event.image_url;
      let fullPhotoUrl = null;
      if (rawPhoto) {
        fullPhotoUrl = rawPhoto.startsWith('http') ? rawPhoto : `${config.baseUrl}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}`;
      }

      for (const st of students) {
        try {
          let photoSent = false;
          if (fullPhotoUrl) {
            const photoRes = await sendTelegramPhoto(st.telegram_user_id, fullPhotoUrl, text, { reply_markup: replyMarkup });
            if (photoRes && photoRes.ok) photoSent = true;
          }
          if (!photoSent) {
            await sendTelegramMessage(st.telegram_user_id, text, { reply_markup: replyMarkup });
          }
          sentCount++;
          await new Promise(r => setTimeout(r, 45)); // Rate-limiting tolerans
        } catch (e) {
          console.warn(`Broadcast error to ${st.telegram_user_id}:`, e.message);
        }
      }
      recordBotActivity(SUPERADMIN_TG_ID, 'broadcast_event', `"${event.title}" tadbiri ${sentCount}/${students.length} nafar talabaga yuborildi`, {
        studentId: null
      });
    })();

  } catch (err) {
    console.error('broadcastNewEventToStudents error:', err.message);
  }
}

/**
 * Talabaning tadbirga ro'yxatdan o'tganligini bildirish
 */
async function notifyStudentEventRegistration(studentId, event, inWaitlist = false, waitlistPos = null) {
  try {
    const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(studentId);
    if (!student || !student.telegram_user_id) return;

    const startsDate = new Date(event.starts_at);
    const dateFormatted = startsDate.toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeFormatted = startsDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const attOpenMin = event.attendance_open_minutes_before ?? 5;

    let text = '';
    if (inWaitlist) {
      text = `⏳ <b>TADBIR KUTISH NAVBATIGA QO'SHILDINGIZ</b>\n\n` +
        `📌 <b>Tadbir:</b> ${event.title}\n` +
        `🔢 <b>Navbatingiz:</b> #${waitlistPos}\n` +
        `📍 <b>O'tkazilish joyi:</b> ${event.place}\n` +
        `🕒 <b>Vaqt:</b> ${dateFormatted}, soat ${timeFormatted}\n` +
        `⭐ <b>Ball:</b> +${event.points} ball\n\n` +
        `<i>Joy bo'shashi bilan avtomatik asosiy ro'yxatga o'tasiz va sizga xabar beriladi.</i>`;
    } else {
      text = `🎫 <b>TADBIRGA RO'YXATDAN O'TDINGIZ!</b> ✅\n\n` +
        `📌 <b>Tadbir:</b> ${event.title}\n` +
        `⭐ <b>Ball:</b> +${event.points} ball\n` +
        `📍 <b>O'tkazilish joyi:</b> ${event.place}\n` +
        `📅 <b>Sana:</b> ${dateFormatted}\n` +
        `🕒 <b>Boshlanish vaqti:</b> ${timeFormatted}\n` +
        `⏱️ <b>Davomat ochiladi:</b> Tadbirdan ${attOpenMin} daqiqa oldin\n\n` +
        `💡 <b>Eslatma:</b> Davomat vaqtida tadbir zalidagi QR kodni Mini App orqali skanerlab ballni qo'lga kiriting!`;
    }

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '📱 Tadbirlar bo\'limiga o\'tish', web_app: { url: `${config.baseUrl}/miniapp` } }
        ]
      ]
    };

    let rawPhoto = event.photo_url || event.image_url;
    if (rawPhoto) {
      let fullPhotoUrl = rawPhoto.startsWith('http') ? rawPhoto : `${config.baseUrl}${rawPhoto.startsWith('/') ? '' : '/'}${rawPhoto}`;
      const res = await sendTelegramPhoto(student.telegram_user_id, fullPhotoUrl, text, { reply_markup: replyMarkup });
      if (res && res.ok) return;
    }

    await sendTelegramMessage(student.telegram_user_id, text, { reply_markup: replyMarkup });
  } catch (e) {
    console.error('notifyStudentEventRegistration error:', e.message);
  }
}

/**
 * Talabaning tadbirdan ro'yxatdan chiqqanligini bildirish
 */
async function notifyStudentEventUnregister(studentId, event) {
  try {
    const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(studentId);
    if (!student || !student.telegram_user_id) return;

    const text = `ℹ️ <b>Tadbirdan ro'yxatdan chiqildi</b>\n\n` +
      `Siz <b>"${event.title}"</b> tadbiriga ro'yxatdan o'tishingizni bekor qildingiz.\n` +
      `Bo'shatilgan o'rin boshqa talabalar uchun ochildi.`;

    await sendTelegramMessage(student.telegram_user_id, text);
  } catch (e) {
    console.error('notifyStudentEventUnregister error:', e.message);
  }
}

/**
 * Talabaning tadbir davomatidan o'tganligini (check-in) bildirish
 */
async function notifyStudentEventCheckin(studentId, event, points) {
  try {
    const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(studentId);
    if (!student || !student.telegram_user_id) return;

    const score = db.prepare(`SELECT total FROM student_score WHERE student_id = ?`).get(studentId);
    const total = score ? score.total : points;

    const text = `🎉 <b>TABRIKLAYMIZ! DAVOMAT TASDIQLANDI!</b> ✅\n\n` +
      `📌 <b>Tadbir:</b> ${event.title}\n` +
      `⭐ <b>Qo'shilgan ball:</b> +${points} ball\n` +
      `📍 <b>O'tkazilish joyi:</b> ${event.place}\n` +
      `🏆 <b>Mavsumiy jami ballingiz:</b> <b>${total} ball</b>\n\n` +
      `Universitet hayotida faol ishtirokingiz uchun tashakkur! 🚀`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '📊 Reyting & Natijalarim', web_app: { url: `${config.baseUrl}/miniapp` } }
        ]
      ]
    };

    await sendTelegramMessage(student.telegram_user_id, text, { reply_markup: replyMarkup });
  } catch (e) {
    console.error('notifyStudentEventCheckin error:', e.message);
  }
}

/**
 * M-01, N-10: Talabaning telefon raqami orqali Telegram akkauntini bog'lash va +5 kirish balli berish
 */
function linkStudentTelegramAccount(telegramUserId, phoneNumber) {
  let cleanDigits = String(phoneNumber).replace(/[^0-9]/g, '');
  const last9 = cleanDigits.slice(-9);
  const formattedPhone = cleanDigits.startsWith('998') ? '+' + cleanDigits : (cleanDigits.length === 9 ? '+998' + cleanDigits : '+' + cleanDigits);
  const phoneWithoutPlus = formattedPhone.replace('+', '');

  const student = db.prepare(`
    SELECT * FROM student
    WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ?
       OR phone = ? OR phone = ?
    LIMIT 1
  `).get('%' + last9, formattedPhone, phoneWithoutPlus);

  if (!student) {
    return {
      success: false,
      message: 'Telefon raqamingiz Registrator bazasida topilmadi. Iltimos, tyutoringizga yoki O\'quv bo\'limiga murojaat qiling.'
    };
  }

  const now = new Date().toISOString();

  // Telegram user id ni bog'lash
  db.prepare(`
    UPDATE student
    SET telegram_user_id = ?, updated_at = ?
    WHERE id = ?
  `).run(String(telegramUserId), now, student.id);

  // Xush kelibsiz bonusi (+5 ball)
  const bonusRes = awardWelcomeBonus(student.id);

  // Bildirishnoma yuborish (N-10)
  if (bonusRes && bonusRes.success) {
    notifyStudent(student.id, 'N-10').catch(e => console.error('Bonus notify error:', e));
  }

  return {
    success: true,
    student,
    bonus_awarded: Boolean(bonusRes && bonusRes.success),
    message: bonusRes && bonusRes.success 
      ? 'Akkauntingiz muvaffaqiyatli bog\'landi! Sizga +5 ball xush kelibsiz bonusi taqdim etildi! 🎉'
      : 'Akkauntingiz muvaffaqiyatli bog\'landi! ✅'
  };
}

/**
 * Bildirishnoma shablonlari (N-01 .. N-10)
 */
async function notifyStudent(studentId, templateCode, data = {}) {
  const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(studentId);
  if (!student || !student.telegram_user_id) return;

  const score = db.prepare(`SELECT total FROM student_score WHERE student_id = ?`).get(studentId);
  const total = score ? score.total : 0;

  let message = '';

  switch (templateCode) {
    case 'N-01':
      message = `🎯 <b>+${data.points} ball</b> — ${data.category_name} · ${data.item_name}.\nKiritdi: tyutor <i>${data.tutor_name || 'Tyutor'}</i>, tasdiqladi: <i>${data.dept_name || 'Bo\'lim'}</i>.\nJami ballingiz: <b>${total}</b>.`;
      break;
    case 'N-02':
      message = `⏳ Tyutoringiz <b>+${data.points} ball</b> (${data.item_name}) kiritdi — ${data.dept_name || 'Bo\'lim'} tasdig'ini kutmoqda.`;
      break;
    case 'N-03':
      message = `↩️ <b>${data.item_name} (+${data.points})</b> rad etildi.\nSabab: <i>${data.reason}</i>\n⚠️ 3 kun ichida ilovadan e'tiroz bildirishingiz mumkin.`;
      break;
    case 'N-04':
      message = `✅ <b>${data.event_title}</b>: +${data.points} ball yozildi.\nJami ballingiz: <b>${total}</b>.`;
      break;
    case 'N-05':
      message = `📅 Ertaga <b>${data.time}</b> — <b>${data.event_title}</b> (+${data.points} ball).\nSiz ro'yxatdasiz. Manzil: ${data.place}.`;
      break;
    case 'N-06':
      message = `🏆 <b>Haftaning yulduzlari e'lon qilindi!</b>\nSiz o'z guruhingizda <b>${data.rank || 1}-o'rin</b>dasiz.`;
      break;
    case 'N-08':
      message = `👋 <b>Salom, ${student.first_name}!</b>\n30 kundan beri ball olmadingiz. Reytingda orqada qolib ketmang! Yaqin tadbirlar ro'yxatini ilovada ko'ring.`;
      break;
    case 'N-09':
      message = `⚠️ <b>Ogohlantirish:</b> Qoidabuzarlik bo'yicha <b>-30 ball</b> yozildi (Asos: ${data.doc || 'Rektor buyrug\'i'}).\n3 kun ichida e'tiroz berishingiz mumkin.`;
      break;
    case 'N-10':
      message = `🎉 <b>Xush kelibsiz!</b>\n+5 kirish balli yozildi. Ballaringiz va reyting — pastdagi <b>"Kabinet"</b> tugmasida.`;
      break;
  }

  if (message) {
    await sendTelegramMessage(student.telegram_user_id, message);
  }
}

/**
 * Bo'lim xodimlariga navbat eslatmasi (N-07)
 */
async function notifyStaffDept(deptRole, pendingCount, lateCount) {
  const staffList = db.prepare(`SELECT * FROM staff_user WHERE roles LIKE ? AND active = 1`).all(`%${deptRole}%`);
  const text = `📥 <b>Tasdiq navbatida:</b> ${pendingCount} ta yozuv kutilmoqda${lateCount > 0 ? `, shundan <b>${lateCount} tasi 3 kundan oshgan</b> (kechikkan)!` : '.'}`;
  for (const s of staffList) {
    if (s.telegram_user_id) {
      await sendTelegramMessage(s.telegram_user_id, text);
    }
  }
}

/**
 * Xodimga Telegram orqali rasmiy bildirishnoma yuborish va audit jurnaliga qayd etish
 */
async function sendStaffTelegramNotification({ staff_id, type = 'system_alert', title = '', message, reply_markup = null }) {
  const staff = db.prepare(`SELECT * FROM staff_user WHERE id = ?`).get(staff_id);
  if (!staff) return { success: false, error: 'Xodim topilmadi' };

  const now = new Date().toISOString();

  if (!staff.telegram_user_id) {
    db.prepare(`
      INSERT INTO staff_notification_log (staff_id, telegram_user_id, notification_type, title, message, status, error_message, sent_at)
      VALUES (?, NULL, ?, ?, ?, 'failed', 'Telegram ID biriktirilmagan (Botga start bosmagan)', ?)
    `).run(staff.id, type, title, message, now);
    return { success: false, error: 'Telegram ID biriktirilmagan' };
  }

  const tgId = String(staff.telegram_user_id);
  const res = await sendTelegramMessage(tgId, message, reply_markup ? { reply_markup } : {});

  if (res && res.ok) {
    db.prepare(`
      UPDATE staff_user 
      SET bot_status = 'active', last_notification_at = ?, last_active_at = COALESCE(last_active_at, ?)
      WHERE id = ?
    `).run(now, now, staff.id);

    db.prepare(`
      INSERT INTO staff_notification_log (staff_id, telegram_user_id, notification_type, title, message, status, error_message, sent_at)
      VALUES (?, ?, ?, ?, ?, 'delivered', NULL, ?)
    `).run(staff.id, tgId, type, title, message, now);

    logAudit({
      actor_id: 'system',
      actor_role: 'system',
      action: 'STAFF_NOTIF_DELIVERED',
      object_type: 'staff_user',
      object_id: staff.id,
      after: { type, title, delivered_to: tgId }
    });

    return { success: true, delivered: true };
  } else {
    const errorDesc = res && res.description ? res.description : 'Xabar yuborishda xatolik';
    const isDeactivatedOrBlocked = errorDesc.toLowerCase().includes('blocked') || errorDesc.toLowerCase().includes('deactivated');
    const isNotFound = errorDesc.toLowerCase().includes('chat not found');

    const status = isDeactivatedOrBlocked ? 'blocked' : (isNotFound ? 'not_started' : 'failed');

    if (isDeactivatedOrBlocked) {
      db.prepare(`UPDATE staff_user SET bot_status = 'blocked', last_notification_at = ? WHERE id = ?`).run(now, staff.id);
    } else if (isNotFound) {
      db.prepare(`UPDATE staff_user SET bot_status = 'not_started', last_notification_at = ? WHERE id = ?`).run(now, staff.id);
    }

    db.prepare(`
      INSERT INTO staff_notification_log (staff_id, telegram_user_id, notification_type, title, message, status, error_message, sent_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(staff.id, tgId, type, title, message, status, errorDesc, now);

    logAudit({
      actor_id: 'system',
      actor_role: 'system',
      action: isDeactivatedOrBlocked ? 'STAFF_NOTIF_BLOCKED' : (isNotFound ? 'STAFF_NOTIF_NOT_STARTED' : 'STAFF_NOTIF_FAILED'),
      object_type: 'staff_user',
      object_id: staff.id,
      after: { type, title, error: errorDesc }
    });

    return { success: false, blocked: isDeactivatedOrBlocked, not_started: isNotFound, error: errorDesc };
  }
}

/**
 * Tyutor ball kiritganda mas'ul bo'lim xodimlariga va superadminga avtomatik Telegram bildirishnoma yuborish
 */
async function notifyApproversForNewPoints(entryIds, creatorUser) {
  if (!entryIds || entryIds.length === 0) return;
  try {
    const placeholders = entryIds.map(() => '?').join(',');
    const entries = db.prepare(`
      SELECT pe.*, st.first_name, st.last_name, st.group_code, ci.name as item_name, cc.name as category_name
      FROM point_entry pe
      JOIN student st ON pe.student_id = st.id
      JOIN catalog_item ci ON pe.item_id = ci.id
      JOIN catalog_category cc ON pe.category_id = cc.id
      WHERE pe.id IN (${placeholders})
    `).all(...entryIds);

    if (!entries || entries.length === 0) return;

    // Approver_role bo'yicha guruhlash
    const byRole = {};
    for (const e of entries) {
      const role = e.approver_role || 'dep_yb';
      if (!byRole[role]) byRole[role] = [];
      byRole[role].push(e);
    }

    const roleTitles = {
      'dep_yb': "Yoshlar bilan ishlash bo'limi",
      'dep_mb': "Ma'naviyat va ma'rifat bo'limi",
      'dep_ob': "O'quv-uslubiy boshqarma (Registrator)",
      'dep_ib': "Ilmiy va innovatsiyalar bo'limi",
      'dep_sb': "Sanoat bilan hamkorlik bo'limi",
      'dep_pb': "Matbuot xizmati (PR)",
      'prorektor': "Yoshlar masalalari bo'yicha prorektor"
    };

    for (const [role, roleEntries] of Object.entries(byRole)) {
      const totalPoints = roleEntries.reduce((s, e) => s + (e.points || 0), 0);
      const sampleItem = roleEntries[0].item_name;
      const deptName = roleTitles[role] || roleEntries[0].category_name || role;
      const sampleDate = roleEntries[0].event_date;
      const sampleNote = roleEntries[0].note ? roleEntries[0].note.trim() : '';
      const sampleEvidence = roleEntries[0].evidence_url || '';

      let evidenceText = '';
      if (sampleEvidence) {
        const fullEvidenceUrl = sampleEvidence.startsWith('http') ? sampleEvidence : `${config.baseUrl}${sampleEvidence}`;
        evidenceText = `\n📎 <b>Dalil hujjati / havola:</b> <a href="${fullEvidenceUrl}">Hujjatni ko'rish / ochish</a>`;
      }

      let noteText = '';
      if (sampleNote) {
        noteText = `\n📝 <b>Ball mazmuni (Asos/Izoh):</b> ${sampleNote}`;
      }

      let studentsListText = '';
      if (roleEntries.length === 1) {
        studentsListText = `👤 <b>Talaba:</b> ${roleEntries[0].first_name} ${roleEntries[0].last_name} (${roleEntries[0].group_code || '-'})`;
      } else {
        studentsListText = `👥 <b>Talabalar (${roleEntries.length} nafar):</b>\n` +
          roleEntries.slice(0, 8).map((e, idx) => `  ${idx + 1}. ${e.first_name} ${e.last_name} (${e.group_code || '-'})`).join('\n') +
          (roleEntries.length > 8 ? `\n  <i>...va yana ${roleEntries.length - 8} nafar talaba</i>` : '');
      }

      const pointsPerStudent = roleEntries[0].points;
      const title = `Yangi ball tasdiqlash uchun: ${roleEntries.length} ta ariza (+${totalPoints} ball)`;
      const message = `🔔 <b>YANGI BALL TASDIQLASH UCHUN KELDI!</b>\n\n` +
        `👨‍🏫 <b>Kiritgan tyutor:</b> ${creatorUser.full_name || creatorUser.id}\n` +
        `🏢 <b>Mas'ul bo'lim:</b> ${deptName}\n` +
        `🎯 <b>Faollik yo'nalishi:</b> ${sampleItem}\n` +
        `⭐ <b>Ball miqdori:</b> +${pointsPerStudent} ball${roleEntries.length > 1 ? ` (jami: +${totalPoints} ball)` : ''}\n` +
        `📅 <b>Faollik sanasi:</b> ${sampleDate}` +
        noteText +
        evidenceText + `\n\n` +
        studentsListText + `\n\n` +
        `<i>Iltimos, arizalarni tekshirish va tasdiqlash uchun tasdiq portaliga kiring.</i>`;

      // Mas'ul xodimlarni topish (ushbu rolga ega xodimlar yoki superadmin)
      const approverStaff = db.prepare(`
        SELECT * FROM staff_user 
        WHERE active = 1 AND (roles LIKE ? OR roles LIKE '%superadmin%' OR id = 'superadmin')
      `).all(`%"${role}"%`);

      for (const staff of approverStaff) {
        if (staff.id === creatorUser.id && !staff.roles.includes('superadmin')) continue;

        await sendStaffTelegramNotification({
          staff_id: staff.id,
          type: 'pending_approval',
          title,
          message,
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📥 Tasdiqlash portalini ochish', url: `${config.baseUrl}/#dept-approvals` }
              ]
            ]
          }
        });
      }
    }
  } catch (err) {
    console.error('notifyApproversForNewPoints error:', err.message);
  }
}

/**
 * Superadmin klaviaturasi
 */
function getSuperadminKeyboard() {
  const miniappUrl = `${config.baseUrl}/miniapp`;
  const portalUrl = `${config.baseUrl}/`;
  const tvUrl = `${config.baseUrl}/tv?token=${config.secrets.tvToken}`;

  return {
    inline_keyboard: [
      [
        { text: '📱 Talabalar Kabineti (Mini App)', web_app: { url: miniappUrl } }
      ],
      [
        { text: '💻 Superadmin Portali (Web)', url: portalUrl },
        { text: '📺 Katta Ekran (TV)', url: tvUrl }
      ],
      [
        { text: '📊 Jonli Davomat & Turniket', callback_data: 'cb_att_summary' },
        { text: '📥 Kutilayotgan Arizalar', callback_data: 'admin_pending' }
      ],
      [
        { text: '🔄 Reytinglarni Qayta Hisoblash', callback_data: 'admin_recalc' }
      ]
    ]
  };
}

/**
 * Davomat monitoringi bo'yicha tezkor inline tugmalar
 */
function getAttendanceInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🏢 Hozir Binoda', callback_data: 'cb_att_in_campus' },
        { text: '❌ Kelmaganlar', callback_data: 'cb_att_absent' }
      ],
      [
        { text: '⏱️ Kechikkanlar', callback_data: 'cb_att_late' },
        { text: '👔 Xodimlar', callback_data: 'cb_att_staff' }
      ],
      [
        { text: '📊 Jonli Umumiy Hisobot', callback_data: 'cb_att_summary' }
      ],
      [
        { text: '💻 Davomat Veb Portali', url: `${config.baseUrl}/#campus-attendance-manage` }
      ]
    ]
  };
}

/**
 * Toshkent vaqti bo'yicha joriy sana va vaqtni olish (UTC+5)
 */
function getTashkentDateInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = formatter.format(now).split(', ');
  const [day, month, year] = parts[0].split('/');
  return {
    dateStr: `${year}-${month}-${day}`,
    timeStr: parts[1] || ''
  };
}

/**
 * Talabalar va xodimlar davomati bo'yicha Telegram hisoboti tayyorlash
 * @param {string|null} targetDate - 'YYYY-MM-DD'
 * @param {string} filter - 'summary' | 'in_campus' | 'absent' | 'late' | 'staff'
 * @param {boolean} isDaily18 - true bo'lsa soat 18:00 kunlik sarlavhasi bilan
 */
async function buildAttendanceTelegramReport(targetDate = null, filter = 'summary', isDaily18 = false) {
  const { dateStr: todayTashkent, timeStr } = getTashkentDateInfo();
  const dateStr = targetDate || todayTashkent;

  // 1. Talabalar ma'lumotlari
  const totalStudents = parseInt(db.prepare("SELECT count(*) as c FROM student WHERE status = 'active'").get()?.c || 0, 10);
  const attStats = db.prepare(`
    SELECT 
      COUNT(*) as total_present,
      SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late,
      SUM(CASE WHEN in_count > out_count THEN 1 ELSE 0 END) as in_campus
    FROM campus_attendance
    WHERE date = ?
  `).get(dateStr);

  const presentCount = parseInt(attStats?.total_present || 0, 10);
  const lateCount = parseInt(attStats?.total_late || 0, 10);
  const inCampusCount = parseInt(attStats?.in_campus || 0, 10);
  const absentCount = Math.max(0, totalStudents - presentCount);
  const attRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  // 2. Xodimlar ma'lumotlari
  const staffUsers = db.prepare(`
    SELECT id, full_name, roles, passport_id, phone, telegram_username
    FROM staff_user
    WHERE active = 1 OR active IS NULL
    ORDER BY full_name ASC
  `).all();

  let staffWithPassport = 0;
  let staffPresent = 0;
  let staffLate = 0;
  let staffInCampus = 0;
  let staffAbsent = 0;
  let staffNoPassport = 0;
  const staffDetails = [];

  for (const st of staffUsers) {
    const pid = (st.passport_id || '').trim().toUpperCase();
    if (!pid) {
      staffNoPassport++;
      staffDetails.push({
        staff: st,
        status: 'no_passport',
        firstIn: null,
        lastOut: null,
        inCount: 0,
        outCount: 0,
        isInCampus: false
      });
      continue;
    }

    staffWithPassport++;
    const logs = db.prepare(`
      SELECT event_time, direction, door_name
      FROM access_control_log
      WHERE (passport_id = ? OR UPPER(passport_id) = ?)
        AND event_time LIKE ?
      ORDER BY event_time ASC
    `).all(pid, pid, `${dateStr}%`);

    const inEvents = logs.filter(l => l.direction === 'in');
    const outEvents = logs.filter(l => l.direction === 'out');
    const inCount = inEvents.length;
    const outCount = outEvents.length;
    const firstIn = inEvents.length > 0 ? inEvents[0].event_time : (logs[0]?.event_time || null);
    const lastOut = outEvents.length > 0 ? outEvents[outEvents.length - 1].event_time : null;
    const isInCampus = inCount > outCount;

    let status = 'absent';
    if (inCount > 0 || logs.length > 0) {
      status = 'present';
      if (firstIn) {
        const inDate = new Date(firstIn);
        const hours = inDate.getHours();
        const minutes = inDate.getMinutes();
        if (hours > 9 || (hours === 9 && minutes > 15)) {
          status = 'late';
          staffLate++;
        }
      }
      staffPresent++;
      if (isInCampus) staffInCampus++;
    } else {
      staffAbsent++;
    }

    staffDetails.push({
      staff: st,
      status,
      firstIn,
      lastOut,
      inCount,
      outCount,
      isInCampus
    });
  }

  // Filtrlash bo'yicha javob matni
  if (filter === 'in_campus') {
    let msg = `🏢 <b>HOZIR UNIVERSITET BINOSIDA BO'LGANLAR</b>\n` +
      `📅 Sana: <b>${dateStr}</b> | ⏰ Holat: <b>${timeStr}</b>\n\n`;

    const inCampusStudents = db.prepare(`
      SELECT s.first_name, s.last_name, s.group_code, ca.first_in_at, ca.in_count, ca.out_count
      FROM campus_attendance ca
      JOIN student s ON ca.student_id = s.id
      WHERE ca.date = ? AND ca.in_count > ca.out_count
      ORDER BY ca.first_in_at ASC
    `).all(dateStr);

    msg += `🎓 <b>Talabalar bino hududida:</b> <b>${inCampusStudents.length} nafar</b>\n`;
    if (inCampusStudents.length === 0) {
      msg += `<i>Hozir binoda birorta ham talaba yo'q yoki barchasi chiqib ketgan.</i>\n\n`;
    } else {
      const topStudents = inCampusStudents.slice(0, 25);
      topStudents.forEach((st, idx) => {
        const t = st.first_in_at ? new Date(st.first_in_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
        msg += `${idx + 1}. <b>${st.first_name} ${st.last_name}</b> (${st.group_code}) — 🟢 Kirgan: ${t}\n`;
      });
      if (inCampusStudents.length > 25) {
        msg += `<i>...va yana ${inCampusStudents.length - 25} nafar talaba hozir binoda.</i>\n`;
      }
      msg += `\n`;
    }

    const inCampusStaffList = staffDetails.filter(s => s.isInCampus);
    msg += `👔 <b>Xodimlar bino hududida:</b> <b>${inCampusStaffList.length} nafar</b>\n`;
    if (inCampusStaffList.length === 0) {
      msg += `<i>Hozir bino hududida birorta ham mas'ul xodim qayd etilmagan.</i>\n\n`;
    } else {
      inCampusStaffList.forEach((item, idx) => {
        const t = item.firstIn ? new Date(item.firstIn).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
        let rName = 'Xodim';
        try { const rArr = JSON.parse(item.staff.roles); rName = rArr[0] || 'Xodim'; } catch(e){}
        msg += `${idx + 1}. <b>${item.staff.full_name}</b> (${rName}) — 🟢 Kirgan: ${t}\n`;
      });
      msg += `\n`;
    }

    return msg;
  }

  if (filter === 'absent') {
    let msg = `❌ <b>TURNIKETDAN O'TMAGAN (KELMAGANLAR) RO'YXATI</b>\n` +
      `📅 Sana: <b>${dateStr}</b> | ⏰ Holat: <b>${timeStr}</b>\n\n`;

    const absentStudents = db.prepare(`
      SELECT s.first_name, s.last_name, s.group_code, s.phone
      FROM student s
      LEFT JOIN campus_attendance ca ON ca.student_id = s.id AND ca.date = ?
      WHERE s.status = 'active' AND ca.id IS NULL
      ORDER BY s.group_code ASC, s.last_name ASC
    `).all(dateStr);

    msg += `🎓 <b>Kelmagan talabalar:</b> <b>${absentStudents.length} nafar</b>\n`;
    if (absentStudents.length === 0) {
      msg += `🎉 <i>Barcha faol talabalar turniketdan o'tgan! 100% davomat!</i>\n\n`;
    } else {
      const topAbs = absentStudents.slice(0, 25);
      topAbs.forEach((st, idx) => {
        msg += `${idx + 1}. <b>${st.first_name} ${st.last_name}</b> (${st.group_code})${st.phone ? ` 📞 <code>${st.phone}</code>` : ''}\n`;
      });
      if (absentStudents.length > 25) {
        msg += `<i>...va yana ${absentStudents.length - 25} nafar talaba bugun kelmagan.</i>\n`;
      }
      msg += `\n`;
    }

    const absentStaffList = staffDetails.filter(s => s.status === 'absent');
    msg += `👔 <b>Kelmagan xodimlar:</b> <b>${absentStaffList.length} nafar</b>\n`;
    if (absentStaffList.length === 0) {
      msg += `<i>Barcha pasporti biriktirilgan xodimlar tashrif buyurgan.</i>\n\n`;
    } else {
      absentStaffList.forEach((item, idx) => {
        let rName = 'Xodim';
        try { const rArr = JSON.parse(item.staff.roles); rName = rArr[0] || 'Xodim'; } catch(e){}
        msg += `${idx + 1}. <b>${item.staff.full_name}</b> (${rName})\n`;
      });
      msg += `\n`;
    }

    if (staffNoPassport > 0) {
      msg += `⚠️ <i>Eslatma: ${staffNoPassport} nafar xodimga hali Pasport ID kiritilmagan. Ular davomatini nazorat qilish uchun veb-tizimda tahrirlab Pasport ID kiriting.</i>\n`;
    }

    return msg;
  }

  if (filter === 'late') {
    let msg = `⏱️ <b>09:15 DAN KEYIN KELGANLAR (KECHIKKANLAR)</b>\n` +
      `📅 Sana: <b>${dateStr}</b> | ⏰ Holat: <b>${timeStr}</b>\n\n`;

    const lateStudents = db.prepare(`
      SELECT s.first_name, s.last_name, s.group_code, ca.first_in_at
      FROM campus_attendance ca
      JOIN student s ON ca.student_id = s.id
      WHERE ca.date = ? AND ca.status = 'late'
      ORDER BY ca.first_in_at ASC
    `).all(dateStr);

    msg += `🎓 <b>Kechikkan talabalar:</b> <b>${lateStudents.length} nafar</b>\n`;
    if (lateStudents.length === 0) {
      msg += `🎉 <i>Bugun 09:15 dan kechikkan talabalar yo'q!</i>\n\n`;
    } else {
      lateStudents.forEach((st, idx) => {
        const t = st.first_in_at ? new Date(st.first_in_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
        msg += `${idx + 1}. <b>${st.first_name} ${st.last_name}</b> (${st.group_code}) — ⏱️ Kirgan vaqti: <b>${t}</b>\n`;
      });
      msg += `\n`;
    }

    const lateStaffList = staffDetails.filter(s => s.status === 'late');
    msg += `👔 <b>Kechikkan xodimlar:</b> <b>${lateStaffList.length} nafar</b>\n`;
    if (lateStaffList.length === 0) {
      msg += `<i>09:15 dan keyin kelgan xodimlar yo'q.</i>\n\n`;
    } else {
      lateStaffList.forEach((item, idx) => {
        const t = item.firstIn ? new Date(item.firstIn).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
        let rName = 'Xodim';
        try { const rArr = JSON.parse(item.staff.roles); rName = rArr[0] || 'Xodim'; } catch(e){}
        msg += `${idx + 1}. <b>${item.staff.full_name}</b> (${rName}) — ⏱️ Kirgan: <b>${t}</b>\n`;
      });
      msg += `\n`;
    }

    return msg;
  }

  if (filter === 'staff') {
    let msg = `👔 <b>XODIMLAR MONITORINGI VA DAVOMATI (FACE ID)</b>\n` +
      `📅 Sana: <b>${dateStr}</b> | ⏰ Holat: <b>${timeStr}</b>\n\n` +
      `👥 Jami xodimlar: <b>${staffUsers.length} nafar</b>\n` +
      `🪪 Pasport ID biriktirilgan: <b>${staffWithPassport} nafar</b>\n` +
      `✅ Bugun kelganlar: <b>${staffPresent} nafar</b>\n` +
      `🏢 Hozir bino hududida: <b>${staffInCampus} nafar</b>\n` +
      `❌ Turniketdan o'tmagan: <b>${staffAbsent} nafar</b>\n` +
      `⚠️ Pasport kiritilmagan: <b>${staffNoPassport} nafar</b>\n\n` +
      `📋 <b>XODIMLAR RO'YXATI:</b>\n`;

    staffDetails.forEach((item, idx) => {
      let icon = '⚪';
      let statusText = 'Pasport ID yo\'q';
      if (item.status === 'present') {
        icon = item.isInCampus ? '🟢' : '🔵';
        statusText = item.isInCampus ? 'Hozir Binoda' : 'Chiqib ketgan';
      } else if (item.status === 'late') {
        icon = '🟡';
        statusText = item.isInCampus ? 'Kechikkan (Binoda)' : 'Kechikkan (Chiqib ketgan)';
      } else if (item.status === 'absent') {
        icon = '🔴';
        statusText = 'Turniketdan o\'tmagan';
      }

      const inTime = item.firstIn ? new Date(item.firstIn).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';
      const outTime = item.lastOut ? new Date(item.lastOut).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '-';

      msg += `${idx + 1}. ${icon} <b>${item.staff.full_name}</b>\n` +
        `   🪪 Pasport: <code>${item.staff.passport_id || 'Kiritilmagan'}</code> | <b>${statusText}</b>\n` +
        (item.firstIn ? `   🕒 Kirdi: <b>${inTime}</b> | Chiqdi: ${outTime} (${item.inCount} marta)\n` : '');
    });

    return msg;
  }

  // DEFAULT: SUMMARY
  const headerTitle = isDaily18 ? `🔔 <b>SOAT 18:00 KUNLIK DAVOMAT HISOBOTI</b>` : `📊 <b>JONLI DAVOMAT & TURNIKET HISOBOTI</b>`;
  const summaryMsg = `${headerTitle}\n` +
    `🏛️ <b>AL-XORAZMIY UNIVERSITETI</b>\n` +
    `📅 <b>Sana:</b> <code>${dateStr}</code> | ⏰ <b>Vaqt:</b> <code>${timeStr}</code>\n\n` +
    `🎓 <b>TALABALAR DAVOMATI:</b>\n` +
    `• Jami talabalar: <b>${totalStudents} nafar</b>\n` +
    `• Kelganlar: <b>${presentCount} nafar</b> (<b>${attRate}%</b>)\n` +
    `• Kechikkanlar (>09:15): <b>${lateCount} nafar</b>\n` +
    `• Hozir bino hududida: <b>${inCampusCount} nafar</b>\n` +
    `• Turniketdan o'tmagan: <b>${absentCount} nafar</b>\n\n` +
    `👔 <b>XODIMLAR DAVOMATI:</b>\n` +
    `• Jami xodimlar: <b>${staffUsers.length} nafar</b>\n` +
    `• Pasport ID biriktirilgan: <b>${staffWithPassport} nafar</b>\n` +
    `• Kelganlar: <b>${staffPresent} nafar</b>\n` +
    `• Hozir bino hududida: <b>${staffInCampus} nafar</b>\n` +
    `• Turniketdan o'tmagan: <b>${staffAbsent} nafar</b>\n` +
    (staffNoPassport > 0 ? `• ⚠️ Pasport kiritilmagan: <b>${staffNoPassport} nafar</b> <i>(Face ID nazorati uchun tizimda Pasport ID kiriting)</i>\n` : '') +
    `\n<i>👇 Kerakli ro'yxatni ko'rish yoki filtrlash uchun quyidagi tugmalardan birini bosing:</i>`;

  return summaryMsg;
}

/**
 * Superadminga har kuni soat 18:00 da kunlik davomat hisobotini yuborish
 */
async function sendDailyAttendanceSummaryToSuperadmin(targetDate = null) {
  try {
    const { dateStr } = getTashkentDateInfo();
    const finalDate = targetDate || dateStr;
    const text = await buildAttendanceTelegramReport(finalDate, 'summary', true);
    const keyboard = getAttendanceInlineKeyboard();
    return await sendTelegramMessage(SUPERADMIN_TG_ID, text, { reply_markup: keyboard });
  } catch (err) {
    console.error('sendDailyAttendanceSummaryToSuperadmin xatolik:', err.message);
    return null;
  }
}

/**
 * Xodim uchun tabrik va menyuni yuborish
 */
async function sendStaffGreetingAndMenu(chatId, staffUser, rawUsername, formattedPhone = null) {
  let parsedRoles = [];
  try { parsedRoles = JSON.parse(staffUser.roles); } catch(e) { parsedRoles = [staffUser.roles]; }
  const isSuper = parsedRoles.includes('superadmin') || staffUser.id === 'superadmin';

  // 1. Klaviaturadagi "Telefon raqamni yuborish" tugmasini olib tashlash
  try {
    await sendTelegramMessage(chatId, `✅ <b>Hisobingiz muvaffaqiyatli tasdiqlandi va sinxronlandi!</b>`, {
      reply_markup: { remove_keyboard: true }
    });
  } catch (e) {}

  if (isSuper) {
    const totalStudents = db.prepare(`SELECT COUNT(*) as c FROM student WHERE status = 'active'`).get().c;
    const pendingCount = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE status IN ('pending', 'pending_pv')`).get().c;
    const totalPoints = db.prepare(`SELECT COALESCE(SUM(season), 0) as s FROM student_score`).get().s;

    const adminWelcome = `🏛️ <b>Assalomu alaykum, ${staffUser.full_name}!</b>\n` +
      `Siz AKHU Talabalar reytingi tizimi <b>Superadmini</b> sifatida tasdiqlangansiz (ID: <code>${chatId}</code>).\n\n` +
      `📊 <b>Tizimning joriy holati:</b>\n` +
      `• Faol talabalar: <b>${totalStudents} nafar</b>\n` +
      `• Kutilayotgan tasdiqlar: <b>${pendingCount} ta</b>\n` +
      `• Mavsumning jami ballari: <b>${totalPoints.toLocaleString()} ball</b>\n\n` +
      `Tizimni boshqarish va nazorat qilish uchun pastdagi tugmalardan foydalaning:`;

    await sendTelegramMessage(chatId, adminWelcome, {
      reply_markup: getSuperadminKeyboard()
    });
    return;
  }

  // Mas'ul xodim (Tyutor, Dekanat yoki Bo'lim)
  const roleTitles = {
    'superadmin': 'Superadmin (Tizim boshqaruvchisi)',
    'tutor': 'Akademik Tyutor',
    'dep_yb': "Yoshlar bilan ishlash bo'limi",
    'dep_mb': "Ma'naviyat va ma'rifat bo'limi",
    'dep_ob': "O'quv-uslubiy boshqarma (Registrator)",
    'dep_ib': "Ilmiy va innovatsiyalar bo'limi",
    'dep_sb': "Sanoat bilan hamkorlik bo'limi",
    'dep_pb': "Matbuot xizmati (PR)",
    'prorektor': "Yoshlar masalalari bo'yicha prorektor",
    'observer': "Kuzatuvchi / Rektorat"
  };
  const displayRoles = parsedRoles.map(r => roleTitles[r] || r).join(', ') || 'Mas\'ul xodim';

  let pendingForMe = 0;
  if (parsedRoles.length > 0) {
    const placeholders = parsedRoles.map(() => '?').join(',');
    pendingForMe = db.prepare(`
      SELECT COUNT(*) as c FROM point_entry 
      WHERE status IN ('pending', 'pending_pv') AND (approver_role IN (${placeholders}))
    `).get(...parsedRoles)?.c || 0;
  }

  const usernameText = rawUsername ? `@${rawUsername}` : (staffUser.telegram_username ? `@${staffUser.telegram_username.replace(/^@/, '')}` : 'Mavjud emas');
  const phoneText = formattedPhone || staffUser.telegram_phone || staffUser.phone || '—';

  const staffWelcome = `🏛️ <b>Assalomu alaykum, ${staffUser.full_name}!</b>\n\n` +
    `Siz AKHU tizimida mas'ul xodim sifatida muvaffaqiyatli tasdiqlandingiz:\n\n` +
    `👔 <b>Lavozim/Rol:</b> ${displayRoles}\n` +
    `🆔 <b>Telegram ID:</b> <code>${chatId}</code>\n` +
    `👤 <b>Telegram Username:</b> ${usernameText}\n` +
    `📱 <b>Tasdiqlangan telefon:</b> <code>${phoneText}</code>\n` +
    `📥 <b>Tasdiqlash kutilayotgan arizalar:</b> <b>${pendingForMe} ta</b>\n\n` +
    `⚡ <b>Telegram Bot faollashtirildi!</b> Endi talabalarning yangi ball arizalari va muhim tizim xabarnomalari avtomatik shu bot orqali sizga yetkaziladi.\n\n` +
    `Tizim portaliga o'tish uchun pastdagi tugmani bosing:`;

  await sendTelegramMessage(chatId, staffWelcome, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💻 Tasdiqlash va Boshqaruv Portali', url: `${config.baseUrl}/#approvals` }
        ],
        [
          { text: '📥 Kutilayotgan arizalar', callback_data: 'admin_pending' }
        ]
      ]
    }
  });
}

/**
 * Telegram Update Handler (Webhook va Polling uchun yagona)
 */
async function handleTelegramWebhook(update) {
  if (!update) return;

  // 1. Callback Query (Inline tugmalar)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message.chat.id;
    const data = cb.data;

    recordBotActivity(chatId, 'callback_click', `Tugma bosildi: "${data}"`, {
      username: cb.from?.username,
      firstName: cb.from?.first_name,
      lastName: cb.from?.last_name
    });

    if (data.startsWith('cb_att_')) {
      const action = data.replace('cb_att_', '');
      const report = await buildAttendanceTelegramReport(null, action);
      const keyboard = getAttendanceInlineKeyboard();
      await answerCallbackQuery(cb.id);
      await sendTelegramMessage(chatId, report, { reply_markup: keyboard });
      return;
    }

    if (data === 'admin_recalc') {
      recalculateStudentScores();
      await answerCallbackQuery(cb.id, '✅ Reytinglar muvaffaqiyatli qayta hisoblandi!', true);
    } else if (data === 'admin_pending') {
      const pendingList = db.prepare(`
        SELECT pe.*, st.first_name, st.last_name, ci.name as item_name
        FROM point_entry pe
        JOIN student st ON pe.student_id = st.id
        JOIN catalog_item ci ON pe.item_id = ci.id
        WHERE pe.status IN ('pending', 'pending_pv')
        ORDER BY pe.created_at DESC LIMIT 5
      `).all();

      let text = `📥 <b>Kutilayotgan arizalar (oxirgi 5 ta):</b>\n\n`;
      if (pendingList.length === 0) {
        text += `Hozirda tasdiqlanishi kerak bo'lgan ariza yo'q.`;
      } else {
        pendingList.forEach((p, idx) => {
          text += `${idx + 1}. <b>${p.first_name} ${p.last_name}</b>: +${p.points} ball (${p.item_name})\n`;
        });
      }
      await answerCallbackQuery(cb.id);
      await sendTelegramMessage(chatId, text);
    }
    return;
  }

// 2. Oddiy xabarlar
  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const text = msg.text || '';
  const isSuperadmin = String(chatId) === SUPERADMIN_TG_ID;
  const tgId = String(chatId);
  const rawUsername = msg.from?.username ? msg.from.username.replace(/^@/, '') : null;
  const nowIso = new Date().toISOString();

  // Agar bu xodim bo'lsa, uning username va oxirgi faolligini har qanday xabarda darhol yangilash
  try {
    let existingStaff = db.prepare(`
      SELECT * FROM staff_user 
      WHERE telegram_user_id = ?
    `).get(tgId);

    if (!existingStaff && rawUsername) {
      existingStaff = db.prepare(`
        SELECT * FROM staff_user 
        WHERE (telegram_username IS NOT NULL AND (LOWER(telegram_username) = LOWER(?) OR LOWER(telegram_username) = LOWER(?)))
           OR (telegram_user_id IS NOT NULL AND (LOWER(telegram_user_id) = LOWER(?) OR LOWER(telegram_user_id) = LOWER(?)))
      `).get(rawUsername, `@${rawUsername}`, rawUsername, `@${rawUsername}`);
    }

    if (existingStaff) {
      db.prepare(`
        UPDATE staff_user
        SET telegram_user_id = ?,
            telegram_username = COALESCE(?, telegram_username),
            bot_status = 'active',
            last_active_at = ?
        WHERE id = ?
      `).run(tgId, rawUsername, nowIso, existingStaff.id);
    }
  } catch (e) {}

  // Superadmin uchun jonli davomat va monitoring buyruqlari
  if (isSuperadmin && text) {
    const cleanLower = text.toLowerCase().trim();
    if (
      cleanLower.startsWith('/davomat') ||
      cleanLower.startsWith('/binoda') ||
      cleanLower.startsWith('/kelmagan') ||
      cleanLower.startsWith('/kechik') ||
      cleanLower.startsWith('/turniket') ||
      cleanLower.startsWith('/hodim') ||
      cleanLower.startsWith('/xodim') ||
      cleanLower === 'davomat' ||
      cleanLower === 'binoda' ||
      cleanLower.includes('davomat') ||
      cleanLower.includes('kim bor') ||
      cleanLower.includes('kim yoq') ||
      cleanLower.includes('kim yo\'q')
    ) {
      recordBotActivity(chatId, 'command_attendance', `Davomat so'rovi: "${text}"`, {
        username: rawUsername,
        firstName: msg.from?.first_name
      });

      let filter = 'summary';
      if (cleanLower.includes('binoda') || cleanLower.includes('bor')) filter = 'in_campus';
      else if (cleanLower.includes('kelmagan') || cleanLower.includes('yoq') || cleanLower.includes('yo\'q')) filter = 'absent';
      else if (cleanLower.includes('kechik')) filter = 'late';
      else if (cleanLower.includes('hodim') || cleanLower.includes('xodim')) filter = 'staff';

      const report = await buildAttendanceTelegramReport(null, filter);
      const keyboard = getAttendanceInlineKeyboard();
      await sendTelegramMessage(chatId, report, { reply_markup: keyboard });
      return;
    }
  }

  // 1. /start buyrug'i
  if (text.startsWith('/start')) {
    recordBotActivity(chatId, 'command_start', `/start buyrug'i yuborildi`, {
      username: rawUsername,
      firstName: msg.from?.first_name,
      lastName: msg.from?.last_name
    });

    // A. Xodim tekshiruvi: superadmin, telegram_user_id bo'yicha yoki username bo'yicha
    let staffUser = null;
    if (isSuperadmin) {
      staffUser = db.prepare(`SELECT * FROM staff_user WHERE id = 'superadmin'`).get();
    } else {
      staffUser = db.prepare(`SELECT * FROM staff_user WHERE telegram_user_id = ?`).get(tgId);
      if (!staffUser && rawUsername) {
        staffUser = db.prepare(`
          SELECT * FROM staff_user 
          WHERE (telegram_username IS NOT NULL AND (LOWER(telegram_username) = LOWER(?) OR LOWER(telegram_username) = LOWER(?)))
             OR (telegram_user_id IS NOT NULL AND (LOWER(telegram_user_id) = LOWER(?) OR LOWER(telegram_user_id) = LOWER(?)))
        `).get(rawUsername, `@${rawUsername}`, rawUsername, `@${rawUsername}`);
      }
    }

    if (staffUser) {
      db.prepare(`
        UPDATE staff_user 
        SET telegram_user_id = ?,
            telegram_username = COALESCE(?, telegram_username),
            bot_started_at = COALESCE(bot_started_at, ?),
            bot_status = 'active',
            last_active_at = ?
        WHERE id = ?
      `).run(tgId, rawUsername, nowIso, nowIso, staffUser.id);

      try {
        db.prepare(`
          INSERT INTO telegram_bot_user (telegram_user_id, username, first_name, last_name, started_at, last_seen_at)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT (telegram_user_id) DO UPDATE SET
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            last_seen_at = EXCLUDED.last_seen_at,
            actions_count = telegram_bot_user.actions_count + 1
        `).run(tgId, rawUsername, msg.from?.first_name || null, msg.from?.last_name || null, nowIso, nowIso);
      } catch (e) {}

      logAudit({
        actor_id: staffUser.id,
        actor_role: 'staff',
        action: 'BOT_START',
        object_type: 'staff_user',
        object_id: staffUser.id,
        after: { username: rawUsername, telegram_user_id: tgId }
      });

      const updated = db.prepare(`SELECT * FROM staff_user WHERE id = ?`).get(staffUser.id);
      await sendStaffGreetingAndMenu(chatId, updated, rawUsername);
      return;
    }

    // B. Oddiy talaba yoki foydalanuvchi
    const student = db.prepare(`SELECT * FROM student WHERE telegram_user_id = ?`).get(String(chatId));

    if (student) {
      const score = db.prepare(`SELECT * FROM student_score WHERE student_id = ?`).get(student.id) || { total: 0, season: 0, rank_cohort: 1 };
      const reply = `Assalomu alaykum, <b>${student.first_name} ${student.last_name}</b>!\n\n` +
        `🎓 Guruh: <b>${student.group_code}</b>\n` +
        `⭐ Mavsum balli: <b>${score.season}</b>\n` +
        `🏆 O'rningiz: <b>#${score.rank_cohort}</b>\n\n` +
        `Talabalar kabinetini ochish uchun pastdagi tugmani bosing:`;

      await sendTelegramMessage(chatId, reply, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Talabalar Kabineti (Mini App)',
                web_app: { url: `${config.baseUrl}/miniapp` }
              }
            ]
          ]
        }
      });
    } else {
      const welcome = `Assalomu alaykum! Al-Xorazmiy universiteti Talabalar Reytingi tizimiga xush kelibsiz.\n\n` +
        `Tizimga kirish uchun telefon raqamingizni tasdiqlang. Pastdagi <b>"📱 Telefon raqamni yuborish"</b> tugmasini bosing:`;

      await sendTelegramMessage(chatId, welcome, {
        reply_markup: {
          keyboard: [
            [
              {
                text: '📱 Telefon raqamni yuborish',
                request_contact: true
              }
            ]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
    return;
  }

  // 2. Contact yuborilganda yoki telefon raqami yozilganda
  let incomingPhone = null;
  if (msg.contact && msg.contact.phone_number) {
    incomingPhone = msg.contact.phone_number;
  } else if (text && /^\+?998[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$|^\d{9,12}$/.test(text.trim())) {
    incomingPhone = text.trim();
  }

  if (incomingPhone) {
    const cleanDigits = String(incomingPhone).replace(/[^0-9]/g, '');
    const last9 = cleanDigits.slice(-9);
    const formattedPhone = cleanDigits.startsWith('998') ? '+' + cleanDigits : (cleanDigits.length === 9 ? '+998' + cleanDigits : '+' + cleanDigits);
    const phoneWithoutPlus = formattedPhone.replace('+', '');

    // 1. Avval xodimlar orasidan telefon, username yoki id bo'yicha qidirish
    const staff = db.prepare(`
      SELECT * FROM staff_user
      WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE ?
         OR REGEXP_REPLACE(COALESCE(telegram_phone, ''), '[^0-9]', '', 'g') LIKE ?
         OR phone = ? OR phone = ?
         OR telegram_phone = ? OR telegram_phone = ?
         OR telegram_user_id = ?
         OR (telegram_username IS NOT NULL AND (LOWER(telegram_username) = LOWER(?) OR LOWER(telegram_username) = LOWER(?)))
         OR (telegram_user_id IS NOT NULL AND (LOWER(telegram_user_id) = LOWER(?) OR LOWER(telegram_user_id) = LOWER(?)))
      LIMIT 1
    `).get(
      '%' + last9, '%' + last9,
      formattedPhone, phoneWithoutPlus,
      formattedPhone, phoneWithoutPlus,
      tgId,
      rawUsername || '', `@${rawUsername || ''}`,
      rawUsername || '', `@${rawUsername || ''}`
    );

    if (staff) {
      db.prepare(`
        UPDATE staff_user
        SET telegram_user_id = ?,
            telegram_phone = ?,
            telegram_username = COALESCE(?, telegram_username),
            phone = CASE WHEN phone IS NULL OR phone = '' OR phone LIKE '% %' THEN ? ELSE phone END,
            bot_started_at = COALESCE(bot_started_at, ?),
            bot_status = 'active',
            last_active_at = ?
        WHERE id = ?
      `).run(tgId, formattedPhone, rawUsername, formattedPhone, nowIso, nowIso, staff.id);

      try {
        db.prepare(`
          INSERT INTO telegram_bot_user (telegram_user_id, username, first_name, last_name, phone, started_at, last_seen_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (telegram_user_id) DO UPDATE SET
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            last_seen_at = EXCLUDED.last_seen_at,
            actions_count = telegram_bot_user.actions_count + 1
        `).run(tgId, rawUsername, msg.from?.first_name || null, msg.from?.last_name || null, formattedPhone, nowIso, nowIso);
      } catch (e) {}

      logAudit({
        actor_id: staff.id,
        actor_role: 'staff',
        action: 'BOT_LINK_STAFF',
        object_type: 'staff_user',
        object_id: staff.id,
        after: { telegram_user_id: tgId, phone: formattedPhone, username: rawUsername }
      });

      const updated = db.prepare(`SELECT * FROM staff_user WHERE id = ?`).get(staff.id);
      await sendStaffGreetingAndMenu(chatId, updated, rawUsername, formattedPhone);
      return;
    }

    // 2. Aks holda talaba bog'lanishi (Student logic)
    const result = linkStudentTelegramAccount(chatId, incomingPhone);

    recordBotActivity(chatId, 'share_contact', `Telefon yuborildi: ${incomingPhone} (${result.success ? 'Muvaffaqiyatli bog\'landi' : 'Topilmadi'})`, {
      username: rawUsername,
      firstName: msg.from?.first_name,
      lastName: msg.from?.last_name,
      phone: incomingPhone,
      studentId: result.student ? result.student.id : null
    });

    if (result.success) {
      await sendTelegramMessage(chatId, `✅ <b>Telefon raqamingiz muvaffaqiyatli tasdiqlandi!</b>`, {
        reply_markup: { remove_keyboard: true }
      });

      await sendTelegramMessage(chatId, `🎉 <b>${result.message}</b>\n\nIsm-familiya: <b>${result.student.first_name} ${result.student.last_name}</b>\nGuruh: <b>${result.student.group_code}</b>\n\nPastdagi tugma orqali kabinetingizga kiring:`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Talabalar Kabinetini ochish',
                web_app: { url: `${config.baseUrl}/miniapp` }
              }
            ]
          ]
        }
      });
    } else {
      await sendTelegramMessage(chatId, `❌ ${result.message}`);
    }
    return;
  }
}

/**
 * Telegram Long Polling mexanizmi (Har doim 100% ishlaydi)
 */
async function startTelegramPolling() {
  if (isPolling) return;
  isPolling = true;
  console.log('🤖 Telegram Bot Long Polling ishga tushdi...');

  // Webhookni o'chirish (aks holda getUpdates ishlamaydi)
  try {
    await fetch(`${TELEGRAM_API}/deleteWebhook`, { method: 'POST' });
  } catch (e) {}

  // Polling sikli
  (async () => {
    while (isPolling) {
      try {
        const url = `${TELEGRAM_API}/getUpdates?offset=${pollingOffset}&timeout=20&allowed_updates=["message","callback_query"]`;
        const resp = await fetch(url);
        if (!resp.ok) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const data = await resp.json();
        if (data.ok && data.result && data.result.length > 0) {
          for (const update of data.result) {
            pollingOffset = update.update_id + 1;
            try {
              await handleTelegramWebhook(update);
            } catch (err) {
              console.error('Update processing error:', err.message);
            }
          }
        }
      } catch (err) {
        // Tarmoq xatolarida 2 soniya kutib qayta ulanish
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  })();
}

function stopTelegramPolling() {
  isPolling = false;
}

module.exports = {
  sendTelegramMessage,
  sendTelegramPhoto,
  answerCallbackQuery,
  editTelegramMessage,
  verifyTelegramInitData,
  linkStudentTelegramAccount,
  notifyStudent,
  notifyStaffDept,
  sendStaffTelegramNotification,
  notifyApproversForNewPoints,
  handleTelegramWebhook,
  startTelegramPolling,
  stopTelegramPolling,
  recordBotActivity,
  broadcastNewEventToStudents,
  notifyStudentEventRegistration,
  notifyStudentEventUnregister,
  notifyStudentEventCheckin,
  resolveTelegramChatInfo,
  buildAttendanceTelegramReport,
  getAttendanceInlineKeyboard,
  sendDailyAttendanceSummaryToSuperadmin
};
