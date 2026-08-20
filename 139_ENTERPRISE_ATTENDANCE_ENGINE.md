# 139_ENTERPRISE_ATTENDANCE_ENGINE.md

# ENTERPRISE ATTENDANCE ENGINE
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: STUDENT & EMPLOYEE ATTENDANCE MANAGEMENT

============================================================
1. OBJECTIVE
============================================================

Membangun satu Attendance Engine terpusat
untuk seluruh kebutuhan absensi:

1. Absensi Siswa/Santri
2. Absensi Guru
3. Absensi Karyawan
4. Absensi Security
5. Absensi Staff
6. Absensi manual
7. Absensi QR Code
8. Absensi Barcode
9. Absensi GPS
10. Rekap absensi
11. Koreksi absensi
12. Audit absensi

============================================================
2. ABSOLUTE RULE
============================================================

HANYA BOLEH ADA SATU:

ATTENDANCE ENGINE

JANGAN membuat:

student-attendance-engine
teacher-attendance-engine
staff-attendance-engine
security-attendance-engine

sebagai engine terpisah.

Gunakan:

ATTENDANCE
↓
SUBJECT TYPE
↓
STUDENT / EMPLOYEE
↓
METHOD
↓
POLICY

============================================================
3. DOMAIN BOUNDARY
============================================================

ATTENDANCE ENGINE MENANGANI:

Attendance record
Attendance status
Attendance method
Scan
GPS
Manual attendance
Correction
Attendance policy
Attendance location
Attendance schedule operasional
Rekap
Audit

TIDAK MENANGANI:

KBM
Kurikulum
Nilai
Penilaian
Leger
Rapor
Mata pelajaran
Jadwal akademik

============================================================
4. SUBJECT TYPES
============================================================

ATTENDANCE SUBJECT:

STUDENT

EMPLOYEE

Employee mencakup:

GURU
TU
SECURITY
STAFF
BENDAHARA
OPERATOR
PIMPINAN
PEGAWAI LAINNYA

============================================================
5. ATTENDANCE ARCHITECTURE
============================================================

                 ATTENDANCE ENGINE
                         │
          ┌──────────────┴──────────────┐
          ↓                             ↓
       STUDENT                        EMPLOYEE
          │                             │
    ┌─────┼─────┐                 ┌────┼────┐
    ↓     ↓     ↓                 ↓    ↓    ↓
   QR   MANUAL  ...               GPS  QR  MANUAL
    │                             │
    └──────────────┬──────────────┘
                   ↓
             VALIDATION
                   ↓
            DUPLICATE CHECK
                   ↓
              DATABASE
                   ↓
                AUDIT
                   ↓
               REPORT

============================================================
6. SINGLE SOURCE OF TRUTH
============================================================

Student attendance
harus menggunakan:

Student Engine.

Employee attendance
harus menggunakan:

Employee Engine.

Card/QR menggunakan:

Card Engine.

Location menggunakan:

Attendance Location Engine.

JANGAN membuat identity
baru di attendance.

============================================================
7. ATTENDANCE RECORD
============================================================

Record minimal:

id
subject_type
subject_id
attendance_date
attendance_time
status
method
location_id
device_id
recorded_by
created_at
updated_at

Gunakan struktur existing
jika sudah tersedia.

============================================================
8. ATTENDANCE STATUS
============================================================

Gunakan enum konsisten:

PRESENT
LATE
ABSENT
EXCUSED
SICK
LEAVE
PERMISSION

Jangan mencampur:

HADIR
Present
present
P

tanpa mapping resmi.

============================================================
9. ATTENDANCE METHOD
============================================================

Metode:

QR
BARCODE
GPS
MANUAL
SYSTEM

============================================================
10. STUDENT ATTENDANCE
============================================================

Siswa dapat melakukan
absensi melalui:

1. QR Code kartu pelajar
2. Barcode kartu pelajar
3. Manual oleh guru
4. Manual oleh security
5. Scan oleh guru menggunakan HP
6. Scan oleh security di gerbang

============================================================
11. STUDENT QR FLOW
============================================================

KARTU PELAJAR
↓
QR CODE
↓
SCAN
↓
DECODE
↓
IDENTIFY STUDENT
↓
VALIDATE CARD
↓
VALIDATE STATUS
↓
CHECK ATTENDANCE POLICY
↓
CHECK DUPLICATE
↓
CREATE ATTENDANCE
↓
AUDIT
↓
SUCCESS

