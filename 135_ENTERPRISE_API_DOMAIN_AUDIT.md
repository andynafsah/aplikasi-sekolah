# 135_ENTERPRISE_API_DOMAIN_AUDIT.md

# ENTERPRISE API DOMAIN AUDIT
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: API AUDIT / DUPLICATE PREVENTION / BACKEND INTEGRITY

============================================================
1. OBJECTIVE
============================================================

Audit seluruh backend/API yang sudah ada.

Tujuan:

1. Menemukan seluruh endpoint.
2. Menemukan duplicate endpoint.
3. Menemukan duplicate controller.
4. Menemukan duplicate service.
5. Menemukan duplicate repository.
6. Menemukan duplicate validation.
7. Menemukan duplicate business logic.
8. Menemukan API legacy.
9. Menemukan API akademik yang masih tersisa.
10. Memastikan frontend menggunakan API yang benar.
11. Memastikan RBAC diterapkan di backend.
12. Memastikan API production-safe.

============================================================
2. ABSOLUTE RULE
============================================================

JANGAN membuat endpoint baru
sebelum melakukan:

ROUTE SCAN
↓
CONTROLLER SCAN
↓
SERVICE SCAN
↓
MODEL SCAN
↓
DATABASE SCAN
↓
FRONTEND API USAGE SCAN
↓
DUPLICATE DETECTION
↓
DEPENDENCY ANALYSIS

============================================================
3. API DOMAIN
============================================================

API resmi hanya mencakup:

/dashboard

/master-data

/students

/guardians

/employees

/attendance

/student-cards

/letters

/documents

/archives

/inventory

/finance

/notifications

/reports

/audit

/settings

/auth

/users

/roles

/permissions

============================================================
4. FORBIDDEN API DOMAIN
============================================================

JANGAN membuat endpoint:

/academic
/akademik
/kbm
/curriculum
/kurikulum
/subjects
/lessons
/assessment
/assessments
/grades
/nilai
/kkm
/leger
/report-card
/rapor
/transcript

Domain tersebut berada
di aplikasi KBM/LEGER terpisah.

============================================================
5. ROUTE INVENTORY
============================================================

Scan seluruh:

routes
controllers
modules
services
API files.

Output:

METHOD
PATH
CONTROLLER
SERVICE
AUTH
PERMISSION
STATUS

Contoh:

GET
/api/students

StudentController@index

StudentService

permission:
student.view

============================================================
6. HTTP METHOD AUDIT
============================================================

Pastikan penggunaan:

GET
POST
PUT/PATCH
DELETE

sesuai fungsi.

Jangan menggunakan:

POST untuk seluruh operasi
tanpa alasan.

============================================================
7. ROUTE DUPLICATE AUDIT
============================================================

Cari:

GET /students
GET /student
GET /students/list

jika ketiganya melakukan
fungsi yang sama.

Jangan mempertahankan
duplicate endpoint tanpa
alasan yang jelas.

============================================================
8. CONTROLLER AUDIT
============================================================

Controller harus fokus
pada HTTP layer.

Controller:

VALIDATE REQUEST
↓
CALL SERVICE
↓
RETURN RESPONSE

Jangan memasukkan
business logic kompleks
langsung ke controller.

============================================================
9. SERVICE AUDIT
============================================================

Business logic harus
berada di service/domain layer
sesuai architecture existing.

Contoh:

StudentService
AttendanceService
EmployeeService
LetterService
DocumentService

Jangan membuat:

StudentManager
StudentHandler
StudentProcessor
StudentService

untuk business logic
yang sama tanpa alasan.

============================================================
10. REPOSITORY AUDIT
============================================================

Jika architecture menggunakan
repository:

Repository bertanggung jawab
terhadap data access.

Jangan membuat dua repository
untuk entity yang sama
tanpa alasan.

============================================================
11. MODEL AUDIT
============================================================

Pastikan:

MODEL
↓
TABLE
↓
RELATION
↓
SERVICE
↓
API

konsisten.

============================================================
12. REQUEST VALIDATION
============================================================

Setiap input wajib
divalidasi.

Contoh:

student.create
student.update
attendance.create
letter.create
document.upload

Validation harus berada
di backend.

Frontend validation
BUKAN security boundary.

============================================================
13. RESPONSE STANDARD
============================================================

Gunakan response format
yang konsisten.

Contoh:

{
  "success": true,
  "message": "...",
  "data": {},
  "meta": {}
}

Error:

{
  "success": false,
  "message": "...",
  "errors": {}
}

Jangan mengubah format
secara sembarangan antar module.

============================================================
14. HTTP STATUS
============================================================

Gunakan status code
secara benar.

200
GET success

201
CREATE success

204
DELETE success jika sesuai

400
Bad request

401
Unauthenticated

403
Forbidden

404
Not found

409
Conflict

422
Validation error

429
Rate limit

500
Internal error

============================================================
15. AUTHENTICATION AUDIT
============================================================

Semua protected API
harus memiliki authentication.

Flow:

REQUEST
↓
AUTHENTICATION
↓
USER
↓
ROLE
↓
PERMISSION
↓
BUSINESS LOGIC

============================================================
16. RBAC AUDIT
============================================================

Jangan hanya melakukan
permission checking di frontend.

Backend harus memeriksa:

user
role
permission
resource
action.

============================================================
17. MASTER DATA API
============================================================

Audit:

/institutions
/units
/students
/guardians
/employees
/positions

Pastikan CRUD:

LIST
DETAIL
CREATE
UPDATE
DELETE

tersedia sesuai permission.

============================================================
18. STUDENT API
============================================================

Student API harus menjadi
single source of truth
untuk identitas siswa.

Contoh:

GET /students
GET /students/:id
POST /students
PUT /students/:id
DELETE /students/:id

Jika API tersebut sudah ada:

REUSE.

============================================================
19. EMPLOYEE API
============================================================

Gunakan satu engine
employee.

Contoh:

GET /employees
GET /employees/:id
POST /employees
PUT /employees/:id
DELETE /employees/:id

Teacher dan staff jangan
membuat API identitas
terpisah jika sebenarnya
berasal dari entity employee
yang sama.

============================================================
20. GUARDIAN API
============================================================

Guardian:

GET
POST
PUT
DELETE

Relationship:

Student
↕
Guardian

Pastikan tidak ada
duplicate guardian engine.

============================================================
21. ATTENDANCE API
============================================================

Attendance adalah
core API.

Methods:

QR
BARCODE
MANUAL
GPS

Contoh:

POST /attendance/student/scan
POST /attendance/student/manual

POST /attendance/employee/gps
POST /attendance/employee/scan

GET /attendance
GET /attendance/summary

Namun:

JIKA endpoint existing
sudah menyediakan fungsi
yang sama:

REUSE.

JANGAN membuat:

/attendance-v2
/attendance-new
/new-attendance

============================================================
22. QR ATTENDANCE API
============================================================

Flow:

POST
↓
SCAN
↓
IDENTIFY
↓
AUTHORIZATION
↓
VALIDATION
↓
DUPLICATE CHECK
↓
CREATE
↓
AUDIT
↓
RESPONSE

QR scan harus aman
terhadap double request.

============================================================
23. GPS ATTENDANCE API
============================================================

Request minimal:

employee_id
latitude
longitude
accuracy
timestamp
device_id

Backend:

VALIDATE USER
↓
VALIDATE EMPLOYEE
↓
VALIDATE LOCATION
↓
VALIDATE GEOFENCE
↓
VALIDATE TIME
↓
CHECK DUPLICATE
↓
SAVE
↓
AUDIT

Jangan percaya
nilai geofence dari frontend.

============================================================
24. MANUAL ATTENDANCE API
============================================================

Manual attendance
harus memiliki:

actor
target
date
status
reason

dan permission.

Contoh:

attendance.manual.create

============================================================
25. ATTENDANCE CORRECTION
============================================================

Perubahan absensi
setelah tersimpan
harus memiliki:

old_value
new_value
reason
actor
timestamp

Jangan langsung
overwrite tanpa audit.

============================================================
26. STUDENT CARD API
============================================================

Student Card:

GET
POST
PUT
DELETE

QR generation:

POST /student-cards/:id/qr

Print:

GET /student-cards/:id/print

Bulk:

POST /student-cards/bulk-print

Jangan membuat
QR engine kedua.

============================================================
27. LETTER API
============================================================

Letter:

GET
POST
PUT
DELETE

Template:

GET
POST
PUT
DELETE

Numbering:

GET
POST

Approval:

POST /letters/:id/approve

Print:

GET /letters/:id/pdf
GET /letters/:id/docx

Jika engine sudah ada:

REUSE.

============================================================
28. DOCUMENT API
============================================================

Support:

upload
list
detail
download
preview
update metadata
archive
restore
delete

File authorization
wajib diperiksa
di backend.

============================================================
29. INVENTORY API
============================================================

Audit:

assets
categories
locations
borrowings
maintenance
mutation

Pastikan seluruh transaksi
inventaris mempunyai
audit trail.

============================================================
30. FINANCE API
============================================================

Jangan membuat finance
engine baru jika existing
sudah tersedia.

Audit:

transactions
cash
bank
income
expense
budget
payment
payroll
BKU
SPJ

============================================================
31. REPORT API
============================================================

Reports harus:

GET
FILTER
DATE RANGE
EXPORT

Data harus berasal
dari database.

DILARANG:

hardcoded report.

============================================================
32. NOTIFICATION API
============================================================

Notification harus
memiliki:

recipient
type
title
message
read_at
created_at

Jangan membuat
multiple notification engine.

============================================================
33. AUDIT API
============================================================

Audit log:

GET

dengan:

filter
date
user
module
action
entity

Audit log tidak boleh
dapat diedit oleh user biasa.

============================================================
34. PAGINATION
============================================================

List API harus mendukung
pagination untuk dataset besar.

Contoh:

?page=1
&per_page=25

Response:

data
current_page
per_page
total
last_page

============================================================
35. SEARCH
============================================================

Gunakan server-side search
untuk dataset besar.

Contoh:

GET /students?search=ahmad

============================================================
36. FILTER
============================================================

Support filter sesuai
module.

Contoh:

/students?unit_id=1
/students?status=active

/attendance?date=2026-08-17

============================================================
37. SORTING
============================================================

Sorting harus aman.

Jangan memasukkan
raw SQL dari query user.

Gunakan whitelist
kolom yang diperbolehkan.

============================================================
38. RATE LIMIT
============================================================

Sensitive API:

LOGIN
QR SCAN
GPS ATTENDANCE
PASSWORD
OTP

harus memiliki
rate limiting sesuai
kebutuhan.

============================================================
39. FILE UPLOAD API
============================================================

Validate:

MIME
extension
size
filename
storage location

Jangan percaya extension
saja.

============================================================
40. ERROR HANDLING
============================================================

Backend harus menangani:

validation error
authorization error
database error
network error
external API error
file error
duplicate transaction.

Production:

JANGAN mengirim:

stack trace
SQL query
database credentials
filesystem path
secret.

============================================================
41. TRANSACTION
============================================================

Gunakan database transaction
untuk operasi multi-step.

Contoh:

Create Student
+
Guardian
+
QR
+
Document

Jika gagal:

ROLLBACK.

============================================================
42. IDEMPOTENCY
============================================================

Operasi penting harus
aman terhadap duplicate request.

Terutama:

QR attendance
GPS attendance
payment
financial transaction
letter numbering.

============================================================
43. CONCURRENCY
============================================================

Backend harus menangani
dua request bersamaan.

