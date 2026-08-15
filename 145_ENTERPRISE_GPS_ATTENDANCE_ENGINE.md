# 145 — ENTERPRISE GPS ATTENDANCE ENGINE

## PRODUCTION GPS + GOOGLE MAPS ATTENDANCE MASTER PROMPT

Anda bertindak sebagai:

- Senior Flutter Engineer
- Senior Backend Engineer
- GIS/Location Engineer
- Security Engineer
- Database Engineer
- API Architect
- QA Engineer

Implementasikan GPS Attendance Engine pada CODEBASE
yang SUDAH ADA.

JANGAN membuat project baru.

JANGAN membuat simulasi GPS.

JANGAN membuat fake location.

JANGAN menggunakan hardcoded latitude/longitude.

JANGAN menggunakan dummy attendance.

SEMUA lokasi, radius, jadwal, pegawai, unit,
dan attendance harus berasal dari DATABASE.

============================================================
# 1. TUJUAN
============================================================

Membangun sistem absensi Guru dan Karyawan
berbasis:

1. GPS device
2. Google Maps
3. Geofencing
4. Attendance Location
5. Check In
6. Check Out
7. Shift/Jadwal
8. Radius
9. GPS Accuracy
10. Server-side validation
11. Anti duplicate
12. Audit log.

============================================================
# 2. FLOW UTAMA
============================================================

KARYAWAN/GURU

LOGIN
 ↓
DASHBOARD
 ↓
ABSENSI
 ↓
GOOGLE MAP
 ↓
GET CURRENT LOCATION
 ↓
SERVER VALIDATION
 ↓
CHECK:
USER
UNIT
LOCATION
RADIUS
ACCURACY
SCHEDULE
ATTENDANCE WINDOW
DUPLICATE
 ↓
VALID
 ↓
CHECK IN
 ↓
CHECK OUT
 ↓
AUDIT

============================================================
# 3. GOOGLE MAPS
============================================================

Halaman GPS Attendance harus menampilkan
Google Maps secara dominan.

Layout:

+--------------------------------------+
| ABSENSI                              |
+--------------------------------------+
|                                      |
|                                      |
|             GOOGLE MAP               |
|                                      |
|               ● YOU                  |
|                                      |
|                    ● SEKOLAH         |
|                                      |
|          (ATTENDANCE RADIUS)         |
|                                      |
|                                      |
+--------------------------------------+
| Status Lokasi                        |
| Dalam Area                           |
| Jarak: 72 m                          |
| Akurasi: 8 m                         |
+--------------------------------------+
| [ ABSEN MASUK ]                      |
+--------------------------------------+

Map harus menggunakan
lokasi aktual device.

============================================================
# 4. MAP DATA
============================================================

Map menampilkan:

Current User Location
Attendance Location
Radius Circle
Distance
Accuracy.

Jika multi-unit:

attendance location berasal
dari unit user.

Jangan hardcode:

latitude
longitude
radius.

============================================================
# 5. ATTENDANCE LOCATION
============================================================

Database:

attendance_locations

Field minimal:

id
unit_id
name
code
latitude
longitude
radius_meters
minimum_accuracy_meters
status
created_at
updated_at
deleted_at.

============================================================
# 6. MULTI LOCATION
============================================================

Satu unit dapat memiliki
beberapa lokasi.

Contoh:

Gerbang Utama
Kantor Guru
Kantor TU
Pondok Putra
Pondok Putri.

Admin dapat menentukan:

active
inactive.

============================================================
# 7. LOCATION PRIORITY
============================================================

Jika terdapat beberapa lokasi:

Backend dapat menentukan:

primary location

atau

nearest authorized location.

Jangan biarkan frontend
memilih lokasi yang tidak authorized.

============================================================
# 8. GPS PERMISSION
============================================================

Saat membuka attendance:

Check permission.

State:

PERMISSION_UNKNOWN

PERMISSION_GRANTED

