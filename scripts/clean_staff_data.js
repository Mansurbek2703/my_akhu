const { db } = require('../src/db/database');

console.log('--- Cleaning up staff_user data ---');

// 1. Reset invalid telegram_user_id (e.g. 'null', 'undefined', '', '@...')
const r1 = db.prepare(`
  UPDATE staff_user 
  SET telegram_user_id = NULL 
  WHERE telegram_user_id = 'null' 
     OR telegram_user_id = 'undefined' 
     OR telegram_user_id = '' 
     OR telegram_user_id LIKE '@%'
`).run();
console.log('Fixed invalid telegram_user_id:', r1.changes);

// 2. Reset invalid telegram_username
const r2 = db.prepare(`
  UPDATE staff_user 
  SET telegram_username = NULL 
  WHERE telegram_username = 'null' 
     OR telegram_username = 'undefined' 
     OR telegram_username = ''
`).run();
console.log('Fixed invalid telegram_username:', r2.changes);

// 3. Ensure seydmatov has username
db.prepare(`
  UPDATE staff_user 
  SET telegram_username = 'seydmatov' 
  WHERE id = 'seydmatov2026' AND (telegram_username IS NULL OR telegram_username = '')
`).run();

// 4. Clean up phone numbers to remove spaces/dashes
const allStaff = db.prepare('SELECT id, phone, telegram_phone FROM staff_user').all();
for (const s of allStaff) {
  let cleanP = s.phone ? s.phone.replace(/[^0-9+]/g, '') : null;
  let cleanTgP = s.telegram_phone ? s.telegram_phone.replace(/[^0-9+]/g, '') : null;
  if (cleanP && !cleanP.startsWith('+') && cleanP.startsWith('998')) cleanP = '+' + cleanP;
  if (cleanTgP && !cleanTgP.startsWith('+') && cleanTgP.startsWith('998')) cleanTgP = '+' + cleanTgP;

  db.prepare('UPDATE staff_user SET phone = ?, telegram_phone = ? WHERE id = ?').run(cleanP, cleanTgP, s.id);
}

const list = db.prepare('SELECT id, full_name, phone, telegram_user_id, telegram_username, telegram_phone FROM staff_user').all();
console.log('Updated staff list:');
list.forEach(s => {
  console.log(` - ${s.id} (${s.full_name}): phone="${s.phone}", tg_id="${s.telegram_user_id}", tg_user="${s.telegram_username}"`);
});
