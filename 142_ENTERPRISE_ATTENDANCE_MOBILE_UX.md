# 142 — ENTERPRISE ATTENDANCE MOBILE UX

## PRODUCTION FLUTTER MOBILE UI/UX MASTER PROMPT

Anda bertindak sebagai:

- Senior Flutter Engineer
- Senior Mobile UX/UI Designer
- Product Designer
- Mobile Security Engineer
- Accessibility Engineer
- QA Engineer

Implementasikan desain dan UX Smart Attendance
langsung pada aplikasi Flutter yang sudah ada.

JANGAN membuat aplikasi demo.

JANGAN menggunakan dummy data.

JANGAN menggunakan simulasi absensi.

JANGAN membuat halaman yang tidak terhubung API.

Semua data harus berasal dari REST API backend
dan database production.

============================================================
# 1. TUJUAN
============================================================

Membangun pengalaman mobile untuk:

1. Security
2. Guru
3. Wali Kelas
4. Karyawan
5. Siswa
6. Kepala Sekolah
7. TU
8. Super Admin sesuai permission

Fokus utama:

STUDENT QR ATTENDANCE

dan

EMPLOYEE/GURU GPS + LOCATION QR ATTENDANCE.

============================================================
# 2. PLATFORM
============================================================

Flutter harus mendukung:

Android
iOS
Web/PWA jika arsitektur project memang mendukung.

UI harus responsive.

Jangan membuat UI khusus Android saja.

Gunakan:

Responsive Layout
Adaptive Navigation
Safe Area
Keyboard Handling
Accessibility.

============================================================
# 3. PRINSIP UTAMA UX
============================================================

Absensi harus:

CEPAT
SIMPLE
JELAS
AMAN
MINIM KLIK
REAL-TIME
MOBILE FIRST.

User tidak boleh melewati banyak halaman
hanya untuk melakukan absensi.

============================================================
# 4. LOGIN
============================================================

Halaman Login:

Logo lembaga

Nama aplikasi

Email/Username

Password

[ MASUK ]

Lupa Password

Loading state.

Error:

Username/password salah.

Account inactive.

Network error.

============================================================
# 5. ROLE-BASED REDIRECT
============================================================

Setelah login:

SUPER ADMIN
→ Admin Dashboard

YAYASAN
→ Foundation Dashboard

KEPALA SEKOLAH
→ School Dashboard

TU
→ Administration Dashboard

SECURITY
→ Security Attendance Dashboard

GURU
→ Teacher Dashboard

WALI KELAS
→ Homeroom Dashboard

KARYAWAN
→ Employee Dashboard

SISWA
→ Student Dashboard.

JANGAN menampilkan menu role lain.

============================================================
# 6. SECURITY DASHBOARD
============================================================

Security dashboard harus sangat sederhana.

Header:

Foto
Nama Security
Status Online

Main Card:

SCAN KARTU SISWA

[ SCAN QR ]

Summary:

Hadir Hari Ini
Terlambat
Scan Terakhir

Recent Scan.

Navigation:

Dashboard
Scan
History
Profile.

Jangan tampilkan:

Settings
RBAC
Database
Student CRUD
Employee CRUD
Finance
System Administration.

============================================================
# 7. SECURITY SCANNER
============================================================

Scanner menggunakan kamera device.

UI:

--------------------------------
       SCAN KARTU PELAJAR

       ┌──────────────┐
       │              │
       │    QR AREA   │
       │              │
       │              │
       └──────────────┘

   Arahkan QR ke dalam kotak

--------------------------------

Button:

[ FLASH ]

[ INPUT MANUAL CODE ]

Jika kamera permission belum diberikan:

Tampilkan permission explanation.

============================================================
# 8. SECURITY QR SUCCESS
============================================================

Setelah QR berhasil:

Tampilkan bottom sheet/modal:

Foto siswa

Nama

NIS

Rombel

