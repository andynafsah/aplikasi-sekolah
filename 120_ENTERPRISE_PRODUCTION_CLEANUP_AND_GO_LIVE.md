Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN menghapus fitur production.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

==================================================
TARGET
==================================================

Lakukan PRODUCTION CLEANUP & GO LIVE terhadap seluruh ERP.

ERP ini akan digunakan langsung pada lingkungan produksi.

Hilangkan seluruh fitur simulasi, demo, mock, placeholder, testing, dan development.

Pastikan seluruh menu, halaman, API, workflow, database, dan business process menggunakan data nyata dari database.

==================================================
PRODUCTION MODE
==================================================

Aktifkan Production Mode.

Nonaktifkan seluruh Development Mode.

Nonaktifkan Debug Mode.

Nonaktifkan Mock Mode.

Nonaktifkan Simulation Mode.

==================================================
HAPUS
==================================================

Simulation Attendance

Simulation Dashboard

Simulation QR

Simulation GPS

Simulation Payment

Simulation Notification

Demo Page

Dummy Dashboard

Dummy Analytics

Dummy Report

Sample Data

Sample Widget

Mock API

Fake Response

Placeholder Data

Developer Menu

Developer Panel

Testing Menu

Sandbox

Preview Demo

Console Debug yang tidak diperlukan

Temporary Route

Temporary Component

Temporary Seeder Demo

Temporary Migration Demo

Unused Component

Unused Hook

Unused API

Unused Route

Unused Page

Unused Layout

==================================================
DATABASE
==================================================

Seluruh data harus berasal dari PostgreSQL.

Tidak boleh ada:

Hardcoded Data

Local JSON

Dummy JSON

Sample JSON

Fake Data

==================================================
REST API
==================================================

Seluruh halaman wajib menggunakan REST API.

Tidak boleh menggunakan:

Mock API

Dummy Endpoint

Temporary Endpoint

Local Response

==================================================
CRUD
==================================================

Pastikan seluruh modul memiliki jika relevan:

Create

Read

Update

Delete

View Detail

Search

Filter

Sorting

Pagination

Import

Export

Print

Preview

Approval

Audit Trail

Restore (Soft Delete bila digunakan)

==================================================
WORKFLOW
==================================================

Pastikan seluruh workflow berjalan otomatis.

Contoh:

Login

↓

Dashboard

↓

Role

↓

Permission

↓

Assignment

↓

Scope

↓

Menu

↓

Page

↓

CRUD

↓

Approval

↓

Notification

↓

Report

==================================================
RBAC
==================================================

Pastikan seluruh menu mengikuti:

Role

Permission

Assignment

Scope

Policy

Feature Flag

Tidak boleh ada menu yang muncul tanpa hak akses.

==================================================
VALIDASI
==================================================

Seluruh Form wajib memiliki:

Client Validation

Server Validation

Duplicate Validation

Business Validation

Loading

Success Message

Error Message

==================================================
REPORT
==================================================

Semua laporan harus:

Realtime

Sinkron Database

Preview

Print

PDF

Excel

CSV

==================================================
DASHBOARD
==================================================

Seluruh dashboard menggunakan data realtime.

Tidak boleh ada angka statis.

Tidak boleh ada card dummy.

==================================================
SMART ATTENDANCE
==================================================

Gunakan sistem produksi:

QR Code

Barcode

GPS

Geofence

Manual Approval

REST API

Database

Tidak boleh ada simulasi.

==================================================
KBM
==================================================

Seluruh KBM menggunakan data nyata.

Guru.

Kelas.

Mapel.

Jadwal.

Absensi.

Jurnal.

Materi.

Tugas.

Penilaian.

==================================================
LEGER
==================================================

Generate otomatis.

Ranking otomatis.

KKM otomatis.

Remedial otomatis.

Pengayaan otomatis.

Publish.

Freeze.

==================================================
RAPOR
==================================================

Generate.

Publish.

Lock.

QR Verification.

==================================================
BILLING
==================================================

Tagihan.

SPP.

Pembayaran.

Jurnal.

Kwitansi.

Approval.

==================================================
SECURITY
==================================================

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Feature Flag

Rate Limiting

Audit Trail

==================================================
PERFORMANCE
==================================================

Optimalkan:

Database Query

Pagination

Caching

Lazy Loading

Bundle Size

Code Splitting

==================================================
LOGGING
==================================================

Catat:

Login

Logout

CRUD

Approval

Publish

Delete

Import

Export

Print

Attendance

KBM

Assessment

Leger

Billing

==================================================
FINAL VALIDATION
==================================================

Periksa seluruh modul:

Dashboard

Master Data

Siswa

Santri

Guru

Pegawai

TU

Keuangan

Billing

SPP

Absensi

KBM

Penilaian

Auto Leger

Academic Analytics

Rapor

Perpustakaan

Asrama

Tahfidz

Surat

Arsip

Laporan

Flutter API

PWA

REST API

Pastikan seluruh modul saling terhubung.

==================================================
LARANGAN
==================================================

Dummy Data

Mock API

Simulation

Sandbox

Developer Menu

Testing Page

Preview Dummy

Hardcoded Data

Hardcoded Role

Hardcoded Permission

Hardcoded Dashboard

Hardcoded Report

Hardcoded Statistik

==================================================
OUTPUT
==================================================

Lakukan Production Cleanup secara menyeluruh pada seluruh ERP hingga seluruh modul menggunakan database PostgreSQL dan REST API sebagai sumber data utama. Hapus seluruh simulasi, mock, dummy, placeholder, sandbox, developer tools, dan komponen yang tidak digunakan. Pastikan seluruh menu, dashboard, workflow, CRUD, laporan, notifikasi, approval, keamanan, serta integrasi Web ERP, Flutter Mobile, dan PWA bekerja secara konsisten, dinamis, aman, dan siap digunakan pada lingkungan produksi tanpa mengubah arsitektur aplikasi.