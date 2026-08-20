# 157 — ENTERPRISE DOCUMENT, PDF, WORD & PRINT ENGINE

## MASTER PRODUCTION PROMPT

TUGAS INI ADALAH HARDENING DAN
PENYEMPURNAAN DOCUMENT ENGINE EXISTING.

JANGAN MEMBUAT DOCUMENT ENGINE KEDUA.

JANGAN MEMBUAT PDF ENGINE KEDUA.

JANGAN MEMBUAT WORD ENGINE KEDUA.

JANGAN MEMBUAT PRINT ENGINE KEDUA.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

GUNAKAN IMPLEMENTASI PRIMARY
HASIL AUDIT 153 DAN CONSOLIDATION 154.

==================================================
1. TUJUAN
==================================================

Semua dokumen harus memiliki
satu alur:

DATA
↓
DOCUMENT SERVICE
↓
TEMPLATE
↓
PREVIEW
↓
RENDER
↓
PDF / WORD / PRINT
↓
ARCHIVE.

Tidak boleh ada dua
business logic dokumen
yang menghasilkan format
berbeda.

==================================================
2. PRIMARY SERVICE
==================================================

Gunakan:

DocumentService

sebagai primary document
business service.

Jika terdapat:

PdfService
WordService
PrintService

jadikan sebagai adapter/
renderer, bukan business
logic kedua.

==================================================
3. DOCUMENT TYPES
==================================================

Audit dan dukung seluruh
document type existing:

SURAT MASUK
SURAT KELUAR
SURAT TUGAS
SURAT UNDANGAN
SURAT KETERANGAN
SURAT KEPUTUSAN
SURAT PERMOHONAN
BERITA ACARA
NOTULEN
DISPOSISI
DOKUMEN ADMINISTRASI
DOKUMEN KEPEGAWAIAN
DOKUMEN SISWA
DOKUMEN KEUANGAN.

JANGAN membuat tipe yang
tidak diperlukan.

==================================================
4. ORGANIZATION IDENTITY
==================================================

Semua dokumen mengambil
identitas dari database:

Institution
+
School
+
SchoolUnit
+
KopSuratConfig.

JANGAN HARDCODE:

Nama lembaga
Alamat
Logo
Telepon
Email
Website
NPSN
NSM
Nomor izin.

==================================================
5. KOP SURAT
==================================================

Kop surat harus dinamis.

Konfigurasi:

logo kiri
logo kanan
nama lembaga
nama unit
alamat
telepon
email
website
kode/nama dokumen.

Admin yang memiliki
permission dapat mengubah
konfigurasi.

Dokumen lama tetap
menggunakan snapshot
identitas pada saat
dokumen diterbitkan jika
architecture existing
mendukung historical
document integrity.

==================================================
6. TEMPLATE
==================================================

Template harus mendukung:

template name
document type
unit
paper size
orientation
font
font size
margin
spacing
header
footer
signature
variables.

==================================================
7. CUSTOM TEMPLATE
==================================================

Template dapat:

create
edit
duplicate
preview
activate
archive.

JANGAN membuat
template engine kedua.

==================================================
8. TEMPLATE VERSION
==================================================

Jika template digunakan
untuk dokumen production:

template version harus
dapat dilacak.

Contoh:

Template v1
Template v2.

Dokumen yang sudah
diterbitkan tidak boleh
berubah hanya karena
template baru diedit.

==================================================
9. VARIABLE SYSTEM
==================================================

Gunakan variable
yang berasal dari
database.

Contoh:

{{school_name}}
{{unit_name}}
{{school_address}}
{{letter_number}}
{{letter_date}}
{{recipient_name}}
{{subject}}
{{employee_name}}
{{student_name}}
{{position}}.

Jangan menggunakan
random hardcoded value.

==================================================
10. VARIABLE VALIDATION
==================================================

Sebelum render:

parse template
↓
deteksi variable
↓
validasi variable
↓
resolve data
↓
render.

Jika variable tidak
tersedia:

JANGAN menghasilkan
dokumen diam-diam.