PERMISSION_DENIED

PERMISSION_PERMANENTLY_DENIED.

============================================================
# 9. GPS SERVICE
============================================================

Flutter harus menggunakan
location service resmi/terpercaya
yang sesuai dengan project.

Jangan membuat GPS engine sendiri
jika library yang sudah digunakan
telah memenuhi kebutuhan.

============================================================
# 10. LOCATION STATE
============================================================

State:

INITIALIZING

REQUESTING_PERMISSION

GETTING_LOCATION

LOCATION_READY

VALIDATING

INSIDE_RADIUS

OUTSIDE_RADIUS

LOW_ACCURACY

LOCATION_DISABLED

ERROR.

============================================================
# 11. LOCATION PERMISSION DENIED
============================================================

Jika denied:

Tampilkan:

IZIN LOKASI DIPERLUKAN

"Lokasi diperlukan untuk memvalidasi
absensi Anda."

Button:

[ COBA LAGI ]

Jika permanently denied:

[ BUKA PENGATURAN ]

Jangan crash.

============================================================
# 12. GPS DISABLED
============================================================

Jika GPS device disabled:

Tampilkan:

"Layanan lokasi perangkat tidak aktif."

Button:

[ AKTIFKAN LOKASI ]

Gunakan mekanisme native platform
yang sesuai.

============================================================
# 13. CURRENT LOCATION
============================================================

Ambil:

latitude
longitude
accuracy
timestamp.

Jika tersedia:

altitude
speed
heading

boleh digunakan untuk telemetry,
tetapi jangan disimpan jika
tidak dibutuhkan.

============================================================
# 14. GPS ACCURACY
============================================================

Accuracy berasal dari device.

Contoh:

8 meter = baik.

150 meter = buruk.

Server menentukan batas maksimum.

Contoh:

minimum_accuracy_meters = 50.

Jika accuracy > 50:

reject.

Jangan frontend yang menentukan
hasil final.

============================================================
# 15. DISTANCE CALCULATION
============================================================

Backend menghitung jarak:

device coordinates
↓
attendance location coordinates.

Gunakan metode geospatial
yang konsisten.

Contoh:

Haversine formula

atau fungsi GIS database
yang tersedia.

Jangan percaya:

distance_meters

yang dikirim frontend.

Frontend hanya mengirim:

latitude
longitude
accuracy.

============================================================
# 16. SERVER-SIDE VALIDATION
============================================================

Backend menerima:

latitude
longitude
accuracy
timestamp/client transaction ID.

Backend mengambil:

authorized location
radius
accuracy threshold
schedule
attendance policy.

Kemudian menghitung:

distance.

Server menentukan:

VALID
atau
INVALID.

============================================================
# 17. INSIDE RADIUS
============================================================

Jika:

distance <= radius

dan

accuracy <= maximum_accuracy

maka:

LOCATION_VALID.

UI:

✓ DALAM AREA ABSENSI

Jarak:

XX meter.

Akurasi:

XX meter.

Button:

[ ABSEN MASUK ]

============================================================
# 18. OUTSIDE RADIUS
============================================================

Jika:

distance > radius.

UI:

DI LUAR AREA ABSENSI

Jarak:

350 meter.

Button:

[ PERBARUI LOKASI ]

Jangan mengirim
attendance request sebagai valid.

Server tetap melakukan
final validation.

============================================================
# 19. ACCURACY TOO LOW
============================================================

Jika:

accuracy > configured threshold.

UI:

LOKASI BELUM CUKUP AKURAT.

Contoh:

Akurasi saat ini: 120 m
Maksimum: 50 m.

Button:

[ PERBARUI LOKASI ]

============================================================
# 20. CHECK-IN
============================================================

Endpoint:

POST
/api/v1/attendance/employees/gps/check-in

Request:

{
  "latitude": -0.000000,
  "longitude": 100.000000,
  "accuracy": 8.2,
  "client_transaction_id": "..."
}

