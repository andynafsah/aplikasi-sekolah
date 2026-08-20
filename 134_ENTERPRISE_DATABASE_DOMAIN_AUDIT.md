# 134_ENTERPRISE_DATABASE_DOMAIN_AUDIT.md

# ENTERPRISE DATABASE DOMAIN AUDIT
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: DATABASE AUDIT / DUPLICATE PREVENTION / DATA INTEGRITY

============================================================
1. OBJECTIVE
============================================================

Lakukan audit menyeluruh terhadap database aplikasi yang
sudah ada.

TUJUAN:

1. Mengetahui seluruh tabel existing.
2. Mengetahui seluruh relationship.
3. Menemukan duplicate table.
4. Menemukan duplicate field.
5. Menemukan duplicate functionality.
6. Menemukan orphan relation.
7. Menemukan unused table.
8. Menemukan legacy academic table.
9. Menemukan table yang masih digunakan oleh module aktif.
10. Memastikan database production-safe.
11. Memastikan tidak ada migration yang saling bertabrakan.
12. Memastikan backend sesuai dengan database.
13. Memastikan frontend sesuai dengan API.
14. Mencegah pembuatan tabel baru yang sebenarnya sudah ada.

============================================================
2. ABSOLUTE RULE
============================================================

JANGAN membuat table baru sebelum melakukan:

DATABASE SCAN
↓
TABLE INVENTORY
↓
FIELD INVENTORY
↓
RELATIONSHIP ANALYSIS
↓
USAGE ANALYSIS
↓
DUPLICATE DETECTION
↓
DEPENDENCY ANALYSIS
↓
SAFE DECISION

============================================================
3. DATABASE SCOPE
============================================================

DATABASE MANAGEMENT hanya menangani:

MASTER DATA
KEPEGAWAIAN
ABSENSI
KARTU
TATA USAHA
DOKUMEN
ARSIP
INVENTARIS
KEUANGAN
NOTIFIKASI
REPORTING
AUDIT
SYSTEM ADMINISTRATION

============================================================
4. FORBIDDEN DATABASE DOMAIN
============================================================

JANGAN membuat entity baru untuk:

academic
akademik
kbm
curriculum
kurikulum
subject
lesson
assessment
grade
nilai
kkm
leger
rapor
report_card
transcript
ranking
learning_outcome

Domain tersebut dimiliki oleh aplikasi
KBM/LEGER terpisah.

============================================================
5. DATABASE INVENTORY
============================================================

Buat daftar seluruh:

TABLE
COLUMN
TYPE
NULLABLE
DEFAULT
INDEX
PRIMARY KEY
FOREIGN KEY
UNIQUE
CHECK CONSTRAINT
TRIGGER
VIEW
PROCEDURE jika ada.

Format:

TABLE
COLUMN
TYPE
NULLABLE
DEFAULT
PK
FK
UNIQUE
INDEX

============================================================
6. TABLE CLASSIFICATION
============================================================

Setiap tabel wajib dikategorikan:

ACTIVE
LEGACY
UNUSED
DUPLICATE
ACADEMIC
SYSTEM
INTEGRATION
UNKNOWN

Jangan menghapus UNKNOWN
sebelum dependency analysis.

============================================================
7. CORE DOMAIN TABLE
============================================================

Kelompokkan tabel:

------------------------------------------------------------
MASTER DATA
------------------------------------------------------------

Institution
Unit
Student
Guardian
Employee
Position
Address
Contact

------------------------------------------------------------
ATTENDANCE
------------------------------------------------------------

Attendance
AttendanceSession
AttendanceMethod
AttendanceLocation
AttendanceDevice
AttendanceCorrection

Nama sebenarnya harus mengikuti
database existing.

JANGAN membuat duplicate
jika entity sudah tersedia.

------------------------------------------------------------
DOCUMENT
------------------------------------------------------------

Document
DocumentCategory
DocumentVersion
DocumentAccess

