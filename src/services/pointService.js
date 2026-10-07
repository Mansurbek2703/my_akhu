const crypto = require('crypto');
const { db } = require('../db/database');
const { recalculateStudentScores } = require('./ratingService');

/**
 * Audit jurnali yozish (R-12, X-05)
 */
function logAudit({ actor_id, actor_role, action, object_type, object_id, before = null, after = null, ip = '127.0.0.1', user_agent = 'App' }) {
  const stmt = db.prepare(`
    INSERT INTO audit_log (at, actor_id, actor_role, action, object_type, object_id, before, after, ip, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    new Date().toISOString(),
    actor_id,
    actor_role || 'system',
    action,
    object_type,
    String(object_id),
    before ? JSON.stringify(before) : null,
    after ? JSON.stringify(after) : null,
    ip,
    user_agent
  );
}

/**
 * R-02 bo'yicha ruxsat etilgan ball oralig'ini tekshirish
 */
function validatePointValue(item, points, scale_level = null, scale_role = null) {
  // Manfiy bandlar
  if (item.id === 'j1') return points === -30;
  if (item.id === 'j2') return points === -3;
  if (item.id === 'j3') return points === -10;

  // Shkala bandi bo'lsa
  if (item.is_scale) {
    if (!scale_level || !scale_role) {
      throw new Error('Shkala bandi uchun daraja (level) va rol (role) tanlanishi shart');
    }
    const scale = db.prepare(`SELECT points FROM scale_matrix WHERE level = ? AND role = ?`).get(scale_level, scale_role);
    if (!scale) {
      throw new Error(`Noto'g'ri shkala darajasi yoki roli: ${scale_level} - ${scale_role}`);
    }
    const baseP = scale.points;
    const minP = Math.round(baseP * 0.8);
    const maxP = Math.round(baseP * 1.2);
    if (points < minP || points > maxP) {
      throw new Error(`Ball ruxsat etilgan oraliqdan tashqarida. [${minP} ... ${maxP}] oralig'ida bo'lishi kerak. Siz kiritganingiz: ${points}`);
    }
    return true;
  }

  // Oddiy band bo'lsa
  if (item.base_points !== null) {
    const baseP = item.base_points;
    const minP = Math.round(baseP * 0.8);
    const maxP = Math.round(baseP * 1.2);
    if (points < minP || points > maxP) {
      throw new Error(`Ball ruxsat etilgan oraliqdan tashqarida. [${minP} ... ${maxP}] oralig'ida bo'lishi kerak. Siz kiritganingiz: ${points}`);
    }
    return true;
  }

  return true;
}

/**
 * R-01, R-06 va limitlar tekshiruvi
 */
function createPointEntries({
  student_ids,
  item_id,
  points,
  scale_level = null,
  scale_role = null,
  event_date,
  note = '',
  evidence_file_id = null,
  evidence_url = null,
  creator_user, // staff user object
  ip = '127.0.0.1'
}) {
  const item = db.prepare(`SELECT * FROM catalog_item WHERE id = ? AND archived = 0 ORDER BY version_from DESC LIMIT 1`).get(item_id);
  if (!item) {
    throw new Error(`Katalog bandi topilmadi: ${item_id}`);
  }

  if (item.is_auto) {
    throw new Error('Ushbu band avtomatik tizim tomonidan beriladi, tyutor kiritolmaydi');
  }

  // R-02: Ball oraliq tekshiruvi
  validatePointValue(item, points, scale_level, scale_role);

  // R-04: |ball| > 10 bo'lsa dalil majburiy
  if (Math.abs(points) > 10) {
    if (!evidence_file_id && !evidence_url) {
      throw new Error('Ball 10 dan yuqori bo\'lgani sababli dalil fayli yoki havola majburiy (R-04)');
    }
  }

  // R-06: Tyutor kunlik limit (60 ta)
  const todayStart = new Date().toISOString().split('T')[0];
  const tutorDailyCount = db.prepare(`
    SELECT COUNT(*) as c FROM point_entry
    WHERE created_by = ? AND created_at >= ?
  `).get(creator_user.id, `${todayStart}T00:00:00`).c;

  if (tutorDailyCount + student_ids.length > 60) {
    throw new Error(`Tyutor kunlik limiti (60 ta) oshib ketdi. Bugun kiritilgan: ${tutorDailyCount}, kiritilayotgan: ${student_ids.length}`);
  }

  const category = db.prepare(`SELECT * FROM catalog_category WHERE id = ?`).get(item.category_id);
  const approverRole = item.approver_role || category.approver_role;
  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
  const now = new Date().toISOString();

  // Tyutor guruhlarini olish
  const tutorGroups = db.prepare(`SELECT group_code FROM tutor_group WHERE tutor_id = ?`).all(creator_user.id).map(g => g.group_code);

  const createdEntries = [];

  const stmt = db.prepare(`
    INSERT INTO point_entry (
      id, student_id, item_id, item_version, category_id, base_points, points, scale_level, scale_role,
      note, event_date, evidence_file_id, evidence_url, source, created_by, created_at, status, approver_role, season_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const historyStmt = db.prepare(`
    INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const studentId of student_ids) {
      const student = db.prepare(`SELECT * FROM student WHERE id = ?`).get(studentId);
      if (!student) {
        throw new Error(`Talaba topilmadi: ${studentId}`);
      }

      // R-01: Tyutor faqat o'z talabasiga
      const isMyStudent = (student.tutor_id === creator_user.id) || tutorGroups.includes(student.group_code);
      if (!isMyStudent && !creator_user.roles.includes('superadmin')) {
        throw new Error(`R-01 qoidasi: Siz faqat o'zingizga biriktirilgan talabalarga ball kirita olasiz. Talaba: ${student.first_name} ${student.last_name} (${student.group_code})`);
      }

      // R-06: Bir talabaga bir oyda qo'lda kiritilgan yig'indi max 60 ball
      const monthStart = `${todayStart.slice(0, 7)}-01T00:00:00`;
      const monthlySumRow = db.prepare(`
        SELECT COALESCE(SUM(points), 0) as s FROM point_entry
        WHERE student_id = ? AND source = 'tutor' AND status IN ('approved', 'pending', 'pending_pv') AND created_at >= ?
      `).get(studentId, monthStart);
      const curMonthPoints = monthlySumRow.s || 0;
      if (curMonthPoints + points > 60) {
        throw new Error(`Talaba ${student.first_name} uchun oylik qo'lda kiritish limiti (60 ball) oshib ketadi. Hozirgi: ${curMonthPoints}, qo'shilayotgan: ${points}`);
      }

      // R-10: Bir yutuq bir marta (takroriy tekshiruv)
      const duplicate = db.prepare(`
        SELECT id FROM point_entry
        WHERE student_id = ? AND item_id = ? AND event_date = ? AND status NOT IN ('rejected', 'cancelled', 'revoked')
      `).get(studentId, item.id, event_date);
      if (duplicate) {
        // Ogohlantirish yoki rad
        throw new Error(`R-10: Ushbu talabaga ushbu sana (${event_date}) va band (${item.name}) bo'yicha yozuv allaqachon mavjud!`);
      }

      const entryId = 'pe_' + crypto.randomBytes(6).toString('hex');
      stmt.run(
        entryId,
        studentId,
        item.id,
        item.version_from || 1,
        item.category_id,
        item.base_points,
        points,
        scale_level,
        scale_role,
        note,
        event_date,
        evidence_file_id,
        evidence_url,
        'tutor',
        creator_user.id,
        now,
        'pending',
        approverRole,
        currentSeason.id
      );

      historyStmt.run(entryId, null, 'pending', creator_user.id, now, 'Tyutor tomonidan kiritildi');
      logAudit({
        actor_id: creator_user.id,
        actor_role: 'tutor',
        action: 'CREATE_ENTRY',
        object_type: 'point_entry',
        object_id: entryId,
        after: { student_id: studentId, item_id: item.id, points, approver_role: approverRole },
        ip
      });

      createdEntries.push(entryId);
    }
  });

  tx();
  return createdEntries;
}

