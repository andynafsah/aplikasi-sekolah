# 153 — ENTERPRISE SYSTEM SOURCE OF TRUTH RECONCILIATION

## MASTER PROMPT

JANGAN MEMBUAT FITUR BARU.

JANGAN MEMBUAT MODUL BARU.

JANGAN MEMBUAT DATABASE BARU.

JANGAN MEMBUAT MIGRATION.

JANGAN MENGHAPUS DATA.

JANGAN MENGHAPUS KODE.

JANGAN REFACTOR BESAR.

TUGAS HANYA:

MEMETAKAN DAN MENENTUKAN
SOURCE OF TRUTH SELURUH APLIKASI.

==================================================
1. TUJUAN
==================================================

Setelah audit dan consolidation,
tentukan satu sumber data dan
satu business logic utama untuk
setiap domain.

Tidak boleh satu domain memiliki
dua sumber kebenaran.

==================================================
2. DOMAIN UTAMA
==================================================

Petakan:

ORGANIZATION
UNIT
USER
ROLE
PERMISSION

STUDENT
PARENT
EMPLOYEE
TEACHER

ATTENDANCE

STUDENT CARD
QR
LOCATION

SCHEDULE
CALENDAR
HOLIDAY

DOCUMENT
LETTER
ARCHIVE

FINANCE
PAYMENT
SPP

HR
POSITION
CONTRACT
LEAVE
PAYROLL

INVENTORY
ASSET

NOTIFICATION

REPORT
EXPORT
PDF
WORD.

==================================================
3. SOURCE OF TRUTH MATRIX
==================================================

Untuk setiap domain buat:

| Domain | Primary Model | Primary Service | Primary API | Primary UI |
|---|---|---|---|---|

Jangan menentukan berdasarkan
nama file saja.

Gunakan:

database relation
API usage
service dependency
frontend usage
tests.

==================================================
4. DATABASE
==================================================

Untuk setiap entity tentukan:

PRIMARY TABLE
LEGACY TABLE
DUPLICATE TABLE
EXTENSION TABLE.

Contoh:

Student
↓
students

Jika ditemukan:

student_profiles

tentukan apakah:

extension
atau duplicate.

Jangan menghapus.

==================================================
5. BUSINESS LOGIC
==================================================

Untuk setiap domain tentukan
satu CORE SERVICE.

Contoh:

Attendance
→ smartAttendanceService

Schedule
→ ScheduleEngineService

Notification
→ NotificationService.

Jika ada:

ServiceA
ServiceB
ServiceC

yang menjalankan logic sama:

tentukan PRIMARY.

==================================================
6. API
==================================================

Setiap business capability
harus mempunyai canonical API.

Contoh:

POST /check-in

Jika ada:

/checkIn
/check-in

tentukan:

PRIMARY
LEGACY ALIAS.

==================================================
7. FRONTEND
==================================================

Untuk setiap fitur:

PRIMARY SCREEN
SECONDARY SCREEN
LEGACY SCREEN
DUPLICATE SCREEN.

Jika dua screen memiliki
fungsi sama:

tentukan PRIMARY.

==================================================
8. ROLE ACCESS
==================================================

Setiap domain harus memiliki:

VIEW
CREATE
UPDATE
DELETE
APPROVE
EXPORT
MANAGE

sesuai kebutuhan.

Jangan membuat permission
yang duplicate.

==================================================
9. DATA FLOW
==================================================

Dokumentasikan:

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

Jika ada:

UI
↓
Service A
↓
Database

dan:

UI
↓
Service B
↓
Database

untuk fungsi yang sama:

MARK DUPLICATE.

==================================================
10. FRONTEND STATE
==================================================

Audit:

Provider
Bloc
Riverpod
Redux
Context
Local state
Query cache.

Pastikan tidak ada
dua state source untuk
data yang sama tanpa alasan.

==================================================
11. CACHE
==================================================

Tentukan:

DATABASE
CACHE
LOCAL STORAGE

mana source of truth.

Rule:

CACHE ≠ SOURCE OF TRUTH.

==================================================
12. FILE STORAGE
==================================================

Tentukan satu:

PRIMARY STORAGE.

