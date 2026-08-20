# 140_ENTERPRISE_STUDENT_CARD_QR_IDENTITY_ENGINE.md

# ENTERPRISE STUDENT CARD & QR IDENTITY ENGINE
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION

============================================================
1. OBJECTIVE
============================================================

Membangun Student Card Identity Engine untuk:

- Kartu Pelajar
- QR Code siswa
- Barcode siswa
- Nomor kartu
- Status kartu
- Penerbitan kartu
- Penggantian kartu
- Pemblokiran kartu
- Cetak kartu
- Cetak QR
- Validasi identitas siswa
- Integrasi Attendance Engine

ENGINE INI BUKAN MASTER SISWA.

============================================================
2. ABSOLUTE RULE
============================================================

AUDIT EXISTING STUDENT ENGINE FIRST.

Jika Student Master sudah tersedia:

REUSE.

JANGAN membuat:

student_master_new
students_new
student_identity_duplicate

Student Engine tetap menjadi
SINGLE SOURCE OF TRUTH siswa.

============================================================
3. DOMAIN BOUNDARY
============================================================

ENGINE INI MENANGANI:

Card
QR
Barcode
Card status
Card lifecycle
Card printing
Card replacement
Card validation

ENGINE INI TIDAK MENANGANI:

Student Master
KBM
Akademik
Nilai
Leger
Rapor
Attendance transaction

Attendance tetap berada di:

139_ENTERPRISE_ATTENDANCE_ENGINE

============================================================
4. ARCHITECTURE
============================================================

STUDENT MASTER
      ↓
STUDENT CARD ENGINE
      ↓
CARD
      ↓
QR / BARCODE
      ↓
ATTENDANCE ENGINE

============================================================
5. CARD RELATIONSHIP
============================================================

Student
↓
StudentCard
↓
CardIdentity
↓
QR / Barcode

StudentCard harus memiliki:

student_id

sebagai foreign key.

============================================================
6. CARD DATA
============================================================

Minimal:

id
student_id
card_number
card_type
status
issued_at
expired_at
revoked_at
created_at
updated_at

Gunakan field existing
jika sudah tersedia.

============================================================
7. CARD TYPE
============================================================

Contoh:

STUDENT_CARD
SANTRI_CARD

Jika sekolah dan pondok
menggunakan kartu berbeda,
gunakan configuration.

Jangan membuat engine baru.

============================================================
8. CARD STATUS
============================================================

ACTIVE
INACTIVE
BLOCKED
LOST
EXPIRED
REPLACED
REVOKED

============================================================
9. CARD NUMBER
============================================================

card_number harus:

UNIQUE
STABLE
NON-REUSABLE

Jangan menggunakan:

student_id

sebagai card_number
jika architecture
tidak menetapkannya.

============================================================
10. QR IDENTITY
============================================================

QR tidak boleh berisi
data pribadi lengkap.

Jangan encode:

NIK
alamat
tanggal lahir
nomor KK

secara langsung.

Gunakan:

opaque identifier
atau
secure token.

============================================================
11. QR TOKEN
============================================================

QR token harus:

UNIQUE
RANDOM
NON-PREDICTABLE
REVOCABLE

Contoh konsep:

CARD_TOKEN

bukan:

student_id=123

============================================================
12. BARCODE
============================================================

Support barcode
sesuai kebutuhan.

Contoh:

CODE128

Barcode harus
terhubung dengan
Card Identity.

============================================================
13. QR VALIDATION
============================================================

SCAN
↓
DECODE TOKEN
↓
LOOKUP CARD
↓
CHECK CARD STATUS
↓
CHECK STUDENT STATUS
↓
RETURN IDENTITY

Jangan langsung
menganggap QR valid.

============================================================
14. CARD VALIDATION
============================================================

Valid jika:

CARD ACTIVE
+
STUDENT ACTIVE
+
TOKEN VALID

Jika salah satu gagal:

REJECT.

============================================================
15. LOST CARD
============================================================

Flow:

REPORT LOST
↓
BLOCK CARD
↓
REVOKE TOKEN
↓
AUDIT
↓
OPTIONAL NEW CARD

============================================================
16. REPLACEMENT
============================================================

OLD CARD
↓
REPLACED
↓
NEW CARD
↓
NEW TOKEN
↓
PRINT
↓
ACTIVATE

History kartu lama
harus tetap tersedia.

============================================================
17. CARD HISTORY
============================================================

Catat:

issued
activated
blocked
unblocked
lost
replaced
revoked
expired

