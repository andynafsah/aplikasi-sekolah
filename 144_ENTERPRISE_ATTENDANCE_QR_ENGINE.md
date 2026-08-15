# 144 — ENTERPRISE ATTENDANCE QR ENGINE

## PRODUCTION QR ATTENDANCE MASTER PROMPT

Anda bertindak sebagai:

- Senior Backend Engineer
- Senior Flutter Engineer
- Security Engineer
- Database Engineer
- QR/Barcode Engineer
- API Architect
- QA Engineer

Implementasikan QR Attendance Engine pada CODEBASE
yang SUDAH ADA.

JANGAN membuat project baru.

JANGAN membuat demo.

JANGAN membuat simulasi.

JANGAN membuat fake QR.

JANGAN membuat dummy student.

JANGAN membuat fake attendance.

SEMUA QR HARUS TERHUBUNG KE DATABASE.

============================================================
# 1. TUJUAN
============================================================

Bangun QR Engine untuk:

1. QR Kartu Pelajar Siswa
2. QR/Barcode Lokasi Sekolah
3. Scanner Security
4. Scanner Guru
5. QR Management Admin
6. Revoke QR
7. Regenerate QR
8. QR Validation
9. Anti Duplicate
10. Audit
11. Security Monitoring.

============================================================
# 2. ARSITEKTUR
============================================================

Flutter
   ↓
QR Scanner
   ↓
REST API
   ↓
QR Validation Engine
   ↓
Permission / Scope Validation
   ↓
Attendance Business Rule
   ↓
Database
   ↓
Audit Log

Frontend tidak boleh menentukan:

- QR valid
- student valid
- attendance valid
- location valid
- duplicate atau tidak.

SERVER adalah SOURCE OF TRUTH.

============================================================
# 3. JENIS QR
============================================================

Sistem memiliki dua jenis QR:

A. STUDENT QR

B. ATTENDANCE LOCATION QR.

Jangan mencampurkan kedua jenis QR.

============================================================
# 4. STUDENT QR
============================================================

Setiap siswa aktif dapat memiliki:

1 active QR.

Data:

student_id
qr_identifier
token hash
status
issued_at
revoked_at
expires_at.

============================================================
# 5. STUDENT QR PAYLOAD
============================================================

Jangan memasukkan data pribadi langsung
ke QR.

JANGAN:

Nama
NIK
NISN
Alamat
No HP
Data orang tua.

QR cukup membawa:

public identifier
atau
secure token.

Contoh konseptual:

SCHOOL-STUDENT:<secure-token>

Format final harus mengikuti
arsitektur keamanan backend.

============================================================
# 6. TOKEN
============================================================

Token harus:

random
unpredictable
unique
sufficient entropy.

Jangan gunakan:

student_id sederhana.

Jangan gunakan:

NIS sebagai QR token.

Jangan gunakan:

tanggal lahir.

============================================================
# 7. TOKEN STORAGE
============================================================

Jika token bersifat secret:

Database menyimpan:

HASH(token).

Jangan menyimpan plaintext token
jika tidak diperlukan.

Jika QR perlu ditampilkan kembali:

gunakan mekanisme token generation
yang aman.

============================================================
# 8. QR STATUS
============================================================

Status:

ACTIVE
REVOKED
EXPIRED
INACTIVE.

Hanya ACTIVE yang dapat
digunakan untuk attendance.

============================================================
# 9. QR GENERATION
============================================================

Admin:

Student
↓
QR Management
↓
Generate QR
↓
Backend generate token
↓
Save hashed token
↓
Return QR representation
↓
Preview
↓
Print.

============================================================
# 10. REGENERATE QR
============================================================

Jika kartu hilang:

Admin:

REVOKE OLD QR
↓
GENERATE NEW QR.

QR lama:

REVOKED.

QR baru:

ACTIVE.

Jangan memiliki dua QR aktif
untuk satu siswa kecuali
fitur multiple active cards
memang dikonfigurasi secara eksplisit.

============================================================
# 11. REVOKE QR
============================================================

Endpoint:

POST
/api/v1/students/{id}/qr/revoke

Reason:

Lost Card
Damaged Card
Replacement
Security.

Semua revoke:

Audit Log.

============================================================
# 12. QR VALIDATION
============================================================

Scanner mengirim:

qr_token.

Backend:

Decode
↓
Identify QR Type
↓
Find QR
↓
Validate hash/token
↓
Validate status
↓
Find student/location
↓
Return identity
↓
Continue attendance.

============================================================
# 13. QR TYPE DETECTION
============================================================

QR student:

STUDENT QR.

QR location:

LOCATION QR.

Jika unknown:

INVALID_QR.

