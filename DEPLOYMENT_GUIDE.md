# PANDUAN DEPLOYMENT & HOSTING: ENTERPRISE ACADEMIC PLATFORM

Panduan lengkap ini dirancang khusus untuk memandu Anda dalam melakukan kompilasi (build) dan mengunggah (upload) aplikasi **Full-Stack (React + Vite + Express.js backend)** Anda ke platform hosting.

**PENTING:** Aplikasi ini menggunakan backend kustom Node.js (Express) di `server.ts` untuk menangani API, koneksi database, dan autentikasi. Oleh karena itu, aplikasi **TIDAK BISA** dideploy hanya sebagai static site di platform seperti Netlify atau Github Pages (kecuali backend dipisah). Anda **memerlukan** hosting yang mendukung Node.js (seperti VPS, cPanel dengan fitur Node.js, Render, Railway, atau DigitalOcean).

---

## 1. PRE-DEPLOYMENT CHECKLIST (PERSIAPAN SEBELUM DEPLOY)

Sebelum mengunggah aplikasi ke server hosting, pastikan langkah-langkah verifikasi berikut telah dilakukan demi keamanan dan stabilitas sistem.

### A. Bersihkan Variabel Lingkungan (.env)
Pastikan Anda membuat file `.env` di server produksi (jangan sertakan `.env` di repositori publik). 
Contoh isi `.env`:
```env
# Konfigurasi Database (MySQL)
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=erp_school
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_URL=mysql://root:password@localhost:3306/erp_school

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
```

### B. Jalankan Linting & Pengujian Kompilasi (Lokal)
Pastikan tidak ada error kompilasi:
```bash
npm run build
```
Jika berhasil, proyek Anda akan menghasilkan folder `dist/` yang berisi file statis Frontend (`index.html`, aset) dan file backend terkompilasi (`server.cjs`).

---

## 2. METODE 1: CLOUD PLATFORMS (Render / Railway / Heroku) - DIREKOMENDASIKAN

Platform ini sangat cocok untuk aplikasi Full-Stack Node.js.

1. Buat repositori Git (GitHub/GitLab) dan push kode Anda.
2. Hubungkan repositori ke platform seperti **Render** (sebagai Web Service) atau **Railway**.
3. Konfigurasi build dan start command:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Tambahkan Environment Variables (seperti `DATABASE_URL` dan `GEMINI_API_KEY`) di dashboard platform tersebut.

---

## 3. METODE 2: HOSTING TRADISIONAL (CPANEL DENGAN NODE.JS)

Jika instansi Anda menggunakan **cPanel** yang mendukung aplikasi Node.js (Setup Node.js App):

1. **Upload File:**
   - Jalankan `npm run build` di lokal.
   - Kompres seluruh proyek (kecuali folder `node_modules`) menjadi `app.zip`.
   - Upload dan ekstrak `app.zip` di cPanel File Manager (di luar `public_html` agar lebih aman, misalnya di `/home/user/app/`).
   
2. **Setup Node.js App di cPanel:**
   - Buka menu **Setup Node.js App** di cPanel.
   - Buat aplikasi baru.
   - **Node.js version:** Pilih versi 18 atau lebih baru.
   - **Application mode:** Production
   - **Application root:** Path ke folder ekstrak (misal: `app`)
   - **Application URL:** Domain atau subdomain aplikasi.
   - **Application startup file:** `dist/server.cjs` (Penting: ini adalah entry point produksi).
   
3. **Instalasi dan Jalankan:**
   - Tambahkan Environment Variables di bagian bawah halaman Setup Node.js.
   - Klik tombol **Run NPM Install**.
   - Terakhir, klik **Start App**.

---

## 4. METODE 3: VPS MANDIRI (UBUNTU SERVER / NGINX / PM2)

Jika Anda menggunakan Virtual Private Server (VPS):

1. **Persiapan Server:**
   - Install Node.js (>= 18), Nginx, dan MySQL (opsional jika database eksternal).
   - Install PM2 secara global: `sudo npm install -g pm2`

2. **Upload & Build:**
   - Clone repo atau upload file ke `/var/www/enterprise-academic-platform`.
   - Masuk ke direktori: `cd /var/www/enterprise-academic-platform`
   - Jalankan: `npm install`
   - Jalankan: `npm run build`

3. **Menjalankan dengan PM2:**
   - Buat file `.env` dan atur variabelnya.
   - Jalankan server: `pm2 start dist/server.cjs --name "academic-app"`
   - Simpan status PM2 agar auto-start saat reboot: `pm2 save && pm2 startup`

4. **Konfigurasi Reverse Proxy Nginx (`/etc/nginx/sites-available/default`):**
```nginx
server {
    listen 80;
    server_name portal.sekolahanda.sch.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
5. Muat ulang Nginx: `sudo systemctl reload nginx`

---

## 5. SOLUSI JIKA HOSTING ANDA TIDAK MENDUKUNG NODE.JS (Shared Hosting Standar)

Jika hosting Anda saat ini hanya mendukung PHP dan HTML statis (tidak ada fitur Node.js), aplikasi **tidak bisa di-deploy secara langsung menjadi satu kesatuan** karena aplikasi ini memiliki backend `server.ts` yang **wajib** menggunakan Node.js. 

Namun, Anda masih bisa menggunakan **Metode Split Hosting (Pemisahan)**:

### Langkah 1: Hosting Backend di Platform Gratis/Cloud (Wajib Node.js)
Karena backend wajib menggunakan Node.js, Anda bisa menggunakan platform gratis seperti **Render.com** atau **Railway.app** khusus untuk backend-nya saja.
1. Deploy repositori Anda ke Render.com (sebagai Web Service).
2. Render akan memberikan URL untuk backend Anda (misalnya: `https://api-sekolah-app.onrender.com`).

### Langkah 2: Hosting Frontend di Hosting Anda Saat Ini (Tanpa Node.js)
1. Di komputer lokal Anda, buat/ubah file `.env` dan arahkan URL backend ke server Render yang baru dibuat:
   ```env
   VITE_API_URL=https://api-sekolah-app.onrender.com
   ```
2. Jalankan perintah build:
   ```bash
   npm run build
   ```
3. Proses ini akan menghasilkan folder `dist/client/` (atau `dist/`). File di dalam folder ini sepenuhnya berupa HTML, CSS, dan JS statis yang **tidak butuh Node.js**.
4. Kompres (zip) isi folder statis tersebut.
5. Upload ke cPanel hosting Anda (letakkan di folder `public_html`).
6. Buat file `.htaccess` di dalam `public_html` agar saat di-refresh tidak error 404:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

Dengan metode ini, tampilan web (Frontend) berada di hosting Anda yang sekarang, sedangkan pemrosesan data (Backend) menumpang di server Node.js gratis/terpisah.

---

Aplikasi siap mengudara secara aman dan stabil!
