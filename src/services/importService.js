const crypto = require('crypto');
const xlsx = require('xlsx');
const { db } = require('../db/database');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit } = require('./pointService');

/**
 * Matnli kalitni normallashtirish: bo'sh joylar, tire va apostroflarni tozalash
 */
function normalizeKey(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[\'‘’`ʻʼ]/g, '')
    .replace(/[_\s-]+/g, '');
}

/**
 * Excel / CSV faylni o'qish va talabalar ro'yxatini chiqarib olish
 * Talab qilingan ustunlar:
 * ID, Ism, Familiya, yo'nalishi, guruh, telefon raqami, jinsi, kursi
 */
function parseStudentsFromWorkbook(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) return [];

  // 1. Sarlavhali obyektlar massivi
  const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false });
  // 2. 2D qatorlar massivi (ustun tartibi bo'yicha zaxira tahlil)
  const rawGrid = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

  // Sarlavha qatori indeksini aniqlash (odatda 0)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawGrid.length, 5); i++) {
    const row = rawGrid[i];
    if (Array.isArray(row)) {
      const hasId = row.some(cell => {
        const c = normalizeKey(cell);
        return c === 'id' || c === 'talabaid' || c === 'externalid';
      });
      const hasName = row.some(cell => {
        const c = normalizeKey(cell);
        return c === 'ism' || c === 'name' || c === 'firstname';
      });
      if (hasId && hasName) {
        headerRowIndex = i;
        break;
      }
    }
  }

  const parsedStudents = [];

  for (let rIndex = 0; rIndex < rawRows.length; rIndex++) {
    const raw = rawRows[rIndex];
    const normMap = {};
    for (const [k, v] of Object.entries(raw)) {
      normMap[normalizeKey(k)] = String(v !== undefined && v !== null ? v : '').trim();
    }

    const getVal = (...keys) => {
      for (const k of keys) {
        const cleaned = normalizeKey(k);
        if (normMap[cleaned] && normMap[cleaned] !== '') return normMap[cleaned];
      }
      return '';
    };

    let extId = getVal('id', 'externalid', 'talabaid', 'studentid', 'kod');
    let firstName = getVal('ism', 'firstname', 'name', 'talabaismi');
    let lastName = getVal('familiya', 'lastname', 'surname', 'talabafamiliyasi');
    let programCode = getVal('yonalishi', 'yonalish', 'fakultet', 'mutaxassislik', 'programcode', 'program');
    let groupCode = getVal('guruh', 'groupcode', 'group', 'guruhkodi');
    let phone = getVal('telefonraqami', 'telefon', 'phone', 'tel', 'aloqa', 'phonenumber');
    let genderRaw = getVal('jinsi', 'jins', 'gender', 'pol');
    let courseRaw = getVal('kursi', 'kurs', 'course', 'bosqich');

    // Ustunlar pozitsiyasi bo'yicha zaxira tahlil (A-H: ID, Ism, Familiya, yo'nalishi, guruh, telefon raqami, jinsi, kursi)
    const gridRowIndex = headerRowIndex + 1 + rIndex;
    if ((!extId || !firstName || !lastName) && rawGrid[gridRowIndex] && rawGrid[gridRowIndex].length >= 3) {
      const rowArr = rawGrid[gridRowIndex];
      if (!extId && rowArr[0] !== undefined) extId = String(rowArr[0]).trim();
      if (!firstName && rowArr[1] !== undefined) firstName = String(rowArr[1]).trim();
      if (!lastName && rowArr[2] !== undefined) lastName = String(rowArr[2]).trim();
      if (!programCode && rowArr[3] !== undefined) programCode = String(rowArr[3]).trim();
      if (!groupCode && rowArr[4] !== undefined) groupCode = String(rowArr[4]).trim();
      if (!phone && rowArr[5] !== undefined) phone = String(rowArr[5]).trim();
      if (!genderRaw && rowArr[6] !== undefined) genderRaw = String(rowArr[6]).trim();
      if (!courseRaw && rowArr[7] !== undefined) courseRaw = String(rowArr[7]).trim();
    }

    // Sarlavha qatorining o'zini o'tkazib yuborish
    if (normalizeKey(extId) === 'id' && normalizeKey(firstName) === 'ism') {
      continue;
    }

    if (!extId || !firstName || !lastName) {
      continue;
    }

    // Jinsni normallashtirish: Ayol / Female / Qiz -> 'f', Erkak / Male -> 'm'
    const genLower = genderRaw.toLowerCase();
    const gender = (genLower.startsWith('ay') || genLower.startsWith('q') || genLower.startsWith('f') || genLower === 'woman' || genLower === 'female') ? 'f' : 'm';

    // Kurs: 1, 2, 3, 4
    let course = parseInt(courseRaw, 10);
    if (isNaN(course) || course < 1 || course > 4) course = 1;

    // Yo'nalish va Guruh
    if (!programCode) programCode = 'Sun\'iy intellekt';
    if (!groupCode) groupCode = 'FMC01';

    // Level: magistr yoki bakalavr
    const level = (programCode.toLowerCase().includes('mag') || groupCode.toLowerCase().includes('mag') || groupCode.toLowerCase().startsWith('m-')) ? 'mag' : 'bak';

    // Telefon raqami: tozalash va standart formatga keltirish
    if (phone) {
      phone = phone.replace(/[\s\-\(\)]/g, '');
      if (!phone.startsWith('+')) {
        phone = '+' + phone;
      }
    }

    parsedStudents.push({
      external_id: extId,
      first_name: firstName,
      last_name: lastName,
      program_code: programCode,
      group_code: groupCode,
      phone: phone || null,
      gender,
      course,
      level,
      email: null
    });
  }

  return parsedStudents;
}

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

  const insertStudent = db.prepare(`
    INSERT INTO student (
      id, external_id, first_name, last_name, group_code, program_code, level, course, gender, email, phone, tutor_id, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);

  const updateStudent = db.prepare(`
    UPDATE student
    SET first_name = ?, last_name = ?, group_code = ?, program_code = ?, level = ?, course = ?, gender = ?, email = ?, phone = ?, tutor_id = COALESCE(?, tutor_id), status = 'active', updated_at = ?
    WHERE external_id = ?
  `);

  const insertScore = db.prepare(`
    INSERT OR IGNORE INTO student_score (
      student_id, total, season, week_cur, week_prev, by_category, events_count, rank_cohort, is_passive, updated_at
    ) VALUES (?, 0, 0, 0, 0, '{}', 0, 1, 0, ?)
  `);

  const tx = db.transaction(() => {
    for (const row of studentsData) {
      if (!row.external_id || !row.first_name || !row.last_name || !row.group_code) {
        errors.push(`Qatorda majburiy maydon yetishmaydi: ${JSON.stringify(row)}`);
        continue;
      }

      // Tyutorni guruh orqali avtomatik aniqlash
      const tutorRow = db.prepare(`SELECT tutor_id FROM tutor_group WHERE group_code = ? LIMIT 1`).get(row.group_code);
      const tutorId = row.tutor_id || (tutorRow ? tutorRow.tutor_id : null);

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
          tutorId,
          now,
          String(row.external_id)
        );
        insertScore.run(existing.id, now);
        updatedCount++;
      } else {
        const studentId = 'std_' + crypto.randomBytes(6).toString('hex');
        insertStudent.run(
          studentId,
          String(row.external_id),
          row.first_name,
          row.last_name,
          row.group_code,
          row.program_code || 'Sun\'iy intellekt',
          row.level || 'bak',
          Number(row.course) || 1,
          row.gender || 'm',
          row.email || null,
          row.phone || null,
          tutorId,
          now,
          now
        );
        insertScore.run(studentId, now);
        createdCount++;
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
  parseStudentsFromWorkbook,
  importStudentsBatch,
  importGpaTop20,
  importAttendance100
};
