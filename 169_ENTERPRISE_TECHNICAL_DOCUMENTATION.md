# 169 — ENTERPRISE TECHNICAL DOCUMENTATION

## MASTER PRODUCTION TECHNICAL DOCUMENTATION PROMPT

TUGAS INI ADALAH MEMBUAT DAN MEMVALIDASI
DOKUMENTASI TEKNIS FINAL UNTUK APLIKASI
MANAGEMENT SEKOLAH & PONDOK PESANTREN.

==================================================
1. TUJUAN
==================================================

Dokumentasi harus menjadi:

SINGLE SOURCE OF TRUTH

untuk:

ARCHITECTURE
DATABASE
BACKEND
FRONTEND
API
AUTHENTICATION
RBAC
MODULE
ATTENDANCE
QR
GPS
DOCUMENT
AUDIT
DEPLOYMENT
BACKUP
MONITORING
TROUBLESHOOTING.

==================================================
2. ATURAN UTAMA
==================================================

JANGAN MENAMBAHKAN FITUR BARU.

JANGAN MEMBUAT ENGINE BARU.

JANGAN MEMBUAT DATABASE DUPLIKAT.

JANGAN MEMBUAT API DUPLIKAT.

JANGAN MENDOKUMENTASIKAN
FITUR YANG TIDAK BENAR-BENAR ADA.

JANGAN MENGANGGAP FITUR ADA
HANYA KARENA ADA DI UI.

DOKUMENTASI HARUS BERDASARKAN
IMPLEMENTASI AKTUAL CODEBASE.

==================================================
3. SOURCE OF TRUTH
==================================================

Prioritas:

1. Database Schema
2. Backend Implementation
3. API Routes
4. Authorization Rules
5. Frontend Routes
6. UI Components
7. Configuration
8. Existing Documentation.

Jika dokumentasi berbeda
dengan code:

CODEBASE AKTUAL
MENJADI REFERENSI UTAMA.

==================================================
4. CODEBASE DISCOVERY
==================================================

SCAN SELURUH PROJECT.

Identifikasi:

frontend
backend
database
storage
authentication
authorization
services
repositories
controllers
models
routes
middleware
jobs
events
listeners
notifications
components
pages
hooks
utils
tests
configuration.

==================================================
5. TECHNOLOGY STACK
==================================================

Dokumentasikan stack
AKTUAL yang digunakan.

Jangan menebak.

Catat:

language
framework
database
ORM
frontend framework
build tool
authentication
cache
queue
storage
PDF engine
Word engine
deployment
monitoring.

==================================================
6. VERSION MATRIX
==================================================

Buat:

| Component | Version | Required | Notes |
|----------|---------|----------|-------|

Gunakan versi aktual
dari:

package.json
composer.json
lockfile
configuration
deployment.

==================================================
7. PROJECT STRUCTURE
==================================================

Dokumentasikan struktur
directory aktual.

Contoh:

/frontend
/backend
/database
/storage
/tests

HANYA jika benar-benar
ada.

==================================================
8. MODULE MAP
==================================================

Buat daftar:

MODULE
PURPOSE
ROUTES
DATABASE
SERVICES
PERMISSION
DEPENDENCY.

==================================================
9. CURRENT BUSINESS SCOPE
==================================================

Aplikasi ini:

MANAGEMENT SEKOLAH
&
PONDOK PESANTREN.

==================================================
10. EXCLUDED MODULE
==================================================

Jangan mendokumentasikan
KBM dan LEGER sebagai
module aktif apabila
memang telah dikeluarkan
dari aplikasi.

Jangan membuat asumsi
bahwa modul tersebut
masih aktif.

==================================================
11. CORE MODULE
==================================================

Dokumentasikan module
yang benar-benar aktif.

Contoh kategori:

ORGANIZATION
STUDENT
EMPLOYEE
USER
RBAC
ATTENDANCE
DOCUMENT
LETTER
ARCHIVE
REPORT
NOTIFICATION
AUDIT
SYSTEM CONFIGURATION.

