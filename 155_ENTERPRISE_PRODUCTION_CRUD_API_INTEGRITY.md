# 155 — ENTERPRISE PRODUCTION CRUD & API INTEGRITY

## MASTER PRODUCTION PROMPT

TUGAS INI ADALAH AUDIT, PERBAIKAN,
DAN VALIDASI CRUD SERTA REST API
SELURUH APLIKASI.

JANGAN MEMBUAT FITUR BARU.

JANGAN MEMBUAT ENGINE DUPLICATE.

JANGAN MEMBUAT DATABASE DUPLICATE.

JANGAN MEMBUAT API DUPLICATE.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT MODE SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

==================================================
1. TUJUAN
==================================================

Pastikan seluruh fitur existing:

CREATE
READ
DETAIL
UPDATE
DELETE
SEARCH
FILTER
SORT
PAGINATION
IMPORT
EXPORT

benar-benar:

Frontend
↓
REST API
↓
Controller
↓
Service
↓
ORM
↓
Database

dan kembali:

Database
↓
Service
↓
API
↓
Frontend.

Tidak boleh ada fake CRUD.

==================================================
2. SOURCE OF TRUTH
==================================================

Gunakan primary services
hasil consolidation 154.

Student
→ StudentService

Employee
→ EmployeeService

Teacher
→ TeacherService

Attendance
→ smartAttendanceService

Schedule
→ ScheduleEngineService

Document
→ DocumentService

Payment
→ PaymentService

Finance
→ FinanceService

Payroll
→ PayrollService

Notification
→ NotificationService

Audit
→ AuditService.

==================================================
3. CRUD MATRIX
==================================================

Buat matrix:

| Module | Create | Read | Detail | Update | Delete | Search | Filter | Pagination |
|---|---|---|---|---|---|---|---|---|

Status:

PASS
PARTIAL
BROKEN
MISSING
DUPLICATE.

==================================================
4. MASTER DATA
==================================================

WAJIB audit:

Organization
Unit
Student
Parent
Employee
Teacher
User
Role
Permission
Position
Department.

==================================================
5. STUDENT CRUD
==================================================

CREATE:

validasi field
↓
authorization
↓
unit scope
↓
duplicate check
↓
database transaction.

READ:

pagination
search
filter
scope.

DETAIL:

load relation sesuai permission.

UPDATE:

authorization
↓
validation
↓
transaction
↓
audit.

DELETE:

gunakan soft-delete/archive
jika architecture existing
menggunakannya.

Jangan hard delete histori
yang masih direferensikan.

==================================================
6. EMPLOYEE CRUD
==================================================

Pastikan:

Employee
↔ User
↔ Role
↔ Unit
↔ Position.

Tidak boleh membuat
employee account duplicate.

==================================================
7. TEACHER CRUD
==================================================

Jika Teacher merupakan
extension dari Employee:

jangan membuat identity
kedua.

Pastikan relation:

Employee
↓
Teacher profile/assignment.

==================================================
8. ATTENDANCE CRUD
==================================================

ATTENDANCE BUKAN CRUD
BEBAS.

Create:

QR
GPS
Manual

harus melalui
smartAttendanceService.

Read:

dashboard
history
report.

Update:

hanya workflow
correction yang
diizinkan.

Delete:

JANGAN hard delete
attendance produksi.

==================================================
9. ATTENDANCE DETAIL
==================================================

Detail harus dapat
menampilkan:

student/employee
tanggal
waktu server
method
location
QR
status
schedule
actor
unit
audit.

Data harus berasal
dari database.

==================================================
10. DOCUMENT CRUD
==================================================

Audit:

Letter
Document
Archive
Disposition
Template.

Pastikan:

create
edit
preview
download
print
archive

benar-benar bekerja.

==================================================
11. LETTER
==================================================

Letter harus:

nomor
tanggal
perihal
penerima
isi
kop
signature
attachment.

Tidak boleh ada
dummy template
yang tampil sebagai
data produksi.

==================================================
12. PDF / WORD
==================================================

Flow:

Database
↓
DocumentService
↓
Template
↓
Renderer
↓
PDF/Word.

Hasil download harus
sesuai preview.

Tidak boleh:

preview A
PDF B
Word C.

==================================================
13. PAYMENT CRUD
==================================================

