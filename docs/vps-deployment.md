# VPS DEPLOYMENT GUIDE: SINGLE BACKEND, MULTI-CLIENT ARCHITECTURE
# docs/vps-deployment.md

Panduan ini berisi langkah-langkah komprehensif untuk memasang, mengonfigurasi, dan menjalankan aplikasi terpadu sekolah (Backend Express, Database MySQL, Web React) pada Virtual Private Server (VPS) bersistem operasi Ubuntu Server 20.04 / 22.04 LTS.

---

## 🛠️ PRASYARAT VPS

Sebelum memulai, pastikan VPS Anda telah dikonfigurasi dengan:
1. **Sistem Operasi**: Ubuntu 20.04 / 22.04 LTS.
2. **Kapasitas Minimal**: 2 vCPU, 4 GB RAM, 40 GB SSD (Rekomendasi untuk kelancaran kompilasi Node.js & MySQL).
3. **Domain & Subdomain**:
   * `sekolah-api.com` (untuk Backend REST API)
   * `sekolah.com` (untuk Web Frontend React)
4. **Port Terbuka (Firewall)**: 22 (SSH), 80 (HTTP), 443 (HTTPS).

---

## 🌐 METODE 1: DEPLOYMENT MENGGUNAKAN DOCKER-COMPOSE (SANGAT DIREKOMENDASIKAN)

Metode ini adalah cara tercepat, terstandarisasi, dan terisolasi dengan baik.

### 1. Pasang Docker & Docker Compose di VPS
Jalankan perintah berikut di terminal VPS Anda:
```bash
# Update repository paket
sudo apt update && sudo apt upgrade -y

# Pasang Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Pasang Docker Compose
sudo apt install docker-compose -y

# Cek versi
docker --version
docker-compose --version
```

### 2. Buat Struktur Folder Projek di VPS
Buat direktori di `/var/www/enterprise-school`:
```bash
sudo mkdir -p /var/www/enterprise-school/uploads
sudo mkdir -p /var/www/enterprise-school/mysql-data
cd /var/www/enterprise-school
```

### 3. Buat Berkas `docker-compose.yml`
Buat berkas `docker-compose.yml` di dalam direktori tersebut:
```yaml
version: '3.8'

services:
  mysql-db:
    image: mysql:8.4
    container_name: school-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: RootPasswordSecure2026!
      MYSQL_DATABASE: erp_school
      MYSQL_USER: school_user
      MYSQL_PASSWORD: UserPasswordSecure2026!
    ports:
      - "3306:3306"
    volumes:
      - ./mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend-api:
    image: node:20-alpine
    container_name: school-backend
    restart: always
    working_dir: /app
    volumes:
      - ./backend:/app
      - ./uploads:/app/uploads
      - ./prisma:/app/prisma
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=mysql://school_user:UserPasswordSecure2026!@mysql-db:3306/erp_school
      - JWT_SECRET=SecureJwtSecretToken2026LongRandomValueHere!
      - JWT_REFRESH_SECRET=SecureJwtRefreshSecretToken2026AnotherLongRandomValue!
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHereIfUsingAI
    depends_on:
      mysql-db:
        condition: service_healthy
    command: sh -c "npm install --production && npx prisma db push && node dist/server.cjs"

  redis:
    image: redis:7-alpine
    container_name: school-redis
    restart: always
    ports:
      - "6379:6379"

  nginx-proxy:
    image: nginx:alpine
    container_name: school-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./frontend-web/dist:/usr/share/nginx/html
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - backend-api
```

---

## 🛠️ METODE 2: DEPLOYMENT MANUAL (NATIVE SETUP - NODE.JS, MYSQL, PM2)

Gunakan metode ini jika Anda tidak ingin menggunakan Docker dan ingin mengontrol servis secara langsung.

### 1. Pasang Node.js, MySQL, & Nginx di Ubuntu
```bash
# Tambahkan PPA Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx mariadb-server mariadb-client

# Cek instalasi
node -v
npm -v
```

### 2. Konfigurasi MySQL / MariaDB Secure Installation
```bash
sudo mysql_secure_installation
# Jawab pertanyaan: Set root password? (Y), Remove anonymous? (Y), Disallow root login remotely? (Y), Remove test DB? (Y), Reload privilege? (Y)
```

