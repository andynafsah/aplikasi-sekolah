# 138_ENTERPRISE_EMPLOYEE_MANAGEMENT_ENGINE.md

# ENTERPRISE EMPLOYEE MANAGEMENT ENGINE
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: EMPLOYEE / TEACHER / STAFF / SECURITY MANAGEMENT

============================================================
1. OBJECTIVE
============================================================

Membangun satu Employee Management Engine
sebagai sumber data resmi untuk:

- Guru
- Karyawan
- Staff TU
- Security
- Bendahara
- Operator
- Kepala/Pimpinan
- Tenaga administrasi
- Pegawai lainnya

Semua data kepegawaian harus
menggunakan Employee Engine.

============================================================
2. ABSOLUTE RULE
============================================================

JANGAN membuat:

Teacher Engine terpisah
Staff Engine terpisah
Security Engine terpisah
TU Engine terpisah

untuk menyimpan identitas orang
yang sebenarnya sama.

Gunakan:

EMPLOYEE
↓
POSITION
↓
ROLE
↓
USER
↓
PERMISSION

============================================================
3. DOMAIN BOUNDARY
============================================================

EMPLOYEE ENGINE MENANGANI:

Identity
Employment
Position
Status
Organization
Documents
Cards
Account relationship
Attendance relationship
Employment history

EMPLOYEE ENGINE TIDAK MENANGANI:

KBM
Kurikulum
Mata pelajaran
Nilai
Penilaian
Leger
Rapor
Jadwal akademik

============================================================
4. EMPLOYEE ARCHITECTURE
============================================================

                    EMPLOYEE
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     POSITION       DOCUMENT         CARD
        │              │              │
        ↓              ↓              ↓
      ROLE           ARCHIVE          QR
        │
        ↓
      USER
        │
        ↓
    PERMISSION
        │
        ↓
   APPLICATION

============================================================
5. EMPLOYEE IDENTITY
============================================================

Data minimal:

id
employee_number
name
nik
nip
niy
nuptk
gender
birth_place
birth_date
phone
email
address
photo
status
join_date
unit_id

Gunakan field yang memang
tersedia pada schema existing.

Jangan menambahkan field
tanpa kebutuhan.

============================================================
6. EMPLOYEE NUMBER
============================================================

employee_number adalah
identifier internal.

Harus:

UNIQUE
STABLE
NON-REUSABLE

Jangan mengubah employee_number
secara sembarangan setelah
employee memiliki transaksi.

============================================================
7. NIP
============================================================

NIP adalah identifier
kepegawaian.

NIP:

boleh NULL
jika memang tidak dimiliki.

Jangan mengisi:

000000
123456
DUMMY

untuk production.

============================================================
8. NIY
============================================================

NIY dapat digunakan
untuk pegawai yayasan/lembaga
jika memang diterapkan.

Harus mengikuti
format lembaga yang sebenarnya.

============================================================
9. NUPTK
============================================================

NUPTK bersifat optional.

Jika tersedia:

VALIDATE
STORE
SEARCH
DISPLAY

Jika tidak:

NULL.

============================================================
10. NIK
============================================================

NIK harus divalidasi.

Jangan menjadikan
NIK sebagai primary key
jika existing architecture
menggunakan internal ID.

============================================================
11. EMPLOYEE STATUS
============================================================

Gunakan status standar:

ACTIVE
INACTIVE
CONTRACT
PERMANENT
HONORARY
RETIRED
RESIGNED
TERMINATED

Gunakan enum existing
jika sudah tersedia.

============================================================
12. EMPLOYMENT TYPE
============================================================

Pisahkan:

STATUS

dengan:

TYPE.

Contoh TYPE:

FULL_TIME
PART_TIME
CONTRACT
HONORARY
VOLUNTEER

Jangan mencampurkan
employment status dan
employment type.

============================================================
13. POSITION MASTER
============================================================

Position:

id
code
name
description
status

Contoh:

KEPALA
GURU
TU
BENDAHARA
SECURITY
OPERATOR
STAFF