============================================================
18. MULTIPLE CARD
============================================================

Satu siswa dapat memiliki
lebih dari satu card history.

Tetapi:

HANYA SATU ACTIVE CARD

kecuali policy lembaga
secara eksplisit mengizinkan
lebih dari satu.

============================================================
19. ACTIVE CARD CONSTRAINT
============================================================

Database/application
harus mencegah:

Student
→ Card A ACTIVE

dan

Student
→ Card B ACTIVE

secara bersamaan,
jika policy hanya mengizinkan
satu kartu aktif.

============================================================
20. STUDENT STATUS
============================================================

Jika Student:

ACTIVE
→ card dapat aktif.

INACTIVE
→ card dapat diblokir
sesuai policy.

ALUMNI
→ card tidak digunakan
untuk absensi aktif.

============================================================
21. STUDENT PHOTO
============================================================

Kartu dapat menggunakan
foto siswa dari Student Engine.

Jangan membuat
photo master kedua.

============================================================
22. CARD DESIGN
============================================================

Design harus configurable.

Elements:

Logo
Nama lembaga
Nama siswa
Foto
NIS/NISN sesuai kebutuhan
Card number
QR
Barcode
Tahun
Informasi tambahan

============================================================
23. CARD TEMPLATE
============================================================

Support template:

Default
Modern
Minimal
Custom

Template disimpan
sebagai configuration.

============================================================
24. CUSTOM CARD DESIGN
============================================================

Admin dapat mengatur:

position
size
font
logo
photo
QR
barcode
text
background

Tanpa mengubah
database identity.

============================================================
25. CARD SIZE
============================================================

Ukuran harus configurable.

Contoh:

CR80
custom dimension

Jangan hardcode
ukuran dalam component.

============================================================
26. PRINT PREVIEW
============================================================

Flow:

CARD
↓
TEMPLATE
↓
PREVIEW
↓
CONFIRM
↓
PRINT/PDF

============================================================
27. PDF EXPORT
============================================================

Support:

single card
bulk card
QR sheet

PDF harus mengikuti
template yang sama.

============================================================
28. BULK PRINT
============================================================

Flow:

FILTER STUDENT
↓
SELECT
↓
GENERATE CARD
↓
PREVIEW
↓
PDF
↓
PRINT

============================================================
29. CARD GENERATION
============================================================

Generate:

card_number
token
QR
barcode

Harus transaction-safe.

============================================================
30. QR GENERATION
============================================================

QR generation harus
deterministic terhadap
card identity atau
menggunakan secure token.

Jangan membuat token
baru setiap kali preview.

============================================================
31. QR REGENERATION
============================================================

Preview:

TIDAK boleh
mengganti token.

Regenerate hanya
jika:

REVOKE OLD TOKEN
↓
GENERATE NEW TOKEN
↓
AUDIT

============================================================
32. ATTENDANCE INTEGRATION
============================================================

Card Engine
tidak membuat
attendance record.

Flow:

QR SCAN
↓
CARD ENGINE
↓
IDENTITY VALIDATION
↓
ATTENDANCE ENGINE
↓
ATTENDANCE RECORD

============================================================
33. SECURITY GATE
============================================================

Security menggunakan:

SCAN
↓
CARD VALIDATION
↓
STUDENT IDENTITY
↓
ATTENDANCE ENGINE

Security tidak boleh
mengubah student master
hanya karena scan kartu.

============================================================
34. TEACHER SCANNER
============================================================

Guru menggunakan:

SCAN
↓
CARD VALIDATION
↓
STUDENT
↓
ATTENDANCE

Tidak ada
academic logic
di Card Engine.

============================================================
35. MANUAL ATTENDANCE
============================================================

Manual attendance
tidak membutuhkan QR.

Guru dapat:

SEARCH STUDENT
↓
SELECT
↓
ATTENDANCE ENGINE.

============================================================
36. CARD SEARCH
============================================================

Search:

student name
NIS
NISN
card number
barcode
QR token reference.

Jangan expose
raw secret token
pada interface.

============================================================
37. CARD LIST
============================================================

Columns:

Student
Card Number
Status
Issued Date
Expired Date
Last Activity
Action

============================================================
38. CARD FILTER
============================================================

Filter:

status
student
unit
class/group jika
tersedia dari master
dan hanya sebagai
reference.

Jangan membuat
academic relationship
baru.

============================================================
39. CARD DETAIL
============================================================

Detail:

Student
Card Number
Status
QR
Barcode
Issued
Expired
History

============================================================
40. CARD ACTION
============================================================