Gunakan hasil scan
codebase aktual.

==================================================
12. MODULE DEPENDENCY
==================================================

Untuk setiap module:

MODULE
↓
DEPENDENCY
↓
DATABASE
↓
API
↓
UI.

==================================================
13. DATABASE ARCHITECTURE
==================================================

Dokumentasikan:

database engine
schema
tables
columns
primary key
foreign key
indexes
unique constraints
enums
relationships.

==================================================
14. DATABASE SOURCE OF TRUTH
==================================================

Database schema harus
menjadi sumber utama.

Jangan membuat dokumentasi
database berdasarkan
UI saja.

==================================================
15. ENTITY RELATIONSHIP
==================================================

Dokumentasikan relasi:

USER
EMPLOYEE
STUDENT
ORGANIZATION
UNIT
ATTENDANCE
QR
DEVICE
DOCUMENT
AUDIT.

Gunakan relasi aktual.

==================================================
16. RELATIONSHIP SAFETY
==================================================

Dokumentasikan:

CASCADE
RESTRICT
SET NULL
DELETE RULE.

Jika tidak tersedia,
jangan mengarang.

==================================================
17. DATABASE INDEX
==================================================

Dokumentasikan index
penting untuk:

authentication
student
employee
attendance
QR
GPS
document
audit.

==================================================
18. UNIQUE CONSTRAINT
==================================================

Identifikasi:

unique email
unique identifier
unique QR
unique document number

hanya jika memang
terdapat di schema.

==================================================
19. TRANSACTION
==================================================

Dokumentasikan operasi
yang menggunakan:

database transaction
locking
atomic operation.

==================================================
20. BACKEND ARCHITECTURE
==================================================

Dokumentasikan:

request
↓
middleware
↓
controller
↓
service
↓
repository/ORM
↓
database
↓
response.

Jika architecture
berbeda:

gunakan implementation
aktual.

==================================================
21. API DOCUMENTATION
==================================================

Untuk setiap API:

METHOD
ENDPOINT
AUTH
PERMISSION
REQUEST
VALIDATION
RESPONSE
ERROR.

==================================================
22. API TABLE
==================================================

Format:

| Method | Endpoint | Permission | Purpose |
|--------|----------|------------|---------|

==================================================
23. API SECURITY
==================================================

Dokumentasikan:

authentication
authorization
validation
rate limiting
CORS
CSRF jika applicable
input sanitization.

==================================================
24. AUTHENTICATION
==================================================

Dokumentasikan:

login
logout
refresh
session
password
verification
recovery.

Hanya fitur yang
benar-benar tersedia.

==================================================
25. PASSWORD
==================================================

Dokumentasikan:

hashing mechanism
password policy
reset mechanism.

Jangan dokumentasikan
password plaintext.

==================================================
26. RBAC
==================================================

Dokumentasikan:

ROLE
PERMISSION
RESOURCE
ACTION
SCOPE.

==================================================
27. ROLE MATRIX
==================================================

Buat matrix aktual:

| Role | Dashboard | Student | Employee | Attendance | Documents | Settings |
|------|-----------|---------|----------|------------|-----------|----------|

Isi berdasarkan
permission sebenarnya.

==================================================
28. SUPER ADMIN
==================================================

Dokumentasikan
pengaturan yang hanya
dapat diakses Super Admin.

==================================================
29. ROLE VISIBILITY
==================================================

Pastikan dokumentasi
menjelaskan:

USER TIDAK BOLEH
MELIHAT MENU YANG
TIDAK MEMILIKI PERMISSION.

==================================================
30. BACKEND AUTHORIZATION
==================================================

UI hiding bukan
security.

API harus tetap
memvalidasi permission.

==================================================
31. FRONTEND ARCHITECTURE
==================================================

Dokumentasikan:

routes
layouts
pages
components
hooks
state
API client
query management
form validation.

