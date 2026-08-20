# 164 — ENTERPRISE AUDIT & COMPLIANCE

## MASTER PRODUCTION AUDIT & COMPLIANCE PROMPT

TUGAS INI KHUSUS UNTUK:

AUDIT TRAIL
ACTIVITY LOG
SECURITY AUDIT
DATA CHANGE HISTORY
USER ACCOUNTABILITY
ROLE & PERMISSION AUDIT
DOCUMENT AUDIT
ATTENDANCE AUDIT
FINANCE AUDIT
SYSTEM CONFIGURATION AUDIT
COMPLIANCE REPORTING.

==================================================
1. ATURAN UTAMA
==================================================

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT MODUL DUPLIKAT.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE PRODUKSI.

JANGAN MENGUBAH BUSINESS LOGIC
YANG SUDAH BERJALAN KECUALI
UNTUK MEMPERBAIKI AUDIT,
SECURITY, ATAU COMPLIANCE.

==================================================
2. TUJUAN
==================================================

Setiap aktivitas penting
harus dapat menjawab:

WHO
WHAT
WHEN
WHERE
WHICH RESOURCE
WHICH ACTION
BEFORE
AFTER
WHY
RESULT.

==================================================
3. AUDIT MODEL
==================================================

Gunakan:

USER
 ↓
ACTION
 ↓
RESOURCE
 ↓
CHANGE
 ↓
AUDIT LOG.

Contoh:

USER:
Admin TU

ACTION:
Update Student

RESOURCE:
Student #123

BEFORE:
Status = Active

AFTER:
Status = Graduated

TIME:
Timestamp

RESULT:
Success.

==================================================
4. SOURCE OF TRUTH
==================================================

Business data tetap:

DATABASE.

Audit log hanya
mencatat histori aktivitas.

Jangan menggunakan
audit log sebagai
pengganti business table.

==================================================
5. AUDIT IMMUTABILITY
==================================================

Audit log tidak boleh
dapat diubah oleh:

Guru
Security
TU
Bendahara
Karyawan biasa.

Bahkan admin biasa
tidak boleh mengubah
histori audit.

==================================================
6. AUDIT DELETION
==================================================

Jangan menyediakan
delete audit log biasa.

Jika retention policy
mengharuskan penghapusan:

harus melalui proses
authorized dan terdokumentasi.

==================================================
7. AUDIT TIMESTAMP
==================================================

Timestamp utama harus
berasal dari server.

Gunakan timezone
yang konsisten.

==================================================
8. AUDIT ACTOR
==================================================

Simpan identitas
pelaku jika tersedia:

user_id
employee_id
role
unit
session/request ID.

==================================================
9. SYSTEM ACTOR
==================================================

Jika aktivitas dilakukan
oleh scheduler/queue/system:

gunakan actor type:

SYSTEM

dan catat proses
yang melakukan action.

==================================================
10. REQUEST ID
==================================================

Integrasikan:

request_id

agar audit dapat
dikorelasikan dengan
application log.

==================================================
11. AUDIT EVENT ID
==================================================

Setiap audit event
memiliki ID unik.

Contoh:

AUD-2026-000001

atau format existing.

==================================================
12. AUDIT ACTION
==================================================

Gunakan action standar:

CREATE
READ jika memang perlu
UPDATE
DELETE
LOGIN
LOGOUT
EXPORT
IMPORT
APPROVE
REJECT
PRINT
DOWNLOAD
UPLOAD
SCAN
VERIFY
ASSIGN
UNASSIGN
ACTIVATE
DEACTIVATE.

Jangan membuat action
yang sama dengan nama
berbeda tanpa alasan.

==================================================
13. AUDIT RESOURCE
==================================================

Resource harus jelas.

Contoh:

STUDENT
EMPLOYEE
USER
ROLE
PERMISSION
ATTENDANCE
DOCUMENT
PAYMENT
INVENTORY
REPORT
SYSTEM_CONFIGURATION.

Gunakan resource existing.

==================================================
14. CREATE AUDIT
==================================================

Catat:

siapa membuat
apa yang dibuat
kapan
scope
hasil.

==================================================
15. UPDATE AUDIT
==================================================

Untuk perubahan
penting:

simpan:

BEFORE
AFTER.

Contoh:

BEFORE:
phone = old

AFTER:
phone = new.

==================================================
16. DELETE AUDIT
==================================================

