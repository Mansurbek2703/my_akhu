import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)

script = """
cd /home/boss/my_akhu
node -e "
const { db } = require('./src/db/database');
const st = db.prepare('SELECT * FROM student WHERE first_name LIKE ? OR last_name LIKE ?').all('%Mansur%', '%Qazaqov%');
console.log('STUDENTS:', JSON.stringify(st, null, 2));
if (st.length > 0) {
  const entries = db.prepare('SELECT * FROM point_entry WHERE student_id = ?').all(st[0].id);
  console.log('ENTRIES:', JSON.stringify(entries, null, 2));
  const score = db.prepare('SELECT * FROM student_score WHERE student_id = ?').all(st[0].id);
  console.log('SCORE:', JSON.stringify(score, null, 2));
  const checkins = db.prepare('SELECT * FROM checkin WHERE student_id = ?').all(st[0].id);
  console.log('CHECKINS:', JSON.stringify(checkins, null, 2));
}
"
"""

stdin, stdout, stderr = ssh.exec_command(script)
print("OUT:", stdout.read().decode('utf-8'))
print("ERR:", stderr.read().decode('utf-8'))
ssh.close()
