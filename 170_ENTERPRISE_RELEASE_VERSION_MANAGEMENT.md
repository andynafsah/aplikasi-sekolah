# 170 — ENTERPRISE RELEASE & VERSION MANAGEMENT

## MASTER PRODUCTION RELEASE MANAGEMENT PROMPT

TUGAS INI UNTUK MEMBANGUN DAN MEMVALIDASI
SISTEM RELEASE MANAGEMENT APLIKASI
MANAGEMENT SEKOLAH & PONDOK PESANTREN.

==================================================
1. TUJUAN
==================================================

Memastikan setiap perubahan:

CODE
DATABASE
API
UI
RBAC
CONFIGURATION
DOCUMENT
ATTENDANCE
QR
GPS

dapat dirilis ke production
secara aman, terukur,
tercatat, dan dapat
di-rollback.

==================================================
2. ATURAN UTAMA
==================================================

JANGAN DEPLOY CODE
YANG BELUM DIUJI.

JANGAN MIGRATE DATABASE
TANPA BACKUP.

JANGAN MENGHAPUS DATA
PRODUCTION TANPA MIGRATION PLAN.

JANGAN MENGUBAH API
SECARA BREAKING TANPA
MIGRATION PLAN.

JANGAN MENGUBAH RBAC
TANPA REGRESSION TEST.

JANGAN MENGUBAH ATTENDANCE
TANPA TEST QR/GPS/MANUAL.

JANGAN MEMBUAT FITUR DUPLIKAT.

JANGAN MEMASUKKAN:

DUMMY
MOCK
SIMULATION
DEMO DATA

KE PRODUCTION.

==================================================
3. RELEASE LIFECYCLE
==================================================

FLOW:

DEVELOPMENT
↓
CODE REVIEW
↓
AUTOMATED TEST
↓
INTEGRATION TEST
↓
STAGING
↓
STAGING VALIDATION
↓
BACKUP
↓
DATABASE MIGRATION CHECK
↓
PRODUCTION DEPLOY
↓
HEALTH CHECK
↓
SMOKE TEST
↓
MONITORING
↓
RELEASE COMPLETE.

==================================================
4. ENVIRONMENT
==================================================

Pisahkan environment
sesuai yang benar-benar
digunakan:

DEVELOPMENT
STAGING
PRODUCTION.

Jika project hanya memiliki
DEVELOPMENT dan PRODUCTION:

JANGAN mengarang
environment STAGING.

==================================================
5. ENVIRONMENT ISOLATION
==================================================

Pastikan:

DATABASE
STORAGE
CACHE
QUEUE
EMAIL
API
DOMAIN

tidak salah menunjuk
ke environment lain.

==================================================
6. PRODUCTION DATABASE
==================================================

Production database
tidak boleh digunakan
untuk development
atau testing.

==================================================
7. STAGING DATABASE
==================================================

Jika staging tersedia:

gunakan database
terpisah.

==================================================
8. SECRET ISOLATION
==================================================

Secret setiap environment
harus berbeda.

Jangan menggunakan:

production secret
di development.

==================================================
9. VERSIONING
==================================================

Setiap production release
harus memiliki version
yang jelas.

Contoh:

v1.0.0
v1.0.1
v1.1.0

Gunakan versioning yang
konsisten dengan project.

==================================================
10. RELEASE TYPES
==================================================

### PATCH

Bug/security fix.

### MINOR

Backward-compatible
feature/improvement.

### MAJOR

Breaking change.

==================================================
11. RELEASE ID
==================================================

Setiap release harus
memiliki:

VERSION
DATE
COMMIT
CHANGELOG
MIGRATION
STATUS.

==================================================
12. CHANGELOG
==================================================

Format:

## Version

### Added
### Changed
### Fixed
### Security
### Database
### Breaking Changes

==================================================
13. CHANGE CLASSIFICATION
==================================================

Setiap perubahan
harus dikategorikan:

BUG FIX
FEATURE
IMPROVEMENT
SECURITY
DATABASE
CONFIGURATION
DOCUMENTATION.

==================================================
14. CHANGE IMPACT
==================================================

Sebelum release:

IDENTIFY
↓
DEPENDENCY
↓
IMPACT
↓
TEST
↓
RELEASE.