============================================================
12. SECURITY GATE ATTENDANCE
============================================================

Security dapat melakukan
scan siswa di gerbang.

Flow:

SECURITY LOGIN
↓
OPEN SCANNER
↓
SCAN STUDENT CARD
↓
IDENTIFY STUDENT
↓
VALIDATE QR
↓
VALIDATE STUDENT
↓
CHECK TODAY ATTENDANCE
↓
CREATE ENTRY ATTENDANCE
↓
SHOW STUDENT
↓
SUCCESS

============================================================
13. TEACHER ATTENDANCE
============================================================

Guru dapat melakukan
absensi siswa menggunakan HP.

Metode:

QR
BARCODE
MANUAL

Guru hanya boleh
mengakses siswa sesuai
scope permission yang
diberikan.

============================================================
14. MANUAL STUDENT ATTENDANCE
============================================================

Guru/security/admin
dapat melakukan manual
attendance sesuai permission.

Input:

student
date
time
status
reason

Harus tercatat:

recorded_by.

============================================================
15. STUDENT DOUBLE ATTENDANCE
============================================================

Jika siswa sudah
memiliki attendance
pada sesi/hari yang sama:

JANGAN membuat
duplicate record.

Sistem harus menentukan
business rule:

REJECT
atau
UPDATE
atau
CREATE NEW SESSION

sesuai konfigurasi.

Default:

REJECT DUPLICATE.

============================================================
16. ENTRY & CLASS ATTENDANCE
============================================================

Aplikasi ini tidak mengelola
KBM akademik.

Namun dapat memiliki
dua konteks operasional:

ENTRY
→ absensi masuk gerbang.

GENERAL
→ absensi operasional siswa.

Jika aplikasi Leger/KBM
memiliki absensi pembelajaran,
jangan membuat duplikasi
absensi akademik di sini.

============================================================
17. EXTERNAL KBM INTEGRATION
============================================================

Jika dibutuhkan:

Management Attendance
↓
Integration API
↓
KBM/Leger

Tetapi:

Attendance Engine
TIDAK boleh mengambil alih
business logic KBM.

============================================================
18. EMPLOYEE ATTENDANCE
============================================================

Employee dapat melakukan:

GPS
QR/BARCODE
MANUAL

sesuai policy.

============================================================
19. EMPLOYEE GPS FLOW
============================================================

EMPLOYEE LOGIN
↓
OPEN ATTENDANCE
↓
REQUEST GPS
↓
GET LATITUDE
↓
GET LONGITUDE
↓
GET ACCURACY
↓
SEND SERVER
↓
VALIDATE EMPLOYEE
↓
VALIDATE LOCATION
↓
VALIDATE GEOFENCE
↓
VALIDATE TIME
↓
CHECK DUPLICATE
↓
SAVE
↓
AUDIT

============================================================
20. GPS DATA
============================================================

Request:

latitude
longitude
accuracy
timestamp
device_id

Optional:

altitude
heading
speed

Jangan menyimpan
data GPS yang tidak
diperlukan.

============================================================
21. GPS SECURITY
============================================================

Frontend tidak boleh
menentukan sendiri:

VALID
atau
INVALID.

Backend harus melakukan
validasi geofence.

============================================================
22. LOCATION MASTER
============================================================

Attendance location:

id
name
latitude
longitude
radius
status

Contoh:

Sekolah
Pondok
Kantor
Gerbang

============================================================
23. GEOFENCE
============================================================

Geofence:

center latitude
center longitude
radius meter

Backend menghitung
jarak.

Contoh:

Employee
→ 35 meter

Radius:
50 meter

RESULT:
VALID

============================================================
24. GPS ACCURACY
============================================================

Jika accuracy terlalu buruk:

REJECT
atau
WARNING

sesuai policy.

Contoh:

accuracy > configured threshold

Jangan hardcode
angka tanpa konfigurasi.

============================================================
25. GPS SPOOFING
============================================================

Sistem tidak boleh
menganggap GPS sebagai
bukti mutlak.

Jika platform mendukung:

mock location detection
device integrity
location provider info

dapat digunakan sebagai
additional signal.

Jangan menjadikan
satu indikator sebagai
jaminan anti-spoofing.

============================================================
26. EMPLOYEE QR/BARCODE
============================================================

Employee:

CARD
↓
QR/BARCODE
↓
SCAN
↓
IDENTIFY EMPLOYEE
↓
VALIDATE CARD
↓
CHECK POLICY
↓
CREATE ATTENDANCE

============================================================
27. WALL BARCODE
============================================================

Barcode/QR yang ditempel
di dinding sekolah dapat
digunakan sebagai:

ATTENDANCE LOCATION
atau
ATTENDANCE CHECKPOINT.

Contoh:

QR GERBANG
QR KANTOR
QR PONDOK

Jangan memperlakukan
QR lokasi sebagai
identity employee.

============================================================
28. LOCATION QR
============================================================

Location QR harus
memiliki:

location_id
token
status
version

Token harus secure.

JANGAN menggunakan
nama lokasi langsung
sebagai secret.

============================================================
29. CHECKPOINT
============================================================

Checkpoint:

Gate
Office
Dormitory
School
Other.

Setiap checkpoint:

location
QR
policy.

============================================================
30. QR LOCATION FLOW
============================================================

EMPLOYEE
↓
SCAN WALL QR
↓
IDENTIFY LOCATION
↓
VALIDATE TOKEN
↓
GET EMPLOYEE
↓
CHECK POLICY
↓
CREATE ATTENDANCE
↓
AUDIT

============================================================
31. QR ROTATION
============================================================

Jika diperlukan keamanan
lebih tinggi:

Location QR dapat
menggunakan token yang
dapat dirotasi.

Jika QR statis digunakan:

gunakan secure random
identifier.

============================================================
32. ATTENDANCE SESSION
============================================================

Sistem dapat menggunakan
session:

MORNING
AFTERNOON
EVENING
CUSTOM

atau:

ENTRY
EXIT

sesuai kebutuhan.

Jangan membuat
session khusus akademik.

============================================================
33. CHECK-IN
============================================================

Employee:

CHECK-IN

Student:

ENTRY ATTENDANCE

============================================================
34. CHECK-OUT
============================================================

Jika diperlukan:

CHECK-OUT

Gunakan konfigurasi
per module.

============================================================
35. ATTENDANCE POLICY
============================================================

Policy dapat menentukan:

allowed method
time window
late threshold
geofence
accuracy threshold
duplicate rule
checkpoint.

============================================================
36. POLICY HIERARCHY
============================================================

GLOBAL
↓
UNIT
↓
ATTENDANCE TYPE
↓
USER/ROLE

Gunakan hierarchy
sesuai architecture.

============================================================
37. TIME WINDOW
============================================================

Contoh:

Start:
07:00

Late:
07:15

Cutoff:
09:00

Semua harus
configurable.

============================================================
38. TIMEZONE
============================================================

Attendance harus
menggunakan timezone
yang ditetapkan lembaga.

Jangan bergantung
pada timezone device
untuk menentukan
waktu resmi.

============================================================
39. SERVER TIME
============================================================

Waktu final attendance
harus berasal dari
server/database time
atau authoritative time
yang telah ditentukan.

Device timestamp hanya
sebagai supporting data.

============================================================
40. DUPLICATE PROTECTION
============================================================

Gunakan:

database constraint
+
application validation
+
idempotency

untuk mencegah
duplicate attendance.

============================================================
41. IDEMPOTENCY
============================================================

Request attendance
harus memiliki
idempotency mechanism
jika diperlukan.

Contoh:

request_id

atau
unique event identifier.

============================================================
42. CONCURRENCY
============================================================

Dua scanner bersamaan
tidak boleh menghasilkan
duplicate record jika
policy melarangnya.

Gunakan:

transaction
+
unique constraint
+
locking sesuai kebutuhan.

============================================================
43. ATTENDANCE CORRECTION
============================================================

Correction flow:

REQUEST
↓
AUTHORIZATION
↓
OLD RECORD
↓
NEW VALUE
↓
REASON
↓
APPROVAL jika diperlukan
↓
UPDATE
↓
AUDIT

============================================================
44. ATTENDANCE DELETE
============================================================

Jangan menghapus
attendance historis
secara langsung.

Gunakan:

VOID
CANCEL
CORRECTION

jika architecture
mendukung.

============================================================
45. AUDIT
============================================================

Catat:

who
what
when
where
method
old value
new value
reason.

Untuk GPS:

latitude
longitude
accuracy
location.

============================================================
46. DEVICE
============================================================

Jika diperlukan:

device_id
platform
app_version
device_name

Jangan menyimpan
data device yang tidak
diperlukan.

============================================================
47. DEVICE TRUST
============================================================

Jika sistem memerlukan
trusted device:

device registration
↓
approval
↓
active
↓
revoked

Jangan membuat
device trust mandatory
jika belum dibutuhkan
oleh deployment.

============================================================
48. SECURITY ROLE
============================================================

Security dapat memiliki
permission:

attendance.student.scan
attendance.student.view

Tidak otomatis memiliki:

employee.edit
finance.view
document.delete

============================================================
49. TEACHER ROLE
============================================================

Guru dapat memiliki:

attendance.student.scan
attendance.student.manual
attendance.student.view

sesuai konfigurasi.

Tidak otomatis dapat
mengubah master siswa.

============================================================
50. ADMIN/TU
============================================================

TU/Admin dapat memiliki:

attendance.view
attendance.correct
attendance.report

sesuai permission.

============================================================
51. ATTENDANCE DASHBOARD
============================================================

Dashboard:

Total Present
Late
Absent
Excused
Unknown/Unrecorded
Check-in
Check-out

Semua berasal dari
database aktual.

============================================================
52. STUDENT ATTENDANCE DASHBOARD
============================================================

Filter:

date
unit
status
method
checkpoint.

============================================================
53. EMPLOYEE ATTENDANCE DASHBOARD
============================================================

Filter:

date
unit
employee
position
status
method
location.

============================================================
54. ATTENDANCE DETAIL
============================================================

Detail:

Person
Date
Time
Status
Method
Location
Device
Recorded By
Correction History
Audit

============================================================
55. ATTENDANCE LIST
============================================================

Support:

search
filter
sort
pagination
export.

============================================================
56. ATTENDANCE SEARCH
============================================================

Search:

student name
NIS
NISN
employee name
employee number
NIP
card
QR
barcode.

============================================================
57. ATTENDANCE EXPORT
============================================================

Support sesuai kebutuhan:

XLSX
CSV
PDF

Data export harus
mengikuti permission.

============================================================
58. ATTENDANCE REPORT
============================================================

Reports:

daily
weekly
monthly
custom range.

Student:

presence summary.

Employee:

attendance summary.

============================================================
59. RECAPULATION
============================================================

Rekap harus dihitung
dari attendance records.

JANGAN menyimpan
rekap sebagai sumber
utama jika dapat dihitung
dari transaction.

Cache/materialized view
boleh jika diperlukan
untuk performance.

============================================================
60. ABSENCE SUMMARY
============================================================

Summary:

Present
Late
Absent
Excused
Sick
Leave
Permission

============================================================
61. DATA CONSISTENCY
============================================================

Attendance:

student_id
ATAU
employee_id

harus valid.

Jangan sampai:

orphan attendance.

============================================================
62. DATABASE RELATION
============================================================

Attendance
→ Student
ATAU
→ Employee

Attendance
→ Card
Attendance
→ Location
Attendance
→ User/Actor
Attendance
→ Audit

Gunakan relationship
existing.

============================================================
63. DATABASE INDEX
============================================================

Index sesuai kebutuhan:

attendance_date
subject_type
subject_id
status
method
location_id
recorded_by
created_at

============================================================
64. DATABASE CONSTRAINT
============================================================

Gunakan constraint
untuk mencegah:

invalid FK
duplicate event
invalid status.

============================================================
65. TRANSACTION
============================================================

Attendance creation:

VALIDATE
↓
CHECK
↓
CREATE
↓
AUDIT

Gunakan transaction
jika ada beberapa
database operation.

============================================================
66. ERROR HANDLING
============================================================

Handle:

invalid QR
invalid barcode
expired card
revoked card
unknown student
unknown employee
GPS unavailable
outside geofence
poor accuracy
duplicate attendance
permission denied
network error.

============================================================
67. FRONTEND ERROR
============================================================

Jangan menampilkan:

stack trace
database error
internal exception.

Tampilkan pesan
yang mudah dipahami.

============================================================
68. QR SCANNER UI
============================================================

Scanner:

camera permission
camera initialization
scan
processing
success
failure
retry
reset.

Jangan mengirim
request berulang
selama scanner membaca
QR yang sama.

============================================================
69. SCAN DEBOUNCE
============================================================

Gunakan protection
terhadap:

continuous scan
double scan
camera duplicate event.

