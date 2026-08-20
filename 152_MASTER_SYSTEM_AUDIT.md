# 152_MASTER_SYSTEM_AUDIT.md

## MODE
PRODUCTION AUDIT + FIX

## OBJECTIVE

Audit seluruh aplikasi Management Sekolah & Pondok Pesantren
yang SUDAH ADA.

PRIORITAS:

AUDIT → DETECT → FIX → TEST → VERIFY

JANGAN:
- membuat fitur duplicate
- membuat menu duplicate
- membuat database duplicate
- membuat API duplicate
- membuat service duplicate
- membuat component duplicate
- membuat business logic duplicate
- menambah fitur baru tanpa kebutuhan

==================================================
1. SCOPE APLIKASI
==================================================

APLIKASI INI HANYA UNTUK:

- Master Data
- Siswa
- Guru/Karyawan
- Absensi
- Tata Usaha
- Surat
- Dokumen
- Arsip
- Inventaris
- Aset
- Keuangan
- Laporan
- Audit
- Compliance
- Notification
- Workflow
- Approval
- Monitoring
- Integration

JANGAN MEMBUAT:

- KBM
- Leger
- Rapor
- Nilai
- Kurikulum
- Akademik

KBM/Leger/Rapor tetap berada
di aplikasi terpisah.

==================================================
2. AUDIT STRUCTURE
==================================================

Scan project existing.

Petakan:

frontend
backend
API
database
routes
controllers
services
repositories
models
schemas
hooks
components
pages
permissions
middleware
jobs
queues
reports
PDF
print
export
import.

Jangan langsung mengubah kode.

==================================================
3. DUPLICATE DETECTION
==================================================

Cari fungsi yang sama.

Bandingkan:

- nama
- route
- table
- endpoint
- component
- service
- business logic

Jika duplicate:

PILIH SATU IMPLEMENTASI TERBAIK.

Kemudian:

REUSE.

Jangan membuat versi ketiga.

==================================================
4. DATABASE AUDIT
==================================================

Periksa:

- table
- column
- primary key
- foreign key
- unique
- index
- nullable
- default
- relation

Cari:

orphan relation
duplicate table
duplicate field
missing foreign key
incorrect relation.

Jangan menghapus data
tanpa memastikan dependency.

==================================================
5. CRUD AUDIT
==================================================

Untuk setiap module:

CREATE
READ
UPDATE
DELETE

harus bekerja.

Periksa:

validation
authorization
database transaction
error handling
success response
cache invalidation.

==================================================
6. API AUDIT
==================================================

Periksa:

route
controller
service
validation
authentication
authorization
response
error handling.

Cari endpoint duplicate.

Gunakan API existing.

==================================================
7. FRONTEND AUDIT
==================================================

Periksa:

routing
component
form
table
modal
pagination
search
filter
loading
empty state
error state.

Pastikan tidak ada:

blank page
undefined data
broken component
dead button.

==================================================
8. REACT QUERY
==================================================

WAJIB pastikan seluruh:

useQuery
useMutation
useInfiniteQuery

berada dalam:

QueryClientProvider.

ERROR INI HARUS HILANG:

"No QueryClient set,
use QueryClientProvider
to set one"

Jangan membuat provider
berulang di setiap module.

Gunakan root provider existing.

==================================================
9. AUTHORIZATION
==================================================

Test backend authorization.

Jangan hanya menyembunyikan
menu frontend.

Test:

Admin
TU
Bendahara
Guru
Security
Management
Yayasan

sesuai permission existing.

==================================================
10. SECURITY
==================================================

Periksa:

IDOR
SQL injection
XSS
CSRF
file upload
authentication
authorization
rate limit
secret exposure.

Jangan menampilkan:

password
token
API secret
JWT secret.

==================================================
11. DYNAMIC SYSTEM
==================================================

Hilangkan hardcode untuk:

nama sekolah
nama yayasan
alamat
logo
telepon
email
kop surat
tahun
nomor dokumen
threshold
API URL.

Gunakan:

database
configuration
environment.

==================================================
12. DUMMY DATA
==================================================

Cari semua:

dummy
demo
sample
mock
placeholder

yang masih muncul pada
production UI.

Hapus/ganti dengan
data database sebenarnya.

Jangan menghapus seed
development secara membabi buta.

==================================================
13. ATTENDANCE AUDIT
==================================================

Pastikan SATU Attendance Engine.

Support existing:

Siswa:
- QR kartu pelajar
- scan security
- scan guru
- manual guru

Guru/Karyawan:
- GPS
- barcode
- manual sesuai permission

Jangan membuat
attendance engine kedua.

==================================================
14. FINANCE AUDIT
==================================================

Pastikan satu Finance Engine.

Periksa:

transaction
budget
balance
approval
report
export.

Tidak boleh ada
saldo dummy.

==================================================
15. INVENTORY AUDIT
==================================================

Pastikan satu Inventory Engine.

Periksa:

stock in
stock out
adjustment
transfer
opname
asset.

==================================================
16. DOCUMENT AUDIT
==================================================

Periksa:

upload
download
preview
archive
restore
PDF
print.

Private document
tidak boleh public.

