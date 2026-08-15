# 143 — ENTERPRISE SMART ATTENDANCE REST API

## PRODUCTION API CONTRACT & IMPLEMENTATION MASTER PROMPT

Anda bertindak sebagai:

- Senior Backend Engineer
- API Architect
- Database Engineer
- Security Engineer
- Flutter Integration Engineer
- QA Engineer

Implementasikan REST API Smart Attendance pada backend
yang SUDAH ADA.

JANGAN membuat backend baru.

JANGAN membuat API dummy.

JANGAN membuat mock response.

JANGAN menggunakan hardcoded data.

Semua API harus menggunakan database production.

============================================================
# 1. ARSITEKTUR
============================================================

Flutter Mobile
        ↓
REST API
        ↓
Authentication
        ↓
Authorization / RBAC
        ↓
Business Rule Engine
        ↓
Database
        ↓
Audit Log

Web Application menggunakan API/business service
yang sama jika arsitektur backend memungkinkan.

Jangan membuat logic absensi berbeda
antara Mobile dan Web.

============================================================
# 2. API VERSION
============================================================

Gunakan:

/api/v1/

Contoh:

/api/v1/attendance/students/scan

Jangan membuat endpoint tanpa versioning
jika project sudah menggunakan versioning.

============================================================
# 3. AUTHENTICATION
============================================================

Semua endpoint attendance
harus membutuhkan authentication.

Header:

Authorization: Bearer <token>

User yang belum login:

401 Unauthorized.

============================================================
# 4. AUTHORIZATION
============================================================

Authentication bukan berarti memiliki akses.

Setelah authentication:

1. Identify user
2. Identify roles
3. Identify permissions
4. Identify organization
5. Identify unit scope
6. Identify rombel scope
7. Validate action.

============================================================
# 5. ROLE
============================================================

Minimal:

SUPER_ADMIN
YAYASAN
KEPALA_SEKOLAH
KEPALA_TU
TU
SECURITY
GURU
WALI_KELAS
KARYAWAN
SISWA
ORANG_TUA.

Role tidak boleh ditentukan
oleh frontend.

Backend membaca role
dari database/auth token.

============================================================
# 6. STUDENT QR SCAN
============================================================

Endpoint:

POST
/api/v1/attendance/students/scan

Request:

{
  "qr_token": "...",
  "session_id": "...",
  "client_transaction_id": "..."
}

Backend:

1. Authenticate
2. Authorize scanner
3. Validate QR
4. Find student
5. Validate student active
6. Validate unit
7. Validate teacher/security scope
8. Validate session
9. Validate attendance window
10. Check duplicate
11. Create attendance
12. Create audit
13. Return result.

============================================================
# 7. QR TOKEN SECURITY
============================================================

Jangan menerima:

student_id

sebagai satu-satunya bukti kartu.

Gunakan:

secure QR token.

Token yang:

invalid
expired
revoked
inactive

harus ditolak.

============================================================
# 8. STUDENT MANUAL ATTENDANCE
============================================================

Endpoint:

POST
/api/v1/attendance/students/manual

Request:

{
  "session_id": "...",
  "attendance_date": "...",
  "students": [
    {
      "student_id": "...",
      "status": "PRESENT"
    }
  ],
  "client_transaction_id": "..."
}

Server harus memvalidasi
setiap student.

============================================================
# 9. TEACHER SCOPE
============================================================

Teacher hanya dapat:

student
yang sesuai permission/scope.

Backend wajib melakukan:

Teacher
↓
Unit
↓
Rombel
↓
Student.

Jika tidak cocok:

403 Forbidden.

============================================================
# 10. SECURITY SCAN
============================================================

Security endpoint tetap:

POST
/api/v1/attendance/students/scan

Namun backend membaca:

role = SECURITY.

Security hanya dapat melakukan
student gate attendance.

Tidak boleh mendapatkan
student management permission.

============================================================
# 11. EMPLOYEE GPS CHECK-IN
============================================================

Endpoint:

POST
/api/v1/attendance/employees/gps/check-in

Request:

{
  "latitude": -0.000000,
  "longitude": 100.000000,
  "accuracy": 8.5,
  "client_transaction_id": "..."
}

Backend mengambil lokasi sekolah
dari database.

Jangan menerima:

radius

dari frontend.

============================================================
# 12. SERVER GPS VALIDATION
============================================================

Backend menghitung:

distance(current_location,
         attendance_location).

Kemudian:

IF distance <= radius
AND accuracy valid

