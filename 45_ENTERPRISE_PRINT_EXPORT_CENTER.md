# 45_ENTERPRISE_PRINT_EXPORT_CENTER.md

# ENTERPRISE PRINT & EXPORT CENTER ENGINE

Version: Enterprise 2.0  
Architecture: Single Tenant / Multi-Tenant Ready  
Tech Stack: React, Vite, TailwindCSS, Express / Node.js, Prisma ORM, Recharts, Lucide Icons  
Status: Production Ready

------------------------------------------------------------

# OBJECTIVE

Bangun **Enterprise Print & Export Center Engine** yang mengelola seluruh proses pencetakan dan pencetakan massal (Mass Print & Export) dokumen akademik, leger, rapor, transkrip, kartu ujian, dan laporan institusi secara otomatis, aman, dan fleksibel.

Tidak boleh ada broken print layout, missing metadata, hardcoded print configurations, atau mock export.

------------------------------------------------------------

# CORE CAPABILITIES

## 1. DOKUMEN YANG DIDUKUNG (SUPPORTED DOCUMENTS)
- **Rapor Resmi Santri / Siswa** (Laporan Hasil Belajar Semester)
- **Leger Nilai Lengkap** (Ringkasan Nilai Seluruh Mapel per Rombel/Kelas)
- **Transkrip Akademik** (Kumulatif Nilai Antar-Semester)
- **Kartu Peserta Ujian / Ujian Sekolah / PAS / SAS** (Lengkap foto, QR Code, & Jadwal)
- **Surat Keterangan Lulus (SKL) & Surat Keterangan Aktif Santri**
- **Sertifikat Capaian Tahfidz & Prestasi Santri**
- **Slip Pembayaran & Rekapitulasi Keuangan / SPP**

## 2. FORMAT EXPORT & PRINT ENGINE
- **Direct High-Definition Print Engine**: Layout CSS `@media print` presisi pixel dengan opsi preview interaktif.
- **Excel (.XLSX) / CSV Engine**: Export data leger, nilai harian, dan absensi dengan kolom dinamis yang dapat dipilih user.
- **PDF Mass Generator**: Export rapor per-santri, per-kelas, atau per-unit ke dalam format PDF standar A4 / F4.
- **ZIP Mass Archive**: Menggabungkan seluruh file PDF Rapor satu kelas menjadi 1 file arsip terkompresi ZIP.

## 3. LAYOUT & PAPER CONFIGURATION ENGINE
- **Ukuran Kertas Dinamis**: A4 (210x297mm), F4 / Folio (215x330mm), Legal (216x356mm), A3.
- **Orientasi**: Portrait & Landscape.
- **Margin Dinamis**: Custom top, bottom, left, right margin (mm).
- **Elemen Dokumen Dinamis**:
  - Kop Surat Resmi (Logo Yayasan + Sekolah + Alamat + NPSN/NSM)
  - Watermark Kustom (Draft, Rahasia, Official Stamp, Opasitas Dinamis)
  - QR Code Verification & Digital Hash (SHA256) untuk validasi keaslian dokumen
  - Tanda Tangan Digital & Stempel Resmi

## 4. BATCH QUEUE & AUDIT LOGGING
- **Antrean Ekspor (Export Queue)**: Monitoring status generasi dokumen massal secara real-time.
- **Audit Log Ekspor**: Mencatat aktivitas Who, What, When, IP Address, dan filter yang digunakan saat melakukan print/export.
- **RBAC Enforcement**: Akses pencetakan dan ekspor disesuaikan dengan Role (Super Admin, Wali Kelas, Guru, Kepala Sekolah).

------------------------------------------------------------

# ARCHITECTURAL INTEGRATION

- **Frontend**: Component `EnterpriseAcademicEngine.tsx` dengan Tab khusus **Pusat Cetak & Export** (`'export'`).
- **Backend API**:
  - `GET /api/v1/akademik/export/templates`
  - `POST /api/v1/akademik/export/generate-pdf`
  - `POST /api/v1/akademik/export/generate-excel`
  - `POST /api/v1/akademik/export/generate-zip`
  - `GET /api/v1/akademik/export/audit-logs`
  - `POST /api/v1/akademik/export/config`

------------------------------------------------------------

# VALIDATION & METRICS
- 100% Dynamic Print Layout
- Zero Broken Print Page Breaks
- Full Support for A4 and F4/Folio Paper Sizes
- Live Print Preview & Dynamic Watermark Control
- Comprehensive Export Audit Logging
