# 149 — ENTERPRISE ATTENDANCE NOTIFICATION & ALERT ENGINE

## PRODUCTION MASTER PROMPT

Implementasikan Notification & Alert Engine pada CODEBASE EXISTING.

PENTING:
- Jangan membuat aplikasi baru.
- Jangan membuat notification engine kedua.
- Jangan membuat data dummy.
- Jangan membuat simulasi.
- Reuse existing authentication, RBAC, attendance, QR, GPS,
  correction, audit, database, API dan notification infrastructure.
- Semua data berasal dari database.
- Semua authorization wajib dilakukan backend.

============================================================
# 1. TUJUAN
============================================================

Bangun sistem notifikasi terintegrasi untuk:

- Siswa
- Guru
- Karyawan
- Security
- Wali Kelas
- TU
- Kepala Sekolah
- Yayasan
- Super Admin

Notification harus mengikuti:

ROLE
+
PERMISSION
+
ORGANIZATION
+
UNIT
+
ROMBEL
+
USER SCOPE.

============================================================
# 2. CHANNEL
============================================================

Prioritas:

1. In-App Notification
2. Push Notification
3. Email jika infrastructure existing mendukung.

Jangan menambahkan provider eksternal baru
jika belum diperlukan.

============================================================
# 3. NOTIFICATION TYPES
============================================================

ATTENDANCE:

- student_attendance_created
- employee_attendance_created
- late_attendance
- absent_detected
- checkout_missing

QR:

- qr_scan_success
- qr_invalid
- qr_duplicate
- qr_revoked

GPS:

- gps_outside_radius
- gps_accuracy_failure
- gps_location_invalid

CORRECTION:

- correction_created
- correction_pending
- correction_approved
- correction_rejected
- correction_expired

SECURITY:

- security_alert
- invalid_qr_burst
- suspicious_attendance

SYSTEM:

- system_notice

============================================================
# 4. EVENT ARCHITECTURE
============================================================

Gunakan event existing jika tersedia.

Contoh:

AttendanceCreated
AttendanceLate
QrScanFailed
GpsValidationFailed
CorrectionCreated
CorrectionApproved
CorrectionRejected.

Flow:

EVENT
↓
NOTIFICATION SERVICE
↓
RESOLVE RECIPIENT
↓
CHECK PERMISSION/SCOPE
↓
CREATE NOTIFICATION
↓
PUSH/IN-APP
↓
AUDIT jika diperlukan.

============================================================
# 5. RECIPIENT RULE
============================================================

Jangan mengirim notification
berdasarkan hardcoded role.

Gunakan:

notification policy
+
permission
+
scope.

Contoh:

Siswa terlambat:

→ Wali Kelas terkait
→ pihak yang memiliki permission
→ siswa/orang tua jika fitur tersebut memang tersedia.

Security alert:

→ Security terkait
→ TU/authorized supervisor.

============================================================
# 6. IN-APP NOTIFICATION
============================================================

Menu:

Notifikasi.

Tampilkan:

Judul
Pesan
Waktu
Jenis
Status baca
Deep link.

Status:

UNREAD
READ.

============================================================
# 7. NOTIFICATION CENTER
============================================================

Filter:

Semua
Belum Dibaca
Absensi
QR
GPS
Koreksi
Security
System.

Pagination server-side.

============================================================
# 8. API
============================================================

Reuse API convention existing.

Minimal:

GET
/api/v1/notifications

GET
/api/v1/notifications/unread-count

POST
/api/v1/notifications/{id}/read

POST
/api/v1/notifications/read-all

DELETE
/api/v1/notifications/{id}

Backend tetap melakukan authorization.

============================================================
# 9. UNREAD COUNT
============================================================

Badge notification harus
menggunakan database/API.

Tidak boleh:

const unread = 5;

Jika realtime tersedia:

update badge secara realtime.

Jika tidak:

gunakan polling ringan.

============================================================
# 10. DEEP LINK
============================================================

Notification dapat membuka:

Attendance Detail
Correction Detail
Security Alert
Report
Student Attendance
Employee Attendance.

Deep link wajib dicek ulang
permission-nya saat halaman dibuka.

Jangan menganggap notification
sebagai authorization.

============================================================
# 11. PUSH NOTIFICATION
============================================================

Jika push infrastructure
sudah tersedia:

integrasikan.

Device harus mempunyai:

device token
user reference
platform
last active.

Jangan menyimpan token
tanpa ownership.

============================================================
# 12. DEVICE TOKEN
============================================================

Endpoint:

POST
/api/v1/devices/register

DELETE
/api/v1/devices/{id}

Jika user logout:

token/device session
dapat dinonaktifkan.

============================================================
# 13. PUSH CONTENT
============================================================

Contoh:

Title:
"Absensi Terlambat"

Body:
"Ahmad tercatat terlambat 8 menit."

Jangan memasukkan
data sensitif yang tidak
diperlukan.

============================================================
# 14. STUDENT ATTENDANCE
============================================================

Saat scan berhasil:

notification hanya dibuat
jika policy mengharuskan.

