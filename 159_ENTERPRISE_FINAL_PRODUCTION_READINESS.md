# 159 — ENTERPRISE FINAL PRODUCTION READINESS

## MASTER PRODUCTION GO-LIVE PROMPT

TUGAS INI ADALAH FINAL PRODUCTION
READINESS AUDIT DAN GO-LIVE GATE.

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT MODUL BARU.

JANGAN MEMBUAT ENGINE DUPLICATE.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE PRODUKSI.

JANGAN MENYATAKAN READY JIKA
MASIH ADA CRITICAL BLOCKER.

==================================================
1. TUJUAN
==================================================

Pastikan aplikasi:

STABLE
SECURE
CONSISTENT
BACKUP-READY
DEPLOYMENT-READY
MONITORABLE
RECOVERABLE
PRODUCTION-READY.

Aplikasi harus siap digunakan
oleh:

ADMIN
TU
BENDAHARA
GURU
SECURITY
KARYAWAN
PIMPINAN
YAYASAN

sesuai role dan permission.

==================================================
2. FINAL ARCHITECTURE
==================================================

Validasi:

WEB
↓
REST API
↓
AUTH
↓
RBAC
↓
DOMAIN SERVICES
↓
ORM
↓
MYSQL

dan:

FLUTTER/PWA
↓
REST API
↓
SAME DOMAIN SERVICES
↓
MYSQL.

Storage:

DOCUMENT
↓
OBJECT STORAGE
↓
MINIO/S3

Observability:

APPLICATION
↓
LOG
↓
MONITORING
↓
ALERT.

==================================================
3. SOURCE OF TRUTH
==================================================

Database adalah
SOURCE OF TRUTH.

Cache bukan source of truth.

Frontend state bukan
source of truth.

Mobile local storage bukan
source of truth.

Generated report bukan
source of truth.

==================================================
4. PRODUCTION ENVIRONMENT
==================================================

Pastikan environment
production menggunakan:

NODE_ENV=production

atau equivalent
production environment
sesuai stack.

DILARANG:

development mode
debug mode
demo mode
simulation mode
mock production mode.

==================================================
5. ENVIRONMENT VARIABLES
==================================================

Audit seluruh:

DATABASE_URL
JWT_SECRET
API_URL
APP_URL
STORAGE
MINIO
REDIS
QUEUE
EMAIL
NOTIFICATION
MAP/GPS CONFIG

sesuai konfigurasi existing.

Tidak boleh ada secret
yang hardcoded.

==================================================
6. ENVIRONMENT SEPARATION
==================================================

Pastikan:

Development
Staging
Production

memiliki konfigurasi
terpisah.

Jangan menggunakan:

production database
untuk test.

==================================================
7. DATABASE PRODUCTION
==================================================

Check:

database reachable
schema valid
migration valid
indexes valid
foreign keys valid
unique constraints valid.

==================================================
8. MIGRATION SAFETY
==================================================

Sebelum migration production:

BACKUP.

Migration harus:

reviewed
versioned
repeatable
safe.

JANGAN menjalankan
destructive migration
tanpa approval dan
backup.

==================================================
9. DATABASE BACKUP
==================================================

Wajib tersedia:

FULL DATABASE BACKUP.

Backup harus memiliki:

timestamp
retention policy
storage location
verification.

==================================================
10. RESTORE TEST
==================================================

Backup tidak dianggap
valid hanya karena
file berhasil dibuat.

WAJIB:

backup
↓
restore ke test database
↓
validate schema
↓
validate sample records
↓
validate relations.

==================================================
11. BACKUP SCOPE
==================================================

Backup meliputi:

database
document metadata
critical storage
configuration yang aman
untuk recovery.

Jangan membackup secrets
secara tidak aman.

==================================================
12. DISASTER RECOVERY
==================================================

Dokumentasikan:

RPO
RTO
backup frequency
restore procedure
responsible role.

==================================================
13. STORAGE
==================================================

Pastikan object storage:

reachable
authenticated
authorized
persistent.

Test:

upload
download
preview
restore.

==================================================
14. FILE BACKUP
==================================================