==================================================
32. FRONTEND ROUTING
==================================================

Untuk setiap route:

PATH
PAGE
ROLE
PERMISSION.

==================================================
33. ROUTE GUARD
==================================================

Dokumentasikan
mekanisme:

authentication guard
authorization guard.

==================================================
34. COMPONENT SYSTEM
==================================================

Dokumentasikan:

shared components
forms
tables
modals
dialogs
buttons
navigation.

==================================================
35. DESIGN SYSTEM
==================================================

Dokumentasikan:

typography
spacing
colors
forms
tables
buttons
responsive behavior.

Gunakan implementation
aktual.

==================================================
36. FORM VALIDATION
==================================================

Dokumentasikan:

client validation
server validation.

Server tetap menjadi
source of truth.

==================================================
37. API CLIENT
==================================================

Dokumentasikan:

base URL
authentication
headers
error handling
retry
refresh token.

==================================================
38. DATA FETCHING
==================================================

Jika menggunakan:

query
cache
mutation
pagination

dokumentasikan
implementasi aktual.

==================================================
39. PAGINATION
==================================================

Dokumentasikan:

page
limit
cursor

sesuai implementation.

==================================================
40. SEARCH
==================================================

Dokumentasikan
search behavior
setiap module.

==================================================
41. FILTER
==================================================

Dokumentasikan
filter yang tersedia.

==================================================
42. SORTING
==================================================

Dokumentasikan
sorting yang tersedia.

==================================================
43. BULK OPERATION
==================================================

Dokumentasikan:

bulk import
bulk update
bulk export

hanya jika tersedia.

==================================================
44. IMPORT
==================================================

Dokumentasikan:

CSV
Excel
format
validation
duplicate handling
rollback

jika tersedia.

==================================================
45. EXPORT
==================================================

Dokumentasikan:

Excel
CSV
PDF
Word

sesuai implementation.

==================================================
46. DOCUMENT ENGINE
==================================================

Dokumentasikan:

template
font
margin
paper size
orientation
header
footer
numbering.

==================================================
47. PDF ENGINE
==================================================

Dokumentasikan:

library
template
rendering
storage
download.

==================================================
48. WORD ENGINE
==================================================

Dokumentasikan:

library
template
rendering
download.

==================================================
49. DOCUMENT STORAGE
==================================================

Dokumentasikan:

storage path
naming
access control
download authorization.

==================================================
50. LETTER ENGINE
==================================================

Dokumentasikan:

kop
nomor surat
tanggal
penerima
isi
signature
attachment.

==================================================
51. ATTENDANCE ARCHITECTURE
==================================================

Dokumentasikan:

STUDENT ATTENDANCE
EMPLOYEE ATTENDANCE
QR
MANUAL
GPS

hanya jika aktif.

==================================================
52. STUDENT QR FLOW
==================================================

Dokumentasikan:

STUDENT
↓
QR
↓
SCAN
↓
VALIDATION
↓
ATTENDANCE
↓
AUDIT.

==================================================
53. SECURITY GATE FLOW
==================================================

SECURITY
↓
SCAN STUDENT QR
↓
VALIDATE STUDENT
↓
CREATE ATTENDANCE
↓
RESULT.

==================================================
54. TEACHER QR FLOW
==================================================

TEACHER
↓
SCAN
↓
VALIDATE
↓
ATTENDANCE.

==================================================
55. TEACHER MANUAL FLOW
==================================================

TEACHER
↓
SELECT STUDENT
↓
SELECT STATUS
↓
SUBMIT
↓
AUDIT.

==================================================
56. EMPLOYEE GPS FLOW
==================================================

EMPLOYEE
↓
GET LOCATION
↓
VALIDATE
↓
ATTENDANCE
↓
AUDIT.

==================================================
57. GPS VALIDATION
==================================================

Dokumentasikan:

latitude
longitude
accuracy
radius
geofence

