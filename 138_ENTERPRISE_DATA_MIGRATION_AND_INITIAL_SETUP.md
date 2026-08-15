============================================================
138 — ENTERPRISE DATA MIGRATION & INITIAL SETUP
SCHOOL / PESANTREN ERP
============================================================

STATUS:
PRODUCTION INITIALIZATION

TUJUAN:
Membuat proses instalasi dan konfigurasi awal ERP yang aman,
dinamis, terstruktur, dapat diulang secara aman, dan siap
digunakan dengan DATA PRODUKSI NYATA.

PRINSIP:

INSTALL
↓
SYSTEM CHECK
↓
INITIAL SETUP
↓
ORGANIZATION
↓
UNIT
↓
ACADEMIC YEAR
↓
SEMESTER
↓
CURRICULUM
↓
MASTER DATA
↓
STAFF / TEACHER
↓
STUDENT
↓
ROMBEL
↓
TEACHER ASSIGNMENT
↓
SCHEDULE
↓
DOCUMENT CONFIGURATION
↓
ATTENDANCE CONFIGURATION
↓
NOTIFICATION
↓
VALIDATION
↓
GO LIVE

============================================================
1. ATURAN MUTLAK
============================================================

JANGAN:

- membuat data dummy otomatis
- membuat siswa dummy
- membuat guru dummy
- membuat karyawan dummy
- membuat nilai dummy
- membuat absensi dummy
- membuat rombel dummy
- membuat jadwal dummy
- membuat transaksi dummy
- membuat rapor dummy
- membuat laporan dummy.

Data awal hanya berasal dari:

1. Input administrator
2. Import file
3. Migrasi database
4. Konfigurasi sistem.

============================================================
2. FIRST INSTALLATION DETECTION
============================================================

Ketika aplikasi pertama kali dijalankan:

Periksa:

Database tersedia
Migration tersedia
System configuration
Organization configuration
Initial administrator.

Jika belum dikonfigurasi:

Redirect:

/setup

Jika setup sudah selesai:

JANGAN tampilkan setup wizard kembali
kecuali Super Admin memilih:

System Reset / Reconfiguration

dan memiliki permission khusus.

============================================================
3. SETUP LOCK
============================================================

Buat:

system_setup_status

Contoh:

NOT_STARTED
IN_PROGRESS
COMPLETED
LOCKED.

Setelah production setup selesai:

status:

LOCKED.

Setup tidak boleh dijalankan ulang secara tidak sengaja.

============================================================
4. SYSTEM HEALTH CHECK
============================================================

Sebelum setup:

Check:

Database
Migration
Storage
Environment
Cache
Queue
Mail
Google Maps
File Permission.

Tampilkan:

PASS
WARNING
FAIL.

Jika dependency critical FAIL:

Jangan lanjutkan setup.

============================================================
5. ORGANIZATION SETUP
============================================================

Input:

Nama Yayasan
Nama Legal
NPSN jika ada
NSM jika ada
NSS jika ada
NPWP jika ada
Alamat
Provinsi
Kabupaten/Kota
Kecamatan
Kelurahan
Kode Pos
Telepon
Email
Website
Logo
Favicon
Nama Pimpinan
Ketua Yayasan
Kepala Sekolah.

Semua data disimpan DATABASE.

Tidak boleh hardcoded.

============================================================
6. ORGANIZATION PROFILE
============================================================

Buat satu sumber utama:

Organization Profile.

Digunakan oleh:

Dashboard
Surat
SK
Rapor
Leger
PDF
DOCX
Print
Header
Footer
Document Verification.

Jika profil berubah:

Dokumen baru menggunakan data terbaru.

Dokumen lama tidak boleh berubah secara histori jika sudah finalized.

============================================================
7. UNIT / LEMBAGA
============================================================

Support:

SD
SMP
SMA
SMK
Pondok Pesantren
Madrasah
PKBM
Unit lain sesuai kebutuhan.

Setiap unit memiliki:

ID
Code
Name
Type
Address
Contact
Head
Logo jika berbeda
Status.

============================================================
8. UNIT ISOLATION
============================================================

Data antar unit harus terisolasi.

Contoh:

SD
SMP
SMA
Pondok
PKBM.

User hanya melihat unit yang menjadi scope-nya.

============================================================
9. ACADEMIC YEAR SETUP
============================================================

Input:

Tahun Ajaran

contoh:

2026/2027.

Set:

Start Date
End Date
Status.

Status:

DRAFT
ACTIVE
ARCHIVED.

Hanya satu Academic Year dapat ACTIVE
untuk scope yang sama sesuai business rule.

============================================================
10. SEMESTER SETUP
============================================================

Generate:

GANJIL
GENAP.

Tetapkan:

Start Date
End Date
Status.

Semester harus terhubung ke Academic Year.

============================================================
11. CURRICULUM SETUP
============================================================

Support:

Kurikulum Merdeka
Kurikulum 2013
Kurikulum lainnya
Custom Curriculum.

Konfigurasi:

Curriculum
Phase
Grade
Subject Group
Subject
Assessment Type
KKM / criteria
Grade Rule
Report Template.

============================================================
12. MASTER SUBJECT
============================================================

Import atau input:

Kode Mapel
Nama Mapel
Kelompok
Jam Pelajaran
Kurikulum
Jenjang
Status.

Pastikan:

Tidak ada duplicate subject.

Unique berdasarkan business rule:

unit
curriculum
code.

============================================================
13. MASTER EMPLOYEE
============================================================

Import/input:

NIK
NUPTK jika ada
NIP
NIY
Nama
Gender
Birth Data
Address
Phone
Email
Position
Employment Status
Unit
Photo
Documents.

Role jangan dicampur dengan jabatan.

Contoh:

Guru
Karyawan
Kepala Sekolah
TU
Bendahara.

============================================================
14. TEACHER PROFILE
============================================================

Guru harus memiliki:

Employee
Teacher Profile
Account
Role
Unit Scope.

Pisahkan:

Data kepegawaian
Data akun
Data akademik.

Jangan menyimpan seluruh informasi dalam tabel user.

============================================================
15. STAFF ACCOUNT
============================================================

Jika user dibuat:

Generate account.

Username dapat menggunakan:

NIP
NIY
Email
Employee Code

sesuai konfigurasi.

Password awal:

HARUS diganti saat first login.

Jangan menyimpan password plaintext.

============================================================
16. STUDENT IMPORT
============================================================

Support:

Manual Entry
Excel Import
CSV Import
Migration.

Data:

NIS
NISN
NIK
Nama
Gender
Birth Data
Address
Parent
Guardian
Phone
Previous School
Status
Unit.

============================================================
17. STUDENT ID GENERATION
============================================================

Jika:

NIS
NISN
Student Code

belum tersedia:

gunakan generator yang configurable.

Jangan menggunakan:

random tanpa uniqueness.

Database wajib memiliki unique constraint.

============================================================
18. PARENT / GUARDIAN
============================================================

Import/input:

Father
Mother
Guardian.

Data dapat digunakan oleh:

Student
Notification
Letter
Emergency Contact
Parent Portal.

Hindari duplicate parent record.

============================================================
19. STUDENT DOCUMENT
============================================================

Support:

KK
Akta
Ijazah
KIP
Kartu Pelajar
Dokumen lain.

File disimpan menggunakan storage engine.

Metadata:

Document Type
File
Uploaded By
Uploaded At
Status.

============================================================
20. STUDENT QR / BARCODE
============================================================

Generate:

Student QR Code
Student Barcode.

ID harus:

unique
stable
tidak mengandung data sensitif langsung.

QR digunakan untuk:

Attendance
Student Identification
Verification.

============================================================
21. ROMBEL SETUP
============================================================

Setelah siswa dan academic year tersedia:

Create Rombel.

Data:

Unit
Academic Year
Semester
Grade
Code
Name
Homeroom Teacher
Capacity
Status.