Jika business entity
dapat dihapus:

catat:

actor
resource
ID
timestamp
reason jika tersedia.

Jangan menyimpan
sensitive data secara
berlebihan di log.

==================================================
17. SOFT DELETE
==================================================

Jika existing system
menggunakan soft delete:

audit:

delete
restore.

==================================================
18. RESTORE AUDIT
==================================================

Jika data dipulihkan:

catat:

actor
resource
previous state
restored state
timestamp.

==================================================
19. STUDENT AUDIT
==================================================

Audit:

create student
update student
status change
unit change
class/assignment change
document upload
document replacement
document removal
archive
restore.

==================================================
20. STUDENT DATA
==================================================

Jangan menyimpan
seluruh data siswa
berulang-ulang di
audit log jika tidak
dibutuhkan.

Gunakan:

changed fields
old value
new value

secara selektif.

==================================================
21. EMPLOYEE AUDIT
==================================================

Audit:

create
update
status
unit
position
document
activation
deactivation.

==================================================
22. USER AUDIT
==================================================

Audit:

create user
activate
deactivate
password reset
role change
permission change
login
logout.

==================================================
23. ROLE AUDIT
==================================================

Audit:

role created
role updated
role deleted
role assigned
role removed.

==================================================
24. PERMISSION AUDIT
==================================================

Audit:

permission assignment
permission removal
role permission changes.

==================================================
25. SUPER ADMIN AUDIT
==================================================

Setiap aktivitas
Super Admin yang
sensitif harus tercatat.

Contoh:

system setting
role change
permission change
user access
data export
backup action
security configuration.

==================================================
26. LOGIN AUDIT
==================================================

Catat:

success
failure
logout
password reset
account locked
account unlocked.

==================================================
27. LOGIN METADATA
==================================================

Jika sesuai privacy
policy:

IP
user agent
device identifier
request ID.

Jangan menyimpan
informasi berlebihan.

==================================================
28. SECURITY AUDIT
==================================================

Catat:

authorization failure
rate limit event
suspicious access
credential change
security configuration.

==================================================
29. ATTENDANCE AUDIT
==================================================

Audit:

student attendance
employee attendance
QR scan
GPS attendance
manual attendance
attendance correction
attendance deletion jika
diperbolehkan
attendance approval.

==================================================
30. QR AUDIT
==================================================

Catat:

scanner
subject
timestamp
method
result.

Contoh:

QR_SCAN
↓
STUDENT
↓
SUCCESS.

==================================================
31. FAILED QR
==================================================

Jika gagal:

INVALID_QR
EXPIRED_QR
REVOKED_QR
UNAUTHORIZED
DUPLICATE
INVALID_SCOPE.

Gunakan category
yang jelas.

==================================================
32. GPS AUDIT
==================================================

Audit:

GPS attendance
success
failure
outside geofence
permission denied
invalid location.

Jangan menyimpan
lokasi lebih detail
daripada kebutuhan
operasional.

==================================================
33. MANUAL ATTENDANCE
==================================================

Manual attendance
harus memiliki:

actor
student/employee
status
timestamp
method
reason jika diperlukan.

==================================================
34. ATTENDANCE CORRECTION
==================================================

Jika attendance
diubah:

BEFORE
↓
AFTER
↓
ACTOR
↓
TIMESTAMP.

==================================================
35. DOCUMENT AUDIT
==================================================

Audit:

upload
create
edit
generate
download
print
archive
restore
delete.

==================================================
36. LETTER AUDIT
==================================================

Audit surat:

draft
created
updated
generated
downloaded
printed
archived.

==================================================
37. PDF AUDIT
==================================================

Catat:

generation
success/failure
download
print.

==================================================
38. WORD AUDIT
==================================================

Catat:

generation
success/failure
download.

==================================================
39. TEMPLATE AUDIT
==================================================

Jika template surat
dapat dimodifikasi:

audit:

create
edit
activate
deactivate
delete.

==================================================
40. TEMPLATE VERSION
==================================================

Jika sistem mendukung
versioning:

catat perubahan
template.

==================================================
41. FINANCE AUDIT
==================================================

Audit:

payment
expense
income
journal
adjustment
approval
reversal
export.

==================================================
42. FINANCIAL CHANGE
==================================================

Perubahan finansial
harus:

authorized
traceable
audited.

==================================================
43. INVENTORY AUDIT
==================================================

Audit:

asset create
asset update
stock adjustment
transfer
disposal
inventory opname.

==================================================
44. REPORT AUDIT
==================================================

Audit:

report generated
exported
downloaded
printed.

==================================================
45. EXPORT AUDIT
==================================================

Setiap export
data sensitif harus
dicatat:

actor
resource
filter/scope
format
timestamp.

==================================================
46. IMPORT AUDIT
==================================================

Jika import tersedia:

file
actor
timestamp
record count
success
failed
validation errors.

==================================================
47. BULK ACTION AUDIT
==================================================

Bulk action:

bulk update
bulk delete
bulk import
bulk assignment

harus memiliki audit
yang jelas.

==================================================
48. APPROVAL AUDIT
==================================================

Jika approval digunakan:

SUBMITTED
↓
APPROVED / REJECTED
↓
ACTOR
↓
TIME.

==================================================
49. WORKFLOW AUDIT
==================================================

Jangan hanya mencatat
status akhir.

Catat perubahan
workflow penting.

==================================================
50. SYSTEM CONFIGURATION
==================================================

Audit perubahan:

application settings
attendance settings
QR settings
GPS settings
notification settings
document settings
security settings.

==================================================
51. SYSTEM SETTING ACCESS
==================================================

Hanya role authorized
yang dapat mengubah
system configuration.

==================================================
52. AUDIT SEARCH
==================================================

Audit viewer harus
mendukung pencarian
sesuai permission.

Contoh:

actor
action
resource
date
result.

==================================================
53. AUDIT FILTER
==================================================

Filter:

date range
user
role
module
action
resource
success/failure.

==================================================
54. AUDIT DETAIL
==================================================

Detail audit menampilkan:

event ID
actor
action
resource
timestamp
request ID
result
before/after jika ada.

==================================================
55. AUDIT UI
==================================================

Audit log:

READ ONLY.

Jangan menyediakan
edit biasa.

==================================================
56. AUDIT EXPORT
==================================================

Jika export audit
tersedia:

harus authorized.

Export audit juga
harus diaudit.

==================================================
57. AUDIT RETENTION
==================================================

Tentukan:

retention period
archive policy
deletion policy

sesuai kebutuhan
dan kebijakan organisasi.

==================================================
58. AUDIT ARCHIVE
==================================================

Audit lama dapat
dipindahkan ke archive
jika diperlukan.

Archive harus tetap
dapat diverifikasi.

==================================================
59. AUDIT INTEGRITY
==================================================

Jika architecture
mendukung:

gunakan checksum/
hash chain/integrity
mechanism.

Jangan mengklaim
tamper-proof jika
belum benar-benar
diimplementasikan.

==================================================
60. AUDIT ACCESS CONTROL
==================================================

Pisahkan:

AUDIT VIEW
vs
AUDIT ADMINISTRATION.

User yang hanya perlu
melihat audit tidak
boleh mengubah policy.

==================================================
61. COMPLIANCE
==================================================

Audit harus membantu
organisasi memenuhi
kebutuhan:

accountability
traceability
data integrity
access control
record retention.

==================================================
62. PRIVACY
==================================================

Audit log tidak boleh
menjadi tempat
menyalin seluruh
database.

Gunakan prinsip:

MINIMAL NECESSARY DATA.

==================================================
63. DATA MASKING
==================================================

Jika audit menampilkan
data sensitif:

mask sesuai kebutuhan.

Contoh:

nomor identitas
nomor telepon
credential.

==================================================
64. PASSWORD AUDIT
==================================================

JANGAN menyimpan:

password
password hash jika
tidak diperlukan
di activity payload.

==================================================
65. TOKEN AUDIT
==================================================

JANGAN menyimpan:

JWT
refresh token
API key.

==================================================
66. GPS DATA
==================================================

Audit GPS harus
mempertimbangkan
privacy.

Gunakan:

location result
geofence result

jika detail koordinat
tidak diperlukan.

==================================================
67. AUDIT DATABASE
==================================================

Audit table harus:

indexed
queryable
protected.

==================================================
68. AUDIT INDEX
==================================================

Pertimbangkan index:

timestamp
actor_id
action
resource_type
resource_id.

Jangan membuat
index berlebihan.

==================================================
69. AUDIT PERFORMANCE
==================================================

Audit logging tidak
boleh membuat
business transaction
menjadi sangat lambat.

==================================================
70. AUDIT FAILURE
==================================================

