Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur.
JANGAN mengubah REST API.
JANGAN membuat business logic di frontend.
Implementasikan langsung production-ready.

================================================
TARGET
================================================

Bangun ENTERPRISE KBM & LEGER WORKSPACE sebagai pusat seluruh aktivitas pembelajaran dan pengolahan nilai.

Semua fitur harus menggunakan:

PostgreSQL

Prisma ORM

REST API

JWT

RBAC

Assignment

Scope

Policy Engine

Audit Trail

Flutter

PWA

================================================
WORKSPACE
================================================

Dashboard KBM

Jadwal Mengajar

Kelas Saya

Jurnal Mengajar

Absensi KBM

Materi Pembelajaran

Tugas

Penilaian

Remedial

Pengayaan

Auto Leger

Analitik Akademik

Approval Nilai

Publish Nilai

Cetak

Export

================================================
DASHBOARD
================================================

Hari Ini

Jadwal Hari Ini

Jam Mengajar

Kelas Diampu

Mapel Diampu

Absensi Hari Ini

Jurnal Belum Diisi

Nilai Belum Lengkap

Remedial

Pengayaan

Quick Action

Kalender Akademik

================================================
JADWAL
================================================

Jadwal Guru

Jadwal Kelas

Jadwal Mapel

Jadwal Ruangan

Filter

Search

================================================
KBM
================================================

Mulai KBM

Selesai KBM

Timer

Status KBM

Catatan

================================================
ABSENSI
================================================

QR Card

Barcode

Manual

Status Kehadiran

Terlambat

Izin

Sakit

Alpha

Rekap

================================================
JURNAL MENGAJAR
================================================

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

================================================
MATERI
================================================

Upload Materi

Video

PDF

Word

PPT

Link

Bank Materi

================================================
TUGAS
================================================

Tugas Individu

Kelompok

Upload Jawaban

Deadline

Penilaian

================================================
PENILAIAN
================================================

Formatif

Sumatif

PTS

PAS

Praktik

Proyek

Sikap

Auto Save

================================================
FORMULA ENGINE
================================================

Auto Bobot

Auto Nilai Akhir

Auto Predikat

Auto KKM

Auto Ketuntasan

Auto Deskripsi

================================================
AUTO LEGER
================================================

Generate Otomatis

Total Nilai

Rata-rata

Ranking

KKM

Remedial

Pengayaan

Statistik

Publish

Freeze

================================================
ANALYTICS
================================================

Grafik Nilai

Distribusi Nilai

Performa Guru

Performa Kelas

Performa Mapel

Ketuntasan

================================================
APPROVAL
================================================

Guru

↓

Wali Kelas

↓

Wakil Kurikulum

↓

Kepala Sekolah

↓

Publish

================================================
LAPORAN
================================================

Jurnal

Absensi

Leger

Nilai

Ranking

KKM

Remedial

Pengayaan

PDF

Excel

CSV

================================================
ROLE
================================================

Guru Mapel

→ hanya kelas & mapel diampu

Wali Kelas

→ kelas perwalian

Wakil Kurikulum

→ seluruh akademik

Kepala Sekolah

→ monitoring

Yayasan

→ monitoring unit

Super Admin

→ konfigurasi

================================================
INTEGRASI
================================================

Academic Engine

Attendance Engine

Assessment Engine

Formula Engine

Auto Leger Engine

Academic Analytics

Rapor Generator

Portal Guru

Portal Siswa

Portal Orang Tua

Flutter

PWA

================================================
VALIDASI
================================================

JWT

RBAC

Permission

Assignment

Scope

Audit Trail

================================================
LARANGAN
================================================

Dummy Data

Mock API

Hardcoded Jadwal

Hardcoded Nilai

Hardcoded Ranking

Hardcoded KKM

Perhitungan Frontend

================================================
OUTPUT
================================================

Bangun ENTERPRISE KBM & LEGER WORKSPACE sebagai pusat aktivitas pembelajaran, absensi, jurnal mengajar, materi, tugas, penilaian, Auto Leger, analitik akademik, approval, publish, dan laporan. Seluruh proses harus sinkron melalui REST API, PostgreSQL, Prisma ORM, dan terintegrasi penuh dengan Dashboard, Flutter Mobile, PWA, Academic Analytics, serta Rapor Generator, siap digunakan pada lingkungan produksi.