============================================================
MASTER PROMPT
PRODUCTION REPAIR, SYNCHRONIZATION & VERIFICATION
SCHOOL / PESANTREN ERP
============================================================

PERAN AI:
Anda bertindak sebagai Senior Enterprise Software Architect,
Senior Full-Stack Engineer, Database Engineer, QA Engineer,
Security Engineer, DevOps Engineer, dan Production Auditor.

PROJECT:
ERP Sekolah / Pondok Pesantren Full-Stack.

STACK:

FRONTEND
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Framer Motion

BACKEND
- Node.js
- Express.js
- TypeScript
- REST API
- Controller / Service / Repository architecture
- JWT
- RBAC

DATABASE
- PostgreSQL
- Prisma ORM

REPORTING
- PDF
- DOCX
- Excel
- CSV
- Browser Print
- Unified Document / Print Engine

MOBILE
- Flutter
- REST API yang sama dengan Web ERP

============================================================
TUJUAN UTAMA
============================================================

JADIKAN CODEBASE YANG ADA BENAR-BENAR SIAP PRODUKSI.

Jangan hanya memberikan laporan.

ANDA HARUS:

SCAN
→ IDENTIFY
→ TRACE ROOT CAUSE
→ FIX
→ REFACTOR
→ MIGRATE
→ TEST
→ VERIFY
→ REGRESSION TEST
→ FINAL VALIDATION.

============================================================
ATURAN MUTLAK
============================================================

1. Jangan membuat project baru.

2. Jangan mengganti stack teknologi.

3. Jangan membuat fitur baru yang tidak diperlukan.

4. Jangan membuat modul duplikat.

5. Jangan membuat database baru.

6. Jangan membuat API baru jika API existing sudah dapat digunakan.

7. Jangan menggunakan dummy data untuk production.

8. Jangan menggunakan mock API.

9. Jangan menggunakan simulation mode.

10. Jangan menggunakan hardcoded business data.

11. Jangan menghapus fitur yang masih digunakan tanpa migrasi.

12. Jangan hanya memperbaiki frontend jika akar masalah berada di backend/database.

13. Jangan hanya memperbaiki backend jika frontend masih menggunakan logic lama.

14. Jangan menyatakan sistem READY jika masih terdapat Critical/High issue.

15. Jangan membuat fake success response.

16. Jangan menyembunyikan error.

17. Jangan mematikan validation hanya agar fitur terlihat bekerja.

18. Jangan menghapus foreign key hanya untuk menghindari error.

19. Jangan menggunakan fallback dummy ketika database gagal.

20. Database harus menjadi sumber data utama.

============================================================
PHASE 1
FULL CODEBASE DISCOVERY
============================================================

Scan seluruh repository.

Cari:

/src
/components
/pages
/routes
/hooks
/services
/utils
/api
/controllers
/services
/repositories
/middleware
/prisma
/migrations
/tests
/public
/storage
/report
/document
/pdf
/excel
/print
/flutter integration.

Baca package.json.

Baca environment configuration.

Baca Prisma schema.

Baca migration.

Baca seluruh route.

Baca seluruh API.

Baca seluruh permission.

Baca seluruh model.

Jangan berasumsi.

Gunakan codebase aktual sebagai sumber utama.

============================================================
PHASE 2
FEATURE INVENTORY
============================================================

Buat inventaris fitur aktual.

Kelompokkan:

AUTHENTICATION
DASHBOARD
MASTER DATA
TATA USAHA
ACADEMIC YEAR
CURRICULUM
ROMBEL
TEACHER ASSIGNMENT
SCHEDULE
KBM
ATTENDANCE
ASSESSMENT
LEGER
RAPOR
DOCUMENT
ARCHIVE
NOTIFICATION
REPORT
FINANCE jika sudah ada
HR jika sudah ada
SETTINGS
AUDIT
MOBILE API.

Untuk setiap fitur periksa:

MENU
PAGE
ROUTE
API
CONTROLLER
SERVICE
DATABASE
PERMISSION
CRUD
REPORT
EXPORT
PRINT.

============================================================
PHASE 3
DUPLICATE FEATURE DETECTION
============================================================

Cari fitur yang memiliki fungsi sama.

Contoh:

Student
Students
Student Management
Student Engine