Unit

Status:

ABSEN BERHASIL

Jam:

07:13

Source:

Security Gate.

Button:

[ SELESAI ]

Scanner kembali aktif
setelah user menutup hasil.

============================================================
# 9. SECURITY QR ERROR
============================================================

Jika QR invalid:

Tampilkan:

QR TIDAK VALID

Pesan:

"Kartu pelajar tidak dapat diverifikasi."

Button:

[ SCAN LAGI ]

Jika QR revoked:

"Kartu pelajar sudah tidak aktif."

Jika student inactive:

"Siswa tidak aktif."

============================================================
# 10. DUPLICATE ATTENDANCE
============================================================

Jika siswa sudah absen:

Tampilkan:

SUDAH ABSEN

Nama
Jam Absensi
Status
Source.

Jangan membuat record baru.

Button:

[ KEMBALI SCAN ]

============================================================
# 11. SECURITY HISTORY
============================================================

Tampilkan:

Today's Scan.

Card:

Foto
Nama
Rombel
Jam
Status.

Filter:

Semua
Hadir
Terlambat
Invalid.

Pagination dari API.

============================================================
# 12. TEACHER DASHBOARD
============================================================

Header:

Foto
Nama Guru
Unit.

Main:

ABSENSI SISWA

Today's classes/scope.

Cards:

Total Siswa
Hadir
Terlambat
Sakit
Izin
Alpa.

Actions:

[ SCAN QR ]

[ ABSENSI MANUAL ]

[ RIWAYAT ]

============================================================
# 13. TEACHER QR SCANNER
============================================================

Flow:

Guru
↓
Scan QR
↓
Backend validation
↓
Student validation
↓
Scope validation
↓
Duplicate validation
↓
Save.

Guru tidak boleh menentukan sendiri
student scope dari frontend.

Backend wajib memvalidasi.

============================================================
# 14. TEACHER SELECT ROMBEL
============================================================

Jika guru memiliki lebih dari satu scope:

Tampilkan:

Pilih Rombel.

Contoh:

VII A
VII B
VIII A.

Hanya tampilkan rombel yang authorized.

============================================================
# 15. TEACHER MANUAL ATTENDANCE
============================================================

Page:

ABSENSI MANUAL

Header:

Rombel
Tanggal
Session.

List:

Avatar
Nama
NIS

Status selector:

Hadir
Terlambat
Sakit
Izin
Alpa.

Button:

[ SIMPAN ABSENSI ]

============================================================
# 16. BULK ATTENDANCE UX
============================================================

Berikan:

[ HADIR SEMUA ]

untuk mempercepat input.

Setelah itu guru dapat mengubah
siswa tertentu:

Sakit
Izin
Alpa
Terlambat.

Sebelum submit:

Tampilkan summary.

Contoh:

Hadir 28
Terlambat 2
Sakit 1
Izin 1
Alpa 0.

[ KONFIRMASI ABSENSI ]

============================================================
# 17. TEACHER ATTENDANCE SUCCESS
============================================================

Setelah server berhasil:

ABSENSI TERSIMPAN

Tampilkan:

Jumlah siswa
Status
Waktu sinkronisasi.

Jangan menampilkan sukses
jika API belum berhasil.

============================================================
# 18. EMPLOYEE DASHBOARD
============================================================

Employee:

Header
Foto
Nama
Jabatan

Current Date

Current Time

Attendance Status.

Main card:

ABSENSI HARI INI

Check In:
--

Check Out:
--

Status:
Belum Absen.

Actions:

[ ABSEN MASUK ]

[ ABSEN PULANG ]

[ SCAN QR LOKASI ]

============================================================
# 19. GPS ATTENDANCE PAGE
============================================================

Halaman GPS harus menampilkan
Google Maps secara dominan.

Layout:

--------------------------------
HEADER

ABSENSI GPS

--------------------------------

