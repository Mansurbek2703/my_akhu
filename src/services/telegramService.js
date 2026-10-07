const crypto = require('crypto');
const { db } = require('../db/database');
const config = require('../config');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit } = require('./pointService');

const BOT_TOKEN = config.telegram.botToken;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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
 * M-01, N-10: Talabaning telefon raqami orqali Telegram akkauntini bog'lash va +5 kirish balli berish
 */
function linkStudentTelegramAccount(telegramUserId, phoneNumber) {
  // Telefon raqam formatini normallashtirish: +998901234567
  let cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;

  // Boshqa variant: 998901234567
  const phoneWithoutPlus = cleanPhone.replace('+', '');

  const student = db.prepare(`
    SELECT * FROM student
    WHERE phone = ? OR phone = ? OR phone LIKE ?
    LIMIT 1
  `).get(cleanPhone, phoneWithoutPlus, `%${cleanPhone.slice(-9)}`);

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

  // +5 kirish balli yozilganligini tekshirish (i0)
  const existingBonus = db.prepare(`
    SELECT id FROM point_entry
    WHERE student_id = ? AND item_id = 'i0'
  `).get(student.id);

  if (!existingBonus) {
    const entryId = 'pe_' + crypto.randomBytes(6).toString('hex');
    const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };

    db.prepare(`
      INSERT INTO point_entry (
        id, student_id, item_id, item_version, category_id, base_points, points,
        note, event_date, source, created_by, created_at, status, approver_role,
        approved_by, approved_at, season_id
      ) VALUES (?, ?, 'i0', 1, '1', 5, 5, 'Tizimga ilk kirish bonusi', ?, 'system', 'system', ?, 'approved', 'dep_yb', 'system', ?, ?)
    `).run(
      entryId,
      student.id,
      now.split('T')[0],
      now,
      now,
      currentSeason.id
    );

    recalculateStudentScores();

    logAudit({
      actor_id: student.id,
      actor_role: 'system',
      action: 'WELCOME_BONUS',
      object_type: 'point_entry',
      object_id: entryId,
      after: { points: 5 },
      ip: '127.0.0.1'
    });
  }

  return {
    success: true,
    student,
    message: 'Akkauntingiz muvaffaqiyatli bog\'landi va +5 kirish balli yozildi! 🎉'
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
    case 'N-01': // Yozuv tasdiqlandi
      message = `🎯 <b>+${data.points} ball</b> — ${data.category_name} · ${data.item_name}.\nKiritdi: tyutor <i>${data.tutor_name || 'Tyutor'}</i>, tasdiqladi: <i>${data.dept_name || 'Bo\'lim'}</i>.\nJami ballingiz: <b>${total}</b>.`;
      break;
    case 'N-02': // Yozuv kiritildi (pending)
      message = `⏳ Tyutoringiz <b>+${data.points} ball</b> (${data.item_name}) kiritdi — ${data.dept_name || 'Bo\'lim'} tasdig'ini kutmoqda.`;
      break;
    case 'N-03': // Rad etildi
      message = `↩️ <b>${data.item_name} (+${data.points})</b> rad etildi.\nSabab: <i>${data.reason}</i>\n⚠️ 3 kun ichida ilovadan e'tiroz bildirishingiz mumkin.`;
      break;
    case 'N-04': // QR check-in
      message = `✅ <b>${data.event_title}</b>: +${data.points} ball yozildi.\nJami ballingiz: <b>${total}</b>.`;
      break;
    case 'N-05': // Tadbir eslatmasi
      message = `📅 Ertaga <b>${data.time}</b> — <b>${data.event_title}</b> (+${data.points} ball).\nSiz ro'yxatdasiz. Manzil: ${data.place}.`;
      break;
    case 'N-06': // Haftaning yulduzlari
      message = `🏆 <b>Haftaning yulduzlari e'lon qilindi!</b>\nSiz o'z guruhingizda <b>${data.rank || 1}-o'rin</b>dasiz.`;
      break;
    case 'N-08': // Passiv talaba eslatmasi
      message = `👋 <b>Salom, ${student.first_name}!</b>\n30 kundan beri ball olmadingiz. Reytingda orqada qolib ketmang! Yaqin tadbirlar ro'yxatini ilovada ko'ring.`;
      break;
    case 'N-09': // -30 ball
      message = `⚠️ <b>Ogohlantirish:</b> Qoidabuzarlik bo'yicha <b>-30 ball</b> yozildi (Asos: ${data.doc || 'Rektor buyrug\'i'}).\n3 kun ichida e'tiroz berishingiz mumkin.`;
      break;
    case 'N-10': // Kirish
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
 * Telegram Webhook Handler (/api/telegram/webhook)
 */
async function handleTelegramWebhook(update) {
  if (!update) return;

  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const text = msg.text || '';

  // 1. /start buyrug'i
  if (text.startsWith('/start')) {
    const student = db.prepare(`SELECT * FROM student WHERE telegram_user_id = ?`).get(String(chatId));

    if (student) {
      // Allaqachon ulangan talaba
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
      // Hali bog'lanmagan: Telefon raqamini so'rash (M-01)
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

  // 2. Contact yuborilganda
  if (msg.contact) {
    const phone = msg.contact.phone_number;
    const result = linkStudentTelegramAccount(chatId, phone);

    if (result.success) {
      await sendTelegramMessage(chatId, `🎉 <b>${result.message}</b>\n\nIsm-familiya: <b>${result.student.first_name} ${result.student.last_name}</b>\nGuruh: <b>${result.student.group_code}</b>\n\nPastdagi tugma orqali kabinetingizga kiring:`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📱 Talabalar Kabinetini ochish',
                web_app: { url: `${config.baseUrl}/miniapp` }
              }
            ]
          ],
          remove_keyboard: true
        }
      });
    } else {
      await sendTelegramMessage(chatId, `❌ ${result.message}`);
    }
  }
}

module.exports = {
  sendTelegramMessage,
  verifyTelegramInitData,
  linkStudentTelegramAccount,
  notifyStudent,
  notifyStaffDept,
  handleTelegramWebhook
};
