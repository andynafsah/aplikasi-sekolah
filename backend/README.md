# 🖥️ STANDALONE ENTERPRISE BACKEND SERVICE
# backend/README.md

Backend ini dirancang dengan arsitektur **Production Ready**, menggunakan Node.js, Express, dan Prisma ORM dengan target database **MySQL**.

---

## 🚀 FITUR-FITUR UTAMA

1.  **Single Backend Gateway**: Seluruh klien (Web React, Mobile Flutter, API Eksternal) mengonsumsi API yang sama.
2.  **Stateless JWT Security Engine**: Keamanan token ganda (Access Token & Refresh Token) dengan Session Management yang mencatat IP, Browser, dan OS perangkat untuk perlindungan optimal.
3.  **Role-Based Access Control (RBAC)**: Otorisasi terpusat di backend untuk melacak menu yang valid bagi 10 role terdaftar.
4.  **Backend Document Generator (Cetak PDF & Excel)**: Cetak slip pembayaran SPP, slip gaji guru, kartu pelajar, rekap ledger nilai, dan rapor siswa langsung dari server.
5.  **Notif Broker**: Broker notifikasi multi-saluran terintegrasi (Firebase Push Notification, WhatsApp API Gateway, SMTP Email).

---

## 🛠️ CARA MENJALANKAN DI LOCALHOST

### 1. Pasang Dependensi
```bash
npm install
```

### 2. Atur Environment Variables
Salin berkas `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Edit `.env` dan masukkan tautan database MySQL Anda:
```env
DATABASE_URL="mysql://root:password_anda@127.0.0.1:3306/erp_school"
```

### 3. Migrasikan Database & Muat Seeder
```bash
# Push skema tabel ke MySQL
npx prisma db push

# Jalankan seeder master
npx prisma db seed
```

### 4. Jalankan Server
```bash
# Mode Pengembangan
npm run dev

# Mode Kompilasi & Produksi (Production Build)
npm run build
npm run start
```
Server akan aktif di `http://localhost:3000`. Detail daftar rute dan format JSON dapat dibaca di berkas `/docs/api-contracts.md`.
