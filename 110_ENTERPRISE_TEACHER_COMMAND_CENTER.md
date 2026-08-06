Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur.
JANGAN mengubah REST API.
JANGAN membuat business logic di frontend.
Implementasikan langsung production-ready.

==================================================
TARGET
==================================================

Bangun ENTERPRISE TEACHER COMMAND CENTER sebagai halaman utama Guru setelah login.

Teacher Command Center menjadi pusat seluruh aktivitas guru dalam satu workspace.

Semua data berasal dari REST API.

Semua sinkron dengan PostgreSQL, Prisma ORM, Web ERP, Flutter Mobile dan PWA.

==================================================
LAYOUT
==================================================

Header

Profil Guru

Jabatan

Mapel

Wali Kelas (jika ada)

Unit

Kalender Akademik

Notifikasi

Quick Search

==================================================
DASHBOARD CARD
==================================================

Jam Mengajar Hari Ini

Kelas Hari Ini

Jumlah Siswa

Absensi Belum Diisi

Jurnal Belum Diisi

Nilai Belum Lengkap

Remedial

Pengayaan

Approval Menunggu

Tugas Belum Dinilai

==================================================
TIMELINE HARI INI
==================================================

Jam

Kelas

Mapel

Ruangan

Status

Mulai KBM

Selesai KBM

Progress

==================================================
ONE CLICK WORKFLOW
==================================================

Mulai KBM

↓

Scan Absensi QR/Barcode

↓

Input Kehadiran Manual (jika diperlukan)

↓

Isi Jurnal Mengajar

↓

Bagikan Materi

↓

Bagikan Tugas

↓

Input Nilai

↓

Generate Auto Leger

↓

Kirim Approval

↓

Selesai

==================================================
SMART CHECKLIST
==================================================

KBM belum dimulai

Absensi belum diisi

Jurnal belum diisi

Materi belum dibagikan

Tugas belum dibuat

Nilai belum lengkap

Remedial tersedia

Approval tersedia

==================================================
KBM
==================================================

Mulai KBM

Pause

Selesai

Status

Durasi

==================================================
ABSENSI
==================================================

QR Card

Barcode

Manual

GPS (opsional)

Rekap Kehadiran

==================================================
JURNAL
==================================================

Tanggal

Jam

Kelas

Mapel

CP

TP

Materi

Metode

Media

Refleksi

Lampiran

Approval

==================================================
MATERI
==================================================

Upload

Bank Materi

Video

PDF

Word

PowerPoint

Link

==================================================
BANK SOAL
==================================================

Pilihan Ganda

Essay

Benar/Salah

Menjodohkan

Import

Export

==================================================
TUGAS
==================================================

Individual

Kelompok

Deadline

Upload

Penilaian

==================================================
PENILAIAN
==================================================

Formatif

Sumatif

PTS

PAS

Praktik

Proyek

Sikap

Auto Save

==================================================
AUTO LEGER
==================================================

Generate

Total Nilai

Rata-rata

Ranking

KKM

Predikat

Remedial

Pengayaan

==================================================
ANALYTICS
==================================================

Grafik Nilai

Grafik Kehadiran

Ketuntasan

Progress KBM

Progress Nilai

==================================================
NOTIFICATION
==================================================

KBM berikutnya

Deadline

Approval

Pengingat

==================================================
CALENDAR
==================================================

KBM

PTS

PAS

Libur

Agenda

==================================================
REPORT
==================================================

Jurnal

Absensi

Nilai

Leger

Ranking

KKM

Remedial

Pengayaan

Print

PDF

Excel

CSV

==================================================
ROLE
==================================================

Guru hanya melihat:

Kelas yang diampu

Mapel yang diampu

Jadwal sendiri

Nilai sendiri

Jurnal sendiri

==================================================
INTEGRASI
==================================================

Attendance Engine

Assessment Engine

Formula Engine

Auto Leger

Academic Analytics

Rapor Generator

Portal Guru

Portal Orang Tua

Portal Siswa

Notification Engine

Flutter

PWA

==================================================
FITUR PRODUKTIVITAS
==================================================

Quick Action

Floating Action Button

Recent Activity

Favorite Class

Continue Last Session

Quick Scan

Quick Grade

Quick Journal

==================================================
VALIDASI
==================================================

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Audit Trail

==================================================
LARANGAN
==================================================

Dummy Data

Mock API

Hardcoded Jadwal

Hardcoded Nilai

Hardcoded Guru

Hardcoded Kelas

Simulation Page

Developer Menu

==================================================
OUTPUT
==================================================

Bangun ENTERPRISE TEACHER COMMAND CENTER sebagai pusat aktivitas guru yang mengintegrasikan jadwal mengajar, KBM, absensi QR/Barcode, jurnal mengajar, materi, bank soal, tugas, penilaian, Auto Leger, analitik akademik, notifikasi, kalender, laporan, dan approval dalam satu workspace. Seluruh proses harus sinkron melalui REST API, PostgreSQL, Prisma ORM, Web ERP, Flutter Mobile, dan PWA, menggunakan Role, Permission, Assignment, Scope, dan Audit Trail, tanpa dummy data atau hardcode, siap digunakan pada lingkungan produksi.