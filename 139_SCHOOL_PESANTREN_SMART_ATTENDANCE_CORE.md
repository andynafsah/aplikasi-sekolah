============================================================
139 — SCHOOL & PESANTREN MANAGEMENT
SMART ATTENDANCE CORE
============================================================

STATUS:
PRODUCTION RESTRUCTURING

TUJUAN:
Mengubah aplikasi menjadi aplikasi khusus:

SCHOOL MANAGEMENT
+
PONDOK PESANTREN MANAGEMENT

dengan fokus utama pada:

SMART ATTENDANCE
STUDENT MANAGEMENT
EMPLOYEE/GURU MANAGEMENT
TATA USAHA
DOCUMENT MANAGEMENT
NOTIFICATION
REPORTING.

============================================================
1. ATURAN PALING PENTING
============================================================

APLIKASI INI TIDAK BOLEH MEMILIKI:

- KBM
- Leger
- Penilaian akademik
- Input nilai
- Rapor akademik
- Grade calculation
- Ranking nilai
- Assessment Engine
- Teacher Gradebook.

Fitur tersebut SUDAH DIMILIKI OLEH APLIKASI LAIN.

JANGAN DUPLIKASI.

JANGAN MEMBUAT MODUL BARU UNTUK KBM.

JANGAN MEMBUAT MODUL BARU UNTUK LEGER.

JANGAN MEMBUAT DATABASE TABLE BARU
UNTUK DATA AKADEMIK YANG SUDAH DITANGANI
APLIKASI KBM/LEGER.

============================================================
2. POSISI APLIKASI
============================================================

APLIKASI INI:

School & Pesantren Management System.

APLIKASI KBM/LEGER:

Academic Teaching & Assessment System.

Jika diperlukan integrasi:

School Management
        ↓
REST API
        ↓
KBM / Leger System

Gunakan API.

Jangan duplicate business logic.

============================================================
3. CORE MODULE
============================================================

MODULE:

1. Dashboard
2. Organization
3. Unit Management
4. Academic Year
5. Student Management
6. Parent / Guardian
7. Teacher Management
8. Employee Management
9. Class / Rombel Basic Management
10. Smart Attendance
11. Tata Usaha
12. Letter / Document
13. Archive
14. Notification
15. Reports
16. User Account
17. RBAC
18. System Settings
19. Audit Log.

============================================================
4. SMART ATTENDANCE
============================================================

SMART ATTENDANCE ADALAH CORE FEATURE.

Memiliki dua kategori:

A. STUDENT ATTENDANCE

B. EMPLOYEE / TEACHER ATTENDANCE

============================================================
5. STUDENT ATTENDANCE METHODS
============================================================

Siswa dapat melakukan absensi melalui:

METHOD 1:
QR CARD SCAN

METHOD 2:
MANUAL ATTENDANCE BY AUTHORIZED TEACHER

METHOD 3:
GATE ATTENDANCE BY SECURITY

Jika diperlukan:

METHOD 4:
Authorized Staff Scan.

============================================================
6. STUDENT ID CARD
============================================================

Setiap siswa memiliki:

Student ID
Student Number
Nama
Foto
Unit
Rombel
QR Code
Status.

QR Code harus memiliki:

Unique Identifier.

JANGAN masukkan data pribadi lengkap
ke dalam QR.

Contoh payload:

STUDENT:<UUID>

atau token identifier aman.

============================================================
7. QR CARD GENERATION
============================================================

Sistem harus dapat:

Generate QR
Preview QR
Download QR
Print QR
Bulk Generate QR
Regenerate QR
Deactivate QR
Revoke QR.

QR lama dapat dinonaktifkan.

QR baru dapat diterbitkan.

============================================================
8. STUDENT CARD
============================================================

Sediakan:

Student Card Designer.

Data:

Logo
Nama sekolah
Nama siswa
Foto
NIS
NISN
Rombel
QR Code
Barcode jika diperlukan
Tahun ajaran.

Support:

Front
Back.

Ukuran dapat dikonfigurasi.

============================================================
9. SECURITY GATE ATTENDANCE
============================================================

SECURITY DI GERBANG SEKOLAH
DAPAT MELAKUKAN ABSENSI SISWA.

Flow:

Siswa datang
↓
Menyerahkan kartu pelajar
↓
Security membuka Scan Attendance
↓
Scan QR
↓
System mencari siswa
↓
Validasi siswa aktif
↓
Validasi unit
↓
Validasi attendance window
↓
Create attendance
↓
Success.