Tampilkan validation error.

==================================================
11. PREVIEW
==================================================

Preview harus menggunakan
rendering engine yang sama
dengan PDF.

Target:

Preview
≈
PDF
≈
Print.

Tidak boleh:

Preview berbeda
PDF berbeda
Print berbeda.

==================================================
12. PAPER SIZE
==================================================

Dukung configuration:

A4
A5
F4/Folio
Letter
Legal

jika renderer existing
mendukung.

Ukuran harus dapat
ditentukan dari template
atau document configuration.

==================================================
13. ORIENTATION
==================================================

Dukung:

Portrait
Landscape.

==================================================
14. MARGIN
==================================================

Dukung:

top
right
bottom
left.

Satuan harus konsisten.

Jangan mencampur:

px
pt
mm

tanpa conversion layer
yang jelas.

==================================================
15. FONT
==================================================

Template harus dapat
menentukan:

font family
font size
font weight
line height
letter spacing.

Font harus tersedia
pada renderer.

Jika font tidak tersedia:

gunakan configured fallback.

Jangan menghasilkan
dokumen dengan layout
rusak.

==================================================
16. PARAGRAPH
==================================================

Dukung:

alignment
indent
line spacing
paragraph spacing.

==================================================
17. TABLE
==================================================

Dokumen harus dapat
merender:

table
row
column
border
header
cell alignment
merge
page break.

==================================================
18. SIGNATURE
==================================================

Signature block
harus mendukung:

nama
jabatan
NIP/NIY jika ada
tanggal
signature image jika
architecture mendukung.

Jangan hardcode
nama pejabat.

==================================================
19. DIGITAL SIGNATURE
==================================================

Jika digital signature
belum tersedia:

JANGAN membuat
pseudo digital signature.

Gunakan signature block
existing.

==================================================
20. NOMOR SURAT
==================================================

Nomor surat harus:

dynamic
unique
configurable
traceable.

Jika existing memiliki
numbering engine:

gunakan engine tersebut.

JANGAN membuat
numbering engine kedua.

==================================================
21. NOMOR OTOMATIS
==================================================

Jika automatic numbering
aktif:

generate
↓
validate uniqueness
↓
transaction
↓
save.

Tidak boleh terjadi
duplicate document number.

==================================================
22. DOCUMENT STATUS
==================================================

Gunakan status existing.

Contoh:

DRAFT
REVIEW
APPROVED
PUBLISHED
ARCHIVED
CANCELLED.

Jangan membuat status
duplicate.

==================================================
23. WORKFLOW
==================================================

Jika dokumen membutuhkan
approval:

DRAFT
↓
SUBMIT
↓
REVIEW
↓
APPROVE
↓
PUBLISH
↓
ARCHIVE.

Permission harus
diperiksa di setiap tahap.

==================================================
24. IMMUTABILITY
==================================================

Dokumen yang sudah
PUBLISHED:

tidak boleh diubah
secara bebas.

Jika perlu perubahan:

CREATE REVISION
atau
CREATE NEW DOCUMENT

sesuai architecture
existing.

==================================================
25. PDF
==================================================

PDF harus:

valid
readable
font embedded jika
diperlukan
layout stabil
page size benar
orientation benar
metadata benar.

==================================================
26. WORD
==================================================

Word output harus:

DOCX valid
editable
font benar
margin benar
table benar
header/footer benar.

Jangan hanya rename
file menjadi .docx.

==================================================
27. PRINT
==================================================

Print harus:

menggunakan document
yang sama.

User dapat:

print
save PDF
download.

==================================================
28. DOWNLOAD
==================================================

Download harus:

authentication
authorization
scope.

Jangan membuat
file private menjadi
public URL tanpa
protection.

==================================================
29. FILE STORAGE
==================================================

Gunakan storage
existing.

Jangan membuat
storage engine kedua.

Metadata:

document_id
file_name
mime
size
storage_path
checksum
version.

==================================================
30. FILE INTEGRITY
==================================================

Setelah render:

validate file
↓
calculate checksum
↓
store metadata
↓
archive.