============================================================
70. MANUAL FORM
============================================================

Form:

person
date
time
status
reason.

Default:

current authorized
context.

Tetap validasi server.

============================================================
71. GPS UI
============================================================

Tampilkan:

GPS status
accuracy
distance
location status
submit status.

Jangan menampilkan
informasi teknis berlebihan
kepada pengguna umum.

============================================================
72. OFFLINE HANDLING
============================================================

Jika offline support
memang dibutuhkan:

QUEUE
↓
STORE LOCALLY SECURELY
↓
SYNC
↓
SERVER VALIDATION
↓
DUPLICATE CHECK
↓
COMMIT

Jangan langsung
anggap offline record
sebagai final.

============================================================
73. OFFLINE SECURITY
============================================================

Data offline harus:

encrypted
scoped
expire
sync safely.

Jangan menyimpan
credential/token
secara tidak aman.

============================================================
74. ATTENDANCE NOTIFICATION
============================================================

Jika diperlukan:

student attendance
→ notification

employee attendance
→ notification

Gunakan Notification
Engine existing.

Jangan membuat
notification engine kedua.

============================================================
75. ATTENDANCE INTEGRATION
============================================================

Attendance dapat
digunakan oleh:

Dashboard
Reports
Notification
Audit
Finance jika ada
policy terkait.

Tidak digunakan
untuk membuat
academic grade.

============================================================
76. EXTERNAL SYSTEM
============================================================

Jika Leger/KBM
membutuhkan data:

gunakan Integration API.

Jangan membuat
duplicate academic
attendance engine.

============================================================
77. API
============================================================

Gunakan existing API
architecture.

Contoh:

GET /attendance
GET /attendance/:id

POST /attendance/student/scan
POST /attendance/student/manual

POST /attendance/employee/gps
POST /attendance/employee/scan
POST /attendance/employee/manual

POST /attendance/:id/correction

JIKA endpoint existing
sudah tersedia:

REUSE.

============================================================
78. API VALIDATION
============================================================

Semua endpoint:

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
79. API RATE LIMIT
============================================================

Sensitive endpoint:

QR scan
Barcode scan
GPS attendance
Manual attendance

harus memiliki
rate protection sesuai
kebutuhan.

============================================================
80. API RESPONSE
============================================================

Success:

{
  "success": true,
  "message": "...",
  "data": {}
}

Error:

{
  "success": false,
  "message": "...",
  "errors": {}
}

============================================================
81. NO DUMMY ATTENDANCE
============================================================

Production:

NO MOCK ATTENDANCE.

NO FAKE GPS.

NO FAKE QR.

NO FAKE STUDENT.

NO FAKE EMPLOYEE.

============================================================
82. NO HARDCODE
============================================================

JANGAN hardcode:

school coordinates
radius
working hours
late threshold
attendance status
unit.

Gunakan configuration/database.

============================================================
83. CONFIGURATION
============================================================

Attendance configuration:

school location
checkpoint
radius
working hours
late threshold
allowed method
duplicate policy.

Semua configurable
sesuai permission.

============================================================
84. MULTI LOCATION
============================================================

Jika sekolah/pondok
memiliki beberapa lokasi:

Location
→ Checkpoint
→ Policy

Contoh:

Gerbang Utama
Gerbang Pondok
Kantor
Gedung Sekolah.

============================================================
85. ATTENDANCE POLICY
============================================================

Policy dapat berbeda
antara:

Student
Employee.

Contoh:

Student:
QR only at gate.

Employee:
GPS + wall QR.

============================================================
86. SECURITY GATE MODE
============================================================

Mode khusus:

SECURITY ATTENDANCE

UI sederhana:

SCAN
↓
IDENTIFY
↓
SHOW PHOTO
↓
SHOW NAME
↓
SHOW STATUS
↓
CONFIRM
↓
NEXT SCAN

Optimalkan untuk
scan cepat.

============================================================
87. TEACHER SCAN MODE
============================================================

Guru:

OPEN SCANNER
↓
SCAN STUDENT
↓
SHOW STUDENT
↓
MARK ATTENDANCE
↓
NEXT

Dapat juga:

MANUAL SEARCH
↓
SELECT STUDENT
↓
MARK STATUS.

============================================================
88. EMPLOYEE SELF ATTENDANCE
============================================================

Employee:

OPEN ATTENDANCE
↓
GPS/QR
↓
VALIDATE
↓
CHECK-IN
↓
RESULT.