THEN:

attendance valid.

Jika tidak:

reject.

============================================================
# 13. GPS RESPONSE
============================================================

Success:

{
  "success": true,
  "data": {
    "attendance_id": "...",
    "status": "PRESENT",
    "check_in_at": "...",
    "distance_meters": 72.5,
    "accuracy": 8.2
  }
}

Jangan memberikan
data sensitif yang tidak diperlukan.

============================================================
# 14. GPS OUTSIDE RADIUS
============================================================

HTTP:

422

Code:

OUTSIDE_ATTENDANCE_RADIUS

Response:

{
  "success": false,
  "error": {
    "code": "OUTSIDE_ATTENDANCE_RADIUS",
    "message": "Anda berada di luar area absensi."
  }
}

============================================================
# 15. GPS ACCURACY
============================================================

Jika accuracy tidak memenuhi rule:

Code:

GPS_ACCURACY_TOO_LOW

HTTP:

422.

Mobile menampilkan:

"Lakukan pembaruan lokasi."

============================================================
# 16. EMPLOYEE LOCATION QR
============================================================

Endpoint:

POST
/api/v1/attendance/employees/location-qr/check-in

Request:

{
  "qr_token": "...",
  "latitude": -0.000000,
  "longitude": 100.000000,
  "accuracy": 10,
  "client_transaction_id": "..."
}

Server:

Validate QR
↓
Validate location
↓
Validate user
↓
Validate schedule
↓
Optional GPS validation
↓
Check duplicate
↓
Create attendance.

============================================================
# 17. CHECK-OUT
============================================================

Endpoint:

POST
/api/v1/attendance/employees/check-out

Request:

{
  "method": "GPS",
  "latitude": -0.000000,
  "longitude": 100.000000,
  "accuracy": 8,
  "client_transaction_id": "..."
}

Server wajib:

Find today's attendance.

Jika tidak ada:

CHECK_IN_NOT_FOUND.

Jika sudah checkout:

ATTENDANCE_ALREADY_CHECKED_OUT.

Jika valid:

Update check_out_at.

============================================================
# 18. TODAY ATTENDANCE
============================================================

Endpoint:

GET
/api/v1/attendance/me/today

Response:

{
  "success": true,
  "data": {
    "date": "...",
    "check_in": "...",
    "check_out": "...",
    "status": "PRESENT",
    "method": "GPS"
  }
}

============================================================
# 19. ATTENDANCE HISTORY
============================================================

Endpoint:

GET
/api/v1/attendance/me/history

Query:

page
per_page
start_date
end_date
status.

Pagination wajib.

Jangan mengembalikan
ribuan record sekaligus.

============================================================
# 20. STUDENT ATTENDANCE TODAY
============================================================

Endpoint:

GET
/api/v1/attendance/students/today

Permission:

TU
WALI_KELAS
GURU sesuai scope
KEPALA_SEKOLAH
SUPER_ADMIN.

Security hanya menggunakan
endpoint khusus monitoring
yang datanya minimal.

============================================================
# 21. EMPLOYEE ATTENDANCE
============================================================

Endpoint:

GET
/api/v1/attendance/employees

Filter:

date
unit_id
employee_id
status
method.

Permission wajib.

============================================================
# 22. ATTENDANCE DASHBOARD
============================================================

Endpoint:

GET
/api/v1/attendance/dashboard

Return:

total_students
present
late
sick
permitted
absent

total_employees
employee_present
employee_late
employee_absent.

Semua dihitung dari database.

JANGAN hardcode.

============================================================
# 23. LOCATION MANAGEMENT
============================================================

Admin endpoint:

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

DELETE production harus mengikuti
soft delete/disable policy.

============================================================
# 24. LOCATION DATA
============================================================

Create:

{
  "unit_id": "...",
  "name": "Gerbang Utama",
  "code": "GERBANG_UTAMA",
  "latitude": -0.000000,
  "longitude": 100.000000,
  "radius_meters": 100,
  "status": "ACTIVE"
}

Jangan menerima QR token mentah
untuk disimpan tanpa hashing
jika security architecture
mengharuskannya.

============================================================
# 25. QR LOCATION
============================================================

Endpoint:

POST
/api/v1/attendance/locations/{id}/regenerate-qr

POST
/api/v1/attendance/locations/{id}/revoke-qr

GET
/api/v1/attendance/locations/{id}/qr.

============================================================
# 26. STUDENT QR MANAGEMENT
============================================================

Endpoint:

GET
/api/v1/students/{id}/qr

POST
/api/v1/students/{id}/qr/generate

POST
/api/v1/students/{id}/qr/revoke

POST
/api/v1/students/{id}/qr/regenerate

GET
/api/v1/students/qr/export

Semua harus permission protected.

============================================================
# 27. ATTENDANCE CORRECTION
============================================================

Request:

POST
/api/v1/attendance/corrections

Request:

{
  "attendance_id": "...",
  "requested_value": {},
  "reason": "..."
}

============================================================
# 28. APPROVAL
============================================================

GET:

/api/v1/attendance/corrections

Approve:

POST
/api/v1/attendance/corrections/{id}/approve

Reject:

POST
/api/v1/attendance/corrections/{id}/reject

Approval hanya role yang memiliki permission.

============================================================
# 29. AUDIT
============================================================

Semua write:

CREATE
UPDATE
CORRECTION
APPROVAL
REJECTION
VOID

harus menghasilkan audit.

============================================================
# 30. AUDIT ENDPOINT
============================================================

GET

/api/v1/attendance/{id}/audit

GET

/api/v1/attendance/audits

Permission:

ADMIN
AUDITOR
authorized management.

============================================================
# 31. REPORT
============================================================

Endpoint:

GET
/api/v1/attendance/reports/students

GET
/api/v1/attendance/reports/employees

Filter:

start_date
end_date
unit_id
rombel_id
status
method
source.

============================================================
# 32. EXPORT
============================================================

Endpoint:

GET
/api/v1/attendance/reports/export

Format:

pdf
xlsx
csv.

Server menghasilkan file
dari database aktual.

Jangan membuat file
dari dummy dataset.

============================================================
# 33. IDEMPOTENCY
============================================================

Setiap write attendance:

client_transaction_id.

Jika request yang sama dikirim ulang:

return existing attendance.

Jangan membuat duplicate.

============================================================
# 34. DATABASE TRANSACTION
============================================================

Attendance creation:

BEGIN TRANSACTION

Validate

Check Duplicate

Create Record

Create Audit

Commit

Jika gagal:

Rollback.

============================================================
# 35. CONCURRENCY
============================================================

Jika dua request datang
bersamaan:

Database constraint tetap mencegah
duplicate attendance.

Jangan hanya mengandalkan:

if (!exists).

Gunakan:

unique constraint
+
transaction
+
proper locking bila diperlukan.

============================================================
# 36. RATE LIMIT
============================================================

QR scanner:

rate limit.

GPS:

rate limit.

Login:

rate limit.

Report:

rate limit.

Jangan sampai scanner
membanjiri API.

============================================================
# 37. VALIDATION
============================================================

Validasi:

UUID
Date
Time
Latitude
Longitude
Accuracy
QR token
Status
Session ID.

Latitude:

-90 sampai 90.

Longitude:

-180 sampai 180.

Accuracy:

>= 0.

============================================================
# 38. ERROR STANDARD
============================================================

Gunakan format:

{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}

============================================================
# 39. HTTP STATUS
============================================================

200:
Success.

201:
Created.

400:
Bad Request.

401:
Unauthenticated.

403:
Unauthorized.

404:
Not Found.

409:
Conflict.

422:
Validation/Business Rule.

429:
Rate Limit.

500:
Internal Server Error.

============================================================
# 40. SECURITY
============================================================

JANGAN:

percaya student_id dari frontend
percaya unit_id dari frontend
percaya rombel_id dari frontend
percaya radius dari frontend
percaya attendance status final dari frontend
percaya late status dari frontend.

Server menentukan semuanya.

============================================================
# 41. SCOPE VALIDATION
============================================================

Contoh:

Guru A

Scope:

Unit SD
Rombel VI-A.

Jika request:

student VI-B

→ 403.

Jika:

unit SMP

→ 403.

============================================================
# 42. SECURITY SCOPE
============================================================

Security:

scope:

gate/location tertentu.

Jika Security A hanya ditugaskan
di Gate 1:

jangan izinkan Gate 2
jika policy membatasi lokasi.

============================================================
# 43. EMPLOYEE SCOPE
============================================================

Employee hanya:

own attendance.

Request:

employee_id milik orang lain

→ ignore/reject.

Jangan menerima employee_id
sebagai authority.

Gunakan authenticated user.

============================================================
# 44. TEACHER MANUAL ATTENDANCE
============================================================

Backend mendapatkan:

teacher
→ authorized rombels
→ students.