/**
 * Tasdiqlash jarayoni (Bo'lim yoki Prorektor)
 * R-03: Kiritgan foydalanuvchi tasdiqlay olmaydi
 * R-05: ball >= 25 yoki < 0 bo'lsa bo'lim tasdig'idan keyin pending_pv, prorektor approved qiladi
 */
function approveEntry(entryId, approver_user, ip = '127.0.0.1') {
  const entry = db.prepare(`SELECT * FROM point_entry WHERE id = ?`).get(entryId);
  if (!entry) throw new Error('Ball yozuvi topilmadi');

  if (entry.status !== 'pending' && entry.status !== 'pending_pv') {
    throw new Error(`Yozuvni ushbu holatda tasdiqlab bo'lmaydi: ${entry.status}`);
  }

  // R-03: "Ikki qo'l qoidasi"
  if (entry.created_by === approver_user.id) {
    throw new Error('R-03: Yozuvni kiritgan foydalanuvchi uni o\'zi tasdiqlay olmaydi');
  }

  const now = new Date().toISOString();

  // Agar pending_pv bo'lsa yoki prorektor tasdiqlashi kerak bo'lsa
  if (entry.status === 'pending_pv' || entry.approver_role === 'prorektor') {
    if (!approver_user.roles.includes('prorektor') && !approver_user.roles.includes('superadmin')) {
      throw new Error('Bu yozuv prorektor tomonidan tasdiqlanishi kerak');
    }

    db.prepare(`
      UPDATE point_entry
      SET status = 'approved', approved_by = ?, approved_at = ?, pv_by = ?, pv_at = ?
      WHERE id = ?
    `).run(approver_user.id, now, approver_user.id, now, entryId);

    db.prepare(`
      INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(entryId, entry.status, 'approved', approver_user.id, now, 'Prorektor tasdiqladi');

    logAudit({
      actor_id: approver_user.id,
      actor_role: 'prorektor',
      action: 'APPROVE_ENTRY_PV',
      object_type: 'point_entry',
      object_id: entryId,
      before: { status: entry.status },
      after: { status: 'approved' },
      ip
    });

    recalculateStudentScores();
    return { status: 'approved', message: 'Prorektor tomonidan to\'liq tasdiqlandi va reytingga yozildi' };
  }

  // Bo'lim tasdiqlashi (pending holatida)
  // Huquq tekshiruvi: approver_user ushbu rolga egami?
  const hasRole = approver_user.roles.includes(entry.approver_role) || approver_user.roles.includes('superadmin');
  if (!hasRole) {
    throw new Error(`Ushbu yozuvni tasdiqlash uchun [${entry.approver_role}] roli talab qilinadi`);
  }

  // R-05: ball >= 25 yoki ball < 0 bo'lsa bo'lim tasdig'idan keyin pending_pv ga o'tadi
  if (entry.points >= 25 || entry.points < 0) {
    db.prepare(`
      UPDATE point_entry
      SET status = 'pending_pv', approved_by = ?, approved_at = ?
      WHERE id = ?
    `).run(approver_user.id, now, entryId);

    db.prepare(`
      INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(entryId, 'pending', 'pending_pv', approver_user.id, now, 'Bo\'lim tasdiqladi, prorektor nazoratiga yuborildi (R-05)');

    logAudit({
      actor_id: approver_user.id,
      actor_role: entry.approver_role,
      action: 'APPROVE_TO_PV',
      object_type: 'point_entry',
      object_id: entryId,
      before: { status: 'pending' },
      after: { status: 'pending_pv' },
      ip
    });

    return { status: 'pending_pv', message: 'Bo\'lim tasdiqladi. Ball >= 25 yoki manfiy bo\'lgani uchun Prorektor tasdig\'i kutilmoqda' };
  }

  // Oddiy ball (< 25 va > 0) -> darhol approved
  db.prepare(`
    UPDATE point_entry
    SET status = 'approved', approved_by = ?, approved_at = ?
    WHERE id = ?
  `).run(approver_user.id, now, entryId);

  db.prepare(`
    INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(entryId, 'pending', 'approved', approver_user.id, now, 'Bo\'lim tomonidan tasdiqlandi');

  logAudit({
    actor_id: approver_user.id,
    actor_role: entry.approver_role,
    action: 'APPROVE_ENTRY',
    object_type: 'point_entry',
    object_id: entryId,
    before: { status: 'pending' },
    after: { status: 'approved' },
    ip
  });

  recalculateStudentScores();
  return { status: 'approved', message: 'Yozuv muvaffaqiyatli tasdiqlandi va reytingga yozildi' };
}

/**
 * Rad etish (R-08: sabab kodi majburiy)
 */
function rejectEntry(entryId, approver_user, { reason_code, reject_note = '' }, ip = '127.0.0.1') {
  const entry = db.prepare(`SELECT * FROM point_entry WHERE id = ?`).get(entryId);
  if (!entry) throw new Error('Ball yozuvi topilmadi');

  if (entry.status !== 'pending' && entry.status !== 'pending_pv') {
    throw new Error(`Ushbu holatdagi yozuvni rad etib bo'lmaydi: ${entry.status}`);
  }

  if (!reason_code) {
    throw new Error('Rad etishda sabab kodi majburiy (R-08)');
  }

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE point_entry
    SET status = 'rejected', reject_reason_code = ?, reject_note = ?, approved_by = ?
    WHERE id = ?
  `).run(reason_code, reject_note, approver_user.id, entryId);

  db.prepare(`
    INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(entryId, entry.status, 'rejected', approver_user.id, now, `Rad etildi: ${reason_code}. ${reject_note}`);

  logAudit({
    actor_id: approver_user.id,
    actor_role: approver_user.roles[0],
    action: 'REJECT_ENTRY',
    object_type: 'point_entry',
    object_id: entryId,
    before: { status: entry.status },
    after: { status: 'rejected', reason_code, reject_note },
    ip
  });

  return { status: 'rejected', message: 'Yozuv rad etildi' };
}

/**
 * R-08: Rad etilgan yozuvni tyutor tomonidan 30 kun ichida to'g'rilab qayta yuborish (resubmit)
 */
function resubmitEntry(entryId, tutor_user, { points, note, evidence_file_id, evidence_url }, ip = '127.0.0.1') {
  const entry = db.prepare(`SELECT * FROM point_entry WHERE id = ?`).get(entryId);
  if (!entry) throw new Error('Yozuv topilmadi');
  if (entry.status !== 'rejected') throw new Error('Faqat rad etilgan yozuvni qayta yuborish mumkin');
  if (entry.created_by !== tutor_user.id && !tutor_user.roles.includes('superadmin')) {
    throw new Error('Faqat yozuvni yaratgan tyutor uni qayta yuborishi mumkin');
  }

  // 30 kunlik muddat tekshiruvi
  const daysDiff = (new Date() - new Date(entry.created_at)) / (1000 * 60 * 60 * 24);
  if (daysDiff > 30) {
    throw new Error('30 kunlik to\'g\'rilab qayta yuborish muddati o\'tib ketgan (R-08)');
  }

  const newPoints = points !== undefined ? points : entry.points;
  const item = db.prepare(`SELECT * FROM catalog_item WHERE id = ?`).get(entry.item_id);
  validatePointValue(item, newPoints, entry.scale_level, entry.scale_role);

  const now = new Date().toISOString();

  db.prepare(`
    UPDATE point_entry
    SET status = 'pending', points = ?, note = ?, evidence_file_id = ?, evidence_url = ?, reject_reason_code = NULL, reject_note = NULL
    WHERE id = ?
  `).run(
    newPoints,
    note || entry.note,
    evidence_file_id || entry.evidence_file_id,
    evidence_url || entry.evidence_url,
    entryId
  );

  db.prepare(`
    INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(entryId, 'rejected', 'pending', tutor_user.id, now, 'Tyutor tomonidan to\'g\'rilab qayta yuborildi');

  logAudit({
    actor_id: tutor_user.id,
    actor_role: 'tutor',
    action: 'RESUBMIT_ENTRY',
    object_type: 'point_entry',
    object_id: entryId,
    before: { status: 'rejected' },
    after: { status: 'pending', points: newPoints },
    ip
  });

  return { status: 'pending', message: 'Yozuv to\'g\'rilanib qayta yuborildi' };
}

/**
 * Bekor qilish (Cancelled - faqat pending holatida tyutor tomonidan)
 */
function cancelEntry(entryId, tutor_user, ip = '127.0.0.1') {
  const entry = db.prepare(`SELECT * FROM point_entry WHERE id = ?`).get(entryId);
  if (!entry) throw new Error('Yozuv topilmadi');
  if (entry.status !== 'pending') throw new Error('Faqat pending holatidagi yozuvni bekor qilish mumkin');
  if (entry.created_by !== tutor_user.id && !tutor_user.roles.includes('superadmin')) {
    throw new Error('Faqat o\'zingiz yaratgan yozuvni bekor qila olasiz');
  }

  const now = new Date().toISOString();
  db.prepare(`UPDATE point_entry SET status = 'cancelled' WHERE id = ?`).run(entryId);

  db.prepare(`
    INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(entryId, 'pending', 'cancelled', tutor_user.id, now, 'Tyutor bekor qildi');

  logAudit({
    actor_id: tutor_user.id,
    actor_role: 'tutor',
    action: 'CANCEL_ENTRY',
    object_type: 'point_entry',
    object_id: entryId,
    before: { status: 'pending' },
    after: { status: 'cancelled' },
    ip
  });

  return { status: 'cancelled' };
}

/**
 * R-11, AT-23: Qaytarib olish (revoked) - Faqat Prorektor
 */
function revokeEntry(entryId, prorektor_user, reason, ip = '127.0.0.1') {
  if (!prorektor_user.roles.includes('prorektor') && !prorektor_user.roles.includes('superadmin')) {
    throw new Error('Tasdiqlangan yozuvni faqat prorektor qaytarib olishi mumkin (R-11)');
  }
  const entry = db.prepare(`SELECT * FROM point_entry WHERE id = ?`).get(entryId);
  if (!entry) throw new Error('Yozuv topilmadi');
  if (entry.status !== 'approved') throw new Error('Faqat tasdiqlangan (approved) yozuv qaytarib olinishi mumkin');

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE point_entry
    SET status = 'revoked', reject_note = ?
    WHERE id = ?
  `).run(reason, entryId);

  db.prepare(`
    INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(entryId, 'approved', 'revoked', prorektor_user.id, now, `Prorektor tomonidan bekor qilindi: ${reason}`);

  logAudit({
    actor_id: prorektor_user.id,
    actor_role: 'prorektor',
    action: 'REVOKE_ENTRY',
    object_type: 'point_entry',
    object_id: entryId,
    before: { status: 'approved' },
    after: { status: 'revoked', reason },
    ip
  });

  recalculateStudentScores();
  return { status: 'revoked', message: 'Yozuv qaytarib olindi, ballar qayta hisoblandi' };
}

/**
 * R-09: E'tiroz (appeal) berish (talaba tomonidan 3 kun ichida)
 */
function submitAppeal(student_id, entry_id, text, ip = '127.0.0.1') {
  const entry = db.prepare(`SELECT * FROM point_entry WHERE id = ? AND student_id = ?`).get(entry_id, student_id);
  if (!entry) throw new Error('Yozuv topilmadi');

  if (entry.status !== 'rejected' && entry.status !== 'revoked') {
    throw new Error('Faqat rad etilgan yoki qaytarib olingan yozuvga e\'tiroz bildirish mumkin');
  }

  // 3 kunlik muddat tekshiruvi (AT-09)
  const historyLast = db.prepare(`
    SELECT at FROM point_entry_history WHERE entry_id = ? ORDER BY id DESC LIMIT 1
  `).get(entry_id);
  const actionTime = historyLast ? new Date(historyLast.at) : new Date(entry.created_at);
  const daysDiff = (new Date() - actionTime) / (1000 * 60 * 60 * 24);

  if (daysDiff > 3) {
    throw new Error('E\'tiroz berish muddati (3 kun) o\'tib ketgan (R-09, AT-09)');
  }

  if (!text || text.length > 500) {
    throw new Error('E\'tiroz matni 1 dan 500 belgigacha bo\'lishi kerak');
  }

  const appealId = 'app_' + crypto.randomBytes(6).toString('hex');
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO appeal (id, entry_id, student_id, text, created_at, status)
    VALUES (?, ?, ?, ?, ?, 'open')
  `).run(appealId, entry_id, student_id, text, now);

  logAudit({
    actor_id: student_id,
    actor_role: 'student',
    action: 'SUBMIT_APPEAL',
    object_type: 'appeal',
    object_id: appealId,
    after: { entry_id, text },
    ip
  });

  return { appeal_id: appealId, status: 'open' };
}

/**
 * E'tirozni hal qilish (Prorektor)
 */
function decideAppeal(appeal_id, decider_user, { accept, decision_note }, ip = '127.0.0.1') {
  if (!decider_user.roles.includes('prorektor') && !decider_user.roles.includes('superadmin')) {
    throw new Error('E\'tirozni faqat prorektor hal qila oladi');
  }

  const appeal = db.prepare(`SELECT * FROM appeal WHERE id = ?`).get(appeal_id);
  if (!appeal) throw new Error('E\'tiroz topilmadi');
  if (appeal.status !== 'open') throw new Error('E\'tiroz allaqachon ko\'rib chiqilgan');

  const now = new Date().toISOString();
  const newStatus = accept ? 'accepted' : 'declined';

  db.prepare(`
    UPDATE appeal
    SET status = ?, decided_by = ?, decided_at = ?, decision_note = ?
    WHERE id = ?
  `).run(newStatus, decider_user.id, now, decision_note, appeal_id);

  if (accept) {
    // Agar qanoatlantirilsa -> yozuv approved holatiga o'tadi
    db.prepare(`
      UPDATE point_entry
      SET status = 'approved', approved_by = ?, approved_at = ?, pv_by = ?, pv_at = ?
      WHERE id = ?
    `).run(decider_user.id, now, decider_user.id, now, appeal.entry_id);

    db.prepare(`
      INSERT INTO point_entry_history (entry_id, from_status, to_status, by_user, at, reason)
      VALUES (?, ?, 'approved', ?, ?, ?)
    `).run(appeal.entry_id, 'rejected', decider_user.id, now, `E'tiroz qanoatlantirildi: ${decision_note}`);

    recalculateStudentScores();
  }

  logAudit({
    actor_id: decider_user.id,
    actor_role: 'prorektor',
    action: 'DECIDE_APPEAL',
    object_type: 'appeal',
    object_id: appeal_id,
    after: { status: newStatus, decision_note },
    ip
  });

  return { status: newStatus, message: accept ? 'E\'tiroz qanoatlantirildi, ball yozildi' : 'E\'tiroz rad etildi' };
}

module.exports = {
  createPointEntries,
  approveEntry,
  rejectEntry,
  resubmitEntry,
  cancelEntry,
  revokeEntry,
  submitAppeal,
  decideAppeal,
  logAudit,
  validatePointValue
};
