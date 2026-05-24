# Panduan Deployment — 1page.my

Panduan ini menerangkan cara deploy app 1page.my ke VPS Contabo step-by-step.
Selepas setup awal selesai, Bos hanya perlu `git push` sahaja untuk deploy.

---

## Gambaran Keseluruhan Sistem

```
Bos push ke GitHub
  → GitHub Actions trigger
    → SSH masuk VPS (161.97.108.141)
      → git pull + npm ci + npm run build + pm2 restart
        → App updated ✅

User buka 1page.my
  → Cloudflare DNS
    → Cloudflare Tunnel
      → localhost:3000 (Next.js)
```

**Server:** Contabo VPS, IP: 161.97.108.141, Ubuntu 22.04
**Domain:** 1page.my (Cloudflare DNS)

---

## Bahagian A — Sediakan SSH Key (Kat PC Bos)

> Lakukan ini di PC Bos, bukan di VPS.

### A1. Jana SSH key baru

```bash
ssh-keygen -t ed25519 -C "github-actions-1page" -f ~/.ssh/1page_deploy
```

Tekan Enter dua kali (tiada passphrase) — GitHub Actions tidak boleh masukkan passphrase.

Ini akan buat dua fail:
- `~/.ssh/1page_deploy` — **Private key** (untuk GitHub Secrets)
- `~/.ssh/1page_deploy.pub` — **Public key** (untuk VPS)

### A2. Salin public key ke VPS

```bash
ssh-copy-id -i ~/.ssh/1page_deploy.pub root@161.97.108.141
```

Masukkan password root VPS apabila diminta.

### A3. Test connection

```bash
ssh -i ~/.ssh/1page_deploy root@161.97.108.141
```

Sepatutnya masuk terus tanpa password.

---

## Bahagian B — Tambah SSH Key ke GitHub Secrets

1. Buka repo di GitHub
2. Klik **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Nama: `VPS_SSH_PRIVATE_KEY`
5. Value: Salin kandungan private key:

```bash
cat ~/.ssh/1page_deploy
```

Salin SEMUA output termasuk `-----BEGIN OPENSSH PRIVATE KEY-----` dan `-----END OPENSSH PRIVATE KEY-----`.

6. Klik **Add secret**

---

## Bahagian C — Setup VPS (Jalankan Sekali Sahaja)

> Lakukan ini di VPS. SSH masuk dulu:
> ```bash
> ssh root@161.97.108.141
> ```

### C1. Clone repo ke VPS

```bash
git clone git@github.com:YOUR_USERNAME/YOUR_REPO.git /var/www/1page-my
```

Ganti `YOUR_USERNAME/YOUR_REPO` dengan repo GitHub Bos.

### C2. Jalankan setup script

```bash
cd /var/www/1page-my
bash scripts/setup.sh
```

Script ini akan install:
- Node.js 20 LTS
- PM2
- Cloudflare Tunnel (cloudflared)
- UFW Firewall (allow 22, 80, 443 sahaja)

---

## Bahagian D — Setup Cloudflare Tunnel

> Lakukan ini di VPS.

### D1. Login ke Cloudflare

```bash
cloudflared tunnel login
```

Buka URL yang dipaparkan dalam browser, pilih domain `1page.my`, klik **Authorize**.

### D2. Buat tunnel baru

```bash
cloudflared tunnel create 1page-my
```

