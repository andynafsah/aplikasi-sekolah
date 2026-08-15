# 146 — ENTERPRISE ATTENDANCE MONITORING COMMAND CENTER

## PRODUCTION ATTENDANCE MONITORING MASTER PROMPT

Anda bertindak sebagai:

- Senior Product Architect
- Senior Backend Engineer
- Senior Flutter Engineer
- Senior Web Engineer
- Database Engineer
- RBAC Security Engineer
- Real-Time Systems Engineer
- Reporting Engineer
- QA Engineer

Implementasikan ENTERPRISE ATTENDANCE MONITORING COMMAND CENTER
pada CODEBASE yang SUDAH ADA.

JANGAN membuat aplikasi baru.

JANGAN membuat dashboard dummy.

JANGAN menggunakan angka statistik hardcoded.

JANGAN menggunakan data simulasi.

JANGAN menggunakan fake realtime.

SEMUA DATA HARUS BERASAL DARI DATABASE
DAN API PRODUCTION.

============================================================
# 1. TUJUAN
============================================================

Bangun pusat monitoring absensi
untuk:

1. Super Admin
2. Yayasan
3. Kepala Sekolah
4. Kepala TU
5. TU
6. Security
7. Wali Kelas
8. Guru sesuai permission.

Setiap role hanya melihat
data sesuai scope dan permission.

============================================================
# 2. PRINSIP UTAMA
============================================================

Dashboard bukan sekadar tampilan statistik.

Dashboard harus menjadi:

ATTENDANCE COMMAND CENTER.

Semua informasi berasal dari:

DATABASE
↓
BUSINESS LOGIC
↓
REST API
↓
MONITORING UI.

============================================================
# 3. DATA YANG DIMONITOR
============================================================

Monitoring:

A. Siswa

B. Guru

C. Karyawan

D. Security Gate

E. Attendance Location

F. GPS Attendance

G. QR Attendance

H. Manual Attendance

I. Late Attendance

J. Absent

K. Attendance Corrections

L. Security Events.

============================================================
# 4. DASHBOARD OVERVIEW
============================================================

Dashboard utama:

┌─────────────────────────────────────────┐
│ ATTENDANCE COMMAND CENTER               │
├─────────────────────────────────────────┤
│ SISWA       GURU       KARYAWAN         │
│ 320         42         35               │
│                                         │
│ HADIR       TERLAMBAT   IZIN   ALPA     │
│ 280         18          12     10       │
├─────────────────────────────────────────┤
│ GOOGLE MAP                              │
│                                         │
│   ● Gate 1                              │
│        ● Gate 2                         │
│              ● Unit SD                  │
│                                         │
├─────────────────────────────────────────┤
│ AKTIVITAS TERBARU                       │
└─────────────────────────────────────────┘

SEMUA ANGKA DINAMIS.

============================================================
# 5. DATE CONTEXT
============================================================

Dashboard default:

Hari ini.

User dapat memilih:

Hari ini
Kemarin
Tanggal tertentu
Rentang tanggal.

Server menentukan timezone
berdasarkan organization/unit.

============================================================
# 6. DASHBOARD CARDS
============================================================

Student:

Total
Hadir
Terlambat
Sakit
Izin
Alpa
Belum Absen.

Employee:

Total Guru
Hadir
Terlambat
Izin
Alpa
Belum Check-in
Belum Check-out.

============================================================
# 7. ROLE-BASED DASHBOARD
============================================================

SUPER ADMIN:

Organization-wide.

YAYASAN:

Unit yang diizinkan.

KEPALA SEKOLAH:

Unit sekolahnya.

KEPALA TU:

Unit administrasinya.

TU:

Scope administrasi.

SECURITY:

Gate/location yang ditugaskan.

WALI KELAS:

Rombel yang menjadi tanggung jawab.

GURU:

Hanya data yang diizinkan
berdasarkan assignment.

============================================================
# 8. JANGAN TAMPILKAN MENU
============================================================

Jika role tidak memiliki permission:

Jangan hanya disable button.

Menu harus:

TIDAK DITAMPILKAN.

Contoh:

Security tidak boleh melihat:

User Management
Role Management
System Settings
Database
Organization Settings
Financial Settings.

============================================================
# 9. PERMISSION
============================================================

Gunakan permission:

attendance.dashboard.view

attendance.student.view

attendance.employee.view

attendance.gate.view

attendance.location.view

attendance.correction.view

attendance.correction.approve

attendance.report.view

attendance.report.export

attendance.audit.view

attendance.monitoring.view.

Frontend membaca permission.

Backend tetap melakukan validation.

