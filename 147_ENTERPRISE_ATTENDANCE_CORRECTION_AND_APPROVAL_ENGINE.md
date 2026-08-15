# 147 — ENTERPRISE ATTENDANCE CORRECTION & APPROVAL ENGINE

## PRODUCTION ATTENDANCE CORRECTION MASTER PROMPT

Anda bertindak sebagai:

- Senior Backend Engineer
- Senior Flutter Engineer
- Senior Database Engineer
- Workflow Engineer
- RBAC Security Engineer
- Audit & Compliance Engineer
- QA Engineer

Implementasikan Attendance Correction & Approval Engine
pada CODEBASE yang SUDAH ADA.

JANGAN membuat aplikasi baru.

JANGAN membuat data dummy.

JANGAN membuat simulasi.

JANGAN memberikan akses edit langsung
ke record attendance.

SEMUA perubahan attendance harus
mengikuti workflow dan permission.

============================================================
# 1. TUJUAN
============================================================

Sistem harus menangani kondisi:

- lupa check-in
- lupa check-out
- GPS gagal
- QR gagal
- perangkat bermasalah
- scanner bermasalah
- salah status
- salah waktu
- absensi manual yang membutuhkan koreksi
- attendance tidak tercatat
- attendance tercatat pada lokasi yang salah
- kebutuhan koreksi administratif.

Semua koreksi harus:

REQUEST
↓
REVIEW
↓
APPROVE / REJECT
↓
UPDATE
↓
AUDIT.

============================================================
# 2. PRINSIP UTAMA
============================================================

Attendance asli tidak boleh
dihapus atau diedit sembarangan.

Record asli harus tetap
dapat ditelusuri.

Jika ada perubahan:

ORIGINAL DATA
+
CORRECTION
+
APPROVAL
+
AUDIT.

============================================================
# 3. STATUS CORRECTION
============================================================

Gunakan:

DRAFT
PENDING
UNDER_REVIEW
APPROVED
REJECTED
CANCELLED
EXPIRED.

Status harus dikelola
oleh backend.

Frontend tidak boleh
mengubah status secara langsung.

============================================================
# 4. JENIS KOREKSI
============================================================

Minimal:

MISSED_CHECK_IN

MISSED_CHECK_OUT

WRONG_STATUS

WRONG_TIME

GPS_FAILURE

QR_FAILURE

DEVICE_FAILURE

MANUAL_ATTENDANCE_REQUEST

OTHER.

Jangan membatasi enum
jika sistem membutuhkan
jenis tambahan melalui konfigurasi.

============================================================
# 5. ACTOR
============================================================

Requester:

Guru
Karyawan
Security
Wali Kelas
TU
atau role lain sesuai policy.

Reviewer:

Wali Kelas
Kepala Sekolah
Kepala TU
TU
Supervisor.

Approver:

Role yang memiliki:

attendance.correction.approve

Jangan menentukan approval
berdasarkan nama role di frontend.

============================================================
# 6. REQUEST CORRECTION
============================================================

Endpoint:

POST
/api/v1/attendance/corrections

Request:

{
  "attendance_id": "...",
  "type": "MISSED_CHECK_OUT",
  "requested_date": "...",
  "requested_check_in": "...",
  "requested_check_out": "...",
  "reason": "Lupa melakukan absensi pulang",
  "attachment_ids": []
}

Backend:

Authenticate
↓
Authorize
↓
Validate attendance
↓
Validate scope
↓
Validate correction type
↓
Validate requested values
↓
Check existing correction
↓
Create request
↓
Audit.

============================================================
# 7. KOREKSI ABSEN YANG BELUM ADA
============================================================

Untuk kasus:

tidak ada attendance record.

Gunakan:

attendance_id = null

dengan:

correction_type
date
requested attendance
reason.

Contoh:

Lupa check-in.

Request:

Tanggal:
14-08-2026

Jam masuk:
07:28

Reason:
"Lupa scan QR saat masuk."

Backend harus tetap
melakukan validasi.

============================================================
# 8. REQUESTER DATA
============================================================

Simpan:

requester_id
requester_role
unit_id
created_at.