==================================================
15. MODULE IMPACT
==================================================

Jika mengubah:

STUDENT

cek:

USER
QR
ATTENDANCE
DOCUMENT
REPORT
AUDIT.

==================================================
16. ATTENDANCE IMPACT
==================================================

Jika mengubah
attendance:

cek:

STUDENT
EMPLOYEE
QR
MANUAL
GPS
DEVICE
AUDIT
REPORT.

==================================================
17. DOCUMENT IMPACT
==================================================

Jika mengubah
document engine:

cek:

LETTER
PDF
WORD
TEMPLATE
NUMBERING
ARCHIVE.

==================================================
18. RBAC IMPACT
==================================================

Jika mengubah permission:

cek:

ROLE
MENU
PAGE
API
ACTION.

==================================================
19. DATABASE IMPACT
==================================================

Jika mengubah schema:

cek:

MODEL
ORM
SERVICE
API
FRONTEND
REPORT
IMPORT
EXPORT.

==================================================
20. CODE REVIEW
==================================================

Sebelum merge:

review:

logic
security
validation
performance
database
authorization
error handling.

==================================================
21. AI CODE REVIEW
==================================================

AI/developer WAJIB
menjawab:

1. Apakah fitur ini
   sudah ada?

2. Apakah API ini
   sudah ada?

3. Apakah table ini
   sudah ada?

4. Apakah service ini
   sudah ada?

5. Apakah component ini
   sudah ada?

6. Apakah permission
   sudah ada?

7. Apakah configuration
   sudah ada?

==================================================
22. DUPLICATE CHECK
==================================================

Sebelum merge:

SCAN:

routes
controllers
services
repositories
models
tables
components
pages
hooks
permissions.

==================================================
23. DEAD CODE
==================================================

Identifikasi:

unused service
unused route
unused component
unused migration
unused configuration.

Jangan menghapus
tanpa dependency check.

==================================================
24. AUTOMATED TEST
==================================================

Jalankan test suite
yang tersedia.

Minimal cek:

AUTH
RBAC
CRUD
DATABASE
ATTENDANCE
QR
GPS
DOCUMENT.

==================================================
25. UNIT TEST
==================================================

Test:

business logic
validation
utility
service.

==================================================
26. INTEGRATION TEST
==================================================

Test:

API
database
authentication
authorization.

==================================================
27. E2E TEST
==================================================

Jika tersedia:

test workflow
end-to-end.

==================================================
28. REGRESSION TEST
==================================================

Setiap perubahan
harus menguji
fitur yang terdampak.

==================================================
29. ATTENDANCE REGRESSION
==================================================

Minimal:

STUDENT QR
SECURITY QR
TEACHER QR
TEACHER MANUAL
EMPLOYEE GPS.

==================================================
30. DOCUMENT REGRESSION
==================================================

Minimal:

LETTER
PDF
WORD
DOWNLOAD
ARCHIVE.

==================================================
31. RBAC REGRESSION
==================================================

Test:

SUPER ADMIN
ADMIN
TU
GURU
SECURITY
USER.

==================================================
32. DATABASE REGRESSION
==================================================

Test:

CRUD
FK
UNIQUE
INDEX
TRANSACTION.

==================================================
33. FRONTEND REGRESSION
==================================================

Test:

navigation
form
table
filter
search
pagination
modal
download.

==================================================
34. STAGING
==================================================

Jika staging tersedia:

deploy release candidate
ke staging.

==================================================
35. STAGING VALIDATION
==================================================

Pastikan:

application
database
storage
queue
cache
email

berfungsi.

==================================================
36. STAGING SMOKE TEST
==================================================

Minimal:

LOGIN
DASHBOARD
STUDENT
EMPLOYEE
ATTENDANCE
DOCUMENT.

==================================================
37. PRODUCTION BACKUP
==================================================

SEBELUM RELEASE:

backup database
backup critical files
sesuai kebutuhan.

==================================================
38. BACKUP VERIFICATION
==================================================

Jangan hanya membuat
backup.

Pastikan:

BACKUP CREATED
↓
BACKUP VALID
↓
RESTORE POSSIBLE.

