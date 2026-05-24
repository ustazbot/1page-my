#!/bin/bash
set -e

echo "======================================="
echo "  1page.my — VPS Setup Script"
echo "  Jalankan sekali sahaja sebagai root"
echo "======================================="
echo ""

# Update system
echo "[1/6] Update system packages..."
apt-get update -y && apt-get upgrade -y

# Install Node.js 20 LTS
echo "[2/6] Install Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node --version
npm --version

# Install PM2
echo "[3/6] Install PM2..."
npm install -g pm2
pm2 --version

# Install Cloudflare Tunnel (cloudflared)
echo "[4/6] Install Cloudflare Tunnel..."
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | tee /etc/apt/sources.list.d/cloudflared.list
apt-get update -y && apt-get install -y cloudflared
cloudflared --version

# Configure UFW Firewall
echo "[5/6] Configure UFW firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000/tcp
ufw status verbose

# Setup app directory
echo "[6/6] Setup app directory..."
mkdir -p /var/www/1page-my
mkdir -p /var/log/pm2

echo ""
echo "======================================="
echo "  Setup selesai!"
echo ""
echo "  Seterusnya:"
echo "  1. Login Cloudflare: cloudflared tunnel login"
echo "  2. Buat tunnel: cloudflared tunnel create 1page-my"
echo "  3. Isi TUNNEL_ID dalam cloudflare-tunnel/config.yml"
echo "  4. Jalankan: bash scripts/deploy-first-time.sh"
echo "======================================="
