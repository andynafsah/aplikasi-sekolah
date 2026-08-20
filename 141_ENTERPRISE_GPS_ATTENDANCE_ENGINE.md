# 141_ENTERPRISE_GPS_ATTENDANCE_ENGINE.md

# ENTERPRISE GPS ATTENDANCE ENGINE
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: LOCATION-BASED EMPLOYEE ATTENDANCE

============================================================
1. OBJECTIVE
============================================================

Membangun GPS Attendance Engine yang aman,
dinamis, configurable, dan terintegrasi
dengan:

- Employee Engine
- Attendance Engine
- Location Master
- RBAC
- Audit Engine
- Notification Engine
- Device/App Layer

Fokus utama:

GURU
KARYAWAN
SECURITY
STAFF
PEGAWAI

============================================================
2. ABSOLUTE RULE
============================================================

GPS ENGINE BUKAN ATTENDANCE ENGINE BARU.

Gunakan:

141 GPS ENGINE
        ↓
139 ATTENDANCE ENGINE
        ↓
ATTENDANCE RECORD

GPS hanya menyediakan:

LOCATION EVIDENCE
+
VALIDATION RESULT

Attendance Engine tetap menjadi
SINGLE SOURCE OF TRUTH
untuk transaksi absensi.

============================================================
3. DOMAIN BOUNDARY
============================================================

GPS ENGINE MENANGANI:

GPS capture
Latitude
Longitude
Accuracy
Geofence
Location validation
Distance calculation
Location policy
GPS attendance validation
GPS evidence
Device location metadata

GPS ENGINE TIDAK MENANGANI:

Employee master
Student master
Card master
QR master
Attendance transaction master
Payroll
KBM
Leger
Rapor

============================================================
4. ARCHITECTURE
============================================================

EMPLOYEE
   ↓
ATTENDANCE REQUEST
   ↓
GPS CAPTURE
   ↓
LOCATION VALIDATION
   ↓
GEOFENCE
   ↓
TIME POLICY
   ↓
ATTENDANCE POLICY
   ↓
139 ATTENDANCE ENGINE
   ↓
ATTENDANCE RECORD
   ↓
AUDIT

============================================================
5. EMPLOYEE SOURCE
============================================================

Employee identity
HARUS berasal dari:

138_EMPLOYEE_MANAGEMENT_ENGINE

Jangan membuat:

gps_employee
gps_teacher
gps_staff

master identity baru.

============================================================
6. GPS REQUEST
============================================================

Minimum:

employee_id
latitude
longitude
accuracy
client_timestamp
request_id

Optional:

altitude
heading
speed
device_id
platform
app_version

Simpan hanya data
yang memang diperlukan.

============================================================
7. SERVER TIMESTAMP
============================================================

Official attendance time:

SERVER TIME

Bukan:

DEVICE TIME

Device timestamp hanya
menjadi supporting evidence.

============================================================
8. TIMEZONE
============================================================

Gunakan timezone
lembaga yang dikonfigurasi.

Contoh:

Asia/Jakarta

Jangan bergantung
pada timezone device.

============================================================
9. LOCATION MASTER
============================================================

Location:

id
name
latitude
longitude
radius
status
timezone
description

Contoh:

Sekolah
Pondok
Kantor
Gerbang
Gedung Administrasi

============================================================
10. MULTIPLE LOCATION
============================================================

Support:

Location A
Location B
Location C

Employee dapat memiliki
policy berbeda berdasarkan
unit atau lokasi.

============================================================
11. GEOFENCE
============================================================

Geofence terdiri dari:

CENTER
+
RADIUS

Center:

latitude
longitude

Radius:

meter

============================================================
12. RADIUS CONFIGURATION
============================================================

Jangan hardcode:

50 meter
100 meter
200 meter

Radius harus berasal dari:

Location Configuration.

============================================================
13. DISTANCE CALCULATION
============================================================

Gunakan formula
geospatial yang tepat
untuk menghitung jarak
antara:

USER LOCATION

dan:

LOCATION CENTER.

Backend adalah sumber
keputusan akhir.

============================================================
14. GEOFENCE RESULT
============================================================

Jika:

distance <= radius

maka:

INSIDE

Jika:

distance > radius

maka:

OUTSIDE

============================================================
15. GPS ACCURACY
============================================================

GPS memiliki:

accuracy meter.

Contoh:

accuracy = 8m

