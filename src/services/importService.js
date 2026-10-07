const crypto = require('crypto');
const xlsx = require('xlsx');
const { db } = require('../db/database');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit } = require('./pointService');

/**
 * 10-bo'lim & AT-19: Registrator talabalar bazasi importi
 * rows: [{ external_id, first_name, last_name, group_code, program_code, level, course, gender, email, phone }]
 */
function importStudentsBatch(studentsData, { fileName = 'registrator_sync.xlsx', byUser = 'system' } = {}) {
  const batchId = 'imp_' + crypto.randomBytes(6).toString('hex');
  const now = new Date().toISOString();

  let createdCount = 0;
  let updatedCount = 0;
  const errors = [];
  const incomingExtIds = new Set();

  const insertStudent = db.prepare(`
    INSERT INTO student (
      id, external_id, first_name, last_name, group_code, program_code, level, course, gender, email, phone, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  const updateStudent = db.prepare(`
    UPDATE student
    SET first_name = ?, last_name = ?, group_code = ?, program_code = ?, level = ?, course = ?, gender = ?, email = ?, phone = ?, status = 'active', updated_at = ?
    WHERE external_id = ?
  `);

  const tx = db.transaction(() => {
    for (const row of studentsData) {
      if (!row.external_id || !row.first_name || !row.last_name || !row.group_code) {
        errors.push(`Qatorda majburiy maydon yetishmaydi: ${JSON.stringify(row)}`);
        continue;
      }

      incomingExtIds.add(String(row.external_id));

      const existing = db.prepare(`SELECT * FROM student WHERE external_id = ?`).get(String(row.external_id));
      if (existing) {
        updateStudent.run(
          row.first_name,
          row.last_name,
          row.group_code,
          row.program_code || existing.program_code,
          row.level || existing.level,
          Number(row.course) || existing.course,
          row.gender || existing.gender,
          row.email || existing.email,
          row.phone || existing.phone,
          now,
          String(row.external_id)
        );
        updatedCount++;
      } else {
        const studentId = 'std_' + crypto.randomBytes(6).toString('hex');
        insertStudent.run(
          studentId,
          String(row.external_id),
          row.first_name,
          row.last_name,
          row.group_code,
          row.program_code || 'IT',
          row.level || 'bak',
          Number(row.course) || 1,
          row.gender || 'm',
          row.email || null,
          row.phone || null,
          now,
          now
        );
        createdCount++;
      }
    }

    // AT-19: Ro'yxatda yo'q talabalar status = 'left' (o'chirilmaydi, ballari saqlanadi, reytingdan chiqadi)
    if (incomingExtIds.size > 0) {
      const allActive = db.prepare(`SELECT id, external_id FROM student WHERE status = 'active'`).all();
      let leftCount = 0;
      for (const st of allActive) {
        if (st.external_id && !incomingExtIds.has(st.external_id)) {
          db.prepare(`UPDATE student SET status = 'left', updated_at = ? WHERE id = ?`).run(now, st.id);
          leftCount++;
        }
      }
      if (leftCount > 0) {
        errors.push(`${leftCount} ta talaba ro'yxatda bo'lmagani sababli 'left' holatiga o'tkazildi`);
      }
    }

    // Import batch yozish
    db.prepare(`
      INSERT INTO import_batch (id, type, file_name, rows, created, updated, errors, by_user, at)
      VALUES (?, 'students', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      batchId,
      fileName,
      studentsData.length,
      createdCount,
      updatedCount,
      JSON.stringify(errors),
      byUser,
      now
    );

    logAudit({
      actor_id: byUser,
      actor_role: 'system',
      action: 'IMPORT_STUDENTS',
      object_type: 'import_batch',
      object_id: batchId,
      after: { created: createdCount, updated: updatedCount, rows: studentsData.length },
      ip: '127.0.0.1'
    });
  });

  tx();
  recalculateStudentScores();

  return {
    batch_id: batchId,
    created: createdCount,
    updated: updatedCount,
    errors
  };
}

/**
 * B-06: O'quv bo'limi GPA TOP 20 importi (a1 bandi)
 * Har yo'nalish bo'yicha saralab, 1-o'rin 20 ball, 2-o'rin 19 ball ... 20-o'rin 1 ball
 * gpaRows: [{ student_id yoki external_id, gpa, program_code }]
 */
function importGpaTop20(gpaRows, staffUser, { fileName = 'gpa_semestr.xlsx' } = {}) {
  if (!staffUser.roles.includes('dep_ob') && !staffUser.roles.includes('superadmin')) {
    throw new Error('Faqat O\'quv bo\'limi (Registrator) GPA ma\'lumotlarini kiritishi mumkin');
  }

  const batchId = 'imp_gpa_' + crypto.randomBytes(6).toString('hex');
  const now = new Date().toISOString();
  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };

  // Yo'nalishlar bo'yicha guruhlash
  const byProgram = {};
  for (const r of gpaRows) {
    const student = db.prepare(`
      SELECT * FROM student WHERE id = ? OR external_id = ?
    `).get(r.student_id || r.external_id, r.external_id || r.student_id);

    if (!student) continue;

    const prog = student.program_code || 'Default';
    if (!byProgram[prog]) byProgram[prog] = [];
    byProgram[prog].push({
      student_id: student.id,
      gpa: Number(r.gpa) || 0,
      prog
    });
  }

  let totalImported = 0;

  const tx = db.transaction(() => {
    for (const [prog, list] of Object.entries(byProgram)) {
      // GPA kamayish tartibida
      list.sort((a, b) => b.gpa - a.gpa);

      // Top 20 talabani olish
      const top20 = list.slice(0, 20);

      top20.forEach((item, idx) => {
        const rank = idx + 1;
        const points = 21 - rank; // 1-o'rin: 20 ball, 20-o'rin: 1 ball
        const entryId = 'pe_gpa_' + crypto.randomBytes(6).toString('hex');

        db.prepare(`
          INSERT INTO point_entry (
            id, student_id, item_id, item_version, category_id, base_points, points,
            note, event_date, source, created_by, created_at, status, approver_role,
            approved_by, approved_at, import_batch_id, season_id
          ) VALUES (?, ?, 'a1', 1, '3', ?, ?, ?, ?, 'import', ?, ?, 'approved', 'dep_ob', ?, ?, ?, ?)
        `).run(
          entryId,
          item.student_id,
          points,
          points,
          `GPA TOP 20 (${prog} yo'nalishi #${rank}-o'rin, GPA: ${item.gpa})`,
          now.split('T')[0],
          staffUser.id,
          now,
          staffUser.id,
          now,
          batchId,
          currentSeason.id
        );

        totalImported++;
      });
    }

    db.prepare(`
      INSERT INTO import_batch (id, type, file_name, rows, created, updated, by_user, at)
      VALUES (?, 'gpa', ?, ?, ?, 0, ?, ?)
    `).run(batchId, fileName, gpaRows.length, totalImported, staffUser.id, now);

    logAudit({
      actor_id: staffUser.id,
      actor_role: 'dep_ob',
      action: 'IMPORT_GPA_TOP20',
      object_type: 'import_batch',
      object_id: batchId,
      after: { totalImported, fileName },
      ip: '127.0.0.1'
    });
  });

  tx();
  recalculateStudentScores();

  return { batch_id: batchId, count: totalImported };
}

/**
 * B-06: 100% davomat ro'yxati importi (a2 bandi, +10 ball)
 */
function importAttendance100(studentIds, staffUser, { fileName = 'attendance_100.xlsx' } = {}) {
  if (!staffUser.roles.includes('dep_ob') && !staffUser.roles.includes('superadmin')) {
    throw new Error('Faqat O\'quv bo\'limi davomat ballarini kiritishi mumkin');
  }

  const batchId = 'imp_att_' + crypto.randomBytes(6).toString('hex');
  const now = new Date().toISOString();
  const currentSeason = db.prepare(`SELECT * FROM season WHERE is_current = 1 LIMIT 1`).get() || { id: '2026-2027' };
  let count = 0;

  const tx = db.transaction(() => {
    for (const sid of studentIds) {
      const student = db.prepare(`SELECT * FROM student WHERE id = ? OR external_id = ?`).get(sid, sid);
      if (!student) continue;

      const entryId = 'pe_att_' + crypto.randomBytes(6).toString('hex');

      db.prepare(`
        INSERT INTO point_entry (
          id, student_id, item_id, item_version, category_id, base_points, points,
          note, event_date, source, created_by, created_at, status, approver_role,
          approved_by, approved_at, import_batch_id, season_id
        ) VALUES (?, ?, 'a2', 1, '3', 10, 10, 'Semestr davomida 100% davomat', ?, 'import', ?, ?, 'approved', 'dep_ob', ?, ?, ?, ?)
      `).run(
        entryId,
        student.id,
        now.split('T')[0],
        staffUser.id,
        now,
        staffUser.id,
        now,
        batchId,
        currentSeason.id
      );

      count++;
    }

    db.prepare(`
      INSERT INTO import_batch (id, type, file_name, rows, created, updated, by_user, at)
      VALUES (?, 'attendance', ?, ?, ?, 0, ?, ?)
    `).run(batchId, fileName, studentIds.length, count, staffUser.id, now);

    logAudit({
      actor_id: staffUser.id,
      actor_role: 'dep_ob',
      action: 'IMPORT_ATTENDANCE_100',
      object_type: 'import_batch',
      object_id: batchId,
      after: { count, fileName },
      ip: '127.0.0.1'
    });
  });

  tx();
  recalculateStudentScores();
  return { batch_id: batchId, count };
}

module.exports = {
  importStudentsBatch,
  importGpaTop20,
  importAttendance100
};
