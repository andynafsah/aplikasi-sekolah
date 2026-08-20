# 137_ENTERPRISE_MASTER_DATA_ENGINE.md

# ENTERPRISE MASTER DATA ENGINE
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: MASTER DATA / SINGLE SOURCE OF TRUTH / DATA INTEGRITY

============================================================
1. OBJECTIVE
============================================================

Bangun dan/atau rapikan Master Data sebagai
SINGLE SOURCE OF TRUTH seluruh aplikasi.

Master Data menjadi sumber utama untuk:

1. Siswa/Santri
2. Orang Tua/Wali
3. Guru
4. Karyawan
5. Lembaga
6. Unit
7. Jabatan
8. Status Kepegawaian
9. Kontak
10. Alamat
11. Identitas
12. Kartu
13. QR Code
14. Barcode
15. Dokumen identitas

Modul lain DILARANG membuat
master data duplikat.

============================================================
2. ABSOLUTE RULE
============================================================

SEBELUM MEMBUAT:

TABLE
MODEL
API
SERVICE
FORM
PAGE
HOOK
COMPONENT

WAJIB:

SEARCH EXISTING
↓
AUDIT
↓
REUSE
↓
EXTEND JIKA PERLU
↓
TEST

JANGAN:

CREATE DUPLICATE MASTER DATA.

============================================================
3. DOMAIN BOUNDARY
============================================================

MASTER DATA MENANGANI:

IDENTITAS
ORANG
UNIT
JABATAN
STATUS
KONTAK
ALAMAT
IDENTIFIER

MASTER DATA TIDAK MENANGANI:

KBM
KURIKULUM
MATA PELAJARAN
PENILAIAN
NILAI
LEGER
RAPOR

Semua domain akademik berada
di aplikasi terpisah.

============================================================
4. MASTER DATA ARCHITECTURE
============================================================

                    MASTER DATA
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     ORGANIZATION      PEOPLE          IDENTIFIER
        │                │                │
        │          ┌─────┴─────┐          │
        │          │           │          │
      UNIT       STUDENT    EMPLOYEE     CARD
      ROLE       GUARDIAN   POSITION      QR
                                         BARCODE

============================================================
5. ORGANIZATION
============================================================

Master organisasi harus
mendukung:

Institution
Unit
Department jika diperlukan
Location
Position

Contoh:

Yayasan
↓
Lembaga
↓
Unit
↓
Bagian

Jangan membuat struktur
organisasi hardcoded.

============================================================
6. INSTITUTION
============================================================

Data:

name
legal_name
short_name
institution_code
address
phone
email
website
logo
status

Jika existing table
sudah tersedia:

REUSE.

============================================================
7. UNIT
============================================================

Unit dapat digunakan
untuk:

Sekolah
Pesantren
PKBM
Madrasah
Unit administrasi
Unit lainnya.

Data:

institution_id
name
code
type
address
status

============================================================
8. MULTI UNIT
============================================================

Walaupun aplikasi saat ini
dapat digunakan single institution,
arsitektur harus memungkinkan
beberapa unit.

JANGAN menduplikasi:

students_unit_a
students_unit_b

Gunakan:

student
+
unit relationship.

============================================================
9. PERSON IDENTITY
============================================================

Identitas orang harus
konsisten.

Jika architecture existing
menggunakan Person entity:

REUSE.

Jika tidak menggunakan Person:

jangan membuat Person baru
hanya untuk memenuhi dokumen ini
jika tidak diperlukan.

Prioritaskan existing schema.

============================================================
10. STUDENT / SANTRI
============================================================

Student adalah master identity
untuk peserta didik.

Data minimal:

student_number
nis
nisn
name
gender
birth_place
birth_date
nik
religion jika diperlukan
phone
email
address
status
entry_date
unit_id
photo

Identifier harus mengikuti
data existing.

============================================================
11. STUDENT NUMBER
============================================================

Nomor siswa:

NIS
NISN
internal student ID

harus dibedakan.

Jangan menggunakan
NIS sebagai primary key
jika database sudah memiliki
UUID/ID internal.

============================================================
12. STUDENT ID
============================================================

Primary key:

Gunakan ID database
yang sudah established.

NIS/NISN hanya sebagai
business identifier.

============================================================
13. STUDENT STATUS
============================================================

Status contoh:

ACTIVE
INACTIVE
GRADUATED
TRANSFERRED
WITHDRAWN
DECEASED

Gunakan standard existing.

Jangan mencampur:

aktif
Active
ACTIVE

============================================================
14. STUDENT PHOTO
============================================================

Foto:

upload
replace
delete
preview

Storage harus aman.

Jangan menyimpan
binary besar langsung
di database kecuali
architecture memang
mengharuskannya.

============================================================
15. GUARDIAN
============================================================

Guardian adalah
master data orang tua/wali.

Data:

name
nik
gender
birth_date jika diperlukan
phone
email
occupation
address
status

============================================================
16. STUDENT-GUARDIAN
============================================================

Relationship:

Student
↓
StudentGuardian
↓
Guardian

Support:

father
mother
guardian
other

Satu guardian dapat
terhubung ke beberapa
student jika memang
orang tua dari saudara.

============================================================
17. EMPLOYEE
============================================================

Employee menjadi
single source of truth
untuk:

Guru
Karyawan
Staff
Tenaga administrasi
Security
Petugas lainnya.

Data:

employee_number
name
nik
nip
niy
nuptk jika diperlukan
gender
birth_place
birth_date
phone
email
address
photo
status
unit_id
join_date

============================================================
18. TEACHER
============================================================

JANGAN membuat
teacher identity table
jika guru sudah merupakan
employee.

Gunakan:

Employee
+
Role/Position

Contoh:

Employee
→ Teacher

atau:

Employee
→ Position: GURU

============================================================
19. SECURITY
============================================================

Security juga merupakan
Employee.

Jangan membuat:

security_users

untuk menyimpan
identitas orang yang sama.

Jika security memiliki
akses aplikasi:

Employee
↓
User
↓
Role
↓
Permission

============================================================
20. USER VS EMPLOYEE
============================================================

Bedakan:

EMPLOYEE
=
data kepegawaian.

USER
=
akun login aplikasi.

Tidak semua employee
harus mempunyai user.

Contoh:

Employee
→ tidak memiliki login.

Sedangkan:

Employee
→ User
→ Security role.

============================================================
21. POSITION
============================================================

Master jabatan:

name
code
description
status.

Contoh:

Kepala
Guru
TU
Bendahara
Security
Operator
Staff

============================================================
22. EMPLOYEE POSITION
============================================================

Jika employee dapat
memiliki lebih dari satu
jabatan:

gunakan relationship.

Jangan membuat:

employee.teacher = true
employee.security = true
employee.tu = true

jika kebutuhan sudah
lebih kompleks.

============================================================
23. EMPLOYEE STATUS
============================================================

Contoh:

ACTIVE
INACTIVE
CONTRACT
PERMANENT
HONORARY
RETIRED

Gunakan enum existing
atau standard system.

============================================================
24. CONTACT
============================================================

Kontak harus konsisten.

Field:

phone
mobile_phone
email

Jangan menyimpan
nomor telepon yang sama
di banyak tabel tanpa
alasan.

============================================================
25. ADDRESS
============================================================

Jika sistem existing
memiliki address entity:

REUSE.

Support:

street
village
district
regency
province
postal_code

Jangan hardcode
nama wilayah.

============================================================
26. REGION MASTER
============================================================

Jika digunakan:

Province
Regency
District
Village

Gunakan master region
yang konsisten.

Jangan membuat
string bebas jika
business requirement
membutuhkan validasi
wilayah.

============================================================
27. IDENTITY DOCUMENT
============================================================

Dokumen identitas:

KTP
KK
NISN
NIP
NIY
NUPTK
dokumen lainnya.

Dokumen harus
terhubung ke owner.

Contoh:

Student
→ IdentityDocument

Employee
→ IdentityDocument

============================================================
28. CARD ENGINE
============================================================

Kartu bukan master
person identity.

Kartu adalah
representation/credential.

Relationship:

Student
↓
StudentCard
↓
QR / Barcode

Employee
↓
EmployeeCard
↓
QR / Barcode

============================================================
29. QR CODE
============================================================

QR harus unik.

QR value:

random secure identifier.

Jangan menggunakan:

nama
NIS
NIK

sebagai QR secret
secara langsung.

============================================================
30. QR STATUS
============================================================

Contoh:

ACTIVE
REVOKED
EXPIRED

QR yang revoked
tidak boleh digunakan
untuk attendance.

============================================================
31. BARCODE
============================================================

Barcode harus memiliki
format standar.

Contoh:

CODE128

sesuai kebutuhan
existing system.

============================================================
32. CARD STATUS
============================================================

ACTIVE
BLOCKED
LOST
EXPIRED
REPLACED