hanya jika implementation
memang tersedia.

==================================================
58. QR SECURITY
==================================================

Dokumentasikan:

identifier
validation
revocation
replacement
duplicate prevention.

==================================================
59. ATTENDANCE DUPLICATE
==================================================

Dokumentasikan rule
yang mencegah duplicate
attendance.

==================================================
60. ATTENDANCE CORRECTION
==================================================

Dokumentasikan:

who
when
reason
approval
audit

jika tersedia.

==================================================
61. ATTENDANCE AUDIT
==================================================

Dokumentasikan:

actor
timestamp
method
student/employee
location
device

sesuai actual schema.

==================================================
62. CONFIGURATION
==================================================

Dokumentasikan seluruh
configuration yang
benar-benar tersedia.

==================================================
63. CONFIGURATION SCOPE
==================================================

SYSTEM
ORGANIZATION
UNIT
USER.

Hanya jika tersedia.

==================================================
64. CONFIGURATION SECURITY
==================================================

Dokumentasikan role
yang dapat mengubah
configuration.

==================================================
65. AUDIT ENGINE
==================================================

Dokumentasikan:

event
actor
target
timestamp
old value
new value

sesuai actual implementation.

==================================================
66. LOGGING
==================================================

Dokumentasikan:

application logs
error logs
security logs
audit logs.

==================================================
67. ERROR HANDLING
==================================================

Dokumentasikan:

validation error
authentication error
authorization error
not found
conflict
server error.

==================================================
68. ERROR RESPONSE
==================================================

Dokumentasikan format
response error aktual.

==================================================
69. SECURITY
==================================================

Dokumentasikan:

authentication
authorization
encryption
hashing
secret management
upload security
API security.

==================================================
70. FILE UPLOAD SECURITY
==================================================

Dokumentasikan:

allowed file types
size limits
validation
storage
access control.

==================================================
71. NOTIFICATION
==================================================

Dokumentasikan:

email
push
in-app

jika tersedia.

==================================================
72. QUEUE
==================================================

Dokumentasikan:

jobs
workers
retry
failed jobs.

==================================================
73. SCHEDULER
==================================================

Dokumentasikan:

scheduled tasks
frequency
purpose.

==================================================
74. CACHE
==================================================

Dokumentasikan:

cache provider
keys
TTL
invalidation.

==================================================
75. STORAGE
==================================================

Dokumentasikan:

local
object storage
public/private
retention.

==================================================
76. BACKUP
==================================================

Dokumentasikan:

database backup
file backup
schedule
retention
restore procedure.

==================================================
77. RESTORE
==================================================

Dokumentasikan:

backup selection
restore
verification
rollback.

==================================================
78. DEPLOYMENT
==================================================

Dokumentasikan:

development
staging
production

jika environment
tersebut memang ada.

==================================================
79. PRODUCTION DEPLOYMENT
==================================================

Flow:

BUILD
↓
TEST
↓
MIGRATION CHECK
↓
BACKUP
↓
DEPLOY
↓
HEALTH CHECK
↓
VERIFY.

==================================================
80. ENVIRONMENT VARIABLES
==================================================

Buat table:

| Variable | Purpose | Required | Secret |
|----------|---------|----------|--------|

Jangan menuliskan
nilai secret.

==================================================
81. DATABASE MIGRATION
==================================================

Dokumentasikan:

migration
rollback
seed
production safety.

==================================================
82. SEEDING
==================================================

Bedakan:

development seed
production seed.

Production seed
tidak boleh:

delete
truncate
overwrite
production data.

==================================================
83. HEALTH CHECK
==================================================

Dokumentasikan endpoint
atau mechanism:

application
database
cache
queue
storage.

==================================================
84. MONITORING
==================================================

Dokumentasikan:

availability
error
performance
database
queue
storage.

==================================================
85. ALERTING
==================================================

Dokumentasikan alert
yang benar-benar
tersedia.

