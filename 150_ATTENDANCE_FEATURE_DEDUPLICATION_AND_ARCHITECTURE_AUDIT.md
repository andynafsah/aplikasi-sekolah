# 150 — ATTENDANCE FEATURE DEDUPLICATION & ARCHITECTURE AUDIT

## MASTER AUDIT PROMPT

JANGAN MEMBUAT FITUR BARU.

JANGAN MEMBUAT MIGRATION BARU.

JANGAN MEMBUAT TABLE BARU.

JANGAN MEMBUAT API BARU.

JANGAN MEMBUAT UI BARU.

JANGAN MENGUBAH BUSINESS LOGIC.

JANGAN MENGHAPUS DATA.

JANGAN MELAKUKAN REFACTOR BESAR.

TUGAS ANDA SAAT INI HANYA:

AUDIT SELURUH CODEBASE
UNTUK MENDETEKSI DUPLIKASI FITUR
ABSENSI DAN MENENTUKAN
ARSITEKTUR FINAL YANG AKAN DIPAKAI.

==================================================
# 1. TUJUAN
==================================================

Pastikan aplikasi hanya mempunyai
SATU SOURCE OF TRUTH untuk:

- Attendance
- QR Student Attendance
- QR Location Attendance
- GPS Attendance
- Manual Attendance
- Security Gate Attendance
- Employee Attendance
- Teacher Attendance
- Student Attendance
- Schedule
- Working Calendar
- Late Calculation
- Absence Calculation
- Correction
- Reporting
- Notification
- Audit.

Jika fitur sudah tersedia:

REUSE.

Jangan membuat versi kedua.

==================================================
# 2. WAJIB AUDIT SELURUH PROJECT
==================================================

Scan:

/app
/src
/lib
/routes
/controllers
/services
/repositories
/models
/entities
/database
/prisma
/migrations
/components
/pages
/screens
/widgets
/hooks
/providers
/api
/tests
/docs

dan seluruh folder lain
yang relevan.

Jangan hanya mencari
berdasarkan nama file.

==================================================
# 3. CARI DUPLIKASI
==================================================

Cari semua implementasi
yang berhubungan dengan:

attendance
absensi
presensi
presence
checkin
check-in
checkout
check-out
student attendance
employee attendance
teacher attendance
QR
barcode
scanner
GPS
geolocation
location
gate
security
late
absence
schedule
shift
calendar
holiday
correction
approval
report
notification.

==================================================
# 4. AUDIT DATABASE
==================================================

Identifikasi semua table/entity
yang berhubungan dengan attendance.

Contoh:

attendance
attendances
student_attendance
employee_attendance
teacher_attendance
presences
checkins
checkouts
attendance_logs
attendance_records.

Jika ada lebih dari satu
yang memiliki fungsi sama:

JANGAN LANGSUNG HAPUS.

Laporkan:

TABLE
PURPOSE
USED BY
RELATION
STATUS
RECOMMENDATION.

==================================================
# 5. AUDIT API
==================================================

Cari semua endpoint:

/attendance
/presence
/checkin
/checkout
/qr
/gps
/location
/security
/gate.

Identifikasi:

DUPLICATE
OVERLAP
UNUSED
LEGACY
ACTIVE.

==================================================
# 6. AUDIT SERVICE
==================================================

Cari:

AttendanceService
PresenceService
CheckInService
StudentAttendanceService
EmployeeAttendanceService
QrAttendanceService
GpsAttendanceService
GateAttendanceService.

Tentukan apakah mereka:

CORE SERVICE
ADAPTER
SPECIALIZED SERVICE
DUPLICATE.

==================================================
# 7. ARSITEKTUR YANG DIINGINKAN
==================================================

Gunakan:

                    ATTENDANCE CORE
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
         QR               GPS             MANUAL
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                  ATTENDANCE RECORD
                           ↓
                  ATTENDANCE ENGINE
                           ↓
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       STATUS            REPORT          NOTIFICATION
                           │
                        AUDIT

QR, GPS dan MANUAL
adalah METHOD/SOURCE.

BUKAN tiga database
attendance yang berbeda.

==================================================
# 8. STUDENT ATTENDANCE
==================================================

Siswa dapat diabsen melalui:

1. QR kartu pelajar
2. Manual oleh guru
3. Manual oleh wali kelas
4. Scan oleh Security
5. Scan oleh guru pengampu.

Semua harus menghasilkan:

SATU ATTENDANCE RECORD.

Jangan membuat:

student_qr_attendance
student_manual_attendance
student_gate_attendance

sebagai sistem terpisah
jika sebenarnya semuanya
adalah attendance yang sama.

==================================================
# 9. EMPLOYEE ATTENDANCE
==================================================

Guru/karyawan dapat menggunakan:

1. GPS
2. QR lokasi sekolah
3. metode lain yang memang
   sudah tersedia.

Semua masuk ke:

ATTENDANCE CORE.

Method disimpan sebagai:

GPS
QR
MANUAL

atau enum existing yang
paling tepat.

==================================================
# 10. SECURITY GATE
==================================================

Security Gate bukan
attendance engine baru.

Security Gate adalah:

ATTENDANCE ENTRY POINT.

Flow:

Security
↓
Scan Student QR
↓
Validate
↓
Attendance Core
↓
Attendance Record.

==================================================
# 11. GURU
==================================================

Guru juga merupakan
attendance actor.

Jangan membuat:

TeacherAttendanceEngine

jika EmployeeAttendance
sudah mencakup guru.

Gunakan:

PERSON
+
ROLE
+
ATTENDANCE.

==================================================
# 12. QR ENGINE
==================================================

Audit semua QR implementation.

Pisahkan konsep:

A. STUDENT CARD QR

Identitas siswa.

B. LOCATION QR

Identitas lokasi/gate.

Jika scanner implementation
sama, gunakan scanner core
yang sama.

Jangan membuat dua
QR scanner engine tanpa alasan.

==================================================
# 13. GPS ENGINE
==================================================

Audit semua:

GPS
Geolocation
Location validation
Radius validation.

Harus mempunyai:

SATU LOCATION VALIDATION CORE.

Jangan ada:

GpsService
LocationService
GeofenceService

yang menghitung radius
dengan formula berbeda.

Jika semuanya dibutuhkan:

gunakan satu core validator.

==================================================
# 14. SCHEDULE
==================================================

Cari semua:

schedule
shift
working hours
working days
calendar
holiday
grace period
cutoff.

Jika sudah ada:

JANGAN membuat
Schedule Engine baru.

Integrasikan attendance
ke schedule existing.

==================================================
# 15. LATE CALCULATION
==================================================

Cari semua implementasi:

late
tardy
delay
grace period.

Harus hanya ada:

SATU BUSINESS RULE.

Contoh:

actual time
vs
schedule start
vs
grace period.

Dashboard
Report
Notification
Attendance

harus menggunakan
perhitungan yang sama.

==================================================
# 16. ABSENCE CALCULATION
==================================================

Cari semua implementasi:

absent
alpa
not present
missing attendance.

Harus hanya ada
satu sumber perhitungan.

Jangan:

Dashboard:
formula A

Report:
formula B

Notification:
formula C.

==================================================
# 17. CORRECTION
==================================================

Cari:

attendance correction
edit attendance
manual correction
approval correction.

Jika sudah ada:

REUSE.

Jangan membuat:

AttendanceCorrectionV2.

==================================================
# 18. REPORTING
==================================================

Cari:

AttendanceReport
AttendanceReporting
ReportAttendance
ExportAttendance.

Jika sudah ada:

REUSE existing.

Dokumen:

148_ENTERPRISE_ATTENDANCE_REPORTING...

hanya menjadi requirement
tambahan jika fitur tersebut
belum tersedia.

BUKAN alasan membuat
report engine kedua.

==================================================
# 19. NOTIFICATION
==================================================

Cari:

NotificationService
PushService
AttendanceNotification
AlertService.

Jika sudah ada:

REUSE.

Notification hanya
menerima event dari
Attendance Core.

==================================================
# 20. AUDIT
==================================================

Cari:

AuditService
AuditLog
ActivityLog
SecurityLog.

Jangan membuat audit engine
khusus attendance jika
global audit engine sudah ada.

==================================================
# 21. FRONTEND AUDIT
==================================================

Cari semua:

AttendanceScreen
AttendancePage
PresensiPage
StudentAttendancePage
EmployeeAttendancePage
QrAttendancePage
GpsAttendancePage.

Identifikasi:

DUPLICATE UI
SHARED UI
SPECIALIZED UI.

Jika fungsi sama:

gunakan shared component.

==================================================
# 22. FLUTTER AUDIT
==================================================

Cari:

attendance_screen
attendance_page
qr_scanner
gps_attendance
manual_attendance
security_gate.

Pastikan tidak ada
screen yang melakukan
business calculation sendiri.

Flutter hanya:

capture
display
submit
consume API.

==================================================
# 23. WEB AUDIT
==================================================

Web juga tidak boleh
menghitung sendiri.

Frontend:

UI
filter
input
display.

Backend:

business logic.

==================================================
# 24. DATABASE SOURCE OF TRUTH
==================================================

Tentukan satu:

ATTENDANCE RECORD TABLE.

Semua method:

QR
GPS
MANUAL
SECURITY

masuk ke record tersebut.

==================================================
# 25. FIELD METHOD
==================================================

Jika belum ada,
identifikasi kebutuhan:

method/source:

QR_STUDENT_CARD
QR_LOCATION
GPS
MANUAL
SECURITY_GATE

Namun:

JANGAN MIGRATION.

Hanya laporkan apakah
schema existing sudah
mendukung.

==================================================
# 26. FIELD ACTOR
==================================================

Bedakan:

subject/person
dengan
recorded_by.

Contoh:

student_id = siswa yang hadir

recorded_by = guru/security.

Jangan mencampur keduanya.

==================================================
# 27. ABSENSI OLEH SECURITY
==================================================

Security:

recorded_by = security user

subject = student.

==================================================
# 28. ABSENSI OLEH GURU
==================================================

Guru:

recorded_by = teacher user

subject = student.

==================================================
# 29. ABSENSI DIRI KARYAWAN
==================================================

Karyawan:

subject = employee

recorded_by = employee

method = GPS/QR.

==================================================
# 30. RBAC AUDIT
==================================================

Pastikan role:

Super Admin
Yayasan
Kepala Sekolah
TU
Security
Guru
Wali Kelas
Karyawan

tidak mendapatkan
permission berlebihan.

==================================================
# 31. MENU AUDIT
==================================================

Cari menu duplicate:

Absensi
Presensi
Attendance
Kehadiran.

Jika ada dua menu
dengan fungsi sama:

tandai DUPLICATE.

Jangan langsung hapus.

==================================================
# 32. ROUTE AUDIT
==================================================

Cari route duplicate.

Contoh:

/attendance
/presensi
/absensi

Jika ketiganya mengarah
ke fitur sama:

tentukan PRIMARY ROUTE.

==================================================
# 33. MODEL AUDIT
==================================================

Cari model duplicate.

Contoh:

Attendance
Presence
AttendanceRecord.

Tentukan:

PRIMARY
LEGACY
ADAPTER
DUPLICATE.

==================================================
# 34. MIGRATION AUDIT
==================================================

Cari migration
yang membuat table attendance
lebih dari sekali.

Laporkan:

migration
table
purpose
status.

Jangan mengubah migration
production secara otomatis.

==================================================
# 35. SERVICE DEPENDENCY
==================================================

Buat dependency map:

UI
↓
API
↓
Controller
↓
Service
↓
Repository
↓
Database.

Tunjukkan jika ada
jalur alternatif yang
menghasilkan data berbeda.

==================================================
# 36. BUSINESS RULE DUPLICATION
==================================================

Cari logic duplicate:

late
absence
distance
QR validation
duplicate scan
schedule.

Harus ada satu
authoritative implementation.

==================================================
# 37. IDENTIFIKASI LEGACY
==================================================

Kode lama tidak langsung
dihapus.

Tandai:

LEGACY.

Jika masih digunakan:

KEEP.

Jika tidak digunakan:

SAFE TO REMOVE
tetapi jangan hapus otomatis.

==================================================
# 38. IDENTIFIKASI DEAD CODE
==================================================

Cari:

unused service
unused controller
unused route
unused component
unused table
unused API.

Jangan hapus otomatis.

==================================================
# 39. DUPLICATE SCORE
==================================================

Setiap fitur beri status:

🟢 UNIQUE
🟡 OVERLAP
🔴 DUPLICATE
⚪ LEGACY.

==================================================
# 40. WAJIB HASILKAN MATRIX
==================================================

Buat tabel:

| Feature | Existing | New Doc | Status | Primary |
|---|---|---|---|---|
| Student QR | ? | 148/previous | ? | ? |
| Security Scan | ? | previous | ? | ? |
| GPS | ? | previous | ? | ? |
| Manual | ? | previous | ? | ? |
| Employee | ? | previous | ? | ? |
| Schedule | ? | 150 | ? | ? |
| Report | ? | 148 | ? | ? |
| Notification | ? | 149 | ? | ? |
| Correction | ? | 147 | ? | ? |

Isi berdasarkan CODEBASE,
BUKAN asumsi.

==================================================
# 41. PRIMARY ARCHITECTURE
==================================================

Tentukan satu architecture final:

ATTENDANCE CORE
    ↓
METHOD ADAPTERS
    ├── QR
    ├── GPS
    ├── MANUAL
    └── SECURITY
    ↓
ATTENDANCE RECORD
    ↓
CALCULATION
    ↓
REPORT / NOTIFICATION / AUDIT.

==================================================
# 42. RULE
==================================================

Jika fitur existing
SUDAH BENAR:

DO NOTHING.

Jika fitur existing
sebagian:

EXTEND.

Jika duplicate:

MARK FOR CONSOLIDATION.

Jika legacy:

MARK LEGACY.

Jika missing:

MARK MISSING.

JANGAN IMPLEMENTASI
FITUR BARU PADA AUDIT INI.

==================================================
# 43. CRITICAL RULE
==================================================

JANGAN PERNAH:

- membuat duplicate table
- membuat duplicate endpoint
- membuat duplicate service
- membuat duplicate controller
- membuat duplicate calculation
- membuat duplicate screen
- membuat duplicate permission
- membuat duplicate menu.

==================================================
# 44. PRODUCTION SAFETY
==================================================

Audit harus:

READ ONLY.

Tidak boleh:

delete
drop
truncate
migration
rename production table
ubah data production.

==================================================
# 45. OUTPUT
==================================================

Setelah audit, hasilkan:

1. EXECUTIVE SUMMARY
2. FEATURE MATRIX
3. DATABASE DUPLICATION MATRIX
4. API DUPLICATION MATRIX
5. SERVICE DUPLICATION MATRIX
6. FRONTEND DUPLICATION MATRIX
7. BUSINESS LOGIC DUPLICATION MATRIX
8. RBAC DUPLICATION MATRIX
9. MENU DUPLICATION MATRIX
10. LEGACY COMPONENTS
11. DEAD CODE CANDIDATES
12. PRIMARY SOURCE OF TRUTH
13. FINAL ATTENDANCE ARCHITECTURE
14. CONSOLIDATION PLAN
15. RISKS
16. RECOMMENDATION.

==================================================
# 46. CONSOLIDATION PLAN
==================================================

Buat prioritas:

P0 = security/data integrity
P1 = duplicate business logic
P2 = duplicate API/service
P3 = duplicate UI/menu
P4 = cleanup/dead code.

==================================================
# 47. JANGAN LANGSUNG REFACTOR
==================================================

Setelah audit:

STOP.

Jangan melakukan
consolidation otomatis.

Tunggu instruksi berikutnya.

==================================================
# FINAL COMMAND
==================================================

AUDIT SELURUH CODEBASE.

TUJUANNYA BUKAN MEMBUAT FITUR.

TUJUANNYA ADALAH MENEMUKAN
SEMUA DUPLIKASI DAN MENENTUKAN
SATU IMPLEMENTASI UTAMA.

JIKA SUDAH ADA:

REUSE.

JIKA OVERLAP:

CONSOLIDATE.

JIKA LEGACY:

MARK.

JIKA MISSING:

REPORT.

JANGAN MEMBUAT FITUR BARU.

JANGAN MENGUBAH DATABASE.

JANGAN MENGUBAH DATA.

JANGAN MEMBUAT MIGRATION.

JANGAN MEMBUAT SIMULASI.

JANGAN MEMBUAT DUMMY DATA.

==================================================
END OF 150
==================================================