┌──────────────────────────────┐
│                              │
│                              │
│        GOOGLE MAP            │
│                              │
│       ● YOU                  │
│                 ● SCHOOL     │
│                              │
│      RADIUS CIRCLE           │
│                              │
└──────────────────────────────┘

Distance:
74 meter

Accuracy:
8 meter

Status:
DALAM AREA

--------------------------------

[ ABSEN MASUK ]

--------------------------------

Jam Masuk:
Belum

Jam Pulang:
Belum

--------------------------------

[ ABSEN PULANG ]

============================================================
# 20. GOOGLE MAP
============================================================

Map harus:

Interactive.

Support:

Zoom
Pan
Current location
School location
Radius circle.

Jangan menggunakan static image.

Gunakan Google Maps integration
yang sesuai dengan platform.

============================================================
# 21. LOCATION STATE
============================================================

State:

GETTING_LOCATION

LOCATION_READY

INSIDE_RADIUS

OUTSIDE_RADIUS

LOW_ACCURACY

PERMISSION_DENIED

LOCATION_DISABLED

ERROR.

============================================================
# 22. GPS LOADING
============================================================

Saat mendapatkan GPS:

Tampilkan:

"Mendapatkan lokasi Anda..."

Map skeleton/loading.

Jangan mengaktifkan tombol
absen sebelum lokasi tervalidasi.

============================================================
# 23. GPS INSIDE RADIUS
============================================================

Jika valid:

Status:

DALAM AREA ABSENSI

Distance:

XX meter

Accuracy:

XX meter.

Button:

[ ABSEN MASUK ]

enabled.

============================================================
# 24. GPS OUTSIDE RADIUS
============================================================

Jika:

distance > radius

Tampilkan:

DI LUAR AREA ABSENSI

Distance:

350 meter.

Button:

ABSEN MASUK

disabled.

Berikan:

[ PERBARUI LOKASI ]

============================================================
# 25. GPS LOW ACCURACY
============================================================

Jika GPS tidak akurat:

LOKASI BELUM CUKUP AKURAT.

Tampilkan:

Accuracy:

150 meter.

Button:

[ COBA LAGI ]

Jangan mengirim attendance
jika policy mensyaratkan accuracy minimum.

============================================================
# 26. GPS PERMISSION DENIED
============================================================

Jika permission ditolak:

Tampilkan:

IZIN LOKASI DIPERLUKAN

Penjelasan:

"Aplikasi membutuhkan lokasi untuk
memvalidasi absensi."

Button:

[ IZINKAN LOKASI ]

Jika permanent denied:

[ BUKA PENGATURAN ]

============================================================
# 27. LOCATION DISABLED
============================================================

Jika GPS device mati:

"Layanan lokasi perangkat sedang mati."

Button:

[ AKTIFKAN LOKASI ]

Gunakan native platform behavior
yang sesuai.

============================================================
# 28. CHECK-IN
============================================================

Saat user menekan:

ABSEN MASUK

Tampilkan confirmation:

Absensi masuk?

Lokasi:
Sekolah

Jarak:
74 meter

Jam:
07:25

[ BATAL ]

[ KONFIRMASI ]

Jika policy tidak memerlukan
confirmation kedua, langsung submit.

============================================================
# 29. CHECK-IN PROCESS
============================================================

UI:

Submitting...

Jangan mengizinkan double tap.

Button disabled selama request.

API:

POST employee attendance.

Server melakukan validation.

============================================================
# 30. CHECK-IN SUCCESS
============================================================

Tampilkan:

ABSEN MASUK BERHASIL

Jam:

07:25

Lokasi:

Sekolah

Status:

HADIR.

Update dashboard.

============================================================
# 31. CHECK-IN LATE
============================================================

Jika server mengembalikan:

LATE.

Tampilkan:

ABSEN MASUK TERCATAT

Status:

TERLAMBAT

Jam:

08:04.

