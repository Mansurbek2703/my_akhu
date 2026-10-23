import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print("Connecting to 192.168.1.2...")
ssh.connect('192.168.1.2', port=22, username='boss', password='Sshtelnet27032004!', timeout=15)
print("Connected!")

install_cmd = """
echo Sshtelnet27032004! | sudo -S bash -c '
set -e
echo "=== Step 1: Downloading and running Tailscale installer ==="
curl -fsSL https://tailscale.com/install.sh | sh

echo "=== Step 2: Enabling and starting tailscaled ==="
systemctl enable --now tailscaled
systemctl status tailscaled --no-pager
'
"""

stdin, stdout, stderr = ssh.exec_command(install_cmd, get_pty=True)
while not stdout.channel.exit_status_ready():
    if stdout.channel.recv_ready():
        data = stdout.channel.recv(1024).decode('utf-8', errors='ignore')
        print(data, end='', flush=True)
    time.sleep(0.5)

# print any remaining output
print(stdout.read().decode('utf-8', errors='ignore'))
print(stderr.read().decode('utf-8', errors='ignore'))

ssh.close()