Teacher
Guru
Employee
Teacher Management

Attendance
Absensi
Presensi
Smart Attendance

Assessment
Score
Grades
Nilai

Leger
Grade Recap
Grade Summary

Report
Rapor
Report Card

Document
Letter
Surat
Document Generator.

Jika dua atau lebih fitur ternyata memiliki fungsi bisnis yang sama:

TENTUKAN SATU SUMBER UTAMA.

Kemudian:

- gunakan source utama
- redirect modul lama
- migrasikan data
- hapus logic duplikat
- pertahankan backward compatibility jika diperlukan.

============================================================
PHASE 4
DATABASE AUDIT
============================================================

Audit seluruh Prisma schema.

Periksa:

Primary Key
Foreign Key
Unique
Index
Enum
Relation
Nullable
Cascade
Restrict
Soft Delete.

Cari:

Duplicate model
Duplicate table
Duplicate column
Duplicate relation
Duplicate enum
Broken relation
Orphan relation
Unused model
Circular relation
Missing index
Missing unique constraint.

Pastikan:

Student → Rombel

Rombel → AcademicYear

Teacher → Assignment

Assignment → Subject

Assignment → Rombel

Assignment → Schedule

Schedule → KBM

KBM → Attendance

KBM → Assessment

Assessment → Score

Score → Leger

Leger → Rapor

Rapor → Document

Document → Archive.

============================================================
PHASE 5
DATABASE INTEGRITY
============================================================

Cari data:

Duplicate Student
Duplicate Teacher
Duplicate Subject
Duplicate Rombel
Duplicate Assignment
Duplicate Assessment
Duplicate Score
Duplicate Attendance.

Gunakan unique constraint yang tepat.

Jangan hanya melakukan pengecekan di frontend.

Database harus mencegah duplicate critical record.

============================================================
PHASE 6
ACADEMIC YEAR ISOLATION
============================================================

Pastikan:

2025/2026

tidak tercampur dengan:

2026/2027.

Semua query akademik wajib mempertimbangkan:

academic_year_id
semester_id
unit_id

jika memang diperlukan oleh scope data.

Histori tahun ajaran lama tidak boleh berubah karena operasi tahun ajaran baru.

============================================================
PHASE 7
CRUD AUDIT
============================================================

Untuk SETIAP modul:

CREATE
READ
UPDATE
DELETE
VIEW
DETAIL
SEARCH
FILTER
SORT
PAGINATION.

Uji:

Create data
→ database berubah.

Update data
→ database berubah.

Delete data
→ database berubah sesuai policy.

Reload page
→ data tetap benar.

Logout
→ login kembali
→ data tetap benar.

Jika tombol tersedia tetapi tidak berfungsi:

PERBAIKI.

============================================================
PHASE 8
MODAL AUDIT
============================================================

Periksa:

Create Modal
Edit Modal
Detail Modal
Delete Confirmation
Approval Modal
Reject Modal
Import Modal
Export Modal
Preview Modal.

Pastikan:

Open
Close
Submit
Validation
Loading
Success
Error
Reset

semuanya bekerja.

============================================================
PHASE 9
API AUDIT
============================================================

Scan seluruh REST API.

Untuk setiap endpoint:

Authentication
Authorization
Validation
Controller
Service
Database
Response
Error Handling.

Pastikan tidak ada:

Duplicate endpoint
Dead endpoint
Unused endpoint
Endpoint tanpa permission
Endpoint tanpa validation.

============================================================
PHASE 10
API CONTRACT
============================================================

Pastikan Web dan Flutter menggunakan API contract yang sama.

Response konsisten.

SUCCESS:

{
  success,
  data,
  message,
  meta
}

ERROR:

{
  success,
  message,
  errors,
  code,
  meta
}

Jangan mengubah struktur response tanpa memperbarui seluruh consumer.

============================================================
PHASE 11
RBAC AUDIT
============================================================

Audit:

Super Admin
Yayasan
Kepala Sekolah
Kepala TU
Staff TU
Wakil Kurikulum
Operator
Guru
Wali Kelas
Karyawan
Siswa
Orang Tua.

Periksa:

Menu permission
Page permission
API permission
Database scope.

User tidak boleh memperoleh akses hanya karena frontend menyembunyikan menu.

Backend wajib melakukan authorization.