Jangan membuat notification
untuk setiap scan secara default
jika menyebabkan spam.

Gunakan preference/policy.

============================================================
# 15. LATE ATTENDANCE
============================================================

Jika:

actual_time > schedule + grace_period

buat event:

AttendanceLate.

Notification recipient
berdasarkan policy.

============================================================
# 16. ABSENT
============================================================

Jangan langsung menganggap
siswa/karyawan absent
hanya karena belum scan.

Gunakan attendance calculation
dan working schedule.

Absent detection dijalankan
setelah cutoff yang dikonfigurasi.

============================================================
# 17. CHECKOUT MISSING
============================================================

Jika user belum checkout
setelah batas waktu:

buat alert:

CHECKOUT_MISSING.

Jangan langsung membuat
absent.

============================================================
# 18. INVALID QR
============================================================

QR invalid:

buat security event.

Notification hanya kepada
authorized security recipient.

Contoh:

"QR tidak valid terdeteksi
di Gate Utama."

============================================================
# 19. QR BURST
============================================================

Jika policy mendeteksi
banyak QR invalid:

buat:

INVALID_QR_BURST.

Threshold harus configurable.

Jangan hardcode.

============================================================
# 20. GPS OUTSIDE RADIUS
============================================================

Jika:

distance > allowed_radius

buat event:

GPS_OUTSIDE_RADIUS.

Notification kepada
user dan/atau supervisor
sesuai policy.

============================================================
# 21. GPS ACCURACY
============================================================

Jika accuracy melebihi
batas konfigurasi:

GPS_ACCURACY_FAILURE.

Jangan menganggap
attendance valid secara otomatis.

============================================================
# 22. CORRECTION
============================================================

Saat correction dibuat:

authorized approver
mendapat notification.

Saat approved:

requester mendapat notification.

Saat rejected:

requester mendapat notification
beserta alasan jika diizinkan.

============================================================
# 23. SECURITY ALERT
============================================================

Alert severity:

INFO
WARNING
HIGH
CRITICAL.

Notification routing
berdasarkan severity.

============================================================
# 24. NOTIFICATION PREFERENCE
============================================================

User dapat mengatur
notification tertentu jika
policy mengizinkan.

Contoh:

Push:
ON

Email:
OFF

In-app:
ON.

System-critical notification
tidak boleh dimatikan jika
policy mewajibkan.

============================================================
# 25. NOTIFICATION SETTINGS
============================================================

Menu hanya tampil
sesuai permission.

User tidak boleh mengubah
system-wide notification policy
kecuali authorized admin.

============================================================
# 26. ANTI-SPAM
============================================================

Gunakan:

deduplication
cooldown
aggregation.

Contoh:

10 QR invalid dalam 1 menit

→ satu alert summary,

bukan 10 push notification.

============================================================
# 27. DEDUPLICATION
============================================================

Notification key:

event_type
entity_id
recipient_id
time_window.

Jika event sama dikirim
berulang:

hindari duplicate.

============================================================
# 28. NOTIFICATION QUEUE
============================================================

Untuk push/email:

EVENT
↓
QUEUE
↓
WORKER
↓
DELIVERY
↓
STATUS.

Jangan menghambat
attendance transaction
hanya karena push notification.

============================================================
# 29. ATTENDANCE TRANSACTION
============================================================

Attendance:

DATABASE COMMIT

harus tidak bergantung
pada keberhasilan push.

Jika push gagal:

attendance tetap tersimpan.

Notification dapat retry.

============================================================
# 30. RETRY
============================================================

Notification delivery:

PENDING
SENT
FAILED
RETRYING.

Gunakan retry infrastructure
existing.

Jangan retry tanpa batas.

============================================================
# 31. FAILURE
============================================================

Jika notification gagal:

log error internal.

User tetap mendapatkan
data attendance yang benar.

Jangan rollback attendance
karena push gagal.

============================================================
# 32. NOTIFICATION DATABASE
============================================================

Jika belum tersedia,
gunakan struktur existing.

Minimal:

notifications

- id
- recipient_id
- type
- title
- message
- entity_type
- entity_id
- data
- read_at
- created_at
- expires_at

Sesuaikan dengan schema existing.

============================================================
# 33. INDEX
============================================================

Review index:

recipient_id
read_at
type
created_at.

Tambahkan berdasarkan
query aktual.

============================================================
# 34. EXPIRATION
============================================================

Notification tertentu
dapat memiliki expiration.

Contoh:

Security alert aktif
selama periode tertentu.

Jangan hapus data audit
hanya karena notification
expired.

============================================================
# 35. NOTIFICATION AUDIT
============================================================

Audit untuk event penting:

security alert
correction approval
correction rejection
system-critical event.

Tidak semua notification
harus menjadi audit event.

============================================================
# 36. WEB UI
============================================================

Header:

🔔 Notification Badge.

Klik:

Notification Center.

Desktop:

dropdown + halaman penuh.

============================================================
# 37. FLUTTER UI
============================================================

AppBar:

🔔

Badge unread.

Screen:

Notification List.