============================================================
89. ATTENDANCE HISTORY
============================================================

Student:

history by date.

Employee:

history by date.

User hanya melihat
data sesuai scope.

============================================================
90. CORRECTION APPROVAL
============================================================

Untuk perubahan
historis penting:

REQUEST
↓
APPROVAL
↓
CHANGE
↓
AUDIT

Jika workflow approval
belum diperlukan,
gunakan direct correction
dengan permission dan
audit.

============================================================
91. ATTENDANCE DATA RETENTION
============================================================

Jangan menghapus
history secara otomatis
tanpa retention policy.

Retention harus
dikonfigurasi.

============================================================
92. PERFORMANCE
============================================================

Optimalkan:

QR scan response
database indexes
pagination
cache
bulk report.

Target UX:

scan
→ response cepat.

Jangan melakukan
query berat pada
setiap scan.

============================================================
93. OBSERVABILITY
============================================================

Monitor:

scan success
scan failure
GPS failure
duplicate
API latency
database error
camera error.

============================================================
94. AUDIT REPORT
============================================================

Output:

Total attendance
By status
By method
By location
By unit
By role
Correction count
Failed scan
Duplicate attempts.

============================================================
95. TESTING
============================================================

UNIT:

status
policy
geofence
duplicate
permission.

INTEGRATION:

QR
Barcode
GPS
Manual
Correction.

E2E:

Security scan
Teacher scan
Employee GPS
Employee wall QR.

============================================================
96. SECURITY TEST
============================================================

Test:

invalid QR
revoked QR
expired card
wrong employee
wrong unit
outside geofence
fake coordinates
duplicate request
unauthorized correction.

============================================================
97. MASTER DATA DEPENDENCY
============================================================

Student attendance
→ Student Master.

Employee attendance
→ Employee Master.

Card
→ Card Master.

Location
→ Location Master.

User
→ RBAC.

Jangan membuat
master baru.

============================================================
98. FINAL ATTENDANCE FLOW
============================================================

IDENTIFY PERSON
↓
VALIDATE IDENTITY
↓
VALIDATE CARD/GPS/MANUAL
↓
VALIDATE POLICY
↓
VALIDATE TIME
↓
VALIDATE LOCATION
↓
CHECK DUPLICATE
↓
CREATE ATTENDANCE
↓
AUDIT
↓
NOTIFICATION/REPORT

============================================================
99. HEALTH CHECK
============================================================

[ ] Single attendance engine
[ ] Student integration valid
[ ] Employee integration valid
[ ] Card integration valid
[ ] QR integration valid
[ ] Barcode integration valid
[ ] GPS integration valid
[ ] Location master valid
[ ] Geofence server-side
[ ] Duplicate protection
[ ] Idempotency
[ ] RBAC
[ ] Audit
[ ] Pagination
[ ] Search
[ ] Filter
[ ] Export
[ ] No dummy
[ ] No hardcode
[ ] No academic logic
[ ] No duplicate engine

============================================================
100. FINAL COMMAND
============================================================

AUDIT EXISTING ATTENDANCE FIRST.

REUSE EXISTING ATTENDANCE ENGINE.

DO NOT CREATE SECOND ATTENDANCE ENGINE.

DO NOT CREATE TEACHER ATTENDANCE ENGINE.

DO NOT CREATE SECURITY ATTENDANCE ENGINE.

DO NOT CREATE STAFF ATTENDANCE ENGINE.

DO NOT CREATE SECOND QR ENGINE.

DO NOT CREATE SECOND BARCODE ENGINE.

DO NOT CREATE SECOND GPS ENGINE.

DO NOT CREATE STUDENT MASTER DUPLICATE.

DO NOT CREATE EMPLOYEE MASTER DUPLICATE.

DO NOT CREATE KBM ATTENDANCE ENGINE.

DO NOT CREATE LEGER ATTENDANCE ENGINE.

DO NOT CREATE RAPOR ATTENDANCE ENGINE.

NO DUMMY DATA.

NO MOCK PRODUCTION DATA.

NO HARDCODED LOCATION.

NO HARDCODED TIME.

NO HARDCODED SCHOOL POLICY.

REUSE EXISTING ARCHITECTURE.

EXTEND ONLY WHEN NECESSARY.

PRODUCTION READY.

# END ENTERPRISE ATTENDANCE ENGINE