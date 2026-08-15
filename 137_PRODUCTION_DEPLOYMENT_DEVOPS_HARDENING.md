============================================================
137 — PRODUCTION DEPLOYMENT & DEVOPS HARDENING
SCHOOL / PESANTREN ERP
============================================================

STATUS:
FINAL PRODUCTION INFRASTRUCTURE HARDENING

TUJUAN:
Menjadikan aplikasi ERP siap dipasang pada:

- Localhost
- Development
- Staging
- Production
- VPS
- Shared Hosting jika kompatibel
- Docker environment jika digunakan
- Flutter Mobile
- Web Browser / PWA

TANPA mengubah business logic yang sudah diaudit.

============================================================
1. ATURAN UTAMA
============================================================

JANGAN membuat project baru.

JANGAN mengganti stack.

JANGAN menghapus fitur existing.

JANGAN menggunakan dummy production data.

JANGAN hardcode:

Database URL
API URL
JWT Secret
Storage path
Google Maps API Key
Firebase credential
SMTP
Payment Gateway
Third Party API.

Semua environment harus menggunakan configuration.

============================================================
2. ENVIRONMENT ARCHITECTURE
============================================================

Pisahkan:

.env.development
.env.staging
.env.production

Sediakan:

.env.example

Pastikan secret tidak masuk Git.

============================================================
3. REQUIRED ENVIRONMENT
============================================================

Minimal:

NODE_ENV
APP_URL
API_URL

DATABASE_URL

JWT_SECRET
JWT_EXPIRES_IN
REFRESH_TOKEN_SECRET

CORS_ORIGINS

STORAGE_DRIVER
STORAGE_URL

GOOGLE_MAPS_API_KEY

SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
SMTP_FROM

REDIS_URL jika digunakan.

Semua variable harus divalidasi ketika aplikasi startup.

Jika variable wajib tidak tersedia:

APPLICATION MUST FAIL FAST.

Jangan menggunakan fallback dummy.

============================================================
4. DATABASE PRODUCTION
============================================================

Gunakan PostgreSQL production.

Pastikan:

Connection Pool
SSL jika diperlukan
Timeout
Retry policy
Migration
Backup.

Jangan menjalankan:

prisma db push

sebagai deployment production utama.

Gunakan:

Prisma Migration.

============================================================
5. DATABASE MIGRATION
============================================================

Deployment:

Backup
→ Migration
→ Verification
→ Application Deployment.

Migration harus:

idempotent sesuai migration history
tercatat
dapat diverifikasi.

Jangan menghapus production data.

============================================================
6. DATABASE BACKUP
============================================================

Implementasikan:

Daily Backup
Weekly Backup
Monthly Backup.

Retention configurable.

Backup harus dapat direstore.

WAJIB melakukan restore test.

Backup yang belum pernah diuji restore
DIANGGAP BELUM AMAN.

============================================================
7. DISASTER RECOVERY
============================================================

Dokumentasikan:

RPO
RTO
Backup Location
Restore Procedure
Database Recovery
File Recovery
Application Recovery.

Minimal siapkan prosedur:

Database gagal
Storage gagal
Server gagal
Deployment gagal.

============================================================
8. STORAGE
============================================================

Dokumen:

Surat
SK
Rapor
Foto
Logo
Signature
Stamp
Lampiran
Materi
File Import

harus disimpan menggunakan storage configuration.

Jangan menyimpan file penting hanya di filesystem ephemeral.

============================================================
9. FILE SECURITY
============================================================

Upload validation:

MIME
Extension
Size
Filename
Storage path.

Jangan memperbolehkan:

Executable upload
PHP upload
Script upload
Path traversal.

Filename harus disanitasi.

============================================================
10. PDF / DOCUMENT PRODUCTION
============================================================

Pastikan document engine bekerja di production.

Test:

PDF
DOCX
Excel
CSV
Print.

Font harus tersedia di server.

Jika menggunakan library system dependency:

dokumentasikan dependency tersebut.

============================================================
11. QUEUE / BACKGROUND JOB
============================================================

Gunakan queue untuk pekerjaan berat:

Bulk PDF
Bulk Rapor
Bulk Export
Bulk Email
Notification
Large Import
Report generation.

Jangan menjalankan proses besar dalam HTTP request jika berpotensi timeout.

============================================================
12. REDIS
============================================================

Jika Redis digunakan:

Cache
Queue
Rate Limit
Session bila diperlukan.

Jika Redis tidak tersedia:

JANGAN fallback ke dummy.

Aplikasi harus menggunakan policy yang aman:

fail gracefully
atau gunakan configured alternative.

============================================================
13. CACHE
============================================================

Cache hanya untuk data yang aman dicache.

Invalidasi setelah:

Create
Update
Delete
Approve
Publish
Lock.

Jangan cache data sensitif tanpa pertimbangan keamanan.

============================================================
14. RATE LIMITING
============================================================

Implementasikan rate limit untuk:

Login
Password Reset
OTP
QR verification
Public verification
API
File upload.

Jangan sampai brute force dapat dilakukan tanpa batas.

============================================================
15. SECURITY HEADERS
============================================================

Gunakan security headers sesuai arsitektur.

Minimal periksa:

Content Security Policy
X-Content-Type-Options
Referrer Policy
Frame Protection
HTTPS.

============================================================
16. HTTPS
============================================================

Production wajib menggunakan HTTPS.

Pastikan:

API HTTPS
Web HTTPS
File URL HTTPS
Verification URL HTTPS.

Jangan mengirim credential melalui HTTP.

============================================================
17. CORS
============================================================

Jangan gunakan:

Access-Control-Allow-Origin: *

untuk production jika tidak diperlukan.

Gunakan whitelist:

WEB APP
MOBILE WEB
TRUSTED CLIENT.

============================================================
18. LOGGING
============================================================

Gunakan structured logging.

Log:

Request
Response status
Error
Database error
Authentication event
Security event
Queue event.

Jangan log:

Password
JWT
Secret
Full sensitive personal data.

============================================================
19. ERROR MONITORING
============================================================

Implementasikan production error monitoring.

Setiap error harus mempunyai:

Error ID
Timestamp
Request ID
Endpoint
User ID jika aman
Stack trace internal.

User hanya menerima:

Pesan aman
Error ID.

============================================================
20. HEALTH CHECK
============================================================

Sediakan:

GET /health

dan jika diperlukan:

GET /health/database
GET /health/storage
GET /health/redis

Health check harus membedakan:

Application Healthy
Dependency Unhealthy.

============================================================
21. READINESS / LIVENESS
============================================================

Jika menggunakan container:

Liveness:
aplikasi hidup.

Readiness:
aplikasi siap menerima traffic.

Jangan menganggap server hidup berarti database sehat.

============================================================
22. DEPLOYMENT PIPELINE
============================================================

Pipeline:

Install
→ Validate Environment
→ Type Check
→ Lint
→ Test
→ Build
→ Migration
→ Deploy
→ Health Check
→ Smoke Test.

Jika test gagal:

DEPLOYMENT HARUS GAGAL.

============================================================
23. ZERO-DOWNTIME SAFETY
============================================================

Jika deployment strategy mendukung:

Rolling Deployment
Blue/Green
atau strategi aman lainnya.

Pastikan migration backward compatible jika aplikasi lama masih berjalan.

============================================================
24. ROLLBACK
============================================================

Siapkan rollback:

Application
Database migration strategy
Configuration.

Jangan menggunakan database rollback sembarangan.

Jika migration destructive:

backup wajib dibuat terlebih dahulu.

============================================================
25. FRONTEND BUILD
============================================================

Pastikan:

npm install
npm run build

berhasil tanpa error.

Tidak boleh ada:

TypeScript error
Missing environment
Missing import
Broken route
Broken asset.

============================================================
26. BACKEND BUILD
============================================================

Pastikan backend:

build
start
health check

berhasil pada environment production.

============================================================
27. FLUTTER PRODUCTION
============================================================

Flutter harus menggunakan:

Production API URL.

Tidak boleh:

localhost
127.0.0.1
development API.

Test:

Login
Dashboard
Profile
Attendance
GPS
QR
KBM
Assessment
Notification
Report.

============================================================
28. MOBILE NETWORK
============================================================

Test:

WiFi
Mobile Data
Slow Network
Offline transition
Timeout
Retry.

Jangan membuat duplicate transaction akibat retry.

============================================================
29. PWA / BROWSER
============================================================

Jika aplikasi web mendukung install:

Manifest
Icon
Service Worker
HTTPS
Responsive UI.

Pastikan browser:

Chrome
Safari
Edge
Firefox

dapat membuka aplikasi sesuai compatibility target.

============================================================
30. GOOGLE MAPS
============================================================

Audit:

API Key
Domain Restriction
Mobile Restriction
Billing Configuration
Quota.

Jangan menyimpan server secret di Flutter/frontend.

GPS attendance harus menggunakan:

Current Location
Accuracy
Timestamp
Permission.

============================================================
31. QR / BARCODE
============================================================

Test:

Valid QR
Invalid QR
Expired QR
Duplicate Scan
Wrong Student
Wrong Rombel
Wrong Schedule.

Setiap scan harus menghasilkan transaksi yang konsisten.

============================================================
32. DOCUMENT VERIFICATION
============================================================

Public verification endpoint:

QR
→ Verification API
→ Document status.

Tidak boleh menampilkan data pribadi berlebihan.

============================================================
33. EMAIL
============================================================

Test:

SMTP Connection
Send
Failure
Retry
Queue.

Email gagal tidak boleh membuat transaction utama rollback jika memang tidak seharusnya.

============================================================
34. NOTIFICATION
============================================================

Test:

In-app
Push jika digunakan
Email jika digunakan.

Pastikan notification tidak dibuat berulang untuk event yang sama.

============================================================
35. PRODUCTION DATABASE CLEANUP
============================================================

Sebelum go-live:

Hapus:

Dummy
Mock
Simulation
Test Student
Test Teacher
Test Attendance
Test Score
Test Report
Test Notification.

JANGAN menghapus data production yang valid.

============================================================
36. SEED POLICY
============================================================

Seed dibagi:

Development Seed
Production Seed.

Production seed hanya boleh membuat:

System Configuration
Default Permission
Required System Data.

Jangan membuat user demo.

============================================================
37. CRON / SCHEDULER
============================================================

Audit seluruh scheduled jobs:

Notification
Backup
Archive
Report
Academic rollover
Cleanup.

Pastikan tidak ada job duplicate.

============================================================
38. QUEUE FAILURE
============================================================

Jika queue job gagal:

Retry sesuai policy.

Jika tetap gagal:

Dead Letter / Failed Job.

Admin dapat melihat:

Job
Status
Error
Retry.

============================================================
39. CONCURRENCY
============================================================

Periksa race condition pada:

Attendance
Score
Payment jika ada
Approval
Publish
Rapor
Import
Rollover.

Gunakan:

Transaction
Unique Constraint
Optimistic Lock
Idempotency

sesuai kebutuhan.

============================================================
40. IDEMPOTENCY
============================================================

Request seperti:

Attendance
Payment
Publish
Generate
Import

tidak boleh membuat duplicate record jika request terkirim dua kali.

============================================================
41. PRODUCTION CONFIG
============================================================

Pastikan:

DEBUG=false

Production error detail tidak ditampilkan.

Development tools tidak aktif.

Admin debug panel tidak tersedia untuk user biasa.

============================================================
42. SERVER PERMISSION
============================================================

Pastikan:

Environment file tidak public.

Storage aman.

Upload tidak executable.

Logs tidak public.

Backup tidak public.

============================================================
43. DOMAIN CONFIGURATION
============================================================

Semua URL harus configurable:

APP_URL
API_URL
VERIFICATION_URL
STORAGE_URL.

Jangan hardcode domain.

============================================================
44. DEPLOYMENT DOCUMENTATION
============================================================

Buat:

DEPLOYMENT.md

Berisi:

Prerequisite
Environment
Database
Migration
Build
Deploy
Health Check
Backup
Restore
Rollback
Troubleshooting.