============================================================
PHASE 12
SCOPE SECURITY
============================================================

Pastikan user hanya dapat melihat data sesuai:

Tenant
Yayasan
Unit
Sekolah
Jenjang
Rombel
Assignment
Tahun Ajaran.

Uji IDOR:

User mengganti ID pada URL/API.

Backend harus tetap menolak akses jika record bukan miliknya.

============================================================
PHASE 13
AUTHENTICATION
============================================================

Test:

Login valid
Login invalid
Password salah
User inactive
Token expired
Token invalid
Logout
Refresh token
Unauthorized API.

Pastikan:

Password hashed.

JWT secret tidak berada di source code.

Environment secret tidak exposed ke frontend.

============================================================
PHASE 14
BUSINESS LOGIC
============================================================

Periksa logic:

Academic Year
Semester
Rombel
Promotion
Teacher Assignment
Schedule
KBM
Attendance
Assessment
Leger
Rapor.

Business logic harus berada di backend.

Frontend hanya menjadi client.

============================================================
PHASE 15
TRANSACTION SAFETY
============================================================

Gunakan transaction untuk:

Rollover
Promotion
Bulk Import
Bulk Assignment
Generate Leger
Finalize Leger
Generate Rapor
Publish Rapor
Revision Rapor.

Jika proses gagal:

ROLLBACK.

Tidak boleh:

50 siswa berhasil
20 siswa gagal
database tetap dianggap sukses.

============================================================
PHASE 16
ATTENDANCE AUDIT
============================================================

Guru:

GPS
Google Maps
QR
Manual.

Karyawan:

GPS
Google Maps
QR
Manual sesuai permission.

Siswa:

QR kartu pelajar
Manual oleh guru/wali kelas
Attendance berdasarkan assignment/rombel.

Validasi:

User
Student
Rombel
Schedule
Location
Time
Permission.

Tidak boleh ada simulasi absensi.

============================================================
PHASE 17
KBM AUDIT
============================================================

KBM harus berasal dari:

Teacher Assignment
+
Schedule.

Guru hanya melihat KBM yang menjadi tugasnya.

Periksa:

Jurnal
Materi
Tugas
Absensi
Assessment
Completion.

============================================================
PHASE 18
ASSESSMENT AUDIT
============================================================

Nilai harus berasal dari Assessment Engine.

Validasi:

Student
Teacher
Subject
Rombel
Semester
Academic Year.

Tidak boleh ada input nilai untuk kelas/mapel yang bukan assignment guru.

============================================================
PHASE 19
LEGER AUDIT
============================================================

Leger mengambil:

Assessment
Score
KKM
Grade Rule
Attendance jika diperlukan.

Hitung:

Nilai akhir
Rata-rata
Predikat
Ketuntasan
Ranking.

Formula harus berasal dari configuration/backend.

Tidak boleh hardcoded.

============================================================
PHASE 20
RAPOR AUDIT
============================================================

Rapor mengambil data dari:

Student Engine
Academic Year
Curriculum
Attendance
Auto Leger
Extracurricular
Achievement
Homeroom Notes.

Tidak boleh input ulang nilai.

Jika Leger berubah sebelum finalize:

Rapor mengikuti perubahan.

Jika Rapor sudah finalized:

snapshot immutable.

============================================================
PHASE 21
DOCUMENT ENGINE AUDIT
============================================================

SEMUA dokumen harus menggunakan Unified Document Engine.

Audit:

SK
Surat
Undangan
Surat Tugas
Surat Orang Tua
Berita Acara
Daftar Hadir
Leger
Rapor
Laporan.

Pastikan tidak ada generator dokumen duplikat.

============================================================
PHASE 22
KOP SURAT
============================================================

Ambil dari database:

Yayasan
Unit
Sekolah
Alamat
Logo
Telepon
Email
Website
NPSN
NSM
NSS.

Tidak boleh hardcoded.

============================================================
PHASE 23
PDF
============================================================

Test:

Preview
Generate
Download
Print
Bulk Generate.

Periksa:

A4
F4
Legal
A5
Portrait
Landscape
Margin
Font
Logo
Table
Header
Footer
Signature
QR
Page Break.

Tidak boleh:

text terpotong
table keluar halaman
logo rusak
font berubah
header hilang
signature hilang.

