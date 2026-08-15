# 141 — ENTERPRISE ATTENDANCE DATABASE & BUSINESS RULE ENGINE

## PRODUCTION DATABASE + BUSINESS LOGIC MASTER PROMPT

Anda harus mengimplementasikan modul Smart Attendance
langsung pada CODEBASE yang sudah ada.

JANGAN membuat project baru.

JANGAN membuat dummy data.

JANGAN membuat simulation.

JANGAN membuat mock attendance.

JANGAN membuat business logic palsu.

Semua data wajib berasal dari database produksi.

============================================================
# 1. TUJUAN
============================================================

Membangun fondasi database dan business logic untuk:

1. Absensi siswa menggunakan QR kartu pelajar
2. Absensi siswa oleh security
3. Absensi siswa oleh guru
4. Absensi siswa secara manual oleh guru
5. Absensi guru menggunakan GPS
6. Absensi karyawan menggunakan GPS
7. Absensi guru/karyawan menggunakan QR/Barcode lokasi
8. Check-in
9. Check-out
10. Attendance correction
11. Approval
12. Audit
13. Attendance monitoring
14. Attendance reporting.

============================================================
# 2. ENTITAS UTAMA
============================================================

Gunakan relational database.

Minimal entity:

organizations
units
academic_years
students
employees
teachers
parents
guardians
rombels

attendance_settings
attendance_locations
student_qr_codes
attendance_sessions
attendance_records
attendance_corrections
attendance_audits

users
roles
permissions

============================================================
# 3. STUDENT QR
============================================================

student_qr_codes:

id
student_id
qr_identifier
qr_token_hash
issued_at
expires_at
revoked_at
status
created_by
created_at
updated_at

Status:

ACTIVE
REVOKED
EXPIRED
INACTIVE.

============================================================
# 4. QR SECURITY
============================================================

QR tidak boleh menyimpan:

NIK
Alamat
Nomor KK
Data orang tua
Data sensitif.

QR hanya menjadi identifier/token.

Backend melakukan:

QR
↓
Decode
↓
Find QR
↓
Validate token
↓
Find Student
↓
Validate Student
↓
Validate Scope
↓
Validate Attendance Rule.

============================================================
# 5. ATTENDANCE SESSION
============================================================

Attendance session digunakan untuk
mengelompokkan absensi.

Fields:

id
unit_id
academic_year_id
rombel_id nullable
date
session_type
start_time
end_time
status
created_by
created_at
updated_at.

Session Type:

STUDENT
EMPLOYEE.

============================================================
# 6. ATTENDANCE RECORD
============================================================

attendance_records:

id
session_id nullable
student_id nullable
employee_id nullable

attendance_date

status

check_in_at
check_out_at

method
source

latitude nullable
longitude nullable
accuracy nullable
distance_meters nullable

location_id nullable

device_id nullable

client_transaction_id

notes nullable

created_by

created_at
updated_at.

============================================================
# 7. ATTENDANCE STATUS
============================================================

STUDENT:

PRESENT
LATE
SICK
PERMITTED
ABSENT.

EMPLOYEE:

PRESENT
LATE
SICK
PERMITTED
ABSENT
OFF_DAY
HOLIDAY.

Jangan menggunakan string bebas.

Gunakan enum/reference table.

============================================================
# 8. ATTENDANCE METHOD
============================================================

STUDENT:

QR
MANUAL.

EMPLOYEE:

GPS
LOCATION_QR
MANUAL_APPROVED.

============================================================
# 9. ATTENDANCE SOURCE
============================================================

STUDENT:

SECURITY_GATE
TEACHER_SCANNER
TEACHER_MANUAL.

EMPLOYEE:

EMPLOYEE_GPS
EMPLOYEE_LOCATION_QR
ADMIN_CORRECTION.

============================================================
# 10. DATABASE CONSTRAINT
============================================================

WAJIB ada protection terhadap duplicate.

Student:

student_id
+
attendance_date
+
session/type

harus unique sesuai business rule.

Employee:

employee_id
+
attendance_date
+
attendance type

harus unique.

client_transaction_id:

UNIQUE.

QR identifier:

UNIQUE.

Location code:

UNIQUE per unit.

============================================================
# 11. ATTENDANCE LOCATION
============================================================

attendance_locations:

id
unit_id