Dokumen penting harus
memiliki recovery strategy.

Contoh:

Surat
Dokumen siswa
Dokumen karyawan
Dokumen keuangan.

==================================================
15. AUTHENTICATION
==================================================

Final check:

login
logout
password
token
session
account status
rate limit.

==================================================
16. PASSWORD RESET
==================================================

Jika fitur tersedia:

request
token
expiry
reset
invalidate old session.

Jangan expose
password/token.

==================================================
17. RBAC
==================================================

Final matrix:

SUPER ADMIN
YAYASAN
KEPALA SEKOLAH
TU
BENDAHARA
GURU
SECURITY
KARYAWAN.

Pastikan setiap role:

dashboard
menu
API
data
action

sesuai permission.

==================================================
18. SUPER ADMIN ISOLATION
==================================================

Pastikan menu/settings
Super Admin tidak muncul
kepada role biasa.

Bukan hanya disembunyikan
di frontend.

API juga harus menolak.

==================================================
19. UNIT SCOPE
==================================================

Final test:

Unit A
↓
User A

Tidak boleh mengakses
Unit B tanpa permission.

==================================================
20. STUDENT PRODUCTION
==================================================

Pastikan:

student master
identity
unit
status
QR
document

terhubung database.

Tidak ada student dummy.

==================================================
21. EMPLOYEE PRODUCTION
==================================================

Pastikan:

employee
user
role
unit
position
attendance

terhubung.

Tidak ada employee dummy.

==================================================
22. STUDENT QR ATTENDANCE
==================================================

Production flow:

Student Card
↓
QR Scan
↓
Validate Token
↓
Student
↓
Unit
↓
Actor
↓
Schedule/Policy
↓
Duplicate Check
↓
Attendance
↓
Audit.

Test dari perangkat
nyata jika tersedia.

==================================================
23. SECURITY GATE
==================================================

Security:

Login
↓
Scan Student Card
↓
Validation
↓
Attendance.

Security tidak boleh
mendapat akses finance,
payroll, system settings.

==================================================
24. TEACHER ATTENDANCE
==================================================

Guru:

Login
↓
Assigned Scope
↓
Scan QR
atau
Manual Attendance
↓
Save.

Tidak boleh mengakses
siswa di luar scope.

==================================================
25. EMPLOYEE GPS
==================================================

Employee:

Login
↓
GPS
↓
Permission
↓
Location
↓
Geofence
↓
Schedule
↓
Check-in
↓
Database
↓
Audit.

Test:

GPS enabled
GPS disabled
outside geofence
inside geofence
duplicate check-in.

==================================================
26. EMPLOYEE QR
==================================================

Test:

School QR
↓
Scan
↓
Validate
↓
Employee
↓
Unit
↓
Attendance.

==================================================
27. ATTENDANCE DATA INTEGRITY
==================================================

Pastikan:

server timestamp
method
actor
unit
location
status
audit

tersimpan benar.

==================================================
28. ATTENDANCE CORRECTION
==================================================

Correction harus:

permission
reason
actor
before
after
timestamp
audit.

==================================================
29. DOCUMENT PRODUCTION
==================================================

Final test:

SURAT
SK
SURAT TUGAS
UNDANGAN
BERITA ACARA
NOTULEN
DOKUMEN TU.

Hanya jenis yang memang
tersedia pada codebase.

==================================================
30. KOP SURAT
==================================================

Pastikan:

logo
nama
alamat
unit
kontak

berasal dari database/config.

Tidak hardcoded.

==================================================
31. PDF
==================================================

Final test:

A4
F4/Folio
A5
Portrait
Landscape
font
margin
header
footer
signature
page break.

==================================================
32. WORD
==================================================

DOCX:

valid
editable
layout
font
table
header
footer.

==================================================
33. PRINT
==================================================

Pastikan:

Preview
=
PDF
=
Print

secara layout yang
diharapkan.

==================================================
34. DOCUMENT SECURITY
==================================================

Unauthorized download:

DENY.

Authorized:

PASS.

==================================================
35. FINANCE
==================================================

Final test:

Payment
SPP
Journal
Ledger
Report.

Pastikan tidak ada
financial dummy data.

==================================================
36. PAYROLL
==================================================

Final test:

Employee
Attendance
Calculation
Payroll Run
Approval
Report.

==================================================
37. INVENTORY
==================================================

Final test:

Item
Stock
Movement
Asset
Report.

==================================================
38. NOTIFICATION
==================================================

Test:

in-app notification
read/unread
delivery
error handling.

Jika external provider
digunakan:

credential production
harus benar.

==================================================
39. REPORT
==================================================

Report harus:

database-driven
permission-aware
unit-aware.

Tidak boleh memakai
dummy fallback.

==================================================
40. EXPORT
==================================================

Test:

PDF
Excel
CSV
Word

jika tersedia.

Export harus mengikuti:

filter
scope
permission.

==================================================
41. FRONTEND
==================================================

Production build harus:

compile
bundle
load
route
API connect.

Tidak boleh ada:

broken import
missing asset
runtime exception
blank screen.

==================================================
42. FLUTTER
==================================================

Production build:

Android
iOS
Web/PWA

sesuai target project.

Pastikan:

API URL production
authentication
QR
GPS
notification
document.

==================================================
43. PWA
==================================================

Pastikan:

install
launch
update
cache
offline behavior
API refresh.

Service worker tidak
boleh menyajikan data
lama secara berbahaya.

==================================================
44. RESPONSIVE
==================================================

Test:

Desktop
Tablet
Mobile.

Critical workflow
harus usable.

==================================================
45. BROWSER
==================================================

Test browser target
yang didukung project.

==================================================
46. API PERFORMANCE
==================================================

Audit:

slow endpoint
N+1
large query
large payload
timeout.

==================================================
47. DATABASE PERFORMANCE
==================================================

Audit:

index
query
connection pool
slow query.

==================================================
48. CACHE
==================================================

Pastikan cache:

correct
invalidated
non-authoritative.

Tidak boleh menampilkan
data lama setelah
critical mutation.

==================================================
49. QUEUE
==================================================

Jika queue digunakan:

pending
processing
success
failed
retry.

Tidak boleh ada
silent failed job.

==================================================
50. CRON / SCHEDULER
==================================================

Audit scheduled jobs.

Pastikan:

timezone
frequency
duplicate execution
failure handling.

==================================================
51. TIMEZONE
==================================================

Aplikasi Indonesia
harus konsisten dengan
timezone yang dikonfigurasi.

Attendance sangat sensitif
terhadap timezone.

Jangan menggunakan
timezone berbeda antara:

database
backend
frontend
mobile.

==================================================
52. LOGGING
==================================================

Production log harus:

structured
useful
sanitized.

DILARANG:

password
JWT
secret
API key
sensitive payload.

==================================================
53. MONITORING
==================================================

Monitor:

API uptime
error rate
latency
database
storage
queue
memory
CPU.

==================================================
54. ALERT
==================================================

Critical alert untuk:

API down
database down
storage down
queue failure
high error rate
disk/storage issue.

==================================================
55. HEALTH CHECK
==================================================

Health check harus
menilai dependency penting
tanpa membocorkan secret.

==================================================
56. ERROR TRACKING
==================================================

Pastikan runtime error
dapat dilacak:

module
route
request ID
timestamp
user context yang aman.

==================================================
57. REQUEST ID
==================================================

Gunakan request/correlation
ID jika architecture
mendukung.

Tujuan:

frontend
↓
API
↓
service
↓
database/log

dapat ditelusuri.

==================================================
58. SECURITY
==================================================

Final scan:

IDOR
RBAC bypass
XSS
SQL injection
mass assignment
file access
CSRF
CORS
rate limit
secret leakage.

==================================================
59. DEPENDENCY
==================================================

Audit dependency:

critical vulnerability
high vulnerability
deprecated package
unused package.

Jangan upgrade besar
tanpa compatibility test.

==================================================
60. DATA PRIVACY
==================================================

Pastikan data:

student
parent
employee
attendance
GPS
finance
payroll

hanya dapat diakses
oleh role yang berhak.

