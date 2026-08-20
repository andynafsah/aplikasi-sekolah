# 152 — ENTERPRISE NON-ATTENDANCE FEATURE DEDUPLICATION AUDIT

## MASTER AUDIT PROMPT

JANGAN MEMBUAT FITUR BARU.

JANGAN MEMBUAT DATABASE BARU.

JANGAN MEMBUAT MIGRATION.

JANGAN MEMBUAT API BARU.

JANGAN MEMBUAT UI BARU.

JANGAN MENGUBAH DATA.

JANGAN REFACTOR BESAR.

TUGAS HANYA AUDIT.

==================================================
# 1. TUJUAN
==================================================

Audit seluruh CODEBASE EXISTING
setelah consolidation attendance.

Tujuan:

1. menemukan fitur duplicate
2. menemukan menu duplicate
3. menemukan API duplicate
4. menemukan service duplicate
5. menemukan database duplicate
6. menemukan business logic duplicate
7. menemukan UI duplicate
8. menemukan fitur legacy
9. menemukan fitur dummy/simulasi
10. menentukan PRIMARY SOURCE OF TRUTH.

==================================================
# 2. BATASAN
==================================================

JANGAN mengaudit ulang
business logic attendance
kecuali dependency-nya.

Attendance sudah memiliki:

ATTENDANCE CORE
SCHEDULE
QR
GPS
MANUAL
CORRECTION
REPORT
NOTIFICATION.

Jangan membuat versi kedua.

==================================================
# 3. MODUL YANG WAJIB DIAUDIT
==================================================

MASTER DATA

ORGANIZATION
UNIT
STUDENT
EMPLOYEE
TEACHER
PARENT/GUARDIAN
USER
ROLE
PERMISSION

ADMINISTRATION

TATA USAHA
SURAT
DOKUMEN
ARSIP
DISPOSISI
AGENDA

FINANCE

PAYMENT
SPP
INVOICE
RECEIPT
FINANCIAL REPORT

HR

EMPLOYEE
TEACHER
CONTRACT
LEAVE
PAYROLL
POSITION

STUDENT MANAGEMENT

REGISTRATION
ADMISSION
STUDENT PROFILE
STUDENT DOCUMENT
STUDENT CARD
QR ID

COMMUNICATION

NOTIFICATION
ANNOUNCEMENT
MESSAGING

FACILITY

ROOM
BUILDING
ASSET
INVENTORY

REPORT

DASHBOARD
EXPORT
PDF
EXCEL
PRINT.

==================================================
# 4. EXCLUDE
==================================================

JANGAN membuat:

KBM
LEGER
RAPOR
NILAI
CURRICULUM ENGINE

karena aplikasi ini memang
tidak menggunakan modul tersebut
sebagai core.

Jika ditemukan:

MARK AS EXCLUDED / LEGACY.

==================================================
# 5. MASTER DATA AUDIT
==================================================

Cari seluruh implementasi:

Student
Employee
Teacher
Unit
Organization
Department
Position.

Jika terdapat model:

Student
Students
StudentProfile

tentukan apakah:

PRIMARY
EXTENSION
DUPLICATE.

==================================================
# 6. PERSON ARCHITECTURE
==================================================

Periksa apakah:

Student
Employee
Teacher
Parent

memiliki identity architecture
yang konsisten.

Jangan membuat person engine
baru jika existing sudah benar.

==================================================
# 7. USER VS EMPLOYEE
==================================================

Bedakan:

User
dengan
Employee/Teacher.

User:

authentication identity.

Employee:

organizational identity.

Jangan membuat duplicate
account/person system.

==================================================
# 8. RBAC
==================================================

Audit:

Role
Permission
Policy
Scope
Middleware
Guard.

Pastikan hanya ada
SATU authorization architecture.

==================================================
# 9. TATA USAHA
==================================================

Audit semua fitur TU:

surat
dokumen
arsip
disposisi
agenda
administrative workflow.

Cari duplicate:

LetterService
DocumentService
ArchiveService
AdministrativeService.

==================================================
# 10. SURAT
==================================================

Cari seluruh:

Letter
OfficialLetter
DocumentLetter
OutgoingLetter
IncomingLetter.

Tentukan:

incoming
outgoing
internal
official document.

Jangan membuat
LetterEngine kedua.

==================================================
# 11. DOCUMENT ENGINE
==================================================

Audit:

PDF
Word
Print
Preview
Download
Template
Letterhead.

Semua harus menggunakan
satu document generation
architecture jika existing
sudah tersedia.

==================================================
# 12. KOP SURAT
==================================================