name
code

qr_identifier
qr_token_hash

latitude
longitude
radius_meters

status

created_by
created_at
updated_at.

Contoh:

GERBANG_UTAMA
RUANG_GURU
KANTOR_TU
PONDOK.

============================================================
# 12. LOCATION QR
============================================================

QR lokasi tidak boleh langsung dipercaya.

Flow:

Scan
↓
Decode
↓
Server validate token
↓
Check location active
↓
Check user permission
↓
Optional GPS validation
↓
Attendance.

============================================================
# 13. ATTENDANCE SETTINGS
============================================================

Settings harus configurable.

Contoh:

school_start_time
school_end_time

employee_checkin_start
employee_checkin_end

employee_checkout_start
employee_checkout_end

late_tolerance_minutes

gps_radius_meters

gps_accuracy_threshold

require_gps

require_location_qr

allow_manual_teacher

allow_security_scan.

JANGAN hardcode.

============================================================
# 14. MULTI UNIT
============================================================

Jika organisasi memiliki:

SD
SMP
SMA
Pondok.

Setiap unit dapat memiliki:

Attendance Settings
Location
Schedule
Attendance Rule.

Data unit A tidak boleh
mengakses unit B tanpa permission.

============================================================
# 15. STUDENT ATTENDANCE BUSINESS RULE
============================================================

Student QR attendance:

1. User authenticated
2. User role authorized
3. QR valid
4. QR active
5. Student exists
6. Student active
7. Student belongs to permitted unit
8. Student belongs to permitted rombel jika required
9. Attendance session valid
10. Date valid
11. Time valid
12. Duplicate check
13. Save attendance
14. Audit.

============================================================
# 16. SECURITY RULE
============================================================

Security hanya boleh:

SCAN STUDENT QR.

Security tidak boleh:

CREATE STUDENT
UPDATE STUDENT
DELETE STUDENT
VIEW SENSITIVE STUDENT DATA.

============================================================
# 17. TEACHER RULE
============================================================

Guru dapat:

Scan siswa
Manual attendance.

Tetapi:

teacher_scope
harus divalidasi server.

Guru tidak boleh:

scan student
yang bukan scope-nya.

============================================================
# 18. MANUAL TEACHER ATTENDANCE
============================================================

Guru memilih:

Unit
Rombel
Tanggal
Attendance Session.

System mengambil siswa
dari database.

Guru mengubah:

status.

Tidak boleh membuat siswa manual
dari halaman absensi.

============================================================
# 19. BULK ATTENDANCE
============================================================

Support:

Bulk Save.

Request:

session_id
students[].

Server melakukan validation
per student.

Jangan percaya payload frontend.

============================================================
# 20. EMPLOYEE GPS RULE
============================================================

Employee:

Login
↓
Attendance
↓
GPS
↓
Location
↓
Distance
↓
Time Rule
↓
Duplicate
↓
Save.

Server menghitung distance.

Frontend hanya mengirim:

latitude
longitude
accuracy.

============================================================
# 21. DISTANCE CALCULATION
============================================================

Gunakan Haversine atau geospatial calculation.

JANGAN menggunakan perhitungan
yang hanya dilakukan frontend.

Formula:

distance =
distance between:

current location
dan
configured attendance location.

============================================================
# 22. GPS VALIDATION
============================================================

Jika:

distance <= radius

VALID.

Jika:

distance > radius

INVALID.

Jika:

accuracy > threshold

WARNING/REJECT
sesuai konfigurasi.

============================================================
# 23. GPS SPOOFING
============================================================

Jika device memberikan indikator
mock location:

tandai:

SUSPICIOUS.

Record tetap mengikuti policy
yang dikonfigurasi.

Jangan mengklaim GPS 100%
anti-cheat.

============================================================
# 24. EMPLOYEE LOCATION QR
============================================================

Flow:

Employee Login
↓
Scan School QR
↓
Validate QR
↓
Validate Employee
↓
Validate Schedule
↓
Duplicate Check
↓
Save.

Jika konfigurasi mengharuskan GPS:

Scan QR
+
GPS.

============================================================
# 25. CHECK-IN
============================================================

Employee check-in:

Jika belum ada attendance:

Create record.

Set:

check_in_at.

Status:

PRESENT

atau:

LATE.