Card:

Icon
Title
Message
Time
Status.

Tap:

Deep Link.

============================================================
# 38. SECURITY UI
============================================================

Security mendapatkan:

Gate Alert
Invalid QR
Suspicious Scan.

Tidak mendapatkan
system administration
notification.

============================================================
# 39. TU UI
============================================================

TU:

Pending Correction
Late Employee
Late Student
Attendance Alert.

Scope mengikuti unit.

============================================================
# 40. KEPALA SEKOLAH
============================================================

Mendapat:

Attendance Summary
Critical Attendance Alert
Correction Approval
Security Alert

sesuai permission.

============================================================
# 41. GURU
============================================================

Guru:

My Attendance
Student Attendance
Correction
Relevant Alerts.

Tidak mendapatkan
notification seluruh sekolah
jika tidak punya permission.

============================================================
# 42. KARYAWAN
============================================================

Karyawan:

My Attendance
Late Status
Correction
GPS Result.

============================================================
# 43. READ STATE
============================================================

Saat notification dibuka:

read_at = server timestamp.

Jangan menggunakan
device time.

============================================================
# 44. BULK READ
============================================================

Endpoint:

POST
/api/v1/notifications/read-all

Hanya notification milik
authenticated user.

============================================================
# 45. DELETE
============================================================

Delete notification
tidak boleh menghapus
audit/event source.

Jika policy:

soft delete.

============================================================
# 46. SECURITY
============================================================

User A tidak boleh:

melihat notification
User B.

Jangan percaya:

recipient_id dari client.

============================================================
# 47. API RATE LIMIT
============================================================

Rate limit:

notification read
read-all
device registration.

============================================================
# 48. OFFLINE
============================================================

Jika offline:

tampilkan cached notification
dengan label:

"Terakhir diperbarui..."

Jangan mengklaim realtime.

============================================================
# 49. ERROR STATE
============================================================

Jika gagal:

"Notifikasi belum dapat
dimuat."

[Coba Lagi]

============================================================
# 50. EMPTY STATE
============================================================

"Belum ada notifikasi."

Tidak boleh ada
dummy notification.

============================================================
# 51. TESTING
============================================================

Test:

Attendance event
Late event
QR invalid
QR burst
GPS failure
GPS outside radius
Correction created
Correction approved
Correction rejected
Security alert
Notification read
Read all
Deep link
Permission
Scope
Deduplication
Retry.

============================================================
# 52. RBAC TEST
============================================================

Pastikan:

Security
tidak menerima notification
Super Admin.

Guru
tidak menerima notification
unit lain.

TU
tidak menerima notification
di luar scope.

Semua berdasarkan
permission + scope.

============================================================
# 53. PUSH TEST
============================================================

Test:

valid token
expired token
multiple devices
logout
duplicate token
failed delivery
retry.

============================================================
# 54. NO DUMMY
============================================================

Hapus:

dummy notification
fake unread count
mock push success
simulation alert.

Test fixtures hanya
untuk automated testing.

============================================================
# 55. NO DUPLICATE ENGINE
============================================================

Audit existing codebase:

NotificationService
PushService
EventBus
Queue
Worker
DeviceService.

REUSE.

Jangan membuat
NotificationService2.

============================================================
# 56. PERFORMANCE
============================================================

Notification creation
tidak boleh memperlambat
attendance transaction.

Gunakan asynchronous
processing untuk push/email.

============================================================
# 57. FINAL ACCEPTANCE
============================================================

EVENT
↓
DATABASE
↓
NOTIFICATION SERVICE
↓
RBAC/SCOPE
↓
NOTIFICATION
↓
IN-APP / PUSH
↓
READ
↓
AUDIT jika diperlukan.

SEMUA REAL.

TIDAK ADA:

DUMMY
MOCK
SIMULATION
HARDCODED RECIPIENT
BYPASS RBAC
SPAM NOTIFICATION.

============================================================
# 58. FINAL QA
============================================================

Pastikan:

[ ] Notification database
[ ] API
[ ] Unread count
[ ] Read
[ ] Read all
[ ] Deep link
[ ] Push
[ ] Device token
[ ] Retry
[ ] Deduplication
[ ] Anti-spam
[ ] RBAC
[ ] Scope
[ ] Security alert
[ ] QR alert
[ ] GPS alert
[ ] Correction alert
[ ] Attendance alert
[ ] Web
[ ] Flutter
[ ] Audit
[ ] No dummy.

============================================================
# 59. FINAL REPORT
============================================================

Setelah implementasi laporkan:

1. Notification architecture
2. Event mapping
3. API endpoints
4. Database changes
5. Push implementation
6. Queue implementation
7. RBAC
8. Anti-spam
9. Deduplication
10. Testing
11. Remaining issues.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN ENGINE INI
DENGAN MEMAKSIMALKAN
INFRASTRUCTURE EXISTING.

JANGAN DUPLIKASI ENGINE.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

SEMUA NOTIFICATION HARUS
BERASAL DARI EVENT DAN DATA
AKTUAL.

============================================================
END OF 149
============================================================