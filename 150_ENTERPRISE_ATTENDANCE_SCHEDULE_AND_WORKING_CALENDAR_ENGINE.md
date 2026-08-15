# 150 — ENTERPRISE ATTENDANCE SCHEDULE & WORKING CALENDAR ENGINE

## PRODUCTION MASTER PROMPT

Implementasikan Schedule & Working Calendar Engine
pada CODEBASE EXISTING.

JANGAN membuat aplikasi baru.
JANGAN membuat engine kedua.
JANGAN membuat data dummy.
JANGAN membuat simulasi.
REUSE database, RBAC, attendance, QR, GPS,
notification, report dan audit engine existing.

==================================================
# 1. TUJUAN
==================================================

Sistem harus menentukan secara dinamis:

- hari kerja
- jam masuk
- jam pulang
- jadwal siswa
- jadwal guru
- jadwal karyawan
- shift security
- grace period
- batas check-in
- batas check-out
- status terlambat
- status tidak hadir
- hari libur
- kalender akademik
- jadwal khusus.

Semua berasal dari database/configuration.

==================================================
# 2. HIERARCHY
==================================================

ORGANIZATION
↓
UNIT
↓
CALENDAR
↓
WORKING DAY
↓
SCHEDULE
↓
PERSON / ROLE / ROMBEL
↓
ATTENDANCE.

Jangan hardcode aturan
di Flutter maupun controller.

==================================================
# 3. CALENDAR TYPES
==================================================

Support:

ACADEMIC
EMPLOYEE
STUDENT
SECURITY
CUSTOM.

Jika project sudah mempunyai
calendar engine, gunakan existing.

==================================================
# 4. WORKING DAYS
==================================================

Hari dapat dikonfigurasi:

Senin
Selasa
Rabu
Kamis
Jumat
Sabtu
Minggu.

Jangan menganggap
Senin-Jumat selalu hari kerja.

==================================================
# 5. SCHEDULE
==================================================

Schedule minimal:

id
name
unit_id
type
start_time
end_time
grace_period
checkin_open
checkin_close
checkout_open
checkout_close
active.

Sesuaikan dengan schema existing.

==================================================
# 6. EMPLOYEE SCHEDULE
==================================================

Guru/karyawan dapat memiliki:

regular schedule
shift
custom schedule.

Contoh:

07:00 - 15:00

Shift security:

06:00 - 14:00
14:00 - 22:00
22:00 - 06:00.

==================================================
# 7. STUDENT SCHEDULE
==================================================

Siswa dapat mengikuti
jadwal unit/rombel.

Contoh:

SD:
07:30 - 13:30

Pondok:
07:00 - 16:00.

Jangan hardcode.

==================================================
# 8. SECURITY SHIFT
==================================================

Security mendukung:

shift
multiple gate
replacement
temporary assignment.

Attendance harus mengetahui
shift aktif security.

==================================================
# 9. GRACE PERIOD
==================================================

Contoh:

Schedule:
07:30

Grace:
10 menit.

Check-in:

07:35
→ PRESENT

07:41
→ LATE.

Nilai configurable.

==================================================
# 10. CHECK-IN WINDOW
==================================================

Schedule dapat menentukan:

checkin_open
checkin_close.

Contoh:

Open:
06:00

Close:
09:00.

Scan di luar window
ditangani berdasarkan policy.

==================================================
# 11. CHECK-OUT WINDOW
==================================================

Contoh:

Open:
14:00

Close:
18:00.

Gunakan policy
untuk checkout lebih awal.

==================================================
# 12. HOLIDAY
==================================================

Holiday tidak dihitung
sebagai absence.

Support:

national holiday
organization holiday
unit holiday
academic holiday
custom holiday.

==================================================
# 13. HOLIDAY PRIORITY
==================================================

Prioritas:

Specific Date Override
↓
Unit Calendar
↓
Organization Calendar
↓
Default Calendar.

Jangan membuat konflik
tanpa resolusi.

==================================================
# 14. SPECIAL SCHEDULE
==================================================

Support:

Ramadhan
ujian
libur
kegiatan sekolah
hari pendek
event khusus.

Contoh:

Jam normal:
07:30

Ramadhan:
08:00.