Output akan tunjukkan **Tunnel ID** seperti:
```
Created tunnel 1page-my with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Salin ID tersebut — kita perlukan dalam langkah seterusnya.

### D3. Isi TUNNEL_ID dalam config

```bash
nano /var/www/1page-my/cloudflare-tunnel/config.yml
```

Gantikan KEDUA-DUA `TUNNEL_ID_PLACEHOLDER` dengan tunnel ID sebenar:

```yaml
tunnel: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
credentials-file: /root/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json
```

Simpan: `Ctrl+X` → `Y` → `Enter`

### D4. Route DNS untuk semua subdomains

```bash
cloudflared tunnel route dns 1page-my 1page.my
cloudflared tunnel route dns 1page-my builder.1page.my
cloudflared tunnel route dns 1page-my preview.1page.my
```

### D5. Install tunnel sebagai systemd service

```bash
cloudflared service install
systemctl enable cloudflared
systemctl start cloudflared
systemctl status cloudflared
```

Status sepatutnya: `active (running)`

---

## Bahagian E — First Deployment

> Lakukan ini di VPS.

### E1. Jalankan first deployment script

```bash
cd /var/www/1page-my
bash scripts/deploy-first-time.sh
```

Script akan:
1. Install npm dependencies
2. Tunjukkan senarai env variables yang diperlukan
3. Tunggu Bos buat `.env.local`
4. Build app
5. Start PM2

### E2. Buat .env.local

Semasa script pause, buka terminal baru dan buat `.env.local`:

```bash
nano /var/www/1page-my/.env.local
```

Isi semua values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=

# ToyyibPay
TOYYIBPAY_API_KEY=
TOYYIBPAY_CATEGORY_CODE=

# Cloudflare
CF_DEPLOY_HOOK_URL=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CF_PAGES_PROJECT_LIVE=
CF_PAGES_PROJECT_PREVIEW=

# Telegram Bot
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# WhatsApp
NEXT_PUBLIC_WHATSAPP_NUMBER=
BOS_WHATSAPP_REDIRECT=
NEXT_PUBLIC_BOS_WA_REDIRECT=

# App
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_LIVE_DOMAIN=1page.my
NEXT_PUBLIC_PREVIEW_DOMAIN=preview.1page.my
NEXT_PUBLIC_GOOGLE_FORM_URL=

# AI (untuk AI-powered features)
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
AI_PROVIDER=
AI_MODEL_CLAUDE=
AI_MODEL_DEEPSEEK=
```

Simpan: `Ctrl+X` → `Y` → `Enter`

Kemudian balik ke terminal pertama dan tekan `Enter` untuk sambung.

---

## Bahagian F — Test

```bash
# Check PM2 status
pm2 status

# Check app logs
pm2 logs 1page-my --lines 50

# Test localhost
curl http://localhost:3000
```

Kemudian buka browser: **https://1page.my**

---

## Bahagian G — Subsequent Deploys (Rutin Harian)

Selepas setup selesai, Bos hanya perlu:

```bash
git push origin main
```

GitHub Actions akan handle selebihnya secara automatik.

**Monitor deployment:**
- Buka tab **Actions** di GitHub repo
- Klik workflow run terbaru untuk tengok progress

**Jika deployment gagal:**
```bash
# Semak PM2 logs di VPS
pm2 logs 1page-my --lines 100

# Restart manual jika perlu
pm2 restart 1page-my
```

---

## PM2 — Perintah Berguna

```bash
pm2 status                    # Tengok status semua apps
pm2 logs 1page-my             # Live logs
pm2 logs 1page-my --lines 50  # Last 50 lines
pm2 restart 1page-my          # Restart app
pm2 stop 1page-my             # Stop app
pm2 start ecosystem.config.js # Start semula dari config
pm2 monit                     # Dashboard real-time
```

---

## Cloudflare Tunnel — Perintah Berguna

```bash
systemctl status cloudflared          # Status tunnel service
systemctl restart cloudflared         # Restart tunnel
cloudflared tunnel list               # Senarai semua tunnel
cloudflared tunnel info 1page-my      # Info tunnel
journalctl -u cloudflared -f          # Live tunnel logs
```

---

## GitHub Secrets yang Diperlukan

| Secret Name | Nilai |
|-------------|-------|
| `VPS_SSH_PRIVATE_KEY` | Kandungan `~/.ssh/1page_deploy` (private key) |

---

## Nota Keselamatan

- Port 3000 **tidak didedahkan** — semua traffic melalui Cloudflare Tunnel
- UFW hanya allow port 22, 80, 443
- `.env.local` dalam `.gitignore` — tidak akan masuk repo
- SSH key untuk GitHub Actions adalah dedicated key, bukan key peribadi Bos
