# 160 — ENTERPRISE PRODUCTION DEPLOYMENT & DEVOPS

## MASTER PRODUCTION DEPLOYMENT PROMPT

TUGAS INI ADALAH FINALISASI DAN
HARDENING DEPLOYMENT PRODUCTION.

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT MODUL BARU.

JANGAN MEMBUAT ENGINE DUPLICATE.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE PRODUKSI.

JANGAN MENJALANKAN DESTRUCTIVE
COMMAND TANPA BACKUP DAN VALIDASI.

==================================================
1. TUJUAN
==================================================

Pastikan aplikasi dapat:

BUILD
↓
DEPLOY
↓
MIGRATE
↓
START
↓
HEALTH CHECK
↓
SERVE TRAFFIC
↓
MONITOR
↓
ROLLBACK

dengan aman.

==================================================
2. ARSITEKTUR DEPLOYMENT
==================================================

Gunakan architecture existing.

Target:

USER
 ↓
HTTPS
 ↓
DOMAIN
 ↓
WEB / REVERSE PROXY
 ↓
BACKEND API
 ↓
DATABASE
 ↓
CACHE / QUEUE
 ↓
STORAGE.

Flutter:

FLUTTER
 ↓
HTTPS API
 ↓
BACKEND
 ↓
DATABASE/STORAGE.

JANGAN membuat backend kedua.

==================================================
3. ENVIRONMENT
==================================================

Pisahkan:

LOCAL
STAGING
PRODUCTION.

Masing-masing memiliki:

DATABASE
API CONFIG
STORAGE
CACHE
QUEUE
SECRET
DOMAIN

yang sesuai.

==================================================
4. PRODUCTION MODE
==================================================

Pastikan production:

DEBUG=false

atau equivalent.

Jangan aktifkan:

debug toolbar
development logging
mock provider
demo mode
simulation mode.

==================================================
5. ENVIRONMENT VARIABLE
==================================================

Audit semua environment
variable.

Contoh:

APP_ENV
APP_URL
API_URL
DATABASE_URL
DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD
JWT_SECRET
SESSION_SECRET
REDIS_URL
QUEUE_CONNECTION
CACHE_DRIVER
STORAGE
MINIO_ENDPOINT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MAIL_HOST
MAIL_PORT
MAIL_USERNAME
MAIL_PASSWORD.

Gunakan hanya variable
yang benar-benar dipakai
oleh codebase.

JANGAN menambahkan
variable yang tidak digunakan.

==================================================
6. SECRET MANAGEMENT
==================================================

JANGAN hardcode:

password
API key
JWT secret
database credential
storage credential
mail credential.

Gunakan:

environment variables
atau secret manager.

==================================================
7. .ENV
==================================================

Production `.env`:

tidak boleh masuk Git.

Gunakan:

.env.example

untuk dokumentasi.

`.env.example`
tidak boleh berisi
secret production.

==================================================
8. SOURCE CONTROL
==================================================

Pastikan Git tidak
mengandung:

.env
database dump production
private keys
storage credentials
JWT secrets
password.

==================================================
9. GITIGNORE
==================================================

Audit `.gitignore`.

Minimal:

.env
.env.*
!.env.example

storage temporary files
build artifacts
node_modules
vendor jika sesuai workflow
IDE files
OS files.

==================================================
10. SERVER
==================================================

Server production harus
memenuhi kebutuhan
application existing.

Check:

CPU
RAM
Disk
Network
PHP/Node runtime
Database
SSL
Process manager.

JANGAN mengubah runtime
tanpa compatibility test.

==================================================
11. RUNTIME VERSION
==================================================

Catat version:

Backend runtime
Frontend runtime
Flutter SDK
Dart
Database
Redis
Web server.

Version harus compatible
dengan application lockfile.

==================================================
12. DEPENDENCY INSTALL
==================================================

Production install harus
menggunakan lockfile.

Contoh:

npm ci

atau equivalent.

