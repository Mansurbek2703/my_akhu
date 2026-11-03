const { db } = require('../src/db/database');

db.prepare("UPDATE lms_course SET code = 'HASS101', name = 'Academic & Communication Skills (Fall 26/27)' WHERE id = 28").run();
db.prepare("UPDATE lms_student_attendance SET course_name = 'Academic & Communication Skills (Fall 26/27)' WHERE course_id = 28").run();
db.prepare("UPDATE lms_attendance_session SET course_name = 'Academic & Communication Skills (Fall 26/27)' WHERE course_id = 28").run();
console.log('Course 28 name fixed successfully!');
