# 151 — ENTERPRISE ATTENDANCE PRODUCTION HARDENING

## MASTER PRODUCTION PROMPT

TUGAS INI BUKAN MEMBUAT FITUR ABSENSI BARU.

TUGAS INI ADALAH MENGAMANKAN,
MEMVALIDASI DAN MEMASTIKAN
SELURUH ATTENDANCE CORE EXISTING
SIAP PRODUKSI.

WAJIB REUSE:

- Attendance Prisma Model
- smartAttendanceService
- ScheduleEngineService
- AttendanceCalculationService
- NotificationService
- Location/Geofence Engine
- Correction Workflow
- Existing RBAC
- Existing Audit Engine.

==================================================
1. SOURCE OF TRUTH
==================================================

Pastikan hanya ada:

Attendance
        ↓
Attendance Core
        ↓
Calculation
        ↓
Report
        ↓
Notification
        ↓
Audit.

Tidak boleh ada business logic
attendance yang berjalan di luar
Attendance Core.

==================================================
2. PRODUCTION SECURITY
==================================================

Audit seluruh endpoint attendance.

Pastikan:

Authentication
↓
Authorization
↓
Scope Validation
↓
Business Validation
↓
Transaction
↓
Database.

Tidak boleh:

Frontend → Database
Frontend → raw attendance insert
Frontend → bypass service.

==================================================
3. /smartAttendance
==================================================

Pastikan endpoint berisiko:

/smartAttendance

tidak dapat melakukan
raw attendance creation
tanpa validation.

Jika masih digunakan:

ubah menjadi adapter
yang memanggil:

smartAttendanceService.

Jika tidak digunakan:

mark deprecated.

Jangan langsung menghapus
sebelum dependency check.

==================================================
4. QR SECURITY
==================================================

Student QR:

validate
↓
resolve student
↓
check active status
↓
check actor permission
↓
check scope
↓
check schedule
↓
check duplicate
↓
create attendance.

QR tidak boleh dipercaya
hanya karena formatnya valid.

==================================================
5. LOCATION QR
==================================================

QR lokasi harus:

active
valid
registered
belong to organization
belong to unit
within allowed policy.

Jangan menerima:

location_id
dari client

tanpa server validation.

==================================================
6. GPS SECURITY
==================================================

Jangan percaya:

latitude
longitude
accuracy

dari client secara langsung.

Server harus:

validate payload
validate coordinates
validate timestamp
validate user
validate schedule
validate geofence.

==================================================
7. GPS SPOOFING
==================================================

Jika infrastructure existing
mendukung:

detect mock location
impossible movement
abnormal accuracy
abnormal speed
timestamp anomaly.

Jika belum tersedia:

MARK AS FUTURE HARDENING.

Jangan membuat sistem baru
yang tidak diperlukan.

==================================================
8. TIMESTAMP
==================================================

Server timestamp adalah
source of truth.

Client timestamp hanya
sebagai metadata.

Jangan gunakan:

device_time

untuk menentukan status
hadir/terlambat.

==================================================
9. DUPLICATE ATTENDANCE
==================================================

Gunakan database constraint
dan service validation.

Jangan hanya:

if (memory.includes(...))

karena tidak aman
untuk multiple device.

==================================================
10. CONCURRENCY
==================================================

Dua HP melakukan scan
bersamaan.

Hasil harus:

SATU attendance.

Gunakan:

transaction
unique constraint
atomic validation.

==================================================
11. IDEMPOTENCY
==================================================

Untuk request attendance
yang dapat dikirim ulang:

gunakan idempotency mechanism
jika infrastructure existing
mendukung.

Request retry tidak boleh
membuat duplicate attendance.

==================================================
12. RATE LIMIT
==================================================

Rate limit endpoint:

student scan
employee QR
employee GPS
manual attendance
correction.

Jangan membuat angka
hardcoded jika konfigurasi
existing tersedia.

==================================================
13. RBAC
==================================================

Test:

Super Admin
Yayasan
Kepala Sekolah
TU
Security
Guru
Wali Kelas
Karyawan.

Setiap role hanya dapat
melakukan operasi sesuai:

permission
+
scope.

==================================================
14. SECURITY SCOPE
==================================================

Contoh:

Guru Unit A
tidak boleh scan/manual
siswa Unit B.

Security Gate A
tidak boleh mengubah
attendance Gate B
kecuali permission
mengizinkan.

==================================================
15. STUDENT CARD
==================================================

QR kartu pelajar harus
mengarah ke identifier
yang aman.

Jangan simpan:

password
token authentication
data sensitif berlebihan

di QR.

==================================================
16. QR REVOKE
==================================================

Jika kartu siswa
dinonaktifkan:

scan harus ditolak.

Jangan bergantung pada
status kartu di frontend.

==================================================
17. EMPLOYEE DEVICE
==================================================

Jika device binding
sudah tersedia:

pastikan:

user
device
token
status

tervalidasi.

Jangan membuat device
engine kedua.

==================================================
18. OFFLINE
==================================================

Jika aplikasi mendukung
offline attendance:

jangan langsung percaya
record offline.

Saat sync:

validate ulang:

user
timestamp
QR
GPS
schedule
duplicate.

==================================================
19. MANUAL ATTENDANCE
==================================================

Manual attendance harus
memiliki:

actor
subject
reason/context
timestamp
scope.

Tidak boleh:

user memilih arbitrary
student_id tanpa authorization.

==================================================
20. CORRECTION
==================================================

Correction tidak boleh
mengubah attendance
secara langsung.

Flow:

Request
↓
Approval
↓
Authorized Update
↓
Audit.

==================================================
21. AUDIT
==================================================

Audit minimal:

attendance.created
attendance.updated
attendance.corrected
attendance.rejected
qr.invalid
gps.failed
authorization.denied.

Gunakan Audit Engine existing.

==================================================
22. IMMUTABILITY
==================================================

Attendance yang telah
tercatat tidak boleh
dihapus sembarangan.

Gunakan correction/
void workflow.

Jangan hard delete
record produksi yang
sudah menjadi histori.

==================================================
23. DATABASE
==================================================

Review:

foreign keys
indexes
unique constraints
nullable fields
enum consistency.

Jangan membuat migration
jika tidak diperlukan.

==================================================
24. TRANSACTION
==================================================

Attendance creation:

BEGIN
↓
validate
↓
calculate
↓
insert
↓
audit
↓
COMMIT.

Notification boleh
diproses asynchronous.

==================================================
25. NOTIFICATION FAILURE
==================================================

Jika:

Attendance berhasil
Notification gagal.

Attendance TETAP VALID.

Notification harus
retry terpisah.

==================================================
26. SCHEDULE FAILURE
==================================================

Jika schedule tidak dapat
ditentukan:

JANGAN membuat attendance
dengan status palsu.

Kembalikan controlled error
dan log internal.

==================================================
27. LOCATION FAILURE
==================================================

Jika GPS/geofence gagal:

jangan membuat attendance
valid.

Berikan error yang jelas:

Lokasi tidak memenuhi
persyaratan absensi.

==================================================
28. QR FAILURE
==================================================

QR invalid:

Jangan membuat attendance.

Tampilkan:

QR tidak valid atau
kartu sudah tidak aktif.

==================================================
29. UI ERROR HANDLING
==================================================

Frontend tidak boleh
menampilkan:

"Absensi berhasil"

sebelum server
mengonfirmasi success.

==================================================
30. DOUBLE CLICK
==================================================

User menekan tombol
absensi berkali-kali.

UI harus:

disable sementara
+
server idempotency/
duplicate protection.

==================================================
31. LOADING
==================================================

Gunakan:

idle
loading
success
error.

Jangan membuat
fake success state.

==================================================
32. AUDIT LOG UI
==================================================

Audit hanya ditampilkan
kepada role yang memiliki
permission.

==================================================
33. REPORT CONSISTENCY
==================================================

Dashboard
Report
Export
Detail

harus mengambil
Attendance source yang sama.

Tidak boleh ada:

dashboard formula A
report formula B.

==================================================
34. STATUS CONSISTENCY
==================================================

