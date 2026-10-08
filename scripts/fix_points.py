import paramiko
import sys

# Ensure UTF-8 output on Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)

fix_script = """
cd /home/boss/my_akhu
node -e "
const { db } = require('./src/db/database');
const { recalculateStudentScores } = require('./src/services/ratingService');

db.transaction(() => {
  // 1. Delete initial login welcome bonuses
  const delBonus = db.prepare('DELETE FROM point_entry WHERE item_id = \\'i0\\' OR note LIKE \\'%ilk kirish bonusi%\\'').run();
  console.log('Deleted welcome bonuses count:', delBonus.changes);

  // 2. Delete orphaned point entries for events that no longer exist
  const delOrphans = db.prepare('DELETE FROM point_entry WHERE event_id IS NOT NULL AND event_id NOT IN (SELECT id FROM event)').run();
  console.log('Deleted orphan event points count:', delOrphans.changes);

  // 3. Delete point entry histories for non-existing point entries
  const delHist = db.prepare('DELETE FROM point_entry_history WHERE entry_id NOT IN (SELECT id FROM point_entry)').run();
  console.log('Deleted orphaned history count:', delHist.changes);
})();

// 4. Recalculate all scores
recalculateStudentScores();
console.log('Recalculation complete.');

// 5. Inspect Mansurbek Qazaqov score
const score = db.prepare('SELECT * FROM student_score WHERE student_id = \\'std_c52d7fefd78c\\'').get();
console.log('Mansurbek Qazaqov updated score:', JSON.stringify(score, null, 2));

const allEntries = db.prepare('SELECT id, student_id, points, note FROM point_entry').all();
console.log('Remaining point entries:', JSON.stringify(allEntries, null, 2));
"
"""

stdin, stdout, stderr = ssh.exec_command(fix_script)
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')
print("OUTPUT:\n", out)
if err:
    print("ERRORS:\n", err)

ssh.close()