Jangan menggunakan
random dependency version.

==================================================
13. BACKEND BUILD
==================================================

Run:

install dependencies
↓
generate required artifacts
↓
compile/build
↓
test
↓
start.

Jika Laravel:

composer install --no-dev --optimize-autoloader

sesuai project.

Jika Node:

npm ci
npm run build

sesuai project.

JANGAN menjalankan command
yang tidak sesuai stack.

==================================================
14. FRONTEND BUILD
==================================================

Build production:

npm run build

atau command existing.

Pastikan:

API URL
asset path
base URL
environment

mengarah ke production.

==================================================
15. FLUTTER BUILD
==================================================

Pastikan Flutter menggunakan
production API.

Audit:

API endpoint
environment
app version
build number
permissions
QR
GPS
notification.

==================================================
16. FLUTTER ANDROID
==================================================

Jika Android target:

flutter build apk --release

atau:

flutter build appbundle --release

sesuai release strategy.

Pastikan tidak memakai
localhost.

==================================================
17. FLUTTER IOS
==================================================

Jika iOS target:

production API
signing
permissions
location usage description
camera permission
notification permission.

==================================================
18. FLUTTER WEB
==================================================

Jika Flutter Web:

build release
↓
deploy
↓
configure routing
↓
HTTPS
↓
API.

==================================================
19. API URL
==================================================

DILARANG:

localhost
127.0.0.1
development IP
temporary tunnel.

Production harus menggunakan
HTTPS production endpoint.

==================================================
20. CORS
==================================================

Configure CORS:

WEB DOMAIN
FLUTTER WEB DOMAIN
allowed origins.

Jangan menggunakan:

allow all origins

untuk production jika
tidak diperlukan.

==================================================
21. HTTPS
==================================================

Production wajib:

HTTPS.

Pastikan:

certificate valid
auto renewal
redirect HTTP → HTTPS.

==================================================
22. DOMAIN
==================================================

Dokumentasikan:

APP DOMAIN
API DOMAIN
STORAGE DOMAIN

jika digunakan.

Contoh architecture:

app.example.sch.id
api.example.sch.id

JANGAN hardcode domain
di business logic.

==================================================
23. REVERSE PROXY
==================================================

Jika digunakan:

Nginx
Apache
Caddy
Cloudflare

pastikan:

proxy
headers
HTTPS
timeouts
body size
compression

sesuai kebutuhan.

==================================================
24. UPLOAD LIMIT
==================================================

Configure sesuai kebutuhan:

file upload size
request body size
timeout.

Jangan memberikan
limit terlalu besar
tanpa alasan.

==================================================
25. DATABASE CONNECTION
==================================================

Pastikan:

host
port
database
username
password
SSL jika diperlukan
connection pool.

==================================================
26. DATABASE MIGRATION
==================================================

Flow:

BACKUP
↓
CHECK MIGRATION
↓
REVIEW
↓
RUN MIGRATION
↓
VERIFY
↓
HEALTH CHECK.

JANGAN melakukan:

DROP DATABASE
DROP TABLE
TRUNCATE

dalam deployment normal.

==================================================
27. MIGRATION LOCK
==================================================

Pastikan deployment
concurrent tidak
menjalankan migration
dua kali.

==================================================
28. DATABASE INDEX
==================================================

Pastikan migration
production memiliki
index yang diperlukan.

Khusus:

student
employee
attendance
document
payment
notification
audit.

==================================================
29. DATABASE BACKUP
==================================================

Sebelum deployment:

BACKUP DATABASE.

Simpan:

timestamp
environment
version.

==================================================
30. BACKUP VERIFICATION
==================================================

Pastikan backup
dapat dibaca.

Jika memungkinkan:

restore ke staging/test.

==================================================
31. STORAGE
==================================================

Production storage
harus persistent.

Jangan menyimpan
file production pada
filesystem ephemeral
jika server tidak
menjamin persistence.