==================================================
39. MIGRATION REVIEW
==================================================

Setiap migration:

review:

CREATE
ALTER
DROP
INDEX
FK
DATA MIGRATION.

==================================================
40. DESTRUCTIVE MIGRATION
==================================================

Jika migration
mengandung:

DROP COLUMN
DROP TABLE
DELETE DATA
RENAME

harus memiliki
migration plan.

==================================================
41. ZERO-DOWNTIME
==================================================

Jika deployment
memerlukan zero/minimal
downtime:

gunakan strategi
yang sesuai architecture.

Jangan mengklaim
zero-downtime jika
tidak tersedia.

==================================================
42. DATABASE COMPATIBILITY
==================================================

Pastikan versi
code lama dan baru
tidak mengalami
incompatibility selama
migration.

==================================================
43. ROLLBACK PLAN
==================================================

Setiap release
harus memiliki:

ROLLBACK CODE
ROLLBACK DATABASE
ROLLBACK CONFIGURATION

sesuai kebutuhan.

==================================================
44. CODE ROLLBACK
==================================================

Gunakan:

previous stable version.

==================================================
45. DATABASE ROLLBACK
==================================================

Jangan menjalankan
rollback migration
secara sembarangan.

Pastikan:

data impact
diperiksa dahulu.

==================================================
46. CONFIGURATION ROLLBACK
==================================================

Jika configuration
berubah:

catat old value.

==================================================
47. RELEASE CANDIDATE
==================================================

Sebelum production:

mark:

RELEASE CANDIDATE.

==================================================
48. RELEASE APPROVAL
==================================================

Production release
harus memiliki
approval sesuai
workflow organisasi.

==================================================
49. RELEASE CHECKLIST
==================================================

[ ] Code reviewed
[ ] Tests passed
[ ] Regression passed
[ ] Security checked
[ ] Database checked
[ ] Backup completed
[ ] Migration reviewed
[ ] Rollback prepared
[ ] Configuration checked
[ ] Release approved.

==================================================
50. PRODUCTION DEPLOY
==================================================

FLOW:

ENABLE MAINTENANCE
jika diperlukan
↓
BACKUP
↓
DEPLOY
↓
MIGRATE
↓
CACHE CLEAR/REFRESH
↓
QUEUE CHECK
↓
HEALTH CHECK
↓
SMOKE TEST.

==================================================
51. MAINTENANCE MODE
==================================================

Gunakan hanya jika
diperlukan.

Jangan mengaktifkan
maintenance mode
tanpa alasan.

==================================================
52. CACHE
==================================================

Setelah deployment:

invalidate cache
sesuai architecture.

Jangan sembarang
menghapus cache
yang dapat mengganggu
production.

==================================================
53. QUEUE
==================================================

Setelah deployment:

pastikan worker
menggunakan code
versi yang benar.

==================================================
54. SCHEDULER
==================================================

Pastikan scheduled
jobs tetap berjalan.

==================================================
55. STORAGE
==================================================

Pastikan deployment
tidak menghapus:

uploaded documents
photos
attachments
archives.

==================================================
56. HEALTH CHECK
==================================================

Periksa:

APPLICATION
DATABASE
CACHE
QUEUE
STORAGE.

==================================================
57. API HEALTH
==================================================

Pastikan endpoint
utama memberikan
response yang benar.

==================================================
58. AUTH HEALTH
==================================================

Test:

LOGIN
LOGOUT
SESSION
PERMISSION.

==================================================
59. ATTENDANCE HEALTH
==================================================

Test:

QR STUDENT
MANUAL STUDENT
GPS EMPLOYEE.

==================================================
60. DOCUMENT HEALTH
==================================================

Test:

PDF
WORD
DOWNLOAD.

==================================================
61. PRODUCTION SMOKE TEST
==================================================

Minimal:

1. Login
2. Dashboard
3. Student
4. Employee
5. Attendance
6. QR
7. GPS
8. Document
9. Report
10. Logout.

==================================================
62. PRODUCTION DATA
==================================================

Smoke test harus
berhati-hati agar
tidak membuat
record produksi
yang salah.

==================================================
63. TEST ACCOUNT
==================================================

Jika membutuhkan
production test account:

gunakan account
yang secara resmi
ditentukan untuk
testing.

Jangan membuat
dummy account
sembarangan.

==================================================
64. RELEASE MONITORING
==================================================

Setelah deployment:

monitor:

ERROR
LATENCY
DATABASE
QUEUE
STORAGE
LOGIN
ATTENDANCE.

==================================================
65. RELEASE WINDOW
==================================================

Release besar sebaiknya
dilakukan pada waktu
risiko operasional
rendah.

==================================================
66. ATTENDANCE RELEASE
==================================================

Jangan melakukan
perubahan kritis
pada attendance tepat
sebelum jam masuk
tanpa alasan mendesak
dan mitigasi.

==================================================
67. ROLLBACK TRIGGER
==================================================

Rollback jika:

critical error
data corruption
authentication failure
RBAC failure
attendance failure
database failure.

==================================================
68. ROLLBACK DECISION
==================================================

Evaluasi:

SEVERITY
IMPACT
DATA SAFETY
RECOVERY TIME.

==================================================
69. ROLLBACK EXECUTION
==================================================

STOP
↓
ASSESS
↓
BACKUP CURRENT STATE
jika aman
↓
ROLLBACK
↓
VERIFY
↓
MONITOR.

==================================================
70. DATA CORRUPTION
==================================================

Jika data corruption
terdeteksi:

STOP further writes
jika diperlukan
↓
IDENTIFY
↓
BACKUP CURRENT STATE
↓
RECOVER
↓
AUDIT.

==================================================
71. SECURITY INCIDENT
==================================================

Jika security issue:

ISOLATE
↓
REVOKE
↓
PATCH
↓
VERIFY
↓
AUDIT.

==================================================
72. HOTFIX
==================================================

Hotfix hanya untuk
critical issue.

Tetap harus:

review
test
backup
deploy
monitor.

==================================================
73. EMERGENCY RELEASE
==================================================

Emergency release
harus dicatat:

reason
severity
change
approval
result.

==================================================
74. RELEASE LOG
==================================================

Setiap deployment:

VERSION
DATE
ACTOR
COMMIT
ENVIRONMENT
RESULT.

==================================================
75. DEPLOYMENT AUDIT
==================================================

Catat:

who
when
what
from version
to version
result.

==================================================
76. CHANGELOG
==================================================

Jangan menghapus
history release.

==================================================
77. VERSION HISTORY
==================================================

Simpan:

version
release date
changes
migration
rollback
status.

==================================================
78. DEPRECATED VERSION
==================================================

Tentukan versi
yang sudah tidak
didukung.

==================================================
79. SECURITY PATCH
==================================================

Security patch
harus memiliki
prioritas tinggi.

==================================================
80. DEPENDENCY UPDATE
==================================================

Sebelum update
dependency:

check:

breaking changes
security
compatibility
runtime.

==================================================
81. LOCKFILE
==================================================

Jangan menghapus
lockfile tanpa alasan.

==================================================
82. BUILD REPRODUCIBILITY
==================================================

Pastikan production
build dapat direproduksi
dengan dependency
yang konsisten.

==================================================
83. CI/CD
==================================================

Jika CI/CD tersedia:

gunakan pipeline
existing.

Jangan membuat
pipeline kedua
tanpa kebutuhan.

==================================================
84. PIPELINE
==================================================

Ideal:

LINT
↓
TEST
↓
BUILD
↓
SECURITY CHECK
↓
DEPLOY.

==================================================
85. DEPLOYMENT PROTECTION
==================================================

Production deployment
harus memiliki
protection sesuai
capability platform.

==================================================
86. DATABASE MIGRATION PIPELINE
==================================================

Migration harus
dijalankan secara
terkontrol.

==================================================
87. MIGRATION LOCK
==================================================

Hindari dua migration
berjalan bersamaan.

==================================================
88. RELEASE ARTIFACT
==================================================

Release dapat
memiliki:

build artifact
migration
changelog
release notes.

==================================================
89. ARTIFACT INTEGRITY
==================================================

Pastikan artifact
yang di-deploy
adalah artifact
yang diuji.

==================================================
90. VERSION DISPLAY
==================================================

Jika aplikasi
menampilkan version:

gunakan version
release aktual.

==================================================
91. SYSTEM INFORMATION
==================================================

Authorized admin
dapat melihat:

version
environment
build
database version

sesuai security policy.

==================================================
92. USER VERSION
==================================================

User biasa tidak
perlu melihat
informasi sensitif
system.

==================================================
93. FEATURE FLAGS
==================================================

Jika feature flag
tersedia:

gunakan untuk
controlled rollout.

==================================================
94. FEATURE FLAG RULE
==================================================

Feature flag tidak
boleh menjadi pengganti
permission.

==================================================
95. CANARY RELEASE
==================================================

Gunakan hanya jika
architecture mendukung.

Jangan mengklaim
canary release jika
tidak tersedia.

==================================================
96. BLUE-GREEN
==================================================

Gunakan hanya jika
deployment infrastructure
mendukung.

==================================================
97. ROLLBACK TIME
==================================================

Catat:

detection time
decision time
rollback time
recovery time.

==================================================
98. POST-RELEASE
==================================================

Setelah release:

MONITOR
↓
VERIFY
↓
DOCUMENT.

==================================================
99. POST-RELEASE REVIEW
==================================================

Review:

errors
performance
user reports
database
attendance.

==================================================
100. RELEASE INCIDENT
==================================================

Jika ada incident:

VERSION
TIME
SYMPTOM
ROOT CAUSE
FIX
IMPACT
PREVENTION.

==================================================
101. RELEASE METRICS
==================================================

Jika monitoring tersedia:

error rate
latency
availability
failed jobs
API failures.

==================================================
102. DATABASE PERFORMANCE
==================================================

Setelah migration:

cek:

slow query
index
locks
connection pool.

==================================================
103. API PERFORMANCE
==================================================

Bandingkan:

before
after.

==================================================
104. FRONTEND PERFORMANCE
==================================================

Periksa:

build
bundle
loading
API requests.

==================================================
105. MOBILE/DEVICE
==================================================

Untuk attendance device:

pastikan:

QR scanner
camera
GPS
network
authentication

berfungsi setelah release.

==================================================
106. DOCUMENT PRINT
==================================================

Pastikan release
tidak merusak:

PDF
Word
print
download.

==================================================
107. BACKWARD COMPATIBILITY
==================================================

Jika user belum
memperbarui client:

API harus tetap
compatible jika
memang diperlukan.

==================================================
108. MOBILE API
==================================================

Jika mobile application
menggunakan API:

perhatikan:

API version
authentication
response compatibility.

==================================================
109. API VERSIONING
==================================================

Jika API versioning
digunakan:

ikuti implementation
existing.

==================================================
110. BREAKING CHANGE
==================================================

Breaking change
harus:

documented
announced
migrated
tested.

==================================================
111. DATA MIGRATION
==================================================

Jika release
memerlukan data migration:

document:

source
target
transformation
validation
rollback.

==================================================
112. MIGRATION VALIDATION
==================================================

Setelah migration:

COUNT
RELATION
NULL
DUPLICATE
INTEGRITY.

==================================================
113. DATA COUNT
==================================================

Bandingkan:

before
after.

==================================================
114. DATA INTEGRITY
==================================================

Pastikan tidak ada:

orphan
duplicate
broken FK.

==================================================
115. PRODUCTION LOCK
==================================================

Selama critical
migration:

batasi operation
yang dapat
mengganggu consistency.

==================================================
116. RELEASE DOCUMENTATION
==================================================

Setiap release
harus menghasilkan:

CHANGELOG
RELEASE NOTES
MIGRATION NOTES
ROLLBACK NOTES.

==================================================
117. OPERATOR NOTES
==================================================

Jika perubahan
mempengaruhi TU/Guru/
Security:

buat operational note.

==================================================
118. USER IMPACT
==================================================

Dokumentasikan:

WHAT CHANGED
WHO AFFECTED
WHAT TO DO.

==================================================
119. TRAINING IMPACT
==================================================

Jika UI berubah:

perbarui SOP/training.

==================================================
120. DOCUMENTATION SYNC
==================================================

Setelah release:

update:

technical docs
SOP
API docs
module docs.

==================================================
121. NO STALE DOCUMENTATION
==================================================

