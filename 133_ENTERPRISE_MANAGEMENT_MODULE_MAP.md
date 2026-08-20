# 133_ENTERPRISE_MANAGEMENT_MODULE_MAP.md

## ENTERPRISE SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION ARCHITECTURE
SCOPE: MANAGEMENT ONLY

============================================================
1. PURPOSE
============================================================

Dokumen ini mendefinisikan module resmi yang boleh
berada di dalam aplikasi:

ENTERPRISE SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM.

Aplikasi ini TIDAK menangani:

- KBM
- Akademik
- Kurikulum
- Penilaian
- Leger
- Rapor

Seluruh domain akademik ditangani oleh aplikasi
KBM + Leger yang sudah dimiliki lembaga.

============================================================
2. ARCHITECTURE PRINCIPLE
============================================================

SYSTEM
│
├── MANAGEMENT APPLICATION
│
│   ├── Master Data
│   ├── Kepegawaian
│   ├── Absensi
│   ├── Kartu & Identitas
│   ├── Tata Usaha
│   ├── Dokumen
│   ├── Arsip
│   ├── Inventaris
│   ├── Keuangan
│   ├── Notification
│   ├── Reporting
│   └── Audit
│
└── EXTERNAL ACADEMIC APPLICATION
    ├── KBM
    ├── Kurikulum
    ├── Penilaian
    ├── Leger
    └── Rapor

============================================================
3. MODULE HIERARCHY
============================================================

LEVEL 0
SYSTEM

LEVEL 1
CORE DOMAIN

LEVEL 2
MODULE

LEVEL 3
FEATURE

LEVEL 4
CRUD / ACTION

Contoh:

ABSENSI
└── SISWA
    ├── Scan QR
    ├── Manual
    ├── Rekap
    ├── Koreksi
    └── Audit

============================================================
4. MODULE 01 — DASHBOARD
============================================================

Purpose:

Memberikan ringkasan kondisi lembaga
secara real-time.

Features:

- statistik siswa
- statistik guru
- statistik karyawan
- absensi hari ini
- keterlambatan
- surat
- dokumen
- inventaris
- transaksi
- notifikasi
- aktivitas terbaru

Rules:

Semua angka berasal dari database.

DILARANG:

- dummy statistic
- hardcoded statistic
- fake chart
- mock record.

============================================================
5. MODULE 02 — MASTER DATA
============================================================

MASTER DATA adalah sumber data utama.

------------------------------------------------------------
5.1 LEMBAGA
------------------------------------------------------------

CRUD:

CREATE
READ
UPDATE
DELETE

Data:

- nama
- yayasan
- logo
- alamat
- kontak
- email
- website
- kepala lembaga
- legalitas
- identitas lembaga

------------------------------------------------------------
5.2 UNIT
------------------------------------------------------------

Data:

- nama unit
- kode
- tipe
- alamat
- status
- kepala unit

------------------------------------------------------------
5.3 SISWA/SANTRI
------------------------------------------------------------

Data:

IDENTITAS

- nama
- NIK
- NIS
- NISN
- tempat lahir
- tanggal lahir
- jenis kelamin
- alamat
- kontak
- foto
- status
- unit
- tahun masuk

RELATION:

Student
→ Guardian

Student
→ Documents

Student
→ Attendance

Student
→ Student Card

DILARANG RELASI:

Student
→ Grade

Student
→ Report Card

Student
→ Academic Assessment

------------------------------------------------------------
5.4 ORANG TUA/WALI
------------------------------------------------------------

Data:

- nama
- hubungan
- NIK
- pekerjaan
- telepon
- email
- alamat

------------------------------------------------------------
5.5 GURU
------------------------------------------------------------

Data:

- identitas
- NIP
- NUPTK
- NIY
- jabatan
- unit
- status
- kontak
- foto
- dokumen

------------------------------------------------------------
5.6 KARYAWAN
------------------------------------------------------------

Data:

- identitas
- jabatan
- unit
- status
- kontak
- foto
- dokumen

============================================================
6. MODULE 03 — KEPEGAWAIAN
============================================================

Purpose:

Mengelola administrasi guru dan karyawan.

Features:

- employee profile
- position
- employment status
- contract
- history
- documents
- SK
- surat tugas
- leave
- permission
- attendance
- lateness

DILARANG:

- jadwal mengajar
- mata pelajaran
- nilai
- KBM.

============================================================
7. MODULE 04 — ABSENSI
============================================================

ABSENSI adalah CORE MODULE.

============================================================
7.1 ABSENSI SISWA
============================================================

METHOD:

QR CODE
BARCODE
MANUAL

------------------------------------------------------------
QR FLOW
------------------------------------------------------------

SCAN
↓
IDENTIFY
↓
VALIDATE
↓
CHECK STATUS
↓
CREATE ATTENDANCE
↓
AUDIT

------------------------------------------------------------
7.2 SECURITY ATTENDANCE
------------------------------------------------------------

Security login.

Security:

SCAN QR
↓
SYSTEM IDENTIFY STUDENT
↓
VALIDATE
↓
RECORD ENTRY
↓
AUDIT

System menyimpan:

- student
- security
- timestamp
- device
- method
- result

------------------------------------------------------------
7.3 TEACHER ATTENDANCE
------------------------------------------------------------

Guru dapat:

SCAN QR

atau:

MANUAL.

Semua tindakan dicatat.

------------------------------------------------------------
7.4 EMPLOYEE ATTENDANCE
------------------------------------------------------------

Methods:

GPS
QR
BARCODE

Data:

- employee
- timestamp
- latitude
- longitude
- accuracy
- device
- method
- result

------------------------------------------------------------
7.5 GEOLOCATION
------------------------------------------------------------

Master:

Attendance Location

Fields:

- name
- latitude
- longitude
- radius
- status

Validation:

distance <= allowed radius.

============================================================
8. MODULE 05 — KARTU & IDENTITAS
============================================================

Features:

- student card
- employee card
- teacher ID
- QR code
- barcode
- batch generation
- print
- PDF
- export

QR harus unik.

Tidak boleh duplicate.

============================================================
9. MODULE 06 — TATA USAHA
============================================================

Submodule:

SURAT MASUK
SURAT KELUAR
SURAT TUGAS
SK
SURAT ORANG TUA
SURAT KETERANGAN
DISPOSISI
NOMOR SURAT

------------------------------------------------------------
SURAT GENERATOR
------------------------------------------------------------

PROFILE
↓
LETTER TEMPLATE
↓
VARIABLE
↓
DOCUMENT DATA
↓
NUMBERING
↓
SIGNATURE
↓
PREVIEW
↓
PDF/DOCX

============================================================
10. MODULE 07 — DOCUMENT MANAGEMENT
============================================================

Features:

- upload
- preview
- download
- version
- category
- owner
- access control
- expiry
- audit

Entity:

Document

Relations:

Document
→ Student

Document
→ Employee

Document
→ Institution

============================================================
11. MODULE 08 — ARCHIVE
============================================================

Archive system:

- category
- year
- document
- owner
- status
- retention
- search
- filter

============================================================
12. MODULE 09 — INVENTARIS
============================================================

Entities:

Asset
Category
Location
Custodian
Borrowing
Maintenance
Mutation

Flow:

Asset
↓
Location
↓
Custodian
↓
Condition
↓
History

============================================================
13. MODULE 10 — KEUANGAN
============================================================

Jika module keuangan telah ada,
gunakan module existing.

Jangan membuat duplicate.

Domain:

- cash
- bank
- income
- expense
- payment
- budget
- honor
- payroll
- BKU
- SPJ
- reporting

============================================================
14. MODULE 11 — NOTIFICATION
============================================================

Channels:

- in-app
- email
- WhatsApp jika integration tersedia
- push notification jika tersedia

Events:

- attendance
- letter
- document
- employee
- finance
- system

============================================================
15. MODULE 12 — REPORTING
============================================================

Reports:

STUDENT
EMPLOYEE
ATTENDANCE
DOCUMENT
LETTER
ARCHIVE
ASSET
FINANCE
AUDIT

Output:

PDF
DOCX
XLSX
CSV

sesuai kebutuhan.

============================================================
16. MODULE 13 — AUDIT
============================================================

Audit event:

CREATE
UPDATE
DELETE
LOGIN
LOGOUT
SCAN
APPROVE
REJECT
DOWNLOAD
PRINT
EXPORT
IMPORT

Fields:

- actor
- action
- module
- entity
- entity_id
- timestamp
- IP
- device
- before
- after

============================================================
17. MODULE 14 — SYSTEM ADMINISTRATION
============================================================

Features:

- user
- role
- permission
- profile
- settings
- institution
- numbering
- template
- backup
- audit
- integration

============================================================
18. ROLE MATRIX
============================================================

SUPER ADMIN
→ Full system

ADMIN
→ Operational management

TU
→ Administration
→ Student
→ Employee
→ Letter
→ Document
→ Archive

KEPALA
→ Dashboard
→ Reports
→ Approval

