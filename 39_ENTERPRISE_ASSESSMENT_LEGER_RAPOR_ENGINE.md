# 39_ENTERPRISE_ASSESSMENT_LEGER_RAPOR_ENGINE.md

# ENTERPRISE ASSESSMENT • LEGER • RAPOR ENGINE

Version

Enterprise 1.0

Architecture

Single Tenant

Laravel API

MySQL

Prisma ORM

React

Vite

TailwindCSS

Flutter Ready

Status

Production Ready

---

# OBJECTIVE

Bangun Enterprise Assessment Engine yang sepenuhnya Database Driven.

Tidak boleh ada hardcoded mata pelajaran.

Tidak boleh ada hardcoded jenis nilai.

Tidak boleh ada hardcoded rapor.

Tidak boleh ada hardcoded leger.

Semua berasal dari Database.

Target utama:

✓ Penginputan nilai sangat cepat

✓ Mudah digunakan guru

✓ Sinkron otomatis

✓ Tidak ada input ganda

✓ Rapor otomatis

✓ Cetak profesional

✓ Mobile Ready

---

# DATABASE

Buat tabel:

assessment_types

assessment_components

assessment_periods

assessment_scores

assessment_score_details

assessment_formulas

assessment_predicates

assessment_descriptions

ledger_templates

ledger_columns

ledger_settings

report_templates

report_sections

report_cards

report_card_details

teacher_assessment_assignments

student_final_scores

student_rankings

promotion_results

graduation_results

Semua menggunakan Foreign Key Prisma.

---

# JENIS PENILAIAN

Dinamis.

Contoh default:

Tugas

PR

Kuis

UH

PTS

PAS

Praktik

Proyek

Portofolio

Tahfidz

Tasmi'

Murajaah

Adab

Akhlak

Kehadiran

Ekstrakurikuler

Life Skill

Semua dapat ditambah dari frontend.

---

# KOMPONEN NILAI

Pengetahuan

Keterampilan

Sikap

Tahfidz

Hayah

Diniyah

Keasramaan

Ekstrakurikuler

Semua dinamis.

---

# FORMULA NILAI

Formula dibuat dari frontend.

Contoh:

Nilai Akhir =
30% Tugas
20% UH
20% PTS
30% PAS

Formula dapat diubah.

Tidak boleh hardcode.

---

# INPUT NILAI

Gunakan tampilan Spreadsheet.

Mirip Microsoft Excel.

Fitur:

Auto Save

Tab Navigation

Arrow Navigation

Enter Navigation

Paste Excel

Copy Cell

Copy Column

Copy Row

Fill Down

Drag Fill

Undo

Redo

Highlight Error

Keyboard Shortcut

Mass Input

Real Time Save

Offline Queue

Sync otomatis.

---

# VALIDASI

Nilai minimum

Nilai maksimum

Tidak boleh kosong

Tidak boleh duplicate

Tidak boleh di luar rentang

Semua divalidasi Backend.

---

# LEGER

Bangun Enterprise Leger.

Kolom otomatis sesuai mapel.

Jumlah mapel otomatis.

Jumlah siswa otomatis.

Semester otomatis.

KKM otomatis.

Predikat otomatis.

Ranking otomatis.

Rata-rata otomatis.

Nilai akhir otomatis.

Remedial otomatis.

Pengayaan otomatis.

Tidak boleh edit manual hasil akhir.

---

# FITUR LEGER

Freeze Header

Freeze Column

Horizontal Scroll

Vertical Scroll

Virtual Scroll

Pagination

Search

Filter

Sort

Grouping

Export

Import

Print

Responsive

Keyboard Friendly

---

# LEGGER GURU

Guru hanya melihat:

Unit yang diampu

Kelas yang diampu

Mapel yang diampu

Semester aktif

Tahun ajaran aktif

Tidak boleh melihat kelas lain.

---

# WALI KELAS

Melihat seluruh mapel di kelasnya.

Tidak dapat mengubah nilai guru mapel.

Hanya validasi.

Cetak leger.

Cetak rapor.

Input absensi.

Input catatan wali kelas.

---

# KEPALA SEKOLAH

Melihat seluruh leger.

Approval leger.

Approval rapor.

Monitoring nilai.

Grafik akademik.

---