Audit apakah kop surat
berasal dari:

Organization
Unit
Institution settings.

Jangan hardcode:

nama sekolah
alamat
logo
NPSN
telepon.

==================================================
# 13. STUDENT CARD
==================================================

Audit student card:

Student ID
QR
Barcode
Photo
Template.

Jangan membuat QR student
engine kedua.

Attendance hanya
mengonsumsi identity QR.

==================================================
# 14. STUDENT DOCUMENT
==================================================

Audit:

KK
Akta
Ijazah
KTP orang tua
foto
dokumen lainnya.

Jangan membuat document
storage kedua.

==================================================
# 15. FINANCE
==================================================

Cari duplicate:

Payment
SPP
Invoice
Receipt
Transaction.

Tentukan:

financial source of truth.

Jangan ada dua
transaction engine.

==================================================
# 16. HR
==================================================

Audit:

employee
position
department
contract
leave
payroll.

Pastikan employee master
tidak duplicate dengan
employee pada attendance.

==================================================
# 17. NOTIFICATION
==================================================

Cari seluruh:

NotificationService
PushNotificationService
AlertService
AnnouncementService.

Pisahkan:

Notification
vs
Announcement

jika memang konsep berbeda.

Tetapi jangan membuat
notification engine kedua.

==================================================
# 18. INVENTORY
==================================================

Cari:

Asset
Inventory
Stock
Item.

Tentukan ownership:

Asset Management
atau
Inventory.

Jika overlap:

MARK OVERLAP.

==================================================
# 19. REPORT
==================================================

Audit:

Dashboard
Report
Export
PDF
Excel.

Pastikan report tidak
mempunyai business logic
yang berbeda dari core module.

==================================================
# 20. PDF / WORD
==================================================

Cari seluruh:

PdfService
WordService
PrintService
ExportService.

Tentukan:

PRIMARY
ADAPTER
DUPLICATE.

==================================================
# 21. DUMMY DATA
==================================================

Cari:

seed
fixture
mock
demo
sample
fake
dummy
simulation.

Pisahkan:

DEVELOPMENT ONLY
PRODUCTION DATA
DUMMY.

Production application
tidak boleh menampilkan
dummy data.

==================================================
# 22. SIMULATION
==================================================

Cari:

simulation
simulate
test attendance
fake GPS
fake QR
demo mode.

Semua yang digunakan
production harus
ditandai.

Jangan menghapus test
automation.

==================================================
# 23. FRONTEND
==================================================

Cari duplicate:

pages
screens
components
dialogs
modals
forms
tables.

Contoh:

StudentPage
StudentsPage
StudentManagementPage.

Tentukan PRIMARY.

==================================================
# 24. API
==================================================

Audit:

REST endpoints.

Cari:

/students
/student
/student-management

Jika fungsi sama:

tentukan canonical route.

==================================================
# 25. SERVICE
==================================================

Cari:

StudentService
StudentManagementService
StudentEngineService.

Tentukan:

CORE
ADAPTER
LEGACY
DUPLICATE.

==================================================
# 26. DATABASE
==================================================

Audit semua:

tables
models
relations
foreign keys
indexes
unique constraints.

Cari duplicate entity.

==================================================
# 27. RELATION
==================================================

Periksa:

Organization
Unit
Student
Employee
User
Parent
Document.

Pastikan relation
tidak menghasilkan
duplicate identity.

==================================================
# 28. MULTI-UNIT
==================================================

Aplikasi harus mendukung
lebih dari satu unit:

Sekolah
Pesantren
PKBM
atau unit lain
yang memang ada dalam
database existing.

Jangan hardcode satu unit.

==================================================
# 29. TENANT / ORGANIZATION
==================================================

Jika aplikasi existing
single organization:

JANGAN membuat
multi-tenant engine baru.

Pastikan architecture
tidak merusak scope
organization/unit.

==================================================
# 30. MENU
==================================================

Audit sidebar/menu.

Cari:

duplicate menu
hidden menu
orphan menu
route tanpa permission
permission tanpa menu.

==================================================
# 31. ROLE DASHBOARD
==================================================

Audit dashboard:

Super Admin
Yayasan
Kepala Sekolah
TU
Guru
Security
Karyawan
Wali Kelas
User lain.

Setiap dashboard harus
hanya menampilkan fitur
yang memang diizinkan.

==================================================
# 32. SUPER ADMIN
==================================================

Jangan menampilkan:

organization settings
role management
permission management
system configuration

kepada role biasa.

==================================================
# 33. CRUD
==================================================

Untuk setiap modul:

CREATE
READ
UPDATE
DELETE
DETAIL
SEARCH
FILTER
EXPORT.

Tentukan:

WORKING
PARTIAL
BROKEN
DUPLICATE
MISSING.

==================================================
# 34. MODAL
==================================================

Audit:

Create modal
Edit modal
Detail modal
Delete confirmation
Preview modal.

Pastikan modal tidak
hanya tampilan.

Semua action harus
terhubung ke API/database.

==================================================
# 35. DATA FLOW
==================================================

Untuk setiap modul:

UI
↓
API
↓
Controller
↓
Service
↓
Repository/ORM
↓
Database.

Cari bypass.

==================================================
# 36. HARDCODE
==================================================

Cari hardcoded:

nama lembaga
alamat
logo
nomor surat
tahun ajaran
role
permission
harga
status
unit
jam.

Jika seharusnya dinamis:

MARK HARDCODE.

==================================================
# 37. ERROR HANDLING
==================================================

Cari:

empty catch
silent failure
fake success
console-only error.

Frontend harus
menampilkan error
yang berasal dari API.

==================================================
# 38. API CONTRACT
==================================================

Pastikan frontend
dan backend menggunakan
contract yang sama.

Cari:

field mismatch
type mismatch
enum mismatch
pagination mismatch.

==================================================
# 39. CACHE
==================================================

Cari duplicate:

Redis
memory cache
local storage
provider cache.

Tentukan source of truth.

Database tetap authoritative.

==================================================
# 40. FILE STORAGE
==================================================

Audit:

local storage
S3
MinIO
Cloud storage.

Jangan membuat
file storage engine kedua.

==================================================
# 41. SECURITY
==================================================

Audit:

authentication
authorization
IDOR
scope bypass
file upload
API validation
rate limit
audit.

==================================================
# 42. PRODUCTION READINESS
==================================================

Cari:

TODO
FIXME
console.log
debug
mock
temporary
hardcoded
simulation.

Klasifikasikan:

BLOCKER
WARNING
SAFE.

==================================================
# 43. DUPLICATION MATRIX
==================================================

Hasilkan:

| Modul | Existing A | Existing B | Status | Primary |
|---|---|---|---|---|

Status:

🟢 UNIQUE
🟡 OVERLAP
🔴 DUPLICATE
⚪ LEGACY
🔵 EXCLUDED

==================================================
# 44. DATABASE MATRIX
==================================================

| Entity | Table/Model | Duplicate | Primary |
|---|---|---|---|

==================================================
# 45. API MATRIX
==================================================

| Function | Endpoint A | Endpoint B | Primary |
|---|---|---|---|

==================================================
# 46. SERVICE MATRIX
==================================================

| Business Logic | Service A | Service B | Primary |
|---|---|---|---|

==================================================
# 47. UI MATRIX
==================================================

| Feature | Screen A | Screen B | Primary |
|---|---|---|---|

==================================================
# 48. FINAL ARCHITECTURE
==================================================

Buat diagram:

UI
↓
API
↓
CORE SERVICES
↓
DATABASE

Tidak boleh:

UI
↓
DATABASE

atau:

UI A → Service A
UI B → Service B

untuk business logic
yang sama.

==================================================
# 49. CONSOLIDATION PRIORITY
==================================================

P0:
Security/Data integrity

P1:
Duplicate business logic

P2:
Duplicate database/API

P3:
Duplicate UI/menu

P4:
Dead code/cleanup.

==================================================
# 50. IMPORTANT
==================================================

AUDIT ONLY.

SETELAH AUDIT:

STOP.

JANGAN:

- refactor
- delete
- migrate
- rename
- create feature
- create table
- create API.

Tunggu instruksi berikutnya.

==================================================
# 51. FINAL REPORT
==================================================

Laporkan:

1. Total modules audited
2. Duplicate features
3. Duplicate tables
4. Duplicate APIs
5. Duplicate services
6. Duplicate UI
7. Legacy modules
8. Dummy/simulation
9. Hardcoded values
10. Security issues
11. CRUD issues
12. Broken relations
13. Missing permissions
14. Production blockers
15. Recommended consolidation order
16. Final architecture.

==================================================
FINAL COMMAND
==================================================

AUDIT SELURUH APLIKASI.

JANGAN MEMBUAT FITUR BARU.

JANGAN MENGUBAH DATABASE.

JANGAN MENGHAPUS DATA.

JANGAN MEMBUAT DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MELAKUKAN REFACTOR.

HANYA AUDIT DAN LAPORKAN.

==================================================
END OF 152
==================================================