Jangan frontend menghitung
status final sendiri.

============================================================
# 32. CHECK-OUT
============================================================

Jika sudah check-in:

Button:

[ ABSEN PULANG ]

Jika belum check-in:

Button disabled.

Pesan:

"Absensi masuk belum tercatat."

============================================================
# 33. SCHOOL QR ATTENDANCE
============================================================

Page:

SCAN QR LOKASI SEKOLAH

Camera scanner.

Contoh:

┌──────────────────┐
│                  │
│     QR AREA      │
│                  │
└──────────────────┘

Petunjuk:

"Scan QR yang ditempel
di lokasi absensi."

============================================================
# 34. QR LOCATION SUCCESS
============================================================

Setelah scan:

Lokasi:

GERBANG UTAMA

Distance jika GPS aktif.

Status:

LOKASI VALID.

Button:

[ ABSEN MASUK ]

atau proses otomatis sesuai konfigurasi.

============================================================
# 35. INVALID LOCATION QR
============================================================

Tampilkan:

QR LOKASI TIDAK VALID.

Kemungkinan:

QR tidak aktif
QR bukan milik unit
Token invalid
Token expired.

============================================================
# 36. PROFILE
============================================================

Setiap user memiliki:

Foto
Nama
Email
Nomor HP
Jabatan
Unit
Role.

Siswa:

NIS
NISN
Unit
Rombel.

Jangan menampilkan data
yang tidak diizinkan role.

============================================================
# 37. ATTENDANCE HISTORY
============================================================

Employee:

Tanggal
Check In
Check Out
Status
Method
Location.

Student:

Tanggal
Status
Jam
Source.

Gunakan pagination.

============================================================
# 38. ATTENDANCE DETAIL
============================================================

Detail:

Date
Time
Status
Method
Source
Location
Distance
Accuracy jika tersedia.

Jika data GPS:

Show Map.

============================================================
# 39. NOTIFICATION
============================================================

Notification Center:

Unread badge.

Contoh:

"Absensi Anda tercatat."

"Anda terlambat 12 menit."

"Permintaan koreksi disetujui."

"Siswa X belum melakukan absensi."

Notification berasal dari API.

Jangan membuat dummy notification.

============================================================
# 40. OFFLINE UX
============================================================

Jika offline:

Jangan menampilkan:

"Absensi berhasil."

Tampilkan:

"Tidak ada koneksi internet."

Jika offline queue diaktifkan:

"Menunggu sinkronisasi."

Status:

PENDING SYNC.

Setelah server menerima:

SYNCED.

============================================================
# 41. NETWORK ERROR
============================================================

Tampilkan:

Koneksi bermasalah.

[ COBA LAGI ]

Jangan kehilangan input
yang sudah dikonfirmasi user.

============================================================
# 42. API ERROR
============================================================

Mapping error:

409:
Attendance already exists.

403:
Tidak memiliki akses.

422:
Data tidak valid.

429:
Terlalu banyak request.

500:
Terjadi kesalahan server.

User tidak boleh melihat
stack trace.

============================================================
# 43. NAVIGATION
============================================================

Gunakan navigation berdasarkan role.

Security:

Home
Scan
History
Profile.

Teacher:

Home
Attendance
History
Notifications
Profile.

Employee:

Home
Attendance
History
Notifications
Profile.

Student:

Home
Attendance
History
Notifications
Profile.

Admin:

Dashboard
Attendance
Master Data
Reports
Settings
Profile.

============================================================
# 44. BOTTOM NAVIGATION
============================================================

Maksimal 5 item.

Jangan memenuhi bottom navigation.

Prioritaskan:

Home
Attendance
History
Notifications
Profile.

============================================================
# 45. ACCESS CONTROL UI
============================================================

Jangan hanya menyembunyikan menu.

Backend tetap wajib melakukan authorization.

Mobile:

hide unauthorized menu.

Backend:

reject unauthorized API.

============================================================
# 46. LOADING STATE
============================================================

Setiap API:

Loading
Success
Empty
Error.

Jangan menggunakan blank screen.

Gunakan:

Skeleton
Progress indicator
Empty state.

============================================================
# 47. EMPTY STATE
============================================================

Contoh:

"Belum ada riwayat absensi."

"Belum ada siswa."

"Belum ada notifikasi."

Jangan tampilkan dummy record.

============================================================
# 48. CAMERA PERMISSION
============================================================

Saat scanner pertama kali dibuka:

Explain why camera is required.

Jika denied:

Tampilkan state yang jelas.

Jangan crash.

============================================================
# 49. MAP PERMISSION
============================================================

Saat GPS page:

Request location permission.

Handle:

Denied
Permanently denied
Disabled
Timeout.

Jangan crash.

============================================================
# 50. CAMERA SCANNER PERFORMANCE
============================================================

Scanner harus:

Fast
Debounced
Prevent duplicate scanning.

Setelah satu QR terdeteksi:

pause scanner.

Tunggu API response.

Kemudian:

resume scanner.

============================================================
# 51. ACCESSIBILITY
============================================================

Gunakan:

Readable font
Large tap target
Semantic labels
Contrast
Screen reader support.

Minimum tap target:

44x44 logical pixels.

============================================================
# 52. DESIGN SYSTEM
============================================================

Gunakan design system konsisten.

Komponen:

AppBar
Card
Button
Input
Chip
Dialog
BottomSheet
ScannerOverlay
MapCard
AttendanceStatus
Avatar
EmptyState
ErrorState
LoadingState.

Jangan membuat style berbeda
untuk setiap halaman.

============================================================
# 53. ATTENDANCE COLORS
============================================================

Gunakan semantic colors.

PRESENT:
Success.

LATE:
Warning.

ABSENT:
Error.

SICK:
Informational.

PERMITTED:
Neutral.

Tidak boleh mengandalkan
warna saja.

Tambahkan icon/text.

============================================================
# 54. SECURITY UX
============================================================

Security workflow harus:

Login
→ Scan
→ Result
→ Scan lagi.

Target:

satu scan < beberapa interaksi.

Jangan membuat Security
membuka banyak menu.

============================================================
# 55. TEACHER UX
============================================================

Teacher:

Login
→ Rombel
→ Scan/manual
→ Submit.

Jika guru hanya punya satu rombel:

langsung buka rombel tersebut.

Jika banyak:

tampilkan selector.

============================================================
# 56. EMPLOYEE UX
============================================================

Employee:

Login
→ Attendance
→ Map
→ Check In.

Saat pulang:

Attendance
→ Check Out.

============================================================
# 57. API INTEGRATION
============================================================

Flutter tidak boleh menggunakan
hardcoded attendance.

Gunakan:

API Client
Repository
Service
State Management.

Arsitektur:

UI
↓
State
↓
Repository
↓
API Client
↓
REST API
↓
Backend
↓
Database.

============================================================
# 58. STATE MANAGEMENT
============================================================

Gunakan state management
yang sudah digunakan project.

Jangan menambahkan library baru
jika tidak diperlukan.

State minimal:

AuthState
AttendanceState
ScannerState
LocationState
NotificationState.

============================================================
# 59. SECURITY TOKEN
============================================================

Token disimpan menggunakan
secure storage yang sesuai platform.

Jangan menyimpan:

JWT
password
sensitive credential

dalam plain text.

============================================================
# 60. SESSION EXPIRATION
============================================================

Jika token expired:

Refresh jika tersedia.

Jika refresh gagal:

Logout
→ Login page.

Jangan crash.

============================================================
# 61. DATA REFRESH
============================================================

Setelah attendance berhasil:

Update:

Today Attendance
Dashboard
History.

Tidak perlu restart aplikasi.