Jangan menerima:

requester_id

sebagai authority dari frontend.

Gunakan authenticated user.

============================================================
# 9. ORIGINAL DATA
============================================================

Jika attendance sudah ada,
simpan snapshot:

original_status
original_check_in
original_check_out
original_method
original_location
original_data.

Snapshot digunakan untuk
audit sebelum perubahan.

============================================================
# 10. REQUESTED DATA
============================================================

Simpan:

requested_status
requested_check_in
requested_check_out
requested_method
requested_location
requested_reason.

Tidak semua field wajib.

Hanya field yang relevan.

============================================================
# 11. ATTACHMENT
============================================================

Correction dapat memiliki
lampiran jika policy mengizinkan.

Contoh:

surat tugas
surat keterangan
bukti perangkat
dokumen pendukung.

Attachment:

file_id
filename
mime_type
size
uploaded_by.

Validasi:

file type
file size
ownership
permission.

============================================================
# 12. FILE SECURITY
============================================================

Jangan menyimpan file
langsung tanpa validasi.

Jangan percaya:

filename
mime type dari frontend.

Server harus memvalidasi.

Jangan izinkan:

executable
script
dangerous file.

============================================================
# 13. CORRECTION LIST
============================================================

Endpoint:

GET
/api/v1/attendance/corrections

Filter:

status
type
requester
unit
date
reviewer.

Pagination wajib.

============================================================
# 14. MY CORRECTIONS
============================================================

Endpoint:

GET
/api/v1/attendance/corrections/my

Menampilkan request
milik authenticated user.

============================================================
# 15. CORRECTION DETAIL
============================================================

Endpoint:

GET
/api/v1/attendance/corrections/{id}

Response:

Requester
Attendance
Original
Requested
Reason
Attachment
Status
Reviewer
Approval
Audit.

============================================================
# 16. REVIEW
============================================================

Reviewer membuka:

Correction Detail.

Tampilkan perbandingan:

ORIGINAL

vs

REQUESTED.

Contoh:

Check-out:

Original:
-

Requested:
16:05.

============================================================
# 17. APPROVE
============================================================

Endpoint:

POST
/api/v1/attendance/corrections/{id}/approve

Request:

{
  "comment": "Disetujui."
}

Backend:

Authenticate
↓
Permission
↓
Scope
↓
Status PENDING/UNDER_REVIEW
↓
Validate request
↓
Apply correction
↓
Create audit
↓
Update status
↓
Commit.

Semua dalam transaction.

============================================================
# 18. REJECT
============================================================

Endpoint:

POST
/api/v1/attendance/corrections/{id}/reject

Request:

{
  "reason": "Bukti tidak mencukupi."
}

Reason wajib.

============================================================
# 19. CANCEL
============================================================

Requester dapat cancel
selama status:

DRAFT
atau
PENDING

sesuai policy.

Endpoint:

POST
/api/v1/attendance/corrections/{id}/cancel

Set:

CANCELLED.

============================================================
# 20. NO DIRECT UPDATE
============================================================

JANGAN menyediakan:

PUT /attendance/{id}

untuk mengubah attendance
secara bebas.

Attendance update hanya melalui:

approved correction
atau
authorized system operation.

============================================================
# 21. APPROVAL WORKFLOW
============================================================

FLOW:

REQUESTER
   ↓
SUBMIT
   ↓
PENDING
   ↓
REVIEW
   ↓
┌───────────────┐
│               │
APPROVE       REJECT
│               │
↓               ↓
APPLY          CLOSED
│
↓
AUDIT
│
↓
NOTIFICATION.

============================================================
# 22. MULTI-LEVEL APPROVAL
============================================================

Sistem harus mendukung
approval level jika diperlukan.

Contoh:

Level 1:
Wali Kelas.

Level 2:
Kepala Sekolah.

Level 3:
TU.

Namun jangan membuat
multi-level approval wajib
untuk semua installation.

Konfigurasi berdasarkan policy.

============================================================
# 23. APPROVAL POLICY
============================================================

Policy dapat menentukan:

correction_type
requester_role
required_approver
approval_level
maximum_days
attachment_required.