============================================================
# 10. REAL-TIME MONITORING
============================================================

Jika backend sudah mendukung:

WebSocket
SSE
event broadcasting.

Gunakan infrastructure tersebut.

JANGAN membuat polling
berlebihan.

Jika realtime infrastructure
belum tersedia:

gunakan polling configurable.

Contoh:

10–30 detik.

Jangan hardcode di UI.

============================================================
# 11. REAL-TIME EVENT
============================================================

Event:

student.attendance.created

employee.attendance.created

employee.attendance.checked_out

attendance.corrected

attendance.approved

attendance.rejected

location.status.changed

security.alert.created.

============================================================
# 12. LIVE ACTIVITY
============================================================

Tampilkan:

12:31
Ahmad Fauzan
Siswa
Gate Utama
HADIR

12:32
Muhammad Ali
Guru
Kantor Guru
HADIR

12:33
Fulan
Karyawan
GPS
TERLAMBAT.

Newest first.

============================================================
# 13. LIVE UPDATE
============================================================

Ketika attendance baru:

Dashboard:

total
hadir
terlambat

otomatis update.

Tidak perlu refresh manual.

============================================================
# 14. GOOGLE MAP COMMAND CENTER
============================================================

Tampilkan map besar.

Map dapat menampilkan:

Attendance locations
Security gates
Unit
Current attendance activity
GPS attendance events.

============================================================
# 15. MAP PRIVACY
============================================================

JANGAN menampilkan
lokasi realtime karyawan
secara terus menerus.

Map hanya menampilkan
informasi lokasi yang relevan
dengan event absensi.

Contoh:

Employee check-in:

tampilkan lokasi event.

Bukan tracking sepanjang hari.

============================================================
# 16. MAP FILTER
============================================================

Filter:

Semua
Siswa
Guru
Karyawan
Security Gate
GPS
QR.

============================================================
# 17. MAP MARKER
============================================================

Marker berdasarkan:

attendance location.

Event marker dapat menunjukkan:

status
waktu
metode.

============================================================
# 18. ATTENDANCE TABLE
============================================================

Kolom:

Waktu
Nama
Tipe
Unit
Rombel
Metode
Status
Lokasi
Action.

Contoh:

07:25
Ahmad
Siswa
SD
VI-A
QR
HADIR
Gate Utama.

============================================================
# 19. SEARCH
============================================================

Search:

Nama
NIS
NIP/NIY
Kode pegawai
Kode siswa.

Server-side search.

Jangan load seluruh database
ke frontend.

============================================================
# 20. FILTER
============================================================

Filter:

Tanggal
Unit
Rombel
Role
Jenis
Status
Metode
Lokasi.

Semua filter:

server-side.

============================================================
# 21. STATUS
============================================================

Student:

PRESENT
LATE
SICK
PERMITTED
ABSENT
NOT_RECORDED.

Employee:

PRESENT
LATE
PERMITTED
ABSENT
NOT_CHECKED_OUT.

============================================================
# 22. METHOD
============================================================

QR_STUDENT

QR_LOCATION

GPS

GPS_AND_QR

MANUAL

SYSTEM.

============================================================
# 23. GATE MONITORING
============================================================

Security dashboard:

Gate name
Status
Today's scans
Successful
Rejected
Duplicate
Invalid QR.

Security hanya melihat
gate yang menjadi scope.

============================================================
# 24. SECURITY SCAN MONITOR
============================================================

Tampilkan:

Last Scan
Scanner
Gate
Student
Result.

Result:

SUCCESS
INVALID
REVOKED
DUPLICATE
UNAUTHORIZED.

============================================================
# 25. INVALID QR ALERT
============================================================

Jika terjadi invalid QR:

Create security event.

Contoh:

07:42

Invalid QR detected
Gate Utama.

Security dapat melihat
detail terbatas.

============================================================
# 26. REPEATED FAILURE
============================================================

Jika banyak invalid QR
dalam waktu singkat:

buat:

SECURITY_ALERT.

Threshold configurable.

Jangan hardcode.

============================================================
# 27. STUDENT MONITORING
============================================================

Wali Kelas:

Rombel VI-A.

Dashboard:

Total 32
Hadir 28
Terlambat 2
Izin 1
Sakit 1
Belum Absen 0.

============================================================
# 28. STUDENT DETAIL
============================================================

Klik student:

Foto
Nama
NIS
Rombel
Hari ini
Riwayat attendance.

Jangan tampilkan
data sensitif yang tidak
dibutuhkan role tersebut.

============================================================
# 29. EMPLOYEE MONITORING
============================================================

