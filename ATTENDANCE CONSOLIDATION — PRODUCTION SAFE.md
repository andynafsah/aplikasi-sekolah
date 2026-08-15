# ATTENDANCE CONSOLIDATION — PRODUCTION SAFE

JANGAN MEMBUAT FITUR ABSENSI BARU.

JANGAN MEMBUAT ATTENDANCE ENGINE BARU.

JANGAN MEMBUAT DATABASE TABLE BARU.

JANGAN MEMBUAT DUPLICATE SERVICE.

JANGAN MEMBUAT DUPLICATE API.

JANGAN MEMBUAT DUPLICATE UI.

Gunakan hasil:
150 — ENTERPRISE ATTENDANCE & ARCHITECTURE AUDIT REPORT

sebagai SOURCE OF TRUTH.

==================================================
TUJUAN
==================================================

KONSOLIDASIKAN SELURUH FITUR ABSENSI
MENJADI SATU ATTENDANCE CORE.

PRIMARY:

Database:
Prisma Attendance

Service:
smartAttendanceService

Schedule:
ScheduleEngineService

Calculation:
AttendanceCalculationService

Export:
AttendanceExportService

Notification:
NotificationService

==================================================
1. ATTENDANCE CORE
==================================================

Semua metode harus masuk:

QR STUDENT
QR LOCATION
GPS
MANUAL
SECURITY GATE

→ smartAttendanceService
→ Attendance model.

Jangan membuat database attendance
berbeda berdasarkan metode.

==================================================
2. STUDENT QR
==================================================

Pertahankan:

smartAttendanceService.scanStudentQr

Digunakan oleh:

Security
Guru
Wali Kelas

berdasarkan RBAC.

Student QR hanya menjadi
METHOD/ENTRY POINT.

Record tetap:

Attendance.

==================================================
3. SECURITY GATE
==================================================

Security scan:

/student/scan

tetap menjadi entry point
khusus security.

Tetapi proses akhirnya:

/student/scan
↓
smartAttendanceService
↓
Attendance.

Jangan membuat SecurityAttendance
sebagai engine baru.

==================================================
4. GURU
==================================================

Guru dapat:

QR Scan
Manual Attendance

Scope:

kelas/rombel yang menjadi
hak akses guru.

Backend wajib melakukan
authorization.

==================================================
5. EMPLOYEE/GURU PERSONAL
==================================================

Pertahankan:

/employee/gps
/employee/qr

Tetapi keduanya wajib
menggunakan:

smartAttendanceService.

==================================================
6. GPS
==================================================

Gunakan:

smartAttendanceService.processEmployeeGpsAttendance

Hapus/deprecate duplicate
GPS implementation di:

AttendanceService.

==================================================
7. QR LOCATION
==================================================

Gunakan:

smartAttendanceService.processEmployeeQrAttendance

Jangan membuat QR location
service kedua.

==================================================
8. MANUAL
==================================================

Semua manual attendance
harus masuk melalui
satu workflow.

Correction dan manual
attendance jangan memiliki
business logic berbeda.

Gunakan:

smartAttendanceService.

==================================================
9. CORRECTION
==================================================

Primary:

smartAttendanceService.requestCorrection

AttendanceService.processManualRequest
tidak boleh menjadi workflow
kedua.

Jika masih digunakan oleh
legacy API:

buat compatibility adapter.

Jangan duplicate logic.

==================================================
10. SCHEDULE
==================================================

PRIMARY:

ScheduleEngineService.

Semua:

late
holiday
working day
shift
grace period
schedule override

wajib menggunakan:

ScheduleEngineService.

Jangan menggunakan:

07:00
08:00
10 minutes

secara hardcoded.

==================================================
11. DISTANCE
==================================================

Hanya satu Haversine implementation.

Cari seluruh:

calculateDistance

Buat shared utility/core
jika diperlukan.

Semua GPS/geofence
menggunakan implementation
yang sama.

==================================================
12. DOUBLE SCAN
==================================================

Gunakan satu mekanisme
duplicate attendance detection.

Source:

Prisma Attendance.

Jangan bergantung pada
in-memory array sebagai
source of truth.

==================================================
13. DATABASE
==================================================

Attendance table:

PRIMARY SOURCE OF TRUTH.

Semua:

student
employee
teacher
security

attendance record
disimpan di sini.

==================================================
14. IN-MEMORY STORE
==================================================

Audit:

smartAttendanceStore
locationPointsStore
correctionStore
inMemoryDb.

Jangan menghapus secara
sembarangan.

Tentukan:

CACHE
FALLBACK
LEGACY
DUPLICATE.

Database tetap authoritative.

==================================================
15. SECURITY
==================================================

DEPRECATE /smartAttendance

Endpoint tersebut melakukan
raw Prisma write tanpa
validation.

Tidak boleh ada endpoint
yang dapat membuat attendance
dengan bypass:

RBAC
schedule
GPS
QR
duplicate detection
business rules.

Jika masih diperlukan legacy:

ubah menjadi adapter yang
memanggil smartAttendanceService.