------------------------------------------------------------
LETTER
------------------------------------------------------------

Letter
LetterTemplate
LetterNumber
LetterSignature
LetterDisposition

------------------------------------------------------------
INVENTORY
------------------------------------------------------------

Asset
AssetCategory
AssetLocation
AssetMutation
AssetMaintenance
AssetBorrowing

------------------------------------------------------------
FINANCE
------------------------------------------------------------

Gunakan table existing.

Jangan membuat:

finance_transactions_2
payments_new
new_bku
etc.

------------------------------------------------------------
SYSTEM
------------------------------------------------------------

User
Role
Permission
RolePermission
AuditLog
Notification
Setting

============================================================
8. STUDENT DOMAIN
============================================================

Student harus menjadi
single source of truth.

Jangan mempunyai:

students
school_students
student_profiles
student_master

yang menyimpan identitas
siswa yang sama tanpa alasan
arsitektural yang jelas.

Jika beberapa tabel tersebut
sudah ada:

AUDIT RELATIONSHIP.

Tentukan:

MASTER
LEGACY
DUPLICATE
INTEGRATION.

============================================================
9. EMPLOYEE DOMAIN
============================================================

Sama.

Hindari duplicate:

employees
teachers
staffs
employee_profiles

jika semuanya menyimpan
identitas orang yang sama.

Jika Teacher dan Employee
memiliki perbedaan domain,
gunakan relationship/role
daripada menduplikasi identitas.

Contoh:

Person
↓
Employee
↓
EmployeeRole

============================================================
10. GUARDIAN DOMAIN
============================================================

Pastikan orang tua/wali
tidak disimpan berulang.

Hindari:

parents
guardians
student_parents

jika sebenarnya
menggambarkan entity yang sama.

Gunakan relationship:

Student
↓
StudentGuardian
↓
Guardian

jika diperlukan.

============================================================
11. QR CODE DOMAIN
============================================================

QR harus mempunyai
identity yang jelas.

Jangan membuat:

student_qr
qr_students
student_qrcodes
qr_codes_student

tanpa alasan.

Gunakan satu mekanisme
identity/credential yang
konsisten.

QR harus memiliki:

unique value
owner
status
created_at
updated_at

Jika diperlukan:

expired_at
revoked_at.

============================================================
12. ATTENDANCE DOMAIN
============================================================

Sebelum membuat attendance table:

Cari:

attendance
attendances
student_attendance
employee_attendance
presence
presences
checkins
check_ins

Analisis apakah sudah
mewakili fungsi yang sama.

Jangan membuat:

student_attendance_v2

hanya karena frontend
berbeda.

============================================================
13. ATTENDANCE RELATION
============================================================

Ideal:

ATTENDANCE
│
├── SUBJECT
│   ├── STUDENT
│   └── EMPLOYEE
│
├── METHOD
│
├── LOCATION
│
├── DEVICE
│
└── AUDIT

Namun implementasi harus
mengikuti database existing.

Jangan memaksakan schema baru
jika existing schema sudah benar.

============================================================
14. ATTENDANCE STATUS
============================================================

Status harus konsisten.

Contoh:

PRESENT
LATE
ABSENT
SICK
PERMISSION
LEAVE
CHECK_IN
CHECK_OUT

Jangan menggunakan banyak
varian untuk status yang sama:

hadir
HADIR
present
Present
PRESENT

Pilih satu standard.

============================================================
15. GPS ATTENDANCE
============================================================

Jika GPS attendance sudah
memiliki table/location model:

REUSE.

Jika belum:

buat berdasarkan existing
architecture.

Minimal data:

latitude
longitude
accuracy
timestamp
location_id
device_id

Jangan menyimpan GPS
di banyak tabel tanpa alasan.

============================================================
16. DEVICE DOMAIN
============================================================

Audit apakah sudah ada:

devices
user_devices
attendance_devices

Jika sudah ada:

REUSE.