============================================================
33. CARD REPLACEMENT
============================================================

Jika kartu hilang:

OLD CARD
↓
REVOKE
↓
NEW CARD
↓
NEW QR/BARCODE

Jangan menghapus
history kartu lama.

============================================================
34. MASTER DATA CRUD
============================================================

Setiap master entity
sesuai kebutuhan:

LIST
DETAIL
CREATE
UPDATE
ARCHIVE/DEACTIVATE

DELETE hanya jika
business rule mengizinkan.

============================================================
35. SOFT DELETE
============================================================

Untuk master penting:

gunakan soft delete
atau status inactive
sesuai architecture.

Jangan hard delete
student/employee yang
sudah memiliki transaksi
historis tanpa analisis.

============================================================
36. IMPORT DATA
============================================================

Support jika diperlukan:

CSV
XLSX

Flow:

UPLOAD
↓
VALIDATE
↓
PREVIEW
↓
DUPLICATE CHECK
↓
USER CONFIRM
↓
TRANSACTION
↓
IMPORT
↓
REPORT

============================================================
37. IMPORT DUPLICATE
============================================================

Jangan membuat
duplicate student
karena import.

Gunakan matching:

NISN
NIK
NIS
internal ID

sesuai availability
dan business rule.

============================================================
38. EXPORT
============================================================

Master data dapat
diekspor jika permission
mengizinkan.

Format:

XLSX
CSV
PDF

Gunakan backend-generated
data.

============================================================
39. SEARCH
============================================================

Student search:

name
NIS
NISN
NIK
QR
barcode

Employee search:

name
NIP
NIY
NIK
employee number
QR
barcode

============================================================
40. FILTER
============================================================

Student:

unit
status
gender
entry year

Employee:

unit
position
employment status
status

============================================================
41. PAGINATION
============================================================

Semua list besar:

SERVER SIDE PAGINATION.

Jangan load seluruh
student ke browser.

============================================================
42. MASTER DATA API
============================================================

API harus mengikuti
existing API architecture.

Contoh:

GET /students
GET /students/:id
POST /students
PATCH /students/:id

GET /employees
GET /employees/:id
POST /employees
PATCH /employees/:id

Jangan membuat endpoint
duplicate jika sudah ada.

============================================================
43. VALIDATION
============================================================

Student:

name required
gender valid
birth_date valid
NIS/NISN format valid
unit valid.

Employee:

name required
employee number valid
position valid
unit valid.

============================================================
44. UNIQUE IDENTIFIER
============================================================

Gunakan unique constraint
sesuai business rule.

Contoh:

NISN
NIK
NIP
NIY
employee_number

Tetapi:

nullable identifier
tidak boleh memicu
duplicate constraint
secara salah.

============================================================
45. DATA NORMALIZATION
============================================================

Jangan simpan:

student_name
guardian_name
teacher_name

sebagai copy permanen
di tabel transaksi jika
tidak diperlukan.

Transaction dapat
menyimpan snapshot
hanya jika memang
dibutuhkan untuk
historical integrity.

============================================================
46. SNAPSHOT DATA
============================================================

Jika surat/dokumen
memerlukan snapshot:

gunakan document snapshot.

Contoh:

Nama pada surat
tetap mengikuti
data ketika surat
diterbitkan.

Jangan membuat
master identity kedua.

============================================================
47. AUDIT LOG
============================================================

Setiap perubahan
master penting:

CREATE
UPDATE
STATUS CHANGE
CARD REPLACEMENT
ARCHIVE

harus dapat diaudit.

============================================================
48. DATA CHANGE HISTORY
============================================================

Untuk data sensitif
dan penting:

catat:

actor
timestamp
old value
new value
reason jika diperlukan.

============================================================
49. PERMISSION
============================================================

Contoh:

student.view
student.create
student.update
student.archive

employee.view
employee.create
employee.update
employee.archive

guardian.view
guardian.create
guardian.update

card.view
card.generate
card.revoke

============================================================
50. ROLE ACCESS
============================================================

Contoh:

SUPER ADMIN
→ all

TU
→ master data

SECURITY
→ attendance/card lookup

GURU
→ student lookup sesuai
   kebutuhan attendance

BENDAHARA
→ employee/finance
   sesuai permission

KEPALA
→ read/report

============================================================
51. SECURITY
============================================================

JANGAN mengizinkan
user melihat data
yang tidak dibutuhkan
role-nya.

Contoh:

Security tidak otomatis
boleh melihat seluruh
data keuangan.