==================================================
86. PERFORMANCE
==================================================

Dokumentasikan:

pagination
index
cache
query optimization
queue
lazy loading
batch processing.

==================================================
87. DATABASE PERFORMANCE
==================================================

Identifikasi query
yang kritis.

==================================================
88. N+1
==================================================

Audit dan dokumentasikan
solusi N+1 yang benar-benar
diterapkan.

==================================================
89. CONCURRENCY
==================================================

Dokumentasikan
transaction/locking
untuk operation kritis.

==================================================
90. IDEMPOTENCY
==================================================

Dokumentasikan endpoint
yang membutuhkan
idempotency.

Contoh:

attendance
payment
document numbering

jika applicable.

==================================================
91. DATA INTEGRITY
==================================================

Dokumentasikan:

foreign key
unique
validation
transaction
business rule.

==================================================
92. DATA LIFECYCLE
==================================================

Dokumentasikan:

CREATE
READ
UPDATE
ARCHIVE
DELETE

untuk data penting.

==================================================
93. DELETE POLICY
==================================================

Bedakan:

soft delete
hard delete
archive.

==================================================
94. HISTORICAL DATA
==================================================

Jangan menghapus
historical attendance
atau audit hanya
karena record utama
berubah.

==================================================
95. AUDIT TRAIL
==================================================

Dokumentasikan
historical traceability.

==================================================
96. TESTING
==================================================

Dokumentasikan:

unit test
integration test
API test
frontend test
E2E test

sesuai actual project.

==================================================
97. TEST MATRIX
==================================================

Minimal:

AUTH
RBAC
CRUD
ATTENDANCE
QR
GPS
DOCUMENT
IMPORT
EXPORT.

==================================================
98. PRODUCTION TEST
==================================================

Tidak boleh bergantung
pada:

dummy
mock
simulation

untuk menyatakan
production READY.

==================================================
99. TROUBLESHOOTING
==================================================

Buat:

PROBLEM
CAUSE
CHECK
SOLUTION.

==================================================
100. AUTH TROUBLESHOOTING
==================================================

Contoh kategori:

login gagal
token expired
permission denied
account inactive.

==================================================
101. ATTENDANCE TROUBLESHOOTING
==================================================

Kategori:

QR gagal
GPS gagal
duplicate attendance
network failure
device issue.

==================================================
102. DOCUMENT TROUBLESHOOTING
==================================================

Kategori:

PDF layout
Word layout
font
kop
nomor surat
download.

==================================================
103. DATABASE TROUBLESHOOTING
==================================================

Kategori:

connection
migration
query
constraint
timeout.

==================================================
104. DEPLOYMENT TROUBLESHOOTING
==================================================

Kategori:

build
environment
storage
queue
cache
database.

==================================================
105. DEVELOPER RULE
==================================================

Developer/AI yang
melanjutkan project
WAJIB:

READ DOCUMENTATION
↓
SCAN CODEBASE
↓
CHECK DATABASE
↓
CHECK EXISTING MODULE
↓
CHECK EXISTING API
↓
CHECK RBAC
↓
CHECK DUPLICATE
↓
ONLY THEN MODIFY.

==================================================
106. NO BLIND CODING
==================================================

Dilarang langsung
membuat code berdasarkan
permintaan tanpa
memeriksa existing
implementation.

==================================================
107. NO DUPLICATE FEATURE
==================================================

Sebelum membuat fitur:

SEARCH:

component
page
route
API
service
database
permission
configuration.

==================================================
108. NO DUPLICATE TABLE
==================================================

Sebelum migration:

cek apakah table
dengan fungsi yang sama
sudah tersedia.

==================================================
109. NO DUPLICATE API
==================================================

Sebelum membuat endpoint:

search endpoint existing.

==================================================
110. NO DUPLICATE COMPONENT
==================================================

Sebelum membuat UI:

search reusable component.

==================================================
111. CHANGE IMPACT ANALYSIS
==================================================

