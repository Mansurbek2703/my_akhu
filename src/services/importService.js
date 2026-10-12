const crypto = require('crypto');
const xlsx = require('xlsx');
const { db } = require('../db/database');
const { recalculateStudentScores } = require('./ratingService');
const { logAudit } = require('./pointService');
const { normalizePhoneNumber } = require('../utils/phoneUtils');

/**
 * Matnli kalitni normallashtirish: bo'sh joylar, tire va apostroflarni tozalash
 */
function normalizeKey(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[\'‘’`ʻʼ]/g, '')
    .replace(/[/\\.,:;]/g, '')
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

  // 1. 2D qatorlar massivi (ustun tartibi bo'yicha tahlil)
  const rawGrid = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });

  // Sarlavha qatori indeksini aniqlash (0-10 qatorlar orasidan)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawGrid.length, 10); i++) {
    const row = rawGrid[i];
    if (Array.isArray(row)) {
      const rowKeys = row.map(cell => normalizeKey(cell));
      const hasName = rowKeys.some(c => 
        c === 'ism' || c.includes('ism') || c.includes('familiya') || c.includes('fish') || c.includes('fio') || c.includes('name')
      );
      const hasOther = rowKeys.some(c => 
        c.includes('guruh') || c.includes('group') || c.includes('telefon') || c.includes('phone') || c.includes('yonalish') || c === 'id' || c === 'n' || c === 'tr'
      );
      if (hasName && hasOther) {
        headerRowIndex = i;
        break;
      }
    }
  }

  // Sarlavha qatoridagi ustunlarni tahlil qilish
  const headerRow = rawGrid[headerRowIndex] || [];
  const headerKeys = Array.isArray(headerRow) ? headerRow.map(cell => normalizeKey(cell)) : [];
  
  // "bosqich" yoki ta'lim bosqichiga oid alohida ustun mavjudligini aniqlash (9-ustun)
  const hasBosqichColumn = headerKeys.some(k => 
    k === 'bosqich' || k === 'bosqichi' || k === 'talimbosqichi' || k === 'talim_bosqichi' || k === 'daraja' || k === 'level' || k === 'educationlevel'
  );

  // Sarlavhali obyektlar massivi
  const rawRows = headerRowIndex > 0
    ? xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '', raw: false })
    : xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false });

  const parsedStudents = [];

  for (let rIndex = 0; rIndex < rawRows.length; rIndex++) {
    const raw = rawRows[rIndex];
    const normMap = {};
    for (const [k, v] of Object.entries(raw)) {
      normMap[normalizeKey(k)] = String(v !== undefined && v !== null ? v : '').trim();
    }

    const getVal = (...keys) => {
      // 1. Aniq moslik
      for (const k of keys) {
        const cleaned = normalizeKey(k);
        if (normMap[cleaned] !== undefined && normMap[cleaned] !== '') return normMap[cleaned];
      }
      // 2. Qisman moslik (faqat fullName ustunlari bo'lmagan ustunlar uchun)
      for (const k of keys) {
        const cleaned = normalizeKey(k);
        if (cleaned.length >= 4) {
          for (const [colKey, colVal] of Object.entries(normMap)) {
            if (colKey.includes('toliq') || colKey.includes('fish') || colKey.includes('fio')) continue;
            if (colVal !== '' && colKey.includes(cleaned)) return colVal;
          }
        }
      }
      return '';
    };

    let extId = getVal('id', 'externalid', 'talabaid', 'studentid', 'kod', 'hemisid', 'hemis_id', 'idraqam', 'idraqami', 'n', 'tr', 'tartib', 'raqam', 'no');
    let firstName = getVal('ism', 'firstname', 'name', 'talabaismi');
    let lastName = getVal('familiya', 'lastname', 'surname', 'talabafamiliyasi');
    const fullName = getVal('toliqismifamiliyasharifi', 'toliqismi', 'toliqism', 'fish', 'fio', 'fullname', 'ismfamiliya', 'familiyaism', 'talaba', 'talabafish');

    // Agar F.I.Sh bitta ustunda bo'lsa (Screenshot 1 dagi kabi: "Abdullayeva Mohira Xudoybergan qizi")
    if (fullName || (!firstName || !lastName)) {
      const srcName = fullName || (firstName && lastName ? `${lastName} ${firstName}` : (firstName || lastName));
      if (srcName && (fullName || !firstName || !lastName || firstName === lastName)) {
        const parts = srcName.trim().split(/\s+/);
        if (parts.length === 1) {
          lastName = parts[0];
          firstName = parts[0];
        } else if (parts.length === 2) {
          lastName = parts[0];
          firstName = parts[1];
        } else {
          lastName = parts[0];
          firstName = parts.slice(1).join(' ');
        }
      }
    }

    let programCode = getVal('yonalishi', 'yonalish', 'fakultet', 'mutaxassislik', 'programcode', 'program', 'yonalishkodi');
    let groupCode = getVal('guruhi', 'guruh', 'groupcode', 'group', 'guruhkodi', 'gruppa');
    let phone = getVal('telegramtelefonraqami', 'telegramtelefon', 'telegramtel', 'telefonraqami', 'telefonraqam', 'telefon', 'phone', 'phonenumber', 'tel', 'aloqa', 'aloqaraqami', 'aloqauchun', 'tgphone', 'tgtelefon');
    let genderRaw = getVal('jinsi', 'jins', 'gender', 'pol');
    let courseRaw = getVal('kursi', 'kurs', 'course');
    if (!courseRaw && !hasBosqichColumn) {
      const possibleCourse = getVal('bosqich', 'bosqichi');
      if (possibleCourse && /\d/.test(possibleCourse)) {
        courseRaw = possibleCourse;
      }
    }

    // Ustunlar pozitsiyasi bo'yicha zaxira tahlil
    const gridRowIndex = headerRowIndex + 1 + rIndex;
    if ((!firstName || !lastName) && !fullName && rawGrid[gridRowIndex] && rawGrid[gridRowIndex].length >= 3) {
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

    // Telefon va guruh qidirish zaxirasi
    if (!phone) {
      for (const [k, v] of Object.entries(normMap)) {
        if (v && (k.includes('telefon') || k.includes('phone') || k.includes('aloqa'))) {
          phone = v;
          break;
        }
      }
    }
    if (!groupCode) {
      for (const [k, v] of Object.entries(normMap)) {
        if (v && (k.includes('guruh') || k.includes('group'))) {
          groupCode = v;
          break;
        }
      }
    }
    if (!programCode) {
      for (const [k, v] of Object.entries(normMap)) {
        if (v && (k.includes('yonalish') || k.includes('program') || k.includes('fakultet'))) {
          programCode = v;
          break;
        }
      }
    }

    // Sarlavha qatorining o'zini o'tkazib yuborish
    if ((normalizeKey(extId) === 'id' || normalizeKey(extId) === 'tr' || normalizeKey(extId) === 'n') && (normalizeKey(firstName) === 'ism' || normalizeKey(lastName) === 'familiya')) {
      continue;
    }

    if (!firstName || !lastName) {
      continue;
    }

    // Jinsni normallashtirish: Ayol / Female / Qiz -> 'f', Erkak / Male -> 'm'
    const genLower = (genderRaw || '').toLowerCase();
    const gender = (genLower.startsWith('ay') || genLower.startsWith('q') || genLower.startsWith('f') || genLower === 'woman' || genLower === 'female') ? 'f' : 'm';

    // Kurs: 1, 2, 3, 4 (masalan '2-kurs' -> 2)
    let course = 1;
    if (courseRaw) {
      const match = String(courseRaw).match(/\d+/);
      if (match) {
        const c = parseInt(match[0], 10);
        if (c >= 1 && c <= 4) course = c;
      }
    }

    // Yo'nalish va Guruh
    if (!programCode) programCode = 'Dasturiy ta\'minot muhandisligi';
    if (!groupCode) groupCode = 'SS01';

    // Level: Agar fayldagi ustunlar soni 8 bo'lsa va unda "bosqich" degan 9-ustuni bo'lmasa,
    // ularning barchasini tizim avtomatik bakalavr deb qabul qiladi.
    let level = 'bak';
    let levelRaw = '';
    if (hasBosqichColumn) {
      levelRaw = getVal('bosqich', 'bosqichi', 'talimbosqichi', 'talim_bosqichi', 'daraja', 'level', 'educationlevel');
    } else if (rawGrid[gridRowIndex] && rawGrid[gridRowIndex].length >= 9 && rawGrid[gridRowIndex][8] !== undefined) {
      const s8 = String(rawGrid[gridRowIndex][8]).trim().toLowerCase();
      if (s8.includes('mag') || s8.includes('bak')) {
        levelRaw = s8;
      }
    }

    if (levelRaw) {
      const lLower = levelRaw.toLowerCase();
      if (lLower.includes('mag') || lLower.includes('master')) {
        level = 'mag';
      } else {
        level = 'bak';
      }
    } else {
      level = 'bak';
    }

    // External ID unikalligini ta'minlash
    if (!extId) {
      extId = `${groupCode}_${String(rIndex + 1).padStart(3, '0')}`;
    } else {
      const isSimpleSeq = /^\d{1,4}$/.test(extId);
      if (isSimpleSeq && groupCode) {
        extId = `${groupCode}_${String(extId).padStart(3, '0')}`;
      }
    }

    // Telefon raqami: qat'iy normallashtirish (+ bilan bo'lsa xalqaro affiksga tegmaslik, 9 ta raqam bo'lsa +998 qo'shish)
    const normalizedPhone = normalizePhoneNumber(phone);

    parsedStudents.push({
      external_id: extId,
      first_name: firstName,
      last_name: lastName,
      program_code: programCode,
      group_code: groupCode,
      phone: normalizedPhone,
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

      // Telefon raqamini qayta normallashtirish
      const normPhone = normalizePhoneNumber(row.phone);

      // Tyutorni guruh orqali avtomatik aniqlash
      const tutorRow = db.prepare(`SELECT tutor_id FROM tutor_group WHERE group_code = ? LIMIT 1`).get(row.group_code);
      const tutorId = row.tutor_id || (tutorRow ? tutorRow.tutor_id : null);

      let existing = db.prepare(`SELECT * FROM student WHERE external_id = ?`).get(String(row.external_id));
      if (!existing && normPhone) {
        existing = db.prepare(`SELECT * FROM student WHERE phone = ?`).get(normPhone);
      }
      if (!existing && row.first_name && row.last_name && row.group_code) {
        existing = db.prepare(`SELECT * FROM student WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?) AND LOWER(group_code) = LOWER(?)`).get(row.first_name, row.last_name, row.group_code);
      }

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
          normPhone || existing.phone,
          tutorId,
          now,
          existing.external_id
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
          row.program_code || 'Dasturiy ta\'minot muhandisligi',
          row.level || 'bak',
          Number(row.course) || 1,
          row.gender || 'm',
          row.email || null,
          normPhone || null,
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
