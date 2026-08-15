# 140 — ENTERPRISE SMART ATTENDANCE IMPLEMENTATION

## MASTER PRODUCTION PROMPT

Anda bertindak sebagai:

- Senior Software Architect
- Senior Full-Stack Engineer
- Flutter Engineer
- Backend Engineer
- Database Engineer
- Security Engineer
- QA Engineer
- UX Engineer

Anda harus bekerja langsung pada CODEBASE YANG SUDAH ADA.

JANGAN membuat project baru.

JANGAN membuat aplikasi demo.

JANGAN menggunakan dummy data.

JANGAN menggunakan simulation mode.

JANGAN membuat mock API.

JANGAN membuat data palsu.

============================================================
# 1. TUJUAN APLIKASI
============================================================

Aplikasi ini adalah:

ENTERPRISE SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

Fokus utama:

1. Manajemen Sekolah
2. Manajemen Pondok Pesantren
3. Tata Usaha
4. Master Data
5. Siswa/Santri
6. Guru
7. Karyawan
8. Orang Tua/Wali
9. Rombel dasar
10. Smart Attendance
11. Surat & Dokumen
12. Arsip
13. Notifikasi
14. Laporan
15. User Management
16. RBAC
17. Audit Log

============================================================
# 2. MODUL YANG TIDAK BOLEH ADA
============================================================

APLIKASI INI TIDAK MENGELOLA:

- KBM
- Leger
- Penilaian
- Input Nilai
- Assessment
- Gradebook
- Rapor Akademik

Modul tersebut sudah tersedia pada aplikasi terpisah.

JANGAN membuat ulang modul tersebut.

JANGAN membuat database duplicate untuk:

- nilai
- leger
- assessment
- rapor
- gradebook
- jurnal KBM.

Jika diperlukan integrasi:

Gunakan REST API.

School Management
        ↓
Integration API
        ↓
KBM / LEGER APPLICATION

============================================================
# 3. MENU UTAMA
============================================================

Dashboard

MASTER DATA

├── Yayasan
├── Unit/Lembaga
├── Tahun Ajaran
├── Siswa/Santri
├── Orang Tua/Wali
├── Guru
├── Karyawan
├── Rombel
└── Data Pendukung

SMART ATTENDANCE

├── Dashboard Absensi
├── Absensi Siswa
├── Scan Gerbang
├── Scan Guru
├── Absensi Manual Guru
├── Absensi Guru/Karyawan
├── GPS Attendance
├── QR/Barcode Lokasi
├── Koreksi Absensi
├── Riwayat
├── Monitoring
└── Laporan

TATA USAHA

├── Surat
├── SK
├── Surat Tugas
├── Surat Orang Tua
├── Undangan
├── Berita Acara
├── Daftar Hadir
├── Document Generator
└── Arsip

NOTIFIKASI

LAPORAN

PROFIL

PENGATURAN

Menu harus disesuaikan dengan RBAC.

============================================================
# 4. SMART ATTENDANCE SEBAGAI CORE
============================================================

Bangun Smart Attendance sebagai modul production.

Smart Attendance terdiri dari:

A. Student Attendance

B. Teacher Attendance

C. Employee Attendance

D. Security Gate Attendance

E. Attendance Monitoring

F. Attendance Reports

============================================================
# 5. STUDENT ATTENDANCE
============================================================

Siswa memiliki:

- Student ID
- NIS
- NISN jika ada
- Nama
- Foto
- Unit
- Rombel
- QR Code
- Barcode jika diperlukan
- Status aktif

QR Code harus menggunakan identifier aman.

JANGAN memasukkan:

- NIK
- Alamat
- Data orang tua
- Dokumen pribadi

ke dalam QR secara langsung.

============================================================
# 6. STUDENT QR CODE
============================================================

Setiap siswa harus dapat:

- Generate QR
- Regenerate QR
- Revoke QR
- Deactivate QR
- Preview QR
- Download QR
- Print QR
- Bulk Generate
- Bulk Print

QR harus unique.

QR harus dapat dinonaktifkan.

Jika kartu hilang:

ADMIN dapat:

Revoke QR lama
↓
Generate QR baru.

QR lama harus ditolak.

============================================================
# 7. KARTU PELAJAR
============================================================

Buat fitur:

STUDENT ID CARD MANAGEMENT

Admin dapat:

- memilih template
- mengatur ukuran
- logo
- foto
- nama
- NIS
- NISN
- unit
- rombel
- QR Code
- barcode

Support:

- Preview
- Print
- PDF
- Bulk Print

Data harus berasal dari database.