Jika gagal:

jangan tandai
dokumen sebagai
PUBLISHED.

==================================================
31. DOCUMENT ARCHIVE
==================================================

Archive harus
menyimpan:

document
version
template version
created_by
approved_by
published_at
file metadata.

==================================================
32. DOCUMENT PREVIEW
==================================================

Preview harus
memiliki:

loading
error
empty
rendered state.

Tidak boleh menampilkan
dummy document.

==================================================
33. DOCUMENT CRUD
==================================================

WAJIB:

CREATE
READ
DETAIL
UPDATE
DELETE/ARCHIVE
SEARCH
FILTER
EXPORT
PREVIEW
PRINT
DOWNLOAD.

Untuk published document:

DELETE harus mengikuti
immutability policy.

==================================================
34. MODAL
==================================================

Pastikan:

Create Document
Edit Document
Detail Document
Template Editor
Preview
Delete/Archive
Approval

benar-benar berfungsi.

==================================================
35. TEMPLATE EDITOR
==================================================

Editor harus menyimpan:

template configuration
dan content.

Jangan hanya menyimpan
HTML/CSS tanpa metadata
yang dibutuhkan renderer.

==================================================
36. FRONTEND / BACKEND
==================================================

Frontend:

Template Editor
↓
REST API
↓
DocumentService
↓
Database.

Backend tetap
source of truth.

==================================================
37. SECURITY
==================================================

User hanya dapat
mengakses dokumen sesuai:

role
permission
unit
ownership
workflow status.

==================================================
38. DOCUMENT IDOR
==================================================

Test:

User A
→ /documents/B

harus ditolak jika
tidak memiliki akses.

==================================================
39. MASS EXPORT
==================================================

Export banyak dokumen
harus:

authorize
filter
paginate/batch
rate limit
queue jika besar.

Jangan membuat request
yang menghabiskan memory
server.

==================================================
40. BULK PDF
==================================================

Jika bulk PDF existing:

gunakan job/queue
sesuai architecture.

Status:

QUEUED
PROCESSING
COMPLETED
FAILED.

==================================================
41. ERROR HANDLING
==================================================

Jika render gagal:

dokumen tidak boleh
dianggap berhasil
diterbitkan.

Tampilkan:

error
reason
retry.

==================================================
42. FONT ERROR
==================================================

Jika font unavailable:

log internal
gunakan fallback
jangan menghasilkan
layout rusak.

==================================================
43. PAGE BREAK
==================================================

Pastikan:

paragraph
table
signature
header
footer

tidak terpotong
secara tidak wajar.

==================================================
44. HEADER / FOOTER
==================================================

Dukung:

page number
document number
footer text
confidentiality label
institution identity.

==================================================
45. MULTI UNIT
==================================================

Dokumen Unit A:

harus menggunakan
identitas Unit A.

Dokumen Unit B:

harus menggunakan
identitas Unit B.

Tidak boleh tertukar.

==================================================
46. HISTORICAL DOCUMENT
==================================================

Dokumen yang sudah
diterbitkan harus tetap
merepresentasikan
informasi pada saat
diterbitkan.

Jangan otomatis
mengubah semua dokumen
lama ketika:

logo berubah
alamat berubah
kepala berubah
template berubah.

==================================================
47. REPORT EXPORT
==================================================

Export report harus
menggunakan source data
yang sama dengan
screen/report.

==================================================
48. PDF SECURITY
==================================================

Jika PDF private:

authorization sebelum
download.

Jika signed/public:

gunakan policy existing.

==================================================
49. WORD SECURITY
==================================================

DOCX private juga
harus mengikuti
document authorization.

==================================================
50. DOCUMENT AUDIT
==================================================

Catat:

created
updated
submitted
reviewed
approved
published
downloaded
printed
archived
revised.

==================================================
51. PERFORMANCE
==================================================

Audit:

large document
large table
large image
many pages
bulk export.

Gunakan:

stream
queue
batch
cache

jika architecture
existing mendukung.