# RAPOR

Bangun Report Card Engine.

Template berasal dari Database.

Tidak boleh hardcode.

---

# ISI RAPOR

Logo

Kop Sekolah

Foto Siswa

QR Verification

Barcode

Data Sekolah

Data Siswa

Data Orang Tua

Nilai

Predikat

Deskripsi

Absensi

Tahfidz

Ekstrakurikuler

Catatan Wali

Keputusan Naik Kelas

Tanda Tangan

Digital Signature

Watermark

Semua dinamis.

---

# DESKRIPSI NILAI

Generate otomatis.

Contoh:

"Sangat baik dalam memahami materi."

"Perlu meningkatkan kemampuan..."

Guru dapat mengedit.

Menggunakan AI helper (opsional).

---

# PREDIKAT

A

B

C

D

E

Atau

SB

B

C

K

Semua dapat diatur dari frontend.

---

# ABSENSI RAPOR

Hadir

Izin

Sakit

Alpa

Otomatis dari modul Absensi.

---

# TAHFIDZ

Jumlah Hafalan

Juz

Surah

Ayat

Predikat

Musyrif

Catatan

Semua otomatis.

---

# EKSTRAKURIKULER

Nama

Nilai

Predikat

Pembina

Catatan

---

# CATATAN WALI

Dinamis.

Template dapat diubah.

---

# KENAIKAN KELAS

Aturan dibuat dari frontend.

Contoh:

Nilai minimum

Jumlah remedial

Absensi

Tahfidz

Akhlak

Semua Rule Engine.

---

# KELULUSAN

Rule Engine.

Tidak hardcode.

---

# CETAK

A4

F4

Legal

A3

Portrait

Landscape

Semua otomatis.

---

# EXPORT

PDF

Excel

Word

CSV

Print

Semua tanpa error.

---

# IMPORT

Excel

CSV

ODS

Mapping otomatis.

---

# DASHBOARD GURU

Menampilkan:

Nilai belum diinput

Nilai belum valid

Rapor belum selesai

Jumlah siswa

Grafik nilai

Progress pengisian

---

# DASHBOARD WALI KELAS

Progress rapor

Absensi

Catatan

Approval

Cetak

---

# DASHBOARD KEPALA SEKOLAH

Statistik nilai

Rata-rata kelas

Ranking

Grafik

Approval

Monitoring guru

---

# MOBILE

REST API

/api/assessment

/api/ledger

/api/report-card

/api/final-score

/api/student-report

/api/teacher-gradebook

Flutter Ready.

---

# AUDIT LOG

Tambah

Edit

Hapus

Approval

Cetak

Export

Import

Semua dicatat.

---

# VALIDATION

Tidak boleh ada:

Hardcoded Formula

Hardcoded Nilai

Hardcoded Predikat

Hardcoded Rapor

Hardcoded Leger

Hardcoded Ranking

Hardcoded Deskripsi

Dummy Data

Mock Data

---

# INTEGRASI

Sinkron otomatis dengan:

Master Mata Pelajaran

KBM

Jadwal

Absensi

Teacher Assignment

Student Assignment

Tahfidz

Ekstrakurikuler

Dashboard

Sivitas

Keuangan (status administrasi jika diperlukan)

Mobile API

RBAC

Assignment

Data Scope

Prisma ORM

MySQL

---

# OUTPUT

Refactor seluruh modul penilaian.

Hubungkan seluruh fitur ke Database.

Tidak boleh menggunakan localStorage sebagai sumber data utama.

Seluruh CRUD harus menggunakan API.

Semua proses menggunakan Transaction.

Semua perubahan memiliki Audit Trail.

---

# TARGET

100% Dynamic Assessment

100% Dynamic Formula

100% Dynamic Leger

100% Dynamic Rapor

100% Dynamic Ranking

100% CRUD Complete

100% Database Driven

100% RBAC

100% Assignment

100% Data Scope

100% Mobile Ready

100% Print Ready

100% Export Ready

100% Import Ready

100% Production Ready

Zero Hardcode

Zero Dummy Data

Zero Broken CRUD

Zero Broken Print

Zero Broken Export

Zero Broken Import

Zero Broken Relation

Zero Runtime Error

Zero SQL Error

Zero Prisma Error

Enterprise Ready