============================================================
# 14. STUDENT QR ATTENDANCE
============================================================

Security:

POST:

/api/v1/attendance/students/scan

Request:

{
  "qr_token": "...",
  "client_transaction_id": "..."
}

Server:

Authenticate
↓
Role validation
↓
QR validation
↓
Student validation
↓
Unit validation
↓
Attendance session
↓
Time rule
↓
Duplicate check
↓
Create attendance
↓
Audit.

============================================================
# 15. SECURITY ATTENDANCE
============================================================

Security dapat scan:

STUDENT QR.

Security tidak boleh scan:

employee QR
admin QR
location QR
unless explicitly authorized.

============================================================
# 16. SECURITY GATE
============================================================

Jika Security ditugaskan:

Gate A.

Backend mengetahui:

security_user
↓
authorized_gate
↓
authorized_unit.

Scan siswa:

Student
↓
Student Unit
↓
Gate Unit.

Jika tidak cocok:

REJECT.

============================================================
# 17. TEACHER QR ATTENDANCE
============================================================

Guru:

Login
↓
Pilih Rombel
↓
Scan Student QR
↓
Backend validation
↓
Scope validation
↓
Attendance.

Guru hanya dapat scan
siswa dalam scope.

============================================================
# 18. TEACHER SCOPE
============================================================

Backend memeriksa:

teacher_id
unit_id
rombel_id
student_id.

Semua harus sesuai
policy assignment yang tersedia.

Frontend tidak boleh
menentukan scope sendiri.

============================================================
# 19. LOCATION QR
============================================================

Location QR digunakan untuk:

Guru
Karyawan
Pegawai.

Contoh:

GERBANG UTAMA
RUANG GURU
KANTOR TU
PONDOK.

============================================================
# 20. LOCATION QR DATA
============================================================

attendance_locations:

id
unit_id
name
code
qr_identifier
token_hash
latitude
longitude
radius_meters
status.

============================================================
# 21. LOCATION QR GENERATION
============================================================

Admin:

Location
↓
Generate QR
↓
Preview
↓
Download
↓
Print
↓
Tempel di lokasi.

QR harus memiliki:

Nama lokasi
Kode
QR
Petunjuk.

Jangan mencetak
token secret sebagai teks.

============================================================
# 22. LOCATION QR REVOKE
============================================================

Jika QR rusak atau dicurigai bocor:

REVOKE.

Generate token baru.

QR lama:

INVALID.

============================================================
# 23. LOCATION QR ATTENDANCE
============================================================

Employee:

Scan QR
↓
API
↓
Validate token
↓
Validate location
↓
Validate employee
↓
Validate schedule
↓
Validate duplicate
↓
Save.

============================================================
# 24. GPS + LOCATION QR
============================================================

Konfigurasi dapat menentukan:

QR only

atau:

QR + GPS.

Jika:

QR + GPS:

Scan QR
+
ambil GPS
↓
Server distance validation
↓
Attendance.

============================================================
# 25. QR ANTI REPLAY
============================================================

Jangan percaya:

QR token saja.

Gunakan:

Authenticated User
+
Timestamp
+
Attendance Window
+
QR Status
+
Permission
+
Scope.

Untuk lokasi sensitif,
gunakan optional rotating QR.

============================================================
# 26. ROTATING QR
============================================================

Jika diaktifkan:

QR token berubah secara berkala.

Server memvalidasi:

current token
+
time window.

Jangan menjadikan rotating QR
sebagai default jika infrastruktur
belum mendukungnya dengan baik.

Static QR tetap boleh digunakan
dengan security layer tambahan.

============================================================
# 27. DUPLICATE SCAN
============================================================

Jika siswa sudah absen:

Jangan membuat record baru.

Response:

409

Code:

ATTENDANCE_ALREADY_RECORDED.

Mobile menampilkan:

"Absensi siswa sudah tercatat."

============================================================
# 28. FAST SCANNING
============================================================

Scanner Security harus mendukung
scan berulang dengan cepat.

Flow:

Scan
↓
Pause camera
↓
API
↓
Show result
↓
Short delay
↓
Resume camera.

Jangan langsung mengirim
puluhan request akibat camera
mendeteksi QR berkali-kali.

============================================================
# 29. SCANNER DEBOUNCE
============================================================

Implement:

scanner lock.

Setelah QR terdeteksi:

lock = true.

Unlock setelah:

API result
atau
timeout.

============================================================
# 30. CAMERA PERMISSION
============================================================

Jika belum diberikan:

Tampilkan explanation.

Jika denied:

Tampilkan:

"Kamera diperlukan untuk
scan kartu pelajar."

Button:

BUKA PENGATURAN.

Jangan crash.