============================================================
10. SECURITY DASHBOARD
============================================================

Security hanya melihat fitur yang diperlukan.

Dashboard:

Total siswa hari ini
Sudah hadir
Belum hadir
Terlambat
Tidak hadir
Scan terakhir.

JANGAN tampilkan:

Super Admin settings
Payroll
System configuration
Database
RBAC administration
User management.

============================================================
11. GATE SCAN
============================================================

Scanner harus mendukung:

Camera QR Scanner.

Flow:

SCAN
→ FIND STUDENT
→ SHOW PROFILE MINIMAL
→ CONFIRM
→ SAVE ATTENDANCE.

Jika berhasil:

GREEN SUCCESS.

Jika gagal:

RED ERROR.

Jika duplicate:

YELLOW WARNING.

============================================================
12. DUPLICATE ATTENDANCE
============================================================

Siswa tidak boleh tercatat hadir dua kali
untuk attendance session yang sama.

Jika QR discan ulang:

Tampilkan:

"Sudah melakukan absensi."

Tampilkan:

Waktu absensi.

Jangan membuat record baru.

============================================================
13. TEACHER ATTENDANCE
============================================================

Guru pengampu dapat melakukan absensi siswa.

Metode:

QR SCAN
atau
MANUAL.

============================================================
14. TEACHER QR ATTENDANCE
============================================================

Flow:

Guru Login
↓
Pilih Unit
↓
Pilih Rombel yang diizinkan
↓
Pilih Attendance Session
↓
Scan QR siswa
↓
System validate
↓
Record attendance.

Guru hanya dapat scan siswa
yang berada dalam scope yang diizinkan.

============================================================
15. TEACHER MANUAL ATTENDANCE
============================================================

Guru dapat melihat daftar siswa:

☐ Hadir
☐ Sakit
☐ Izin
☐ Alpa
☐ Terlambat

Guru dapat memilih status secara manual.

Submit:

Bulk Attendance.

============================================================
16. TEACHER SCOPE
============================================================

Guru tidak boleh melakukan absensi
semua siswa.

Scope ditentukan oleh:

Unit
Rombel
Assignment / permission
Attendance permission.

Jika guru memiliki akses:

Rombel A

guru tidak boleh mengubah:

Rombel B.

============================================================
17. ATTENDANCE SESSION
============================================================

Setiap absensi memiliki:

Date
Time
Unit
Academic Year
Semester jika diperlukan
Rombel
Attendance Type
Created By
Source.

Source:

SECURITY_GATE
TEACHER_QR
TEACHER_MANUAL
STAFF
ADMIN.

============================================================
18. ATTENDANCE STATUS
============================================================

Student:

PRESENT
LATE
SICK
PERMITTED
ABSENT.

Employee:

PRESENT
LATE
LEAVE
SICK
PERMITTED
ABSENT
OFF_DAY
HOLIDAY.

============================================================
19. ATTENDANCE SOURCE
============================================================

Setiap record wajib menyimpan:

source.

Contoh:

QR
MANUAL
GPS
SECURITY
TEACHER.

============================================================
20. AUDIT ATTENDANCE
============================================================

Catat:

Who
When
Where
Method
Device
IP jika diperlukan
GPS jika tersedia
Attendance ID.

============================================================
21. EMPLOYEE / TEACHER ATTENDANCE
============================================================

Guru dan karyawan menggunakan:

METHOD 1:
GPS LOCATION

METHOD 2:
SCHOOL QR / BARCODE

METHOD 3:
Manual oleh authorized administrator jika
business rule mengizinkan.

============================================================
22. EMPLOYEE GPS ATTENDANCE
============================================================

Flow:

Login
↓
Attendance
↓
Request GPS Permission
↓
Get Current Location
↓
Show Google Maps
↓
Show School Location
↓
Calculate Distance
↓
Validate Radius
↓
Check Attendance Schedule
↓
Check User Status
↓
Check Duplicate
↓
Submit Attendance.

============================================================
23. GOOGLE MAP
============================================================

Halaman attendance harus memiliki
Google Map yang cukup besar.

Tampilkan:

Current User Location
School Location
Radius Circle
Distance.

Contoh:

You are here
●

School
●

Radius:
100 meters.

============================================================
24. GPS VALIDATION
============================================================

Database:

school_latitude
school_longitude
attendance_radius.

Contoh:

Radius = 100 meter.

User berada:

80m
→ PASS.

User berada:

350m
→ FAIL.

============================================================
25. GPS ACCURACY
============================================================

GPS harus memeriksa:

accuracy.

Jika accuracy terlalu buruk:

Jangan langsung menerima.

Tampilkan:

"Lokasi GPS belum cukup akurat."

Berikan:

Retry Location.

============================================================
26. MOCK LOCATION PROTECTION
============================================================

Jika platform menyediakan indikator:

mock location
developer location
location spoofing.

Tandai sebagai:

SUSPICIOUS.

Jangan mengandalkan GPS sebagai satu-satunya
anti-cheat mechanism.

Simpan:

accuracy
timestamp
distance
device information jika diizinkan.

============================================================
27. EMPLOYEE SCHOOL QR
============================================================

Sekolah memiliki QR/Barcode
yang ditempel di lokasi tertentu.

Contoh:

GERBANG UTAMA
RUANG GURU
KANTOR TU
PONDOK.

Employee:

Login
↓
Scan School QR
↓
Validate QR
↓
Validate user
↓
Validate attendance schedule
↓
Create attendance.

============================================================
28. QR LOCATION CONFIGURATION
============================================================

Admin dapat membuat:

Location Point.

Data:

Name
Code
QR Token
Unit
Latitude
Longitude
Radius
Status.

Contoh:

GERBANG_UTAMA
RUANG_GURU
KANTOR_TU.

============================================================
29. BARCODE ROTATION
============================================================

Jika diperlukan keamanan tinggi:

QR/Barcode dapat memiliki:

Rotating Token
Expiration
Location Binding.

Jangan gunakan QR statis
jika policy keamanan mengharuskan rotating QR.

============================================================
30. EMPLOYEE ATTENDANCE PAGE
============================================================

Tampilan:

HEADER

Nama
Foto
Jabatan

CURRENT TIME

GPS MAP BESAR

Current Location
School Location
Distance
Accuracy

STATUS

Belum Absen
Sudah Absen
Terlambat

ACTION:

[ ABSEN MASUK ]

[ ABSEN PULANG ]

[ SCAN BARCODE ]

============================================================
31. ATTENDANCE RULE
============================================================

Konfigurasi:

Work Start
Work End
Late Tolerance
Check In Window
Check Out Window.

Contoh:

08:00
Tolerance 15 menit.

08:10:

PRESENT.

08:20:

LATE.

Semua rule configurable.

============================================================
32. EMPLOYEE SCHEDULE
============================================================

Employee attendance dapat memiliki:

Work Schedule
Day
Start
End
Break
Holiday
Shift.

Support:

Regular
Shift
Custom.

============================================================
33. SHIFT
============================================================

Untuk pesantren jika diperlukan:

Morning
Afternoon
Night.

Karyawan tertentu dapat menggunakan shift.

============================================================
34. HOLIDAY
============================================================

Attendance tidak wajib dibuat
pada hari:

Holiday
Weekend
Configured Off Day.

Namun administrator tetap dapat melakukan
manual override dengan audit.

============================================================
35. ATTENDANCE HISTORY
============================================================

Employee melihat:

Hari
Tanggal
Jam Masuk
Jam Pulang
Status
Method
Location.

Student melihat histori sesuai permission.

============================================================
36. ATTENDANCE REPORT
============================================================

Laporan:

Harian
Mingguan
Bulanan
Per siswa
Per guru
Per karyawan
Per unit
Per rombel
Per status
Per source.

Export:

PDF
Excel
CSV.

============================================================
37. SECURITY REPORT
============================================================

Security dapat melihat:

Total Scan
Total Accepted
Total Duplicate
Total Invalid
Total Unknown QR.

Security tidak boleh mengubah
data master siswa.

============================================================
38. TEACHER ATTENDANCE REPORT
============================================================

Guru hanya melihat:

Rombel yang diizinkan.

Admin/TU dapat melihat:

seluruh unit sesuai permission.

============================================================
39. ADMIN ATTENDANCE CONTROL
============================================================

Authorized Admin dapat:

View
Edit
Correction
Approve Correction
Export
Print.

Semua perubahan harus masuk:

Audit Log.

============================================================
40. ATTENDANCE CORRECTION
============================================================

Jika attendance salah:

Request Correction.

Tidak langsung menghapus record.