============================================================
52. API AUTHORITY
============================================================

Frontend hanya
UX control.

Backend adalah
security authority.

Semua CRUD harus
diperiksa backend.

============================================================
53. RELATIONSHIP
============================================================

Minimal:

Institution
→ Unit

Unit
→ Student

Unit
→ Employee

Student
→ Guardian

Employee
→ Position

Student
→ Card

Employee
→ Card

Person/Entity
→ Document

============================================================
54. ATTENDANCE DEPENDENCY
============================================================

Attendance HARUS
menggunakan:

Student existing
Employee existing
Card existing
QR existing
Location existing

JANGAN membuat
student baru di
attendance.

============================================================
55. LETTER DEPENDENCY
============================================================

Letter HARUS
menggunakan:

Student
Employee
Guardian
Institution
Unit

dari Master Data.

JANGAN copy master
identity sebagai
entity baru.

============================================================
56. DOCUMENT DEPENDENCY
============================================================

Document owner:

Student
Employee
Guardian
Institution
Asset
Letter

sesuai business rule.

============================================================
57. INVENTORY DEPENDENCY
============================================================

Inventory tidak boleh
membuat employee table
sendiri untuk:

borrower
responsible person.

Gunakan Employee existing.

============================================================
58. REPORT DEPENDENCY
============================================================

Reports mengambil
data dari master source.

JANGAN membuat
report-specific master.

============================================================
59. EXTERNAL LEGER/KBM
============================================================

Jika diperlukan integrasi:

Management
↓
Student Master
↓
Integration API
↓
Leger/KBM

JANGAN membuat
academic master lokal
hanya untuk sinkronisasi
jika tidak diperlukan.

============================================================
60. DATA SYNC
============================================================

Jika external application
memiliki student data:

tetapkan:

SOURCE OF TRUTH.

Management Master
atau
External System.

Jangan dua sistem
menjadi master aktif
untuk entity yang sama
tanpa synchronization
strategy.

============================================================
61. EXTERNAL ID
============================================================

Jika integrasi diperlukan:

student.external_id
employee.external_id

atau integration mapping
sesuai existing architecture.

Jangan menggunakan
nama sebagai matching key.

============================================================
62. API RESPONSE
============================================================

Response harus konsisten.

Contoh:

{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "status": "ACTIVE"
  }
}

============================================================
63. ERROR HANDLING
============================================================

Handle:

duplicate identifier
invalid unit
invalid guardian
invalid employee
invalid card
invalid QR
permission denied.

============================================================
64. TRANSACTION SAFETY
============================================================

Create Student + Guardian
+ Card:

gunakan transaction
jika operasi dilakukan
secara atomic.

Jika gagal:

ROLLBACK.

============================================================
65. CONCURRENCY
============================================================

Cegah:

dua employee number sama
dua NISN sama
dua QR sama
dua card aktif untuk
identifier yang sama
jika business rule
melarangnya.

============================================================
66. MASTER DATA UI
============================================================

UI harus memiliki:

Search
Filter
Pagination
Create
Edit
Detail
Archive
Restore jika diperlukan
Import
Export

============================================================
67. DETAIL PAGE
============================================================

Student Detail:

Identity
Contact
Guardian
Card
QR
Documents
Attendance Summary
History

Employee Detail:

Identity
Contact
Position
Card
QR
Documents
Attendance Summary
History

JANGAN menampilkan
modul akademik.

============================================================
68. STUDENT DETAIL
============================================================

TAB:

Profil
Orang Tua/Wali
Kartu
Dokumen
Absensi
Riwayat

Tidak ada:

Nilai
Rapor
Leger
KBM
Kurikulum.

============================================================
69. EMPLOYEE DETAIL
============================================================

TAB:

Profil
Jabatan
Dokumen
Kartu
Absensi
Riwayat

============================================================
70. BULK OPERATIONS
============================================================

Support jika diperlukan:

bulk card generation
bulk QR generation
bulk import
bulk export
bulk status update

Harus:

permission
confirmation
transaction
progress
result report.

============================================================
71. PHOTO MANAGEMENT
============================================================

Foto:

preview
crop jika tersedia
compress
upload
replace
remove

Gunakan storage
yang aman.

============================================================
72. FILE NAMING
============================================================

Jangan gunakan:

student-name-final-final.jpg

Gunakan unique storage
identifier.

============================================================
73. DATA QUALITY
============================================================

Dashboard kualitas:

missing NIK
missing NISN
missing phone
missing photo
duplicate identifier
inactive records
invalid relation.

