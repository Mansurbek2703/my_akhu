const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { db } = require('../src/db/database');
const config = require('../src/config');
const { makeHikRequest, downloadPersonPicture } = require('../src/services/hikcentralService');

// Student tashkilot kodlari (turniketda talabalar bo'limi)
const STUDENT_ORGS = new Set(['3', '4', '5', '6', '7']); // Bachelor, Master, 1-kurs, 2-kurs

function cleanName(raw) {
  if (!raw) return '';
  let str = raw.trim();
  str = str.replace(/[ʻʼ`´\uFFFD\u00A0]/g, "'");
  str = str.replace(/\s+/g, ' ');
  return str;
}

async function syncTurniketStaffUsers() {
  console.log('====================================================');
  console.log('🔄 TURNIKET SERVERDAN HODIMLARNI TORTISH VA FOYDALANUVCHI SIFATIDA YARATISH');
  console.log('====================================================');

  // 1. HikCentral dan barcha shaxslar (persons) ro'yxatini olish
  console.log('1. HikCentral OpenAPI dan shaxslar ro\'yxatini yuklash...');
  const res = await makeHikRequest('/artemis/api/resource/v1/person/personList', { pageNo: 1, pageSize: 500 });
  const personList = (res && res.data && Array.isArray(res.data.list)) ? res.data.list : [];
  console.log(`HikCentral dan jami shaxslar olindi: ${personList.length}`);

  // 2. Tashkilotlar xaritasi
  const orgRes = await makeHikRequest('/artemis/api/resource/v1/org/orgList', { pageNo: 1, pageSize: 100 });
  const orgList = (orgRes && orgRes.data && Array.isArray(orgRes.data.list)) ? orgRes.data.list : [];
  const orgMap = {};
  orgList.forEach(o => {
    orgMap[String(o.orgIndexCode)] = o.orgName;
  });

  // 3. Bazadagi mavjud talabalar pasportlari (talabalarni hodim deb olmaslik uchun)
  const students = db.prepare('SELECT external_id FROM student WHERE external_id IS NOT NULL').all();
  const studentPassports = new Set(students.map(s => s.external_id.trim().toUpperCase()));
  console.log(`Bazada talabalar soni: ${studentPassports.size}`);

  // 4. Bazadagi mavjud 9 ta hodimni aniqlash
  const existingStaff = db.prepare('SELECT id, full_name, email, passport_id FROM staff_user').all();
  console.log(`Bazada hozirda mavjud xodimlar soni: ${existingStaff.length}`);
  const existingPassports = new Set(existingStaff.map(s => (s.passport_id || '').trim().toUpperCase()).filter(Boolean));
  const existingIds = new Set(existingStaff.map(s => (s.id || '').trim().toLowerCase()));

  // Default permissions: userlarda default holatda tadbir yaratish va boshqarish imkoniyatlari
  const defaultPermissions = JSON.stringify([
    'events_view',
    'events_create',
    'events_edit',
    'events_qr_manage',
    'events_view_registrations',
    'observe_analytics'
  ]);

  const uploadDir = config.uploadDir || path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  let createdCount = 0;
  let skippedExistingCount = 0;
  let skippedStudentCount = 0;
  const createdUsers = [];

  for (const p of personList) {
    const orgCode = String(p.orgIndexCode || '');
    const personCode = (p.personCode || '').trim().toUpperCase();
    const rawName = p.personName || '';
    const name = cleanName(rawName);

    // Agar talabalar bo'limida bo'lsa - o'tkazib yuboramiz
    if (STUDENT_ORGS.has(orgCode)) {
      continue;
    }

    // Agar passport student bazasida bo'lsa - o'tkazib yuboramiz
    if (studentPassports.has(personCode)) {
      skippedStudentCount++;
      continue;
    }

    // Agar passport mavjud 9 ta xodim ichida bo'lsa - saqlab qolamiz (o'zgartirmaymiz)
    if (existingPassports.has(personCode) || existingIds.has(personCode.toLowerCase())) {
      skippedExistingCount++;
      continue;
    }

    if (!personCode) {
      console.warn(`Ogohlantirish: ${name} da passport/personCode topilmadi, o'tkazib yuborildi.`);
      continue;
    }

    const userId = personCode.toLowerCase();
    const passportId = personCode;
    const email = `${userId}@akhu.uz`;
    const phone = p.phoneNo ? p.phoneNo.trim() : null;
    const orgName = orgMap[orgCode] || 'AKHU';

    // Rasm yuklab olish
    let photoUrl = null;
    const picUri = p.personPhoto ? p.personPhoto.picUri : null;
    if (picUri && p.personId) {
      try {
        const picRes = await downloadPersonPicture(p.personId, picUri);
        if (picRes && picRes.success && picRes.buffer) {
          const filename = `avatar_${userId}_turniket.jpg`;
          const filePath = path.join(uploadDir, filename);
          fs.writeFileSync(filePath, picRes.buffer);
          photoUrl = `/api/files/${filename}`;
        }
      } catch (picErr) {
        // Rasm yuklanmasa ham davom etaveradi
      }
    }

    // Login va parol bir xil: passport ID!
    // Parol hash qilinadi: bcrypt.hashSync(passportId, 8)
    const passwordHash = bcrypt.hashSync(passportId, 8);
    const nowIso = new Date().toISOString();

    try {
      db.prepare(`
        INSERT INTO staff_user (
          id, full_name, email, sso_subject, roles, twofa_enabled, active,
          password_hash, phone, photo_url, passport_id, permissions, bot_status, created_at
        ) VALUES (?, ?, ?, ?, '["staff"]', 0, 1, ?, ?, ?, ?, ?, 'not_started', ?)
        ON CONFLICT (id) DO UPDATE SET
          full_name = excluded.full_name,
          passport_id = excluded.passport_id,
          password_hash = excluded.password_hash,
          photo_url = COALESCE(excluded.photo_url, staff_user.photo_url),
          permissions = excluded.permissions,
          active = 1
      `).run(
        userId,
        name,
        email,
        `sso_${userId}`,
        passwordHash,
        phone,
        photoUrl,
        passportId,
        defaultPermissions,
        nowIso
      );

      createdCount++;
      createdUsers.push({
        id: userId,
        full_name: name,
        passport_id: passportId,
        department: orgName,
        photo: !!photoUrl
      });
      console.log(`✅ [${createdCount}] Yaratildi: ${name} | Login: ${passportId} | Parol: ${passportId} | Bo'lim: ${orgName}`);
    } catch (insertErr) {
      console.error(`Xatolik (${name}):`, insertErr.message);
    }
  }

  console.log('\n====================================================');
  console.log('🎉 XULOSA:');
  console.log(`- Turniketdan olingan yangi xodimlar: ${createdCount}`);
  console.log(`- Mavjud 9 ta xodim (o'zgartirishsiz saqlangan): ${skippedExistingCount}`);
  console.log(`- Talabalar filtri bilan o'tkazib yuborilgan: ${skippedStudentCount}`);
  console.log(`- Tizimdagi jami xodimlar soni: ${existingStaff.length + createdCount}`);
  console.log('====================================================\n');

  return {
    success: true,
    created: createdCount,
    existing: skippedExistingCount,
    total: existingStaff.length + createdCount,
    users: createdUsers
  };
}

if (require.main === module) {
  syncTurniketStaffUsers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal sync error:', err);
      process.exit(1);
    });
}

module.exports = { syncTurniketStaffUsers };