berarti posisi diperkirakan
dalam ketidakpastian sekitar
nilai tersebut.

============================================================
16. ACCURACY POLICY
============================================================

Configuration:

max_accuracy

Jika accuracy melebihi
threshold:

REJECT
atau
WARNING

sesuai policy.

============================================================
17. ACCURACY + GEOFENCE
============================================================

Jangan hanya memeriksa:

distance <= radius.

Pertimbangkan:

distance
+
accuracy.

Jika posisi terlalu
tidak akurat:

hasil dapat ditolak
sesuai policy.

============================================================
18. GPS UNAVAILABLE
============================================================

Jika GPS:

disabled
unavailable
permission denied

maka:

ATTENDANCE REJECTED

atau user diarahkan
ke metode alternatif
jika policy mengizinkan.

============================================================
19. LOCATION PERMISSION
============================================================

Mobile harus meminta:

Location Permission

Jika ditolak:

Tampilkan instruksi
yang jelas.

Jangan crash.

============================================================
20. PRECISE LOCATION
============================================================

Jika platform mendukung:

Precise Location

harus digunakan
untuk GPS attendance.

Jika hanya approximate:

REJECT
atau
WARNING

sesuai konfigurasi.

============================================================
21. MOCK LOCATION
============================================================

Jika platform/device
memberikan indikator
mock location:

catat sebagai
RISK SIGNAL.

Jangan menganggap
indikator tersebut
sebagai bukti absolut.

Policy menentukan:

ALLOW
WARNING
REJECT.

============================================================
22. DEVICE INTEGRITY
============================================================

Jika tersedia:

device integrity
app integrity
root/jailbreak indicator

dapat digunakan
sebagai risk signal.

Jangan membuat
fitur bergantung penuh
pada indikator platform
tertentu.

============================================================
23. GPS SPOOFING
============================================================

Sistem harus dirancang
untuk mengurangi
risiko spoofing.

Layer:

GPS
+
Accuracy
+
Device signal
+
Time
+
Geofence
+
Behavior anomaly
+
Audit

Tidak ada satu layer
yang dianggap 100% anti spoofing.

============================================================
24. REQUEST ID
============================================================

Setiap GPS attendance
request harus memiliki:

request_id

Gunakan untuk
idempotency.

============================================================
25. IDEMPOTENCY
============================================================

Jika request yang sama
dikirim dua kali:

SERVER harus
menghasilkan satu
transaksi.

Bukan dua attendance.

============================================================
26. DUPLICATE CHECK
============================================================

Sebelum attendance:

CHECK:

employee
date
attendance context
session
existing attendance.

Jika duplicate:

REJECT
atau
RETURN EXISTING

sesuai policy.

============================================================
27. CONCURRENCY
============================================================

Dua request
bersamaan harus aman.

Gunakan:

transaction
+
database constraint
+
idempotency.

============================================================
28. ATTENDANCE CONTEXT
============================================================

GPS attendance dapat
memiliki:

CHECK_IN
CHECK_OUT

atau context lain
yang dikonfigurasi.

Jangan membuat
academic attendance.

============================================================
29. WORKING HOURS
============================================================

Configuration:

start_time
late_time
cutoff_time

Contoh:

07:00
07:15
09:00

Semua dinamis.

============================================================
30. LATE
============================================================

Late dihitung
berdasarkan policy.

Contoh:

arrival <= start_time
→ PRESENT

arrival > late_time
→ LATE

Jangan hardcode.

============================================================
31. SERVER-SIDE TIME
============================================================

Status:

PRESENT
LATE
OUTSIDE_WINDOW

ditentukan backend.

Frontend hanya
menampilkan hasil.

============================================================
32. GPS ATTENDANCE FLOW
============================================================

LOGIN
↓
EMPLOYEE VALIDATION
↓
ATTENDANCE SCREEN
↓
LOCATION PERMISSION
↓
CAPTURE GPS
↓
CAPTURE ACCURACY
↓
SEND REQUEST
↓
SERVER VALIDATION
↓
GEOFENCE
↓
TIME POLICY
↓
DUPLICATE CHECK
↓
ATTENDANCE ENGINE
↓
AUDIT
↓
RESULT

============================================================
33. CLIENT VALIDATION
============================================================

Frontend boleh
memberikan:

GPS status
distance estimate
accuracy warning.

Tetapi:

FINAL DECISION
=
BACKEND.

============================================================
34. GPS UI
============================================================

Tampilkan:

Location status
GPS accuracy
School location status
Attendance button
Processing state
Success
Failure

============================================================
35. ATTENDANCE BUTTON
============================================================

States:

READY
LOCATING
VALIDATING
PROCESSING
SUCCESS
FAILED

Jangan mengizinkan
multiple submit
selama processing.

============================================================
36. GPS REFRESH
============================================================

Jika accuracy buruk:

RETRY LOCATION

Jangan otomatis
membuat attendance
dengan posisi buruk.

============================================================
37. GPS TIMEOUT
============================================================

Jika GPS tidak didapat
dalam timeout:

STOP REQUEST

Tampilkan:

"Gagal mendapatkan
lokasi. Pastikan GPS
aktif dan coba kembali."

Timeout configurable.

============================================================
38. LOCATION SERVICE
============================================================

Gunakan service:

LocationService

Tugas:

capture
permission
accuracy
coordinates

Tidak membuat
attendance record.

============================================================
39. GEOFENCE SERVICE
============================================================

Gunakan:

GeofenceService

Tugas:

calculate distance
evaluate radius
return result.

============================================================
40. ATTENDANCE SERVICE
============================================================

AttendanceService
tetap berada di:

139 Attendance Engine.

GPS hanya memanggilnya
setelah validation.

============================================================
41. LOCATION POLICY
============================================================

Policy dapat menentukan:

allowed locations
radius
accuracy
time window
roles
units
attendance method.

============================================================
42. ROLE POLICY
============================================================

Contoh:

GURU:
GPS allowed

STAFF:
GPS allowed

SECURITY:
GPS + wall QR

BENDAHARA:
GPS allowed

Semua configurable.

============================================================
43. UNIT POLICY
============================================================

Unit A:

Location A

Unit B:

Location B

Backend harus
memvalidasi scope.

============================================================
44. LOCATION ASSIGNMENT
============================================================

Employee dapat memiliki:

primary location
allowed locations

sesuai business rule.

============================================================
45. MULTIPLE LOCATION
============================================================

Jika employee
memiliki beberapa
lokasi yang valid:

GPS dapat diterima
jika berada dalam
salah satu location.

============================================================
46. LOCATION STATUS
============================================================

ACTIVE
INACTIVE

Inactive location
tidak dapat digunakan
untuk attendance.

============================================================
47. LOCATION CRUD
============================================================

Support:

CREATE
READ
UPDATE
ARCHIVE

dengan permission.

============================================================
48. LOCATION VALIDATION
============================================================

Saat create/update:

latitude valid
longitude valid
radius valid
name required
status valid.

============================================================
49. COORDINATE VALIDATION
============================================================

Latitude:

-90 sampai +90

Longitude:

-180 sampai +180

Backend wajib validate.

============================================================
50. RADIUS VALIDATION
============================================================

Radius:

> 0

Maksimum sesuai
business policy.

Jangan menerima
nilai absurd.

============================================================
51. LOCATION TEST
============================================================

Admin dapat melakukan:

TEST LOCATION

Input:

latitude
longitude

Result:

distance
inside/outside
accuracy rule.

Tidak membuat
attendance record.

============================================================
52. LOCATION MAP
============================================================

Jika UI memiliki map:

Tampilkan:

location center
radius
current position
distance

Map hanya visualization.

Keputusan tetap
backend.

============================================================
53. MAP PROVIDER
============================================================

Gunakan provider
yang sesuai architecture.

Jangan hardcode API key.

Gunakan:

environment variables
atau configuration.

============================================================
54. API SECURITY
============================================================

GPS endpoint harus:

AUTHENTICATED
+
AUTHORIZED
+
RATE LIMITED
+
VALIDATED.

============================================================
55. RATE LIMIT
============================================================

Protect:

GPS attendance endpoint
location test endpoint
location lookup.

============================================================
56. GPS PAYLOAD
============================================================

Jangan menerima
field yang tidak
diperlukan.

Reject unknown/
unexpected fields jika
validation architecture
mendukung.

============================================================
57. API RESPONSE
============================================================

Success:

{
  success: true,
  data: {
    attendance_id: "...",
    status: "PRESENT"
  }
}

Error:

{
  success: false,
  code: "...",
  message: "..."
}

============================================================
58. ERROR CODES
============================================================

Contoh:

GPS_PERMISSION_DENIED
GPS_UNAVAILABLE
GPS_ACCURACY_LOW
OUTSIDE_GEOFENCE
LOCATION_INACTIVE
ATTENDANCE_DUPLICATE
ATTENDANCE_NOT_ALLOWED
TIME_WINDOW_CLOSED
UNAUTHORIZED
RATE_LIMITED

Gunakan code konsisten.

============================================================
59. ERROR MESSAGES
============================================================

User-facing message
harus sederhana.

Contoh:

"Lokasi Anda berada
di luar area sekolah."

Bukan:

"Geofence validation
returned false."

============================================================
60. AUDIT GPS
============================================================

Catat:

employee_id
timestamp
location_id
latitude
longitude
accuracy
distance
result
method
device_id
risk signals.

============================================================
61. PRIVACY
============================================================

GPS data adalah
data sensitif operasional.

Access harus
permission-based.

============================================================
62. GPS RETENTION
============================================================

Retention policy
harus configurable.

Jangan menghapus
historical evidence
secara sembarangan.

============================================================
63. DATA MINIMIZATION
============================================================

Simpan hanya:

coordinates
accuracy
timestamp
location
distance

jika memang dibutuhkan.

============================================================
64. ENCRYPTION
============================================================

Data sensitif
harus diamankan
sesuai architecture
storage/security.

============================================================
65. EMPLOYEE HISTORY
============================================================

GPS attendance
terhubung ke:

Employee
↓
Attendance

Tidak membuat:

GPS Employee History
sebagai master terpisah.

============================================================
66. NOTIFICATION
============================================================

Jika diperlukan:

Successful check-in
Late
Outside location
Failed attendance

dapat dikirim melalui
Notification Engine.

Jangan membuat
Notification Engine baru.

============================================================
67. ADMIN DASHBOARD
============================================================

Dashboard:

GPS attendance today
Present
Late
Rejected
Outside geofence
Low accuracy
Potential risk signal.

============================================================
68. GPS ATTENDANCE REPORT
============================================================

Report:

Date
Employee
Location
Time
Status
Accuracy
Distance
Method

============================================================
69. EXPORT
============================================================

Support:

PDF
XLSX
CSV

sesuai permission.

============================================================
70. EXPORT PRIVACY
============================================================

GPS coordinates
tidak boleh diekspor
ke semua user.

Role/permission
harus menentukan
akses.

============================================================
71. CORRECTION
============================================================

GPS attendance
tidak boleh diedit
diam-diam.

Jika koreksi:

reason
actor
old data
new status
timestamp

harus dicatat.

============================================================
72. DELETE
============================================================

Jangan hard-delete
GPS attendance
historis.

Gunakan:

VOID
CORRECTION
ARCHIVE

sesuai policy.

============================================================
73. OFFLINE
============================================================

Default:

GPS attendance
memerlukan online
validation.

Jika offline support
dibutuhkan:

QUEUE
↓
SECURE LOCAL STORAGE
↓
SYNC
↓
SERVER VALIDATION.

Offline tidak boleh
langsung dianggap
valid.

============================================================
74. DEVICE CHANGE
============================================================

Employee dapat
menggunakan device
baru jika policy
mengizinkan.

Jangan mengunci
employee secara
permanen ke satu device
tanpa kebutuhan.

============================================================
75. DEVICE REGISTRATION
============================================================

Jika diperlukan:

Register
Approve
Active
Revoke

Device tidak boleh
menjadi identity employee.

============================================================
76. APP VERSION
============================================================

Record:

app_version

untuk debugging
dan observability.

============================================================
77. OBSERVABILITY
============================================================

Monitor:

GPS success
GPS failure
low accuracy
outside geofence
duplicate
latency
server error
permission denied.

============================================================
78. LOGGING
============================================================

Jangan log:

password
JWT
raw sensitive token.

GPS coordinates
hanya dilog jika
dibutuhkan untuk
audit/debugging.

============================================================
79. PERFORMANCE
============================================================

GPS validation harus
cepat.

Hindari:

heavy report query
academic query
student query

pada setiap GPS request.

============================================================
80. CACHE
============================================================

Location configuration
dapat dicache.

Saat berubah:

invalidate cache.

============================================================
81. DATABASE
============================================================

Gunakan existing:

employees
attendance
locations
users
audit_logs

jika sudah tersedia.

Jangan membuat
tabel duplicate.

============================================================
82. INDEX
============================================================

Index sesuai kebutuhan:

employee_id
location_id
attendance_date
created_at
request_id

