import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)

stdin, stdout, stderr = ssh.exec_command("tailscale status; echo '--- Tailscale IP: ---'; tailscale ip -4 2>/dev/null || true")
print(stdout.read().decode('utf-8', errors='ignore'))
ssh.close()