============================================================
22. STUDENT PLACEMENT
============================================================

Masukkan siswa ke Rombel.

Validasi:

Student active
Academic year
Unit
Grade
No duplicate active placement.

Student tidak boleh berada di dua rombel aktif
dalam scope yang sama tanpa business rule khusus.

============================================================
23. TEACHER ASSIGNMENT
============================================================

Assign:

Teacher
Subject
Rombel
Academic Year
Semester
Teaching Load.

Validasi:

Guru aktif
Mapel aktif
Rombel aktif
Unit sama
Tahun ajaran sama.

============================================================
24. SCHEDULE INITIALIZATION
============================================================

Input:

Hari
Jam
Mapel
Guru
Rombel
Ruangan.

Validasi:

Tidak ada bentrok guru.

Tidak ada bentrok rombel.

Tidak ada bentrok ruangan jika digunakan.

============================================================
25. KBM INITIALIZATION
============================================================

KBM tidak dibuat manual secara acak.

KBM berasal dari:

Schedule
+
Teacher Assignment.

Guru hanya melihat KBM miliknya.

============================================================
26. ATTENDANCE CONFIGURATION
============================================================

Konfigurasi:

GPS
QR
Barcode
Manual.

Atur:

Radius GPS
Location Accuracy
Allowed Area
Attendance Window
Late Tolerance
Work Schedule.

Untuk siswa:

QR kartu pelajar.

Untuk guru/karyawan:

GPS / QR / manual sesuai permission.

============================================================
27. GOOGLE MAPS CONFIGURATION
============================================================

Simpan:

Latitude
Longitude
Radius.

Lokasi sekolah ditampilkan di map.

Attendance GPS melakukan:

Current Location
Distance Calculation
Geofence Validation.

Jangan menerima koordinat jika:

permission denied
accuracy terlalu buruk
di luar radius.

============================================================
28. ATTENDANCE DEVICE / QR
============================================================

Support:

Student QR
Employee QR
School QR.

School QR dapat digunakan sebagai
additional verification.

Jangan menjadikan QR sebagai satu-satunya
security mechanism jika policy membutuhkan GPS.

============================================================
29. DOCUMENT CONFIGURATION
============================================================

Configure:

Paper Size
Font
Font Size
Margin
Line Height
Header
Footer
Logo
Signature
Stamp.

Default:

A4.

Semua configurable.

============================================================
30. LETTERHEAD
============================================================

Letterhead mengambil:

Organization
Unit
Address
Logo
Contact.

Template surat tidak boleh hardcoded.

============================================================
31. REPORT TEMPLATE
============================================================

Configure:

Rapor
Leger
Attendance Report
Student Report
Teacher Report
Administrative Report.

Template dapat:

Dipilih
Diduplikasi
Dimodifikasi
Disimpan sebagai version.

============================================================
32. RAPOR TEMPLATE
============================================================

Support:

Kurikulum
Template
Custom Template.

Template memiliki:

Version
Academic Year
Curriculum
Unit
Status.

Template finalized tidak boleh diubah sembarangan.

============================================================
33. NOTIFICATION INITIALIZATION
============================================================

Configure:

Email
In-App
Push jika tersedia.

User dapat mengatur preference.

Jangan membuat notification dummy.

============================================================
34. ROLE INITIALIZATION
============================================================

Initialize system permissions:

Super Admin
Yayasan
Kepala Sekolah
Kepala TU
Staff TU
Operator
Wakil Kurikulum
Guru
Wali Kelas
Karyawan
Siswa
Orang Tua.

Permission berasal dari RBAC engine.

============================================================
35. INITIAL ADMINISTRATOR
============================================================

Setup harus membuat:

FIRST SUPER ADMIN.

Input:

Name
Email
Username
Password.

Password:

hashed.

Aktifkan:

force password change
atau security policy sesuai konfigurasi.

============================================================
36. IMPORT ENGINE
============================================================

Support:

Excel
CSV.

Import harus memiliki:

Upload
Preview
Mapping
Validation
Error Report
Import
Rollback.

Jangan langsung memasukkan data
tanpa preview.

============================================================
37. IMPORT MAPPING
============================================================

Contoh:

Nama
→ name

NIK
→ nik

NISN
→ nisn

NIP
→ nip.

User dapat mapping kolom.

============================================================
38. IMPORT VALIDATION
============================================================

Validasi sebelum import:

Required
Unique
Format
Relation
Date
Enum
Reference.

Tampilkan:

VALID
INVALID
DUPLICATE
WARNING.

============================================================
39. IMPORT TRANSACTION
============================================================

Import besar harus menggunakan transaction
atau chunk transaction yang aman.

Jika mode all-or-nothing:

satu error critical
→ rollback.

Jika partial import diizinkan:

record yang gagal harus dicatat jelas.

============================================================
40. MIGRATION EXISTING DATABASE
============================================================

Jika sudah memiliki database lama:

JANGAN langsung overwrite.

Proses:

Backup
→ Analyze
→ Mapping
→ Validate
→ Migration
→ Verify
→ Reconcile.

============================================================
41. DATA MAPPING
============================================================

Buat mapping:

Old Table
→ New Table

Old Column
→ New Column

Old ID
→ New ID

Old Relation
→ New Relation.

Jangan kehilangan referensi.

============================================================
42. LEGACY DATA
============================================================

Data historis harus dipertahankan
jika dibutuhkan untuk:

Rapor
Leger
Audit
Arsip
Laporan.

Jangan menghapus histori hanya karena
struktur database baru berbeda.

============================================================
43. MIGRATION REPORT
============================================================

Setiap migrasi menghasilkan:

Total Source
Total Imported
Total Skipped
Total Failed
Total Duplicate
Total Warning.

Sediakan error file.

============================================================
44. DATA RECONCILIATION
============================================================

Setelah migrasi:

Bandingkan:

COUNT
TOTAL
RELATION
STATUS.

Contoh:

Jumlah siswa lama
=
jumlah siswa baru.

Jumlah guru lama
=
jumlah guru baru.

Jika berbeda:

JANGAN otomatis menyatakan sukses.

============================================================
45. POST-MIGRATION VALIDATION
============================================================

Check:

Orphan student
Orphan employee
Orphan rombel
Orphan score
Orphan attendance
Orphan document.

Semua harus:

0

atau memiliki alasan yang terdokumentasi.

============================================================
46. INITIAL DATA DASHBOARD
============================================================

Setelah setup:

Dashboard Super Admin menampilkan:

Organization
Units
Academic Year
Students
Teachers
Employees
Rombel
Subjects
Assignments
Schedules.

Semua dari database.

============================================================
47. SETUP PROGRESS
============================================================

Wizard menampilkan:

1. System
2. Organization
3. Unit
4. Academic Year
5. Curriculum
6. Master Data
7. Staff
8. Students
9. Rombel
10. Assignment
11. Schedule
12. Attendance
13. Documents
14. RBAC
15. Verification
16. Complete.

============================================================
48. RESUME SETUP
============================================================

Jika browser/server mati:

Setup dapat dilanjutkan.

Status tersimpan di database.

Jangan mengulang langkah yang sudah berhasil.

============================================================
49. VALIDATION BEFORE COMPLETE
============================================================

Setup tidak boleh selesai jika:

Organization kosong
Unit kosong
Academic Year kosong
Admin kosong
Database invalid
Critical relation invalid.

============================================================
50. FINAL SETUP VALIDATION
============================================================

Sebelum:

SETUP COMPLETE

jalankan:

Database Check
RBAC Check
Academic Check
Master Data Check
Relation Check
Document Check
Attendance Check
API Check.

============================================================
51. PRODUCTION CLEANUP
============================================================

Sebelum COMPLETE:

Pastikan tidak ada:

Dummy
Mock
Simulation
Demo.

Tidak ada:

Fake Student
Fake Teacher
Fake Score
Fake Attendance
Fake Report.