Device identity harus konsisten.

============================================================
17. DOCUMENT DOMAIN
============================================================

Cari seluruh table:

documents
files
attachments
uploads
media
archives

Tentukan fungsi masing-masing.

Jangan membuat:

documents_v2

jika existing system
bisa dikembangkan.

============================================================
18. ARCHIVE DOMAIN
============================================================

Bedakan:

DOCUMENT
dan
ARCHIVE.

Document =
file/data yang aktif.

Archive =
retention / historical record.

Jangan menyimpan file
dua kali hanya karena
berstatus archive.

============================================================
19. LETTER DOMAIN
============================================================

Audit:

letters
incoming_letters
outgoing_letters
letter_templates
letter_numbers
correspondence

Pastikan tidak ada
duplicate numbering engine.

============================================================
20. INVENTORY DOMAIN
============================================================

Audit:

assets
inventory
items
goods
equipment

Jika sudah ada
inventory engine:

REUSE.

Jangan membuat
second inventory system.

============================================================
21. FINANCE DOMAIN
============================================================

Audit semua table keuangan.

Contoh:

transactions
cash_transactions
bank_transactions
payments
expenses
incomes
budgets
bku
spj
payroll

Tujuannya:

menemukan duplicate
financial transaction engine.

Jangan mengubah
financial schema tanpa
dependency analysis.

============================================================
22. SYSTEM DOMAIN
============================================================

Audit:

users
roles
permissions
sessions
tokens
audit_logs
notifications
settings

Pastikan tidak ada
dua authentication system.

============================================================
23. ACADEMIC LEGACY AUDIT
============================================================

Cari seluruh tabel
yang mengandung:

academic
akademik
kbm
curriculum
subject
lesson
assessment
grade
nilai
leger
rapor
report_card
transcript
kkm

JANGAN langsung DROP.

Klasifikasikan:

1. ACTIVE LEGACY
2. UNUSED LEGACY
3. INTEGRATION
4. DUPLICATE
5. SAFE TO REMOVE

============================================================
24. ACADEMIC DEPENDENCY CHECK
============================================================

Untuk setiap tabel akademik:

Cari:

backend model
controller
service
route
frontend page
component
API
foreign key
trigger
job
event
report.

Jika masih digunakan
oleh Management:

JANGAN HAPUS.

Cari alasan dependency.

============================================================
25. FOREIGN KEY AUDIT
============================================================

Setiap foreign key harus:

valid
memiliki referenced record
tidak orphan
sesuai data type
memiliki index jika diperlukan.

Cari:

orphan records
invalid references
missing parent.

============================================================
26. ORPHAN DATA
============================================================

Cari record yang:

student_id tidak ada
employee_id tidak ada
guardian_id tidak ada
user_id tidak ada
document_id tidak ada.

Jangan menghapus otomatis.

Tentukan:

RECOVER
RELINK
ARCHIVE
DELETE

sesuai business rule.

============================================================
27. UNIQUE CONSTRAINT AUDIT
============================================================

Audit field:

NIK
NIS
NISN
NIP
NUPTK
NIY
email
phone
barcode
QR
document_number
letter_number

Jangan membuat UNIQUE
jika business rule tidak
mendukungnya.

Contoh:

NISN mungkin nullable
tetapi jika terisi harus
unique sesuai scope.

============================================================
28. INDEX AUDIT
============================================================

Audit index pada:

student_id
employee_id
guardian_id
unit_id
attendance_date
created_at
status
document_number
letter_number

Hindari:

duplicate index
unused index berlebihan.

============================================================
29. SOFT DELETE
============================================================

Jika aplikasi menggunakan
soft delete:

Gunakan konsisten.

Jangan campur:

deleted_at

dengan

is_deleted

tanpa alasan.

============================================================
30. STATUS FIELD
============================================================

Gunakan enum/status
secara konsisten.

Jangan membuat:

status
state
active
is_active