==================================================
32. DOCUMENT STORAGE
==================================================

Pastikan file:

surat
PDF
Word
foto
dokumen siswa
dokumen karyawan

tetap tersedia
setelah deployment.

==================================================
33. CACHE
==================================================

Setelah deployment:

clear/invalidate
cache yang relevan.

Jangan menghapus
cache production
secara membabi buta
jika tidak diperlukan.

==================================================
34. QUEUE
==================================================

Jika application
menggunakan queue:

start worker.

Pastikan:

worker running
retry policy
failed jobs
timeout.

==================================================
35. QUEUE DEPLOYMENT
==================================================

Setelah deploy:

restart/reload worker
secara aman.

Jangan sampai job
hilang tanpa alasan.

==================================================
36. SCHEDULER
==================================================

Jika menggunakan
scheduler/cron:

pastikan aktif.

Audit:

timezone
frequency
command
failure.

==================================================
37. TIMEZONE
==================================================

Pastikan seluruh
system menggunakan
timezone yang konsisten.

Khusus:

ABSENSI
GPS
DOCUMENT DATE
PAYMENT
AUDIT LOG.

Jangan ada perbedaan
timezone yang menyebabkan
tanggal absensi salah.

==================================================
38. PROCESS MANAGER
==================================================

Jika backend membutuhkan:

Supervisor
PM2
systemd
Docker
atau equivalent

pastikan:

auto restart
log
resource limit
startup.

Gunakan tool yang
memang sesuai stack.

==================================================
39. HEALTH CHECK
==================================================

Buat/gunakan health
endpoint existing.

Check:

application
database
cache
queue
storage

sesuai architecture.

==================================================
40. HEALTH RESPONSE
==================================================

Health endpoint
tidak boleh membocorkan:

password
secret
database credential
internal stack trace.

==================================================
41. STARTUP CHECK
==================================================

Setelah deploy:

start
↓
health
↓
database
↓
API
↓
frontend
↓
login.

==================================================
42. SMOKE TEST
==================================================

WAJIB:

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
Notification
↓
Report
↓
Logout.

==================================================
43. ATTENDANCE SMOKE TEST
==================================================

Student:

QR card
↓
scan
↓
attendance.

Security:

login
↓
scan
↓
save.

Teacher:

login
↓
student scope
↓
scan/manual
↓
save.

Employee:

login
↓
GPS/QR
↓
attendance.

==================================================
44. DOCUMENT SMOKE TEST
==================================================

Create document
↓
Preview
↓
Generate PDF
↓
Generate Word
↓
Print
↓
Archive.

==================================================
45. ERROR HANDLING
==================================================

Production error:

jangan tampilkan
stack trace ke user.

User:

"Terjadi kesalahan."

Backend:

log detail
+ request ID.

==================================================
46. LOGGING
==================================================

Log:

timestamp
level
service
request ID
route
status
duration.

Jangan log:

password
token
secret
sensitive personal data
secara berlebihan.

==================================================
47. LOG ROTATION
==================================================

Pastikan log tidak
memenuhi disk.

Gunakan:

rotation
retention
compression

sesuai infrastructure.

==================================================
48. MONITORING
==================================================

Monitor:

CPU
RAM
Disk
API
Database
Queue
Storage.

==================================================
49. ALERT
==================================================

Alert untuk:

application down
database down
high error
high latency
disk critical
queue failure.

==================================================
50. PERFORMANCE
==================================================

Audit production:

API response
database query
large report
PDF rendering
file upload
QR attendance.

==================================================
51. N+1
==================================================

Audit critical endpoint:

student
employee
attendance
dashboard
report.

Pastikan tidak ada
N+1 query kritis.

==================================================
52. RATE LIMIT
==================================================

Protect:

login
password reset
QR endpoint
attendance endpoint
upload
export.

==================================================
53. QR SECURITY
==================================================

QR harus:

validated
scoped
non-forgeable sesuai
architecture
revocable jika diperlukan.