Status harus berasal
dari AttendanceCalculationService.

Contoh:

PRESENT
LATE
ABSENT
PERMITTED
SICK
HOLIDAY
OFF_DAY.

Jangan membuat enum
kedua.

==================================================
35. EXPORT
==================================================

PDF/Excel/CSV attendance
harus menggunakan
query/report service existing.

Jangan membuat
export calculation sendiri.

==================================================
36. PERFORMANCE
==================================================

Audit:

N+1
duplicate query
unnecessary relation
large scans
unindexed filters.

Attendance list wajib
pagination.

==================================================
37. SECURITY LOGGING
==================================================

Jangan log:

password
JWT
secret
full sensitive payload.

Log hanya informasi
yang diperlukan.

==================================================
38. API VALIDATION
==================================================

Semua request harus
memiliki schema validation.

Tolak:

invalid ID
invalid enum
invalid coordinate
invalid timestamp
invalid payload.

==================================================
39. FRONTEND VALIDATION
==================================================

Frontend validation
hanya UX.

Backend validation
tetap wajib.

==================================================
40. PRODUCTION ENVIRONMENT
==================================================

Pastikan tidak ada:

mock attendance
fake GPS
fake QR
simulation mode
dummy users
dummy notification
fake reports.

==================================================
41. TEST
==================================================

Automated tests:

QR success
QR invalid
QR revoked
GPS success
GPS outside radius
GPS invalid
Manual success
Manual unauthorized
Duplicate scan
Concurrent scan
Late
Holiday
Correction
RBAC
Scope
Notification failure
Report consistency.

==================================================
42. SECURITY TEST
==================================================

Test:

cross-user access
cross-unit access
cross-organization access
unauthorized correction
unauthorized manual attendance
unauthorized QR scan.

Expected:

401/403 sesuai kondisi.

==================================================
43. BUILD
==================================================

Jalankan:

type check
lint
unit test
integration test
production build.

Perbaiki error nyata.

Jangan menyembunyikan error
dengan:

any
eslint-disable
ts-ignore

kecuali benar-benar
diperlukan dan dijelaskan.

==================================================
44. DATABASE SAFETY
==================================================

Jangan:

DROP DATABASE
TRUNCATE
DELETE production attendance
RESET DATABASE.

==================================================
45. MIGRATION
==================================================

Jika migration benar-benar
diperlukan:

buat migration yang
backward compatible.

Jangan mengubah histori.

==================================================
46. FINAL DUPLICATION SCAN
==================================================

Setelah hardening:

scan kembali seluruh project
untuk:

AttendanceService
smartAttendanceService
GPS
QR
Manual
Correction
Schedule
Calculation
Notification
Report.

Pastikan hanya ada
satu primary implementation.

==================================================
47. ACCEPTANCE
==================================================

Attendance dianggap
PRODUCTION READY jika:

[ ] Authentication
[ ] RBAC
[ ] Scope
[ ] QR
[ ] GPS
[ ] Manual
[ ] Schedule
[ ] Duplicate protection
[ ] Concurrency protection
[ ] Correction
[ ] Audit
[ ] Notification
[ ] Report
[ ] Export
[ ] API validation
[ ] Database constraints
[ ] Error handling
[ ] Performance
[ ] Tests
[ ] Build
[ ] No dummy
[ ] No simulation
[ ] No duplicate core.

==================================================
48. FINAL REPORT
==================================================

Laporkan:

1. Security fixes
2. Consolidated services
3. Consolidated routes
4. Database verification
5. RBAC verification
6. QR verification
7. GPS verification
8. Manual verification
9. Correction verification
10. Report verification
11. Tests
12. Build
13. Remaining risks.

==================================================
FINAL COMMAND
==================================================

HARDEN EXISTING ATTENDANCE.

JANGAN MEMBUAT ATTENDANCE
ENGINE BARU.

JANGAN DUPLIKASI FITUR.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MERUSAK DATA HISTORIS.

SEMUA ATTENDANCE HARUS
MELALUI SATU CORE.

STOP SETELAH QA SELESAI.
==================================================
END OF 151
==================================================