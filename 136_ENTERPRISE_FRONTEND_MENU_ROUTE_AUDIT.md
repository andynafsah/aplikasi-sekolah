# 136_ENTERPRISE_FRONTEND_MENU_ROUTE_AUDIT.md

# ENTERPRISE FRONTEND MENU & ROUTE AUDIT
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: FRONTEND AUDIT / ROUTE AUDIT / DUPLICATE PREVENTION

============================================================
1. OBJECTIVE
============================================================

Audit seluruh frontend aplikasi.

Tujuan:

1. Memastikan menu sesuai scope Management.
2. Memastikan route valid.
3. Menghapus referensi akademik yang tidak diperlukan.
4. Menemukan duplicate page.
5. Menemukan duplicate component.
6. Menemukan duplicate hook.
7. Menemukan duplicate API client.
8. Memastikan permission sesuai backend.
9. Memastikan setiap menu mempunyai route yang benar.
10. Memastikan tidak ada broken route.
11. Memastikan tidak ada dead page.
12. Memastikan tidak ada dummy UI.
13. Memastikan tidak ada menu akademik tersembunyi.

============================================================
2. ABSOLUTE SCOPE
============================================================

FRONTEND HANYA UNTUK:

Dashboard
Master Data
Kepegawaian
Absensi
Kartu & Identitas
Tata Usaha
Dokumen & Arsip
Inventaris
Keuangan
Laporan
Notifikasi
Audit
Pengaturan

============================================================
3. FORBIDDEN FRONTEND DOMAIN
============================================================

JANGAN ADA:

Akademik
Academic
KBM
Kurikulum
Curriculum
Mata Pelajaran
Subject
Lesson
Penilaian
Assessment
Nilai
Grade
KKM
Leger
Rapor
Raport
Report Card
Transkrip
Transcript

Kecuali referensi tersebut
berada pada:

- integration documentation
- external API configuration
- legacy migration reference

dan tidak digunakan sebagai
fitur aktif frontend.

============================================================
4. SIDEBAR AUDIT
============================================================

Sidebar harus memiliki:

DASHBOARD

MASTER DATA
├── Lembaga
├── Unit
├── Siswa/Santri
├── Orang Tua/Wali
├── Guru
└── Karyawan

KEPEGAWAIAN
├── Data Guru
├── Data Karyawan
├── Jabatan
├── Status Kepegawaian
└── Dokumen Kepegawaian

ABSENSI
├── Absensi Siswa
├── Absensi Guru/Karyawan
├── QR Scanner
├── GPS Attendance
├── Manual Attendance
├── Rekap
└── Koreksi

KARTU & IDENTITAS
├── Kartu Pelajar
├── Kartu Guru/Karyawan
├── QR Code
└── Barcode

TATA USAHA
├── Surat Masuk
├── Surat Keluar
├── Surat Tugas
├── SK
├── Surat Orang Tua
├── Surat Keterangan
├── Disposisi
└── Nomor Surat

DOKUMEN & ARSIP
├── Dokumen
├── Template
├── Arsip
└── Storage

INVENTARIS
├── Barang
├── Lokasi
├── Peminjaman
├── Pemeliharaan
└── Mutasi

KEUANGAN
├── Transaksi
├── Kas
├── Bank
├── Pembayaran
├── Honor
└── Laporan

LAPORAN

NOTIFIKASI

AUDIT & COMPLIANCE

PENGATURAN

============================================================
5. SIDEBAR FORBIDDEN
============================================================

HAPUS DARI MENU AKTIF:

❌ Akademik
❌ KBM
❌ Kurikulum
❌ Mata Pelajaran
❌ Penilaian
❌ Nilai
❌ KKM
❌ Leger
❌ Rapor
❌ Transkrip

============================================================
6. ROUTE INVENTORY
============================================================

Scan:

App Router
React Router
route configuration
lazy routes
protected routes
nested routes
dynamic routes.

Output:

PATH
PAGE
MODULE
PERMISSION
STATUS

Contoh:

/students
→ StudentListPage
→ Master Data
→ student.view
→ ACTIVE