Frontend hanya mengirim
status attendance.

Server memastikan
student berada dalam scope.

============================================================
# 45. API CACHE
============================================================

Cache hanya untuk:

configuration
location
static master data.

Jangan menggunakan cache
sebagai source of truth
untuk attendance write.

============================================================
# 46. LOGGING
============================================================

Log:

request ID
user ID
endpoint
duration
status
error code.

Jangan log:

password
JWT
QR secret
sensitive personal data.

============================================================
# 47. OBSERVABILITY
============================================================

Monitor:

attendance API latency
error rate
QR scan failures
GPS failures
duplicate attempts
403 attempts
500 errors.

============================================================
# 48. API DOCUMENTATION
============================================================

Gunakan:

OpenAPI/Swagger

jika backend project sudah mendukung.

Dokumentasikan:

Authentication
Request
Response
Errors
Permissions.

============================================================
# 49. FLUTTER CONTRACT
============================================================

Flutter harus menggunakan
API contract yang sama.

Jangan membuat endpoint khusus
hanya untuk UI tertentu
jika logic-nya sama.

Repository:

StudentAttendanceRepository

EmployeeAttendanceRepository

AttendanceLocationRepository

AttendanceReportRepository.

============================================================
# 50. API TEST
============================================================

Test:

Valid QR
Invalid QR
Revoked QR
Duplicate QR
Unauthorized teacher
Authorized teacher
Security scan
GPS valid
GPS invalid
GPS accuracy
Location QR
Check-in
Check-out
Duplicate check-in
Duplicate checkout
Correction
Approval
Reject
Reports
Export.

============================================================
# 51. SECURITY TEST
============================================================

Test:

JWT expired
JWT invalid
No token
Wrong role
Wrong unit
Wrong rombel
Wrong student
Wrong employee
Wrong location.

Semua harus ditolak.

============================================================
# 52. DATABASE TEST
============================================================

Test:

Foreign keys
Unique indexes
Transactions
Rollback
Concurrent attendance
Idempotency.

============================================================
# 53. PERFORMANCE TEST
============================================================

Target:

QR scan response cepat.

API harus mampu menangani
multiple simultaneous scanners.

Optimalkan:

indexes
queries
pagination
transactions.

Hindari:

N+1 queries.

============================================================
# 54. PRODUCTION RULE
============================================================

Tidak boleh ada:

dummy response
mock response
fake success
hardcoded student
hardcoded employee
hardcoded attendance
hardcoded location
hardcoded dashboard numbers.

============================================================
# 55. FINAL IMPLEMENTATION
============================================================

Audit backend terlebih dahulu.

Jika endpoint sudah tersedia:

REUSE.

Jika service sudah tersedia:

REUSE.

Jika model sudah tersedia:

EXTEND.

Jangan membuat duplicate:

Controller
Service
Repository
Model
Endpoint.

============================================================
# 56. FINAL ACCEPTANCE
============================================================

Flutter:

SCAN QR
→ API
→ Database
→ Response.

GPS:

GPS
→ API
→ Server distance validation
→ Database
→ Response.

Location QR:

QR
→ API
→ Validation
→ Database.

Manual:

Teacher
→ API
→ Scope validation
→ Database.

Reports:

Database
→ API
→ Report.

Semua harus real.

============================================================
# 57. FINAL QA
============================================================

Jalankan:

Unit Test
Integration Test
API Test
Database Test
RBAC Test
Security Test
Concurrency Test
E2E Test.

Perbaiki semua:

Critical
High
Medium yang mengganggu production.

============================================================
# 58. FINAL OUTPUT
============================================================

Laporkan:

1. Endpoint yang digunakan
2. Endpoint baru
3. Endpoint yang dihapus
4. Database changes
5. Permission changes
6. Business rules
7. Security rules
8. Test result
9. Migration result
10. Remaining issue.

Jangan mengatakan:

PRODUCTION READY

jika masih ada critical error.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN REST API INI
KE BACKEND YANG SUDAH ADA.

SEMUA HARUS TERHUBUNG:

FLUTTER
↓
REST API
↓
BUSINESS LOGIC
↓
DATABASE
↓
AUDIT.

Tidak boleh ada dummy.

Tidak boleh ada simulasi.

Tidak boleh ada fake attendance.

Tidak boleh ada bypass RBAC.

Tidak boleh ada duplicate attendance.

Tidak boleh ada frontend-only validation.

SERVER ADALAH SOURCE OF TRUTH.

============================================================
END OF 143
============================================================