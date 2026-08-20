# MASTER SCOPE & ARCHITECTURE
# ENTERPRISE SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION SCOPE LOCK

============================================================
0. IDENTITAS APLIKASI
============================================================

Nama sistem:

ENTERPRISE SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

Tujuan:

Membangun aplikasi management sekolah dan pondok pesantren
yang fokus pada:

1. Administrasi
2. Tata Usaha
3. Master Data
4. Kepegawaian
5. Absensi
6. Kartu Identitas
7. Dokumen
8. Arsip
9. Inventaris
10. Keuangan
11. Notifikasi
12. Reporting
13. Audit & Compliance
14. System Administration

APLIKASI INI BUKAN APLIKASI AKADEMIK.

============================================================
1. SISTEM AKADEMIK TERPISAH
============================================================

LEMBAGA SUDAH MEMILIKI:

- Aplikasi KBM
- Aplikasi Leger
- Aplikasi Akademik

yang berdiri secara terpisah.

Oleh karena itu:

JANGAN MEMBUAT ULANG
fungsi akademik di aplikasi ini.

Jika diperlukan hubungan dengan aplikasi akademik,
gunakan:

API
INTEGRATION
SYNC
IMPORT/EXPORT

sesuai kebutuhan.

JANGAN MEMBUAT DUPLIKASI ENGINE.

============================================================
2. DOMAIN YANG DILARANG
============================================================

JANGAN MEMBUAT:

❌ Akademik
❌ KBM
❌ Kurikulum
❌ Mata Pelajaran
❌ Jadwal Pelajaran
❌ Penilaian
❌ Nilai
❌ KKM
❌ Leger
❌ Rapor
❌ Transkrip
❌ Ranking Akademik
❌ Kenaikan Kelas
❌ Jurnal KBM
❌ Perangkat Pembelajaran
❌ Modul Ajar
❌ ATP
❌ CP/TP
❌ Pengolahan Nilai

Jika menemukan legacy code terkait domain tersebut:

JANGAN LANGSUNG HAPUS.

Lakukan:

SCAN
↓
IDENTIFY
↓
CLASSIFY
↓
CHECK DEPENDENCY
↓
REMOVE/DEPRECATE
sesuai keamanan production.

============================================================
3. CORE BUSINESS DOMAIN
============================================================

Aplikasi dibangun berdasarkan 7 CORE DOMAIN:

CORE 1
MASTER DATA

CORE 2
KEPEGAWAIAN

CORE 3
ABSENSI

CORE 4
TATA USAHA

CORE 5
DOKUMEN & ARSIP

CORE 6
INVENTARIS & KEUANGAN

CORE 7
AUDIT, REPORTING & SYSTEM ADMINISTRATION

============================================================
4. CORE 1 — MASTER DATA
============================================================

Master data menjadi sumber data utama.

------------------------------------------------------------
4.1 LEMBAGA
------------------------------------------------------------

Data:

- Nama lembaga
- Nama yayasan
- NPSN jika ada
- NSM jika ada
- NPSN/identitas lainnya
- alamat
- telepon
- email
- website
- logo
- kepala lembaga
- informasi legal
- informasi operasional

------------------------------------------------------------
4.2 UNIT
------------------------------------------------------------

Support:

- sekolah
- madrasah
- pesantren
- PKBM
- unit lain

sesuai konfigurasi lembaga.

------------------------------------------------------------
4.3 SISWA/SANTRI
------------------------------------------------------------

Data:

- identitas
- nomor induk
- NISN jika ada
- NIK jika ada
- nama
- tempat lahir
- tanggal lahir
- jenis kelamin
- alamat
- kontak
- foto
- status
- unit
- tahun masuk
- orang tua/wali
- dokumen
- QR Code

Data siswa digunakan untuk:

- administrasi
- kartu pelajar
- absensi
- dokumen
- arsip
- laporan management

BUKAN untuk:

- nilai
- KBM
- leger
- rapor.

------------------------------------------------------------
4.4 ORANG TUA/WALI
------------------------------------------------------------

Data:

- nama
- hubungan
- NIK jika diperlukan
- pekerjaan
- nomor HP
- email
- alamat
- kontak darurat.

------------------------------------------------------------
4.5 GURU
------------------------------------------------------------

Data:

- identitas
- NIP/NUPTK/NIY jika tersedia
- jabatan
- unit
- status
- kontak
- foto
- dokumen
- QR/barcode
- data absensi.

------------------------------------------------------------
4.6 KARYAWAN
------------------------------------------------------------

