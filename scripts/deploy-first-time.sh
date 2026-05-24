#!/bin/bash
set -e
set -o pipefail

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
echo "  # Supabase"
echo "  NEXT_PUBLIC_SUPABASE_URL="
echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY="
echo "  SUPABASE_SERVICE_ROLE_KEY="
echo ""
echo "  # Admin"
echo "  ADMIN_EMAIL="
echo "  ADMIN_PASSWORD="
echo "  ADMIN_SESSION_SECRET="
echo ""
echo "  # ToyyibPay"
echo "  TOYYIBPAY_API_KEY="
echo "  TOYYIBPAY_CATEGORY_CODE="
echo ""
echo "  # Cloudflare"
echo "  CF_DEPLOY_HOOK_URL="
echo "  CLOUDFLARE_API_TOKEN="
echo "  CLOUDFLARE_ACCOUNT_ID="
echo "  CF_PAGES_PROJECT_LIVE="
echo "  CF_PAGES_PROJECT_PREVIEW="
echo ""
echo "  # Telegram Bot"
echo "  TELEGRAM_BOT_TOKEN="
echo "  TELEGRAM_CHAT_ID="
echo ""
echo "  # WhatsApp"
echo "  NEXT_PUBLIC_WHATSAPP_NUMBER="
echo "  BOS_WHATSAPP_REDIRECT="
echo "  NEXT_PUBLIC_BOS_WA_REDIRECT="
echo ""
echo "  # App"
echo "  NEXT_PUBLIC_BASE_URL="
echo "  NEXT_PUBLIC_LIVE_DOMAIN=1page.my"
echo "  NEXT_PUBLIC_PREVIEW_DOMAIN=preview.1page.my"
echo "  NEXT_PUBLIC_GOOGLE_FORM_URL="
echo ""
echo "  # AI (untuk AI-powered features)"
echo "  ANTHROPIC_API_KEY="
echo "  DEEPSEEK_API_KEY="
echo "  AI_PROVIDER="
echo "  AI_MODEL_CLAUDE="
echo "  AI_MODEL_DEEPSEEK="
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
pm2 startup systemd -u root --hp /root | tail -1 | bash

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