Actions:

View
Print
Block
Unblock
Replace
Revoke
Generate QR
Generate Barcode

Permission-aware.

============================================================
41. SECURITY
============================================================

QR token:

NEVER PUBLIC
NEVER LOGGED RAW
NEVER EXPOSED UNNECESSARILY.

============================================================
42. API
============================================================

Gunakan existing API.

Contoh:

GET /student-cards
GET /student-cards/:id

POST /student-cards
POST /student-cards/:id/block
POST /student-cards/:id/revoke
POST /student-cards/:id/replace

Jika endpoint existing
sudah tersedia:

REUSE.

============================================================
43. API VALIDATION
============================================================

AUTH
↓
RBAC
↓
VALIDATION
↓
BUSINESS RULE
↓
DATABASE
↓
AUDIT

============================================================
44. DUPLICATE PROTECTION
============================================================

Prevent duplicate:

card_number
active card
QR token
barcode.

============================================================
45. DATABASE
============================================================

Foreign key:

student_cards.student_id
→ students.id

Jangan membuat
duplicate student table.

============================================================
46. DATABASE INDEX
============================================================

Index:

student_id
card_number
status
created_at

Unique:

card_number
token
barcode

sesuai schema.

============================================================
47. TRANSACTION
============================================================

Card creation:

CREATE CARD
+
GENERATE TOKEN
+
GENERATE BARCODE
+
AUDIT

harus aman dalam
transaction.

============================================================
48. ERROR HANDLING
============================================================

Handle:

student not found
student inactive
duplicate card
invalid token
card revoked
card expired
generation error
print error.

============================================================
49. FRONTEND
============================================================

Student Card page:

Dashboard
Card List
Generate Card
Templates
Print
History

============================================================
50. CARD GENERATOR
============================================================

UI:

Select Student
↓
Select Template
↓
Preview
↓
Generate
↓
Save
↓
Print

============================================================
51. TEMPLATE MANAGEMENT
============================================================

Admin dapat:

create
edit
duplicate
activate
deactivate
delete

Template yang sedang
digunakan tidak boleh
dihapus tanpa replacement.

============================================================
52. DEFAULT TEMPLATE
============================================================

Harus tersedia:

DEFAULT_STUDENT_CARD

Tetapi isi tetap
menggunakan data lembaga
yang sebenarnya.

NO DUMMY SCHOOL DATA.

============================================================
53. LOGO
============================================================

Logo berasal dari:

Institution Settings.

Jangan upload
logo baru pada setiap
card template jika
logo lembaga sudah
tersedia.

============================================================
54. SCHOOL INFORMATION
============================================================

Card mengambil:

institution name
address
phone
logo

dari:

Institution Settings.

============================================================
55. NO HARDCODE
============================================================

JANGAN hardcode:

school name
address
logo
student name
card number
QR token
tahun
unit.

============================================================
56. EXPORT
============================================================

Support:

PDF
PNG preview jika
diperlukan.

Word tidak wajib untuk
kartu pelajar kecuali
business requirement
memerlukannya.

============================================================
57. PRINT QUALITY
============================================================

Pastikan:

resolution
QR readability
barcode readability
photo quality
font size

cukup untuk printing.

============================================================
58. QR READABILITY TEST
============================================================

Setiap generated QR
harus diuji:

decode
token lookup
card status
student lookup.

============================================================
59. BARCODE READABILITY
============================================================

Barcode harus diuji
dengan scanner
yang digunakan lembaga.

============================================================
60. CARD EXPIRATION
============================================================

Jika expiration
digunakan:

current date
>
expired_at

→ INVALID.

Jangan menggunakan
frontend date saja.

============================================================
61. CARD REVOCATION
============================================================

Revoked card:

Tidak boleh:

attendance
check-in
identity validation
operational use.

============================================================
62. AUDIT
============================================================

Audit:

created
updated
blocked
unblocked
replaced
revoked
printed
regenerated.

============================================================
63. PRINT AUDIT
============================================================

Jika diperlukan:

printed_by
printed_at
print_count

Gunakan untuk
mengetahui riwayat
pencetakan.

============================================================
64. BULK GENERATION
============================================================

Bulk generation:

SELECT STUDENTS
↓
VALIDATE
↓
SKIP/REPORT EXISTING
↓
GENERATE
↓
SAVE
↓
AUDIT
↓
REPORT.

Jangan membuat
duplicate active card.

============================================================
65. IMPORT
============================================================

Card import hanya
jika memang dibutuhkan.

Default:

GENERATE FROM SYSTEM.

Jangan mengizinkan
import token random
tanpa validation.

============================================================
66. STUDENT TRANSFER
============================================================

Jika student pindah
unit:

Card tetap milik
student.

Policy menentukan
apakah perlu:

update card
atau
replace card.

============================================================
67. STUDENT GRADUATION
============================================================

Saat siswa lulus:

Student Engine
→ status sesuai lifecycle.

Card:

EXPIRED
atau
REVOKED

sesuai policy.

============================================================
68. STUDENT RETURN
============================================================

Jika student kembali
aktif:

buat/aktifkan card
sesuai policy.

Jangan mengaktifkan
card revoked secara
sembarangan.

============================================================
69. CARD SECURITY EVENT
============================================================

Catat:

invalid scan
revoked scan
expired scan
unknown QR
repeated scan

untuk observability.

============================================================
70. RATE LIMIT
============================================================

Scan endpoint
harus memiliki
rate protection.

============================================================
71. PERFORMANCE
============================================================

QR validation harus
ringan:

TOKEN
↓
CARD
↓
STUDENT STATUS

Hindari query
academic/KBM.

============================================================
72. CACHE
============================================================

Cache hanya data
yang aman dan
diperlukan.

Setelah:

block
revoke
replace

invalidate cache.

============================================================
73. TESTING
============================================================

UNIT:

token
status
duplicate
expiration.

INTEGRATION:

student
card
QR
barcode
attendance.

E2E:

generate
print
scan
attendance
revoke
scan again.

============================================================
74. SECURITY TEST
============================================================

Test:

fake token
modified QR
revoked card
expired card
duplicate card
unauthorized block
unauthorized generate.

============================================================
75. NO DUPLICATE ENGINE
============================================================

JANGAN membuat:

student_qr_engine_2
student_barcode_engine_2
card_management_2

REUSE ENGINE EXISTING.

============================================================
76. NO DUPLICATE STUDENT
============================================================

Card harus selalu
mengarah ke:

EXISTING STUDENT.

============================================================
77. NO ACADEMIC DEPENDENCY
============================================================

Card Engine tidak boleh
bergantung langsung pada:

KBM
Leger
Rapor
Nilai

untuk melakukan
identity validation.

============================================================
78. ATTENDANCE DEPENDENCY
============================================================

Card Engine menyediakan
identity validation.

Attendance Engine
menentukan apakah
attendance boleh dibuat.

============================================================
79. FINAL FLOW
============================================================

STUDENT
↓
CREATE CARD
↓
GENERATE TOKEN
↓
GENERATE QR/BARCODE
↓
ACTIVATE
↓
PRINT
↓
STUDENT RECEIVES CARD
↓
SECURITY/GURU SCAN
↓
CARD VALIDATION
↓
ATTENDANCE ENGINE
↓
ATTENDANCE RECORDED

============================================================
80. HEALTH CHECK
============================================================

[ ] Existing Student Engine reused
[ ] Existing Card Engine audited
[ ] No duplicate student master
[ ] No duplicate QR engine
[ ] No duplicate barcode engine
[ ] Card number unique
[ ] Token secure
[ ] Active card protected
[ ] Revocation works
[ ] Replacement works
[ ] QR works
[ ] Barcode works
[ ] Print works
[ ] PDF works
[ ] Attendance integration works
[ ] RBAC works
[ ] Audit works
[ ] No dummy data
[ ] No hardcode
[ ] No academic dependency

============================================================
81. FINAL COMMAND
============================================================

AUDIT FIRST.

REUSE EXISTING STUDENT ENGINE.

REUSE EXISTING CARD ENGINE
IF AVAILABLE.

DO NOT CREATE DUPLICATE MASTER.

DO NOT CREATE DUPLICATE ATTENDANCE.

DO NOT CREATE DUPLICATE QR.

DO NOT CREATE DUPLICATE BARCODE.

DO NOT CREATE DUPLICATE STUDENT.

DO NOT CREATE ACADEMIC LOGIC.

NO DUMMY DATA.

NO HARDCODED SCHOOL DATA.

NO HARDCODED STUDENT DATA.

NO RAW SENSITIVE DATA IN QR.

ALL CRUD MUST WORK.

ALL RELATIONS MUST WORK.

ALL PRINT FUNCTIONS MUST WORK.

ALL PDF FUNCTIONS MUST WORK.

ALL SCAN VALIDATION MUST WORK.

PRODUCTION READY.

# END ENTERPRISE STUDENT CARD & QR IDENTITY ENGINE