untuk konsep yang sama
di semua table tanpa standard.

============================================================
31. TIMESTAMP
============================================================

Gunakan:

created_at
updated_at

Jika diperlukan:

deleted_at

Untuk attendance:

occurred_at
atau timestamp yang
sudah distandarkan.

============================================================
32. MULTI UNIT
============================================================

Jika lembaga memiliki:

Sekolah
Pesantren
PKBM
Unit lain

pastikan data memiliki
unit ownership jika diperlukan.

Jangan meng-copy
student master per unit.

============================================================
33. DATA OWNERSHIP
============================================================

Setiap entity harus
memiliki owner domain.

Contoh:

Student
→ Management

Employee
→ Management

Attendance
→ Management

Document
→ Management

Letter
→ Management

Asset
→ Management

Grade
→ External Leger

Report Card
→ External Leger

============================================================
34. MIGRATION AUDIT
============================================================

Scan seluruh migration.

Cari:

duplicate migration
duplicate column
rename yang bertabrakan
drop column
foreign key conflict
enum conflict.

Jangan mengubah migration
lama secara sembarangan
jika sudah digunakan
production.

Gunakan migration baru
untuk perubahan production.

============================================================
35. ORM AUDIT
============================================================

Jika menggunakan ORM:

Pastikan:

Model
→ Table
→ Relation
→ API
→ Service

konsisten.

Tidak boleh:

Model Student
mengarah ke table berbeda
dari business definition.

============================================================
36. SEEDER AUDIT
============================================================

Seeder harus dipisahkan:

SYSTEM SEED
DEVELOPMENT SEED
TEST SEED

DILARANG memasukkan
dummy institution/student
ke production.

============================================================
37. DATABASE ENVIRONMENT
============================================================

Pastikan:

development
testing
staging
production

menggunakan database
yang benar.

Jangan hardcode:

database name
username
password
host.

Gunakan environment variable.

============================================================
38. TRANSACTION SAFETY
============================================================

Operation yang mengubah
lebih dari satu entity
harus menggunakan
database transaction
jika diperlukan.

Contoh:

Create Student
+
Create Guardian
+
Create QR

Jika salah satu gagal:

rollback.

============================================================
39. CONCURRENCY
============================================================

Attendance QR sangat
sensitif terhadap duplicate
scan.

Pastikan database/service
mencegah:

double attendance
race condition
duplicate transaction.

============================================================
40. ATTENDANCE UNIQUE RULE
============================================================

Jika business rule:

satu siswa hanya boleh
memiliki satu check-in
pada satu sesi/periode,

database harus memiliki
constraint atau service
protection yang sesuai.

Jangan hanya mengandalkan
frontend.

============================================================
41. DATABASE SECURITY
============================================================

Pastikan:

credentials tidak
hardcoded.

Production database
tidak menggunakan
development credentials.

============================================================
42. BACKUP SAFETY
============================================================

Sebelum migration besar:

BACKUP.

Migration production
harus memiliki:

rollback strategy
atau recovery strategy.

============================================================
43. DATABASE CLEANUP
============================================================

JANGAN melakukan:

DROP TABLE
TRUNCATE
DELETE MASSAL

hanya karena tabel
terlihat tidak digunakan.

Wajib:

dependency analysis
backup
approval
migration plan.

============================================================
44. DUPLICATE TABLE REPORT
============================================================

Output:

TABLE A
TABLE B
SIMILARITY
USAGE
DEPENDENCY
RECOMMENDATION

Contoh:

students
student_profiles

Recommendation:

MERGE / KEEP / DEPRECATE.

============================================================
45. DUPLICATE COLUMN REPORT
============================================================

Contoh:

students.phone
student_contacts.phone

Analisis apakah:

duplicate data
atau
different domain.

============================================================
46. RELATIONSHIP REPORT
============================================================

Tampilkan:

ENTITY
RELATION
FOREIGN KEY
CARDINALITY
STATUS