============================================================
# 26. CHECK-OUT
============================================================

Jika employee sudah check-in:

Update:

check_out_at.

Jika belum check-in:

Jangan membuat check-out normal.

Tampilkan:

"Absensi masuk belum ditemukan."

Manual correction hanya melalui
approval jika diperbolehkan.

============================================================
# 27. ATTENDANCE WINDOW
============================================================

Contoh:

Check-in:

06:00–09:00.

Check-out:

15:00–22:00.

Konfigurasi dapat berbeda
per unit/shift.

============================================================
# 28. LATE RULE
============================================================

Contoh:

start = 07:30
tolerance = 15 menit.

07:45:

PRESENT.

07:46:

LATE.

Semua berdasarkan konfigurasi database.

============================================================
# 29. SHIFT RULE
============================================================

Employee dapat memiliki:

shift_id.

Shift:

name
start
end
break
timezone
status.

Attendance menggunakan shift
yang aktif pada tanggal tersebut.

============================================================
# 30. HOLIDAY RULE
============================================================

Jika tanggal merupakan:

HOLIDAY

system tidak mewajibkan attendance.

Jika admin melakukan override:

harus tercatat dalam audit.

============================================================
# 31. ATTENDANCE CORRECTION
============================================================

Correction bukan delete.

Flow:

User
↓
Request Correction
↓
Reason
↓
Approval
↓
Apply Change
↓
Audit.

============================================================
# 32. CORRECTION TABLE
============================================================

attendance_corrections:

id
attendance_id
requested_by
reason
old_value
new_value
status
approved_by
approved_at
rejected_reason
created_at
updated_at.

Status:

PENDING
APPROVED
REJECTED
CANCELLED.

============================================================
# 33. AUDIT LOG
============================================================

attendance_audits:

id
attendance_id
actor_id
action
old_data
new_data
ip_address nullable
device_id nullable
latitude nullable
longitude nullable
created_at.

Action:

CREATED
UPDATED
CORRECTION_REQUESTED
APPROVED
REJECTED
VOIDED.

============================================================
# 34. SOFT DELETE
============================================================

Attendance production:

JANGAN hard delete.

Jika perlu pembatalan:

status:

VOIDED.

Simpan:

voided_by
voided_at
void_reason.

============================================================
# 35. API TRANSACTION
============================================================

Attendance write operation harus transactional.

Contoh:

BEGIN
↓
Validate
↓
Check duplicate
↓
Create attendance
↓
Create audit
↓
COMMIT.

Jika gagal:

ROLLBACK.

============================================================
# 36. IDEMPOTENCY
============================================================

Client mengirim:

client_transaction_id.

Server:

IF exists
→ return existing result.

ELSE:

create.

Ini wajib untuk:

Mobile retry
Network retry
Offline sync.

============================================================
# 37. OFFLINE SYNC
============================================================

Jika mobile offline:

Jangan tampilkan:

"Attendance berhasil"

jika belum tersimpan server.

Gunakan status:

PENDING SYNC.

Ketika online:

SYNC
↓
VALIDATE
↓
SAVE
↓
CONFIRM.

============================================================
# 38. API RESPONSE STANDARD
============================================================

Success:

{
  success: true,
  data: {},
  message: "..."
}

Error:

{
  success: false,
  error: {
    code: "...",
    message: "...",
    details: {}
  }
}

Gunakan HTTP status yang tepat.

============================================================
# 39. ERROR CODE
============================================================

Contoh:

ATTENDANCE_ALREADY_RECORDED

INVALID_QR

QR_REVOKED

STUDENT_NOT_FOUND

STUDENT_INACTIVE

STUDENT_OUT_OF_SCOPE

OUTSIDE_ATTENDANCE_RADIUS

GPS_ACCURACY_TOO_LOW

LOCATION_QR_INVALID

ATTENDANCE_WINDOW_CLOSED

CHECK_IN_NOT_FOUND

UNAUTHORIZED_ATTENDANCE

============================================================
# 40. INDEXING
============================================================

Buat index untuk:

student_id
employee_id
unit_id
rombel_id
attendance_date
session_id
source
status
created_at.

============================================================
# 41. API AUTHORIZATION
============================================================

Jangan hanya:

if authenticated.

Harus:

authenticated
+
role
+
permission
+
unit scope
+
rombel scope.

