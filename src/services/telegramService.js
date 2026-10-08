const crypto = require('crypto');
const { db } = require('../db/database');
const config = require('../config');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit } = require('./pointService');

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
  let cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
  if (!cleanPhone.startsWith('+')) cleanPhone = '+' + cleanPhone;
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

  return {
    success: true,
    student,
    message: 'Akkauntingiz muvaffaqiyatli bog\'landi! ✅'
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
        { text: '🔄 Reytinglarni Yangilash', callback_data: 'admin_recalc' },
        { text: '📥 Kutilayotgan Arizalar', callback_data: 'admin_pending' }
      ]
    ]
  };
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

  // 1. /start buyrug'i
  if (text.startsWith('/start')) {
    // Agar Superadmin bo'lsa (Mansurbek Qazaqov)
    if (isSuperadmin) {
      // Superadminni bazada telegram_user_id ga bog'lash
      db.prepare(`UPDATE staff_user SET telegram_user_id = ? WHERE id = 'superadmin'`).run(SUPERADMIN_TG_ID);
      db.prepare(`UPDATE student SET telegram_user_id = ? WHERE id = 'std_mansurbek'`).run(SUPERADMIN_TG_ID);

      const totalStudents = db.prepare(`SELECT COUNT(*) as c FROM student WHERE status = 'active'`).get().c;
      const pendingCount = db.prepare(`SELECT COUNT(*) as c FROM point_entry WHERE status IN ('pending', 'pending_pv')`).get().c;
      const totalPoints = db.prepare(`SELECT COALESCE(SUM(season), 0) as s FROM student_score`).get().s;

      const adminWelcome = `🏛️ <b>Assalomu alaykum, Mansurbek Qazaqov!</b>\n` +
        `Siz AKHU Talabalar reytingi tizimi <b>Superadmini</b> sifatida tasdiqlangansiz (ID: <code>${chatId}</code>).\n\n` +
        `📊 <b>Tizimning joriy holati:</b>\n` +
        `• Faol talabalar: <b>${totalStudents} nafar</b>\n` +
        `• Kutilayotgan tasdiqlar: <b>${pendingCount} ta</b>\n` +
        `• Mavsumning jami ballari: <b>${totalPoints.toLocaleString()} ball</b>\n\n` +
        `Tizimni boshqarish va sinovdan o'tkazish uchun pastdagi tugmalardan foydalaning:`;

      await sendTelegramMessage(chatId, adminWelcome, {
        reply_markup: getSuperadminKeyboard()
      });
      return;
    }

    // Oddiy talaba yoki foydalanuvchi
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

  // 2. Contact yuborilganda (Telefon raqam orqali bog'lash)
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
          ]
        }
      });
    } else {
      await sendTelegramMessage(chatId, `❌ ${result.message}`);
    }
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
  answerCallbackQuery,
  editTelegramMessage,
  verifyTelegramInitData,
  linkStudentTelegramAccount,
  notifyStudent,
  notifyStaffDept,
  handleTelegramWebhook,
  startTelegramPolling,
  stopTelegramPolling
};