============================================================
83. CONSTRAINT
============================================================

Protect:

request_id
attendance uniqueness
foreign keys.

============================================================
84. TRANSACTION
============================================================

GPS validation +
attendance creation
harus atomic jika
memerlukan beberapa
database operation.

============================================================
85. TEST UNIT
============================================================

Test:

coordinate validation
distance calculation
geofence
accuracy
time policy
duplicate
idempotency.

============================================================
86. TEST INTEGRATION
============================================================

Test:

Employee
GPS
Location
Attendance
Audit.

============================================================
87. TEST E2E
============================================================

Scenario:

Employee login
↓
GPS permission
↓
inside school
↓
attendance success

Scenario 2:

outside school
↓
attendance rejected

Scenario 3:

accuracy poor
↓
warning/reject

Scenario 4:

duplicate
↓
rejected.

============================================================
88. SECURITY TEST
============================================================

Test:

fake employee ID
fake coordinates
outside location
expired token
duplicate request
unauthorized employee
unauthorized location
rate limit.

============================================================
89. NO DUMMY
============================================================

Production:

NO DUMMY LOCATION
NO DUMMY GPS
NO FAKE ATTENDANCE
NO MOCK COORDINATE
NO FAKE EMPLOYEE.

============================================================
90. NO HARDCODE
============================================================

JANGAN hardcode:

school coordinates
radius
timezone
working hours
late threshold
accuracy threshold.

Semua configurable.

============================================================
91. NO DUPLICATE ENGINE
============================================================

JANGAN membuat:

gps_attendance_2
teacher_gps
staff_gps
security_gps

Gunakan satu engine.

============================================================
92. NO ACADEMIC DEPENDENCY
============================================================

GPS Engine tidak boleh
bergantung pada:

KBM
Leger
Rapor
Nilai
Kurikulum.

============================================================
93. FINAL FLOW
============================================================

EMPLOYEE
↓
LOGIN
↓
GPS REQUEST
↓
CAPTURE LOCATION
↓
SERVER VALIDATION
↓
LOCATION VALIDATION
↓
GEOFENCE
↓
ACCURACY
↓
TIME POLICY
↓
DUPLICATE CHECK
↓
139 ATTENDANCE ENGINE
↓
AUDIT
↓
SUCCESS

============================================================
94. ADMIN LOCATION FLOW
============================================================

ADMIN
↓
LOCATION MASTER
↓
CREATE LOCATION
↓
SET COORDINATE
↓
SET RADIUS
↓
SET POLICY
↓
ACTIVATE
↓
READY FOR GPS ATTENDANCE

============================================================
95. HEALTH CHECK
============================================================

[ ] Existing Employee Engine reused
[ ] Existing Attendance Engine reused
[ ] Location master exists
[ ] Geofence server-side
[ ] Accuracy validation
[ ] Time validation
[ ] Duplicate protection
[ ] Idempotency
[ ] RBAC
[ ] Audit
[ ] Privacy
[ ] Rate limit
[ ] No dummy
[ ] No hardcode
[ ] No academic dependency
[ ] Production error handling
[ ] Mobile error handling
[ ] PDF report works
[ ] XLSX report works

============================================================
96. FINAL COMMAND
============================================================

AUDIT EXISTING GPS/LOCATION
FEATURES FIRST.

REUSE EXISTING LOCATION ENGINE.

REUSE EXISTING ATTENDANCE ENGINE.

REUSE EXISTING EMPLOYEE ENGINE.

DO NOT CREATE SECOND GPS ENGINE.

DO NOT CREATE SECOND LOCATION ENGINE.

DO NOT CREATE SECOND ATTENDANCE ENGINE.

DO NOT CREATE TEACHER GPS ENGINE.

DO NOT CREATE STAFF GPS ENGINE.

DO NOT CREATE SECURITY GPS ENGINE.

NO DUPLICATE TABLE.

NO DUPLICATE API.

NO DUPLICATE ROUTE.

NO DUPLICATE COMPONENT.

NO DUMMY DATA.

NO HARDCODED COORDINATE.

NO HARDCODED RADIUS.

NO HARDCODED TIME.

NO CLIENT-SIDE FINAL VALIDATION.

ALL CRUD MUST WORK.

ALL RELATIONS MUST WORK.

ALL AUDIT MUST WORK.

ALL ERROR STATES MUST WORK.

PRODUCTION READY.

# END ENTERPRISE GPS ATTENDANCE ENGINE