Contoh:

Student
→ Guardian
1:N

Employee
→ Attendance
1:N

Student
→ Attendance
1:N

============================================================
47. FINAL DATABASE HEALTH CHECK
============================================================

Check:

[ ] No broken FK
[ ] No orphan critical data
[ ] No duplicate primary key
[ ] No duplicate unique identifier
[ ] No duplicate table
[ ] No duplicate migration
[ ] No conflicting enum
[ ] No unsafe cascade
[ ] No production dummy
[ ] No academic dependency
[ ] No duplicate attendance engine
[ ] No duplicate employee engine
[ ] No duplicate student engine
[ ] No duplicate document engine
[ ] No duplicate letter engine
[ ] No duplicate inventory engine

============================================================
48. FINAL OUTPUT
============================================================

Setelah audit selesai,
hasilkan laporan:

1. DATABASE TABLE INVENTORY
2. CORE DOMAIN TABLES
3. LEGACY TABLES
4. ACADEMIC TABLES
5. DUPLICATE TABLES
6. DUPLICATE COLUMNS
7. FOREIGN KEY ISSUES
8. ORPHAN DATA
9. INDEX ISSUES
10. UNIQUE CONSTRAINT ISSUES
11. MIGRATION ISSUES
12. ORM RELATION ISSUES
13. ATTENDANCE DATABASE STATUS
14. DOCUMENT DATABASE STATUS
15. LETTER DATABASE STATUS
16. INVENTORY DATABASE STATUS
17. FINANCE DATABASE STATUS
18. SYSTEM DATABASE STATUS
19. SAFE TO REMOVE
20. MUST KEEP
21. MUST REFACTOR
22. RECOMMENDED MIGRATION
23. PRODUCTION RISK LEVEL

============================================================
49. RISK LEVEL
============================================================

LOW

Database sehat.

MEDIUM

Ada legacy/duplicate
tetapi tidak mengganggu
production.

HIGH

Ada duplicate engine,
broken relation,
atau migration conflict.

CRITICAL

Ada risiko:

data loss
security issue
financial inconsistency
attendance duplication
production corruption.

============================================================
50. FINAL RULE
============================================================

JANGAN MEMBUAT DATABASE
BARU HANYA KARENA FITUR
BARU DIMINTA.

SELALU:

SCAN
↓
IDENTIFY
↓
REUSE
↓
EXTEND
↓
MIGRATE JIKA PERLU
↓
TEST
↓
DEPLOY

BUKAN:

REQUEST
↓
CREATE NEW TABLE
↓
CREATE NEW MODEL
↓
CREATE NEW API

============================================================
51. FINAL DOMAIN BOUNDARY
============================================================

MANAGEMENT DATABASE:

Student
Employee
Guardian
Attendance
Document
Letter
Archive
Asset
Finance
Notification
Audit
System

EXTERNAL ACADEMIC DATABASE:

Subject
Curriculum
Lesson
Assessment
Grade
Leger
Report Card

JANGAN MENCAMPURKAN DOMAIN.

============================================================
52. FINAL COMMAND
============================================================

AUDIT EXISTING DATABASE FIRST.

DO NOT CREATE DUPLICATE.

DO NOT DELETE PRODUCTION DATA
WITHOUT DEPENDENCY ANALYSIS.

DO NOT CREATE ACADEMIC ENGINE.

DO NOT CREATE SECOND LEGER.

DO NOT CREATE SECOND KBM.

DO NOT CREATE SECOND ATTENDANCE ENGINE.

DO NOT CREATE SECOND STUDENT ENGINE.

DO NOT CREATE SECOND EMPLOYEE ENGINE.

DO NOT CREATE SECOND DOCUMENT ENGINE.

DO NOT CREATE SECOND LETTER ENGINE.

REUSE EXISTING ARCHITECTURE
WHENEVER POSSIBLE.

# END DATABASE DOMAIN AUDIT