============================================================
7. BROKEN ROUTE DETECTION
============================================================

Cari:

route
→ component tidak ditemukan

route
→ lazy import gagal

route
→ permission tidak tersedia

route
→ API tidak tersedia.

Semua harus diperbaiki.

============================================================
8. DUPLICATE ROUTE
============================================================

Cari contoh:

/students
/students/list
/student-list
/master/students

Jika semuanya melakukan
fungsi yang sama:

tentukan satu route utama.

Route lain:

REDIRECT
DEPRECATED
REMOVE

sesuai dependency.

============================================================
9. PAGE INVENTORY
============================================================

Scan seluruh:

pages
views
screens
features
modules.

Klasifikasi:

ACTIVE
LEGACY
DUPLICATE
UNUSED
ACADEMIC
BROKEN

============================================================
10. DUPLICATE PAGE
============================================================

Contoh:

StudentPage
StudentsPage
StudentManagementPage

Jika fungsi sama:

REUSE satu page.

Jangan mempertahankan
3 halaman untuk fungsi
yang sama tanpa alasan UX
yang jelas.

============================================================
11. COMPONENT AUDIT
============================================================

Audit:

Button
Modal
Dialog
Table
Form
Input
Select
DatePicker
Card
Badge
EmptyState
ErrorState
LoadingState
Scanner
Map
FileUploader
DocumentPreview
PrintPreview

Jika sudah tersedia:

REUSE.

============================================================
12. DUPLICATE COMPONENT
============================================================

Cari:

StudentTable
StudentsTable
StudentDataTable

Jika fungsinya sama:

CONSOLIDATE.

============================================================
13. FORM AUDIT
============================================================

Setiap form harus:

- validation
- loading state
- error state
- success feedback
- reset
- server error handling.

Jangan membuat
form hanya frontend
tanpa backend integration.

============================================================
14. HOOK AUDIT
============================================================

Scan:

useQuery
useMutation
useStudents
useEmployees
useAttendance
useDocuments
useLetters

Cari duplicate hooks.

Contoh:

useStudents()
useStudentList()
useStudentsQuery()

Jika API sama:

konsolidasikan.

============================================================
15. QUERY CLIENT
============================================================

Pastikan:

QueryClient

dibuat SATU KALI
pada application root.

Struktur ideal:

App
↓
QueryClientProvider
↓
Router
↓
Pages
↓
Components

JANGAN:

Page
↓
new QueryClient()

JANGAN membuat
QueryClient baru
di setiap component.

============================================================
16. QUERY KEY AUDIT
============================================================

Gunakan query key
yang konsisten.

Contoh:

["students"]
["students", id]
["attendance", date]

Jangan menggunakan
query key berbeda
untuk data yang sama
tanpa alasan.

============================================================
17. CACHE INVALIDATION
============================================================

Setelah:

CREATE
UPDATE
DELETE

pastikan query terkait
di-invalidate atau
di-update dengan benar.

Contoh:

createStudent
↓
invalidate ["students"]

============================================================
18. API CLIENT AUDIT
============================================================

Cari:

axios
fetch
apiClient
httpClient
services.

Pastikan terdapat
satu abstraction utama.

Jangan setiap component
membuat axios instance sendiri.

============================================================
19. AUTH STATE
============================================================

Authentication harus
memiliki satu sumber
state.

Jangan memiliki:

AuthContext
+
useAuth custom state
+
local auth state

yang tidak sinkron.

============================================================
20. RBAC FRONTEND
============================================================

Frontend digunakan untuk:

UX access control.

Backend tetap menjadi
security authority.

Contoh:

Security:

lihat scanner.

Bendahara:

lihat finance.

TU:

lihat surat.

Kepala:

lihat dashboard/report.

============================================================
21. PERMISSION AUDIT
============================================================

Setiap menu:

MENU
↓
ROUTE
↓
PAGE
↓
ACTION
↓
PERMISSION

harus konsisten.

Contoh:

attendance.student.scan

Tidak boleh frontend
menggunakan:

attendance.scan.student

sementara backend
menggunakan nama berbeda
tanpa mapping.

