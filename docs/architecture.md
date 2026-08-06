# ARCHITECTURE BLUEPRINT: SINGLE BACKEND, MULTI-CLIENT (WEB & MOBILE)
# docs/architecture.md

Version : 1.0.0
Status : Production Ready
Database Target : MySQL (via Prisma)
Primary Client Targets : React (Web SPA) & Flutter (Android & iOS)

---

## 📌 OVERVIEW ARSITEKTUR

Sistem ini didesain sebagai platform terpadu sekolah (SIAKAD, Keuangan, PPDB, Penilaian, Absensi) dengan prinsip **Single Backend, Multi-Client**. Seluruh logika bisnis, otorisasi peran (RBAC), validasi input, pemrosesan laporan (PDF/Excel), pencetakan barcode/QR, serta integrasi notifikasi (FCM, WhatsApp, Email) dipusatkan sepenuhnya di sisi server. 

Dua tipe client utama mengakses server ini secara eksklusif menggunakan protokol REST API berbasis JSON:
1. **Frontend Web (React + Vite)**: Beroperasi penuh sebagai Single Page Application (SPA).
2. **Mobile App (Flutter Android & iOS)**: Aplikasi native yang mengonsumsi REST API yang sama, dengan SQLite lokal hanya sebagai penampung cache offline transisi.

```
                           +----------------------------------------+
                           |             DATABASE SYSTEM            |
                           |       MySQL (Prisma ORM Secure)        |
                           +-------------------+--------------------+
                                               |
                                               v
                           +-------------------+--------------------+
                           |             SINGLE BACKEND             |
                           |       Node.js + Express + Prisma       |
                           |  (Business Logic, Auth, Printing, S3)  |
                           +--------+------------------------+------+
                                    |                        |
                   /api/v1 (REST)   |                        |   /api/v1 (REST)
          +-------------------------+                        +-------------------------+
          |                                                                            |
          v                                                                            v
+---------+------------------+                                              +---------+------------------+
|      FRONTEND CLIENT       |                                              |      MOBILE CLIENT       |
|     React + Vite (SPA)     |                                              |     Flutter (iOS/Android)  |
| (No direct DB connection)  |                                              |   (Offline SQLite Cache)   |
+----------------------------+                                              +----------------------------+
```

---

## 🛡️ PROTOKOL OTENTIKASI & KEAMANAN SESSION

Sistem menggunakan otentikasi stateless **JWT (JSON Web Token)** dengan arsitektur dual-token untuk mengamankan komunikasi data antara backend dengan React & Flutter:

1. **Access Token (Short-lived)**:
   * **Durasi**: 15 Menit.
   * **Penyimpanan Web**: In-memory state (React) / HttpOnly Cookie (sangat direkomendasikan untuk mencegah XSS).
   * **Penyimpanan Mobile**: Secure Storage (Keychain iOS / Keystore Android).
   * **Format**: Bearer Token di Header Otorisasi (`Authorization: Bearer <access_token>`).

2. **Refresh Token (Long-lived)**:
   * **Durasi**: 7 Hari.
   * **Penyimpanan Web**: Secure HttpOnly Cookie (`/api/auth/refresh`).
   * **Penyimpanan Mobile**: Secure Storage.
   * **Database Validation**: Setiap Refresh Token dicatatkan di MySQL beserta metadata perangkat (user-agent, IP) untuk mendukung **Session Management** dan pencabutan akses instan.

3. **Fitur Keamanan Tambahan**:
   * **Session Management**: Pengguna dapat melihat daftar perangkat aktif yang sedang login dan melakukan pencabutan sesi secara individu.
   * **Remember Login**: Berdasarkan validitas Refresh Token yang persisten.
   * **Logout All Devices**: Menghapus seluruh catatan Active Session di MySQL untuk user_id tertentu secara instan, sehingga semua token lama langsung ditolak oleh middleware otorisasi.
   * **Forgot & Change Password**: Menggunakan email token validasi 6 digit dengan batas waktu kadaluarsa (expiry 1 jam) sebelum memperbarui password_hash (Bcrypt).

---

## 👥 ROLE BASED ACCESS CONTROL (RBAC) BERBASIS BACKEND

Keamanan menu dan navigasi diatur secara sentral di sisi backend. 

### 1. Daftar Peran (Roles)
* **SUPER_ADMIN**: Hak akses penuh terhadap sistem, modul konfigurasi, log audit global, dan administrasi database.
* **OWNER**: Direktur Yayasan / Pemilik, hak penuh untuk melihat grafik laporan keuangan, profitabilitas, serta audit log performa tanpa izin menulis data teknis operasional.
* **KEPALA_SEKOLAH**: Pemantauan akademik, persetujuan anggaran keuangan, rekap rapor, dan persetujuan SK guru.
* **TU (Tata Usaha)**: Entri data kesiswaan, PPDB, inventarisasi sekolah, administrasi surat menyurat, dan data pegawai.
* **BENDAHARA**: Pengelolaan buku kas, pencatatan transaksi SPP, penerbitan tagihan, penggajian (payroll), dan cetak slip pembayaran.
* **GURU**: Pengisian presensi siswa, pengelolaan nilai harian, input rapor kelas mata pelajaran, dan pengisian jurnal guru.
* **WALI_KELAS**: Pengelolaan rapor kelas binaan, catatan wali kelas, presensi bulanan, serta pengesahan leger nilai.
* **PEGAWAI**: Staf non-akademik, mencatat presensi harian staf dan manajemen inventaris.
* **WALI_SANTRI**: Akses akun orang tua untuk memantau tabungan santri, histori tunggakan SPP, presensi anak, dan melihat pengumuman penting.
* **SANTRI / SISWA**: Akses materi belajar, tugas, histori presensi mandiri, serta kartu pelajar digital.