==================================================
16. API STANDARD
==================================================

Gunakan standard:

POST /check-in
POST /check-out

POST /employee/gps
POST /employee/qr
POST /student/scan

POST /correction/request

GET /location/points

Jangan membuat route baru
jika route existing sudah
memenuhi kebutuhan.

==================================================
17. CAMELCASE ROUTES
==================================================

Legacy:

/checkIn
/checkOut
/manualRequest

Jangan langsung dihapus.

Buat compatibility alias
sementara jika masih digunakan.

Tetapi implementasinya harus
memanggil route/service utama.

==================================================
18. FRONTEND
==================================================

Attendance.tsx:

PRIMARY OUTER LAYOUT.

SmartAttendanceCore:

PRIMARY OPERATOR/SECURITY CONSOLE.

EnterpriseEmployeeAttendanceWorkspace:

gunakan hanya jika memang
dibutuhkan untuk mobile employee.

Jangan tampilkan workspace
duplicate.

==================================================
19. SETTINGS
==================================================

Jangan membuat:

EnterpriseAttendanceSettings
sebagai settings engine kedua.

Gabungkan fungsi yang memang
dibutuhkan ke:

AttendanceScheduler.

Tetap pisahkan permission
antara:

view
manage
approve.

==================================================
20. RBAC
==================================================

Security:

student gate scan only.

Guru:

student attendance sesuai
scope kelas/rombel.

Wali Kelas:

scope rombel.

Karyawan:

personal attendance.

TU:

monitoring/report/correction
sesuai permission.

Kepala Sekolah:

monitoring/approval sesuai
permission.

Super Admin/Yayasan:

administrative control
sesuai permission.

Jangan memberikan
akses hanya karena role name.

Gunakan permission + scope.

==================================================
21. BUSINESS FLOW
==================================================

STUDENT QR:

QR
↓
validate student
↓
validate actor
↓
validate schedule
↓
validate attendance state
↓
smartAttendanceService
↓
Attendance.

EMPLOYEE GPS:

GPS
↓
validate user
↓
validate schedule
↓
validate geofence
↓
smartAttendanceService
↓
Attendance.

EMPLOYEE QR:

QR Location
↓
validate location
↓
validate schedule
↓
smartAttendanceService
↓
Attendance.

MANUAL:

Teacher/Security
↓
validate permission
↓
validate scope
↓
smartAttendanceService
↓
Attendance.

==================================================
22. TRANSACTION
==================================================

Attendance creation
harus transactional.

Notification failure
tidak boleh rollback
attendance.

==================================================
23. HISTORICAL DATA
==================================================

Jangan mengubah
attendance lama.

Jangan melakukan
mass recalculation
tanpa instruksi.

==================================================
24. MIGRATION SAFETY
==================================================

Jangan membuat migration
hanya untuk refactoring
service/API.

Migration hanya jika
benar-benar diperlukan
oleh schema.

==================================================
25. TESTING
==================================================

Setelah consolidation:

test:

Student QR
Security QR
Teacher QR
Teacher Manual
Employee GPS
Employee QR
Check-in
Check-out
Late
Holiday
Schedule
Geofence
Duplicate Scan
Correction
Notification
RBAC.

==================================================
26. REGRESSION
==================================================

Pastikan fitur existing
tidak rusak.

Jalankan:

TypeScript check
Lint
Unit Test
Integration Test
Build.

==================================================
27. FINAL DUPLICATION CHECK
==================================================

Setelah selesai scan ulang
seluruh codebase.

Pastikan tidak ada:

duplicate AttendanceService
duplicate GPS calculation
duplicate late calculation
duplicate correction logic
duplicate attendance database
duplicate UI
duplicate settings
duplicate API business logic.

==================================================
28. PRODUCTION RULE
==================================================

JANGAN MENGHAPUS KODE
YANG MASIH DIGUNAKAN
TANPA COMPATIBILITY CHECK.

JANGAN MENGUBAH DATA PRODUCTION.

JANGAN MENGHAPUS TABLE.

JANGAN RESET DATABASE.

JANGAN MEMBUAT DUMMY DATA.

JANGAN MEMBUAT SIMULATION MODE.

==================================================
29. FINAL REPORT
==================================================

Setelah implementasi tampilkan:

1. Files changed
2. Services consolidated
3. Routes consolidated
4. Components consolidated
5. Business logic consolidated
6. Deprecated routes
7. Legacy compatibility
8. Database impact
9. RBAC verification
10. Test result
11. Build result
12. Remaining duplicate
13. Remaining risks.

==================================================
FINAL ACCEPTANCE
==================================================

HANYA BOLEH ADA SATU:

ATTENDANCE CORE
ATTENDANCE DATABASE
ATTENDANCE CALCULATION
SCHEDULE SOURCE
LOCATION VALIDATION
CORRECTION WORKFLOW.

SEMUA ENTRY POINT
HARUS MENGGUNAKAN CORE YANG SAMA.

STOP SETELAH CONSOLIDATION.

JANGAN MEMBUAT FITUR BARU
SETELAH CONSOLIDATION SELESAI.