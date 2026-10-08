import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)
cmd = """
cd /home/boss/my_akhu
node -e "
const { db } = require('./src/db/database');
const mansur = db.prepare('SELECT id, first_name, last_name, group_code FROM student WHERE first_name LIKE ? OR last_name LIKE ?').all('%Mansur%', '%Qazaqov%');
console.log('MANSUR STUDENTS:', JSON.stringify(mansur));

const entries = db.prepare('SELECT * FROM point_entry').all();
console.log('ALL POINT ENTRIES:', JSON.stringify(entries, null, 2));

const checkins = db.prepare('SELECT * FROM checkin').all();
console.log('ALL CHECKINS:', JSON.stringify(checkins, null, 2));

const scores = db.prepare('SELECT * FROM student_score WHERE total > 0').all();
console.log('SCORES > 0:', JSON.stringify(scores, null, 2));
"
"""
stdin, stdout, stderr = ssh.exec_command(cmd)
print("STDOUT:\n", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:\n", stderr.read().decode('utf-8', errors='ignore'))
ssh.close()