Data:

- identitas
- jabatan
- unit
- status
- kontak
- foto
- dokumen
- QR/barcode
- absensi.

============================================================
5. CORE 2 — KEPEGAWAIAN
============================================================

Fokus pada administrasi SDM.

FITUR:

- data guru
- data karyawan
- jabatan
- unit
- status kepegawaian
- riwayat pekerjaan
- kontrak
- dokumen
- SK
- surat tugas
- izin
- cuti
- keterlambatan
- rekap kehadiran.

Tidak mengelola:

- jadwal KBM
- nilai
- mata pelajaran
- penilaian akademik.

============================================================
6. CORE 3 — ABSENSI
============================================================

ABSENSI ADALAH CORE FEATURE UTAMA.

------------------------------------------------------------
6.1 ABSENSI SISWA
------------------------------------------------------------

Metode:

A. QR KARTU PELAJAR

Siswa memiliki kartu pelajar
dengan QR Code unik.

Flow:

KARTU
↓
SCAN QR
↓
IDENTIFIKASI SISWA
↓
VALIDASI
↓
CEK JADWAL OPERASIONAL ABSENSI
jika memang diperlukan
↓
CATAT ABSENSI
↓
AUDIT LOG

------------------------------------------------------------
6.2 SECURITY GATE
------------------------------------------------------------

Security dapat menggunakan HP.

Flow:

SECURITY LOGIN
↓
SCAN QR SISWA
↓
VALIDASI IDENTITAS
↓
VALIDASI STATUS SISWA
↓
CATAT ABSENSI MASUK
↓
TIMESTAMP
↓
DEVICE
↓
SECURITY USER
↓
AUDIT.

------------------------------------------------------------
6.3 ABSENSI OLEH GURU
------------------------------------------------------------

Guru dapat melakukan:

SCAN QR

atau

MANUAL INPUT.

Guru:

LOGIN
↓
PILIH KONTEKS ABSENSI
↓
SCAN / MANUAL
↓
VALIDASI
↓
SIMPAN
↓
AUDIT.

CATATAN:

Konteks absensi guru tidak boleh
bergantung pada engine KBM/Leger.

Jika diperlukan identitas kelas/kelompok,
gunakan master data management yang sederhana,
bukan membuat engine akademik baru.

------------------------------------------------------------
6.4 ABSENSI MANUAL
------------------------------------------------------------

Guru/security/admin yang memiliki
permission dapat mencatat:

- Hadir
- Izin
- Sakit
- Alpa
- Terlambat
- Pulang
- Status lain sesuai konfigurasi.

Semua perubahan manual harus
memiliki audit trail.

------------------------------------------------------------
6.5 ABSENSI GURU/KARYAWAN
------------------------------------------------------------

Metode:

GPS
QR/BARCODE
atau kombinasi sesuai konfigurasi.

Flow:

LOGIN
↓
VALIDASI USER
↓
VALIDASI DEVICE
↓
GPS
↓
GEOFENCE
↓
VALIDASI LOKASI
↓
ABSENSI
↓
TIMESTAMP
↓
AUDIT.

------------------------------------------------------------
6.6 GPS
------------------------------------------------------------

Simpan jika tersedia:

latitude
longitude
accuracy
timestamp
device
user
location
distance from allowed point.

Jangan menganggap GPS valid
hanya karena permission browser/device aktif.

============================================================
7. CORE 4 — TATA USAHA
============================================================

TATA USAHA menjadi salah satu
module utama.

------------------------------------------------------------
7.1 SURAT MASUK
------------------------------------------------------------

Fitur:

- nomor surat
- tanggal
- pengirim
- tujuan
- perihal
- file
- status
- disposisi
- arsip.

------------------------------------------------------------
7.2 SURAT KELUAR
------------------------------------------------------------

Fitur:

- nomor otomatis
- tanggal
- tujuan
- perihal
- template
- penandatangan
- lampiran
- PDF
- Word
- arsip.

------------------------------------------------------------
7.3 GENERATOR SURAT
------------------------------------------------------------

Harus mendukung:

- template dinamis
- kop surat
- logo
- nomor surat
- tanggal
- tujuan
- isi
- penandatangan
- jabatan
- footer
- margin
- font
- ukuran kertas.

------------------------------------------------------------
7.4 TEMPLATE SURAT
------------------------------------------------------------

Admin dapat membuat:

- template
- kategori
- variable
- layout
- numbering
- signature
- kop surat.

------------------------------------------------------------
7.5 OUTPUT
------------------------------------------------------------