Contoh:

dua device scan
kartu siswa yang sama
dalam waktu hampir bersamaan.

Hanya satu transaksi
yang boleh berhasil
jika business rule
mengharuskannya.

============================================================
44. API AUTHORIZATION
============================================================

Contoh:

Security:

attendance.scan

Guru:

attendance.student.scan

TU:

attendance.correct

Bendahara:

finance.*

User biasa:

tidak boleh mengakses
API admin.

============================================================
45. API VERSIONING
============================================================

Jika API sudah digunakan
production:

Jangan merusak contract
secara sembarangan.

Jika diperlukan:

/api/v1

Kemudian perubahan besar:

/api/v2

Tetapi jangan membuat
version baru hanya untuk
menghindari refactoring.

============================================================
46. FRONTEND API USAGE AUDIT
============================================================

Scan seluruh frontend.

Cari:

axios
fetch
React Query
TanStack Query
API hooks
services
repositories.

Petakan:

PAGE
→ HOOK
→ API
→ SERVICE
→ DATABASE

============================================================
47. QUERY CLIENT AUDIT
============================================================

Jika menggunakan
TanStack Query:

Pastikan hanya ada
QueryClientProvider
yang benar pada root.

JANGAN membuat
QueryClient lokal
di setiap page/component.

Periksa error:

"No QueryClient set"

Jika ditemukan:

audit provider hierarchy.

============================================================
48. API HOOK DUPLICATE
============================================================

Cari:

useStudents
useStudent
useStudentList
useStudentsQuery

Jika beberapa hook
mengakses endpoint yang sama:

REFACTOR/CONSOLIDATE.

Jangan langsung membuat
hook baru.

============================================================
49. API SERVICE DUPLICATE
============================================================

Cari:

studentApi
studentService
studentClient
studentRepository

Jika fungsi sama:

tentukan satu abstraction
resmi.

============================================================
50. CACHE AUDIT
============================================================

Pastikan cache tidak
menghasilkan stale data
setelah:

CREATE
UPDATE
DELETE.

Invalidate cache/query
sesuai kebutuhan.

============================================================
51. API CONTRACT AUDIT
============================================================

Frontend dan backend
harus sepakat:

field name
data type
nullable
enum
pagination
error format.

Contoh:

Backend:

student_name

Frontend tidak boleh
menganggap:

name_student

tanpa transformation
yang jelas.

============================================================
52. SERIALIZATION
============================================================

Pastikan:

date
datetime
decimal
boolean
null
enum

memiliki format
yang konsisten.

============================================================
53. DATE/TIME
============================================================

Attendance sangat sensitif.

Tetapkan:

timezone
storage format
display format.

Jangan mencampur
timezone server
dengan timezone client
tanpa aturan.

============================================================
54. API LOGGING
============================================================

Log:

request_id
user
route
method
status
duration

Jangan log:

password
token
secret
sensitive document data.

============================================================
55. API OBSERVABILITY
============================================================

Monitor:

error rate
latency
5xx
4xx
failed attendance
failed QR
failed GPS
database errors.

============================================================
56. API DEPRECATION
============================================================

Jika endpoint legacy
sudah tidak digunakan:

MARK:

DEPRECATED

Kemudian:

SEARCH USAGE
↓
MIGRATE CLIENT
↓
MONITOR
↓
REMOVE

Jangan langsung delete.

============================================================
57. ACADEMIC API AUDIT
============================================================

Scan seluruh endpoint
untuk keyword:

academic
akademik
kbm
curriculum
subject
lesson
assessment
grade
nilai
kkm
leger
rapor

Jika ditemukan:

CLASSIFY.

ACTIVE
LEGACY
EXTERNAL INTEGRATION
DUPLICATE
UNUSED

============================================================
58. EXTERNAL LEGER/KBM INTEGRATION
============================================================

Jika Management membutuhkan
data dari aplikasi Leger/KBM:

Gunakan:

Integration Service.

Flow:

MANAGEMENT
↓
API CLIENT
↓
AUTHENTICATION
↓
EXTERNAL API
↓
VALIDATION
↓
CACHE/SYNC
↓
INTEGRATION LOG

Jangan memasukkan
academic business logic
ke Management API.

============================================================
59. API SECURITY TEST
============================================================

Test:

unauthenticated request
unauthorized request
wrong role
wrong permission
invalid ID
invalid payload
SQL injection
file upload abuse
rate limit
duplicate request.

============================================================
60. API CRUD TEST
============================================================

Untuk setiap module:

CREATE
↓
READ
↓
UPDATE
↓
DELETE
↓
VERIFY DATABASE
↓
VERIFY FRONTEND
↓
VERIFY AUDIT

============================================================
61. API DUPLICATE REPORT
============================================================

Output:

ENDPOINT A
ENDPOINT B
FUNCTION
CONTROLLER
SERVICE
FRONTEND USAGE
STATUS
RECOMMENDATION

============================================================
62. CONTROLLER DUPLICATE REPORT
============================================================

Output:

Controller
Function
Duplicate
Used By
Recommendation

============================================================
63. SERVICE DUPLICATE REPORT
============================================================

Output:

Service
Entity
Function
Duplicate
Used By
Recommendation

============================================================
64. API HEALTH REPORT
============================================================

Output:

TOTAL ENDPOINTS
ACTIVE
LEGACY
DUPLICATE
ACADEMIC
UNUSED
BROKEN
UNAUTHORIZED
MISSING VALIDATION

============================================================
65. FINAL API CHECKLIST
============================================================

[ ] Authentication
[ ] Authorization
[ ] RBAC
[ ] Validation
[ ] Error handling
[ ] Pagination
[ ] Search
[ ] Filter
[ ] Sorting
[ ] Rate limit
[ ] Transaction
[ ] Idempotency
[ ] Audit
[ ] Logging
[ ] Monitoring
[ ] API contract
[ ] No duplicate endpoint
[ ] No duplicate service
[ ] No duplicate controller
[ ] No academic API
[ ] No dummy API
[ ] No mock production API

============================================================
66. CRITICAL RULE
============================================================

JANGAN memperbaiki
frontend dengan membuat
endpoint duplicate.

JANGAN memperbaiki
backend dengan membuat
table duplicate.

JANGAN memperbaiki
database dengan membuat
model duplicate.

SEMUA PERBAIKAN HARUS
BERDASARKAN EXISTING
ARCHITECTURE.

============================================================
67. FINAL WORKFLOW
============================================================

REQUEST FEATURE
       ↓
SEARCH EXISTING API
       ↓
SEARCH EXISTING SERVICE
       ↓
SEARCH EXISTING MODEL
       ↓
SEARCH EXISTING DATABASE
       ↓
SEARCH FRONTEND USAGE
       ↓
REUSE
       ↓
EXTEND
       ↓
TEST
       ↓
DEPLOY

============================================================
68. FINAL COMMAND
============================================================

AUDIT FIRST.

DO NOT CREATE DUPLICATE API.

DO NOT CREATE DUPLICATE SERVICE.

DO NOT CREATE DUPLICATE CONTROLLER.

DO NOT CREATE DUPLICATE MODEL.

DO NOT CREATE ACADEMIC API.

DO NOT CREATE SECOND ATTENDANCE ENGINE.

DO NOT CREATE SECOND STUDENT ENGINE.

DO NOT CREATE SECOND EMPLOYEE ENGINE.

DO NOT CREATE SECOND DOCUMENT ENGINE.

DO NOT CREATE SECOND LETTER ENGINE.

REUSE EXISTING SYSTEM.

MAKE ONLY NECESSARY CHANGES.

NO DUMMY.

NO SIMULATION.

NO HARDCODED PRODUCTION DATA.

PRODUCTION READY.

# END API DOMAIN AUDIT