Jangan menerima:

employee_id
unit_id
radius
status
distance.

Semua ditentukan server.

============================================================
# 21. CHECK-IN SERVER FLOW
============================================================

AUTHENTICATE
 ↓
GET AUTHENTICATED USER
 ↓
GET EMPLOYEE
 ↓
GET UNIT
 ↓
GET AUTHORIZED ATTENDANCE LOCATION
 ↓
GET ATTENDANCE POLICY
 ↓
GET CURRENT SCHEDULE
 ↓
VALIDATE GPS
 ↓
CALCULATE DISTANCE
 ↓
VALIDATE RADIUS
 ↓
VALIDATE ACCURACY
 ↓
VALIDATE ATTENDANCE WINDOW
 ↓
CHECK DUPLICATE
 ↓
CREATE ATTENDANCE
 ↓
CREATE AUDIT
 ↓
COMMIT.

============================================================
# 22. CHECK-IN SUCCESS
============================================================

Response:

{
  "success": true,
  "data": {
    "attendance_id": "...",
    "status": "PRESENT",
    "check_in_at": "...",
    "location": {
      "name": "...",
      "distance_meters": 72.5,
      "accuracy_meters": 8.2
    }
  }
}

UI:

ABSEN MASUK BERHASIL

07:25

Status:

HADIR.

============================================================
# 23. LATE ATTENDANCE
============================================================

Backend menentukan:

ON_TIME

atau

LATE.

Berdasarkan:

schedule
work_start
grace_period.

Contoh:

Schedule:

07:30

Grace:

10 menit.

07:35:

ON_TIME.

07:45:

LATE.

Jangan menghitung status final
hanya dari frontend.

============================================================
# 24. ATTENDANCE POLICY
============================================================

Database/configurable:

work_start
work_end
grace_period_minutes
minimum_accuracy_meters
radius_meters
allow_early_checkin
early_checkin_minutes
allow_late_checkin
require_location
require_location_qr
require_gps.

============================================================
# 25. CHECK-IN WINDOW
============================================================

Contoh:

Work start:

07:30

Allowed early:

60 menit.

Maka check-in:

06:30 → allowed.

06:00 → reject jika policy demikian.

Semua configurable.

============================================================
# 26. CHECK-OUT
============================================================

Endpoint:

POST
/api/v1/attendance/employees/gps/check-out

Request:

{
  "latitude": -0.000000,
  "longitude": 100.000000,
  "accuracy": 8.2,
  "client_transaction_id": "..."
}

Backend:

Find today's attendance.

Validate:

exists
not already checked out
GPS
location
schedule/policy.

============================================================
# 27. CHECK-OUT SUCCESS
============================================================

UI:

ABSEN PULANG BERHASIL

Jam:

16:05.

Status:

SELESAI.

Update dashboard.

============================================================
# 28. CHECK-IN WITHOUT CHECKOUT
============================================================

Jika user mencoba check-in lagi
setelah sudah check-in:

409

ATTENDANCE_ALREADY_CHECKED_IN.

UI:

"Anda sudah melakukan absensi masuk."

============================================================
# 29. CHECK-OUT WITHOUT CHECK-IN
============================================================

409

CHECK_IN_NOT_FOUND.

UI:

"Absensi masuk hari ini belum tercatat."

============================================================
# 30. DUPLICATE CHECK-OUT
============================================================

409

ATTENDANCE_ALREADY_CHECKED_OUT.

UI:

"Absensi pulang sudah tercatat."

============================================================
# 31. LOCATION QR + GPS
============================================================

Jika policy:

require_location_qr = true

maka:

SCAN LOCATION QR
 ↓
GET GPS
 ↓
SERVER VALIDATION
 ↓
CHECK-IN.

Jika:

require_location_qr = false

GPS saja dapat digunakan.

============================================================
# 32. LOCATION QR + GPS SECURITY
============================================================