Tentukan behavior
jika audit logging gagal.

Untuk critical operation:

jangan diam-diam
menghilangkan
accountability.

Gunakan strategy
yang sesuai architecture.

==================================================
71. AUDIT TRANSACTION
==================================================

Untuk critical
database transaction:

business operation
+
audit event

harus konsisten jika
architecture memungkinkan.

==================================================
72. AUDIT QUEUE
==================================================

Jika audit dikirim
melalui queue:

pastikan failure
tidak menyebabkan
audit hilang.

==================================================
73. AUDIT MONITORING
==================================================

Monitor:

audit failure
audit queue
audit storage
audit latency.

==================================================
74. AUDIT ALERT
==================================================

Alert untuk:

audit pipeline failure
critical security event
abnormal admin action.

==================================================
75. COMPLIANCE DASHBOARD
==================================================

Jika dashboard existing
mendukung:

tampilkan:

audit status
security events
failed login
permission denial
critical changes.

Jangan membuat
dashboard duplicate.

==================================================
76. USER ACCOUNTABILITY
==================================================

Tidak boleh ada
aktivitas kritis
tanpa actor yang jelas,
kecuali memang
SYSTEM operation.

==================================================
77. SHARED ACCOUNT
==================================================

Hindari shared account.

Setiap operator
sebaiknya memiliki
akun masing-masing.

==================================================
78. ADMIN ACCOUNT
==================================================

Super Admin account
harus individual.

Jangan menggunakan:

admin
admin123

atau credential
default.

==================================================
79. ACCOUNT LIFECYCLE
==================================================

Audit:

create
activate
deactivate
reset
role change
delete/archive.

==================================================
80. EMPLOYEE LIFECYCLE
==================================================

Saat employee:

active
inactive
resigned
retired

sesuaikan access
dengan status.

==================================================
81. STUDENT LIFECYCLE
==================================================

Student:

active
graduated
transferred
inactive

tidak boleh menghapus
historical records
secara sembarangan.

==================================================
82. DATA RETENTION
==================================================

Jangan menghapus
historical data hanya
karena status berubah.

Gunakan archive/
soft delete sesuai
architecture.

==================================================
83. AUDIT REPORT
==================================================

Hasilkan laporan:

LOGIN ACTIVITY
USER CHANGES
ROLE CHANGES
PERMISSION CHANGES
STUDENT CHANGES
EMPLOYEE CHANGES
ATTENDANCE CHANGES
DOCUMENT ACTIVITY
FINANCE ACTIVITY
ADMIN ACTIVITY.

==================================================
84. DATE RANGE
==================================================

Audit report harus
mendukung periode
yang jelas.

==================================================
85. AUDIT RECONCILIATION
==================================================

Bandingkan:

business data
vs
audit event.

Contoh:

attendance correction
harus memiliki
corresponding audit.

==================================================
86. MISSING AUDIT
==================================================

Jika action penting
tidak menghasilkan
audit:

IDENTIFY
↓
FIX
↓
TEST.

==================================================
87. DUPLICATE AUDIT
==================================================

Jangan membuat
dua audit event
untuk satu business
action kecuali memang
dibutuhkan.

==================================================
88. AUDIT EVENT NAMING
==================================================

Gunakan naming
yang konsisten.

Jangan:

STUDENT_UPDATE
student.updated
UPDATE_STUDENT

untuk event yang sama
tanpa alasan.

Pilih satu convention.

==================================================
89. API AUDIT
==================================================

Critical API action
harus dapat dikaitkan
dengan audit event.

==================================================
90. MOBILE AUDIT
==================================================

Mobile action seperti:

QR scan
GPS attendance
manual attendance

harus dapat dikaitkan
dengan user/device/request.

==================================================
91. OFFLINE AUDIT
==================================================

Jika mobile mendukung
offline mode:

audit harus menangani:

created offline
synced
sync failed
conflict.

Jangan mengimplementasikan
offline jika architecture
tidak mendukungnya.

==================================================
92. CONFLICT AUDIT
==================================================

Jika terjadi conflict:

catat:

source
timestamp
resolution
actor/system.

==================================================
93. AUDIT API RESPONSE
==================================================

Jangan mengirim
seluruh audit log
kepada frontend
jika tidak diperlukan.

Gunakan pagination.

==================================================
94. AUDIT PAGINATION
==================================================

