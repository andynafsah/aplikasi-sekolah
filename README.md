# Enterprise ERP Pesantren
# README.md

Version : 3.0.0
Status : Production / Documentation
Last Updated : 2026-07-07

---

## 📌 DESKRIPSI PROYEK
**Enterprise ERP Pesantren** adalah sebuah platform SaaS multitenant modern yang dirancang untuk mendigitalkan manajemen pondok pesantren secara menyeluruh. Sistem ini dibangun menggunakan arsitektur **Clean Architecture** dan **Domain-Driven Design (DDD)** untuk memisahkan logika bisnis inti dari implementasi eksternal, sehingga menjamin performa tinggi, skalabilitas, keamanan ketat, serta kemudahan dalam pemeliharaan jangka panjang.

Platform ini mengintegrasikan administrasi akademik (siswa, kurikulum, kehadiran), keuangan (pembayaran syahriah, POS kantin), manajemen asrama (boarding), penerimaan santri baru (PPDB), integrasi Google Workspace, dan asisten cerdas berbasis AI.

---

## 🚀 FITUR UTAMA
*   **Multi-Tenancy SaaS:** Isolasi data tingkat tinggi antar pesantren menggunakan atribut `tenant_id` dan otorisasi dinamis.
*   **Clean Architecture & DDD:** Pemisahan fungsionalitas yang tegas (`domain`, `application`, `infrastructure`, `presentation`).
*   **Keamanan Terpadu (Enterprise Grade):** Autentikasi berbasis JWT, refresh token, sistem RBAC (Role-Based Access Control) yang granular, proteksi SQL Injection, CSRF, dan XSS.
*   **Google Workspace Sync:** Penyelarasan jadwal otomatis dengan Google Calendar, dokumen raport dengan Google Docs, dan pengarsipan dengan Google Drive.
*   **AI-Powered Copilot:** Layanan analisis performa akademik santri dan optimasi kurikulum berbasis Gemini AI.
*   **Offline Engine:** Mendukung sinkronisasi data lokal (IndexedDB) ketika koneksi internet terputus, menjaga kontinuitas operasional di daerah terpencil.

---

## 🛠️ STACK TEKNOLOGI
*   **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide Icons, Motion (Animate), TanStack Query, Axios, Zod.
*   **Backend:** Node.js 22 LTS, Express / Fastify, TypeScript, tsx, esbuild, Pino Logger, JSON Web Token (JWT).
*   **Database & ORM:** MySQL 8.x / Cloud SQL, Prisma ORM.
*   **Caching & Queue:** Redis, BullMQ.

---

## ⚙️ CARA MEMULAI

### 1. Prasyarat Sistem
*   **Node.js v18 (LTS)** atau lebih baru (Sangat direkomendasikan untuk pengguna macOS Catalina atau sistem operasi lama demi jaminan stabilitas dan performa)
*   MySQL v8.x / PostgreSQL
*   Redis (untuk manajemen antrean dan cache)

> **💡 Khusus Pengguna macOS Catalina (10.15):**
> macOS Catalina tidak mendukung versi Node.js terbaru secara out-of-the-box karena batasan sistem operasi. Node.js versi **18 (LTS)** adalah versi paling stabil dan didukung penuh yang dapat dijalankan di Catalina. Anda direkomendasikan menggunakan **NVM (Node Version Manager)** untuk menginstal Node.js v18 agar nantinya dapat di-update dengan mudah jika Anda melakukan upgrade OS.
>
> **Langkah instalasi Node.js v18 di macOS Catalina:**
> 1. Buka Terminal Anda.
> 2. Instal NVM dengan menjalankan perintah berikut:
>    ```bash
>    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
>    ```
> 3. Muat ulang konfigurasi shell Anda (atau restart Terminal):
>    ```bash
>    source ~/.zshrc
>    ```
> 4. Jalankan perintah untuk mendeteksi file `.nvmrc` di proyek ini dan menginstal Node.js v18:
>    ```bash
>    nvm install
>    ```
> 5. Untuk memastikan versi yang aktif adalah Node.js 18, jalankan:
>    ```bash
>    node -v
>    ```
> 6. Jika di masa mendatang Anda meng-upgrade macOS dan ingin beralih ke Node.js versi terbaru (misal v20 atau v22), Anda cukup menjalankan:
>    ```bash
>    nvm install 22
>    nvm use 22
>    ```