============================================================
52. INITIAL BACKUP
============================================================

Setelah setup selesai:

Buat backup database awal.

Label:

INITIAL_PRODUCTION_BASELINE.

Backup ini digunakan sebagai:

baseline recovery point.

============================================================
53. SETUP LOCK
============================================================

Setelah semua valid:

system_setup_status:

COMPLETED
LOCKED.

Tidak dapat diakses user biasa.

============================================================
54. POST-SETUP SMOKE TEST
============================================================

Gunakan data produksi nyata.

Test:

LOGIN
↓
DASHBOARD
↓
STUDENT
↓
TEACHER
↓
ROMBEL
↓
ASSIGNMENT
↓
SCHEDULE
↓
KBM
↓
ATTENDANCE
↓
ASSESSMENT
↓
LEGER
↓
RAPOR
↓
DOCUMENT
↓
PDF
↓
WORD
↓
EXCEL
↓
PRINT.

============================================================
55. FIRST LOGIN TEST
============================================================

Test:

Super Admin
Kepala Sekolah
TU
Guru
Wali Kelas
Karyawan
Siswa
Orang Tua

jika role tersebut telah dibuat.

Pastikan setiap role mendapatkan:

Dashboard
Menu
Permission
Scope

yang benar.

============================================================
56. DATA CONSISTENCY TEST
============================================================

Setelah setup:

Student count
Teacher count
Employee count
Rombel count
Subject count
Assignment count
Schedule count.

Semua harus konsisten dengan database.

============================================================
57. FINAL STATUS
============================================================

Status hanya boleh:

SETUP READY

jika:

[ ] Database OK
[ ] Migration OK
[ ] Organization OK
[ ] Unit OK
[ ] Academic Year OK
[ ] Curriculum OK
[ ] Master Data OK
[ ] Employees OK
[ ] Teachers OK
[ ] Students OK
[ ] Rombel OK
[ ] Assignment OK
[ ] Schedule OK
[ ] Attendance Config OK
[ ] Document Config OK
[ ] RBAC OK
[ ] Import OK
[ ] Validation OK
[ ] Backup OK
[ ] Smoke Test OK
[ ] Dummy Data = 0
[ ] Critical Error = 0
[ ] High Error = 0.

============================================================
58. FINAL OUTPUT
============================================================

Buat laporan:

INITIAL SETUP REPORT

Berisi:

Organization
Units
Academic Year
Curriculum
Students
Teachers
Employees
Subjects
Rombel
Assignments
Schedules
Attendance Configuration
Document Configuration
RBAC
Migration Result
Import Result
Database Validation
Backup Result
Smoke Test
Warnings
Errors.

============================================================
FINAL COMMAND
============================================================

IMPLEMENTASIKAN INITIAL SETUP INI KE CODEBASE.

JANGAN HANYA MEMBUAT DOKUMENTASI.

Buat:

Database model jika belum ada
Migration
API
Service
Controller
Validation
RBAC
Frontend
Setup Wizard
Import Engine
Migration Engine
Verification
Report.

SEMUA HARUS DINAMIS.

SEMUA DATA HARUS TERSIMPAN DI DATABASE.

SEMUA CRUD HARUS BENAR-BENAR BEKERJA.

TIDAK ADA DUMMY.

TIDAK ADA SIMULASI.

TIDAK ADA HARDCODE DATA LEMBAGA.

SETELAH IMPLEMENTASI:

RUN BUILD
RUN TEST
RUN MIGRATION CHECK
RUN API TEST
RUN DATABASE VALIDATION
RUN E2E TEST.

JIKA ADA ERROR:
PERBAIKI.

JANGAN BERHENTI PADA ANALISIS.

HASIL AKHIR:

APLIKASI DAPAT DI-INSTALL,
DIKONFIGURASI,
DIISI DATA LEMBAGA NYATA,
DAN LANGSUNG DIGUNAKAN UNTUK OPERASIONAL PRODUKSI.
============================================================
END OF 138
============================================================