Flow:

Request
↓
Reason
↓
Approval
↓
Update
↓
Audit.

============================================================
41. ATTENDANCE DELETE
============================================================

Jangan hard delete
attendance production.

Gunakan:

VOID
CANCELLED
CORRECTED.

Simpan histori.

============================================================
42. MOBILE
============================================================

Flutter:

Employee:

Dashboard
→ Attendance
→ GPS Map
→ Scan School QR
→ Check In
→ Check Out
→ History.

Teacher:

Dashboard
→ Student Attendance
→ Select Scope
→ Scan QR
→ Manual Attendance
→ Submit.

Security:

Dashboard
→ Student QR Scanner
→ Student Detail Minimal
→ Attendance
→ Daily Attendance
→ History.

============================================================
43. WEB
============================================================

Web Admin:

Attendance Dashboard
Attendance Monitoring
Student Attendance
Employee Attendance
Location Configuration
QR Configuration
Schedule
Correction
Reports
Audit.

============================================================
44. ROLE PERMISSION
============================================================

SUPER ADMIN:

Full Access.

YAYASAN:

Organization-level reporting.

KEPALA SEKOLAH:

Monitoring
Reports
Approval.

TU:

Student
Employee
Attendance
Documents
Reports.

SECURITY:

Student Gate Attendance
Scan QR
Daily Attendance
Limited Student Information.

GURU:

Attendance siswa sesuai scope.

WALI KELAS:

Attendance siswa pada rombelnya.

KARYAWAN:

Own Attendance.

SISWA:

Own Attendance.

============================================================
45. DATA PRIVACY
============================================================

Security hanya mendapatkan:

Foto
Nama
NIS
Rombel
Status.

Jangan tampilkan:

NIK
KK
Alamat lengkap
Data orang tua
Dokumen pribadi.

============================================================
46. OFFLINE HANDLING
============================================================

Jika koneksi internet terputus:

Jangan langsung membuat
data attendance palsu.

Untuk QR attendance:

Queue locally hanya jika policy mengizinkan.

Data harus menyimpan:

Original timestamp
Device
Sync timestamp.

Setelah online:

Sync.

Server melakukan idempotency validation.

============================================================
47. ANTI DUPLICATE SYNC
============================================================

Attendance memiliki:

client_transaction_id.

Server wajib unique.

Jika request dikirim dua kali:

Hanya satu attendance record.

============================================================
48. NOTIFICATION
============================================================

Optional notification:

Student absent
Student late
Employee late
Attendance correction
Attendance anomaly.

Notification harus berasal dari
event nyata.

============================================================
49. ATTENDANCE ANOMALY
============================================================

Detect:

Multiple scan
Invalid QR
Outside radius
Poor GPS accuracy
Suspicious device
Repeated correction.

Tandai:

NORMAL
WARNING
SUSPICIOUS.

============================================================
50. DATABASE
============================================================

Gunakan model yang jelas:

attendance_sessions
attendance_records
attendance_methods
attendance_locations
attendance_devices jika diperlukan
attendance_corrections
attendance_audits.

Student:

student_id.

Employee:

employee_id.

Semua relation menggunakan foreign key.

============================================================
51. DATABASE CONSTRAINT
============================================================

Pastikan tidak ada duplicate:

Student + Session

Employee + Date + Attendance Type

Client Transaction ID.

============================================================
52. API
============================================================

Student:

POST /attendance/student/scan
POST /attendance/student/manual

Employee:

POST /attendance/employee/gps
POST /attendance/employee/qr
POST /attendance/employee/manual

History:

GET /attendance/me
GET /attendance/students
GET /attendance/employees

Reports:

GET /attendance/reports.

Gunakan API contract yang konsisten.

============================================================
53. SECURITY API
============================================================

Setiap endpoint:

Authentication
Authorization
Scope Validation
Input Validation
Rate Limit
Audit.

QR scan harus melakukan server-side validation.

============================================================
54. NO FRONTEND TRUST
============================================================

Frontend tidak boleh menentukan:

"Attendance valid".

Backend yang menentukan.

Frontend hanya menampilkan hasil.

============================================================
55. DASHBOARD
============================================================

Admin:

Today Present
Late
Absent
Student Attendance
Employee Attendance
Attendance Rate
Anomaly.

Security:

Gate Scan
Today's Attendance
Recent Scan.

Teacher:

My Attendance Scope
Today's Students
Present
Late
Absent.