Support:

PDF
DOCX
PRINT
DOWNLOAD

Hasil harus konsisten dengan
preview aplikasi.

============================================================
8. CORE 5 — DOKUMEN & ARSIP
============================================================

Document Management System.

------------------------------------------------------------
8.1 DOKUMEN SISWA
------------------------------------------------------------

Contoh:

- KK
- Akta
- KTP orang tua
- ijazah
- sertifikat
- dokumen lainnya.

------------------------------------------------------------
8.2 DOKUMEN GURU
------------------------------------------------------------

Contoh:

- ijazah
- SK
- sertifikat
- kontrak
- dokumen kepegawaian.

------------------------------------------------------------
8.3 DOKUMEN KARYAWAN
------------------------------------------------------------

Sama dengan kebutuhan
administrasi kepegawaian.

------------------------------------------------------------
8.4 ARSIP LEMBAGA
------------------------------------------------------------

Contoh:

- SK
- izin operasional
- akreditasi
- legalitas
- surat dinas
- dokumen yayasan.

------------------------------------------------------------
8.5 DOCUMENT SECURITY
------------------------------------------------------------

Pastikan:

authorization
ownership
access control
file validation
storage security
audit log.

============================================================
9. CORE 6 — INVENTARIS
============================================================

FITUR:

- kategori barang
- barang
- kode inventaris
- barcode
- lokasi
- kondisi
- penanggung jawab
- peminjaman
- pengembalian
- pemeliharaan
- mutasi
- penghapusan
- riwayat.

============================================================
10. CORE 6B — KEUANGAN
============================================================

Jika module keuangan sudah
menjadi bagian project:

pertahankan dan rapikan.

Fokus:

- kas
- bank
- transaksi
- pemasukan
- pengeluaran
- anggaran
- pembayaran
- SPP
- honor
- payroll
- BKU
- SPJ
- laporan.

JANGAN membuat logic akademik
di module keuangan.

============================================================
11. CORE 7 — REPORTING
============================================================

Laporan:

SISWA
KEPEGAWAIAN
ABSENSI
SURAT
DOKUMEN
ARSIP
INVENTARIS
KEUANGAN
AUDIT.

Tidak ada:

Laporan Nilai
Leger
Rapor
KBM.

============================================================
12. AUDIT & COMPLIANCE
============================================================

Catat:

USER
ACTION
MODULE
RECORD
TIMESTAMP
IP jika tersedia
DEVICE jika tersedia.

Contoh:

USER:
Security 01

ACTION:
SCAN QR

STUDENT:
Siswa 001

TIME:
08:02

DEVICE:
Android Device

RESULT:
SUCCESS

============================================================
13. ROLE & PERMISSION
============================================================

Role minimal:

SUPER ADMIN
ADMIN
TU
KEPALA
GURU
SECURITY
BENDAHARA
STAFF
USER

Permission harus granular.

Contoh:

attendance.student.scan
attendance.student.manual
attendance.employee.gps
attendance.correct
attendance.report

document.create
document.update
document.delete
document.download

letter.create
letter.approve
letter.print

============================================================
14. DASHBOARD
============================================================

Dashboard harus dinamis.

Jangan menggunakan:

dummy statistics
hardcoded numbers
mock charts.

Data berasal dari database/API.

Dashboard dapat menampilkan:

jumlah siswa
guru
karyawan
absensi hari ini
surat
dokumen
inventaris
transaksi
notifikasi.

============================================================
15. NOTIFICATION
============================================================

Support:

absensi
surat
dokumen
kepegawaian
inventaris
keuangan
system alert.

============================================================
16. INTEGRATION DENGAN LEGER/KBM
============================================================

Jika dibutuhkan:

buat Integration Layer.

Contoh:

MANAGEMENT API
      ↓
INTEGRATION SERVICE
      ↓
LEGER/KBM API

Gunakan:

API
API KEY/OAUTH/JWT
WEBHOOK
SYNC LOG
ERROR LOG

sesuai arsitektur.

JANGAN membuat database
akademik kedua hanya untuk
sinkronisasi.

============================================================
17. MASTER IDENTITY
============================================================

Pastikan siswa/guru/karyawan
memiliki identity identifier
yang stabil.

Contoh:

student_id
employee_id
guardian_id

Identifier tidak boleh
berubah hanya karena
perubahan data administratif.

============================================================
18. DUPLICATE PREVENTION
============================================================

SEBELUM MEMBUAT:

TABLE
MODEL
SERVICE
CONTROLLER
API
PAGE
COMPONENT
HOOK
ROUTE
PERMISSION

WAJIB:

SEARCH EXISTING CODEBASE.

Jika sudah ada:

REUSE.

Jangan duplicate.

============================================================
19. DATABASE
============================================================

DATABASE HARUS MENGIKUTI
BUSINESS DOMAIN.

Relasi harus:

valid
consistent
indexed
foreign-key safe
transaction safe.

Jangan membuat table
akademik.

============================================================
20. API
============================================================

API harus:

RESTful jika architecture
menggunakannya.

Harus memiliki:

validation
authorization
error handling
pagination
filter
search
sorting.

============================================================
21. CRUD
============================================================

Setiap module yang
mendukung CRUD harus memiliki:

CREATE
READ
UPDATE
DELETE

sesuai permission.

Pastikan:

form
validation
API
database
cache
UI

sinkron.

============================================================
22. PRODUCTION DATA
============================================================

DILARANG:

dummy data
mock data
simulation
fake statistics
hardcoded student
hardcoded employee
hardcoded institution.

============================================================
23. PRINT & EXPORT
============================================================

Semua print/export
harus mengambil data aktual.

Support jika module membutuhkan:

PDF
DOCX
XLSX
CSV
PRINT.

============================================================
24. ERROR HANDLING
============================================================

Jika terjadi error:

jangan hide error.

Tampilkan:

loading
empty
error
success

dengan aman.

Production tidak boleh
menampilkan:

stack trace
SQL detail
secret
internal path.

============================================================
25. FRONTEND
============================================================

Pastikan:

Provider
Router
Auth
RBAC
API Client
Query Client
State Management

tersusun dengan benar.

TanStack Query jika digunakan
harus memiliki:

QueryClientProvider

pada root architecture
yang benar.

Jangan membuat QueryClient
di setiap component.

============================================================
26. SECURITY
============================================================

Pastikan:

authentication
authorization
RBAC
input validation
file validation
rate limiting
CSRF/CORS sesuai architecture
secret management
audit.

============================================================
27. MOBILE / RESPONSIVE
============================================================

Aplikasi harus nyaman
digunakan dari:

Desktop
Tablet
HP.

Terutama:

QR scanner
absensi
GPS
TU
security.

============================================================
28. QR SECURITY
============================================================

QR Code tidak boleh
menjadi satu-satunya
mekanisme authorization.

Flow:

SCAN
↓
IDENTIFY
↓
AUTHORIZATION
↓
VALIDATION
↓
TRANSACTION
↓
AUDIT.

============================================================
29. GPS SECURITY
============================================================

GPS attendance harus
memvalidasi:

user
device
location
accuracy
time
permission
geofence.

============================================================
30. OFFLINE / NETWORK
============================================================

Jika offline support
memang tersedia:

jelaskan:

offline data
sync queue
conflict resolution.

Jika belum tersedia:

JANGAN mengklaim
offline support.

============================================================
31. PERFORMANCE
============================================================

Gunakan:

pagination
lazy loading
query optimization
index
cache
debounce search

sesuai kebutuhan.

============================================================
32. PRODUCTION ARCHITECTURE
============================================================

FLOW:

USER
 ↓
AUTHENTICATION
 ↓
RBAC
 ↓
MODULE
 ↓
SERVICE
 ↓
VALIDATION
 ↓
DATABASE/API
 ↓
AUDIT
 ↓
RESPONSE.

============================================================
33. MENU STRUCTURE
============================================================

Sidebar final:

DASHBOARD

MASTER DATA
├── Lembaga
├── Unit
├── Siswa/Santri
├── Orang Tua/Wali
├── Guru
└── Karyawan

KEPEGAWAIAN
├── Guru
├── Karyawan
├── Jabatan
├── Status
└── Dokumen

ABSENSI
├── Siswa
├── Guru/Karyawan
├── QR Scanner
├── GPS Attendance
├── Manual Attendance
├── Rekap
├── Koreksi
└── Audit

KARTU & IDENTITAS
├── Kartu Pelajar
├── QR Code
├── Barcode
└── Cetak

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
├── Template
├── Dokumen
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
34. MENU YANG TIDAK BOLEH MUNCUL
============================================================

JANGAN TAMPILKAN:

Akademik
KBM
Kurikulum
Mata Pelajaran
Penilaian
Nilai
KKM
Leger
Rapor
Transkrip.

============================================================
35. PRODUCTION QUALITY GATE
============================================================

Sebelum fitur dianggap selesai:

[ ] UI selesai
[ ] API selesai
[ ] Database selesai
[ ] Validation selesai
[ ] Authorization selesai
[ ] CRUD selesai
[ ] Error handling selesai
[ ] Loading state selesai
[ ] Empty state selesai
[ ] Audit selesai
[ ] Print/export selesai jika diperlukan
[ ] Responsive selesai
[ ] Test selesai
[ ] No duplicate
[ ] No dummy data.

============================================================
36. FINAL SYSTEM AUDIT
============================================================

SCAN SELURUH PROJECT.

Cari:

academic
akademik
kbm
curriculum
kurikulum
lesson
subject
assessment
grade
nilai
leger
rapor
raport
kkm.

Kelompokkan:

ACTIVE
LEGACY
UNUSED
DUPLICATE
SAFE TO REMOVE.

Jangan langsung menghapus
tanpa dependency analysis.

============================================================
37. FINAL TEST
============================================================

WAJIB TEST:

LOGIN
LOGOUT
RBAC
MASTER DATA
STUDENT CRUD
EMPLOYEE CRUD
ATTENDANCE
QR
GPS
MANUAL ATTENDANCE
DOCUMENT
LETTER
ARCHIVE
INVENTORY
FINANCE
REPORT
AUDIT.

============================================================
38. FINAL PRODUCTION VALIDATION
============================================================

Pastikan:

DATABASE
↓
BACKEND
↓
API
↓
FRONTEND
↓
AUTH
↓
RBAC
↓
BUSINESS LOGIC
↓
PRINT
↓
EXPORT
↓
AUDIT

semuanya konsisten.

============================================================
39. ATURAN PENGEMBANGAN SELANJUTNYA
============================================================

SETIAP kali diminta membuat
fitur baru:

LANGKAH 1
Cari apakah fitur sudah ada.

LANGKAH 2
Cari database existing.

LANGKAH 3
Cari API existing.

LANGKAH 4
Cari service existing.

LANGKAH 5
Cari UI existing.

LANGKAH 6
Cari permission existing.

LANGKAH 7
Reuse jika tersedia.

LANGKAH 8
Jika belum tersedia,
buat dengan architecture
existing.

LANGKAH 9
Test regression.

LANGKAH 10
Pastikan tidak masuk
ke domain akademik.

============================================================
40. PRIORITAS DEVELOPMENT
============================================================

PRIORITAS 1

MASTER DATA
KEPEGAWAIAN
ABSENSI

PRIORITAS 2

QR
GPS
KARTU PELAJAR

PRIORITAS 3

TATA USAHA
SURAT
DOKUMEN
ARSIP

PRIORITAS 4

INVENTARIS
KEUANGAN

PRIORITAS 5

REPORTING
NOTIFICATION
AUDIT

PRIORITAS 6

INTEGRATION DENGAN
APLIKASI LEGER/KBM.

============================================================
41. PRINCIPLE
============================================================

JANGAN MEMPERBESAR APLIKASI
DENGAN MEMASUKKAN SEMUA FITUR.

BANGUN DOMAIN YANG KUAT.

MANAGEMENT
=
ADMINISTRASI + OPERASIONAL.

LEGER/KBM
=
AKADEMIK.

============================================================
42. FINAL DEFINITION
============================================================

APLIKASI MANAGEMENT:

"WHAT IS HAPPENING
IN THE INSTITUTION?"

APLIKASI LEGER/KBM:

"WHAT IS HAPPENING
IN THE LEARNING PROCESS?"

KEDUANYA TERPISAH.

============================================================
43. FINAL COMMAND
============================================================

JANGAN MEMBUAT FITUR
AKADEMIK.

JANGAN MEMBUAT FITUR
KBM.

JANGAN MEMBUAT FITUR
LEGER.

JANGAN MEMBUAT FITUR
RAPOR.

FOKUSKAN SELURUH
DEVELOPMENT PADA:

MASTER DATA
KEPEGAWAIAN
ABSENSI
QR
GPS
KARTU
TATA USAHA
SURAT
DOKUMEN
ARSIP
INVENTARIS
KEUANGAN
REPORTING
NOTIFICATION
AUDIT
SYSTEM ADMINISTRATION.

SEMUA HARUS:

DINAMIS
TERINTEGRASI
CRUD BERFUNGSI
DATABASE CONSISTENT
API CONSISTENT
RBAC CONSISTENT
AUDITABLE
PRODUCTION READY
NO DUPLICATE
NO DUMMY
NO SIMULATION.

# END MASTER SCOPE