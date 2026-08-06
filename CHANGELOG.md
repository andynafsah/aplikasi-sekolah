# Catatan Perubahan (Changelog)
# CHANGELOG.md

Version : 3.0.0
Status : Production / Documentation
Last Updated : 2026-07-07

Format penulisan mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) dan rilis ini menggunakan versi semantik [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## 🚀 [3.0.0] - 2026-07-07 (Sprint 29 - Stabilisasi Master)
### Ditambahkan
*   **Database Schema Master (`supabase_sprint29_master.sql`):** Penggabungan seluruh skema tabel dari Sprint 1-28 ke dalam satu berkas master MySQL migrasi.
*   **Dependency Injection (DI) Container:** Wadah DI bawaan (`di.ts`) untuk registrasi Service, Repository, dan Controller demi kemudahan pengujian unit (unit testing) dan modularitas tinggi.
*   **BaseRepository Implementation (`repository.base.ts`):** Kerangka repository generik in-memory yang sepenuhnya siap digantikan dengan engine Prisma/MySQL untuk seluruh modul.
*   **Tipe SaaS Plan & Limit Baru:** Pengaturan batas jumlah santri, pengajar, dan ruang penyimpanan cloud berdasarkan paket Trial, Growth, dan Enterprise pada `app.config.ts`.
*   **Validasi Keamanan Header:** Deteksi penyewa wajib (`X-Tenant-ID`) di level middleware gateway untuk proteksi data isolasi tenant.

### Diubah
*   **Pembaruan Tech Stack (`03_TECH_STACK.md`):** Rekonsiliasi versi library ke React 19, Tailwind CSS v4, Express 4.x, dan Zod 4.x.
*   **Penyelarasan Struktur Folder (`04_FOLDER_STRUCTURE.md`):** Pemetaan folder modular yang mengarahkan pengembang untuk mendesain file menggunakan Clean Architecture + DDD.

---

## 📦 [2.8.0] - 2026-06-15 (Sprint 26-28 - Integrasi AI & Offline Sync)
### Ditambahkan
*   **Modul AI Copilot (`14_AI_ENGINE.md`):** Sinkronisasi agen pencerdas Gemini AI dengan data perilaku santri di kelas untuk analisis tren belajar.
*   **Offline Queue System (`13_OFFLINE_ENGINE.md`):** Skema antrean lokal IndexedDB (Dexie) untuk merekam transaksi kasir kantin offline dan melakukan auto-sync saat internet pulih.
*   **Skema Audit Trail Terpusat:** Tabel log audit (`audit_logs`) untuk mencatat mutasi data sensitif seperti persetujuan dana keuangan dan perubahan data nilai raport.

---

## 📦 [2.0.0] - 2026-04-10 (Sprint 17-22 - Akademik & Google Workspace)
### Ditambahkan
*   **Integrasi Google Workspace (`12_GOOGLE_WORKSPACE.md`):** Sinkronisasi kalender akademik dengan Google Calendar dan otomasi export berkas raport PDF ke folder Google Drive masing-masing wali murid.
*   **Modul Boarding (Asrama):** Pelacakan kamar santri, jadwal ronda, monitoring perizinan keluar-masuk gerbang pesantren, dan penilaian kedisiplinan santri.
*   **Sistem Pembayaran Syahriah (SPP):** Invoice tagihan bulanan santri terotomasi dengan notifikasi WhatsApp gateway dan integrasi Virtual Account Bank.

---

## 📦 [1.0.0] - 2026-01-20 (Sprint 1-2 - Core SaaS & Autentikasi)
### Ditambahkan
*   **Modul Manajemen Sekolah (Akademik dasar):** Pengolahan data santri, guru, mata pelajaran, jadwal kelas, dan pengisian nilai raport.
*   **Kerangka Dasar Multi-Tenancy:** Identifikasi tenant berbasis subdomain dan pengamanan data isolasi di level database (RLS).
*   **Autentikasi Sesi & RBAC:** Sistem login terenkripsi bcrypt, token JWT, token penyegar (refresh token), dan pendefinisian role: Admin Utama, Kepala Madrasah, Ustadz, Wali Murid, dan Santri.

---

> Rilis-rilis sebelum versi 1.0.0 merupakan versi pra-rilis (alpha/beta) internal untuk validasi tim arsitek pesantren dan uji coba lapangan terbatas di lingkungan uji.