Audit list harus
menggunakan pagination
untuk dataset besar.

==================================================
95. AUDIT SEARCH SECURITY
==================================================

Search audit harus
tetap mengikuti
authorization.

==================================================
96. AUDIT LOG INJECTION
==================================================

Sanitize field yang
berasal dari user agar
tidak dapat memanipulasi
format log.

==================================================
97. AUDIT TIME CONSISTENCY
==================================================

Gunakan:

server timestamp
timezone konsisten.

==================================================
98. AUDIT RETENTION TEST
==================================================

Uji:

archive
restore
search
export.

==================================================
99. AUDIT DISASTER RECOVERY
==================================================

Audit log harus
termasuk dalam:

backup
restore
disaster recovery.

==================================================
100. FINAL AUDIT CHECKLIST
==================================================

[ ] Actor tracking
[ ] Request ID
[ ] Timestamp
[ ] CREATE
[ ] UPDATE
[ ] DELETE
[ ] LOGIN
[ ] LOGOUT
[ ] ROLE
[ ] PERMISSION
[ ] STUDENT
[ ] EMPLOYEE
[ ] ATTENDANCE
[ ] QR
[ ] GPS
[ ] DOCUMENT
[ ] PDF
[ ] WORD
[ ] FINANCE
[ ] INVENTORY
[ ] REPORT
[ ] EXPORT
[ ] IMPORT
[ ] APPROVAL
[ ] SYSTEM CONFIG
[ ] AUDIT SECURITY
[ ] RETENTION
[ ] BACKUP
[ ] RESTORE
[ ] ACCESS CONTROL
[ ] PRIVACY.

==================================================
101. FINAL REPORT
==================================================

Hasilkan:

### AUDIT TRAIL
PASS / FAIL

### AUTHENTICATION AUDIT
PASS / FAIL

### RBAC AUDIT
PASS / FAIL

### STUDENT AUDIT
PASS / FAIL

### EMPLOYEE AUDIT
PASS / FAIL

### ATTENDANCE AUDIT
PASS / FAIL

### QR AUDIT
PASS / FAIL

### GPS AUDIT
PASS / FAIL

### DOCUMENT AUDIT
PASS / FAIL

### FINANCE AUDIT
PASS / FAIL

### SYSTEM CONFIG AUDIT
PASS / FAIL

### SECURITY AUDIT
PASS / FAIL

### DATA RETENTION
PASS / FAIL

### BACKUP & RECOVERY
PASS / FAIL

### CRITICAL FINDINGS
LIST.

### HIGH FINDINGS
LIST.

### REMEDIATION
LIST.

==================================================
102. RELEASE GATE
==================================================

JANGAN menyatakan:

AUDIT READY

jika terdapat:

critical accountability gap
critical authorization gap
missing audit pada
critical operation
audit log yang dapat
dimanipulasi
audit data yang hilang.

==================================================
103. FINAL COMMAND
==================================================

AUDIT SELURUH CODEBASE.

IDENTIFIKASI SEMUA:

CREATE
UPDATE
DELETE
APPROVE
REJECT
LOGIN
LOGOUT
ROLE CHANGE
PERMISSION CHANGE
ATTENDANCE CHANGE
DOCUMENT CHANGE
FINANCE CHANGE
SYSTEM CONFIG CHANGE.

Pastikan seluruh action
penting mempunyai
audit trail.

Pastikan audit:

DINAMIS
TERHUBUNG DATABASE
TIDAK DUMMY
TIDAK DUPLIKAT
TIDAK DAPAT DIMANIPULASI
SESUAI RBAC
TERINTEGRASI MONITORING
TERINTEGRASI BACKUP.

Jangan membuat
audit engine duplicate
jika existing engine
sudah tersedia.

Jika sudah ada audit
engine:

AUDIT
↓
REUSE
↓
EXTEND ONLY IF NEEDED.

JANGAN membuat:

AuditEngine2
AuditLogV2
ActivityLogDuplicate
ComplianceLogDuplicate.

Cari engine existing
terlebih dahulu.

==================================================
104. FINAL DECISION
==================================================

Jika semua critical
audit requirement
terpenuhi:

AUDIT & COMPLIANCE READY.

Jika belum:

AUDIT & COMPLIANCE
NOT READY.

Tampilkan:

ROOT CAUSE
AFFECTED MODULE
RISK
REMEDIATION
STATUS.

# END OF 164