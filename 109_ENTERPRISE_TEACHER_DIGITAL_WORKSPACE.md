Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung production-ready.

================================================

TARGET

Bangun ENTERPRISE TEACHER DIGITAL WORKSPACE.

Workspace ini menjadi HOME PAGE utama Guru.

Seluruh pekerjaan guru dilakukan dari satu dashboard.

Semua data menggunakan REST API.

Semua sinkron dengan PostgreSQL, Prisma ORM, Flutter, Web ERP dan PWA.

================================================

WORKSPACE

Dashboard

Jadwal Hari Ini

Kelas Saya

Mapel Saya

KBM Saya

Absensi

Jurnal Mengajar

Materi

Bank Materi

Tugas

Bank Soal

Penilaian

Remedial

Pengayaan

Leger

Analitik

Kalender Akademik

Notifikasi

Approval

Riwayat

Profil

================================================

DASHBOARD

Selamat Datang

Jam Mengajar Hari Ini

Jumlah KBM

Jumlah Kelas

Jumlah Siswa

Absensi Belum Diisi

Jurnal Belum Diisi

Nilai Belum Lengkap

Remedial

Pengayaan

Quick Menu

Quick Scan QR

================================================

JADWAL

Hari Ini

Mingguan

Bulanan

Filter

Search

================================================

KBM

Mulai KBM

Selesai KBM

Status

Progress

Catatan

================================================

ABSENSI

QR

Barcode

Manual

GPS (jika diperlukan)

Rekap

================================================

JURNAL

Auto isi:

Tanggal

Jam

Guru

Mapel

Kelas

CP

TP

Materi

Metode

Media

Refleksi

Approval

================================================

MATERI

Upload

Video

PDF

Word

PowerPoint

Link

Bank Materi

================================================

BANK SOAL

Pilihan Ganda

Essay

True False

Matching

Import

Export

================================================

TUGAS

Individual

Kelompok

Deadline

Upload

Penilaian

================================================

PENILAIAN

Formatif

Sumatif

PTS

PAS

Praktik

Proyek

Sikap

Auto Save

================================================

AUTO LEGER

Generate

Ranking

KKM

Predikat

Remedial

Pengayaan

Analitik

================================================

ANALYTICS

Grafik Nilai

Grafik Kehadiran

Ketuntasan

Ranking

Progress KBM

================================================

NOTIFICATION

KBM Berikutnya

Nilai Belum Lengkap

Absensi Belum Diisi

Deadline

Approval

================================================

CALENDAR

KBM

PTS

PAS

Libur

Agenda

================================================

ROLE

Guru hanya melihat:

Kelas yang diampu.

Mapel yang diampu.

Jadwal sendiri.

Data sendiri.

================================================

INTEGRASI

Attendance Engine

Assessment Engine

Formula Engine

Auto Leger

Academic Analytics

Rapor Generator

Portal Orang Tua

Portal Siswa

Flutter

PWA

================================================

FITUR

Search

Filter

Sorting

Pagination

Print

PDF

Excel

CSV

================================================

VALIDASI

JWT

RBAC

Permission

Assignment

Scope

================================================

LARANGAN

Dummy

Mock API

Hardcoded Jadwal

Hardcoded Guru

Hardcoded Nilai

Hardcoded Kelas

================================================

OUTPUT

Bangun ENTERPRISE TEACHER DIGITAL WORKSPACE sebagai pusat seluruh aktivitas guru mulai dari jadwal, KBM, absensi, jurnal mengajar, materi, tugas, bank soal, penilaian, Auto Leger, analitik, notifikasi, kalender, hingga publish nilai. Seluruh fitur harus sinkron dengan REST API, PostgreSQL, Prisma ORM, Flutter Mobile, Web ERP dan PWA serta siap digunakan pada lingkungan produksi.