# ENTERPRISE SCOPE LOCK
# MANAGEMENT SEKOLAH & PONDOK PESANTREN

## STATUS

APLIKASI INI ADALAH:

ENTERPRISE MANAGEMENT SYSTEM
UNTUK SEKOLAH DAN PONDOK PESANTREN.

APLIKASI LEGER / AKADEMIK
SUDAH DIMILIKI SECARA TERPISAH.

==================================================
1. ABSOLUTE SCOPE RULE
==================================================

JANGAN MEMBUAT ATAU MENGEMBALIKAN
MODULE AKADEMIK.

JANGAN MEMBUAT ATAU MENGEMBALIKAN
MODULE KBM.

JANGAN MEMBUAT ATAU MENGEMBALIKAN
MODULE LEGER.

JANGAN MEMBUAT ATAU MENGEMBALIKAN
MODULE RAPOR.

JANGAN MEMBUAT ATAU MENGEMBALIKAN
MODULE PENILAIAN.

==================================================
2. MODULE YANG DILARANG
==================================================

REMOVE / DISABLE / DO NOT CREATE:

Akademik
KBM
Kurikulum
Mata Pelajaran
Jadwal Pelajaran
Penilaian
Nilai
KKM
Leger
Rapor
Transkrip
Kenaikan Kelas
Pembagian Tugas Akademik
Jurnal KBM
Perangkat Pembelajaran

==================================================
3. EXISTING LEGER APPLICATION
==================================================

LEGER DAN AKADEMIK
DITANGANI OLEH APLIKASI TERPISAH.

JANGAN DUPLIKASI FUNCTIONALITY.

Jika diperlukan integrasi:

gunakan API integration
atau integration contract.

JANGAN MEMBUAT
SECOND LEGER ENGINE.

==================================================
4. APPLICATION PURPOSE
==================================================

Fokus aplikasi:

MANAGEMENT
ADMINISTRATION
STUDENT MANAGEMENT
EMPLOYEE MANAGEMENT
ATTENDANCE
DOCUMENT
ARCHIVE
ORGANIZATION
INVENTORY
REPORTING
AUDIT
SYSTEM CONFIGURATION.

==================================================
5. STUDENT DATA
==================================================

Data siswa tetap diperbolehkan.

Tetapi hanya untuk kebutuhan:

IDENTITAS
ADMINISTRASI
KARTU PELAJAR
QR
ABSENSI
DOKUMEN
ARSIP
LAPORAN MANAGEMENT.

JANGAN menambahkan:

nilai
mata pelajaran
KKM
rapor
leger
KBM.

==================================================
6. EMPLOYEE DATA
==================================================

Data:

Guru
Karyawan
Staff

tetap diperbolehkan.

Tetapi untuk:

kepegawaian
identitas
dokumen
jabatan
absensi
GPS
QR/barcode
administrasi.

==================================================
7. ATTENDANCE
==================================================

ABSENSI ADALAH
CORE MODULE.

### SISWA

Metode:

QR Kartu Pelajar
Barcode
Scan oleh Security
Scan oleh Guru
Manual oleh Guru

### GURU/KARYAWAN

Metode:

GPS
QR/barcode
metode lain yang memang
sudah tersedia.

==================================================
8. NO ACADEMIC LOGIC
==================================================

Attendance tidak boleh
bergantung pada:

nilai
rapor
legger
mata pelajaran
KBM.

==================================================
9. MASTER DATA
==================================================

Master Data boleh memiliki:

Student
Employee
Organization
Unit
Room
Position
Guardian.

Tetapi jangan menambahkan
academic entities.

==================================================
10. DATABASE RULE
==================================================

SCAN DATABASE SEBELUM
MEMBUAT TABLE BARU.

JANGAN membuat table:

grades
scores
subjects
curriculum
lessons
report_cards
legers

untuk kebutuhan aplikasi ini.

Jika table tersebut berasal
dari legacy code:

IDENTIFY
DO NOT DUPLICATE
DO NOT EXTEND
DO NOT CREATE DEPENDENCY
tanpa alasan yang sah.

==================================================
11. MENU RULE
==================================================

MENU NAVIGATION harus
hanya menampilkan module
yang benar-benar aktif.

Tidak boleh ada:

Academic
KBM
Leger
Rapor

di sidebar/navigation.

==================================================
12. ROUTE RULE
==================================================

