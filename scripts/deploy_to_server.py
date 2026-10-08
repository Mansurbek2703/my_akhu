import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)

# Deploy skripti - HECH QACHON talabalarni yoki ma'lumotlarni o'chirmaydi!
remote_script = """
set -e
cd /home/boss/my_akhu
git pull origin main

node -e "
const { initSchema, db } = require('./src/db/database');
initSchema();

// FMC guruhlari mavjudligini ta'minlash (mavjud bo'lsa tegilmaydi)
const fmc = [
  { t: 'tutor_1', g: 'FMC01' },
  { t: 'tutor_1', g: 'FMC02' },
  { t: 'tutor_1', g: 'FMC03' },
  { t: 'tutor_2', g: 'FMC04' },
  { t: 'tutor_2', g: 'FMC05' }
];
for (const x of fmc) {
  const tutorExists = db.prepare('SELECT id FROM staff_user WHERE id = ?').get(x.t);
  if (tutorExists) {
    db.prepare('INSERT OR IGNORE INTO tutor_group (tutor_id, group_code) VALUES (?, ?)').run(x.t, x.g);
  }
}

const count = db.prepare('SELECT COUNT(*) as c FROM student').get().c;
console.log('SERVER BAZASIDAGI TALABALAR SONI:', count);

const { awardWelcomeBonus } = require('./src/services/pointService');
const linkedStudents = db.prepare("SELECT id FROM student WHERE telegram_user_id IS NOT NULL").all();
for (const s of linkedStudents) {
  awardWelcomeBonus(s.id);
}
console.log('TELEGRAM BOGLANGAN TALABALARGA ILK BONUS TEKSHIRILDI VA TAQDIM ETILDI');
"

pm2 restart akhu-talabalar
pm2 status
"""

stdin, stdout, stderr = ssh.exec_command(remote_script)
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

print("STDOUT:\n" + out)
if err:
    print("STDERR:\n" + err)

ssh.close()