==================================================
# 15. DATE OVERRIDE
==================================================

Satu tanggal dapat
menggunakan schedule berbeda.

Contoh:

15 Agustus:

Normal:
07:30

Special:
08:00.

==================================================
# 16. PERSON ASSIGNMENT
==================================================

Schedule dapat diberikan
kepada:

person
role
unit
rombel
department
shift.

Prioritas assignment
harus didefinisikan backend.

==================================================
# 17. ASSIGNMENT PRIORITY
==================================================

Recommended:

PERSON
↓
ROLE/SHIFT
↓
ROMBEL
↓
UNIT
↓
ORGANIZATION.

Assignment paling spesifik
menang.

==================================================
# 18. CONFLICT DETECTION
==================================================

Jika person memiliki
dua schedule aktif
yang overlap:

flag conflict.

Jangan memilih
secara random.

==================================================
# 19. SCHEDULE STATUS
==================================================

DRAFT
ACTIVE
INACTIVE
ARCHIVED.

Hanya ACTIVE yang
digunakan attendance.

==================================================
# 20. EFFECTIVE DATE
==================================================

Schedule mendukung:

effective_from
effective_until.

Jangan mengubah histori
attendance ketika schedule
lama dinonaktifkan.

==================================================
# 21. HISTORICAL DATA
==================================================

Attendance lama harus
tetap menggunakan
schedule saat attendance
terjadi.

Jangan recalculation histori
hanya karena admin mengubah
schedule hari ini.

==================================================
# 22. ATTENDANCE CALCULATION
==================================================

Gunakan:

Schedule
+
Calendar
+
Holiday
+
Grace
+
Actual Attendance.

Hasil:

PRESENT
LATE
ABSENT
PERMITTED
SICK
NOT_RECORDED
HOLIDAY
OFF_DAY.

==================================================
# 23. ABSENCE DETECTION
==================================================

Absence hanya diproses
setelah cutoff.

Contoh:

Check-in cutoff:
09:00.

Sebelum cutoff:

NOT_RECORDED.

Setelah cutoff:

ABSENT
jika tidak ada izin/sakit
atau status lain.

==================================================
# 24. AUTO STATUS
==================================================

Jangan menerima status
dari frontend sebagai
authority.

Frontend mengirim:

timestamp
method
location
QR.

Backend menentukan:

status.

==================================================
# 25. LATE CALCULATION
==================================================

Backend:

actual_checkin
-
(schedule_start + grace).

Jika hasil > 0:

LATE.

Jika <= 0:

PRESENT.

==================================================
# 26. WORKING DAY
==================================================

Sebelum menentukan
absence:

cek:

is_working_day(date).

Jika false:

jangan buat absence.

==================================================
# 27. STUDENT ABSENCE
==================================================

Siswa:

Calendar
+
Rombel
+
Schedule.

Security/Guru melakukan
scan atau manual attendance.

Calculation tetap
dilakukan backend.

==================================================
# 28. EMPLOYEE ABSENCE
==================================================

Guru/karyawan:

Calendar
+
Schedule/Shift
+
Attendance.

GPS/QR/manual hanya
menentukan source.

Status tetap dihitung
backend.

==================================================
# 29. QR LOCATION
==================================================

Location QR harus memiliki:

location_id
unit_id
active
allowed_schedule.

Scan valid hanya jika
schedule/location policy
mengizinkan.

==================================================
# 30. GPS
==================================================

GPS attendance tetap
menggunakan:

schedule
+
calendar
+
GPS validation.

GPS tidak menentukan
status hadir sendirian.

==================================================
# 31. TIMEZONE
==================================================

Gunakan timezone
organization/unit.

Semua calculation
server-side.

==================================================
# 32. MIDNIGHT SHIFT
==================================================

Support:

22:00 → 06:00.

Jangan menganggap
checkout selalu pada
tanggal check-in.

==================================================
# 33. SHIFT HANDOVER
==================================================

Security shift dapat
memiliki:

previous shift
current shift
next shift.

Attendance harus
mengidentifikasi shift
yang benar.

==================================================
# 34. REPLACEMENT
==================================================

Security/guru/karyawan
dapat memiliki temporary
replacement.