Setiap perubahan
harus mendokumentasikan:

MODULE
DEPENDENCY
DATABASE
API
UI
RBAC
TEST.

==================================================
112. BACKWARD COMPATIBILITY
==================================================

Perubahan tidak boleh
merusak API/module
existing tanpa migration
plan.

==================================================
113. DATABASE CHANGE
==================================================

Jika database berubah:

document:

migration
impact
rollback
data migration.

==================================================
114. API CHANGE
==================================================

Jika API berubah:

document:

old behavior
new behavior
compatibility
frontend impact.

==================================================
115. RBAC CHANGE
==================================================

Jika permission berubah:

update:

role matrix
API
UI
documentation.

==================================================
116. UI CHANGE
==================================================

Jika route/menu berubah:

update:

navigation
permission
documentation.

==================================================
117. DOCUMENT CHANGE
==================================================

Jika template berubah:

update:

template documentation
PDF
Word
preview.

==================================================
118. ATTENDANCE CHANGE
==================================================

Jika attendance berubah:

update:

QR
GPS
manual
database
audit
API
UI.

==================================================
119. VERSIONING
==================================================

Gunakan versioning
yang sesuai project.

==================================================
120. CHANGELOG
==================================================

Setiap release
harus mencatat:

added
changed
fixed
security.

==================================================
121. RELEASE NOTES
==================================================

Release note harus
menjelaskan perubahan
yang relevan bagi
operator.

==================================================
122. DEPRECATION
==================================================

Fitur deprecated harus:

marked
documented
migration path
removal plan.

==================================================
123. ARCHITECTURE DECISION
==================================================

Keputusan arsitektur
penting harus
didokumentasikan:

problem
decision
reason
impact.

==================================================
124. ADR
==================================================

Jika project menggunakan
ADR:

gunakan format existing.

==================================================
125. SECURITY DOCUMENTATION
==================================================

Dokumentasikan:

threat
mitigation
permission
secret
audit.

==================================================
126. PRIVACY
==================================================

Dokumentasikan data
sensitif yang diproses
dan aksesnya.

==================================================
127. PERSONAL DATA
==================================================

Student/employee data
harus hanya dapat
diakses sesuai
authorization.

==================================================
128. LOG PRIVACY
==================================================

Jangan memasukkan
password/token/secret
ke log.

==================================================
129. API LOG PRIVACY
==================================================

Request logging harus
menghindari secret
sensitive fields.

==================================================
130. DOCUMENT PRIVACY
==================================================

Dokumen pribadi
harus memiliki
authorization sebelum
download.

==================================================
131. DATA EXPORT SECURITY
==================================================

Export harus mengikuti
permission.

==================================================
132. ARCHIVE SECURITY
==================================================

Archive harus tetap
memiliki access control.

==================================================
133. PRODUCTION READINESS
==================================================

Dokumentasikan checklist:

DATABASE
AUTH
RBAC
CRUD
API
ATTENDANCE
QR
GPS
DOCUMENT
BACKUP
MONITORING
SECURITY.

==================================================
134. SYSTEM MAP
==================================================

Buat diagram:

USER
 ↓
FRONTEND
 ↓
API
 ↓
AUTH
 ↓
RBAC
 ↓
SERVICE
 ↓
DATABASE.

==================================================
135. ATTENDANCE MAP
==================================================

STUDENT
 ↓
QR
 ↓
VALIDATION
 ↓
ATTENDANCE
 ↓
DATABASE
 ↓
AUDIT.

EMPLOYEE
 ↓
GPS
 ↓
VALIDATION
 ↓
ATTENDANCE
 ↓
DATABASE
 ↓
AUDIT.

==================================================
136. DOCUMENT MAP
==================================================

USER
 ↓
TEMPLATE
 ↓
DOCUMENT ENGINE
 ↓
PDF/WORD
 ↓
STORAGE
 ↓
DOWNLOAD
 ↓
AUDIT.