Jika ada:

local
MinIO
S3
cloud

jelaskan:

primary
backup
temporary.

==================================================
13. DOCUMENT
==================================================

Tentukan:

Document
↓
Template
↓
Renderer
↓
PDF/Word
↓
Storage.

Jangan ada dua renderer
dengan hasil berbeda.

==================================================
14. STUDENT
==================================================

Tentukan:

Student master
↓
Student profile
↓
Student document
↓
Student card
↓
QR identity.

QR bukan database
student kedua.

==================================================
15. EMPLOYEE
==================================================

Tentukan:

Employee master
↓
User account
↓
Role
↓
Attendance.

Jangan membuat employee
master kedua khusus
attendance.

==================================================
16. TEACHER
==================================================

Jika Teacher merupakan
subset/role dari Employee:

gunakan architecture existing.

Jangan membuat Teacher
identity kedua jika
tidak diperlukan.

==================================================
17. ATTENDANCE
==================================================

Pastikan:

Student
Employee
Teacher
Security

semuanya menggunakan:

ATTENDANCE CORE.

Method:

QR
GPS
MANUAL

bukan database terpisah.

==================================================
18. SCHEDULE
==================================================

Pastikan:

Calendar
↓
Schedule
↓
Assignment
↓
Attendance.

Jangan ada attendance
yang memiliki schedule
logic sendiri.

==================================================
19. REPORT
==================================================

Report hanya membaca
source domain.

Report tidak boleh
menciptakan business
transaction baru.

==================================================
20. EXPORT
==================================================

Export:

PDF
Excel
CSV
Word

harus menggunakan
data dari report/domain
yang sama.

==================================================
21. DASHBOARD
==================================================

Dashboard tidak boleh
menghitung ulang
business logic.

Dashboard:

QUERY
AGGREGATE
DISPLAY.

==================================================
22. NOTIFICATION
==================================================

Notification menerima
event dari domain.

Contoh:

Attendance Created
↓
Notification.

Notification tidak
membuat attendance.

==================================================
23. AUDIT
==================================================

Audit menerima event
dari domain.

Audit tidak mengubah
business data.

==================================================
24. TRANSACTION
==================================================

Domain transaction
harus berada pada
service/business layer.

Jangan membuat
transaction logic
terpisah di UI.

==================================================
25. CRUD SOURCE
==================================================

Untuk setiap CRUD:

CREATE → PRIMARY SERVICE
READ → PRIMARY QUERY
UPDATE → PRIMARY SERVICE
DELETE → PRIMARY SERVICE.

Jangan memiliki:

CreateServiceA
CreateServiceB

untuk entity yang sama.

==================================================
26. DELETE POLICY
==================================================

Tentukan per entity:

HARD DELETE
SOFT DELETE
ARCHIVE
IMMUTABLE.

Jangan setiap modul
memiliki aturan berbeda
tanpa alasan.

==================================================
27. HISTORICAL DATA
==================================================

Tentukan entity yang
tidak boleh diubah
setelah menjadi histori.

Contoh:

attendance
financial transaction
audit log.

==================================================
28. CROSS-MODULE RELATION
==================================================

Petakan:

Student
→ Attendance

Employee
→ Attendance

Organization
→ Unit

Unit
→ Student

Unit
→ Employee

User
→ Employee

User
→ Role.

Pastikan tidak ada
relasi duplicate.

==================================================
29. API CONTRACT
==================================================

Untuk setiap canonical API:

Request
Response
Validation
Permission
Error.

Frontend harus menggunakan
contract tersebut.

==================================================
30. ERROR SOURCE
==================================================

Backend menjadi
source of truth
untuk business error.

Frontend hanya
menampilkan.

==================================================
31. CONFIGURATION
==================================================

Tentukan:

DATABASE CONFIG
SYSTEM CONFIG
ORGANIZATION CONFIG
UNIT CONFIG
USER CONFIG.

Jangan hardcode configuration
di frontend.

==================================================
32. MULTI-UNIT
==================================================

Setiap data yang memang
berhubungan dengan unit
harus memiliki scope
yang benar.

Jangan menggunakan
global query tanpa
authorization.