============================================================
# 8. ABSENSI SISWA OLEH SECURITY
============================================================

Security berada di:

GERBANG SEKOLAH/PONDOK.

Flow:

Security Login
↓
Dashboard Security
↓
Scan Kartu Pelajar
↓
QR Scanner
↓
Server Validation
↓
Student Found
↓
Tampilkan Identitas Minimal
↓
Validasi Status
↓
Validasi Hari/Jam
↓
Cek Duplicate
↓
Simpan Attendance
↓
Success.

============================================================
# 9. SECURITY DASHBOARD
============================================================

Security hanya melihat:

- Scan QR
- Total siswa sudah hadir
- Total belum hadir
- Terlambat
- Scan terakhir
- Riwayat scan hari ini

Security TIDAK BOLEH melihat:

- Super Admin
- User Management
- Database
- RBAC
- Keuangan
- Pengaturan sistem
- Dokumen pribadi
- NIK
- KK
- Data sensitif orang tua.

============================================================
# 10. STUDENT QR SCAN RESPONSE
============================================================

Setelah scan:

Tampilkan:

Foto
Nama
NIS
Rombel
Unit
Status Kehadiran

Contoh:

ABSEN BERHASIL

Nama:
Ahmad

Rombel:
VII A

Jam:
07:12

Status:
HADIR

Jika sudah scan:

ABSENSI SUDAH TERCATAT

Jangan membuat record kedua.

============================================================
# 11. GURU ABSENSI SISWA
============================================================

Guru dapat melakukan absensi siswa melalui:

1. QR Scan
2. Manual Attendance

Tetapi hanya untuk siswa yang berada dalam scope guru.

Scope dapat berasal dari:

- Unit
- Rombel
- Assignment/permission yang tersedia
- Role permission

Jangan memberikan akses global.

============================================================
# 12. GURU QR SCANNER
============================================================

Flow:

Guru Login
↓
Absensi Siswa
↓
Pilih Rombel
↓
Scan QR
↓
Server Validate
↓
Check Student
↓
Check Rombel
↓
Check Duplicate
↓
Save Attendance.

Jika siswa bukan bagian dari rombel:

Tolak.

Pesan:

"Siswa tidak berada dalam rombel yang Anda kelola."

============================================================
# 13. ABSENSI MANUAL GURU
============================================================

Guru dapat membuka:

Daftar Siswa

Setiap siswa:

[ H ] Hadir
[ T ] Terlambat
[ S ] Sakit
[ I ] Izin
[ A ] Alpa

Guru dapat melakukan:

Bulk Save.

Jangan menyimpan sebelum tombol:

SIMPAN ABSENSI

ditekan.

============================================================
# 14. ATTENDANCE CORRECTION
============================================================

Jika guru salah mengisi:

Guru tidak boleh menghapus record secara langsung.

Gunakan:

REQUEST CORRECTION

Input:

Attendance
Reason
Requested By
Date.

Kemudian:

Admin/TU/Wali Kelas berwenang
→ Review
→ Approve / Reject.

Semua perubahan masuk Audit Log.

============================================================
# 15. EMPLOYEE/GURU ATTENDANCE
============================================================

Guru dan karyawan dapat melakukan:

ABSEN MASUK
ABSEN PULANG

Metode:

1. GPS
2. Scan QR/Barcode lokasi sekolah

Jika policy memungkinkan:

3. Manual correction melalui approval.

============================================================
# 16. GPS ATTENDANCE
============================================================

Halaman:

ABSENSI SAYA

Tampilkan:

Nama
Foto
Jabatan

Google Map BESAR.

Map menampilkan:

CURRENT LOCATION
SCHOOL LOCATION
RADIUS.

Contoh:

Anda:
●

Sekolah:
●

Jarak:
74 meter

Akurasi:
8 meter

Status:

DALAM AREA

============================================================
# 17. GPS VALIDATION
============================================================

Database menyimpan lokasi sekolah:

latitude
longitude
radius.

Contoh:

radius = 100 meter.

Jika:

distance <= radius

maka:

VALID.

Jika:

distance > radius

maka:

REJECT.

============================================================
# 18. GPS ACCURACY
============================================================

Jika accuracy terlalu buruk:

Jangan menerima absensi otomatis.

Contoh:

Accuracy > configured threshold

Tampilkan:

"Lokasi belum cukup akurat."

Tombol:

[ COBA LAGI ]

============================================================
# 19. GPS ATTENDANCE RECORD
============================================================

Simpan:

employee_id
attendance_date
check_in
check_out
latitude
longitude
accuracy
distance
method
device_id jika tersedia
created_at.

Method:

GPS.