============================================================
PHASE 24
WORD
============================================================

Test DOCX:

Open
Edit
Print.

Periksa:

Font
Margin
Paper Size
Header
Footer
Table
Logo
Signature.

File tidak boleh corrupt.

============================================================
PHASE 25
EXCEL
============================================================

Test:

Export
Import.

Periksa:

Header
Column
Date
Number
Encoding
Formula
Data consistency.

============================================================
PHASE 26
CSV
============================================================

Pastikan:

UTF-8
Delimiter benar
Header benar
Nama Indonesia tidak rusak.

============================================================
PHASE 27
PRINT
============================================================

Test:

Browser Print
PDF Print
A4
F4
Legal
Portrait
Landscape.

Preview harus sama dengan hasil print.

============================================================
PHASE 28
FILE STORAGE
============================================================

Audit:

Logo
Foto
Dokumen
Signature
Stamp
Materi
Attachment.

Tidak boleh menggunakan absolute path hardcoded.

Gunakan environment configuration.

============================================================
PHASE 29
NOTIFICATION
============================================================

Notification harus berasal dari event nyata.

Test:

Create
Read
Unread
Mark Read
Delete
Preference.

Jangan membuat notification dummy.

============================================================
PHASE 30
AUDIT TRAIL
============================================================

Catat:

CREATE
UPDATE
DELETE
APPROVE
REJECT
PUBLISH
LOCK
UNLOCK
IMPORT
EXPORT
PRINT
DOWNLOAD
ARCHIVE
RESTORE.

Audit log tidak boleh dapat dimanipulasi user biasa.

============================================================
PHASE 31
FRONTEND STATE
============================================================

Periksa:

Loading
Error
Empty
Success
Retry
Pagination
Cache
Refetch.

Setelah mutation:

invalidate cache
refetch
update state.

Jangan menampilkan data lama.

============================================================
PHASE 32
SECURITY
============================================================

Audit:

SQL Injection
XSS
IDOR
Broken Access Control
Mass Assignment
File Upload
CORS
JWT
Sensitive Data
Rate Limiting.

Jangan expose:

PASSWORD
JWT_SECRET
DATABASE_URL
PRIVATE_KEY
API_SECRET.

============================================================
PHASE 33
PERFORMANCE
============================================================

Cari:

N+1 query
Query tanpa index
Duplicate request
Large payload
Unnecessary render
Memory leak
Unbounded query.

Perbaiki dengan:

Pagination
Index
Select
Efficient relation loading
Caching bila diperlukan.

============================================================
PHASE 34
MOBILE
============================================================

Pastikan Flutter:

Login
Dashboard
Role
Profile
Attendance
KBM
Assessment
Notification
Report

menggunakan REST API yang sama.

Jangan membuat business logic kedua di Flutter.

============================================================
PHASE 35
ENVIRONMENT
============================================================

Pastikan semua:

API URL
Database
JWT
Storage
Google Maps
Email
Firebase
Third Party API

menggunakan environment configuration.

Tidak ada secret hardcoded.

============================================================
PHASE 36
MIGRATION
============================================================

Periksa:

Prisma Schema
Migration
PostgreSQL.

Test:

Fresh Database
Migration Up
Application Start
CRUD
Rollback strategy.

Production tidak boleh membutuhkan dummy seed.

============================================================
PHASE 37
TEST AUTOMATION
============================================================

Perbaiki atau buat test:

Unit
Integration
API
Database
RBAC
Security
E2E.

Minimal:

AUTH
CRUD
RBAC
ACADEMIC YEAR
ROMBEL
ASSIGNMENT
KBM
ATTENDANCE
ASSESSMENT
LEGER
RAPOR
DOCUMENT
PRINT.

============================================================
PHASE 38
NO FAKE SUCCESS
============================================================

DILARANG:

Toast sukses sebelum API berhasil.

DILARANG:

return success tanpa database update.

DILARANG:

catch error tanpa handling.

DILARANG:

fallback ke dummy data.

DILARANG:

mengubah UI saja untuk menutupi error backend.

============================================================
PHASE 39
PRODUCTION DATA
============================================================

Hapus dari production:

Dummy
Mock
Simulation
Demo
Fake Student
Fake Teacher
Fake Score
Fake Attendance
Fake Rapor
Fake Notification
Fake Report.