Employee:

My Attendance
GPS
QR
History.

============================================================
56. REMOVE OLD MODULES
============================================================

Identifikasi seluruh:

KBM
Leger
Assessment
Score
Rapor

yang terdapat dalam codebase.

Jangan langsung hapus database production.

Lakukan:

Dependency Audit
→ API Audit
→ UI Audit
→ Relation Audit
→ Migration Plan.

Jika benar-benar hanya digunakan oleh
aplikasi lama:

hapus dari aplikasi ini secara aman.

============================================================
57. INTEGRATION OPTION
============================================================

Jika aplikasi School Management membutuhkan
data dari KBM/Leger:

Gunakan:

REST API
atau
secure integration layer.

Contoh:

School Management
        ↓
Integration API
        ↓
External KBM/Leger System.

Tidak membuat:

duplicate Leger
duplicate Score
duplicate KBM.

============================================================
58. MENU FINAL
============================================================

DASHBOARD

MASTER DATA
├── Organization
├── Unit
├── Academic Year
├── Student
├── Parent
├── Teacher
├── Employee
└── Rombel Basic

SMART ATTENDANCE
├── Attendance Dashboard
├── Student Attendance
├── Employee Attendance
├── Gate Scanner
├── Teacher Scanner
├── GPS Attendance
├── QR/Barcode Location
├── Attendance Correction
├── History
└── Reports

TATA USAHA
├── Letters
├── SK
├── Document
├── Archive
└── Print Center

NOTIFICATION

REPORTS

MY PROFILE

SETTINGS
└── sesuai permission.

============================================================
59. REMOVE MENU
============================================================

JANGAN tampilkan:

KBM
Leger
Penilaian
Input Nilai
Rapor
Gradebook
Assessment.

Untuk semua role.

Kecuali:

integrasi eksternal ditampilkan sebagai
menu/link jika memang dibutuhkan.

============================================================
60. FINAL PRODUCTION TEST
============================================================

TEST STUDENT:

Create Student
↓
Generate QR
↓
Print Student Card
↓
Security Scan
↓
Attendance Created
↓
Teacher Scan
↓
Duplicate Protection
↓
Manual Attendance
↓
History
↓
Report.

TEST EMPLOYEE:

Create Employee
↓
Login
↓
GPS Permission
↓
Google Map
↓
Distance Validation
↓
Check In
↓
Late Detection
↓
Scan School QR
↓
Check Out
↓
History.

============================================================
61. FINAL QUALITY GATE
============================================================

Tidak boleh ada:

Dummy
Mock
Simulation
Fake Attendance
Fake Student
Fake Employee.

Tidak boleh ada:

Duplicate Attendance
Unauthorized Attendance
Cross-Rombel Access
Cross-Unit Access
GPS Bypass
QR Bypass
Broken CRUD
Broken API
Broken Report.

============================================================
62. FINAL COMMAND
============================================================

IMPLEMENTASIKAN PERUBAHAN INI KE CODEBASE.

JANGAN HANYA MEMBUAT DOKUMENTASI.

1. Audit modul KBM.
2. Audit modul Leger.
3. Audit modul Penilaian.
4. Audit modul Rapor.
5. Hapus/isolasi modul tersebut dari aplikasi ini
   secara aman.
6. Pertahankan integrasi jika diperlukan.
7. Fokuskan aplikasi pada School/Pesantren Management.
8. Implementasikan Smart Attendance.
9. Implementasikan Student QR Attendance.
10. Implementasikan Security Gate Attendance.
11. Implementasikan Teacher QR Attendance.
12. Implementasikan Teacher Manual Attendance.
13. Implementasikan Employee GPS Attendance.
14. Implementasikan Employee School QR Attendance.
15. Implementasikan Attendance Correction.
16. Implementasikan Attendance Audit.
17. Implementasikan Attendance Reports.
18. Implementasikan RBAC.
19. Implementasikan API.
20. Sinkronkan Flutter dan Web.
21. Pastikan seluruh data menggunakan database.
22. Hilangkan seluruh dummy/simulation.
23. Jalankan migration.
24. Jalankan test.
25. Jalankan regression test.

HASIL AKHIR:

SCHOOL & PESANTREN MANAGEMENT
+
ENTERPRISE SMART ATTENDANCE

BUKAN:

KBM / LEGER SYSTEM.

============================================================
END OF 139
============================================================