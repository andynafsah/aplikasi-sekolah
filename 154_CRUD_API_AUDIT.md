# 154_CRUD_API_AUDIT.md

MODE: CRUD + API AUDIT
PRIORITY: PRODUCTION STABILITY

==================================================
OBJECTIVE
==================================================

Audit seluruh CRUD dan API existing.

FLOW WAJIB:

UI
→ FORM
→ VALIDATION
→ API
→ AUTH
→ CONTROLLER
→ SERVICE
→ DATABASE
→ RESPONSE
→ UI UPDATE

Jangan membuat endpoint baru
sebelum mencari endpoint existing.

==================================================
1. SCAN EXISTING
==================================================

Cari seluruh:

routes
controllers
services
repositories
models
schemas
API clients
hooks
queries
mutations
forms
pages.

Buat mapping:

PAGE
→ API
→ SERVICE
→ TABLE.

==================================================
2. DUPLICATE API
==================================================

Cari endpoint dengan
fungsi yang sama.

Contoh:

GET /students
GET /student-list
GET /student-data

Jika fungsinya sama:

gunakan satu endpoint
canonical.

==================================================
3. CRUD MATRIX
==================================================

Untuk setiap module:

CREATE
READ
UPDATE
DELETE

Catat:

UI
API
Backend
Database
Status.

==================================================
4. CREATE AUDIT
==================================================

Test:

valid data
required field
invalid field
duplicate data
unauthorized request
database failure.

Pastikan:

success
error
validation
rollback.

==================================================
5. READ AUDIT
==================================================

Test:

list
detail
search
filter
sort
pagination
empty state.

Pastikan tidak terjadi:

N+1
duplicate request
infinite request.

==================================================
6. UPDATE AUDIT
==================================================

Test:

valid
invalid
duplicate
unauthorized
non-existent ID.

Pastikan UI langsung
mendapatkan state terbaru
sesuai architecture.

==================================================
7. DELETE AUDIT
==================================================

Test:

authorized
unauthorized
related data
soft delete
restore jika tersedia.

==================================================
8. API VALIDATION
==================================================

Backend wajib melakukan
validation.

Jangan hanya percaya
validation frontend.

==================================================
9. AUTHENTICATION
==================================================

Test:

valid token
expired token
invalid token
no token.

==================================================
10. AUTHORIZATION
==================================================

Test setiap role.

Frontend hiding menu
BUKAN security.

Backend harus menolak
request unauthorized.

==================================================
11. RESPONSE CONTRACT
==================================================

Pastikan frontend dan
backend menggunakan
response format existing.

Jangan membuat format
response kedua.

==================================================
12. ERROR CONTRACT
==================================================

Pastikan konsisten:

400
401
403
404
409
422
429
500.

==================================================
13. QUERY CLIENT
==================================================

WAJIB audit:

QueryClientProvider
useQuery
useMutation
queryClient.

Semua React Query
harus memiliki provider.

ERROR berikut wajib
hilang:

No QueryClient set,
use QueryClientProvider
to set one

Jangan membuat provider
per halaman.

Gunakan root provider.

==================================================
14. CACHE
==================================================

Setelah:

CREATE
UPDATE
DELETE

pastikan query/cache
di-invalidasi sesuai
existing architecture.

Jangan membuat cache
system baru.

==================================================
15. LOADING
==================================================

Semua request memiliki:

loading state.

==================================================
16. ERROR STATE
==================================================

API failure harus
memiliki:

error state
message
retry jika relevan.

==================================================
17. EMPTY STATE
==================================================

Jika response kosong:

jangan blank screen.

Gunakan existing
EmptyState component.

==================================================
18. FORM
==================================================

Audit:

input
select
date
number
file
search
autocomplete.

==================================================
19. DOUBLE SUBMIT
==================================================

Saat request berjalan:

disable submit.

Untuk operation sensitif:

gunakan idempotency
jika diperlukan.

==================================================
20. PAGINATION
==================================================

Frontend dan backend
harus menggunakan
parameter pagination
yang sama.

Jangan fetch seluruh
database.

==================================================
21. SEARCH
==================================================

Pastikan search:

server-side jika
dataset besar.

Validasi input.

==================================================
22. FILTER
==================================================

Filter UI harus
sesuai API.

Tidak boleh filter
palsu hanya di frontend
jika dataset besar.

==================================================
23. SORT
==================================================