============================================================
22. HIDDEN MENU AUDIT
============================================================

Cari menu yang:

display:none
hidden
conditional
feature flag
role condition

tetapi masih menunjuk
ke module akademik.

Jangan hanya menghapus
menu visual.

Audit route dan source.

============================================================
23. DEAD CODE
============================================================

Cari:

unused page
unused component
unused hook
unused API
unused import
unused route.

Klasifikasikan sebelum
menghapus.

============================================================
24. ACADEMIC REFERENCE SCAN
============================================================

Search seluruh frontend:

academic
akademik
kbm
curriculum
kurikulum
subject
lesson
assessment
grade
nilai
kkm
leger
rapor
raport
report-card
transcript

Untuk setiap hasil:

FILE
LINE
REFERENCE
USAGE
ACTION

============================================================
25. LEGACY ACADEMIC PAGE
============================================================

Jika ditemukan page lama:

JANGAN langsung delete.

Periksa:

route usage
navigation usage
API usage
permission
import
lazy loading
deep link.

Jika tidak digunakan:

DEPRECATE
↓
REMOVE

============================================================
26. DASHBOARD AUDIT
============================================================

Dashboard harus menggunakan
API aktual.

DILARANG:

dummy statistics
mock chart
fake student
fake attendance.

Widget harus memiliki:

loading
empty
error
success.

============================================================
27. DASHBOARD DOMAIN
============================================================

Allowed:

Jumlah siswa
Jumlah guru
Jumlah karyawan
Absensi hari ini
Keterlambatan
Surat
Dokumen
Inventaris
Keuangan
Notifikasi

Forbidden:

Jumlah nilai
rata-rata nilai
ranking
KKM
leger
rapor.

============================================================
28. ATTENDANCE FRONTEND
============================================================

Frontend harus mendukung:

Student QR
Student Manual
Employee GPS
Employee QR/Barcode
Attendance History
Correction
Report.

============================================================
29. QR SCANNER UI
============================================================

Flow:

OPEN SCANNER
↓
CAMERA PERMISSION
↓
SCAN
↓
DECODE
↓
VALIDATE
↓
API
↓
RESULT
↓
RESET SCANNER

Handle:

permission denied
camera unavailable
invalid QR
expired QR
duplicate scan
network error.

============================================================
30. GPS UI
============================================================

Flow:

REQUEST LOCATION
↓
GET POSITION
↓
SHOW ACCURACY
↓
SEND TO API
↓
SERVER VALIDATION
↓
RESULT.

Jangan menentukan
valid/tidak valid
hanya dari frontend.

============================================================
31. MANUAL ATTENDANCE UI
============================================================

Guru/Security/Admin
dapat melakukan manual
sesuai permission.

Form:

student
date
time
status
reason

============================================================
32. STUDENT CARD UI
============================================================

Support:

preview
generate QR
generate barcode
print
download PDF
bulk print.

Tidak boleh ada
QR generation engine
kedua.

============================================================
33. LETTER UI
============================================================

Support:

template
create
preview
edit
approve
print
PDF
DOCX
archive.

============================================================
34. DOCUMENT UI
============================================================

Support:

upload
preview
download
metadata
archive
delete
version.

Permission harus
diperiksa.

============================================================
35. INVENTORY UI
============================================================

Support:

list
detail
create
edit
delete
mutation
borrowing
maintenance.

============================================================
36. FINANCE UI
============================================================

Gunakan finance UI
existing jika tersedia.

JANGAN membuat
finance dashboard kedua.

============================================================
37. TABLE COMPONENT
============================================================

Semua table production
harus mendukung jika
diperlukan:

pagination
search
filter
sort
column visibility
empty state
loading
error.

============================================================
38. DELETE CONFIRMATION
============================================================

Delete destructive
harus memiliki:

confirmation
permission
API validation
audit.

Tidak boleh:

onClick={() => delete(id)}

tanpa confirmation
untuk data penting.

============================================================
39. ERROR BOUNDARY
============================================================

Setiap aplikasi production
harus memiliki:

Global Error Boundary