============================================================
# 31. MANUAL QR CODE INPUT
============================================================

Jika diperlukan:

Input kode QR secara manual.

Tetap melalui:

API validation.

Jangan bypass QR validation.

============================================================
# 32. QR ERROR MESSAGES
============================================================

INVALID_QR

"QR tidak valid."

QR_REVOKED

"Kartu sudah tidak aktif."

QR_EXPIRED

"Kartu sudah kedaluwarsa."

STUDENT_NOT_FOUND

"Data siswa tidak ditemukan."

STUDENT_INACTIVE

"Siswa tidak aktif."

STUDENT_OUT_OF_SCOPE

"Siswa tidak berada dalam cakupan Anda."

LOCATION_QR_INVALID

"QR lokasi tidak valid."

LOCATION_INACTIVE

"Lokasi absensi tidak aktif."

============================================================
# 33. STUDENT RESULT CARD
============================================================

Setelah scan:

Foto
Nama
NIS
Rombel
Unit

Status:

HADIR
atau
TERLAMBAT.

Jam.

Source:

SECURITY GATE
atau
TEACHER.

Jangan tampilkan data pribadi
yang tidak diperlukan.

============================================================
# 34. SECURITY RESULT
============================================================

Security:

Foto
Nama
Rombel
Status
Jam.

Jangan tampilkan:

NIK
KK
Alamat
Data orang tua.

============================================================
# 35. TEACHER RESULT
============================================================

Guru:

Foto
Nama
NIS
Rombel
Status.

Jika siswa di luar scope:

Reject.

============================================================
# 36. QR CARD MANAGEMENT
============================================================

Admin dapat:

Generate
Revoke
Regenerate
Preview
Download
Print.

Bulk:

Generate
Download
Print.

============================================================
# 37. BULK QR
============================================================

Admin dapat:

Pilih unit
Pilih rombel
Pilih siswa
Generate QR.

Sistem harus memastikan:

siswa aktif.

Jika QR sudah aktif:

Jangan overwrite otomatis.

Tampilkan:

Already Active.

============================================================
# 38. STUDENT CARD
============================================================

Kartu pelajar dapat berisi:

Logo
Nama Lembaga
Foto
Nama
NIS
NISN
Unit
Rombel
QR.

Layout harus configurable.

============================================================
# 39. QR PRINT
============================================================

Support:

A4
A5
ID Card
Custom size.

Print harus:

tajam
jelas
mudah discan.

Gunakan vector/adequate resolution.

============================================================
# 40. QR VALIDATION API
============================================================

Endpoint:

POST
/api/v1/qr/validate

Gunakan hanya jika diperlukan.

Response:

type
status
reference.

Jangan mengembalikan
sensitive information.

============================================================
# 41. STUDENT QR API
============================================================

GET:

/api/v1/students/{id}/qr

POST:

/api/v1/students/{id}/qr/generate

POST:

/api/v1/students/{id}/qr/revoke

POST:

/api/v1/students/{id}/qr/regenerate.

============================================================
# 42. LOCATION QR API
============================================================

GET:

/api/v1/attendance/locations

POST:

/api/v1/attendance/locations/{id}/qr/generate

POST:

/api/v1/attendance/locations/{id}/qr/revoke

POST:

/api/v1/attendance/locations/{id}/qr/regenerate.

============================================================
# 43. QR AUDIT
============================================================

Audit:

GENERATED
REVOKED
REGENERATED
SCANNED
FAILED
EXPIRED.

Simpan:

actor
timestamp
QR type
reference
source
result.

Jangan menyimpan
secret token plaintext dalam audit.

============================================================
# 44. SECURITY EVENTS
============================================================

Monitor:

Repeated invalid QR
Repeated revoked QR
Repeated QR for unauthorized student
Repeated scans
High-frequency requests.

Jika threshold tercapai:

security event.

============================================================
# 45. RATE LIMIT
============================================================

Per user/device/IP sesuai
arsitektur:

QR validation
QR scan
QR generation.

Jangan sampai scanner legitimate
terblokir secara tidak wajar.

Rate limit harus configurable.

============================================================
# 46. DATABASE INTEGRITY
============================================================

Constraint:

QR identifier UNIQUE.

Active QR policy enforced.

Location code UNIQUE.

Attendance unique.

Transaction ID UNIQUE.

Foreign keys valid.

============================================================
# 47. CONCURRENCY
============================================================

Jika dua Security
scan kartu siswa yang sama
secara bersamaan:

Database tetap hanya menghasilkan
satu attendance.

Request kedua:

409 duplicate.

============================================================
# 48. MULTI UNIT
============================================================

QR siswa harus tetap mengidentifikasi
siswa yang benar.