============================================================
14. EMPLOYEE POSITION
============================================================

Relationship:

Employee
↓
EmployeePosition
↓
Position

Support:

primary position
secondary position
effective date
end date

Jika existing architecture
lebih sederhana:

Employee
→ Position

gunakan yang sudah ada.

============================================================
15. POSITION HISTORY
============================================================

Perubahan jabatan
harus dapat dilacak.

Contoh:

Guru
↓
Wakil Kepala
↓
Kepala

History:

old_position
new_position
effective_date
actor
reason

============================================================
16. UNIT ASSIGNMENT
============================================================

Employee harus dapat
ditugaskan ke unit.

Contoh:

Yayasan
↓
PKBM
↓
Unit A

Employee
→ Unit A

============================================================
17. MULTI UNIT ASSIGNMENT
============================================================

Jika diperlukan:

Employee
↓
EmployeeUnit
↓
Unit

dengan:

is_primary
start_date
end_date

Jangan membuat
employee duplicate
untuk setiap unit.

============================================================
18. PERSONAL DATA
============================================================

Profile:

full_name
nickname
gender
birth_place
birth_date
religion jika memang
dibutuhkan oleh lembaga
marital status jika diperlukan

Jangan mengumpulkan
data yang tidak diperlukan.

============================================================
19. CONTACT DATA
============================================================

phone
mobile_phone
email

Pastikan format
dinormalisasi.

============================================================
20. ADDRESS
============================================================

Gunakan existing
Address structure.

Jika belum ada:

buat satu standard
Address abstraction.

Jangan membuat:

employee_address
teacher_address
security_address

jika semuanya
merupakan entity yang sama.

============================================================
21. PHOTO
============================================================

Support:

upload
preview
replace
delete

Foto harus:

compressed
validated
securely stored.

============================================================
22. EMPLOYEE DOCUMENT
============================================================

Dokumen:

KTP
KK
Ijazah
SK
Surat tugas
Kontrak
Sertifikat
Dokumen lainnya

Relationship:

Employee
↓
Document

Gunakan Document Engine
existing.

JANGAN membuat
employee_document_storage
kedua.

============================================================
23. EMPLOYMENT DOCUMENT
============================================================

Jenis:

SK Pengangkatan
SK Jabatan
Kontrak
Surat Tugas
Surat Pernyataan
Dokumen kepegawaian lainnya

Semua harus dapat
terhubung ke employee.

============================================================
24. CARD
============================================================

Employee dapat memiliki:

Employee Card
QR Code
Barcode

Gunakan Card Engine existing.

JANGAN membuat
employee_qr_engine baru.

============================================================
25. QR CODE
============================================================

QR harus:

unique
secure
revocable
auditable.

JANGAN encode
informasi sensitif
secara langsung.

============================================================
26. BARCODE
============================================================

Support barcode
sesuai existing standard.

Contoh:

CODE128

Barcode harus
terhubung dengan
employee/card identity.

============================================================
27. CARD STATUS
============================================================

ACTIVE
BLOCKED
LOST
EXPIRED
REPLACED
REVOKED

============================================================
28. CARD REPLACEMENT
============================================================

Flow:

LOST CARD
↓
BLOCK/REVOKE
↓
CREATE NEW CARD
↓
GENERATE NEW QR/BARCODE
↓
AUDIT

History kartu lama
tetap tersimpan.

============================================================
29. USER ACCOUNT
============================================================

Employee tidak otomatis
menjadi User.

Relationship:

Employee
↓
User

User digunakan
untuk login.

============================================================
30. USER CREATION
============================================================

Flow:

EMPLOYEE
↓
CREATE USER
↓
SET ROLE
↓
SET PERMISSION
↓
ACTIVATE ACCOUNT

Tidak boleh membuat
user tanpa employee
jika business rule
mensyaratkannya.

============================================================
31. USER DEACTIVATION
============================================================

Jika employee keluar:

Employee
→ INACTIVE

User:
→ DISABLE

Kartu:
→ REVOKE/BLOCK

Sesuai policy.