============================================================
# 20. SCHOOL QR/BARCODE ATTENDANCE
============================================================

Buat:

ATTENDANCE LOCATION MANAGEMENT

Admin dapat membuat:

- Gerbang Utama
- Ruang Guru
- Kantor TU
- Pondok
- Lokasi lainnya

Setiap lokasi memiliki:

ID
Name
Code
QR Token
Latitude
Longitude
Radius
Status.

============================================================
# 21. SCAN BARCODE DINDING
============================================================

Flow:

Guru/Karyawan Login
↓
Absensi
↓
Scan QR/Barcode
↓
Server Validate Token
↓
Validate Location
↓
Validate User
↓
Validate Schedule
↓
Check Duplicate
↓
Save Attendance.

============================================================
# 22. STATIC QR SECURITY
============================================================

Jika QR ditempel permanen:

Jangan hanya mengandalkan QR.

Tambahkan:

Location Binding
User Authentication
Timestamp
Optional GPS validation.

Jika diperlukan keamanan lebih tinggi:

Rotating QR Token.

============================================================
# 23. ATTENDANCE TIME RULE
============================================================

Admin dapat mengatur:

Jam masuk
Jam pulang
Toleransi keterlambatan
Window absensi
Hari kerja.

Contoh:

07:30
Tolerance:
15 menit.

07:35
→ HADIR

07:50
→ TERLAMBAT

Semua rule harus configurable.

JANGAN hardcode.

============================================================
# 24. SHIFT
============================================================

Support:

Regular
Shift
Custom Schedule.

Contoh:

Pagi
Siang
Malam

terutama untuk pondok pesantren.

============================================================
# 25. HOLIDAY
============================================================

Konfigurasi:

Hari libur
Hari efektif
Weekend
Tanggal khusus.

Attendance rule mengikuti konfigurasi.

============================================================
# 26. ATTENDANCE SOURCE
============================================================

Setiap attendance menyimpan:

source.

Contoh:

STUDENT_GATE_QR
TEACHER_QR
TEACHER_MANUAL
EMPLOYEE_GPS
EMPLOYEE_LOCATION_QR
ADMIN_CORRECTION.

============================================================
# 27. ATTENDANCE AUDIT
============================================================

Setiap transaksi:

CREATE
UPDATE
CORRECTION
APPROVAL
REJECTION

harus memiliki audit.

Simpan:

User
Timestamp
Action
Record
Reason
Source
Device jika tersedia.

============================================================
# 28. DATABASE
============================================================

Gunakan relational database.

Minimal konsep:

students
employees
teachers
attendance_sessions
attendance_records
attendance_locations
attendance_corrections
attendance_audits
student_qr_codes
attendance_settings.

Gunakan foreign key.

Gunakan unique constraint.

Gunakan index untuk:

date
student_id
employee_id
unit_id
rombel_id
source.

============================================================
# 29. DUPLICATE PROTECTION
============================================================

Sistem wajib mencegah:

Student attendance duplicate.

Employee check-in duplicate.

Employee check-out duplicate.

Duplicate QR request.

Duplicate sync request.

Gunakan:

Database constraint
+
server validation.

============================================================
# 30. IDEMPOTENCY
============================================================

Attendance request dapat memiliki:

client_transaction_id.

Server harus memastikan:

satu transaction ID
=
satu attendance record.

============================================================
# 31. API
============================================================

Student:

POST /api/v1/attendance/students/scan

POST /api/v1/attendance/students/manual

GET /api/v1/attendance/students/today

GET /api/v1/attendance/students/history

Employee:

POST /api/v1/attendance/employees/gps

POST /api/v1/attendance/employees/location-qr

POST /api/v1/attendance/employees/check-out

GET /api/v1/attendance/me

Admin:

GET /api/v1/attendance/dashboard

GET /api/v1/attendance/reports

POST /api/v1/attendance/corrections

POST /api/v1/attendance/corrections/{id}/approve

POST /api/v1/attendance/corrections/{id}/reject

============================================================
# 32. API SECURITY
============================================================

Semua endpoint wajib:

Authentication
Authorization
Validation
Rate Limit
Scope Validation
Audit.

QR scan:

Server-side validation.

GPS:

Server-side distance calculation.

Frontend tidak boleh menentukan valid/tidak valid.

============================================================
# 33. RBAC
============================================================

ROLE:

SUPER ADMIN

YAYASAN

KEPALA SEKOLAH

KEPALA TU

TU

SECURITY

GURU

WALI KELAS

KARYAWAN

SISWA

ORANG TUA

============================================================
# 34. SECURITY PERMISSION
============================================================

