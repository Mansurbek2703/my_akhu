import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

cmd = sys.argv[1] if len(sys.argv) > 1 else 'tailscale status'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)

stdin, stdout, stderr = ssh.exec_command(f"echo Sshtelnet27032004! | sudo -S {cmd}")
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

print("OUT:\n" + out)
if err:
    print("ERR:\n" + err)

ssh.close()