============================================================
# 62. PULL TO REFRESH
============================================================

Support pull-to-refresh pada:

Dashboard
Attendance History
Notifications.

============================================================
# 63. ROLE SWITCH
============================================================

Jangan membuat user memilih role
secara manual saat login.

Role berasal dari backend.

Jika satu user memiliki multiple roles:

gunakan role context
berdasarkan permission yang diberikan.

============================================================
# 64. WEB/PWA
============================================================

Jika Flutter Web/PWA digunakan:

QR scanner harus disesuaikan
dengan browser permission.

GPS browser harus ditangani.

Google Maps harus responsive.

Camera permission harus ditangani.

============================================================
# 65. SECURITY AGAINST UI BYPASS
============================================================

User tidak boleh mendapatkan
akses hanya dengan:

mengubah route
mengubah URL
mengubah state frontend
mengubah request client.

Backend authorization tetap final.

============================================================
# 66. TEST SCENARIOS
============================================================

TEST SECURITY:

Login
→ Scan valid QR
→ Success.

Scan invalid QR
→ Error.

Scan duplicate
→ Warning.

TEST TEACHER:

Select authorized rombel
→ Scan
→ Success.

Select unauthorized
→ Backend reject.

Manual attendance
→ Save.

TEST EMPLOYEE:

GPS inside radius
→ Check In.

GPS outside radius
→ Reject.

GPS poor accuracy
→ Retry.

Location QR
→ Success.

Duplicate check-in
→ Reject.

Check-out
→ Success.

============================================================
# 67. UI TEST
============================================================

Test:

Loading
Success
Error
Empty
Offline
Permission denied
Unauthorized
Duplicate
GPS outside radius
GPS inaccurate
Camera denied.

============================================================
# 68. PRODUCTION RULE
============================================================

Tidak boleh ada:

Dummy UI
Dummy attendance
Mock student
Mock employee
Fake GPS
Fake QR result
Simulation button.

Semua harus terhubung:

Flutter
↓
REST API
↓
Database.

============================================================
# 69. FINAL ACCEPTANCE
============================================================

Security dapat:

SCAN KARTU SISWA
→ ABSENSI.

Guru dapat:

SCAN SISWA
→ ABSENSI.

Guru dapat:

MANUAL
→ ABSENSI.

Guru/Karyawan dapat:

GPS
→ ABSEN MASUK/PULANG.

Guru/Karyawan dapat:

SCAN SCHOOL QR
→ ABSEN.

Admin dapat:

MONITORING
→ REPORT.

Semua berdasarkan:

RBAC
+
API
+
DATABASE
+
AUDIT.

============================================================
# 70. FINAL IMPLEMENTATION COMMAND
============================================================

IMPLEMENTASIKAN DESAIN INI LANGSUNG
KE APLIKASI FLUTTER YANG SUDAH ADA.

Jangan membuat prototype.

Jangan membuat dummy screen.

Jangan membuat placeholder logic.

Setiap tombol harus memiliki fungsi nyata.

Setiap halaman harus terhubung API.

Setiap data harus database-driven.

Setiap role harus mendapatkan dashboard
dan menu sesuai permission.

Setiap scanner harus benar-benar menggunakan
camera.

Setiap GPS attendance harus benar-benar
menggunakan device location.

Setiap Google Map harus menampilkan
lokasi aktual.

Setiap attendance harus divalidasi
oleh backend.

Setiap perubahan harus tercatat
dalam audit.

============================================================
# 71. FINAL QUALITY GATE
============================================================

Sebelum menyatakan selesai:

Run:

flutter analyze
flutter test
integration test
build test

API integration test

RBAC test

Scanner test

GPS test

Map test

Offline test

Authentication test.

Perbaiki semua:

ERROR
CRITICAL
HIGH
BROKEN FLOW.

Jangan menyatakan production-ready
jika masih ada critical/high error.

============================================================
END OF 142
============================================================