SECURITY:

ALLOW:

Student QR Scan
Gate Attendance
Today's Attendance
Scan History

DENY:

Student CRUD
Employee CRUD
Settings
RBAC
Reports sensitive
System Configuration.

============================================================
# 35. GURU PERMISSION
============================================================

Guru:

ALLOW:

Own Profile
Student Attendance
QR Scan
Manual Attendance
Attendance History
Scope Reports.

DENY:

Student Global CRUD
RBAC
System Settings.

============================================================
# 36. EMPLOYEE PERMISSION
============================================================

Karyawan:

ALLOW:

Own Profile
Own Attendance
GPS
School QR
Attendance History.

DENY:

Other Employee Attendance
Student Management
RBAC.

============================================================
# 37. STUDENT PERMISSION
============================================================

Student:

ALLOW:

Own Profile
Own Attendance
Own QR Card if configured.

DENY:

Other Student Data
Teacher Data
Attendance Management.

============================================================
# 38. MOBILE FLUTTER
============================================================

Flutter harus menyediakan:

ROLE BASED DASHBOARD.

Jika login:

SECURITY

Dashboard langsung fokus:

SCAN SISWA.

Jika:

GURU

Dashboard:

ABSENSI SISWA.

Jika:

KARYAWAN

Dashboard:

ABSENSI SAYA.

Jika:

SISWA

Dashboard:

ABSENSI SAYA.

Jika:

SUPER ADMIN

Dashboard:

ATTENDANCE MONITORING.

============================================================
# 39. SECURITY MOBILE UI
============================================================

Security UI:

Header
Nama Security

SCAN QR BESAR

Today's Summary

Recent Scan

Minimal menu.

Jangan membuat UI rumit.

============================================================
# 40. GURU MOBILE UI
============================================================

Guru UI:

Dashboard

Today's Attendance

Pilih Rombel

Scan QR

Manual Attendance

History.

============================================================
# 41. EMPLOYEE MOBILE UI
============================================================

Employee UI:

Dashboard

Profile

Attendance

Google Maps

Check In

Check Out

Scan School QR

History.

============================================================
# 42. GOOGLE MAP UI
============================================================

Map harus menjadi elemen utama.

Minimal:

40-60% layar halaman attendance.

Tampilkan:

Current Location
School Location
Radius Circle
Distance
Accuracy.

Tampilkan status:

DALAM AREA

atau

DI LUAR AREA.

============================================================
# 43. WEB ADMIN
============================================================

Admin web:

Attendance Dashboard

Cards:

Hadir
Terlambat
Sakit
Izin
Alpa

Employee Attendance

Student Attendance

Gate Monitoring

Location Management

QR Management

Correction

Reports

Audit.

============================================================
# 44. ATTENDANCE REPORT
============================================================

Filter:

Tanggal
Unit
Rombel
Student
Employee
Status
Method
Source.

Export:

PDF
Excel
CSV.

Print:

A4
Landscape/Portrait.

Semua menggunakan database aktual.

============================================================
# 45. NOTIFICATION
============================================================

Event:

Student absent
Student late
Employee late
Attendance correction
Suspicious attendance.

Notification harus dibuat berdasarkan event nyata.

Tidak boleh ada dummy notification.

============================================================
# 46. OFFLINE
============================================================

Jika offline:

Jangan membuat fake success.

Untuk mode offline yang diizinkan:

Simpan transaction lokal:

client_transaction_id
timestamp
device
attendance data.

Ketika online:

Sync
→ Server validate
→ Idempotency check
→ Save.

Jika gagal:

Tampilkan alasan.

============================================================
# 47. ERROR HANDLING
============================================================

Contoh:

QR invalid

"QR tidak valid."

QR expired

"QR sudah tidak aktif."

Student inactive

"Siswa tidak aktif."

Duplicate

"Absensi sudah tercatat."

GPS outside radius

"Anda berada di luar area absensi."

GPS inaccurate

"Lokasi belum cukup akurat."

Network error

"Koneksi bermasalah. Silakan coba lagi."

Jangan tampilkan stack trace ke user.

============================================================
# 48. PERFORMANCE
============================================================

QR scanning harus cepat.

Jangan reload seluruh dashboard
setiap scan.

Gunakan:

Optimized API
Pagination
Caching bila sesuai
Debounce
Request cancellation.

============================================================
# 49. SECURITY AGAINST ABUSE
============================================================

Periksa:

QR brute force
Repeated scan
API abuse
GPS spoofing indicators
Unauthorized employee attendance
Cross-unit attendance
Cross-rombel attendance.

Gunakan:

Rate limiting
Authorization
Server validation
Audit.

============================================================
# 50. PRODUCTION TEST
============================================================

TEST 1:

Student valid QR
→ Success.

TEST 2:

Student invalid QR
→ Reject.

TEST 3:

Student inactive
→ Reject.

TEST 4:

Duplicate scan
→ No duplicate.

TEST 5:

Teacher scan authorized student
→ Success.

TEST 6:

Teacher scan unauthorized student
→ Reject.

TEST 7:

Teacher manual attendance
→ Success.

TEST 8:

Employee GPS inside radius
→ Success.

TEST 9:

Employee GPS outside radius
→ Reject.

TEST 10:

GPS inaccurate
→ Retry.

TEST 11:

Employee scan valid school QR
→ Success.

TEST 12:

Employee scan invalid QR
→ Reject.

TEST 13:

Duplicate check-in
→ Reject.

TEST 14:

Check-out
→ Success.

TEST 15:

Security attempts Student CRUD
→ 403.

TEST 16:

Employee attempts another employee attendance
→ 403.

TEST 17:

Teacher attempts another rombel
→ 403.

============================================================
# 51. REMOVE DUMMY
============================================================

Scan seluruh project.

Cari:

dummy
mock
fake
sample
demo
simulation
seed demo
test attendance
fake student
fake employee.

Hapus dari production flow.

Test data hanya boleh berada
di automated test environment.

============================================================
# 52. REMOVE KBM / LEGER
============================================================

Cari seluruh:

KBM
Leger
Assessment
Score
Grade
Rapor.

Tentukan:

UI
API
Controller
Service
Model
Database relation.

Hapus hanya bagian yang memang
tidak digunakan aplikasi ini.

JANGAN merusak:

Student
Teacher
Employee
Rombel
Academic Year
User
Organization.

Jika diperlukan integrasi eksternal:

pertahankan integration interface saja.

============================================================
# 53. FINAL DATABASE VALIDATION
============================================================

Pastikan:

Migration berhasil.

Foreign key valid.

Unique constraint valid.

Tidak ada orphan attendance.

Tidak ada duplicate attendance.

Tidak ada dummy production data.

============================================================
# 54. FINAL BUILD
============================================================

Run:

TypeScript check

Lint

Build

Backend test

Frontend test

API test

Database test

Flutter test

E2E test.

Semua critical test harus PASS.

============================================================
# 55. FINAL PRODUCTION CHECK
============================================================

CRITICAL = 0

HIGH = 0

DUMMY DATA = 0

SIMULATION = 0

BROKEN CRUD = 0

BROKEN API = 0

BROKEN RBAC = 0

DUPLICATE ATTENDANCE = 0

BROKEN DATABASE RELATION = 0

============================================================
# 56. FINAL OUTPUT
============================================================

Berikan:

1. Modul yang dihapus
2. Modul yang dipertahankan
3. Modul Smart Attendance
4. Database changes
5. API changes
6. RBAC changes
7. Flutter changes
8. Web changes
9. Security changes
10. Migration result
11. Test result
12. Remaining warnings.

Jangan mengatakan:

"READY"

jika belum benar-benar dites.

============================================================
# FINAL COMMAND
============================================================

KERJAKAN LANGSUNG PADA CODEBASE.

JANGAN HANYA MEMBERIKAN PENJELASAN.

JANGAN MEMBUAT MOCKUP SEMATA.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGGUNAKAN DUMMY.

SEMUA DATA HARUS DATABASE.

SEMUA LOGIC ABSENSI HARUS SERVER-SIDE.

SEMUA ROLE HARUS MENGIKUTI RBAC.

SEMUA CRUD HARUS BENAR-BENAR BERFUNGSI.

SEMUA API HARUS TERHUBUNG KE DATABASE.

SEMUA MOBILE FLOW HARUS MENGGUNAKAN API YANG SAMA.

IMPLEMENTASIKAN:

STUDENT QR ATTENDANCE

+
SECURITY GATE ATTENDANCE

+
TEACHER QR ATTENDANCE

+
TEACHER MANUAL ATTENDANCE

+
EMPLOYEE GPS ATTENDANCE

+
EMPLOYEE SCHOOL QR ATTENDANCE

+
ATTENDANCE MONITORING

+
ATTENDANCE CORRECTION

+
ATTENDANCE REPORT

+
AUDIT LOG

+
RBAC

+

SCHOOL & PESANTREN MANAGEMENT.

KBM DAN LEGER TIDAK BOLEH MENJADI MODUL
DALAM APLIKASI INI.

============================================================
END OF PROMPT 140
============================================================