dan jika diperlukan:

Module Error Boundary.

Error tidak boleh
membuat seluruh aplikasi
blank screen.

============================================================
40. LOADING STATE
============================================================

Gunakan:

skeleton
spinner
progress

sesuai konteks.

Jangan menampilkan
blank page saat API loading.

============================================================
41. EMPTY STATE
============================================================

Jika data kosong:

tampilkan:

icon
message
action.

Contoh:

"Belum ada data siswa."

Bukan error.

============================================================
42. ERROR STATE
============================================================

Jika API gagal:

tampilkan:

message
retry
support information.

Jangan tampilkan
raw stack trace.

============================================================
43. RESPONSIVE AUDIT
============================================================

Test:

Desktop
Tablet
Mobile.

Prioritas mobile:

QR scanner
GPS attendance
Security
Guru.

============================================================
44. ACCESSIBILITY
============================================================

Audit:

keyboard
focus
label
ARIA
contrast
button
form.

============================================================
45. PRINT UI
============================================================

Print preview harus
menggunakan data aktual.

Pastikan:

A4
A5
F4
custom size

jika didukung.

Preview ≈ output.

============================================================
46. EXPORT UI
============================================================

Export:

PDF
DOCX
XLSX
CSV

hanya jika module
membutuhkan.

Tidak boleh membuat
export palsu.

============================================================
47. NOTIFICATION UI
============================================================

Support:

unread count
notification list
mark read
mark all read.

============================================================
48. SEARCH GLOBAL
============================================================

Jika global search
tersedia:

hasil harus berasal
dari API aktual.

Jangan memasukkan
academic entity.

============================================================
49. BREADCRUMB
============================================================

Breadcrumb harus
mengikuti route.

Contoh:

Dashboard
>
Master Data
>
Siswa
>
Detail

============================================================
50. PAGE TITLE
============================================================

Setiap page harus
memiliki title yang benar.

Tidak boleh:

"Dashboard" untuk
semua halaman.

============================================================
51. FORM STATE
============================================================

Form harus menangani:

initial data
dirty state
submit
success
error
cancel.

============================================================
52. UNSAVED CHANGES
============================================================

Form panjang sebaiknya
memiliki protection
terhadap kehilangan
perubahan.

============================================================
53. MODAL AUDIT
============================================================

Modal harus:

open
close
escape
loading
error
success.

Tidak boleh modal
menyimpan state lama
setelah ditutup jika
tidak diperlukan.

============================================================
54. ROUTE GUARD
============================================================

Protected route:

AUTH
↓
ROLE
↓
PERMISSION
↓
PAGE

Jika tidak memiliki
permission:

403 / Unauthorized page.

============================================================
55. 404 PAGE
============================================================

Pastikan:

unknown route
→ 404 page.

Jangan redirect
semua route ke dashboard
tanpa alasan.

============================================================
56. API ERROR MAPPING
============================================================

Map:

401
→ Login

403
→ Forbidden

404
→ Not Found

409
→ Conflict

422
→ Validation

429
→ Too Many Requests

500
→ Server Error

============================================================
57. FRONTEND SECURITY
============================================================

JANGAN menyimpan
secret server di frontend.

Environment frontend
hanya boleh berisi
nilai yang memang aman
untuk public exposure.

============================================================
58. ENVIRONMENT AUDIT
============================================================

Audit:

development
staging
production.

Jangan hardcode:

API URL
storage URL
secret
credentials.

============================================================
59. BUILD AUDIT
============================================================

Run:

install
typecheck
lint
test
build.

Tidak boleh release
jika build gagal.

============================================================
60. CONSOLE AUDIT
============================================================

Production frontend
tidak boleh memiliki:

uncaught error
unhandled promise rejection
massive console.log
debugger.

============================================================
61. NETWORK AUDIT
============================================================

Periksa:

404
401
403
422
500
CORS
timeout
duplicate request.

============================================================
62. DUPLICATE REQUEST
============================================================

Jangan terjadi:

double submit
double mutation
double attendance
double upload.

Gunakan:

disabled state
mutation state
idempotency
request protection.