============================================================
32. ROLE
============================================================

Role contoh:

SUPER_ADMIN
ADMIN
TU
GURU
SECURITY
BENDAHARA
OPERATOR
PIMPINAN
STAFF

Role harus berasal
dari RBAC system existing.

============================================================
33. PERMISSION
============================================================

Contoh:

employee.view
employee.create
employee.update
employee.archive

employee.document.view
employee.document.upload

employee.card.view
employee.card.generate
employee.card.revoke

attendance.view
attendance.scan

============================================================
34. ROLE ≠ POSITION
============================================================

POSITION:

jabatan organisasi.

ROLE:

akses aplikasi.

Contoh:

Employee:
Jabatan = Guru

User:
Role = GURU

Tetapi:

Employee:
Jabatan = Kepala

User:
Role = PIMPINAN

Jangan menganggap
position otomatis sama
dengan application role
jika business rule
tidak menetapkannya.

============================================================
35. SECURITY EMPLOYEE
============================================================

Security adalah:

Employee
+
Position = SECURITY
+
User jika membutuhkan
login aplikasi.

Security dapat memiliki
permission:

attendance.scan
student.lookup
attendance.manual

sesuai policy.

============================================================
36. TEACHER EMPLOYEE
============================================================

Guru adalah:

Employee
+
Position = GURU.

Tidak boleh dibuat:

teacher_master

jika identity sudah
berasal dari Employee.

============================================================
37. TU EMPLOYEE
============================================================

TU:

Employee
+
Position = TU
+
Role = TU

jika memiliki account.

============================================================
38. BENDAHARA
============================================================

Bendahara:

Employee
+
Position
+
Role = BENDAHARA

Finance permission
ditentukan RBAC.

============================================================
39. OPERATOR
============================================================

Operator:

Employee
+
User
+
Role = OPERATOR

Tidak otomatis
mendapat seluruh
permission system.

============================================================
40. EMPLOYEE SEARCH
============================================================

Search:

name
employee_number
NIK
NIP
NIY
NUPTK
phone
email
QR
barcode.

============================================================
41. EMPLOYEE FILTER
============================================================

Filter:

unit
position
status
employment type
join date

============================================================
42. EMPLOYEE LIST
============================================================

List harus mendukung:

search
filter
sort
pagination
column visibility
export.

============================================================
43. EMPLOYEE DETAIL
============================================================

Detail:

Profil
Jabatan
Unit
Dokumen
Kartu
QR
Absensi
Akun
Riwayat

Tidak menampilkan
data akademik.

============================================================
44. EMPLOYEE CRUD
============================================================

CREATE
↓
VALIDATE
↓
DUPLICATE CHECK
↓
SAVE
↓
AUDIT

UPDATE
↓
VALIDATE
↓
SAVE
↓
AUDIT

ARCHIVE
↓
VALIDATE
↓
AUDIT

============================================================
45. DELETE POLICY
============================================================

Employee yang sudah
memiliki:

attendance
salary
finance
document
letter
audit

tidak boleh di-hard-delete
sembarangan.

Gunakan:

INACTIVE
ARCHIVED
TERMINATED

sesuai business rule.

============================================================
46. EMPLOYEE HISTORY
============================================================

History dapat mencatat:

created
updated
position changed
unit changed
status changed
card generated
card revoked
document uploaded
account created
account disabled.

============================================================
47. AUDIT LOG
============================================================

Audit:

actor
action
entity
entity_id
old_value
new_value
timestamp
IP/device jika policy
mengizinkan.

============================================================
48. DATA VALIDATION
============================================================

Validasi:

name
NIK
NIP
NIY
NUPTK
phone
email
birth_date
unit
position
status.

============================================================
49. DUPLICATE DETECTION
============================================================

Potential duplicate:

same NIK
same NIP
same NIY
same NUPTK
same phone
same email

Tampilkan warning.

Jangan auto-merge.

============================================================
50. IMPORT
============================================================

Support:

CSV
XLSX

Flow:

UPLOAD
↓
MAP COLUMN
↓
VALIDATE
↓
PREVIEW
↓
DUPLICATE CHECK
↓
CONFIRM
↓
IMPORT
↓
REPORT

============================================================
51. IMPORT ERROR
============================================================

Jika terdapat:

100 records
95 valid
5 invalid

Sistem harus menampilkan
5 error secara jelas.

Jangan silent failure.

============================================================
52. BULK ACTION
============================================================

Support:

bulk activate
bulk deactivate
bulk assign unit
bulk assign position
bulk card generation
bulk export

Semua wajib:

permission
confirmation
audit.

============================================================
53. EMPLOYEE CARD PRINT
============================================================

Support:

single print
bulk print
preview
PDF

Ukuran mengikuti
Card Engine existing.

============================================================
54. QR PRINT
============================================================

Support:

single QR
bulk QR
QR sheet
employee card.

QR yang revoked
tidak boleh dicetak
sebagai kartu aktif.

============================================================
55. ATTENDANCE DEPENDENCY
============================================================

Employee Attendance
HARUS mengambil:

employee_id

dari Employee Engine.

Tidak boleh menggunakan:

teacher_id
staff_id
security_id

sebagai master identity
terpisah jika semuanya
adalah employee.

============================================================
56. GPS ATTENDANCE
============================================================

Employee dapat melakukan
GPS attendance jika
permission tersedia.

Frontend:

GPS
↓
LATITUDE
LONGITUDE
ACCURACY
TIMESTAMP

Backend:

AUTH
↓
EMPLOYEE VALIDATION
↓
GEOFENCE
↓
TIME VALIDATION
↓
DUPLICATE CHECK
↓
SAVE
↓
AUDIT

============================================================
57. BARCODE ATTENDANCE
============================================================

Employee barcode:

SCAN
↓
IDENTIFY CARD
↓
IDENTIFY EMPLOYEE
↓
VALIDATE CARD
↓
VALIDATE ATTENDANCE
↓
SAVE
↓
AUDIT

============================================================
58. MANUAL ATTENDANCE
============================================================

Manual attendance
hanya dapat dilakukan
oleh role yang memiliki
permission.

Contoh:

Guru
Security
TU
Admin

sesuai policy.

============================================================
59. ATTENDANCE CORRECTION
============================================================

Correction:

old status
new status
reason
actor
timestamp

Tidak boleh menghapus
history secara diam-diam.

============================================================
60. PAYROLL DEPENDENCY
============================================================

Jika payroll tersedia:

Payroll
→ Employee

Bukan:

Payroll
→ Teacher

dan:

Payroll
→ Staff

secara terpisah.

============================================================
61. FINANCE DEPENDENCY
============================================================

Finance transaction
yang berkaitan dengan
pegawai menggunakan:

employee_id.

============================================================
62. LETTER DEPENDENCY
============================================================

Surat menggunakan:

employee_id

untuk:

surat tugas
SK
surat pengangkatan
surat keterangan
surat lainnya.

============================================================
63. DOCUMENT DEPENDENCY
============================================================

Document Engine
menggunakan:

owner_type
owner_id

atau relationship
existing.

Jangan membuat
document table baru.

============================================================
64. NOTIFICATION
============================================================

Employee dapat menjadi
notification recipient.

Gunakan User/Employee
relationship existing.

============================================================
65. REPORT
============================================================

Report employee:

jumlah pegawai
guru
karyawan
security
TU
aktif
nonaktif
berdasarkan unit
berdasarkan jabatan.

Tidak boleh menampilkan
laporan akademik.

============================================================
66. DASHBOARD
============================================================

Employee dashboard
dapat menampilkan:

Total Employee
Active
Inactive
Guru
Staff
Security
New Employee

Semua data aktual.

============================================================
67. API
============================================================

Gunakan existing
API architecture.

Contoh:

GET /employees
GET /employees/:id
POST /employees
PATCH /employees/:id
POST /employees/:id/archive

JANGAN membuat
endpoint duplicate.

============================================================
68. API AUTHORIZATION
============================================================