TU/Kepala Sekolah:

Nama
Unit
Jabatan
Check-in
Check-out
Status
Method
Location.

============================================================
# 30. EMPLOYEE GPS DETAIL
============================================================

Detail:

Check-in time
Check-out time
Attendance location
Distance
GPS accuracy
Method.

Jika authorized:

Open Map.

============================================================
# 31. ATTENDANCE DETAIL DRAWER/MODAL
============================================================

Saat klik record:

Detail:

Identity
Date
Time
Status
Method
Location
Scanner
Device/session reference
Correction status
Audit.

Modal harus:

dynamic
API-powered
tidak dummy.

============================================================
# 32. CORRECTION
============================================================

Jika attendance salah:

User berwenang dapat:

Request Correction.

Contoh:

Forgot checkout.

Request:

Reason.

============================================================
# 33. APPROVAL WORKFLOW
============================================================

Employee:

Submit Correction.

↓

Authorized Supervisor/TU:

Review.

↓

Approve / Reject.

↓

Attendance update.

↓

Audit.

============================================================
# 34. CORRECTION STATUS
============================================================

PENDING

APPROVED

REJECTED

CANCELLED.

============================================================
# 35. AUDIT
============================================================

Audit menampilkan:

Actor
Action
Timestamp
Before
After
Reason.

Contoh:

Admin TU
mengubah status
ABSENT → PRESENT.

Reason:

"Absensi manual karena
scanner bermasalah."

============================================================
# 36. NO DIRECT EDIT
============================================================

Jangan menyediakan:

langsung edit attendance.

Semua perubahan harus
melalui correction workflow.

Jika policy mengizinkan
administrator override:

tetap audit.

============================================================
# 37. NOTIFICATION
============================================================

Dashboard dapat menampilkan:

New attendance
Late employee
Invalid QR
Correction pending
Security alert.

============================================================
# 38. NOTIFICATION CENTER
============================================================

Menu:

Notifikasi.

Filter:

Semua
Belum dibaca
Absensi
Security
Correction.

============================================================
# 39. MARK AS READ
============================================================

Endpoint:

POST
/api/v1/notifications/{id}/read

POST
/api/v1/notifications/read-all.

Permission berdasarkan
authenticated user.

============================================================
# 40. REPORT QUICK ACCESS
============================================================

Dashboard menyediakan:

Laporan Hari Ini
Laporan Mingguan
Laporan Bulanan.

Tetap menggunakan
report API.

============================================================
# 41. REPORT STUDENT
============================================================

Columns:

Tanggal
Nama
NIS
Unit
Rombel
Status
Jam
Method
Gate/Location.

============================================================
# 42. REPORT EMPLOYEE
============================================================

Columns:

Tanggal
Nama
NIP/NIY
Jabatan
Unit
Check-in
Check-out
Status
Method.

============================================================
# 43. REPORT SUMMARY
============================================================

Summary:

Attendance Rate
Late Rate
Absent Rate
Permission Rate.

Formula dihitung backend
berdasarkan dataset aktual.

============================================================
# 44. EXPORT
============================================================

Export:

PDF
XLSX
CSV.

Gunakan report engine
yang sudah ada.

Jangan membuat duplicate
export engine.

============================================================
# 45. PAGINATION
============================================================

Semua table:

server-side pagination.

Default:

20/25/50.

Configurable.

============================================================
# 46. SORTING
============================================================

Support:

latest
oldest
name
status.

Server-side.

============================================================
# 47. API
============================================================

Dashboard:

GET
/api/v1/attendance/dashboard

Live:

GET
/api/v1/attendance/activity

Student:

GET
/api/v1/attendance/students

Employee:

GET
/api/v1/attendance/employees

Gate:

GET
/api/v1/attendance/gates

Corrections:

GET
/api/v1/attendance/corrections

Audit:

GET
/api/v1/attendance/audits

Reports:

GET
/api/v1/attendance/reports.

============================================================
# 48. API RESPONSE
============================================================

Standard:

{
  "success": true,
  "data": {},
  "meta": {}
}

Error:

{
  "success": false,
  "error": {
    "code": "...",
    "message": "...",
    "details": {}
  }
}

============================================================
# 49. SERVER AUTHORIZATION
============================================================

Backend harus memvalidasi:

organization
unit
rombel
role
permission.

Frontend visibility bukan
security mechanism.

============================================================
# 50. DATA ISOLATION
============================================================

User hanya dapat membaca
data yang sesuai scope.

Contoh:

Wali Kelas VI-A:

tidak boleh melihat
attendance VII-A.

Security Gate A:

tidak boleh melihat
gate lain jika scope dibatasi.

============================================================
# 51. PERFORMANCE
============================================================

Dashboard harus menggunakan
query teroptimasi.

Hindari:

N+1.

Gunakan:

indexes
aggregations
proper joins
cached configuration.

Attendance write tetap
source of truth database.

============================================================
# 52. CACHE
============================================================

Cache boleh digunakan untuk:

dashboard summary pendek
configuration
location metadata.

Jangan menggunakan cache
sebagai sumber utama
attendance record.

============================================================
# 53. REALTIME FALLBACK
============================================================

Jika WebSocket/SSE unavailable:

polling.

Polling interval configurable.

UI harus tetap berjalan.

============================================================
# 54. OFFLINE
============================================================

Monitoring offline:

Tampilkan:

"Tidak dapat memperbarui data."

Jangan menampilkan
data lama seolah realtime.

Berikan:

Last updated:
timestamp.

============================================================
# 55. LAST UPDATED
============================================================

Dashboard menampilkan:

Terakhir diperbarui:

12:32:10.

Timestamp berasal dari server.

============================================================
# 56. LOADING
============================================================

Gunakan:

Skeleton
Loading state
Empty state
Error state.

Jangan menggunakan
blank screen.

============================================================
# 57. EMPTY STATE
============================================================

Jika belum ada attendance:

"Belum ada data absensi
untuk periode ini."

Bukan:

dummy rows.

============================================================
# 58. ERROR STATE
============================================================

API error:

"Data belum dapat dimuat."

Button:

[Coba Lagi]

Jangan tampilkan
technical stack trace.

============================================================
# 59. RESPONSIVE
============================================================

Desktop:

Sidebar
Command center
Large map
Data table.

Tablet:

Collapsible sidebar
Map + table.

Mobile:

Cards
Map
Activity
Filters.

============================================================
# 60. MOBILE ROLE
============================================================

Guru:

My Attendance
My Classes
Student Attendance
History.

Security:

Gate Scanner
Today's Gate Attendance
Invalid Scan
Gate Activity.

Karyawan:

My Attendance
GPS Attendance
Location QR
History.

TU:

Dashboard
Student Attendance
Employee Attendance
Corrections
Reports.

============================================================
# 61. SUPER ADMIN
============================================================

Super Admin:

Organization-wide monitoring.

Namun menu monitoring
tidak boleh mencampurkan
management settings.

============================================================
# 62. YAYASAN
============================================================

Yayasan:

View authorized units.

Tidak otomatis mendapatkan
system administration.

============================================================
# 63. KEPALA SEKOLAH
============================================================

Kepala Sekolah:

Monitoring unit sekolah.

Dapat melihat:

Guru
Karyawan
Siswa.

Sesuai policy.

============================================================
# 64. SECURITY
============================================================

Security:

Gate Scanner
Gate Activity
Invalid QR
Today's Student Attendance.

Tidak boleh:

edit master student
edit employee
edit roles
edit locations.

============================================================
# 65. WALI KELAS
============================================================

Wali kelas:

Class Attendance
Student Attendance
Manual Attendance
History.

Tidak boleh:

view seluruh sekolah
jika permission tidak diberikan.

============================================================
# 66. AUDIT SECURITY
============================================================

Audit access juga harus
permission protected.

Tidak semua user boleh
melihat audit.

============================================================
# 67. DATA PRIVACY
============================================================

Dashboard tidak boleh
menampilkan:

password
token
QR secret
full sensitive personal data.

============================================================
# 68. API FILTER VALIDATION
============================================================

Server harus memvalidasi:

date
unit_id
rombel_id
status
method.

Jangan menerima arbitrary
scope dari client.

============================================================
# 69. SQL / ORM
============================================================

Gunakan ORM/database layer
yang sudah digunakan project.

Hindari raw query
jika tidak diperlukan.

Jika raw query diperlukan:

gunakan parameter binding.

============================================================
# 70. INDEX
============================================================

Optimalkan index pada:

attendance_date
employee_id
student_id
unit_id
rombel_id
status
method
location_id
created_at.

Sesuaikan dengan schema aktual.

============================================================
# 71. AUDIT QUERY
============================================================

Audit harus searchable.

Filter:

actor
action
date
attendance
user.

============================================================
# 72. SECURITY ALERT
============================================================

Alert types:

INVALID_QR_BURST
REVOKED_QR_ATTEMPT
OUTSIDE_RADIUS_BURST
SUSPICIOUS_LOCATION
UNAUTHORIZED_ATTENDANCE_ATTEMPT.