============================================================
# 42. SECURITY
============================================================

Prevent:

QR brute force
API spam
Unauthorized scanning
Cross-unit access
Cross-rombel access
Duplicate attendance
Replay request.

Gunakan:

Rate limiting
Idempotency
Token validation
Permission
Scope validation.

============================================================
# 43. AUDIT READ ACCESS
============================================================

Untuk data sensitif:

catat access jika diperlukan.

Security hanya melihat data minimal.

============================================================
# 44. DATA RETENTION
============================================================

Attendance historis jangan dihapus otomatis.

Simpan sesuai kebijakan organisasi.

Archive hanya melalui proses resmi.

============================================================
# 45. REPORTING QUERY
============================================================

Laporan harus mengambil:

DATABASE REAL DATA.

Tidak boleh:

hardcoded total.

Dashboard:

COUNT database.

============================================================
# 46. ATTENDANCE RATE
============================================================

Perhitungan:

Total Effective Attendance Days
vs
Actual Attendance.

Jangan menghitung:

Holiday
Off Day

sebagai ketidakhadiran.

============================================================
# 47. STUDENT REPORT
============================================================

Filter:

Unit
Rombel
Tanggal
Status.

Tampilkan:

Hadir
Terlambat
Sakit
Izin
Alpa.

============================================================
# 48. EMPLOYEE REPORT
============================================================

Tampilkan:

Employee
Unit
Tanggal
Check In
Check Out
Status
Method
Late
Location.

============================================================
# 49. SECURITY MONITORING
============================================================

Security dashboard:

Today's scans
Accepted
Duplicate
Invalid
Recent.

Tidak boleh ada akses
ke data administratif lainnya.

============================================================
# 50. TEST MATRIX
============================================================

WAJIB TEST:

Student QR valid
Student QR invalid
Student QR revoked
Student inactive
Duplicate student scan
Security authorized
Security unauthorized

Teacher authorized
Teacher unauthorized
Teacher manual

Employee GPS valid
Employee GPS outside radius
Employee GPS poor accuracy
Employee GPS duplicate

Employee QR valid
Employee QR invalid
Employee QR duplicate

Check-in
Check-out
Late
Holiday
Shift

Correction
Approval
Reject
Audit

Offline sync
Retry
Duplicate transaction.

============================================================
# 51. DATABASE TEST
============================================================

Test:

Foreign key
Unique
Index
Transaction
Rollback
Idempotency.

============================================================
# 52. API TEST
============================================================

Test:

200
201
400
401
403
404
409
422
429
500.

============================================================
# 53. FINAL ACCEPTANCE CRITERIA
============================================================

SEMUA HARUS:

PASS.

Tidak boleh ada:

Dummy Data
Mock API
Simulation
Hardcoded Attendance
Hardcoded Location
Hardcoded Student
Hardcoded Employee.

============================================================
# 54. IMPLEMENTATION COMMAND
============================================================

IMPLEMENTASIKAN SEKARANG.

Audit codebase terlebih dahulu.

Jangan membuat tabel duplicate
jika tabel yang dibutuhkan sudah tersedia.

Gunakan migration yang aman.

Jika model sudah ada:

extend.

Jika API sudah ada:

refactor.

Jika frontend sudah ada:

integrasikan.

Jangan membuat duplicate service.

Jangan membuat duplicate endpoint.

Jangan membuat duplicate business logic.

Setelah selesai:

RUN:

Database Migration Check
Database Integrity Test
API Test
RBAC Test
Attendance Unit Test
Attendance Integration Test
E2E Test
Build Test.

Semua error wajib diperbaiki.

============================================================
# FINAL RESULT
============================================================

SISTEM HARUS MEMILIKI:

STUDENT QR ATTENDANCE
+
SECURITY GATE ATTENDANCE
+
TEACHER QR ATTENDANCE
+
TEACHER MANUAL ATTENDANCE
+
EMPLOYEE GPS ATTENDANCE
+
EMPLOYEE LOCATION QR
+
CHECK-IN
+
CHECK-OUT
+
ATTENDANCE CORRECTION
+
APPROVAL
+
AUDIT
+
REPORT
+
RBAC
+
API
+
DATABASE INTEGRITY.

SEMUA PRODUCTION READY.

============================================================
END OF 141
============================================================