==================================================
33. RBAC
==================================================

Tentukan:

ROLE
PERMISSION
SCOPE.

Jangan membuat
permission berdasarkan
nama menu saja.

==================================================
34. PRODUCTION
==================================================

Cari:

dummy
mock
simulation
seed demo
fake data
test data.

Klasifikasikan:

DEVELOPMENT
TEST
PRODUCTION.

==================================================
35. HARDCODE
==================================================

Cari semua:

nama lembaga
alamat
logo
nomor telepon
email
tahun
role
permission
jam
status.

Tentukan:

VALID CONSTANT
CONFIG
DATABASE
HARDCODE ERROR.

==================================================
36. SOURCE OF TRUTH RULE
==================================================

Jika:

DATABASE A
DATABASE B

mempunyai data yang sama:

pilih PRIMARY.

Jika:

SERVICE A
SERVICE B

menghitung hal yang sama:

pilih PRIMARY.

Jika:

UI A
UI B

melakukan fungsi sama:

pilih PRIMARY.

==================================================
37. CONSOLIDATION MAP
==================================================

Buat:

OLD
↓
PRIMARY
↓
MIGRATION/ADAPTER
↓
DEPRECATION
↓
REMOVAL

Tetapi:

JANGAN melakukan
perubahan otomatis.

==================================================
38. DEPENDENCY MAP
==================================================

Tampilkan:

MODULE
↓
SERVICE
↓
MODEL
↓
DATABASE.

Tujuan:

mengetahui dampak
jika primary implementation
diubah.

==================================================
39. RISK
==================================================

Klasifikasi:

CRITICAL
HIGH
MEDIUM
LOW.

Critical:

dua source of truth
menghasilkan data berbeda.

==================================================
40. FINAL MASTER MATRIX
==================================================

Hasilkan:

| Domain | Database | Service | API | UI | Status |
|---|---|---|---|---|---|

Status:

UNIQUE
PRIMARY
DUPLICATE
LEGACY
OVERLAP
MISSING.

==================================================
41. FINAL ARCHITECTURE
==================================================

Buat architecture:

                 APPLICATION
                      │
              ┌───────┴───────┐
              │               │
           WEB APP        FLUTTER APP
              │               │
              └───────┬───────┘
                      ↓
                   REST API
                      ↓
               DOMAIN SERVICES
                      ↓
                 DATABASE
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
       STORAGE      CACHE       AUDIT

Semua client menggunakan
business logic backend
yang sama.

==================================================
42. MOBILE
==================================================

Flutter:

UI
↓
API Client
↓
REST API.

Jangan membuat
business rules berbeda
di mobile.

==================================================
43. WEB
==================================================

Web:

UI
↓
API
↓
same backend core.

==================================================
44. FINAL VALIDATION
==================================================

Pastikan:

WEB
dan
MOBILE

menggunakan:

same API
same permissions
same database
same business rules.

==================================================
45. OUTPUT
==================================================

WAJIB keluarkan:

1. Source of Truth Matrix
2. Database Matrix
3. Service Matrix
4. API Matrix
5. UI Matrix
6. RBAC Matrix
7. Cross-module Relation Map
8. Duplicate List
9. Legacy List
10. Hardcode List
11. Dummy/Simulation List
12. Production Blockers
13. Consolidation Priority
14. Final Architecture
15. Recommended Next Step.

==================================================
46. READ ONLY
==================================================

Selama proses ini:

NO DELETE
NO MIGRATION
NO DATABASE UPDATE
NO REFACTOR
NO FEATURE CREATION.

==================================================
FINAL COMMAND
==================================================

AUDIT DAN PETAKAN SOURCE OF TRUTH
SELURUH APLIKASI.

JANGAN MEMBUAT FITUR.

JANGAN MENGUBAH CODE.

JANGAN MENGUBAH DATABASE.

JANGAN MENGHAPUS DATA.

HASIL AKHIR HARUS MENJAWAB:

"DI MANA SATU-SATUNYA TEMPAT
UNTUK SETIAP BUSINESS LOGIC
DAN DATA DALAM APLIKASI INI?"

STOP SETELAH REPORT SELESAI.

# END OF 153