QR location tidak boleh
menjadi satu-satunya bukti
jika policy membutuhkan GPS.

Backend validasi:

QR
+
Authenticated User
+
GPS
+
Radius
+
Accuracy
+
Time.

============================================================
# 33. GOOGLE MAP MARKERS
============================================================

Marker:

USER

SCHOOL.

User marker:

current GPS.

School marker:

attendance location.

Circle:

radius.

Map harus otomatis
memusatkan tampilan
agar kedua marker terlihat.

============================================================
# 34. MAP CAMERA
============================================================

Saat location tersedia:

Map center:

current location.

Jika school location tersedia:

fit bounds.

Jangan membuat kamera
terlalu jauh sehingga lokasi
tidak terlihat.

============================================================
# 35. MAP REFRESH
============================================================

Button:

[ PERBARUI LOKASI ]

Saat ditekan:

GET GPS terbaru.

Update:

marker
accuracy
distance
status.

============================================================
# 36. LOCATION TIMESTAMP
============================================================

Server harus mempertimbangkan
timestamp data lokasi.

Jangan menerima koordinat
yang terlalu lama jika policy
mengharuskan lokasi realtime.

============================================================
# 37. ANTI GPS SPOOFING
============================================================

Implementasikan protection
sebatas kemampuan platform.

Periksa jika tersedia:

mock location indicator
location provider metadata
suspicious accuracy
impossible movement
stale timestamp
abnormal location jump.

Jika terdeteksi:

LOCATION_SUSPICIOUS.

Jangan otomatis menghukum user
tanpa policy yang jelas.

Buat audit/security event.

============================================================
# 38. IMPOSSIBLE MOVEMENT
============================================================

Contoh:

Lokasi sebelumnya:

Sekolah.

5 detik kemudian:

lokasi 20 km.

Tandai:

SUSPICIOUS_LOCATION_MOVEMENT.

Tidak boleh digunakan sebagai
satu-satunya dasar keputusan
tanpa policy.

============================================================
# 39. LOCATION TELEMETRY
============================================================

Simpan hanya data yang dibutuhkan:

latitude
longitude
accuracy
timestamp
attendance_location_id.

Jangan menyimpan tracking
terus-menerus jika tidak diperlukan.

PRIVACY FIRST.

============================================================
# 40. NO CONTINUOUS TRACKING
============================================================

Sistem absensi tidak boleh
secara otomatis melacak lokasi
pegawai sepanjang hari
jika fitur tersebut tidak diperlukan.

GPS digunakan untuk:

attendance validation.

Bukan surveillance.

============================================================
# 41. LOCATION PRIVACY
============================================================

User harus mengetahui:

GPS digunakan untuk
validasi absensi.

Jangan menggunakan lokasi
untuk tujuan lain tanpa
kebijakan/izin yang sesuai.

============================================================
# 42. MULTI UNIT
============================================================

User dapat bekerja pada
unit tertentu.

Contoh:

SD
SMP
SMA
Pondok.

Server mengambil lokasi
berdasarkan assignment.

============================================================
# 43. MULTI LOCATION
============================================================

Jika employee memiliki
authorized locations:

Location A
Location B.

Backend dapat menerima
lokasi terdekat yang authorized.

Jangan izinkan user memilih
location_id arbitrer untuk
melewati geofence.

============================================================
# 44. SHIFT
============================================================

Support:

Shift Pagi
Shift Siang
Shift Malam.

Data:

shift_id
start_time
end_time
grace_period.

Attendance engine menentukan
shift dari assignment/schedule.

============================================================
# 45. HARI KERJA
============================================================

Periksa:

weekday
holiday
leave
special schedule.

Jika hari libur:

ATTENDANCE_NOT_REQUIRED

atau policy lain
yang dikonfigurasi.

============================================================
# 46. LEAVE
============================================================

Jika employee memiliki
approved leave:

Server dapat menentukan:

LEAVE.

Jangan biarkan frontend
mengubah status menjadi
PRESENT.