Dokumentasi lama
harus:

updated
atau
marked deprecated.

==================================================
122. RELEASE SECURITY
==================================================

Sebelum release:

dependency scan
secret scan
permission review.

==================================================
123. SECRET SCAN
==================================================

Pastikan tidak ada:

API key
password
token
private key

di source code.

==================================================
124. DEBUG MODE
==================================================

Production:

DEBUG OFF.

==================================================
125. ERROR EXPOSURE
==================================================

Production tidak boleh
menampilkan:

stack trace
SQL error detail
secret
internal path.

==================================================
126. CORS
==================================================

Production CORS
harus sesuai domain
yang diizinkan.

==================================================
127. RATE LIMIT
==================================================

Pastikan endpoint
sensitif memiliki
protection jika
engine tersedia.

==================================================
128. AUTHENTICATION RELEASE
==================================================

Setelah release:

test login.

==================================================
129. RBAC RELEASE
==================================================

Setelah release:

test role.

==================================================
130. ATTENDANCE RELEASE
==================================================

Setelah release:

test:

SECURITY QR
TEACHER QR
TEACHER MANUAL
EMPLOYEE GPS.

==================================================
131. DOCUMENT RELEASE
==================================================

Test:

PDF
WORD
LETTER
NUMBERING.

==================================================
132. FINAL RELEASE GATE
==================================================

RELEASE = GO

hanya jika:

[ ] Tests PASS
[ ] Regression PASS
[ ] Security PASS
[ ] Database PASS
[ ] Backup PASS
[ ] Migration PASS
[ ] RBAC PASS
[ ] Attendance PASS
[ ] QR PASS
[ ] GPS PASS
[ ] Document PASS
[ ] Health PASS
[ ] Rollback READY.

==================================================
133. RELEASE = NO-GO
==================================================

NO-GO jika terdapat:

CRITICAL BUG
DATA CORRUPTION
AUTH FAILURE
RBAC FAILURE
ATTENDANCE FAILURE
DATABASE FAILURE
SECURITY VULNERABILITY.

==================================================
134. FINAL RELEASE REPORT
==================================================

Tampilkan:

VERSION:
ENVIRONMENT:
DATE:
COMMIT:
DATABASE MIGRATION:
BACKUP:
TEST:
REGRESSION:
SECURITY:
DEPLOYMENT:
SMOKE TEST:
MONITORING:
ROLLBACK PLAN:
STATUS:

==================================================
135. CRITICAL FINDINGS
==================================================

Format:

RELEASE:
MODULE:
ISSUE:
SEVERITY:
IMPACT:
ROOT CAUSE:
ACTION:
STATUS.

==================================================
136. FINAL COMMAND
==================================================

AUDIT SELURUH CODEBASE
SEBELUM RELEASE.

JANGAN DEPLOY HANYA
KARENA BUILD BERHASIL.

BUILD SUCCESS
≠
PRODUCTION READY.

Validasi:

CODE
↓
DATABASE
↓
API
↓
RBAC
↓
UI
↓
BUSINESS LOGIC
↓
ATTENDANCE
↓
QR
↓
GPS
↓
DOCUMENT
↓
AUDIT
↓
BACKUP
↓
MONITORING.

==================================================
137. FINAL PRODUCTION PRINCIPLE
==================================================

SETIAP RELEASE HARUS:

SAFE
TRACEABLE
REVERSIBLE
TESTED
DOCUMENTED
AUDITED.

==================================================
138. FINAL OUTPUT
==================================================

Jangan hanya mengatakan:

"Release berhasil."

Tampilkan:

1. VERSION
2. CHANGE SUMMARY
3. MODULE IMPACT
4. DATABASE IMPACT
5. API IMPACT
6. RBAC IMPACT
7. ATTENDANCE IMPACT
8. DOCUMENT IMPACT
9. TEST RESULT
10. SECURITY RESULT
11. BACKUP RESULT
12. MIGRATION RESULT
13. DEPLOYMENT RESULT
14. SMOKE TEST
15. MONITORING RESULT
16. ROLLBACK PLAN
17. CRITICAL FINDINGS
18. GO/NO-GO
19. FINAL STATUS.

# END OF 170