Seed hanya boleh tersedia untuk development jika memang diperlukan.

============================================================
PHASE 40
FINAL END-TO-END TEST
============================================================

TEST:

LOGIN
↓
RBAC
↓
DASHBOARD
↓
TAHUN AJARAN
↓
MASTER DATA
↓
ROMBEL
↓
TEACHER ASSIGNMENT
↓
JADWAL
↓
KBM
↓
ABSENSI
↓
ASSESSMENT
↓
NILAI
↓
LEGER
↓
RAPOR
↓
DOCUMENT
↓
PDF
↓
WORD
↓
EXCEL
↓
CSV
↓
PRINT
↓
ARCHIVE
↓
AUDIT.

============================================================
PHASE 41
BUG FIX RULE
============================================================

Jika menemukan bug:

1. Identifikasi error.
2. Trace request.
3. Trace frontend.
4. Trace API.
5. Trace controller.
6. Trace service.
7. Trace database.
8. Cari ROOT CAUSE.
9. Perbaiki root cause.
10. Jalankan regression test.

Jangan melakukan workaround yang membuat arsitektur semakin buruk.

============================================================
PHASE 42
FINAL VERIFICATION
============================================================

Setelah semua perbaikan:

Jalankan:

TypeScript check
Lint
Build
Unit Test
Integration Test
API Test
Database Test
E2E Test.

Tidak boleh ada:

Type Error
Build Error
Unhandled Exception
Broken API
Broken Relation
Failed Migration.

============================================================
PHASE 43
GO LIVE GATE
============================================================

Sistem hanya boleh dinyatakan:

PRODUCTION READY

jika:

Critical = 0
High = 0
Build Error = 0
Migration Error = 0
Broken CRUD = 0
Broken API = 0
Broken Relation = 0
Unauthorized Access = 0
Duplicate Business Engine = 0
Dummy Production Data = 0
Broken PDF = 0
Broken DOCX = 0
Broken Excel = 0
Broken CSV = 0
Broken Print = 0.

============================================================
PHASE 44
FINAL REPORT
============================================================

Setelah selesai, tampilkan:

A. TOTAL FILE AUDITED

B. TOTAL MODULE AUDITED

C. TOTAL API AUDITED

D. TOTAL DATABASE MODEL AUDITED

E. BUG FOUND

F. BUG FIXED

G. DUPLICATE FEATURE FOUND

H. DUPLICATE DATABASE MODEL FOUND

I. SECURITY ISSUE

J. PERFORMANCE ISSUE

K. PRINT/DOCUMENT ISSUE

L. RBAC ISSUE

M. MOBILE/API ISSUE

N. MIGRATION ISSUE

O. TEST RESULT

P. REMAINING WARNING

Q. FINAL STATUS.

Gunakan:

CRITICAL
HIGH
MEDIUM
LOW
INFO.

Jangan menyembunyikan issue.

============================================================
FINAL INSTRUCTION
============================================================

JANGAN BERHENTI PADA ANALISIS.

KERJAKAN PERBAIKANNYA.

JANGAN HANYA MEMBERIKAN CHECKLIST.

JANGAN HANYA MEMBERIKAN SARAN.

SCAN CODEBASE AKTUAL.

PERBAIKI CODE.

PERBAIKI DATABASE.

PERBAIKI API.

PERBAIKI RELATION.

PERBAIKI RBAC.

PERBAIKI CRUD.

PERBAIKI REPORT.

PERBAIKI PDF.

PERBAIKI WORD.

PERBAIKI EXCEL.

PERBAIKI CSV.

PERBAIKI PRINT.

PERBAIKI MOBILE API.

JALANKAN TEST.

ULANGI TEST SETELAH PERBAIKAN.

PASTIKAN REGRESSION TIDAK TERJADI.

HASIL AKHIR HARUS:

ONE DATABASE
ONE SOURCE OF TRUTH
ONE BUSINESS LOGIC
ONE API CONTRACT
ONE RBAC
ONE DOCUMENT ENGINE
ONE AUDIT TRAIL.

ERP HARUS SIAP DIGUNAKAN UNTUK DATA PRODUKSI NYATA.
============================================================
END OF MASTER PRODUCTION REPAIR PROMPT
============================================================