### 2. Mekanisme Proteksi Endpoint
* **Zero-Trust Frontend**: React dan Flutter dilarang menyembunyikan menu secara statis di client-side. Navigasi menu dinamis didapatkan dari endpoint `/api/auth/profile` atau `/api/auth/menu` yang mengembalikan daftar rute yang diizinkan untuk peran saat itu.
* **Backend Gatekeeper**: Setiap endpoint REST dilindungi oleh Middleware Otorisasi (`checkPermission` / `checkRole`):
```ts
// Contoh Middleware Backend
router.get('/api/finance/report', checkPermission('finance:report:read'), FinanceController.getReport);
```

---

## 📈 REST API INTEGRASI & STRUKTUR RESEP RESPONS

Seluruh transaksi pertukaran data menggunakan format **JSON seragam** dengan skema standardisasi DTO (Data Transfer Object) sebagai berikut:

### Format Respon Sukses (Standard Success Response)
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 10,
      "totalPages": 12
    }
  },
  "timestamp": "2026-07-15T13:16:07.000Z"
}
```

### Format Respon Gagal (Standard Error Response)
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid"
    }
  ],
  "timestamp": "2026-07-15T13:16:07.000Z"
}
```

---

## 🖨️ MESIN CETAK & PEMBANGKIT DOKUMEN (BACKEND PRINT ENGINE)

Seluruh rendering dokumen dilakukan di sisi server untuk menghemat resource client, menjaga konsistensi visual layout, dan mempercepat proses pencetakan massal.

* **PDF Rendering**: Server menggunakan PDF-generator (seperti `pdfkit` atau PDF Engine berbasis HTML) untuk menghasilkan berkas PDF beresolusi tinggi langsung ke stream biner.
* **Excel & Word Reporting**: Menggunakan library seperti `exceljs` untuk menghasilkan rekap leger nilai, rekap SPP, buku pembantu keuangan, dan template surat dinas.
* **QR & Barcode**: Menggunakan encoder native (`qrcode` dan `jsbarcode`) untuk merender bitmap label inventaris, ID Card, dan bukti pembayaran yang siap dicetak.
* **Dynamic Custom Templates**: Template surat, struk pembayaran, slip gaji, kartu ujian, kartu guru, dan raport didesain dalam bentuk template dinamis yang tag variabelnya (seperti `{{nama_siswa}}`, `{{nis}}`) dapat disesuaikan melalui menu Dashboard Settings oleh Admin.

---

## ☁️ MEKANISME UPLOAD & STORAGE

Aplikasi ini melarang keras konversi file media (foto santri, bukti transfer, pendaftaran PPDB) ke format Base64 yang tidak efisien dalam penyimpanan database.
* **Storage Provider**: File fisik disimpan di Local Server Storage (`/uploads/`) atau dialihkan ke Object Storage S3 kompatibel (seperti MinIO, AWS S3, Cloudflare R2).
* **MySQL Database**: Hanya menyimpan string path URL relatif/absolut dari dokumen tersebut (misal: `/uploads/ppdb/2026/bukti_bayar_xyz.jpg`).
* **Pembersihan Otomatis**: Jika entri data di MySQL dihapus atau di-update, backend memicu *hook* untuk menghapus file lama di penyimpanan agar tidak terjadi penumpukan kapasitas tak terpakai.

---

## 🔔 PUSAT NOTIFIKASI MULTI-SALURAN (NOTIF ENGINE)

Backend bertindak sebagai koordinator diseminasi informasi ke pengguna melalui 3 saluran utama:
1. **Firebase Cloud Messaging (FCM)**: Untuk mendorong pengumuman instan ke aplikasi seluler Flutter (Push Notification).
2. **WhatsApp Gateway**: Pengiriman otomatis tagihan SPP bulanan, notifikasi presensi kedatangan santri real-time kepada orang tua, dan kode OTP verifikasi.
3. **Email (Nodemailer / SMTP)**: Pengiriman link reset password, bukti resmi pendaftaran PPDB, dan laporan bulanan yayasan.

---

## 🔌 OFFLINE SYNCHRONIZATION (SINKRONISASI FLUTTER CLIENT)

Flutter client mengadopsi mekanisme offline cache cerdas:
* **SQLite (Sqflite)**: Bertindak eksklusif sebagai cache penyimpanan lokal pada perangkat mobile untuk data kritis (seperti data presensi harian, nilai harian siswa).
* **No Server Business Logic in Mobile**: Aplikasi Flutter tidak menghitung kelulusan, tidak mengalkulasi denda SPP, dan tidak memproses kalkulasi gaji. Semua aturan matematika dilarang keras ditulis di sisi client.
* **Auto-Sync Network Broker**: Menggunakan listener konektivitas seluler (seperti `connectivity_plus`). Saat mendeteksi transisi dari offline ke online, Flutter otomatis mendorong antrean mutasi yang tertunda (Presensi offline) menggunakan antrean FIFO menuju endpoint rekonsiliasi `/api/v1/attendance/sync` di Backend untuk divalidasi dan disimpan permanen ke dalam MySQL.