Payment:

CREATE
READ
DETAIL
REVERSAL/VOID
EXPORT.

Jangan hard delete
financial transaction
yang sudah final.

==================================================
14. SPP
==================================================

SPP:

student
↓
billing
↓
invoice
↓
payment
↓
receipt.

Pastikan tidak ada
duplicate payment.

==================================================
15. FINANCE
==================================================

Audit:

COA
Journal
Transaction
Ledger.

Transaction:

DEBIT
CREDIT

harus balance.

Jangan membuat
financial mutation
langsung dari frontend.

==================================================
16. PAYROLL
==================================================

Flow:

Employee
↓
Attendance aggregation
↓
Payroll calculation
↓
Payroll run
↓
Payroll result.

Jangan membuat
attendance calculation
kedua.

==================================================
17. INVENTORY
==================================================

Audit:

Item
Stock
Asset
Movement.

Pastikan:

stock masuk
stock keluar
adjustment

menggunakan transaction
yang aman.

==================================================
18. NOTIFICATION
==================================================

CRUD notification
harus sesuai permission.

Pastikan:

read
unread
mark as read
delete/archive

bekerja sesuai
business rule existing.

==================================================
19. SEARCH
==================================================

Setiap list utama
harus menggunakan
server-side search
jika dataset besar.

Jangan mengambil
seluruh database ke
frontend hanya untuk
search.

==================================================
20. FILTER
==================================================

Filter harus benar-benar
mengubah query database.

Contoh:

unit
status
tanggal
role
kelas jika masih
digunakan oleh modul
yang relevan.

Jangan membuat filter
visual saja.

==================================================
21. SORT
==================================================

Sort harus:

validated
whitelisted
server-side.

Jangan menerima
arbitrary SQL field.

==================================================
22. PAGINATION
==================================================

Gunakan pagination
yang konsisten.

Response:

data
page
limit
total
totalPages.

Jangan membuat
pagination palsu
di frontend.

==================================================
23. DETAIL MODAL
==================================================

Detail modal:

GET API
↓
loading
↓
data
↓
render.

Tidak boleh menggunakan
data list lama jika
detail membutuhkan
data lebih lengkap.

==================================================
24. CREATE MODAL
==================================================

Create:

open
↓
form
↓
validation
↓
submit
↓
API
↓
success/error
↓
refresh query.

Tidak boleh:

menambahkan row
secara lokal tanpa
konfirmasi backend.

==================================================
25. EDIT MODAL
==================================================

Edit:

load current data
↓
form
↓
validate
↓
API
↓
database
↓
refresh.

==================================================
26. DELETE MODAL
==================================================

Delete:

confirmation
↓
permission
↓
API
↓
database
↓
audit
↓
refresh.

Untuk data immutable:

jangan tampilkan
delete action.

==================================================
27. FORM VALIDATION
==================================================

Frontend:

UX validation.

Backend:

authoritative validation.

Keduanya harus
konsisten.

==================================================
28. ID VALIDATION
==================================================

Tolak:

invalid UUID
invalid numeric ID
empty ID
foreign entity ID
yang tidak sesuai scope.

==================================================
29. FOREIGN KEY
==================================================

Sebelum create/update:

pastikan referenced record:

exists
active
authorized
same scope.

==================================================
30. UNIQUE
==================================================

Pastikan unique constraint
untuk identifier yang
memang harus unique.

Contoh:

NIS
NIP/NIY
email
QR token
invoice number
document number.

Jangan menentukan
uniqueness hanya di
frontend.

==================================================
31. TRANSACTION
==================================================

Gunakan database transaction
untuk operasi multi-table.

Contoh:

Student creation
+
identity
+
document relation

jika memang atomik.

==================================================
32. ROLLBACK
==================================================

Jika satu operasi gagal:

semua perubahan atomik
harus rollback.

Jangan meninggalkan
partial record.

==================================================
33. CONCURRENCY
==================================================

Test dua request
bersamaan:

CREATE
UPDATE
PAYMENT
ATTENDANCE.

Tidak boleh menghasilkan
duplicate atau corrupt state.

==================================================
34. IDEMPOTENCY
==================================================

Operasi yang berisiko
duplicate harus memiliki
idempotency/unique
protection sesuai
architecture existing.