============================================================
63. FRONTEND DOMAIN MAP
============================================================

MASTER DATA
→ /master-data

EMPLOYEE
→ /employees

ATTENDANCE
→ /attendance

CARD
→ /cards

LETTER
→ /letters

DOCUMENT
→ /documents

ARCHIVE
→ /archives

INVENTORY
→ /inventory

FINANCE
→ /finance

REPORT
→ /reports

AUDIT
→ /audit

SETTINGS
→ /settings

============================================================
64. FRONTEND ACADEMIC REMOVAL
============================================================

Search:

routes
sidebar
navigation
breadcrumbs
pages
components
hooks
services
query keys
permissions
API calls
dashboard widgets.

Cari:

academic
akademik
kbm
curriculum
kurikulum
subject
lesson
assessment
grade
nilai
kkm
leger
rapor
transcript

============================================================
65. SAFE REMOVAL PROCESS
============================================================

ACADEMIC REFERENCE FOUND
↓
IDENTIFY FILE
↓
CHECK IMPORT
↓
CHECK ROUTE
↓
CHECK API
↓
CHECK PERMISSION
↓
CHECK DATABASE
↓
CHECK EXTERNAL INTEGRATION
↓
REMOVE ONLY IF SAFE.

============================================================
66. DUPLICATE FRONTEND REPORT
============================================================

Output:

PAGE
PAGE DUPLICATE
ROUTE
COMPONENT
HOOK
API
STATUS
RECOMMENDATION

============================================================
67. ROUTE HEALTH REPORT
============================================================

Output:

TOTAL ROUTES
ACTIVE
BROKEN
DUPLICATE
LEGACY
ACADEMIC
UNUSED

============================================================
68. MENU HEALTH REPORT
============================================================

Output:

MENU
ROUTE
PAGE
API
PERMISSION
STATUS

============================================================
69. FRONTEND PRODUCTION CHECKLIST
============================================================

[ ] Sidebar valid
[ ] Routes valid
[ ] No broken route
[ ] No duplicate route
[ ] No duplicate page
[ ] No duplicate component
[ ] No duplicate hook
[ ] No duplicate API client
[ ] QueryClientProvider valid
[ ] Auth valid
[ ] RBAC valid
[ ] Loading states
[ ] Empty states
[ ] Error states
[ ] Error boundary
[ ] Responsive
[ ] Accessibility
[ ] Print
[ ] Export
[ ] No dummy data
[ ] No mock production data
[ ] No academic menu
[ ] No academic route
[ ] No academic API call
[ ] No unused legacy page
[ ] Build successful
[ ] Typecheck successful
[ ] Lint successful
[ ] Tests successful

============================================================
70. FINAL SYSTEM FLOW
============================================================

USER
 ↓
AUTH
 ↓
RBAC
 ↓
ROUTE
 ↓
PAGE
 ↓
HOOK
 ↓
QUERY/MUTATION
 ↓
API
 ↓
SERVICE
 ↓
DATABASE
 ↓
RESPONSE
 ↓
UI UPDATE
 ↓
AUDIT

Semua layer harus konsisten.

============================================================
71. FINAL COMMAND
============================================================

AUDIT FIRST.

DO NOT CREATE DUPLICATE PAGE.

DO NOT CREATE DUPLICATE ROUTE.

DO NOT CREATE DUPLICATE COMPONENT.

DO NOT CREATE DUPLICATE HOOK.

DO NOT CREATE DUPLICATE API CLIENT.

DO NOT CREATE ACADEMIC UI.

DO NOT CREATE KBM UI.

DO NOT CREATE LEGER UI.

DO NOT CREATE RAPOR UI.

DO NOT CREATE DUMMY DATA.

DO NOT CREATE MOCK PRODUCTION DATA.

REUSE EXISTING COMPONENTS.

REUSE EXISTING API.

REUSE EXISTING QUERY.

REUSE EXISTING BUSINESS LOGIC.

FIX EXISTING ARCHITECTURE
BEFORE ADDING NEW ARCHITECTURE.

# END FRONTEND MENU & ROUTE AUDIT