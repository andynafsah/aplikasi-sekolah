# 25_ENTERPRISE_LEGER_PRO_MAX.md

# ENTERPRISE LEGER PRO MAX ENGINE

Version : 1.0 Enterprise

Architecture : Single Tenant

Database : MySQL

ORM : Prisma ORM

Backend : Laravel API

Frontend : React + Vite + Tailwind CSS

Status : Production Ready

---

# OBJECTIVE

Membangun Enterprise Leger yang jauh lebih baik daripada e-Rapor, Dapodik maupun Excel.

Leger harus menjadi pusat seluruh proses penilaian guru.

Guru dapat menginput nilai tanpa berpindah halaman.

Semua perubahan tersimpan otomatis.

Tidak boleh ada kehilangan data.

Semua terhubung otomatis ke Dashboard, Rapor, Analitik dan Mobile.

---

# CORE MODULE

Dashboard Leger

Input Nilai

Spreadsheet Engine

Import Excel

Export

Analisis Nilai

Approval

Audit Log

History

Setting

---

# SPREADSHEET ENGINE

Tampilan seperti Microsoft Excel.

Fullscreen.

Freeze Header.

Freeze Kolom Nama.

Freeze Kolom NIS.

Resize Kolom.

Resize Baris.

Horizontal Scroll.

Vertical Scroll.

Dark Mode.

Light Mode.

Split Screen.

Responsive.

Sticky Header.

Sticky Footer.

Sticky Student Column.

---

# KEYBOARD ENGINE

Enter

Shift + Enter

Tab

Shift + Tab

Arrow Key

Ctrl + C

Ctrl + V

Ctrl + X

Ctrl + Z

Ctrl + Y

Ctrl + F

Ctrl + S

Ctrl + A

Semua berjalan seperti Microsoft Excel.

---

# INPUT ENGINE

Klik langsung pada sel.

Double Click Edit.

Copy.

Paste.

Cut.

Drag Fill.

Bulk Input.

Bulk Update.

Undo.

Redo.

Auto Save.

---

# AUTO SAVE

Setiap perubahan langsung tersimpan.

Tidak perlu tombol Simpan.

Jika internet terputus:

Offline Queue.

Sinkron otomatis ketika online.

Recovery otomatis.

---

# HEADER

Nama Yayasan

Nama Sekolah

Logo

Semester

Tahun Ajaran

Guru

Mata Pelajaran

Kelas

KKM

CP

TP

ATP

Semua berasal dari Database.

---

# FILTER

Unit

Jenjang

Kelas

Mapel

Guru

Semester

Academic Year

Search Nama

Search NIS

Search NISN

Filter Status

Filter Nilai

Filter Ketuntasan

---

# STUDENT PANEL

Foto

Nama

NIS

NISN

Jenis Kelamin

Kelas

Wali Kelas

Orang Tua

Nomor HP

Prestasi

Pelanggaran

Tahfidz

Absensi

Tagihan

Riwayat Nilai

Riwayat Rapor

Semua muncul tanpa reload.

---

# SCORE COLUMN

Nilai Harian

NH1

NH2

NH3

NH4

NH5

NH6

STS

PTS

SAS

PAS

PAT

Praktik

Portofolio

Project

Tahfidz

Ekstrakurikuler

Sikap

Catatan Guru

Nilai Akhir

Predikat

KKM

Status

Semua dinamis.

---

# VALIDATION

Nilai maksimal 100.

Nilai minimal 0.

Tidak boleh kosong.

Highlight Merah.

Highlight Kuning.

Highlight Hijau.

Duplicate Checker.

Validation Realtime.

---

# AUTO CALCULATION

Bobot

Rata-rata

KKM

Predikat

Ketuntasan

Ranking (Optional)

Persentase

Analisis

Semua otomatis.

---

# IMPORT ENGINE

Excel

CSV

Template Excel

Preview

Error Validation

Rollback

Duplicate Detection

Import Wizard

---

# EXPORT ENGINE

PDF

Excel

Word

CSV

ZIP

Print

Batch Export

---

# PRINT ENGINE

Preview

Landscape

Portrait

Custom Margin

Custom Font

Custom Logo

Dynamic Header

Dynamic Footer

QR Verification

Digital Signature

Watermark

---

# ANALYTICS

Grafik Nilai

Grafik Ketuntasan

Grafik Per Guru

Grafik Per Kelas

Grafik Per Semester

Grafik Per Tahun

Distribusi Nilai

Analisis CP

Analisis TP

Analisis ATP

Rekap Guru

Rekap Kelas

Rekap Sekolah

---

# APPROVAL

Guru Mapel

↓

Wali Kelas

↓

Kepala Sekolah

↓

Publish

Semua Approval menggunakan Audit Log.

---

# AUDIT LOG

Siapa

Kapan

Perubahan Lama

Perubahan Baru

Device

Browser

IP

Lokasi

---

# RAPOR ENGINE

Generate Otomatis.

Sinkron otomatis.

Tidak boleh input ulang.

Realtime.

---

# MOBILE

Flutter Ready.

Tablet Friendly.

iPad Friendly.

Android.

iPhone.

Offline Ready.

Realtime Sync.

---

# ROLE

Guru

Guru Mapel

Wali Kelas

Kepala Sekolah

Operator

Administrator

Super Admin

Semua menggunakan Dynamic RBAC.

Assignment.

Permission.

Data Scope.

---

# DATABASE

legers

student_scores

score_components

score_categories

score_logs

score_approvals

grade_statistics

student_statistics

teacher_statistics

report_cards

report_card_logs

Semua menggunakan Prisma Relation.

---

# PRISMA

Foreign Key

Relation

Transaction

Soft Delete

Cascade

Audit Log

Activity Log

Repository Pattern

Service Layer

---

# SETTING

Jumlah Nilai Harian

Jenis Penilaian

KKM

Predikat

Bobot

Template Leger

Template Cetak

Header

Footer

Logo

Digital Signature

Semua dapat diubah dari frontend.

---

# PERFORMANCE

Virtual Scroll.

Lazy Loading.

Server Side Pagination.

Server Side Filtering.

Server Side Sorting.

Optimized Query Prisma.

Caching Query.

Debounce Search.

Tidak boleh terjadi lag walaupun 10.000+ data.

---

# FINAL QA

✓ Spreadsheet seperti Microsoft Excel

✓ Auto Save

✓ Auto Recovery

✓ Offline Queue

✓ Copy Paste Excel

✓ Drag Fill

✓ Undo

✓ Redo

✓ Highlight Validation

✓ Auto Hitung

✓ Auto Ranking

✓ Approval

✓ Audit Log

✓ QR Verification

✓ Digital Signature

✓ Import Excel

✓ Export PDF

✓ Export Excel

✓ Export Word

✓ Print

✓ Dashboard Sinkron

✓ Rapor Sinkron

✓ Mobile Sinkron

✓ Dynamic RBAC

✓ Dynamic Assignment

✓ Dynamic Data Scope

✓ Dynamic Setting

✓ Tidak ada Hardcode

✓ Tidak ada Dummy Data

✓ Tidak ada Local Memory

✓ Tidak ada SQL Error

✓ Tidak ada Prisma Error

✓ Tidak ada Runtime Error

✓ Production Ready

✓ Enterprise Ready