Sort field harus
whitelisted.

==================================================
24. DETAIL PAGE
==================================================

Test:

valid ID
invalid ID
deleted ID
unauthorized ID.

==================================================
25. ROUTING
==================================================

Pastikan:

route
permission
API

sinkron.

Tidak boleh:

route ada
tetapi API tidak ada.

==================================================
26. FILE UPLOAD
==================================================

Test:

valid file
invalid type
too large
unauthorized
failed upload.

==================================================
27. FILE DOWNLOAD
==================================================

Test:

authorized
unauthorized
missing file
expired signed URL.

==================================================
28. BULK OPERATION
==================================================

Jika existing:

bulk create
bulk update
bulk delete
bulk import.

Test:

validation
limit
authorization
transaction.

==================================================
29. IMPORT
==================================================

FLOW:

UPLOAD
→ VALIDATE
→ PREVIEW
→ CONFIRM
→ PROCESS
→ REPORT.

Jangan membuat import
engine kedua.

==================================================
30. EXPORT
==================================================

Gunakan existing
Export Engine.

Test:

PDF
XLSX
CSV

jika tersedia.

==================================================
31. TRANSACTION
==================================================

Operasi multi-table
harus atomic jika
business rule
mengharuskannya.

==================================================
32. RACE CONDITION
==================================================

Test dua request
bersamaan.

Periksa:

duplicate
lost update
double payment
double attendance.

==================================================
33. ATTENDANCE CRUD
==================================================

Audit existing:

student QR
security scan
teacher scan
manual teacher
employee GPS
employee barcode.

SATU Attendance Engine.

==================================================
34. FINANCE CRUD
==================================================

Audit:

transaction
budget
payment
approval
balance.

Pastikan tidak ada
saldo dummy.

==================================================
35. INVENTORY CRUD
==================================================

Audit:

item
stock
movement
adjustment
asset.

==================================================
36. DOCUMENT CRUD
==================================================

Audit:

document
upload
archive
restore
download.

==================================================
37. APPROVAL CRUD
==================================================

Audit:

request
approve
reject
history.

History tidak boleh
hilang.

==================================================
38. API PERFORMANCE
==================================================

Cari:

duplicate API call
N+1
slow query
unnecessary fetch
large payload.

==================================================
39. SECURITY
==================================================

Test:

IDOR
SQL injection
XSS
CSRF
rate limit
authorization.

==================================================
40. LOGGING
==================================================

Log:

request ID
endpoint
status
latency
error.

Jangan log:

password
token
secret.

==================================================
41. API DOCUMENTATION
==================================================

Gunakan documentation
existing.

Jangan membuat
API documentation
system kedua.

==================================================
42. TEST
==================================================

Minimal:

CRUD test
API test
authorization test
validation test
error test
regression test.

==================================================
43. FIX RULE
==================================================

SEARCH EXISTING FIRST.

Jika implementation
sudah benar:

REUSE.

Jika bug:

FIX.

Jika duplicate:

CONSOLIDATE.

Jika tidak diperlukan:

DEPRECATE/REMOVE
secara aman.

Jangan rewrite
seluruh module tanpa
alasan.

==================================================
44. OUTPUT
==================================================

Tampilkan:

MODULE
ISSUE
ROOT CAUSE
EXISTING IMPLEMENTATION
FIX
TEST
STATUS

Contoh:

[ P1 ]
Student
Issue: Update gagal
Root Cause: API field mismatch
Existing: StudentService.update()
Fix: mapping field diperbaiki
Test: PASS
Status: VERIFIED

==================================================
45. PRIORITY
==================================================

P0:
data corruption
security
system crash.

P1:
CRUD critical broken
API broken
authentication broken.

P2:
major UX/performance.

P3:
minor issue.

==================================================
FINAL COMMAND
==================================================

SCAN EXISTING CODE.

MAP UI → API → BACKEND → DATABASE.

DETECT DUPLICATE.

DETECT BROKEN CRUD.

DETECT BROKEN API.

DETECT QUERYCLIENT ERROR.

DETECT AUTHORIZATION ERROR.

DETECT VALIDATION ERROR.

DETECT CACHE ERROR.

FIX EXISTING IMPLEMENTATION.

DO NOT CREATE DUPLICATE.

RUN TEST.

RUN REGRESSION.

REPORT ONLY RESULT.

NO NEW FEATURE.

# END 154_CRUD_API_AUDIT