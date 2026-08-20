# 153_DATABASE_RELATION_AUDIT.md

MODE: DATABASE AUDIT + SAFE FIX

BACA DOKUMENTASI EXISTING TERLEBIH DAHULU.
JANGAN MEMBUAT DATABASE BARU JIKA STRUKTUR SUDAH ADA.

==================================================
OBJECTIVE
==================================================

Audit database Management Sekolah & Pondok Pesantren.

Fokus:

- duplicate table
- duplicate column
- broken relation
- missing foreign key
- wrong foreign key
- missing unique constraint
- missing index
- orphan data
- nullable issue
- migration issue
- inconsistent naming
- source of truth

==================================================
1. SCOPE
==================================================

Domain:

Student
Employee
Attendance
Administration
Document
Archive
Inventory
Asset
Finance
Reporting
Approval
Notification
Monitoring
Integration

JANGAN membuat:

KBM
Leger
Rapor
Nilai
Kurikulum
Academic Engine.

==================================================
2. FIRST ACTION
==================================================

SCAN EXISTING DATABASE.

SCAN:

schema
migration
model
ORM
repository
service
API.

BUAT MAPPING:

TABLE
→ MODEL
→ RELATION
→ API
→ MODULE.

JANGAN LANGSUNG MIGRASI.

==================================================
3. DUPLICATE TABLE
==================================================

Cari tabel dengan fungsi sama.

Contoh:

students
student_data
student_master

employees
employee_data
staff

attendance
attendance_records
student_attendance.

Jika duplicate:

IDENTIFY SOURCE OF TRUTH.

Jangan langsung delete.

==================================================
4. DUPLICATE COLUMN
==================================================

Cari field yang menyimpan
informasi sama.

Contoh:

student_name
name
full_name

Jika redundan:

tentukan field canonical.

==================================================
5. PRIMARY KEY
==================================================

Setiap tabel harus memiliki
primary key yang valid.

Periksa:

- uniqueness
- type
- generation
- relation compatibility.

==================================================
6. FOREIGN KEY
==================================================

Periksa seluruh relation.

Pastikan:

child FK
→ parent PK/unique key.

Cari:

missing FK
wrong FK
wrong type
wrong relation.

==================================================
7. RELATION
==================================================

Periksa ORM relation:

belongsTo
hasMany
hasOne
belongsToMany.

Relation harus sesuai
database sebenarnya.

==================================================
8. ORPHAN DATA
==================================================

Cari record child
tanpa parent.

Contoh:

attendance
→ student tidak ditemukan.

transaction
→ account tidak ditemukan.

document
→ owner tidak ditemukan.

Jangan menghapus orphan
secara otomatis.

REPORT dahulu.

==================================================
9. UNIQUE
==================================================

Field bisnis yang harus
unik wajib diperiksa.

Contoh:

NIS
NIP
NIY
barcode
QR identifier
document number.

Jangan membuat unique
jika business rule
memang tidak mengharuskannya.

==================================================
10. INDEX
==================================================

Periksa index untuk:

foreign key
search
filter
sort
unique
date query.

Jangan membuat index
berlebihan.

==================================================
11. NULLABLE
==================================================

Audit:

nullable
required
default.

Field wajib tidak boleh
nullable tanpa alasan.

==================================================
12. ENUM / STATUS
==================================================

Cari status yang
tidak konsisten.

Contoh:

active
ACTIVE
aktif

Pilih canonical format
berdasarkan existing
architecture.

Jangan membuat enum
kedua untuk arti sama.

==================================================
13. SOFT DELETE
==================================================

Jika module menggunakan
soft delete:

pastikan query normal
tidak mengambil deleted
record.

==================================================
14. TIMESTAMP
==================================================

Periksa:

created_at
updated_at
deleted_at

dan timezone.

==================================================
15. AUDIT FIELDS
==================================================

Data penting dapat
memerlukan:

created_by
updated_by
approved_by.

Gunakan existing
audit architecture.

==================================================
16. STUDENT RELATION
==================================================

Audit:

student
unit
class reference jika
memang dibutuhkan oleh
management system
guardian
document
attendance
payment.

Jangan membuat
academic relation.

==================================================
17. EMPLOYEE RELATION
==================================================

Audit:

employee
position
unit
attendance
document
payroll jika tersedia.

==================================================
18. ATTENDANCE RELATION
==================================================

Pastikan attendance
memiliki source yang
jelas:

student
atau
employee.

Jangan mencampurkan
business rule tanpa
discriminator yang jelas.

==================================================
19. ATTENDANCE DUPLICATE
==================================================

Periksa apakah:

student attendance

dan

employee attendance

menggunakan engine
yang sama atau memang
memiliki struktur domain
yang berbeda.

REUSE ENGINE.

Jangan membuat
Attendance Engine 2.

==================================================
20. QR/BARCODE
==================================================

Pastikan identifier:

unique
stable
non-sensitive.