Backend wajib memeriksa:

authentication
role
permission
ownership
unit scope.

============================================================
69. UNIT SCOPE
============================================================

Jika user hanya boleh
melihat employee unit
tertentu:

backend harus menerapkan
scope tersebut.

Frontend filtering
tidak cukup.

============================================================
70. DATA ISOLATION
============================================================

Employee unit A
tidak boleh otomatis
dapat mengakses
employee unit B
jika permission tidak
mengizinkan.

============================================================
71. DATABASE INTEGRITY
============================================================

Pastikan:

FK valid
unique constraint
index
nullable
cascade policy
soft delete policy.

============================================================
72. INDEX
============================================================

Index sesuai kebutuhan:

employee_number
NIK
NIP
NIY
NUPTK
unit_id
status
position_id

Jangan membuat
index berlebihan.

============================================================
73. TRANSACTION
============================================================

Atomic operation:

Employee
+
Position
+
User
+
Card

harus transaction
jika dibuat bersamaan.

============================================================
74. IDEMPOTENCY
============================================================

Operasi:

card generation
user creation
attendance

harus aman terhadap
duplicate request.

============================================================
75. CONCURRENCY
============================================================

Cegah:

duplicate employee_number
duplicate NIK
duplicate NIP
duplicate card
duplicate active QR.

============================================================
76. SECURITY
============================================================

Sensitive data:

NIK
NIP
personal address
documents

harus memiliki
access control.

============================================================
77. FILE SECURITY
============================================================

Employee document:

AUTH
↓
PERMISSION
↓
OWNER CHECK
↓
DOWNLOAD

Tidak boleh public
secara default.

============================================================
78. PRIVACY
============================================================

Jangan tampilkan
seluruh NIK pada
interface umum.

Gunakan masking
jika diperlukan.

============================================================
79. API RESPONSE SECURITY
============================================================

Jangan mengirim
field sensitif
jika tidak dibutuhkan.

============================================================
80. FRONTEND FORM
============================================================

Form employee:

Data Pribadi
Data Identitas
Kontak
Alamat
Kepegawaian
Unit
Jabatan
Dokumen
Kartu

Gunakan section/tab
agar tidak terlalu panjang.

============================================================
81. FORM UX
============================================================

Support:

draft
validation
loading
error
success
cancel
unsaved changes.

============================================================
82. DETAIL UX
============================================================

Employee detail harus
memiliki:

summary card
status badge
position
unit
quick actions
tabs.

============================================================
83. QUICK ACTION
============================================================

Contoh:

Edit
Generate Card
Generate QR
Upload Document
View Attendance
Create User
Deactivate

Permission-aware.

============================================================
84. EMPTY STATE
============================================================

Jika belum ada
dokumen:

"Belum ada dokumen."

Jika belum ada card:

"Kartu belum dibuat."

Jangan gunakan dummy.

============================================================
85. ERROR STATE
============================================================

Tampilkan:

API error
validation
permission
network
server.

Jangan tampilkan
stack trace.

============================================================
86. LOADING
============================================================

Gunakan skeleton/loading
untuk:

list
detail
form
document
card
attendance.

============================================================
87. SEARCH PERFORMANCE
============================================================

Search harus server-side
untuk data besar.

Gunakan debounce
pada frontend.

============================================================
88. CACHE
============================================================

Gunakan cache/query
sesuai existing architecture.

Setelah update:

invalidate employee queries.

============================================================
89. QUERY CLIENT
============================================================

Pastikan seluruh
employee hooks berjalan
di bawah:

QueryClientProvider.

Jangan membuat
QueryClient lokal.

============================================================
90. TESTING
============================================================

Unit test:

validation
service
permission
duplicate detection.

Integration:

CRUD
card
QR
user
attendance.

E2E:

login
employee creation
card
attendance.

============================================================
91. PRODUCTION TEST
============================================================

Test:

CREATE employee
UPDATE employee
ARCHIVE employee
GENERATE CARD
REVOKE CARD
CREATE USER
DISABLE USER
QR SCAN
GPS ATTENDANCE
MANUAL ATTENDANCE
DOCUMENT UPLOAD
EXPORT.

