#!/bin/bash
set -e

echo "======================================="
echo "  1page.my — First Deployment Script"
echo "======================================="
echo ""

# GANTI dengan URL repo GitHub Bos
REPO_URL="git@github.com:YOUR_USERNAME/YOUR_REPO.git"
APP_DIR="/var/www/1page-my"

# Validate REPO_URL before proceeding
if [[ "$REPO_URL" == *"YOUR_USERNAME"* ]]; then
  echo "ERROR: Ganti REPO_URL dalam script ini dengan URL repo GitHub sebenar sebelum jalankan."
  exit 1
fi

# Clone atau pull repo
echo "[1/5] Clone/pull repository..."
if [ -d "$APP_DIR/.git" ]; then
  echo "Folder sudah ada — pull latest..."
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

command -v pm2 >/dev/null 2>&1 || { echo "ERROR: PM2 tidak dijumpai. Jalankan scripts/setup.sh dulu."; exit 1; }

# Install dependencies
echo "[2/5] Install npm dependencies..."
npm ci

# Reminder buat .env.local
echo ""
echo "======================================="
echo "  PENTING: Buat .env.local sekarang"
echo "======================================="
echo ""
echo "  Salin template ini ke /var/www/1page-my/.env.local"
echo "  kemudian isi semua values:"
echo ""
echo "  NEXT_PUBLIC_SUPABASE_URL="
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY="
echo "  SUPABASE_SERVICE_ROLE_KEY="
echo "  R2_ACCOUNT_ID=5cd1aa89e93ec2668fe3db11a5fd36a3"
echo "  R2_ACCESS_KEY_ID="
echo "  R2_SECRET_ACCESS_KEY="
echo "  R2_BUCKET_NAME=order-images"
echo "  NEXT_PUBLIC_R2_PUBLIC_URL="
echo "  TOYYIBPAY_API_KEY="
echo "  TOYYIBPAY_CATEGORY_CODE="
echo "  CF_DEPLOY_HOOK_URL="
echo "  CF_ACCOUNT_ID=5cd1aa89e93ec2668fe3db11a5fd36a3"
echo "  CF_ZONE_ID=9b7265a5663d31f2912521b0befa06ce"
echo "  BOS_WHATSAPP_NUMBER="
echo "  TELEGRAM_BOT_TOKEN="
echo "  TELEGRAM_CHAT_ID="
echo "  ADMIN_EMAIL="
echo "  ADMIN_PASSWORD="
echo "  ADMIN_SESSION_SECRET="
echo "  NEXT_PUBLIC_AFFILIATE_COMMISSION_RATE=0.40"
echo "  NEXT_PUBLIC_BASE_PRICE=150"
echo ""
echo "  Gunakan: nano /var/www/1page-my/.env.local"
echo ""
read -p "Tekan ENTER selepas .env.local siap dan disimpan..."

# Verify .env.local wujud
if [ ! -f "$APP_DIR/.env.local" ]; then
  echo "ERROR: .env.local tidak dijumpai. Sila buat dulu."
  exit 1
fi

if [ ! -s "$APP_DIR/.env.local" ]; then
  echo "ERROR: .env.local wujud tapi kosong. Sila isi semua values."
  exit 1
fi

# Build app
echo "[3/5] Build Next.js app..."
npm run build

# Start dengan PM2
echo "[4/5] Start app dengan PM2..."
pm2 start "$APP_DIR/ecosystem.config.js"
pm2 save
eval "$(pm2 startup systemd -u root --hp /root | tail -1)"

echo "[5/5] Verify app berjalan..."
sleep 3
pm2 status

echo ""
echo "======================================="
echo "  First deployment selesai!"
echo ""
echo "  App berjalan di http://localhost:3000"
echo ""
echo "  Seterusnya:"
echo "  1. Setup Cloudflare Tunnel (ikut DEPLOYMENT.md Bahagian D)"
echo "  2. Test: https://1page.my"
echo "======================================="