Scan seluruh routes.

Temukan route:

academic
kbm
curriculum
leger
rapor
assessment

dan:

REMOVE
DISABLE
atau
DEPRECATE

sesuai kondisi codebase.

Jangan meninggalkan
broken route.

==================================================
13. API RULE
==================================================

Scan seluruh API.

API akademik yang tidak
digunakan:

REMOVE / DEPRECATE

Jangan membuat endpoint
akademik baru.

==================================================
14. FRONTEND RULE
==================================================

Scan:

pages
components
hooks
services
routes
navigation.

Hapus dependency
akademik yang tidak
digunakan.

==================================================
15. DATABASE RULE
==================================================

JANGAN melakukan DROP
database production
secara sembarangan.

Jika terdapat legacy
academic tables:

AUDIT terlebih dahulu.

Kemudian tentukan:

ACTIVE
LEGACY
UNUSED
SAFE TO REMOVE.

==================================================
16. DUPLICATE PREVENTION
==================================================

SEBELUM MEMBUAT FITUR:

SEARCH EXISTING:

TABLE
MODEL
API
SERVICE
PAGE
COMPONENT
HOOK
ROUTE
PERMISSION.

==================================================
17. INTEGRATION WITH LEGER
==================================================

Jika suatu saat
integrasi diperlukan:

Management Application
        ↓
Integration API
        ↓
Existing Leger Application

BUKAN:

Management Application
        ↓
Second Leger Engine.

==================================================
18. REPORTING
==================================================

Laporan aplikasi hanya
untuk management:

attendance
employee
student
document
administration
inventory
audit.

Jangan membuat
laporan nilai akademik.

==================================================
19. DOCUMENT
==================================================

Tetap dukung:

Surat
SK
Surat Tugas
Surat Orang Tua
Surat Keterangan
Surat Masuk
Surat Keluar
Arsip.

==================================================
20. PRODUCTION RULE
==================================================

JANGAN menggunakan:

dummy data
simulation
mock data
hardcoded institution
hardcoded student
hardcoded employee.

==================================================
21. DYNAMIC RULE
==================================================

Semua data harus berasal
dari database/API.

==================================================
22. FINAL AUDIT
==================================================

SCAN SELURUH PROJECT.

Cari keyword:

academic
akademik
kbm
curriculum
kurikulum
leger
rapor
raport
nilai
assessment
subject
mata pelajaran
grade
kkm
lesson.

Kelompokkan hasil:

ACTIVE
LEGACY
UNUSED
DUPLICATE
SAFE TO REMOVE.

==================================================
23. FINAL UI AUDIT
==================================================

Pastikan sidebar/menu
tidak memiliki:

Akademik
KBM
Kurikulum
Leger
Rapor
Penilaian.

==================================================
24. FINAL DATABASE AUDIT
==================================================

Pastikan module aktif
tidak mempunyai dependency
terhadap engine akademik.

==================================================
25. FINAL API AUDIT
==================================================

Pastikan API aktif
tidak memanggil
academic service.

==================================================
26. FINAL REGRESSION
==================================================

Test:

LOGIN
RBAC
MASTER DATA
STUDENT
EMPLOYEE
ATTENDANCE
QR
GPS
DOCUMENT
ARCHIVE
REPORT
AUDIT
SETTINGS.

==================================================
27. FINAL OUTPUT
==================================================

Tampilkan:

1. ACTIVE MODULES
2. REMOVED MODULES
3. LEGACY MODULES
4. ACADEMIC REFERENCES FOUND
5. KBM REFERENCES FOUND
6. LEGER REFERENCES FOUND
7. RAPOR REFERENCES FOUND
8. DUPLICATE FEATURES
9. DATABASE IMPACT
10. API IMPACT
11. FRONTEND IMPACT
12. RBAC IMPACT
13. TEST RESULT
14. BUILD RESULT
15. FINAL STATUS.

==================================================
28. FINAL PRINCIPLE
==================================================

APLIKASI INI BUKAN:

ACADEMIC MANAGEMENT SYSTEM.

APLIKASI INI ADALAH:

SCHOOL & PESANTREN
MANAGEMENT SYSTEM.

AKADEMIK / KBM / LEGER
DITANGANI OLEH
APLIKASI LEGER TERPISAH.

JANGAN DUPLIKASI.

# END SCOPE LOCK