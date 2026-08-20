# 155_PRINT_PDF_EXPORT_AUDIT.md

MODE: PRINT + PDF + EXPORT AUDIT
PRIORITY: PRODUCTION

==================================================
OBJECTIVE
==================================================

Audit seluruh fitur:

- Print
- PDF
- XLSX
- CSV
- Download
- Preview

Gunakan implementation existing.

JANGAN membuat engine baru
jika engine sudah tersedia.

==================================================
1. SCAN EXISTING
==================================================

Cari:

print service
PDF service
export service
template
report
download handler
preview component
document generator.

Petakan:

PAGE
→ ACTION
→ SERVICE
→ DATA SOURCE
→ OUTPUT.

==================================================
2. DUPLICATE ENGINE
==================================================

Cari:

PrintEngine
PdfEngine
ExportEngine
ReportEngine

yang memiliki fungsi
sama.

Pilih implementation
canonical.

REUSE.

==================================================
3. DUMMY DATA
==================================================

Cari:

demo
sample
dummy
placeholder
hardcoded institution
hardcoded student
hardcoded employee
hardcoded transaction.

Output production harus
menggunakan database real.

==================================================
4. DATA SOURCE
==================================================

Pastikan print/export
mengambil data dari
source of truth existing.

Jangan membuat query
database kedua yang
menghasilkan data berbeda.

==================================================
5. PRINT
==================================================

Test:

preview
print
cancel
retry.

Periksa:

A4
F4
portrait
landscape
margin
header
footer
logo
signature.

==================================================
6. PDF
==================================================

Test:

generate
preview
download.

Periksa:

blank page
overlap
cut text
broken table
missing image
missing logo
wrong page break.

==================================================
7. MULTI PAGE
==================================================

Dokumen panjang harus:

tidak terpotong
tidak overlap
tidak menghasilkan
blank page yang tidak perlu.

==================================================
8. NUMBERING
==================================================

Periksa:

nomor surat
nomor dokumen
nomor transaksi
nomor laporan.

Tidak boleh duplicate.

==================================================
9. DATE
==================================================

Periksa:

tanggal
bulan
tahun
timezone.

Gunakan configuration
existing.

==================================================
10. INSTITUTION
==================================================

Pastikan:

nama
alamat
logo
telepon
email
kop

berasal dari
institution settings.

Tidak boleh hardcode.

==================================================
11. STUDENT DOCUMENT
==================================================

Jika tersedia:

student list
student card
attendance report
student document

gunakan data existing.

Jangan membuat
student database baru.

==================================================
12. EMPLOYEE DOCUMENT
==================================================

Jika tersedia:

employee list
attendance report
employee document.

Gunakan Employee Engine
existing.

==================================================
13. ATTENDANCE REPORT
==================================================

Audit laporan:

student attendance
employee attendance
QR attendance
GPS attendance
manual attendance.

Gunakan Attendance Engine
existing.

==================================================
14. FINANCE REPORT
==================================================

Audit:

transaction
budget
payment
balance
summary.

Pastikan angka berasal
dari Finance Engine.

==================================================
15. INVENTORY REPORT
==================================================

Audit:

stock
movement
asset
opname.

==================================================
16. FILTER
==================================================

Print/export harus
mengikuti filter:

tanggal
unit
status
category
user

jika tersedia.

==================================================
17. PAGINATION VS EXPORT
==================================================

Export harus jelas:

export current page

atau

export all filtered data.

Jangan ambigu.

==================================================
18. LARGE EXPORT
==================================================

Dataset besar:

gunakan queue/background
jika architecture existing
mendukung.

Jangan membuat request
yang timeout.

==================================================
19. FILE NAME
==================================================

Filename harus:

jelas
aman
dynamic.

Contoh:

attendance_2026-08.pdf

Jangan menggunakan
nama file hardcoded.

==================================================
20. MIME TYPE
==================================================

Pastikan:

PDF → application/pdf
XLSX → correct MIME
CSV → text/csv.

==================================================
21. DOWNLOAD SECURITY
==================================================

Private file:

authorization WAJIB.

User tidak boleh
download dokumen
milik scope lain.

==================================================
22. PDF SECURITY
==================================================

Jangan expose:

database path
server path
secret
internal exception.

==================================================
23. EXCEL
==================================================

Audit:

header
column
date
number
currency
total
encoding.

==================================================
24. CSV
==================================================

Audit:

header
delimiter
encoding
special characters.

Pastikan Excel
Indonesia dapat
membuka jika memang
targetnya Excel.

==================================================
25. PRINT RESPONSIVE
==================================================

UI screen dan
print layout boleh
berbeda.

Jangan merusak
screen layout hanya
untuk print.

==================================================
26. TEMPLATE
==================================================

Template harus
menggunakan data
dynamic.

Jangan copy-paste
template untuk setiap
module jika reusable
template sudah ada.

==================================================
27. ERROR
==================================================

Jika generate gagal:

tampilkan error
yang aman.

Sediakan retry
jika relevan.

==================================================
28. LOADING
==================================================

Saat generate:

show loading/progress.

Cegah double click.

==================================================
29. CACHE
==================================================

Jika report memakai
cache:

gunakan existing
Cache Engine.

Pastikan data
ter-update setelah
transaction berubah.

==================================================
30. PERFORMANCE
==================================================

Cari:

duplicate query
N+1
large payload
memory-heavy PDF
timeout.

==================================================
31. AUDIT TRAIL
==================================================

Jika existing audit
system mendukung:

catat:

user
document
action
timestamp.

==================================================
32. API
==================================================

Pastikan:

print/export endpoint
menggunakan API/service
existing.

Jangan membuat
endpoint duplicate.

==================================================
33. MOBILE
==================================================

Jika mobile menggunakan
API:

jangan direct database.

Pastikan response
compatible.

==================================================
34. TEST MATRIX
==================================================

Setiap document:

[ ] Preview
[ ] Print
[ ] PDF
[ ] Download
[ ] Data correct
[ ] Authorization
[ ] Dynamic branding
[ ] Multi-page.

==================================================
35. FIX RULE
==================================================

SEARCH EXISTING FIRST.

Jika sudah ada:

REUSE.

Jika bug:

FIX.

Jika duplicate:

CONSOLIDATE.

Jika tidak dipakai:

DEPRECATE secara aman.

Jangan rewrite seluruh
print system.

==================================================
36. OUTPUT
==================================================

Tampilkan:

MODULE
DOCUMENT
ISSUE
ROOT CAUSE
EXISTING SERVICE
FIX
TEST
STATUS

==================================================
37. PRIORITY
==================================================

P0:
data/security corruption.

P1:
print/PDF menghasilkan
data salah atau gagal.

P2:
layout/performance.

P3:
minor formatting.

==================================================
FINAL COMMAND
==================================================

SCAN ALL PRINT/PDF/EXPORT.

DETECT DUPLICATE ENGINE.

DETECT DUMMY DATA.

DETECT HARDCODE.

DETECT WRONG DATA SOURCE.

DETECT BROKEN PDF.

DETECT BROKEN PRINT.

DETECT BROKEN EXPORT.

DETECT AUTHORIZATION ISSUE.

FIX EXISTING CODE.

TEST.

REGRESSION.

DO NOT CREATE DUPLICATE ENGINE.

DO NOT ADD NEW FEATURE.

# END 155_PRINT_PDF_EXPORT_AUDIT