Buat database dan user baru untuk aplikasi sekolah:
```bash
sudo mysql -u root -p
```
Di dalam console MySQL, jalankan command SQL berikut:
```sql
CREATE DATABASE erp_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'school_user'@'localhost' IDENTIFIED BY 'UserPasswordSecure2026!';
GRANT ALL PRIVILEGES ON erp_school.* TO 'school_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Unggah Kode Aplikasi ke VPS
Gunakan GIT atau SCP untuk menyalin folder projek ke VPS di `/var/www/enterprise-school`.

```bash
# Contoh clone menggunakan Git
cd /var/www
git clone https://github.com/akun-anda/enterprise-school.git
cd enterprise-school
```

### 4. Konfigurasi Environment & Run Prisma Migration
Di folder `/var/www/enterprise-school/backend`, salin `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Edit berkas `.env` menggunakan `nano`:
```bash
nano .env
```
Isi konfigurasi database menggunakan MySQL lokal yang baru saja dibuat:
```env
DATABASE_URL="mysql://school_user:UserPasswordSecure2026!@127.0.0.1:3306/erp_school"
JWT_SECRET="IsiDenganKodeJwtRahasiaDanPanjangAnda"
JWT_REFRESH_SECRET="IsiDenganKodeRefreshJwtRahasiaDanPanjangAnda"
PORT=3000
NODE_ENV=production
```

Jalankan instalasi dependensi backend, kompilasi, migrasi skema database, dan seeding:
```bash
# Masuk ke folder backend
cd /var/www/enterprise-school/backend
npm install

# Jalankan migrasi dan seeding database sekolah
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Backend Express Menggunakan PM2 (Process Manager)
PM2 memastikan backend API berjalan terus-menerus di background dan otomatis restart jika terjadi crash atau VPS reboot.

```bash
# Pasang PM2 secara global
sudo npm install -p pm2 -g

# Jalankan server
pm2 start dist/server.cjs --name "school-backend-api"

# Konfigurasi PM2 agar otomatis hidup saat VPS reboot
pm2 startup
# (Salin dan jalankan perintah keluaran dari perintah diatas di terminal Anda)

# Simpan state proses
pm2 save
```

### 6. Build dan Deploy Frontend React
```bash
# Masuk ke folder web frontend
cd /var/www/enterprise-school/frontend-web
npm install
npm run build
# Hasil kompilasi static HTML/CSS/JS akan berada di folder `/var/www/enterprise-school/frontend-web/dist`
```

---

## 🔒 KONFIGURASI REVERSE PROXY NGINX & SSL (HTTPS)

Langkah terakhir adalah mempublikasikan backend API dan web frontend ke publik secara aman menggunakan Nginx dan SSL gratis dari Let's Encrypt.

### 1. Buat Berkas Konfigurasi Nginx
Buat berkas konfigurasi situs baru:
```bash
sudo nano /etc/nginx/sites-available/sekolah
```

Tulis konfigurasi reverse proxy berikut:
```nginx
# 1. Konfigurasi Web Frontend React (sekolah.com)
server {
    listen 80;
    server_name sekolah.com www.sekolah.com;
    root /var/www/enterprise-school/frontend-web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Control untuk static assets yang tahan lama
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|eot|ttf|otf)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }
}

# 2. Konfigurasi Backend Express REST API (sekolah-api.com)
server {
    listen 80;
    server_name sekolah-api.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Endpoint static uploads path
    location /uploads/ {
        alias /var/www/enterprise-school/uploads/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

### 2. Aktifkan Konfigurasi & Restart Nginx
```bash
# Buat symlink untuk mengaktifkan situs
sudo ln -s /etc/nginx/sites-available/sekolah /etc/nginx/sites-enabled/

# Uji konfigurasi nginx apakah ada syntax error
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 3. Pasang SSL HTTPS Otomatis dari Let's Encrypt (Certbot)
```bash
# Pasang Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Request dan pasang sertifikat SSL untuk domain Anda
sudo certbot --nginx -d sekolah.com -d www.sekolah.com -d sekolah-api.com
```
*Certbot akan otomatis mengedit konfigurasi Nginx Anda untuk menyuntikkan SSL (port 443) dan melakukan pengalihan otomatis dari HTTP (port 80) ke HTTPS secara aman!*

---

## 🔄 PROSES INSTALASI: ALUR AWAL DI VPS

Saat VPS berhasil dipasang dan domain diakses:
1. **Langkah Inisialisasi Pertama (First-Run Setup)**:
   * Ketika pertama kali dibuka melalui web browser di domain Anda (`https://sekolah.com`), middleware pendeteksi instalasi backend akan mendeteksi apakah skema database MySQL telah berisi record sekolah dan user admin.
   * Jika kosong, pengguna akan secara otomatis diarahkan ke halaman **First-Run Database Setup UI** untuk memverifikasi sambungan database MySQL, membuat instansi profil sekolah, dan mendaftarkan akun Super Administrator pertama (`super_admin`).
2. **Operasional Normal (Login Screen)**:
   * Setelah inisialisasi awal sukses, halaman utama sistem akan selalu mengarah ke **Halaman Login Utama**.
   * Pengguna login menggunakan email/username serta kata sandi yang valid, menerima JWT token dari backend, dan menu navigasi dinamis dimuat berdasarkan peran masing-masing secara instan.
