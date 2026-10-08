import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)

remote_script = """
set -e
cd /home/boss/my_akhu

node -e "
const { db } = require('./src/db/database');
const { recalculateStudentScores } = require('./src/services/ratingService');

db.transaction(() => {
  db.prepare('DELETE FROM point_entry_history').run();
  db.prepare('DELETE FROM point_entry').run();
  db.prepare('DELETE FROM checkin').run();
  db.prepare('DELETE FROM event_registration').run();
  db.prepare('DELETE FROM appeal').run();
  db.prepare('DELETE FROM student_score').run();
  db.prepare(\\\"DELETE FROM notification WHERE recipient_type = 'student'\\\").run();
  db.prepare('DELETE FROM student').run();
  db.prepare('DELETE FROM weekly_stars').run();
})();

const fmc = [
  { t: 'tutor_1', g: 'FMC01' },
  { t: 'tutor_1', g: 'FMC02' },
  { t: 'tutor_1', g: 'FMC03' },
  { t: 'tutor_2', g: 'FMC04' },
  { t: 'tutor_2', g: 'FMC05' }
];
for (const x of fmc) {
  db.prepare('INSERT OR REPLACE INTO tutor_group (tutor_id, group_code) VALUES (?, ?)').run(x.t, x.g);
}

recalculateStudentScores();
console.log('SERVER BAZASIDAGI TALABALAR SONI:', db.prepare('SELECT COUNT(*) as c FROM student').get().c);
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