==================================================
61. AUDIT LOG
==================================================

Pastikan action penting
tercatat.

Audit harus:

immutable
traceable
timestamped.

==================================================
62. PRODUCTION SEED
==================================================

JANGAN menjalankan
development seed
di production.

Jika ada initial master
data yang memang wajib:

gunakan controlled
production initialization.

==================================================
63. DUMMY SCAN
==================================================

Cari seluruh:

dummy
mock
sample
demo
fake
simulation.

Hasil production:

ZERO DUMMY BUSINESS DATA.

==================================================
64. HARDCODE SCAN
==================================================

Cari:

school
unit
logo
address
API URL
credentials
role
permission
IDs
dates
status.

Semua harus:

database
configuration
environment
atau constant yang
memang legitimate.

==================================================
65. DEAD CODE
==================================================

Identifikasi:

unused service
unused route
unused component
unused page
legacy module.

JANGAN langsung hapus.

Klasifikasikan:

SAFE TO REMOVE
DEPRECATED
ACTIVE
UNKNOWN.

==================================================
66. DUPLICATE SCAN
==================================================

Final scan:

duplicate service
duplicate route
duplicate component
duplicate database model
duplicate business logic.

Tidak boleh ada
duplicate active business
logic.

==================================================
67. DOCUMENTATION
==================================================

Production harus memiliki:

README
Environment setup
Database setup
Migration guide
Deployment guide
Backup guide
Restore guide
API documentation
RBAC documentation
Troubleshooting.

==================================================
68. DEPLOYMENT
==================================================

Dokumentasikan:

build
deploy
environment
migration
restart
health check.

==================================================
69. ROLLBACK
==================================================

Harus tersedia:

application rollback
database rollback strategy
migration rollback strategy
storage recovery strategy.

Jangan menganggap
git rollback otomatis
memulihkan database.

==================================================
70. RELEASE CHECKLIST
==================================================

Sebelum release:

[ ] Backup
[ ] Restore test
[ ] Environment verified
[ ] Database verified
[ ] Storage verified
[ ] API verified
[ ] Web verified
[ ] Flutter verified
[ ] PWA verified
[ ] Auth verified
[ ] RBAC verified
[ ] Scope verified
[ ] Attendance verified
[ ] Document verified
[ ] PDF verified
[ ] Word verified
[ ] Print verified
[ ] Finance verified
[ ] Payroll verified
[ ] Notification verified
[ ] Reports verified
[ ] Monitoring verified
[ ] Logging verified
[ ] Security verified.

==================================================
71. GO-LIVE PROCEDURE
==================================================

Recommended sequence:

1. Freeze feature development
2. Backup production
3. Verify backup
4. Deploy application
5. Run safe migrations if needed
6. Run health check
7. Verify login
8. Verify RBAC
9. Verify database
10. Verify attendance
11. Verify document
12. Verify finance
13. Verify notification
14. Verify monitoring
15. Release.

==================================================
72. SMOKE TEST
==================================================

Immediately after deployment:

Login
↓
Dashboard
↓
Student
↓
Employee
↓
Attendance
↓
Document
↓
Report
↓
Logout.

Jika critical flow gagal:

ROLLBACK.

==================================================
73. POST DEPLOYMENT
==================================================

Monitor:

15 minutes
30 minutes
1 hour
4 hours
24 hours

sesuai kemampuan
operasional project.

==================================================
74. INCIDENT RESPONSE
==================================================

Jika production error:

Detect
↓
Classify
↓
Contain
↓
Investigate
↓
Fix/Rollback
↓
Verify
↓
Document.

==================================================
75. PRODUCTION SUPPORT
==================================================

Dokumentasikan siapa
yang bertanggung jawab
untuk:

system
database
backup
attendance
finance
document
user access.

==================================================
76. FINAL QA
==================================================

Gabungkan hasil:

154
155
156
157
158.

Tidak boleh ada
contradiction.

==================================================
77. RELEASE BLOCKERS
==================================================

BLOCK RELEASE jika:

CRITICAL BUG
CRITICAL SECURITY
DATA CORRUPTION
BROKEN LOGIN
BROKEN RBAC
BROKEN DATABASE
BROKEN ATTENDANCE
BROKEN PAYMENT
BROKEN DOCUMENT
BROKEN BACKUP.

==================================================
78. HIGH ISSUE
==================================================

HIGH issue yang
mempengaruhi:

security
financial integrity
attendance integrity
data integrity
core workflow

harus diperbaiki
sebelum production.

==================================================
79. FINAL STATUS
==================================================

Gunakan hanya:

READY FOR PRODUCTION

atau:

NOT READY FOR PRODUCTION

Jangan gunakan:

"almost ready"
"probably ready"
"seharusnya ready".

==================================================
80. FINAL PRODUCTION SCORE
==================================================

Buat:

Architecture
Database
API
Frontend
Mobile
Security
RBAC
Attendance
Document
Finance
Payroll
Storage
Backup
Monitoring
Testing
Deployment

masing-masing:

PASS
FAIL
BLOCKED.

==================================================
81. FINAL REPORT
==================================================

WAJIB HASILKAN:

### A. SYSTEM STATUS

READY / NOT READY

### B. CRITICAL BLOCKERS

list.

### C. HIGH RISKS

list.

### D. MEDIUM RISKS

list.

### E. FIXES COMPLETED

list.

### F. TEST RESULTS

total
passed
failed
blocked.

### G. DATABASE STATUS

schema
relations
backup
restore.

### H. SECURITY STATUS

authentication
RBAC
scope
IDOR
secrets.

### I. ATTENDANCE STATUS

Student QR
Security Gate
Teacher Manual
Employee GPS
Employee QR.

### J. DOCUMENT STATUS

Template
Kop
PDF
Word
Print
Archive.

### K. DEPLOYMENT STATUS

build
environment
server
storage
monitoring.

### L. ROLLBACK STATUS

application
database
storage.

### M. FINAL DECISION

READY FOR PRODUCTION

atau

NOT READY FOR PRODUCTION.

==================================================
82. FINAL RULE
==================================================

JANGAN MENAMBAH FITUR.

JANGAN MEMBUAT MODUL BARU.

JANGAN MEMBUAT DUPLICATE ENGINE.

JANGAN MEMBUAT DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MERUSAK DATA.

JANGAN MENYEMBUNYIKAN ERROR.

JANGAN MENYATAKAN READY
TANPA BUKTI TEST.

DATABASE = SOURCE OF TRUTH.

BACKEND = BUSINESS LOGIC.

FRONTEND = PRESENTATION.

FLUTTER = CLIENT.

PWA = CLIENT.

SEMUA CLIENT MENGGUNAKAN
REST API YANG SAMA.

SEMUA ROLE MENGGUNAKAN
RBAC YANG SAMA.

SEMUA UNIT MENGGUNAKAN
SCOPE YANG SAMA.

SEMUA DOCUMENT MENGGUNAKAN
DOCUMENT ENGINE YANG SAMA.

SEMUA ATTENDANCE MENGGUNAKAN
ATTENDANCE CORE YANG SAMA.

==================================================
FINAL COMMAND
==================================================

LAKUKAN FINAL PRODUCTION
READINESS AUDIT.

VALIDASI SELURUH SISTEM.

JANGAN MENAMBAH FITUR.

PERBAIKI ERROR YANG AMAN
UNTUK DIPERBAIKI.

JALANKAN TEST ULANG.

VERIFIKASI BACKUP.

VERIFIKASI RESTORE.

VERIFIKASI SECURITY.

VERIFIKASI RBAC.

VERIFIKASI ATTENDANCE.

VERIFIKASI DOCUMENT.

VERIFIKASI FINANCE.

VERIFIKASI DEPLOYMENT.

VERIFIKASI MONITORING.

SETELAH SEMUA VALID:

BERIKAN FINAL STATUS:

READY FOR PRODUCTION

ATAU:

NOT READY FOR PRODUCTION.

JIKA NOT READY,
WAJIB TAMPILKAN BLOCKER
DAN ROOT CAUSE-NYA.

# END OF 159