============================================================
# 47. HOLIDAY
============================================================

Jika tanggal termasuk
holiday:

Check-in dapat:

disabled

atau:

allowed by special policy.

Konfigurasi melalui backend.

============================================================
# 48. DASHBOARD
============================================================

Employee dashboard:

Hari ini

Check In
Check Out
Status
Location.

Contoh:

┌──────────────────────────┐
│ ABSENSI HARI INI         │
│                          │
│ 07:24       16:03        │
│ MASUK       PULANG       │
│                          │
│ HADIR                    │
└──────────────────────────┘

============================================================
# 49. ATTENDANCE HISTORY
============================================================

Tampilkan:

Tanggal
Masuk
Pulang
Status
Lokasi
Metode.

Filter:

Tanggal
Status
Unit.

============================================================
# 50. ATTENDANCE DETAIL
============================================================

Detail:

Tanggal
Check-in
Check-out
Status
Method
Location
Distance
Accuracy.

Jika policy memungkinkan:

Show Map.

============================================================
# 51. GPS ERROR
============================================================

Error codes:

GPS_PERMISSION_DENIED

GPS_DISABLED

GPS_TIMEOUT

GPS_ACCURACY_TOO_LOW

OUTSIDE_ATTENDANCE_RADIUS

LOCATION_NOT_AVAILABLE

SUSPICIOUS_LOCATION.

============================================================
# 52. API ERROR MAPPING
============================================================

422:

Business rule failure.

409:

Duplicate/conflict.

403:

Permission.

401:

Authentication.

500:

Server error.

Frontend tidak menampilkan
stack trace.

============================================================
# 53. IDEMPOTENCY
============================================================

Gunakan:

client_transaction_id.

Jika request sama dikirim
dua kali:

return existing result.

Jangan membuat dua attendance.

============================================================
# 54. DATABASE CONSTRAINT
============================================================

Attendance employee:

unique:

employee_id
+
attendance_date.

Jika attendance memiliki
multiple sessions:

gunakan unique constraint
sesuai session model.

Jangan membuat constraint
yang bertentangan dengan
business policy.

============================================================
# 55. TRANSACTION
============================================================

Check-in:

BEGIN
 ↓
Validate
 ↓
Calculate distance
 ↓
Check duplicate
 ↓
Insert
 ↓
Audit
 ↓
COMMIT.

Failure:

ROLLBACK.

============================================================
# 56. TIMEZONE
============================================================

Semua attendance harus
menggunakan timezone unit/organization.

Jangan mengandalkan timezone
device sebagai source of truth.

Database:

UTC atau timezone architecture
yang sudah digunakan project.

Presentation:

timezone unit/user.

============================================================
# 57. SERVER TIME
============================================================

Status:

on-time
late
attendance window

ditentukan berdasarkan
server time.

Jangan percaya jam device.

============================================================
# 58. LOCATION CONFIGURATION UI
============================================================

Admin dapat:

Create location
Edit location
Disable location
Set radius
Set accuracy threshold
Set primary location
Generate location QR.

============================================================
# 59. LOCATION CRUD
============================================================

GET
/api/v1/attendance/locations

POST
/api/v1/attendance/locations

GET
/api/v1/attendance/locations/{id}

PUT
/api/v1/attendance/locations/{id}

DELETE
/api/v1/attendance/locations/{id}

Semua permission protected.

============================================================
# 60. LOCATION VALIDATION
============================================================

Saat create/update:

latitude valid
longitude valid
radius > 0
accuracy threshold > 0
unit valid.

Jangan menerima
location tanpa unit.

============================================================
# 61. RADIUS CONFIGURATION
============================================================

Contoh:

50 meter
100 meter
150 meter.

Default bukan hardcoded
di Flutter.

Backend configuration.

============================================================
# 62. ADMIN MAP PICKER
============================================================

Saat admin membuat location:

Tampilkan Google Map.

Admin dapat:

search location
drag marker
set coordinate
set radius.

Preview:

School Location
+
Radius.

Save ke database.

============================================================
# 63. LOCATION MAP
============================================================

Admin melihat:

Nama
Unit
Status
Radius
Coordinates.

Map preview.

============================================================
# 64. SECURITY
============================================================

Jangan expose:

private configuration
security secrets
internal database information.

API hanya mengembalikan
data yang dibutuhkan client.

============================================================
# 65. AUDIT
============================================================

Record:

GPS_CHECK_IN
GPS_CHECK_OUT
LOCATION_VALIDATION_FAILED
OUTSIDE_RADIUS
LOW_ACCURACY
SUSPICIOUS_LOCATION
LOCATION_CREATED
LOCATION_UPDATED
LOCATION_DISABLED.

============================================================
# 66. REPORT
============================================================

Report employee:

Date
Employee
Unit
Check In
Check Out
Status
Method
Location.

Filter:

Unit
Employee
Date
Status.

============================================================
# 67. EXPORT
============================================================

Support:

PDF
XLSX
CSV

Jika backend telah memiliki
report engine:

REUSE.

Jangan membuat engine
export duplicate.

============================================================
# 68. NOTIFICATION
============================================================

Optional notification:

Attendance successful
Late
Missed check-in
Missed check-out.

Notification berasal dari
backend/event system.

============================================================
# 69. OFFLINE
============================================================

Default:

GPS attendance membutuhkan
server validation realtime.

Jika offline:

Jangan tampilkan success.

Tampilkan:

"Tidak ada koneksi internet.
Absensi belum dapat diverifikasi."

Offline queue hanya boleh
digunakan jika business policy
secara eksplisit mengizinkan.

============================================================
# 70. FLUTTER ARCHITECTURE
============================================================

Gunakan architecture project
yang sudah ada.

Minimal:

LocationService
GoogleMapService
EmployeeAttendanceRepository
AttendanceLocationRepository
AttendanceState.

Flow:

UI
 ↓
State
 ↓
Repository
 ↓
API
 ↓
Backend.

============================================================
# 71. MAP UI STATES
============================================================

MAP_LOADING

MAP_READY

MAP_ERROR

LOCATION_LOADING

LOCATION_READY

VALID

INVALID

LOW_ACCURACY.

Setiap state harus memiliki
UI yang jelas.

============================================================
# 72. BUTTON STATE
============================================================

ABSEN MASUK:

Disabled ketika:

location loading
outside radius
low accuracy
API processing
already checked in.

Enabled:

location valid
attendance window valid
user authorized.

Server tetap melakukan
final validation.

============================================================
# 73. DOUBLE TAP PROTECTION
============================================================

Saat submit:

button disabled.

Tampilkan:

Memproses absensi...

Request hanya satu.

============================================================
# 74. MOBILE SECURITY
============================================================

Jangan menyimpan:

password
secret
sensitive token

dalam plaintext.

Gunakan secure storage
untuk authentication.

============================================================
# 75. API SECURITY
============================================================

Rate limit:

GPS check-in
GPS check-out
location validation.

Audit:

user
device/session identifier
timestamp
result.

Jangan menyimpan
informasi device berlebihan.

============================================================
# 76. TEST CASE
============================================================

TEST 01
GPS permission granted.

TEST 02
GPS permission denied.

TEST 03
GPS disabled.

TEST 04
Location inside radius.

TEST 05
Location outside radius.

TEST 06
Accuracy acceptable.

TEST 07
Accuracy too low.

TEST 08
Check-in success.

TEST 09
Duplicate check-in.

TEST 10
Check-out success.

TEST 11
Duplicate checkout.

TEST 12
Checkout without check-in.

TEST 13
Late attendance.

TEST 14
Before attendance window.

TEST 15
Holiday.

TEST 16
Approved leave.

TEST 17
Wrong unit.

TEST 18
Wrong location.