============================================================
74. DUPLICATE DETECTION
============================================================

Cari:

same NIK
same NISN
same NIP
same NIY
same phone
same email

Jangan otomatis
menggabungkan record.

Tampilkan:

POTENTIAL DUPLICATE.

============================================================
75. MERGE DATA
============================================================

Jika merge diperlukan:

SOURCE
↓
TARGET
↓
DEPENDENCY ANALYSIS
↓
PREVIEW
↓
APPROVAL
↓
TRANSACTION
↓
AUDIT

============================================================
76. MASTER DATA AUDIT
============================================================

Output:

STUDENT COUNT
EMPLOYEE COUNT
GUARDIAN COUNT
UNIT COUNT
POSITION COUNT
CARD COUNT
QR COUNT
DOCUMENT COUNT

============================================================
77. MASTER DATA HEALTH
============================================================

Check:

[ ] No duplicate student
[ ] No duplicate employee
[ ] No duplicate guardian
[ ] No broken relation
[ ] No orphan card
[ ] No orphan QR
[ ] No invalid unit
[ ] No invalid position
[ ] No duplicate identifier
[ ] No dummy production data
[ ] No academic master
[ ] No duplicate engine

============================================================
78. PRODUCTION RULE
============================================================

JANGAN menggunakan:

dummy student
dummy employee
dummy guardian
dummy QR
dummy card

pada production.

============================================================
79. TEST DATA
============================================================

Development/test data
harus dipisahkan.

Production database
tidak boleh bergantung
pada seeder dummy.

============================================================
80. TESTING
============================================================

Test:

CREATE
READ
UPDATE
ARCHIVE
RESTORE
SEARCH
FILTER
IMPORT
EXPORT
DUPLICATE
PERMISSION
RELATION
AUDIT

============================================================
81. INTEGRATION TEST
============================================================

Test:

Student
→ Card
→ QR
→ Attendance

Employee
→ Card
→ QR
→ Attendance

Student
→ Guardian
→ Document

Employee
→ Document
→ Letter

============================================================
82. FINAL DOMAIN FLOW
============================================================

INSTITUTION
↓
UNIT
↓
STUDENT / EMPLOYEE
↓
IDENTITY
↓
CARD
↓
QR / BARCODE
↓
ATTENDANCE
↓
DOCUMENT
↓
LETTER
↓
REPORT
↓
AUDIT

============================================================
83. FORBIDDEN DUPLICATE
============================================================

JANGAN BUAT:

student_master
student_management
student_profile_master

jika fungsi sama.

JANGAN BUAT:

employee_master
teacher_master
staff_master

jika identity berasal
dari Employee.

JANGAN BUAT:

qr_engine_2
card_engine_2

JANGAN BUAT:

attendance_student_master

============================================================
84. IMPLEMENTATION RULE
============================================================

Jika existing system
sudah memiliki:

Student Engine
Employee Engine
Guardian Engine
Card Engine
QR Engine

maka:

REUSE.

Jika ada kekurangan:

EXTEND.

Jika struktur rusak:

REFACTOR.

Hanya buat engine baru
jika benar-benar
tidak tersedia.

============================================================
85. FINAL MASTER DATA FLOW
============================================================

CREATE MASTER DATA
        ↓
VALIDATE
        ↓
DUPLICATE CHECK
        ↓
SAVE
        ↓
AUDIT
        ↓
AVAILABLE TO ALL MODULES

============================================================
86. FINAL COMMAND
============================================================

MASTER DATA MUST BE
THE SINGLE SOURCE OF TRUTH.

DO NOT DUPLICATE STUDENT.

DO NOT DUPLICATE EMPLOYEE.

DO NOT DUPLICATE GUARDIAN.

DO NOT DUPLICATE UNIT.

DO NOT DUPLICATE POSITION.

DO NOT DUPLICATE CARD.

DO NOT DUPLICATE QR ENGINE.

DO NOT CREATE ACADEMIC MASTER.

DO NOT CREATE KBM MASTER.

DO NOT CREATE LEGER MASTER.

DO NOT CREATE RAPOR MASTER.

DO NOT CREATE DUMMY PRODUCTION DATA.

REUSE EXISTING DATABASE.

REUSE EXISTING API.

REUSE EXISTING SERVICE.

REUSE EXISTING COMPONENT.

EXTEND ONLY WHEN NECESSARY.

PRODUCTION READY.

# END ENTERPRISE MASTER DATA ENGINE