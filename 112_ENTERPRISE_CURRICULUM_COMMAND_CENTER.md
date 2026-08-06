Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur aplikasi.
JANGAN mengubah REST API.
JANGAN membuat business logic di frontend.
Implementasikan langsung dalam bentuk kode production-ready.

==================================================
TARGET
==================================================

Bangun ENTERPRISE CURRICULUM COMMAND CENTER sebagai pusat kendali Wakil Kepala Sekolah Bidang Kurikulum.

Seluruh proses akademik dikendalikan dari satu dashboard.

Semua modul menggunakan PostgreSQL, Prisma ORM, REST API, JWT, RBAC, Assignment, Scope, Policy Engine, Audit Trail, Flutter, Web ERP, dan PWA.

Tidak boleh ada dummy data, mock API, ataupun hardcode.

==================================================
WORKSPACE
==================================================

Dashboard Kurikulum

Monitoring KBM

Monitoring Guru

Monitoring Jadwal

Monitoring Absensi

Monitoring Jurnal Mengajar

Monitoring Materi

Monitoring Tugas

Monitoring Penilaian

Monitoring Leger

Monitoring Rapor

Approval Center

Validasi Kurikulum

Distribusi Beban Mengajar

Kalender Akademik

Master Kurikulum

Analitik Akademik

Laporan

Pengumuman

Notifikasi

Audit Log

==================================================
DASHBOARD
==================================================

Jumlah Guru

Jumlah Mapel

Jumlah Kelas

Jumlah Jadwal

KBM Berlangsung

KBM Belum Dimulai

Guru Hadir

Guru Terlambat

Jurnal Belum Diisi

Materi Belum Upload

Tugas Belum Dibuat

Nilai Belum Lengkap

Leger Belum Publish

Rapor Belum Publish

Approval Pending

Grafik Aktivitas KBM

Grafik Ketuntasan

Grafik Kehadiran

Quick Action

==================================================
MONITORING KBM
==================================================

Realtime

Status KBM

Guru Mengajar

Ruangan

Jam

Durasi

Progress

Filter

Search

==================================================
MONITORING GURU
==================================================

Jadwal Mengajar

Kehadiran

Jurnal

Materi

Tugas

Nilai

Leger

Rapor

Produktivitas

==================================================
MONITORING JADWAL
==================================================

Bentrok Guru

Bentrok Ruangan

Bentrok Kelas

Beban Mengajar

Jam Mengajar

==================================================
MONITORING ABSENSI
==================================================

Absensi Guru

Absensi Siswa

Absensi Santri

QR

Barcode

GPS

Manual

Rekap

==================================================
MONITORING JURNAL
==================================================

Belum Diisi

Sudah Diisi

Menunggu Approval

Disetujui

Ditolak

==================================================
MONITORING PENILAIAN
==================================================

Nilai Harian

PTS

PAS

Praktik

Proyek

Sikap

Belum Lengkap

Sudah Lengkap

==================================================
MONITORING LEGER
==================================================

Progress Generate

Ranking

KKM

Remedial

Pengayaan

Publish

Freeze

==================================================
MONITORING RAPOR
==================================================

Draft

Review

Approval

Publish

Lock

==================================================
VALIDASI
==================================================

Validasi Jadwal

Validasi KBM

Validasi Jurnal

Validasi Nilai

Validasi Leger

Validasi Rapor

Validasi KKM

Validasi Bobot

==================================================
APPROVAL CENTER
==================================================

Jurnal

Nilai

Leger

Rapor

Remedial

Pengayaan

==================================================
MASTER KURIKULUM
==================================================

Tahun Ajaran

Semester

Kurikulum

Fase

CP

TP

ATP

KKM

Predikat

Bobot

Kalender Akademik

==================================================
DISTRIBUSI BEBAN MENGAJAR
==================================================

Guru

Mapel

Kelas

Jam

Total Jam

Kelebihan Jam

Kekurangan Jam

==================================================
ANALYTICS
==================================================

Ketuntasan

Distribusi Nilai

Performa Guru

Performa Kelas

Performa Mapel

Performa KBM

Progress Kurikulum

==================================================
REPORT
==================================================

Rekap KBM

Rekap Guru

Rekap Jadwal

Rekap Absensi

Rekap Jurnal

Rekap Nilai

Rekap Leger

Rekap Rapor

PDF

Excel

CSV

Print

==================================================
NOTIFICATION
==================================================

Guru belum mengajar

Guru belum absen

Jurnal belum diisi

Nilai belum lengkap

Leger belum publish

Rapor belum publish

==================================================
ROLE
==================================================

Wakil Kepala Kurikulum

Operator Akademik

Kepala Sekolah

Yayasan (Monitoring)

Super Admin (Konfigurasi)

==================================================
INTEGRASI
==================================================

Academic Engine

Teacher Command Center

Wali Kelas Command Center

Attendance Engine

Assessment Engine

Formula Engine

Auto Leger

Academic Analytics

Rapor Generator

Notification Engine

Portal Guru

Portal Orang Tua

Portal Siswa

Flutter

Web ERP

PWA

==================================================
FITUR PRODUKTIVITAS
==================================================

Quick Search

Advanced Filter

Bulk Approval

Bulk Publish

Bulk Lock

Bulk Export

Bulk Print

Favorite Dashboard

Realtime Refresh

Calendar Timeline

==================================================
KEAMANAN
==================================================

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Audit Trail

==================================================
VALIDASI
==================================================

Semua halaman wajib memiliki:

Create

View

Edit

Delete

Detail

Search

Filter

Sorting

Pagination

Import

Export

Print

Approval

Audit Trail

==================================================
LARANGAN
==================================================

Dummy Data

Mock API

Hardcoded Jadwal

Hardcoded Guru

Hardcoded Kelas

Hardcoded KKM

Hardcoded Bobot

Simulation Page

Developer Menu

==================================================
OUTPUT
==================================================

Bangun ENTERPRISE CURRICULUM COMMAND CENTER sebagai pusat kendali akademik yang memungkinkan Wakil Kepala Sekolah Bidang Kurikulum memonitor seluruh proses pembelajaran secara real-time, mulai dari jadwal, KBM, absensi, jurnal mengajar, materi, tugas, penilaian, Auto Leger, analitik akademik, hingga rapor. Seluruh proses harus terintegrasi penuh melalui REST API, PostgreSQL, Prisma ORM, Flutter Mobile, Web ERP, dan PWA, menggunakan RBAC, Assignment, Scope, Policy Engine, Audit Trail, tanpa dummy data, tanpa hardcode, dan siap digunakan pada lingkungan produksi.