==================================================
137. CONFIGURATION MAP
==================================================

ADMIN
 ↓
CONFIGURATION
 ↓
VALIDATION
 ↓
DATABASE
 ↓
CACHE INVALIDATION
 ↓
MODULE.

==================================================
138. FINAL CODEBASE AUDIT
==================================================

SCAN seluruh project.

Cari:

duplicate
unused
dead code
dummy
mock
simulation
hardcoded
localhost
test endpoint
broken route
broken API
missing permission
missing validation.

==================================================
139. DOCUMENTATION ACCURACY
==================================================

Jangan menulis:

"SUPPORTED"

jika implementation
tidak ditemukan.

Gunakan:

IMPLEMENTED
PARTIAL
NOT IMPLEMENTED
DEPRECATED.

==================================================
140. DOCUMENTATION STATUS
==================================================

Setiap module:

STATUS
VERSION
OWNER
DEPENDENCY
LAST VERIFIED.

==================================================
141. FINAL DOCUMENT INDEX
==================================================

Dokumentasi final
harus memiliki:

01 OVERVIEW
02 ARCHITECTURE
03 DATABASE
04 BACKEND
05 FRONTEND
06 API
07 AUTH
08 RBAC
09 MODULES
10 ATTENDANCE
11 QR
12 GPS
13 DOCUMENT
14 CONFIGURATION
15 AUDIT
16 DEPLOYMENT
17 BACKUP
18 MONITORING
19 TESTING
20 TROUBLESHOOTING
21 CHANGE MANAGEMENT.

==================================================
142. FINAL VALIDATION
==================================================

Pastikan dokumentasi
sesuai dengan:

CODE
DATABASE
API
UI
CONFIGURATION.

==================================================
143. CRITICAL FINDINGS
==================================================

Format:

MODULE:
DOCUMENTATION:
CODE:
DATABASE:
ISSUE:
IMPACT:
RISK:
ACTION:
STATUS.

==================================================
144. DOCUMENTATION RELEASE GATE
==================================================

Jika:

CODE DOCUMENTED
DATABASE DOCUMENTED
API DOCUMENTED
RBAC DOCUMENTED
ATTENDANCE DOCUMENTED
QR DOCUMENTED
GPS DOCUMENTED
DOCUMENT ENGINE DOCUMENTED
CONFIGURATION DOCUMENTED
DEPLOYMENT DOCUMENTED
BACKUP DOCUMENTED
TROUBLESHOOTING DOCUMENTED

maka:

TECHNICAL DOCUMENTATION
READY.

==================================================
145. FINAL COMMAND
==================================================

JANGAN MEMBUAT DOKUMENTASI
BERDASARKAN ASUMSI.

SCAN IMPLEMENTASI AKTUAL.

JIKA ADA PERBEDAAN
ANTARA DOKUMENTASI LAMA
DAN CODEBASE:

IDENTIFY
↓
VERIFY
↓
UPDATE
↓
MARK OLD DOCUMENTATION
↓
SINGLE SOURCE OF TRUTH.

==================================================
146. FINAL OUTPUT
==================================================

Tampilkan:

1. SYSTEM OVERVIEW
2. TECHNOLOGY STACK
3. PROJECT STRUCTURE
4. MODULE MAP
5. DATABASE ARCHITECTURE
6. API MAP
7. AUTHENTICATION
8. RBAC MATRIX
9. ATTENDANCE ARCHITECTURE
10. QR ARCHITECTURE
11. GPS ARCHITECTURE
12. DOCUMENT ENGINE
13. CONFIGURATION
14. AUDIT
15. SECURITY
16. DEPLOYMENT
17. BACKUP
18. MONITORING
19. TESTING
20. TROUBLESHOOTING
21. DUPLICATE FINDINGS
22. HARDCODE FINDINGS
23. PRODUCTION RISKS
24. DOCUMENTATION GAPS
25. FINAL STATUS.

# END OF 169