============================================================
# 73. ALERT SEVERITY
============================================================

INFO

WARNING

HIGH

CRITICAL.

Severity ditentukan
berdasarkan policy.

============================================================
# 74. ALERT WORKFLOW
============================================================

Create
↓
Notify authorized users
↓
Review
↓
Resolve
↓
Audit.

============================================================
# 75. DASHBOARD CUSTOMIZATION
============================================================

Jika project mendukung
dashboard widgets:

Role dapat memiliki
layout berbeda.

Namun data source tetap
API/database.

============================================================
# 76. NO DUPLICATE FEATURE
============================================================

Sebelum membuat:

Dashboard
Activity
Reports
Notifications
Audit.

Audit existing codebase.

REUSE.

Jangan membuat:

AttendanceDashboard2
AttendanceMonitorNew
AttendanceReportNew.

============================================================
# 77. TESTING
============================================================

Test:

Dashboard data
Role filtering
Unit filtering
Rombel filtering
Date filtering
Realtime event
Polling fallback
Pagination
Search
Export
Correction
Audit
Security alert.

============================================================
# 78. RBAC TEST
============================================================

Test:

Super Admin
Yayasan
Kepala Sekolah
TU
Security
Wali Kelas
Guru
Karyawan.

Pastikan setiap role
hanya melihat menu
dan data yang diizinkan.

============================================================
# 79. API TEST
============================================================

Test:

200
401
403
404
409
422
429
500.

============================================================
# 80. E2E
============================================================

SCENARIO 1:

Security scan student
↓
Attendance created
↓
Dashboard updates.

SCENARIO 2:

Employee GPS check-in
↓
Attendance created
↓
Dashboard updates.

SCENARIO 3:

Teacher manual attendance
↓
Dashboard updates.

SCENARIO 4:

Correction submitted
↓
Approval
↓
Dashboard/report updates.

============================================================
# 81. PRODUCTION RULE
============================================================

Tidak boleh ada:

dummy statistics
fake live activity
fake map marker
fake notification
dummy attendance rows
mock API.

Automated tests boleh menggunakan
fixtures hanya di test environment.

============================================================
# 82. DATABASE
============================================================

Dashboard harus membaca
attendance actual.

Jangan menyimpan
statistik sebagai angka manual
jika dapat dihitung dari source
data aktual.

Jika materialized/summary table
digunakan:

harus memiliki mekanisme
sinkronisasi yang reliable.

============================================================
# 83. REAL-TIME CONSISTENCY
============================================================

Event realtime bukan
source of truth.

Jika event gagal:

Database tetap benar.

Dashboard dapat melakukan
re-fetch.

============================================================
# 84. AUDIT CONSISTENCY
============================================================

Attendance change:

Attendance
+
Audit
harus konsisten.

Gunakan transaction.

============================================================
# 85. FINAL PRODUCTION CHECK
============================================================

Pastikan:

[ ] Semua API real
[ ] Semua dashboard dinamis
[ ] Semua filter bekerja
[ ] Search bekerja
[ ] Pagination bekerja
[ ] Role bekerja
[ ] Permission bekerja
[ ] Unit scope bekerja
[ ] Rombel scope bekerja
[ ] Map bekerja
[ ] Realtime bekerja
[ ] Fallback bekerja
[ ] Correction bekerja
[ ] Audit bekerja
[ ] Export bekerja
[ ] Notification bekerja
[ ] Tidak ada dummy
[ ] Tidak ada simulation
[ ] Tidak ada hardcode.

============================================================
# 86. FINAL REPORT
============================================================

Setelah implementasi berikan:

1. Dashboard modules
2. API endpoints
3. Database queries
4. Realtime mechanism
5. RBAC implementation
6. Map implementation
7. Security implementation
8. Correction workflow
9. Audit workflow
10. Report/export
11. Test results
12. Performance results
13. Remaining issues.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN:

ATTENDANCE COMMAND CENTER

SEBAGAI SATU SISTEM TERINTEGRASI DENGAN:

QR ENGINE
+
GPS ENGINE
+
REST API
+
DATABASE
+
RBAC
+
AUDIT
+
NOTIFICATION
+
REPORTING.

SEMUA DATA HARUS REAL.

SEMUA ROLE HARUS TERISOLASI.

SEMUA CRUD DAN ACTION HARUS
MENGGUNAKAN API DAN DATABASE.

TIDAK BOLEH ADA:

DUMMY
MOCK
SIMULATION
HARDCODED STATISTICS
FAKE REALTIME
FAKE MAP
BYPASS RBAC.

============================================================
END OF 146
============================================================