### 2. Pengaturan Variabel Lingkungan
Salin file `.env.example` ke `.env` dan sesuaikan nilainya:
```bash
cp .env.example .env
```

### 3. Instalasi Dependensi
Instal paket-paket utama yang tercantum dalam konfigurasi proyek:
```bash
npm install
```

### 4. Menjalankan Server Pengembangan
Jalankan mode pengembangan yang mengaktifkan server backend Express dan integrasi hot-reload untuk React secara paralel:
```bash
npm run dev
```
Aplikasi dapat diakses melalui browser di alamat: `http://localhost:3000`.

### 5. Kompilasi Produksi (Production Build)
Lakukan build terhadap client statis dan bundle backend TS menjadi single file CommonJS untuk eksekusi server yang optimal:
```bash
npm run build
```

### 6. Menjalankan di Lingkungan Produksi
Eksekusi file terkompilasi hasil build menggunakan Node.js:
```bash
npm run start
```

---

## 📂 STRUKTUR DOKUMENTASI UTAMA
Untuk membantu pemahaman mendalam tentang standar teknis dan fungsional sistem, silakan merujuk pada berkas blueprint berikut:

*   **[`00_PROJECT_CONTEXT.md`](./00_PROJECT_CONTEXT.md):** Gambaran umum, visi, dan konteks bisnis sistem.
*   **[`02_SYSTEM_ARCHITECTURE.md`](./02_SYSTEM_ARCHITECTURE.md):** Aliran data tingkat tinggi, batasan layer, dan aturan framework backend-frontend.
*   **[`03_TECH_STACK.md`](./03_TECH_STACK.md):** Panduan Just-in-Time Installation dan daftar library yang aktif/direncanakan.
*   **[`04_FOLDER_STRUCTURE.md`](./04_FOLDER_STRUCTURE.md):** Struktur direktori lengkap dalam `/src` dan disiplin ketergantungan modul.
*   **[`05_DATABASE_STANDARD.md`](./05_DATABASE_STANDARD.md):** Konvensi penamaan tabel, normalisasi, indexing, dan kebijakan migrasi database.
*   **[`06_BACKEND_STANDARD.md`](./06_BACKEND_STANDARD.md):** Standar pengembangan REST API, logger, validasi input, transaksi, dan isolasi thread.
*   **[`07_FRONTEND_STANDARD.md`](./07_FRONTEND_STANDARD.md):** Standar performa client UI, styling Tailwind CSS, state management, dan transisi rute.
*   **[`ARCHITECTURE.md`](./ARCHITECTURE.md):** Panduan arsitektur praktis, Clean Architecture, dan implementasi DDD di proyek ini.
*   **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md):** Spesifikasi request-response API, format JSON terstandar, dan autentikasi.
*   **[`MODULE_GUIDE.md`](./MODULE_GUIDE.md):** Petunjuk langkah-demi-langkah cara membuat modul fungsional baru (Controller-Service-Repository).
*   **[`CONTRIBUTING.md`](./CONTRIBUTING.md):** Aturan kontribusi kode, standarisasi commit, pengujian, dan workflow merger branch.
*   **[`CHANGELOG.md`](./CHANGELOG.md):** Catatan rilis, riwayat pengembangan, dan pembaharuan fitur berkala.

---

## 📄 LISENSI
Proyek ini dilisensikan di bawah lisensi komersial tertutup untuk lingkungan internal Pondok Pesantren dan Mitra SaaS Terintegrasi. Hak Cipta dilindungi undang-undang © 2026.