==================================================
52. STORAGE CLEANUP
==================================================

Jangan menghapus
file hanya karena
database record
dihapus.

Gunakan safe cleanup
policy.

==================================================
53. ORPHAN FILE
==================================================

Cari:

file tanpa metadata
metadata tanpa file
document tanpa file
file tanpa document.

Jangan langsung hapus.

Laporkan terlebih dahulu.

==================================================
54. TEMPLATE ORPHAN
==================================================

Cari template:

unused
deprecated
duplicate
active.

Hanya satu template
default aktif per:

document type
unit

jika business rule
memang demikian.

==================================================
55. DUPLICATE TEMPLATE
==================================================

Jika terdapat template
dengan fungsi sama:

MARK:

PRIMARY
LEGACY
DUPLICATE.

Jangan membuat template
ketiga.

==================================================
56. DOCUMENT NUMBER
==================================================

Test concurrent creation:

Request A
Request B

harus menghasilkan
nomor unik.

==================================================
57. PRINT CSS
==================================================

Audit print layout:

page size
margin
page break
header
footer
table.

Jangan mengandalkan
screen CSS sepenuhnya.

==================================================
58. BROWSER
==================================================

Test:

Chrome
Firefox
Edge/Safari
sesuai platform
yang memang didukung
project.

==================================================
59. PWA
==================================================

Pastikan document
download/print tidak
rusak karena service
worker cache.

==================================================
60. MOBILE
==================================================

Flutter/PWA hanya
memanggil document API.

Jangan membuat
PDF business logic
berbeda di mobile.

==================================================
61. NO DUMMY
==================================================

Production tidak boleh
menampilkan:

sample letter
sample student
sample employee
sample invoice
sample report.

Jika database kosong:

EMPTY STATE.

==================================================
62. NO SIMULATION
==================================================

Hapus/disable hanya
simulation mode yang
benar-benar production
facing.

Jangan menghapus
unit/integration tests.

==================================================
63. TEST DOCUMENT
==================================================

WAJIB test:

Surat
SK
Surat Tugas
Undangan
Berita Acara
Notulen
Dokumen TU
Dokumen kepegawaian
Dokumen siswa
Dokumen keuangan.

Hanya test jenis yang
memang tersedia di
codebase.

==================================================
64. TEST OUTPUT
==================================================

Untuk setiap document:

Preview PASS
PDF PASS
Word PASS
Print PASS
Download PASS
Archive PASS.

==================================================
65. FINAL VALIDATION
==================================================

Check:

[ ] Kop dinamis
[ ] Logo dinamis
[ ] Identitas unit benar
[ ] Template benar
[ ] Font benar
[ ] Margin benar
[ ] Paper size benar
[ ] Orientation benar
[ ] Variable benar
[ ] Signature benar
[ ] Nomor surat unique
[ ] PDF valid
[ ] DOCX valid
[ ] Print valid
[ ] Download secure
[ ] Archive valid
[ ] Audit valid
[ ] No dummy
[ ] No simulation.

==================================================
66. FINAL REPORT
==================================================

Laporkan:

1. Document engine audited
2. Duplicate engines found
3. Templates audited
4. Duplicate templates
5. PDF issues
6. Word issues
7. Print issues
8. Font issues
9. Layout issues
10. Storage issues
11. Security issues
12. Permission issues
13. Unit-scope issues
14. Numbering issues
15. Archive issues
16. Fixed issues
17. Remaining blockers
18. Tests passed.

==================================================
67. FINAL RULE
==================================================

SATU DOCUMENT SERVICE.

SATU TEMPLATE ARCHITECTURE.

SATU DATA SOURCE.

SATU DOCUMENT WORKFLOW.

SATU STORAGE ARCHITECTURE.

PREVIEW = PDF = PRINT.

WEB DAN MOBILE
MENGGUNAKAN BACKEND YANG SAMA.

JANGAN MEMBUAT ENGINE BARU.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MERUSAK DATA PRODUKSI.

STOP JIKA ADA KONFLIK
ARSITEKTUR KRITIS.

# END OF 157