============================================================
# 24. TIME LIMIT
============================================================

Correction dapat memiliki
batas pengajuan.

Contoh:

maksimal 7 hari setelah
tanggal attendance.

Nilai harus configurable.

Jangan hardcode.

============================================================
# 25. EXPIRED
============================================================

Jika melewati batas:

EXPIRED.

Request tidak dapat
diubah menjadi approved
tanpa authorized override.

============================================================
# 26. SELF APPROVAL
============================================================

Requester tidak boleh
menyetujui request miliknya
sendiri.

Backend harus menolak:

requester_id == approver_id.

Error:

SELF_APPROVAL_NOT_ALLOWED.

============================================================
# 27. SEGREGATION OF DUTIES
============================================================

Jika policy mengharuskan:

Requester
≠
Reviewer
≠
Approver.

Sistem harus mendukung
aturan tersebut.

============================================================
# 28. SCOPE VALIDATION
============================================================

Approver hanya dapat
menyetujui data dalam
scope-nya.

Contoh:

Kepala Sekolah SD:

tidak boleh approve
attendance unit SMP.

Wali Kelas VI-A:

tidak boleh approve
attendance siswa VII-A.

============================================================
# 29. ATTENDANCE RE-CALCULATION
============================================================

Setelah correction approved:

Backend harus menghitung ulang
status jika diperlukan.

Contoh:

Requested check-in:

07:45

Schedule:

07:30

Grace:

10 menit.

Hasil:

LATE.

Jangan menerima:

status = PRESENT

dari frontend.

============================================================
# 30. SERVER TIME
============================================================

Tanggal/jam koreksi harus
divalidasi berdasarkan
timezone organization/unit.

Jangan percaya timezone
device.

============================================================
# 31. FUTURE DATE
============================================================

Correction untuk tanggal
masa depan harus ditolak
kecuali policy mengizinkan.

Error:

FUTURE_ATTENDANCE_NOT_ALLOWED.

============================================================
# 32. INVALID TIME
============================================================

Contoh:

Check-out:

06:00

Check-in:

07:30.

Backend harus mendeteksi
ketidaksesuaian.

Error:

INVALID_ATTENDANCE_TIME_SEQUENCE.

============================================================
# 33. CROSS-DATE
============================================================

Jika shift melewati tengah malam:

support secara eksplisit.

Jangan menganggap:

check-out selalu
tanggal yang sama.

============================================================
# 34. DUPLICATE CORRECTION
============================================================

Jika sudah ada correction
PENDING untuk attendance
yang sama:

jangan membuat request
kedua.

Error:

CORRECTION_ALREADY_PENDING.

============================================================
# 35. APPROVED CORRECTION
============================================================

Jika correction sudah:

APPROVED

tidak boleh diedit.

Jika salah:

buat correction baru
atau reversal workflow.

Jangan overwrite audit lama.

============================================================
# 36. REJECTION
============================================================

Reject harus menyimpan:

approver_id
timestamp
reason.

Requester menerima
notification.

============================================================
# 37. NOTIFICATION
============================================================

Events:

correction.created

correction.submitted

correction.approved

correction.rejected

correction.expired.

============================================================
# 38. NOTIFICATION REQUESTER
============================================================

Contoh:

"Koreksi absensi Anda
telah disetujui."

atau:

"Pengajuan koreksi absensi
ditolak."

Alasan dapat ditampilkan.

============================================================
# 39. NOTIFICATION APPROVER
============================================================

Approver mendapatkan:

"Koreksi absensi baru
menunggu persetujuan."

Deep link:

Correction Detail.

============================================================
# 40. AUDIT
============================================================

Audit actions:

CORRECTION_CREATED

CORRECTION_SUBMITTED

CORRECTION_REVIEWED

CORRECTION_APPROVED

CORRECTION_REJECTED

CORRECTION_CANCELLED

CORRECTION_EXPIRED

ATTENDANCE_UPDATED_BY_CORRECTION.

============================================================
# 41. BEFORE / AFTER
============================================================

Audit harus menyimpan:

BEFORE:

{
  "check_in": "...",
  "check_out": "...",
  "status": "..."
}

AFTER:

{
  "check_in": "...",
  "check_out": "...",
  "status": "..."
}

============================================================
# 42. IMMUTABLE AUDIT
============================================================

Audit tidak boleh diedit
oleh user biasa.

Audit harus append-only.

============================================================
# 43. CORRECTION DETAIL UI
============================================================

Mobile:

┌─────────────────────────────┐
│ KOREKSI ABSENSI             │
├─────────────────────────────┤
│ Pemohon                     │
│ Ahmad                       │
│                             │
│ Tanggal                     │
│ 14 Agustus 2026             │
│                             │
│ JENIS                       │
│ Lupa Absen Pulang           │
├─────────────────────────────┤
│ DATA ASLI                   │
│ Check-in 07:25              │
│ Check-out -                 │
├─────────────────────────────┤
│ DATA DIAJUKAN               │
│ Check-out 16:05             │
├─────────────────────────────┤
│ ALASAN                      │
│ Lupa melakukan scan         │
├─────────────────────────────┤
│ [ TOLAK ] [ SETUJUI ]       │
└─────────────────────────────┘

============================================================
# 44. REQUEST FORM
============================================================

Form dinamis berdasarkan
correction type.

MISSED_CHECK_OUT:

tanggal
jam check-out
alasan
attachment optional/required.

WRONG_STATUS:

status yang diminta
alasan
attachment.

MISSED_CHECK_IN:

tanggal
jam check-in
alasan.

============================================================
# 45. FORM VALIDATION
============================================================

Frontend:

basic validation.

Backend:

final validation.

Jangan mengandalkan
frontend validation.

============================================================
# 46. APPROVAL CONFIRMATION
============================================================

Sebelum approve:

Dialog:

"Anda akan menyetujui
koreksi absensi ini."

Tampilkan:

Original
Requested
Reason.

Button:

BATAL
SETUJUI.

============================================================
# 47. REJECT CONFIRMATION
============================================================

Reason wajib.

Dialog:

"Alasan penolakan."

Tidak boleh reject
tanpa alasan.

============================================================
# 48. BULK APPROVAL
============================================================

Jika diperlukan:

Approver dapat memilih
beberapa correction.

Namun:

semua item harus
diperiksa permission
dan scope.

Jangan melakukan bulk
approval tanpa validation.

============================================================
# 49. BULK REJECTION
============================================================

Support jika diperlukan.

Reason dapat:

satu alasan umum

atau

reason per item.

============================================================
# 50. API RESPONSE
============================================================

Success:

{
  "success": true,
  "data": {}
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
# 51. API ENDPOINTS
============================================================

POST
/api/v1/attendance/corrections

GET
/api/v1/attendance/corrections

GET
/api/v1/attendance/corrections/my

GET
/api/v1/attendance/corrections/{id}

POST
/api/v1/attendance/corrections/{id}/submit

POST
/api/v1/attendance/corrections/{id}/review

POST
/api/v1/attendance/corrections/{id}/approve

POST
/api/v1/attendance/corrections/{id}/reject

POST
/api/v1/attendance/corrections/{id}/cancel.

============================================================
# 52. PERMISSION
============================================================

Gunakan:

attendance.correction.create

attendance.correction.view

attendance.correction.review

attendance.correction.approve

attendance.correction.reject

attendance.correction.cancel

attendance.correction.override.

Jangan berikan:

override

kepada role biasa.

============================================================
# 53. OVERRIDE
============================================================

Emergency override hanya
untuk authorized role.

Contoh:

Super Admin
atau
authorized executive.

Override harus:

require reason
require confirmation
audit.

============================================================
# 54. DATABASE
============================================================

Gunakan tabel existing
jika sudah ada.

Jika belum:

attendance_corrections

Minimal:

id
attendance_id
requester_id
unit_id
type
status
original_data
requested_data
reason
reviewer_id
approver_id
reviewed_at
approved_at
rejected_at
created_at
updated_at.

Sesuaikan dengan schema
existing project.

============================================================
# 55. FOREIGN KEY
============================================================

Pastikan:

attendance_id
requester_id
unit_id
reviewer_id
approver_id

memiliki referential integrity
sesuai kebutuhan.

============================================================
# 56. TRANSACTION
============================================================

Approval:

BEGIN

Validate correction

Validate permission

Validate scope

Validate status

Validate latest attendance

Apply correction

Recalculate status

Create audit

Update correction

Create notification/event

COMMIT.

Failure:

ROLLBACK.

============================================================
# 57. CONCURRENCY
============================================================

Dua approver tidak boleh
approve correction yang sama
secara bersamaan.

Gunakan:

transaction
row locking
status validation.

Hanya satu approval
yang berhasil.

============================================================
# 58. STALE DATA
============================================================

Sebelum approval:

reload latest attendance.

Jika attendance berubah
setelah request dibuat:

flag:

ATTENDANCE_CHANGED_AFTER_REQUEST.

Approver harus melihat
perubahan terbaru.

============================================================
# 59. FILE ATTACHMENT
============================================================

Jika attachment digunakan:

Storage abstraction.

Jangan hardcode:

/public/uploads.

Gunakan storage config
yang sudah digunakan project.

============================================================
# 60. SECURITY
============================================================

Jangan mengizinkan:

user A
mengakses correction
user B
hanya dengan mengganti ID.

Backend melakukan:

authorization
+
scope validation.

============================================================
# 61. DATA PRIVACY
============================================================

Correction detail hanya
menampilkan data yang
diizinkan role.

Jangan expose:

password
token
GPS secrets
private system data.

============================================================
# 62. REPORT
============================================================

Report correction:

Tanggal
Pemohon
Jenis
Status
Reviewer
Approver
Alasan
Tanggal keputusan.

============================================================
# 63. AUDIT REPORT
============================================================

Audit dapat difilter:

user
date
action
attendance
correction.

Export sesuai permission.

============================================================
# 64. MOBILE
============================================================

Guru/Karyawan:

Menu:

Absensi
Riwayat
Koreksi Saya.

Approver:

Menu:

Persetujuan Koreksi.

============================================================
# 65. TU WEB
============================================================

Dashboard:

Pending Corrections.

Card:

Menunggu Persetujuan:

12.

Angka berasal dari database.

============================================================
# 66. CORRECTION QUEUE
============================================================

Table:

Pemohon
Unit
Jenis
Tanggal
Status
Created
Action.

Action:

Detail.

Jangan tampilkan
Approve/Reject jika
user tidak punya permission.

============================================================
# 67. APPROVAL QUEUE FILTER
============================================================

Filter:

Pending
Under Review
Approved
Rejected
Expired.

Tanggal.

Unit.

Type.

============================================================
# 68. SLA
============================================================

Optional:

Track approval duration.

Contoh:

Pending 2 hari.

Jangan membuat
deadline approval
tanpa konfigurasi.

============================================================
# 69. AUTOMATIC EXPIRATION
============================================================

Jika policy mengharuskan:

scheduler/job:

Pending
+
expired deadline
→
EXPIRED.

Job harus idempotent.

============================================================
# 70. NO AUTOMATIC APPROVAL
============================================================

Jangan otomatis
approve correction
hanya karena:

requester adalah guru
atau
requester adalah admin.

Semua mengikuti permission
dan policy.

============================================================
# 71. MANUAL ATTENDANCE
============================================================

Manual attendance guru
tetap dapat menjadi:

ATTENDANCE_METHOD = MANUAL.

Jika policy mengharuskan approval:

langsung:

PENDING_CORRECTION.

============================================================
# 72. SECURITY GATE CORRECTION
============================================================

Security dapat mengajukan
correction jika:

scan gagal
device error
kartu bermasalah.

Approval sesuai scope.

============================================================
# 73. GPS CORRECTION
============================================================

Jika GPS gagal:

user dapat membuat
correction request.

Tidak boleh mengubah:

latitude
longitude

secara manual
dan menjadikannya seolah
GPS asli.

Jika jam attendance
dikoreksi:

method tetap dapat dicatat
sebagai:

CORRECTED_MANUAL.

============================================================
# 74. CORRECTED METHOD
============================================================

Original:

GPS.

After correction:

CORRECTED.

Jangan mengklaim
hasil koreksi sebagai
GPS baru.

============================================================
# 75. ATTENDANCE SOURCE
============================================================

Simpan:

ORIGINAL_SOURCE

CURRENT_SOURCE

Contoh:

ORIGINAL_SOURCE = GPS

CURRENT_SOURCE = CORRECTED_MANUAL.

============================================================
# 76. HISTORY
============================================================

User dapat melihat:

Original attendance
Correction
Approval
Final attendance.

History tidak boleh
menghapus jejak perubahan.

============================================================
# 77. API IDEMPOTENCY
============================================================

Correction create:

client_transaction_id.

Jika request dikirim dua kali:

return existing correction.

============================================================
# 78. RATE LIMIT
============================================================

Rate limit:

create correction
approve
reject
bulk operation.

============================================================
# 79. TESTING
============================================================

Test:

Create correction

Submit

Review

Approve

Reject

Cancel

Expire

Duplicate correction

Self approval

Wrong scope

Wrong role

Attachment

Invalid date

Future date

Invalid time

Concurrency

Stale attendance

Override.

============================================================
# 80. SECURITY TEST
============================================================

Attempt:

change requester_id

change unit_id

change attendance_id

approve own request

approve other unit

approve rejected request

approve twice

reject approved request

modify audit

Semua harus ditolak.

============================================================
# 81. DATABASE TEST
============================================================

Test:

Foreign keys

Unique constraints

Transactions

Rollback

Concurrent approval

Idempotency.

============================================================
# 82. E2E TEST
============================================================

Scenario:

Guru lupa checkout.

Guru:

Koreksi
↓
Submit.

Kepala/TU:

Review
↓
Approve.

System:

Update attendance
↓
Recalculate
↓
Audit
↓
Notification
↓
Report updated.

============================================================
# 83. PRODUCTION RULE
============================================================

Hapus:

demo correction
fake approval
simulation approval
dummy request
hardcoded pending count.

Semua berasal dari
database production.

============================================================
# 84. EXISTING CODEBASE
============================================================

Audit terlebih dahulu:

attendance service
attendance model
audit service
notification service
file service
RBAC
workflow
approval.

REUSE existing infrastructure.

Jangan membuat duplicate.

============================================================
# 85. FINAL QA
============================================================

Run:

Backend tests
API tests
Database tests
RBAC tests
Workflow tests
Concurrency tests
Flutter tests
E2E tests.

Target:

0 critical errors.

============================================================
# 86. FINAL ACCEPTANCE
============================================================

KOREKSI:

USER
 ↓
CREATE REQUEST
 ↓
PENDING
 ↓
REVIEW
 ↓
APPROVE / REJECT
 ↓
DATABASE
 ↓
AUDIT
 ↓
NOTIFICATION
 ↓
REPORT.

Tidak boleh ada:

DIRECT EDIT
BYPASS
FAKE APPROVAL
DUMMY DATA.

============================================================
# 87. FINAL REPORT
============================================================

Setelah implementasi laporkan:

1. Correction schema
2. API endpoints
3. Workflow
4. RBAC
5. Approval policy
6. Database changes
7. Audit
8. Notification
9. Attachment
10. Flutter UI
11. Web UI
12. Test result
13. Migration result
14. Remaining issues.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN ATTENDANCE
CORRECTION & APPROVAL ENGINE
PADA CODEBASE EXISTING.

INTEGRASIKAN DENGAN:

REST API
+
DATABASE
+
QR ENGINE
+
GPS ENGINE
+
MONITORING
+
RBAC
+
AUDIT
+
NOTIFICATION
+
REPORTING.

SEMUA PERUBAHAN ATTENDANCE
HARUS TRACEABLE.

SEMUA APPROVAL HARUS
TERVALIDASI SERVER.

TIDAK ADA:

DUMMY
MOCK
SIMULATION
DIRECT EDIT
BYPASS RBAC
SELF APPROVAL
FAKE APPROVAL.

============================================================
END OF 147
============================================================