Jangan percaya
payload QR secara
langsung.

==================================================
54. GPS SECURITY
==================================================

GPS location harus
divalidasi server.

Frontend/mobile
tidak boleh menjadi
satu-satunya validator.

==================================================
55. FILE SECURITY
==================================================

Pastikan:

file authorization
MIME validation
size validation
safe filename
storage isolation.

==================================================
56. DATABASE SECURITY
==================================================

Database user production
harus menggunakan
permission minimum
yang diperlukan.

==================================================
57. ADMIN ACCESS
==================================================

Super Admin:

hanya diberikan
kepada akun yang
memang membutuhkan.

Jangan membuat
semua user menjadi
Super Admin.

==================================================
58. DEFAULT ACCOUNT
==================================================

Jika terdapat
default admin account:

WAJIB:

ubah password
atau disable account.

Jangan meninggalkan
credential default.

==================================================
59. DEMO ACCOUNT
==================================================

Production:

NO DEMO ACCOUNT.

==================================================
60. TEST ACCOUNT
==================================================

Test account:

hanya staging/test.

Jangan berada di
production kecuali
memang diperlukan
dan diberi akses
terbatas.

==================================================
61. FRONTEND CACHE
==================================================

Pastikan deployment
menghindari stale bundle.

Gunakan:

versioned assets
cache headers
appropriate cache policy.

==================================================
62. MOBILE VERSION
==================================================

Dokumentasikan:

version
build number
API compatibility.

==================================================
63. API COMPATIBILITY
==================================================

Jangan merusak
mobile lama secara
diam-diam.

Jika API breaking:

versioning/migration
strategy harus jelas.

==================================================
64. DEPLOYMENT ORDER
==================================================

Gunakan:

1. Backup
2. Maintenance decision
3. Deploy backend
4. Migration
5. Cache/config
6. Queue restart
7. Deploy frontend
8. Health check
9. Smoke test
10. Release.

Sesuaikan dengan
architecture actual.

==================================================
65. ZERO-DOWNTIME
==================================================

Jika infrastructure
mendukung:

gunakan rolling/
atomic deployment.

Jika tidak:

gunakan maintenance
window yang jelas.

Jangan mengklaim
zero downtime jika
tidak tersedia.

==================================================
66. ROLLBACK
==================================================

Jika deployment gagal:

STOP
↓
CHECK
↓
ROLLBACK APPLICATION
↓
VERIFY DATABASE
↓
VERIFY STORAGE
↓
HEALTH CHECK.

==================================================
67. DATABASE ROLLBACK
==================================================

Jangan otomatis
rollback database
dengan destructive
migration.

Gunakan:

backward-compatible
migration
atau
backup restore

sesuai kondisi.

==================================================
68. VERSION
==================================================

Gunakan version:

MAJOR.MINOR.PATCH

jika project memakai
semantic versioning.

Contoh:

1.0.0

Catat:

release date
commit
migration version.

==================================================
69. RELEASE TAG
==================================================

Setiap production
release harus memiliki
identitas:

version
commit/tag
deployment time.

==================================================
70. CHANGELOG
==================================================

Catat:

new
changed
fixed
security
breaking changes.

Jangan memasukkan
secret.

==================================================
71. DEPLOYMENT RECORD
==================================================

Catat:

version
operator
timestamp
environment
migration
status
rollback jika ada.

==================================================
72. PRODUCTION CONFIG
==================================================

Audit:

APP
DATABASE
CACHE
QUEUE
STORAGE
MAIL
NOTIFICATION
CORS
HTTPS.

==================================================
73. EMAIL
==================================================

Jika email digunakan:

production SMTP/API
credential
sender
reply-to
TLS.

Test:

send
receive
failure.

==================================================
74. PUSH NOTIFICATION
==================================================

Jika digunakan:

production credentials
device registration
token refresh
delivery
failure.

==================================================
75. FIREBASE
==================================================

Jika Firebase digunakan:

gunakan project production.

Jangan menggunakan
Firebase development
untuk production.

==================================================
76. GOOGLE SERVICES
==================================================

Jika Google services
digunakan:

audit API key
OAuth
project
quota
restriction.

==================================================
77. STORAGE URL
==================================================

Jangan expose
private storage
secara permanen.

Gunakan authorization
atau signed URL sesuai
architecture.

==================================================
78. BACKUP AUTOMATION
==================================================

Jika tersedia:

automate backup.

Pastikan:

schedule
retention
failure alert.

==================================================
79. DISK MONITORING
==================================================

Monitor:

database disk
storage disk
log disk
temporary disk.

==================================================
80. SECURITY PATCH
==================================================

Tetapkan proses:

monitor
patch
test
deploy.

Jangan upgrade dependency
production secara
langsung tanpa test.

==================================================
81. PRODUCTION TEST
==================================================

Setelah deployment:

RUN SMOKE TEST.

Jangan menjalankan
destructive integration
test pada production.

==================================================
82. FINAL DEPLOYMENT CHECKLIST
==================================================

[ ] Production env
[ ] Secrets secure
[ ] HTTPS
[ ] Domain
[ ] CORS
[ ] Backend build
[ ] Frontend build
[ ] Flutter build
[ ] Database
[ ] Migration
[ ] Backup
[ ] Restore verification
[ ] Storage
[ ] Cache
[ ] Queue
[ ] Scheduler
[ ] Health check
[ ] Monitoring
[ ] Logging
[ ] Alerts
[ ] RBAC
[ ] Attendance
[ ] QR
[ ] GPS
[ ] Document
[ ] PDF
[ ] Word
[ ] Notification
[ ] Report
[ ] Rollback.

==================================================
83. PRODUCTION RELEASE GATE
==================================================

RELEASE HANYA JIKA:

NO CRITICAL BUG
NO CRITICAL SECURITY
NO DATA CORRUPTION
BACKUP VERIFIED
HEALTH CHECK PASS
SMOKE TEST PASS
AUTH PASS
RBAC PASS
ATTENDANCE PASS
DOCUMENT PASS.

==================================================
84. FINAL OUTPUT
==================================================

Hasilkan report:

### ENVIRONMENT
PASS / FAIL

### DATABASE
PASS / FAIL

### STORAGE
PASS / FAIL

### BACKEND
PASS / FAIL

### FRONTEND
PASS / FAIL

### FLUTTER
PASS / FAIL

### AUTH
PASS / FAIL

### RBAC
PASS / FAIL

### ATTENDANCE
PASS / FAIL

### DOCUMENT
PASS / FAIL

### NOTIFICATION
PASS / FAIL

### MONITORING
PASS / FAIL

### BACKUP
PASS / FAIL

### ROLLBACK
PASS / FAIL

### FINAL STATUS

READY FOR DEPLOYMENT

atau

NOT READY FOR DEPLOYMENT.

==================================================
85. FINAL COMMAND
==================================================

AUDIT DEPLOYMENT EXISTING.

GUNAKAN STACK YANG SUDAH ADA.

JANGAN MEMBUAT STACK BARU
TANPA ALASAN.

JANGAN MEMBUAT DATABASE BARU.

JANGAN MEMBUAT API BARU
JIKA ENDPOINT EXISTING
SUDAH MENANGANI KEBUTUHAN.

JANGAN MEMBUAT DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN MENJALANKAN
DESTRUCTIVE COMMAND
TANPA BACKUP.

PERBAIKI KONFIGURASI
YANG SALAH.

TEST ULANG.

VERIFIKASI BACKUP.

VERIFIKASI RESTORE.

VERIFIKASI HEALTH CHECK.

VERIFIKASI SMOKE TEST.

HANYA NYATAKAN:

READY FOR DEPLOYMENT

JIKA SEMUA RELEASE BLOCKER
SUDAH SELESAI.

# END OF 160