GURU
→ Student attendance
→ Own attendance
→ Limited student information

SECURITY
→ Student QR attendance

BENDAHARA
→ Finance

STAFF
→ Assigned modules

============================================================
19. MODULE DEPENDENCY
============================================================

MASTER DATA
      ↓
KEPEGAWAIAN
      ↓
ABSENSI
      ↓
REPORTING

MASTER DATA
      ↓
DOCUMENT
      ↓
ARCHIVE

MASTER DATA
      ↓
LETTER
      ↓
ARCHIVE

MASTER DATA
      ↓
INVENTORY
      ↓
REPORTING

MASTER DATA
      ↓
FINANCE
      ↓
REPORTING

============================================================
20. DATA OWNERSHIP
============================================================

MASTER DATA:

Student
Employee
Guardian
Institution
Unit

OWNED BY MANAGEMENT.

ACADEMIC DATA:

Subject
Curriculum
Lesson
Assessment
Grade
Leger
Report Card

OWNED BY EXTERNAL
KBM/LEGER APPLICATION.

============================================================
21. INTEGRATION BOUNDARY
============================================================

Management
        │
        │ API
        ▼
Integration Layer
        │
        ▼
KBM / LEGER

Allowed:

- student identity
- employee identity
- unit identity
- status
- synchronization metadata

Not allowed:

Management creating
academic records directly.

============================================================
22. DUPLICATE DETECTION
============================================================

Before creating any feature:

SEARCH:

database
models
services
controllers
routes
pages
components
hooks
permissions.

If found:

REUSE.

============================================================
23. DATABASE RULE
============================================================

Every entity must have:

- primary key
- timestamps
- status where appropriate
- foreign keys
- indexes
- unique constraints where required
- audit strategy

Avoid:

- duplicate table
- duplicate entity
- orphan record
- uncontrolled cascade delete.

============================================================
24. API RULE
============================================================

Every API must support:

authentication
authorization
validation
error handling
pagination
filter
search
sorting.

============================================================
25. CRUD RULE
============================================================

CRUD must be tested end-to-end:

UI
↓
API
↓
SERVICE
↓
DATABASE
↓
RESPONSE
↓
UI

Tidak boleh hanya membuat
UI tanpa backend.

============================================================
26. PRINT RULE
============================================================

Print harus mengambil
data aktual.

Preview harus sama
dengan output.

Support:

A4
A5
F4
custom size

jika dibutuhkan.

============================================================
27. PRODUCTION RULE
============================================================

DILARANG:

dummy
mock
simulation
hardcode
fake API
fake database
placeholder production data.

============================================================
28. ERROR RULE
============================================================

Setiap module harus memiliki:

loading
success
empty
error

Error harus ditangani
tanpa merusak aplikasi.

============================================================
29. SECURITY RULE
============================================================

Semua endpoint harus
memeriksa:

Authentication
Authorization
Permission
Validation.

Tidak boleh hanya
mengandalkan frontend.

============================================================
30. FINAL MENU
============================================================

DASHBOARD

MASTER DATA

KEPEGAWAIAN

ABSENSI

KARTU & IDENTITAS

TATA USAHA

DOKUMEN & ARSIP

INVENTARIS

KEUANGAN

LAPORAN

NOTIFIKASI

AUDIT & COMPLIANCE

PENGATURAN

============================================================
31. FORBIDDEN MENU
============================================================

JANGAN ADA:

AKADEMIK
KBM
KURIKULUM
MATA PELAJARAN
PENILAIAN
NILAI
KKM
LEGER
RAPOR
TRANSKRIP.

============================================================
32. PRODUCTION VALIDATION
============================================================

Sebelum release:

[ ] Semua menu aktif
[ ] Tidak ada broken route
[ ] Tidak ada duplicate module
[ ] Tidak ada duplicate API
[ ] Tidak ada duplicate table
[ ] CRUD bekerja
[ ] RBAC bekerja
[ ] Audit bekerja
[ ] QR bekerja
[ ] GPS bekerja
[ ] Print bekerja
[ ] PDF bekerja
[ ] DOCX bekerja
[ ] Database konsisten
[ ] API konsisten
[ ] No dummy
[ ] No simulation
[ ] Build berhasil
[ ] Typecheck berhasil
[ ] Lint berhasil

============================================================
33. FINAL PRINCIPLE
============================================================

MANAGEMENT APPLICATION
=
ADMINISTRASI + OPERASIONAL

LEGER/KBM APPLICATION
=
AKADEMIK

JANGAN MENCAMPURKAN
KEDUA DOMAIN.

# END DOCUMENT