Replacement assignment
memiliki:

start
end
scope.

==================================================
# 35. TEMPORARY SCHEDULE
==================================================

Temporary schedule
harus memiliki:

effective_from
effective_until.

Setelah berakhir:

kembali ke schedule utama.

==================================================
# 36. API
==================================================

Reuse API convention.

Minimal:

GET /api/v1/attendance/schedules
POST /api/v1/attendance/schedules
GET /api/v1/attendance/schedules/{id}
PUT /api/v1/attendance/schedules/{id}
DELETE /api/v1/attendance/schedules/{id}

Calendar:

GET /api/v1/attendance/calendars
POST /api/v1/attendance/calendars
PUT /api/v1/attendance/calendars/{id}

Holiday:

GET /api/v1/attendance/holidays
POST /api/v1/attendance/holidays
PUT /api/v1/attendance/holidays/{id}
DELETE /api/v1/attendance/holidays/{id}

Gunakan existing route convention
jika sudah tersedia.

==================================================
# 37. PERMISSION
==================================================

Gunakan permission existing
atau tambahkan:

attendance.schedule.view
attendance.schedule.create
attendance.schedule.update
attendance.schedule.delete

attendance.calendar.view
attendance.calendar.manage

attendance.holiday.view
attendance.holiday.manage.

Backend wajib memvalidasi.

==================================================
# 38. UI ADMIN
==================================================

Menu:

Absensi
→ Pengaturan Jadwal

Tabs:

Jadwal
Shift
Kalender
Hari Libur
Override
Assignment.

==================================================
# 39. UI SCHEDULE
==================================================

Tampilkan:

Nama
Unit
Type
Jam Masuk
Jam Pulang
Grace
Status
Effective Date
Action.

Action berdasarkan permission:

View
Edit
Duplicate
Archive
Delete.

==================================================
# 40. UI CALENDAR
==================================================

Calendar view:

Tanggal
Status Hari
Schedule
Holiday
Override.

Gunakan warna/status
berdasarkan state,
bukan hardcoded data.

==================================================
# 41. UI MOBILE
==================================================

Guru/Karyawan:

Tampilkan:

Jadwal Hari Ini
Jam Masuk
Jam Pulang
Grace
Status Hari.

Contoh:

Jadwal Hari Ini

07:30 - 15:00

Grace:
10 menit.

==================================================
# 42. TODAY SCHEDULE
==================================================

API:

GET
/api/v1/attendance/my-schedule/today

Response harus dinamis.

==================================================
# 43. SCHEDULE PREVIEW
==================================================

Sebelum admin mengaktifkan
schedule baru:

Preview:

Tanggal
Person
Schedule
Potential Conflict.

==================================================
# 44. BULK ASSIGNMENT
==================================================

Support assignment
ke banyak person.

Contoh:

30 security.

Tetap validasi conflict.

==================================================
# 45. BULK HOLIDAY
==================================================

Support import/create
multiple holiday dates
jika diperlukan.

Tetap audit.

==================================================
# 46. CRUD
==================================================

CREATE:
validasi.

READ:
scope.

UPDATE:
validasi histori.

DELETE:
jangan menghapus
schedule yang sudah
digunakan histori.

Gunakan archive/inactive
jika sudah dipakai.

==================================================
# 47. SOFT DELETE
==================================================

Jika schedule telah
digunakan attendance:

jangan hard delete.

Gunakan:

INACTIVE
atau
ARCHIVED.

==================================================
# 48. AUDIT
==================================================

Audit:

schedule.created
schedule.updated
schedule.archived
calendar.updated
holiday.created
holiday.updated
assignment.created
assignment.removed.

==================================================
# 49. CACHE
==================================================

Schedule yang sering
digunakan dapat dicache.

Cache harus invalidate
saat schedule berubah.

Jangan menggunakan
cache stale untuk
attendance critical calculation.

==================================================
# 50. CONCURRENCY
==================================================

Update schedule:

gunakan transaction
dan optimistic/version
validation jika diperlukan.

==================================================
# 51. REPORT INTEGRATION
==================================================

Report 148 harus
menggunakan schedule
engine ini.

Late report
dan absence report
tidak boleh membuat
perhitungan sendiri.