==================================================
17. PRINT AUDIT
==================================================

Cari SELURUH fitur:

print
PDF
download
export.

Pastikan mengambil
data real.

Test:

A4
F4
portrait
landscape
multi-page
page-break
header
footer
table.

Jangan membuat
print engine kedua.

==================================================
18. NOTIFICATION
==================================================

Gunakan existing
Notification Engine.

Jangan membuat
notification system kedua.

Periksa:

in-app
read/unread
retry
duplicate prevention.

==================================================
19. APPROVAL
==================================================

Gunakan existing
Approval Engine.

Periksa:

request
approve
reject
multi-level
permission
history.

==================================================
20. MONITORING
==================================================

Gunakan existing
Monitoring Engine.

Periksa:

API
database
queue
worker
storage
error
alert.

==================================================
21. INTEGRATION
==================================================

Gunakan existing
Integration Engine.

Periksa:

API
webhook
sync
retry
timeout
idempotency.

==================================================
22. ERROR HANDLING
==================================================

Semua module harus
memiliki:

loading
success
empty
error
retry.

Backend harus
menghasilkan error
yang konsisten.

==================================================
23. DATABASE SAFETY
==================================================

Operasi multi-table
gunakan transaction
jika diperlukan.

Pastikan rollback
berfungsi.

==================================================
24. PERFORMANCE
==================================================

Cari:

N+1 query
query berat
request duplicate
unnecessary API call
unnecessary render.

Gunakan:

pagination
eager loading
cache existing
queue existing.

==================================================
25. REGRESSION
==================================================

Setelah perbaikan:

test module terkait.

Kemudian test:

Student
Employee
Attendance
Finance
Inventory
Document
Reporting
Approval
Notification.

==================================================
26. BUILD
==================================================

Pastikan:

frontend build PASS

TypeScript typecheck PASS
jika digunakan.

Lint PASS
jika tersedia.

Backend startup PASS.

==================================================
27. PRODUCTION CHECK
==================================================

Pastikan:

DEBUG=false
production env benar
secret aman
HTTPS
CORS benar
database connection benar
queue benar
storage benar.

==================================================
28. FIX STRATEGY
==================================================

Prioritas:

P0 = system crash/data corruption/security
P1 = critical feature broken
P2 = major feature broken
P3 = minor UI/UX

FIX:

P0
↓
P1
↓
P2
↓
P3

==================================================
29. CHANGE RULE
==================================================

Sebelum membuat file baru:

SEARCH EXISTING.

Sebelum membuat table:

SEARCH EXISTING.

Sebelum membuat API:

SEARCH EXISTING.

Sebelum membuat component:

SEARCH EXISTING.

Sebelum membuat service:

SEARCH EXISTING.

Jika sudah ada:

REUSE.

==================================================
30. OUTPUT
==================================================

Setelah audit tampilkan:

1. MODULE AUDIT
2. DUPLICATE FOUND
3. DATABASE ISSUES
4. CRUD ISSUES
5. API ISSUES
6. FRONTEND ISSUES
7. SECURITY ISSUES
8. PRINT/PDF ISSUES
9. ATTENDANCE ISSUES
10. PERFORMANCE ISSUES
11. FIXED
12. REMAINING
13. TEST RESULT

Gunakan format:

[STATUS] [PRIORITY] MODULE
ISSUE:
ROOT CAUSE:
FIX:
TEST:
RESULT:

==================================================
31. FINAL RULE
==================================================

JANGAN MEMBUAT FITUR BARU
HANYA UNTUK MENYELESAIKAN AUDIT.

JANGAN DUPLIKASI.

JANGAN REWRITE MODULE
YANG SUDAH BERFUNGSI.

JANGAN MENGHAPUS DATA
TANPA VERIFIKASI.

JANGAN MENGUBAH DATABASE
TANPA MIGRATION.

JANGAN MENGUBAH API
TANPA MEMERIKSA FRONTEND.

JANGAN MERUSAK MODULE LAIN.

NO KBM.
NO LEGER.
NO RAPOR.
NO NILAI.
NO KURIKULUM.

FIX EXISTING SYSTEM FIRST.

==================================================
FINAL COMMAND
==================================================

SCAN PROJECT.

MAP EXISTING ARCHITECTURE.

DETECT DUPLICATE.

DETECT BUG.

DETECT ERROR.

DETECT BROKEN CRUD.

DETECT BROKEN RELATION.

DETECT BROKEN API.

DETECT BROKEN PRINT.

DETECT HARDCODE.

DETECT DUMMY DATA.

DETECT SECURITY ISSUE.

FIX SAFELY.

TEST.

REGRESSION TEST.

DO NOT ADD DUPLICATE FEATURES.

DO NOT CREATE DUPLICATE ENGINES.

DO NOT CREATE DUPLICATE TABLES.

DO NOT CREATE DUPLICATE APIs.

DO NOT CREATE DUPLICATE COMPONENTS.

SYSTEM MUST REMAIN DYNAMIC.

SYSTEM MUST REMAIN STABLE.

SYSTEM MUST BE PRODUCTION READY.

# END 152_MASTER_SYSTEM_AUDIT