const { db } = require('../src/db/database');

function populateMissingEnrollments() {
  const students = db.prepare('SELECT id, moodle_id, group_code, course FROM student WHERE status = \'active\'').all();
  const insertEnrollment = db.prepare(`
    INSERT INTO lms_course_enrollment (course_id, moodle_student_id, student_id, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (course_id, moodle_student_id) DO UPDATE SET
      student_id = EXCLUDED.student_id
  `);

  const nowIso = new Date().toISOString();
  let added = 0;

  for (const s of students) {
    if (!s.moodle_id) continue;
    const gc = (s.group_code || '').toUpperCase();
    const prefix = gc.slice(0, 3);
    let courses = [];

    if (prefix === 'FMC') {
      courses = [22, 23, 24, 25, 26, 39];
    } else if (prefix === 'FDT') {
      courses = [21, 23, 24, 25, 26, 39];
    } else if (prefix === 'SSE' || prefix === 'SAI') {
      courses = [17, 29, 30, 31, 32, 33, 39];
    } else if (prefix === 'SDT') {
      courses = [17, 18, 19, 20, 21, 39];
    }

    for (const cid of courses) {
      try {
        insertEnrollment.run(cid, s.moodle_id, s.id, nowIso);
        added++;
      } catch (e) {}
    }
  }

  console.log(`[ENROLLMENTS] Populated/updated ${added} course enrollment entries.`);
}

populateMissingEnrollments();
