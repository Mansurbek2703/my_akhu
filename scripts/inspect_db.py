import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)
cmd = """
cd /home/boss/my_akhu
node -e "
const { db } = require('./src/db/database');
console.log('CATALOG ITEMS:', db.prepare('SELECT id, name FROM catalog_item LIMIT 10').all());
console.log('POINT ENTRIES:', db.prepare('SELECT id, student_id, item_id, category_id, points, note, created_at FROM point_entry').all());
"
"""
stdin, stdout, stderr = ssh.exec_command(cmd)
print("STDOUT:\n", stdout.read().decode('utf-8', errors='ignore'))
print("STDERR:\n", stderr.read().decode('utf-8', errors='ignore'))
ssh.close()