Namun authorization menentukan:

apakah scanner boleh
mencatat attendance siswa tersebut.

============================================================
# 49. QR MIGRATION
============================================================

Jika database sudah memiliki
QR implementation:

JANGAN membuat tabel duplicate.

Audit:

existing table
existing service
existing endpoint.

Kemudian:

extend/refactor.

============================================================
# 50. FLUTTER QR SERVICE
============================================================

Gunakan:

QrScannerService

StudentQrAttendanceRepository

LocationQrAttendanceRepository.

Flow:

Camera
↓
Scanner Service
↓
Repository
↓
API Client
↓
REST API.

============================================================
# 51. STATE
============================================================

Student QR scanner:

IDLE
SCANNING
PROCESSING
SUCCESS
DUPLICATE
INVALID
ERROR.

Location QR:

IDLE
SCANNING
PROCESSING
VALID
INVALID
ERROR.

============================================================
# 52. OFFLINE
============================================================

Jika QR scan offline:

Jangan menyatakan:

"Absensi berhasil."

Jika offline queue didukung:

PENDING_SYNC.

Server tetap menjadi
source of truth.

============================================================
# 53. SECURITY AGAINST MANIPULATION
============================================================

Frontend tidak boleh
mengubah:

student_id
attendance_status
unit_id
rombel_id
scanner_role.

Server menentukan.

============================================================
# 54. TEST CASES
============================================================

TEST 01
Generate student QR.

TEST 02
Scan valid student QR.

TEST 03
Scan invalid QR.

TEST 04
Scan revoked QR.

TEST 05
Scan expired QR.

TEST 06
Scan inactive student.

TEST 07
Duplicate scan.

TEST 08
Teacher authorized scan.

TEST 09
Teacher unauthorized scan.

TEST 10
Security authorized scan.

TEST 11
Security unauthorized scope.

TEST 12
Generate location QR.

TEST 13
Scan location QR.

TEST 14
Revoke location QR.

TEST 15
Scan revoked location QR.

TEST 16
Concurrent scan.

TEST 17
Repeated invalid scan.

TEST 18
Camera permission denied.

TEST 19
Network failure.

TEST 20
API timeout.

============================================================
# 55. SECURITY TEST
============================================================

Attempt:

change student ID
change unit ID
change rombel ID
change role
reuse revoked QR
reuse expired QR
replay request
duplicate transaction.

Semua harus ditolak
atau diproses sesuai policy.

============================================================
# 56. PRODUCTION ACCEPTANCE
============================================================

QR SISWA:

GENERATE
↓
PRINT
↓
KARTU PELAJAR
↓
SCAN
↓
VALIDATE
↓
ATTENDANCE
↓
AUDIT.

QR LOKASI:

GENERATE
↓
PRINT
↓
TEMPEL DI DINDING
↓
SCAN
↓
VALIDATE
↓
ATTENDANCE
↓
AUDIT.

============================================================
# 57. NO DUMMY
============================================================

Hapus:

fake QR
sample QR
demo scanner
simulation scan
dummy student
fake result.

Test fixture hanya boleh digunakan
dalam automated testing environment.

============================================================
# 58. FINAL IMPLEMENTATION
============================================================

Audit codebase.

Cari:

QR service
Barcode service
Student card
Scanner
Attendance
API
Database.

REUSE existing components.

Jangan membuat duplicate
QR engine.

Integrasikan dengan:

141 Database Engine
142 Mobile UX
143 REST API.

============================================================
# 59. FINAL QA
============================================================

Run:

Flutter analyze
Flutter test
Backend test
API test
Database test
Security test
Scanner integration test
E2E test.

Semua critical error:

0.

============================================================
# 60. FINAL OUTPUT
============================================================

Berikan laporan:

1. Existing QR implementation
2. QR database changes
3. Student QR changes
4. Location QR changes
5. API changes
6. Flutter changes
7. RBAC changes
8. Security improvements
9. Migration status
10. Test result
11. Remaining issues.

Jangan menyatakan:

PRODUCTION READY

jika masih ada critical/high error.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN QR ENGINE INI
PADA CODEBASE YANG SUDAH ADA.

PRIORITASKAN:

STUDENT QR
+
SECURITY GATE
+
TEACHER SCANNER
+
LOCATION QR
+
ANTI DUPLICATE
+
REVOKE
+
REGENERATE
+
AUDIT
+
RBAC
+
DATABASE
+
REST API
+
FLUTTER.

SEMUA HARUS REAL.

TIDAK ADA:

DUMMY
MOCK
SIMULASI
FAKE SUCCESS
HARDCODE
BYPASS.

============================================================
END OF 144
============================================================