TEST 19
Concurrent requests.

TEST 20
Network timeout.

TEST 21
Expired authentication.

TEST 22
Suspicious GPS.

============================================================
# 77. SECURITY TEST
============================================================

Manipulasi:

latitude
longitude
accuracy
employee_id
unit_id
location_id
attendance_status
timestamp.

Server harus mengabaikan
atau menolak manipulasi.

============================================================
# 78. ANTI-FRAUD
============================================================

Jangan mengklaim sistem
100% mampu mendeteksi GPS spoofing.

Gunakan layered security:

GPS
+
accuracy
+
server validation
+
time
+
authorized location
+
QR optional
+
audit
+
suspicious movement detection.

============================================================
# 79. PRODUCTION RULE
============================================================

Hapus:

fake map
fake GPS
fake marker
dummy location
dummy attendance
simulation mode
demo check-in
demo checkout.

Semua data:

DATABASE.

============================================================
# 80. EXISTING CODEBASE
============================================================

Sebelum coding:

Audit:

existing location service
existing Google Maps
existing attendance
existing employee
existing unit
existing schedule
existing shift
existing RBAC
existing API
existing database.

REUSE jika sudah tersedia.

Jangan membuat duplicate service.

============================================================
# 81. MIGRATION
============================================================

Jika schema sudah ada:

buat migration hanya
untuk kebutuhan yang belum ada.

Jangan duplicate table:

attendance
locations
employees
units.

============================================================
# 82. FINAL INTEGRATION
============================================================

Integrasikan:

143 REST API
144 QR Engine
145 GPS Engine.

Flow:

Employee
 ↓
GPS
 ↓
Google Maps
 ↓
Optional Location QR
 ↓
REST API
 ↓
Validation
 ↓
Attendance
 ↓
Audit
 ↓
Notification.

============================================================
# 83. PRODUCTION QA
============================================================

Run:

flutter analyze
flutter test
integration tests
backend unit tests
API tests
database tests
RBAC tests
GPS tests
Google Maps tests
E2E tests.

Target:

0 critical errors.

============================================================
# 84. FINAL ACCEPTANCE
============================================================

Karyawan/Guru dapat:

LOGIN
 ↓
BUKA ABSENSI
 ↓
LIHAT GOOGLE MAP
 ↓
LIHAT LOKASI SENDIRI
 ↓
LIHAT LOKASI SEKOLAH
 ↓
LIHAT RADIUS
 ↓
VALIDASI LOKASI
 ↓
ABSEN MASUK
 ↓
ABSEN PULANG.

Semua data real.

Semua validasi server-side.

Semua tersimpan database.

Semua tercatat audit.

============================================================
# 85. FINAL OUTPUT
============================================================

Setelah implementasi laporkan:

1. GPS service yang digunakan
2. Google Maps integration
3. Database changes
4. Location engine
5. Radius rules
6. Accuracy rules
7. Schedule rules
8. Check-in implementation
9. Check-out implementation
10. QR + GPS integration
11. RBAC
12. Audit
13. Test result
14. Migration result
15. Remaining issues.

Jangan mengatakan production-ready
jika masih ada critical/high error.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN GPS ATTENDANCE ENGINE
KE DALAM CODEBASE YANG SUDAH ADA.

FOKUS:

GURU
+
KARYAWAN
+
GPS
+
GOOGLE MAPS
+
GEOFENCING
+
LOCATION QR
+
CHECK-IN
+
CHECK-OUT
+
SHIFT
+
JADWAL
+
RADIUS
+
ACCURACY
+
ANTI-DUPLICATE
+
AUDIT
+
RBAC
+
DATABASE
+
REST API.

SEMUA HARUS REAL.

TIDAK ADA:

DUMMY
MOCK
SIMULASI
FAKE GPS
FAKE MAP
FAKE ATTENDANCE
HARDCODED LOCATION
BYPASS VALIDATION.

============================================================
END OF 145
============================================================