Jangan menggunakan
nama siswa sebagai
identifier QR.

==================================================
21. GPS ATTENDANCE
==================================================

Jika location disimpan:

latitude
longitude
accuracy
timestamp
device/source

harus memiliki
struktur konsisten.

Jangan menyimpan
data GPS jika tidak
diperlukan oleh policy.

==================================================
22. FINANCE RELATION
==================================================

Audit:

account
transaction
budget
category
payment
approval.

Pastikan tidak ada
dua tabel yang memiliki
fungsi ledger sama.

==================================================
23. INVENTORY RELATION
==================================================

Audit:

item
category
warehouse/location
stock movement
asset.

Stock movement harus
dapat ditelusuri.

==================================================
24. DOCUMENT RELATION
==================================================

Audit:

document
owner
category
storage
archive.

File metadata dan
physical storage
harus dipisahkan jika
architecture existing
menggunakannya.

==================================================
25. APPROVAL RELATION
==================================================

Audit:

request
workflow
approver
approval history.

History tidak boleh
hilang ketika status
berubah.

==================================================
26. NOTIFICATION
==================================================

Audit:

notification
recipient
read status
delivery status.

Jangan membuat
notification table kedua
untuk fungsi yang sama.

==================================================
27. INTEGRATION
==================================================

Audit:

integration
external_id
webhook
sync log
credential.

Jangan menyimpan
secret plaintext.

==================================================
28. MIGRATION
==================================================

Audit semua migration.

Cari:

duplicate migration
failed migration
destructive migration
inconsistent schema.

Jangan mengedit migration
lama yang sudah digunakan
production tanpa alasan
yang sangat kuat.

Gunakan migration baru.

==================================================
29. DATA MIGRATION
==================================================

Jika ditemukan duplicate
table:

1. backup
2. compare
3. mapping
4. migrate
5. verify
6. deprecate
7. remove jika aman.

Jangan langsung DROP.

==================================================
30. DATABASE TRANSACTION
==================================================

Operation multi-table
yang harus atomic
menggunakan transaction.

Contoh:

payment
stock movement
attendance correction
approval.

==================================================
31. CONCURRENCY
==================================================

Periksa kemungkinan:

duplicate insert
lost update
race condition.

Gunakan:

unique constraint
transaction
locking
idempotency

sesuai kebutuhan.

==================================================
32. DATA INTEGRITY
==================================================

Tidak boleh ada:

invalid FK
negative stock jika
policy melarang
duplicate payment
duplicate attendance
duplicate document number.

==================================================
33. PERFORMANCE
==================================================

Cari:

N+1
full table scan
missing index
large join
unbounded query.

==================================================
34. QUERY AUDIT
==================================================

Cari query yang:

mengambil seluruh tabel
tanpa pagination
menggunakan SELECT *
tanpa kebutuhan
melakukan duplicate query.

==================================================
35. SOURCE OF TRUTH
==================================================

Tetapkan:

Student → Student Engine
Employee → Employee Engine
Attendance → Attendance Engine
Finance → Finance Engine
Inventory → Inventory Engine
Document → Document Engine

Academic:

KBM/Leger → EXTERNAL APPLICATION.

==================================================
36. SAFE FIX
==================================================

Untuk setiap masalah:

IDENTIFY
→ EXPLAIN
→ MIGRATE
→ TEST
→ VERIFY.

Jangan melakukan
perubahan destruktif
tanpa backup.

==================================================
37. OUTPUT
==================================================

Tampilkan hanya:

DATABASE ISSUES

DUPLICATE TABLES

BROKEN RELATIONS

MISSING CONSTRAINTS

MISSING INDEXES

ORPHAN DATA

MIGRATION ISSUES

PERFORMANCE ISSUES

FIXED

REMAINING

TEST RESULT

Format:

[SEVERITY]
TABLE:
ISSUE:
ROOT CAUSE:
ACTION:
TEST:
STATUS:

==================================================
38. PRIORITY
==================================================

P0:
data corruption/security.

P1:
broken relation/business data.

P2:
performance/integrity issue.

P3:
cleanup/naming.

FIX:

P0 → P1 → P2 → P3

==================================================
39. ABSOLUTE RULE
==================================================

DO NOT:

create duplicate table
create duplicate relation
create duplicate database
create duplicate engine
drop production data
rewrite working schema
change API blindly.

SEARCH EXISTING FIRST.

REUSE EXISTING STRUCTURE.

==================================================
FINAL COMMAND
==================================================

SCAN DATABASE.

MAP RELATIONS.

DETECT DUPLICATES.

DETECT ORPHANS.

DETECT BROKEN FOREIGN KEYS.

DETECT MISSING CONSTRAINTS.

DETECT MISSING INDEXES.

DETECT MIGRATION ISSUES.

FIX SAFELY.

RUN TEST.

RUN REGRESSION.

REPORT RESULT.

DO NOT ADD NEW FEATURE.

# END 153_DATABASE_RELATION_AUDIT