==================================================
# 52. NOTIFICATION INTEGRATION
==================================================

Notification 149
menggunakan hasil
schedule engine.

Contoh:

Late
↓
AttendanceLate
↓
Notification.

==================================================
# 53. CORRECTION INTEGRATION
==================================================

Correction 147 setelah
approved harus
recalculate menggunakan
schedule pada tanggal
attendance tersebut.

==================================================
# 54. QR INTEGRATION
==================================================

QR scan:

validate QR
↓
validate active location
↓
validate schedule/window
↓
create attendance
↓
calculate status.

==================================================
# 55. GPS INTEGRATION
==================================================

GPS:

validate location
↓
validate radius
↓
validate schedule/window
↓
create attendance
↓
calculate status.

==================================================
# 56. DATABASE
==================================================

REUSE existing tables.

Jika belum tersedia,
tambahkan entity sesuai
arsitektur database existing:

attendance_schedules
schedule_assignments
working_calendars
calendar_holidays
schedule_overrides.

Jangan membuat tabel
duplikat jika sudah ada.

==================================================
# 57. DATABASE CONSTRAINT
==================================================

Pastikan:

foreign keys
unique rules
effective date validation
unit scope
active state.

==================================================
# 58. TESTING
==================================================

Test:

working day
holiday
special schedule
grace period
late
absence cutoff
shift
midnight shift
replacement
temporary schedule
schedule conflict
timezone
historical schedule
QR
GPS
manual
correction
report
notification.

==================================================
# 59. SECURITY TEST
==================================================

Test:

user unit A
mencoba mengubah
schedule unit B.

Harus:

403.

Test juga:

unauthorized delete
unauthorized assignment
cross-organization access.

==================================================
# 60. NO HARDCODE
==================================================

DILARANG:

if Monday...
if Friday...
07:30...
15:00...
10 minutes...
Monday-Friday...

Semua harus berasal
dari database/configuration.

==================================================
# 61. NO DUMMY
==================================================

Hapus:

dummy schedule
sample holiday
fake shift
simulation calendar.

Seed hanya untuk
development/test jika
benar-benar diperlukan.

Production harus kosong
sampai admin mengisinya.

==================================================
# 62. PERFORMANCE
==================================================

Attendance calculation
tidak boleh query
schedule berulang-ulang.

Gunakan optimized lookup
dan cache aman.

Hindari N+1.

==================================================
# 63. FINAL ACCEPTANCE
==================================================

CALENDAR
↓
WORKING DAY
↓
SCHEDULE
↓
ASSIGNMENT
↓
ATTENDANCE
↓
CALCULATION
↓
STATUS
↓
REPORT
↓
NOTIFICATION.

Semua menggunakan
source of truth yang sama.

==================================================
# 64. FINAL QA
==================================================

[ ] CRUD schedule
[ ] CRUD calendar
[ ] CRUD holiday
[ ] Assignment
[ ] Shift
[ ] Override
[ ] Conflict detection
[ ] Grace period
[ ] Cutoff
[ ] Late
[ ] Absence
[ ] Holiday
[ ] Midnight shift
[ ] Timezone
[ ] QR
[ ] GPS
[ ] Manual
[ ] Correction
[ ] Report
[ ] Notification
[ ] RBAC
[ ] Audit
[ ] No dummy
[ ] No hardcode.

==================================================
# 65. FINAL REPORT
==================================================

Setelah implementasi laporkan:

1. Existing tables reused
2. New migrations
3. API
4. Schedule logic
5. Calendar logic
6. Assignment
7. Conflict handling
8. RBAC
9. Audit
10. Test result
11. Performance result
12. Remaining issues.

==================================================
# FINAL COMMAND
==================================================

IMPLEMENTASIKAN ENGINE INI
PADA CODEBASE EXISTING.

JANGAN DUPLIKASI FITUR.

JANGAN MEMBUAT SIMULASI.

JANGAN MEMBUAT DATA DUMMY.

SEMUA JADWAL, KALENDER,
HARI LIBUR, SHIFT DAN
PERHITUNGAN ABSENSI HARUS
DINAMIS DAN TERSIMPAN DI
DATABASE.

==================================================
END OF 150
==================================================