============================================================
45. OPERATIONS DOCUMENTATION
============================================================

Buat:

OPERATIONS_RUNBOOK.md

Berisi:

Server Down
Database Down
Storage Down
Queue Down
Redis Down
SMTP Down
High CPU
High Memory
Disk Full
Failed Migration
Failed Deployment.

============================================================
46. SECURITY CHECKLIST
============================================================

Sebelum production:

[ ] HTTPS
[ ] Secure Headers
[ ] CORS
[ ] Rate Limit
[ ] JWT Security
[ ] Password Hash
[ ] File Upload Security
[ ] SQL Injection Protection
[ ] XSS Protection
[ ] IDOR Protection
[ ] RBAC
[ ] Scope Isolation
[ ] Secret Management
[ ] Backup
[ ] Restore Test
[ ] Audit Log.

============================================================
47. SMOKE TEST
============================================================

Setelah deployment:

LOGIN
→ DASHBOARD
→ MASTER DATA
→ CREATE
→ UPDATE
→ DELETE
→ KBM
→ ATTENDANCE
→ ASSESSMENT
→ LEGER
→ RAPOR
→ PDF
→ DOCX
→ EXCEL
→ PRINT
→ NOTIFICATION
→ LOGOUT.

Jika satu critical flow gagal:

GO-LIVE GAGAL.

============================================================
48. PRODUCTION MONITORING
============================================================

Monitor:

CPU
Memory
Disk
Database
API latency
Error rate
5xx
Queue
Storage
Login failures
Database connections.

Buat threshold yang dapat dikonfigurasi.

============================================================
49. FINAL GO-LIVE GATE
============================================================

PRODUCTION READY hanya jika:

Critical Issue = 0
High Issue = 0
Build Error = 0
Migration Error = 0
Health Check = PASS
Smoke Test = PASS
Backup Test = PASS
Restore Test = PASS
Security Check = PASS
RBAC Test = PASS
CRUD Test = PASS
PDF Test = PASS
DOCX Test = PASS
Excel Test = PASS
Print Test = PASS
Mobile API Test = PASS.

============================================================
50. FINAL OUTPUT
============================================================

Setelah selesai buat laporan:

1. Environment Status
2. Database Status
3. Migration Status
4. Backend Status
5. Frontend Status
6. Flutter API Status
7. Storage Status
8. Queue Status
9. Redis Status
10. Notification Status
11. Document Engine Status
12. PDF Status
13. DOCX Status
14. Excel Status
15. Print Status
16. Security Status
17. Backup Status
18. Restore Status
19. Monitoring Status
20. Smoke Test Status
21. Remaining Risks
22. FINAL GO-LIVE STATUS.

Gunakan status:

PASS
FAIL
WARNING
NOT APPLICABLE.

Jangan menyatakan PASS tanpa benar-benar menjalankan pemeriksaan.

============================================================
FINAL COMMAND
============================================================

JANGAN HANYA MEMBUAT DOKUMENTASI.

LAKUKAN AUDIT DAN PERBAIKAN PADA CODEBASE.

JIKA ADA ERROR:
PERBAIKI.

JIKA ADA DUPLIKASI:
SATUKAN.

JIKA ADA RELASI DATABASE RUSAK:
PERBAIKI DENGAN MIGRATION AMAN.

JIKA ADA CRUD RUSAK:
PERBAIKI.

JIKA ADA API RUSAK:
PERBAIKI.

JIKA ADA PRINT RUSAK:
PERBAIKI.

JIKA ADA PDF/DOCX/EXCEL RUSAK:
PERBAIKI.

JIKA ADA RBAC RUSAK:
PERBAIKI.

JIKA ADA SECURITY ISSUE:
PERBAIKI.

JIKA ADA PERFORMANCE ISSUE:
PERBAIKI.

SETELAH PERBAIKAN:
JALANKAN REGRESSION TEST.

JANGAN BERHENTI PADA ANALISIS.

HASIL AKHIR:
APLIKASI SIAP DEPLOY DAN SIAP DIGUNAKAN UNTUK OPERASIONAL PRODUKSI NYATA.
============================================================
END
============================================================