==================================================
35. API ERROR
==================================================

Gunakan status yang
sesuai:

400
401
403
404
409
422
429
500.

Jangan mengembalikan
200 untuk business error.

==================================================
36. RESPONSE CONTRACT
==================================================

Standard response:

{
  success,
  data,
  message,
  errors,
  meta
}

Gunakan contract
existing jika sudah
tersedia.

Jangan membuat format
response kedua.

==================================================
37. API VERSIONING
==================================================

Gunakan:

/api/v1

untuk production API
yang sudah ditetapkan.

Jangan membuat:

/api/v2

tanpa kebutuhan
dan migration plan.

==================================================
38. AUTHENTICATION
==================================================

Semua protected CRUD:

Authentication
↓
Token validation
↓
User
↓
Role
↓
Permission
↓
Scope.

==================================================
39. AUTHORIZATION
==================================================

Jangan hanya:

if role == admin.

Gunakan existing:

permission
+
policy
+
scope.

==================================================
40. IDOR
==================================================

Test:

User A
mencoba mengakses
record User B.

Expected:

403 atau 404 sesuai
security policy.

==================================================
41. CROSS UNIT
==================================================

Test:

Unit A user
→ Unit B record.

Harus ditolak jika
tidak memiliki
cross-unit permission.

==================================================
42. RAW ORM
==================================================

Cari:

prisma.*.create
prisma.*.update
prisma.*.delete

di luar service
yang memang menjadi
source of truth.

Jika ditemukan:

REVIEW.

Jangan otomatis menghapus.

==================================================
43. FRONTEND API
==================================================

Semua CRUD frontend
harus menggunakan
central API client.

Contoh:

apiClient
+
TanStack Query/Axios
sesuai architecture existing.

Jangan membuat:

fetch()
axios()
client baru

secara random
di setiap component.

==================================================
44. QUERY INVALIDATION
==================================================

Setelah mutation:

invalidate/refetch
query yang terkait.

Contoh:

create student
↓
student list refresh.

update employee
↓
employee detail/list refresh.

==================================================
45. OPTIMISTIC UPDATE
==================================================

Jika digunakan:

hanya untuk operasi
yang aman.

Jika backend gagal:

rollback UI.

Jangan membuat
fake permanent success.

==================================================
46. LOADING STATE
==================================================

Semua mutation
memiliki:

idle
loading
success
error.

Tombol submit harus
mencegah duplicate click.

==================================================
47. EMPTY STATE
==================================================

Jika database kosong:

tampilkan:

"Belum ada data."

Bukan:

dummy record.

==================================================
48. ERROR STATE
==================================================

Jika API gagal:

tampilkan error
yang informatif.

Jangan menampilkan:

"Data berhasil disimpan"

jika server gagal.

==================================================
49. CACHE
==================================================

Pastikan CRUD tidak
menampilkan stale data
setelah mutation.

Cache harus
di-invalidate sesuai
query key.

==================================================
50. EXPORT
==================================================

Export harus mengikuti
filter aktif.

Contoh:

Filter Unit A
+
Tanggal tertentu
↓
Export

harus menghasilkan
data yang sama dengan
filter.

==================================================
51. IMPORT
==================================================

Jika import existing:

validate file
↓
validate rows
↓
preview
↓
transaction/batch
↓
error report.

Jangan memasukkan
partial invalid data
tanpa policy.

==================================================
52. FILE UPLOAD
==================================================

Validasi:

mime
extension
size
authorization
storage.

Jangan percaya
filename dari client.

==================================================
53. DELETE SAFETY
==================================================

Sebelum delete:

check relation.

Jika masih direferensikan:

REJECT
atau
ARCHIVE

sesuai business rule.

==================================================
54. AUDIT
==================================================

Audit:

CREATE
UPDATE
DELETE
APPROVE
REJECT
EXPORT
LOGIN
CORRECTION

sesuai module.

Gunakan AuditService
existing.

==================================================
55. CRUD TEST MATRIX
==================================================

Untuk setiap module:

CREATE PASS
READ PASS
DETAIL PASS
UPDATE PASS
DELETE PASS
SEARCH PASS
FILTER PASS
SORT PASS
PAGINATION PASS
EXPORT PASS.

==================================================
56. API TEST
==================================================

Test:

valid request
invalid request
unauthorized
forbidden
not found
duplicate
validation error
server error.

==================================================
57. FRONTEND TEST
==================================================

Test:

form
modal
table
pagination
search
filter
delete
loading
error
empty state
success state.

==================================================
58. DATABASE TEST
==================================================

Pastikan:

foreign key
unique
index
transaction
rollback
concurrency.

==================================================
59. PRODUCTION DATA
==================================================

DILARANG:

seed dummy
fake response
mock production API
simulation data.

Development fixtures
harus terisolasi.

==================================================
60. NO HARD CODE
==================================================

Jangan hardcode:

API URL
school name
logo
unit
role
permission
tahun
status
database ID.

Gunakan:

.env
database
configuration
API.

==================================================
61. MOBILE / FLUTTER
==================================================

Flutter harus menggunakan
REST API yang sama.

Jangan membuat
database business logic
berbeda di Flutter.

Flow:

Flutter
↓
API
↓
Canonical Service
↓
Database.

==================================================
62. WEB
==================================================

React juga:

React
↓
API
↓
Canonical Service
↓
Database.

==================================================
63. PWA
==================================================

Jika PWA:

offline cache
tidak boleh
menjadi source of truth.

Mutation tetap
memerlukan backend
confirmation.

==================================================
64. PERFORMANCE
==================================================

Audit:

N+1
overfetching
large payload
missing index
unnecessary requests.

Gunakan:

pagination
select/include
caching
debounce search

sesuai architecture
existing.

==================================================
65. SECURITY
==================================================

Audit:

SQL injection
IDOR
XSS
CSRF jika relevan
file upload
authorization bypass
mass assignment
rate limit.

==================================================
66. FINAL REGRESSION
==================================================

WAJIB test:

LOGIN
RBAC
STUDENT
EMPLOYEE
TEACHER
ATTENDANCE
DOCUMENT
SPP
FINANCE
PAYROLL
INVENTORY
NOTIFICATION
REPORT
EXPORT.

==================================================
67. BUILD
==================================================

Jalankan:

typecheck
lint
unit test
integration test
API test
frontend build
production build.

Tidak boleh selesai
dengan:

TypeScript errors
runtime errors
broken imports
missing routes.

==================================================
68. ACCEPTANCE
==================================================

PASS jika:

[ ] Semua primary CRUD bekerja
[ ] Tidak ada fake CRUD
[ ] Tidak ada dummy production
[ ] Tidak ada simulation
[ ] API contract konsisten
[ ] Database relation valid
[ ] RBAC valid
[ ] Scope valid
[ ] Duplicate protected
[ ] Transaction aman
[ ] Error handling benar
[ ] Pagination benar
[ ] Search benar
[ ] Filter benar
[ ] Export benar
[ ] PDF/Word benar
[ ] Frontend refresh benar
[ ] Mobile API compatible
[ ] Build PASS
[ ] Tests PASS.

==================================================
69. FINAL REPORT
==================================================

WAJIB LAPORKAN:

1. Module audited
2. CRUD repaired
3. API repaired
4. Database issues
5. Relation issues
6. Permission issues
7. Duplicate endpoint
8. Duplicate service
9. Broken UI
10. Broken modal
11. Broken export
12. Broken print
13. Security issues
14. Performance issues
15. Tests
16. Build
17. Remaining blockers.

==================================================
70. FINAL RULE
==================================================

JANGAN MENAMBAH FITUR.

PERBAIKI YANG SUDAH ADA.

GUNAKAN PRIMARY SOURCE OF TRUTH.

JANGAN DUPLIKASI BUSINESS LOGIC.

JANGAN MERUSAK DATA.

JANGAN MEMBUAT DUMMY.

JANGAN MEMBUAT SIMULASI.

SEMUA CRUD HARUS
BENAR-BENAR TERHUBUNG
KE DATABASE.

SEMUA MODAL HARUS
BENAR-BENAR BERFUNGSI.

SEMUA API HARUS
BENAR-BENAR BERFUNGSI.

SEMUA REPORT HARUS
MENGAMBIL DATA ASLI.

SEMUA EXPORT HARUS
MENGAMBIL DATA ASLI.

STOP JIKA MENEMUKAN
KONFLIK KRITIS.

# END OF 155