============================================================
92. NO DUMMY DATA
============================================================

Production:

NO DUMMY EMPLOYEE
NO DUMMY TEACHER
NO DUMMY SECURITY
NO DUMMY CARD
NO DUMMY QR
NO DUMMY ATTENDANCE

============================================================
93. NO DUPLICATE ENGINE
============================================================

JANGAN BUAT:

teacher-management
staff-management
security-management

jika hanya berbeda
pada position.

Gunakan Employee Engine.

============================================================
94. EXCEPTION
============================================================

Boleh membuat
domain-specific service
jika memang business logic
berbeda.

Contoh:

SecurityAttendancePolicy

Tetapi identity tetap:

Employee.

============================================================
95. MASTER RELATIONSHIP
============================================================

Employee
│
├── Unit
├── Position
├── User
├── Card
├── QR
├── Documents
├── Attendance
├── Finance
├── Letters
└── Audit

Semua relationship
harus menggunakan
existing schema.

============================================================
96. FINAL EMPLOYEE FLOW
============================================================

CREATE EMPLOYEE
↓
VALIDATE
↓
DUPLICATE CHECK
↓
ASSIGN UNIT
↓
ASSIGN POSITION
↓
SAVE
↓
AUDIT
↓
OPTIONAL CREATE USER
↓
OPTIONAL CREATE CARD
↓
OPTIONAL GENERATE QR
↓
READY FOR ATTENDANCE

============================================================
97. EXIT EMPLOYEE FLOW
============================================================

EMPLOYEE EXIT
↓
CHANGE STATUS
↓
DISABLE USER
↓
REVOKE CARD
↓
REVOKE QR
↓
PRESERVE HISTORY
↓
AUDIT

============================================================
98. EMPLOYEE HEALTH CHECK
============================================================

[ ] Employee identity valid
[ ] No duplicate identifier
[ ] Unit valid
[ ] Position valid
[ ] Status valid
[ ] Documents valid
[ ] Card valid
[ ] QR valid
[ ] User relationship valid
[ ] Permission valid
[ ] Attendance relationship valid
[ ] Finance relationship valid
[ ] Letter relationship valid
[ ] Audit available

============================================================
99. FINAL ARCHITECTURE RULE
============================================================

EMPLOYEE IS THE
SINGLE SOURCE OF TRUTH
FOR ALL STAFF IDENTITIES.

TEACHER
= EMPLOYEE

SECURITY
= EMPLOYEE

TU
= EMPLOYEE

BENDAHARA
= EMPLOYEE

OPERATOR
= EMPLOYEE

STAFF
= EMPLOYEE

ROLE CONTROLS ACCESS.

POSITION DEFINES ORGANIZATIONAL
FUNCTION.

============================================================
100. FINAL COMMAND
============================================================

AUDIT EXISTING EMPLOYEE ENGINE FIRST.

REUSE EXISTING TABLE.

REUSE EXISTING MODEL.

REUSE EXISTING API.

REUSE EXISTING SERVICE.

REUSE EXISTING COMPONENT.

DO NOT CREATE DUPLICATE EMPLOYEE ENGINE.

DO NOT CREATE TEACHER MASTER DUPLICATE.

DO NOT CREATE SECURITY MASTER DUPLICATE.

DO NOT CREATE STAFF MASTER DUPLICATE.

DO NOT CREATE SECOND CARD ENGINE.

DO NOT CREATE SECOND QR ENGINE.

DO NOT CREATE ACADEMIC ENGINE.

DO NOT CREATE KBM ENGINE.

DO NOT CREATE LEGER ENGINE.

DO NOT CREATE RAPOR ENGINE.

NO DUMMY PRODUCTION DATA.

NO HARDCODED PRODUCTION DATA.

NO BROKEN RELATION.

NO DUPLICATE IDENTITY.

PRODUCTION READY.

# END ENTERPRISE EMPLOYEE MANAGEMENT ENGINE