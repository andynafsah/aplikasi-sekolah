# 148 — ENTERPRISE ATTENDANCE REPORTING & EXPORT ENGINE

## PRODUCTION ATTENDANCE REPORTING MASTER PROMPT

Anda bertindak sebagai:

- Senior Product Architect
- Senior Backend Engineer
- Senior Flutter Engineer
- Senior Web Engineer
- Database Engineer
- Reporting Engineer
- PDF/Document Engineer
- RBAC Security Engineer
- Audit Engineer
- QA Engineer

Implementasikan ENTERPRISE ATTENDANCE REPORTING & EXPORT ENGINE
pada CODEBASE yang SUDAH ADA.

JANGAN membuat aplikasi baru.

JANGAN membuat reporting engine kedua.

JANGAN membuat data dummy.

JANGAN menggunakan data simulasi.

JANGAN menggunakan statistik hardcoded.

SEMUA laporan harus mengambil data aktual
dari DATABASE melalui SERVICE/API yang sama
dengan sistem absensi.

============================================================
# 1. TUJUAN
============================================================

Sistem laporan harus menyediakan:

1. Laporan absensi siswa
2. Laporan absensi guru
3. Laporan absensi karyawan
4. Laporan gabungan
5. Laporan harian
6. Laporan mingguan
7. Laporan bulanan
8. Laporan berdasarkan unit
9. Laporan berdasarkan rombel
10. Laporan berdasarkan status
11. Laporan berdasarkan metode
12. Laporan keterlambatan
13. Laporan ketidakhadiran
14. Laporan Security Gate
15. Laporan GPS
16. Laporan QR
17. Laporan manual
18. Laporan koreksi
19. Laporan audit
20. Rekapitulasi attendance rate.

============================================================
# 2. SOURCE OF TRUTH
============================================================

Sumber data:

ATTENDANCE DATABASE.

Alur:

DATABASE
↓
ATTENDANCE SERVICE
↓
REPORT SERVICE
↓
REST API
↓
WEB / FLUTTER
↓
PDF / XLSX / CSV / PRINT.

Jangan membuat data
khusus hanya untuk laporan.

============================================================
# 3. REPORTING PRINCIPLE
============================================================

Laporan harus:

- akurat
- konsisten
- dapat diaudit
- dapat difilter
- dapat diekspor
- dapat dicetak
- mengikuti RBAC
- mengikuti organization scope
- mengikuti unit scope
- mengikuti rombel scope.

============================================================
# 4. ROLE ACCESS
============================================================

SUPER ADMIN:

Semua organization yang
memang berada dalam scope.

YAYASAN:

Unit yang diizinkan.

KEPALA SEKOLAH:

Unit sekolah.

KEPALA TU:

Unit administratif.

TU:

Scope yang diberikan.

SECURITY:

Hanya laporan gate/lokasi
yang menjadi tanggung jawabnya.

WALI KELAS:

Rombel yang ditugaskan.

GURU:

Data yang diizinkan berdasarkan
assignment dan permission.

KARYAWAN:

Hanya data miliknya
untuk laporan personal.

============================================================
# 5. REPORT MENU
============================================================

Menu:

Laporan Absensi

Submenu:

1. Ringkasan
2. Siswa
3. Guru
4. Karyawan
5. Keterlambatan
6. Ketidakhadiran
7. Gate
8. GPS
9. QR
10. Manual
11. Koreksi
12. Audit
13. Export History.

Menu hanya tampil jika
permission tersedia.

============================================================
# 6. REPORT DASHBOARD
============================================================

Tampilkan:

Total Person
Hadir
Terlambat
Izin
Sakit
Alpa
Belum Absen.

Semua angka:

DATABASE QUERY.

Tidak boleh:

const total = 320;

============================================================
# 7. DATE FILTER
============================================================

Support:

Hari ini
Kemarin
Minggu ini
Minggu lalu
Bulan ini
Bulan lalu
Custom Range.

Tanggal dikirim ke backend.

============================================================
# 8. TIMEZONE
============================================================

Gunakan timezone
organization/unit.

Jangan gunakan timezone
browser/device sebagai sumber utama.

Backend menentukan:

start datetime
end datetime.

============================================================
# 9. STUDENT REPORT
============================================================

Kolom:

No
Tanggal
Nama
NIS
Unit
Rombel
Status
Jam Masuk
Jam Keluar
Metode
Gate/Lokasi.

============================================================
# 10. STUDENT MONTHLY REPORT
============================================================

Format:

Nama siswa

Tanggal 1
H
Tanggal 2
H
Tanggal 3
I
Tanggal 4
A
dst.

Summary:

Hadir
Terlambat
Sakit
Izin
Alpa.

============================================================
# 11. EMPLOYEE REPORT
============================================================

Kolom:

No
Tanggal
Nama
NIP/NIY
Jabatan
Unit
Check-in
Check-out
Status
Method
Location.

============================================================
# 12. TEACHER REPORT
============================================================

Khusus guru:

Nama
NIP/NIY
Unit
Jabatan
Check-in
Check-out
Terlambat
Total Hari Hadir
Total Hari Tidak Hadir.

============================================================
# 13. EMPLOYEE MONTHLY REPORT
============================================================

Summary:

Total hari kerja
Hadir
Terlambat
Izin
Alpa
Tidak check-out.

============================================================
# 14. ATTENDANCE RATE
============================================================

Backend menghitung:

Attendance Rate

berdasarkan:

hari kerja
dan
record attendance aktual.

Jangan menghitung
berdasarkan jumlah scan
semata.

============================================================
# 15. LATE REPORT
============================================================

Filter:

Tanggal
Unit
Rombel
Role
Person
Method.

Kolom:

Nama
Tanggal
Schedule
Actual
Late Duration
Method.

============================================================
# 16. LATE CALCULATION
============================================================

Gunakan:

work schedule
attendance time
grace period.

Contoh:

Schedule:
07:30

Grace:
10 menit

Check-in:
07:45

Late:
5 menit.

Semua konfigurasi
berasal dari database/config.

============================================================
# 17. ABSENCE REPORT
============================================================

Status:

ABSENT
SICK
PERMITTED
NOT_RECORDED.

Jangan menyamakan:

tidak scan

dengan:

alpa

tanpa business rule.

============================================================
# 18. GATE REPORT
============================================================

Security dapat melihat:

Gate
Date
Time
Student
NIS
Scanner
Result.

Result:

SUCCESS
INVALID
DUPLICATE
REVOKED
UNAUTHORIZED.

============================================================
# 19. QR REPORT
============================================================

Kolom:

Time
Person
QR Type
Scanner
Location
Result.

QR Type:

STUDENT_CARD
LOCATION_QR.

============================================================
# 20. GPS REPORT
============================================================

Kolom:

Nama
Tanggal
Waktu
Latitude
Longitude
Accuracy
Distance
Location
Status.

Jangan menampilkan
GPS detail kepada role
yang tidak berwenang.

============================================================
# 21. MANUAL ATTENDANCE REPORT
============================================================

Kolom:

Nama
Tanggal
Status
Input By
Reason
Approval
Created At.

============================================================
# 22. CORRECTION REPORT
============================================================

Kolom:

Request Date
Attendance Date
Requester
Type
Original
Requested
Reason
Status
Reviewer
Approver
Decision Date.

============================================================
# 23. AUDIT REPORT
============================================================

Kolom:

Timestamp
Actor
Action
Entity
Entity ID
Before
After
IP/Device Reference
Reason.

Sensitive fields harus
disensor sesuai permission.

============================================================
# 24. REPORT FILTER ENGINE
============================================================

Semua report harus mendukung:

date_from
date_to
unit_id
rombel_id
person_id
role
status
method
location_id.

Tidak semua filter wajib
ditampilkan pada semua report.

============================================================
# 25. SERVER-SIDE FILTER
============================================================

Filter harus diproses:

BACKEND.

Jangan:

download semua data
ke Flutter
lalu filter di client.

============================================================
# 26. SERVER-SIDE PAGINATION
============================================================

Gunakan:

page
per_page.

Response:

data
meta
pagination.

============================================================
# 27. SORTING
============================================================

Support:

date
name
status
time
unit.

Sorting harus
divalidasi backend.

Jangan menerima
raw SQL dari client.

============================================================
# 28. SEARCH
============================================================

Search:

Nama
NIS
NIP
NIY
Employee Code.

Server-side.

============================================================
# 29. REPORT API
============================================================

GET

/api/v1/attendance/reports/summary

/api/v1/attendance/reports/students

/api/v1/attendance/reports/employees

/api/v1/attendance/reports/teachers

/api/v1/attendance/reports/late

/api/v1/attendance/reports/absence

/api/v1/attendance/reports/gates

/api/v1/attendance/reports/qr

/api/v1/attendance/reports/gps

/api/v1/attendance/reports/manual

/api/v1/attendance/reports/corrections

/api/v1/attendance/reports/audit.

Gunakan existing API convention.

============================================================
# 30. REPORT RESPONSE
============================================================

Standard:

{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 25,
    "total": 120
  }
}

============================================================
# 31. EXPORT
============================================================

Support:

PDF
XLSX
CSV
PRINT.

Jika existing project sudah memiliki
document/export engine:

REUSE.

Jangan membuat engine kedua.

============================================================
# 32. EXPORT API
============================================================

Contoh:

POST
/api/v1/attendance/reports/export

Request:

{
  "report": "students",
  "format": "pdf",
  "filters": {}
}

Backend:

validate
↓
authorize
↓
query
↓
generate
↓
store
↓
return download reference.

============================================================
# 33. EXPORT SECURITY
============================================================

User tidak boleh
mengubah filter menjadi
scope organisasi lain
untuk mendapatkan data.

Backend selalu menerapkan:

authorization scope.

============================================================
# 34. EXPORT FORMAT
============================================================

Allowed:

pdf
xlsx
csv.

Jika format lain belum didukung:

return validation error.

============================================================
# 35. PDF ENGINE
============================================================

PDF harus:

rapi
profesional
A4
landscape/portrait
header
footer
page number
tanggal laporan
periode
nama lembaga.

============================================================
# 36. KOP SURAT
============================================================

Jika laporan resmi:

gunakan kop lembaga
dari Organization Settings.

Data:

Nama Yayasan
Nama Sekolah
Alamat
Telepon
Email
Logo.

Jangan hardcode.

============================================================
# 37. LOGO
============================================================

Logo berasal dari:

organization settings
atau
unit settings.

Jika tidak tersedia:

gunakan layout tanpa logo.

Jangan menggunakan
logo dummy.

============================================================
# 38. PDF FONT
============================================================

Gunakan font yang:

jelas
professional
support Unicode.

Font harus konsisten
dengan document engine
existing.

============================================================
# 39. PDF PAGE SIZE
============================================================

Default:

A4.

Support:

Portrait
Landscape.

Report table lebar:

Landscape.

============================================================
# 40. PDF HEADER
============================================================

Contoh:

[NAMA YAYASAN]

[NAMA SEKOLAH]

LAPORAN ABSENSI SISWA

Periode:
01 Agustus 2026 - 31 Agustus 2026.

============================================================
# 41. PDF FOOTER
============================================================

Footer:

Halaman X dari Y

Generated:
tanggal/jam server.

============================================================
# 42. PRINT
============================================================

Print harus:

menggunakan report
yang sama dengan PDF.

Jangan membuat
layout print berbeda
dengan data API.

============================================================
# 43. XLSX
============================================================

Excel:

Header
Data
Summary
Filter information.

Jika diperlukan:

Sheet 1:
Summary

Sheet 2:
Detail.

============================================================
# 44. CSV
============================================================

CSV harus:

UTF-8
header jelas
escape field benar.

============================================================
# 45. REPORT TEMPLATE
============================================================

Gunakan template engine
yang sudah tersedia.

Jangan membuat
HTML string berantakan
langsung di controller.

============================================================
# 46. DOCUMENT SERVICE
============================================================

Architecture:

Controller
↓
Report Service
↓
Query Builder
↓
Report DTO
↓
Document Renderer
↓
Storage
↓
Download.

============================================================
# 47. REPORT DTO
============================================================

Pisahkan:

database model

dengan:

report response model.

Jangan expose ORM entity
langsung.

============================================================
# 48. REPORT QUERY
============================================================

Gunakan query optimized.

Hindari:

N+1.

Gunakan:

joins
aggregations
indexes.

============================================================
# 49. LARGE REPORT
============================================================

Untuk laporan besar:

gunakan:

streaming
chunking
background job.

Jangan membuat request
HTTP timeout untuk
100.000+ records.

============================================================
# 50. EXPORT JOB
============================================================

Untuk export besar:

CREATE JOB
↓
PROCESS
↓
STORE FILE
↓
NOTIFY USER
↓
DOWNLOAD.

============================================================
# 51. EXPORT STATUS
============================================================

QUEUED
PROCESSING
COMPLETED
FAILED
EXPIRED.

============================================================
# 52. EXPORT HISTORY
============================================================

Simpan:

user
report
format
filters
status
file
created_at
completed_at
expires_at.

============================================================
# 53. EXPORT HISTORY API
============================================================

GET

/api/v1/attendance/reports/exports

GET

/api/v1/attendance/reports/exports/{id}

============================================================
# 54. FILE EXPIRATION
============================================================

Export file dapat
memiliki expiration.

Setelah expired:

file tidak dapat
di-download.

Metadata tetap
dapat disimpan
untuk audit.

============================================================
# 55. DOWNLOAD SECURITY
============================================================

Download harus:

authenticated
authorized
ownership/scope validated.

Jangan menggunakan
public permanent URL
untuk laporan sensitif.

============================================================
# 56. SIGNED DOWNLOAD
============================================================

Jika storage mendukung:

gunakan signed URL
dengan expiration.

============================================================
# 57. REPORT CACHE
============================================================

Cache hanya jika aman.

Jangan cache report
yang menyebabkan user
mendapatkan data
user lain.

Cache key wajib
memperhitungkan:

user scope
organization
unit
filters.

============================================================
# 58. SUMMARY CALCULATION
============================================================

Summary harus konsisten
dengan detail.

Jika:

Detail = 100 records.

Summary tidak boleh
menampilkan:

120.

Gunakan query/service
yang konsisten.

============================================================
# 59. REPORT RECONCILIATION
============================================================

Tambahkan validasi:

summary count
=
detail count.

Jika tidak:

flag report inconsistency.

============================================================
# 60. STUDENT MONTHLY MATRIX
============================================================

Tampilkan:

Nama
1
2
3
4
...
31

Status:

H
T
S
I
A
-

Legend:

H = Hadir
T = Terlambat
S = Sakit
I = Izin
A = Alpa
- = Tidak ada hari kerja.

============================================================
# 61. EMPLOYEE MONTHLY MATRIX
============================================================

Nama
Tanggal
Check-in
Check-out
Status.

Summary:

Total Working Days
Present
Late
Permission
Absent.

============================================================
# 62. ATTENDANCE RECAP
============================================================

Per unit:

Unit
Total Person
Present
Late
Sick
Permission
Absent
Attendance Rate.

============================================================
# 63. ROMBEL RECAP
============================================================

Rombel:

VI-A
Total:
32

Hadir:
28

Terlambat:
2

Izin:
1

Sakit:
1

Alpa:
0.

============================================================
# 64. UNIT RECAP
============================================================

Contoh:

SD
SMP
SMA
PONDOK
PKBM

sesuai master unit
yang ada di database.

============================================================
# 65. SECURITY RECAP
============================================================

Per gate:

Gate
Total Scan
Success
Invalid
Duplicate
Revoked.

============================================================
# 66. GPS RECAP
============================================================

Per location:

Location
Total
Inside Radius
Outside Radius
Accuracy Failure.

============================================================
# 67. OUTSIDE RADIUS
============================================================

Report:

Nama
Waktu
Distance
Allowed Radius
Status.

Jangan mengubah
attendance menjadi
valid hanya karena
report.

============================================================
# 68. CORRECTION RECAP
============================================================

Summary:

Pending
Approved
Rejected
Expired.

============================================================
# 69. REPORT DATE SNAPSHOT
============================================================

Untuk report yang
sudah di-generate:

simpan filter dan
generation timestamp.

Jika report harus
reproducible:

simpan generated file.

============================================================
# 70. REPORT NAME
============================================================

Nama file harus dinamis.

Contoh:

Laporan_Absensi_Siswa_SD_Agustus_2026.pdf

Laporan_Absensi_Guru_Agustus_2026.xlsx.

Jangan menggunakan:

report.pdf

untuk semua laporan.

============================================================
# 71. LOCALIZATION
============================================================

Format:

Bahasa Indonesia.

Tanggal:

14 Agustus 2026.

Angka:

sesuai Indonesian locale.

============================================================
# 72. FRONTEND FILTER UI
============================================================

Desktop:

┌───────────────────────────────────────┐
│ Laporan Absensi                       │
├───────────────────────────────────────┤
│ Periode [Bulan] [2026]               │
│ Unit [Semua] Rombel [Semua]          │
│ Status [Semua] Method [Semua]        │
│ [Terapkan] [Reset] [Export]          │
└───────────────────────────────────────┘

============================================================
# 73. MOBILE REPORT UI
============================================================

Mobile:

Report Type
↓
Date
↓
Filter
↓
Preview
↓
Export.

Gunakan bottom sheet
untuk filter kompleks.

============================================================
# 74. REPORT PREVIEW
============================================================

Sebelum export:

tampilkan preview
summary.

User dapat:

Export PDF
Export Excel
Export CSV
Print.

============================================================
# 75. EXPORT BUTTON
============================================================

Button harus mengikuti
permission:

attendance.report.export.

Jika tidak ada permission:

button tidak ditampilkan.

============================================================
# 76. PRINT PERMISSION
============================================================

Gunakan:

attendance.report.print.

============================================================
# 77. AUDIT EXPORT
============================================================

Setiap export:

audit:

user
report
filters
format
timestamp.

============================================================
# 78. AUDIT PRINT
============================================================

Print juga dicatat
jika policy membutuhkan.

============================================================
# 79. ERROR HANDLING
============================================================

Jika report gagal:

Tampilkan:

"Laporan gagal dibuat."

Button:

[Coba Lagi]

Jangan menampilkan
stack trace kepada user.

============================================================
# 80. EMPTY REPORT
============================================================

Jika tidak ada data:

"Belum ada data absensi
untuk filter yang dipilih."

Jangan menghasilkan
file kosong tanpa
informasi.

============================================================
# 81. API ERROR
============================================================

Handle:

401
403
404
422
429
500
503.

============================================================
# 82. PERMISSION TEST
============================================================

Test:

Super Admin
Yayasan
Kepala Sekolah
TU
Security
Wali Kelas
Guru
Karyawan.

Pastikan hasil report
tidak bocor lintas scope.

============================================================
# 83. SECURITY TEST
============================================================

Test:

User mencoba:

unit_id lain
organization_id lain
rombel lain
person_id lain
export ID milik user lain.

Semua harus divalidasi.

============================================================
# 84. PERFORMANCE TEST
============================================================

Test:

1.000
10.000
50.000
100.000 records.

Pastikan:

query tidak N+1
index digunakan
export besar menggunakan job.

============================================================
# 85. DATABASE INDEX
============================================================

Review index:

attendance_date
student_id
employee_id
unit_id
rombel_id
status
method
location_id
created_at.

Tambahkan hanya jika
dibutuhkan berdasarkan
schema/query aktual.

============================================================
# 86. TEST REPORT ACCURACY
============================================================

Bandingkan:

Database
vs
Dashboard
vs
API
vs
PDF
vs
XLSX
vs
CSV.

Semua harus sama.

============================================================
# 87. NO DUPLICATE REPORT ENGINE
============================================================

Cari existing:

ReportService
ExportService
PdfService
ExcelService
DocumentService
StorageService.

REUSE.

Jangan membuat:

NewReportService2
AttendanceExportNew
PdfAttendanceNew.

============================================================
# 88. EXISTING DOCUMENT ENGINE
============================================================

Jika project sudah memiliki:

kop surat
template dokumen
font
logo
PDF generator
Word generator.

Integrasikan.

Jangan membuat
format yang berbeda.

============================================================
# 89. CROSS PLATFORM
============================================================

WEB:

Full reporting.

FLUTTER:

Report summary
detail
filter
export/download
personal report.

Role yang membutuhkan
report kompleks dapat
menggunakan web jika
policy menentukan.

============================================================
# 90. OFFLINE
============================================================

Report realtime
tidak boleh dianggap
valid jika data belum
tersinkron.

Tampilkan:

Last updated.

============================================================
# 91. PRODUCTION RULE
============================================================

HAPUS:

dummy report
fake statistics
fake PDF
fake XLSX
mock download
simulation report.

Testing fixture hanya
boleh berada di test environment.

============================================================
# 92. DATA CONSISTENCY
============================================================

Setiap report harus
menggunakan business rule
attendance yang sama.

Jangan:

dashboard menggunakan
formula A.

report menggunakan
formula B.

Gunakan:

AttendanceCalculationService.

============================================================
# 93. ATTENDANCE CALCULATION SERVICE
============================================================

Centralize:

late calculation
working day
attendance status
grace period
holiday
schedule
permission
absence.

============================================================
# 94. HOLIDAY
============================================================

Hari libur tidak boleh
otomatis dihitung sebagai
absence.

Gunakan:

academic/calendar configuration.

============================================================
# 95. WORKING DAY
============================================================

Gunakan:

working schedule
unit calendar
academic calendar.

Jangan hardcode:

Senin-Jumat.

============================================================
# 96. REPORT FILTER VALIDATION
============================================================

Tanggal:

date_from <= date_to.

Range maksimum
dapat dikonfigurasi.

============================================================
# 97. EXPORT RATE LIMIT
============================================================

Batasi export berat
untuk mencegah abuse.

Gunakan queue jika perlu.

============================================================
# 98. REPORT SECURITY
============================================================

Data sensitif:

GPS
personal information
audit.

Harus mengikuti
permission.

============================================================
# 99. FINAL PRODUCTION CHECK
============================================================

Pastikan:

[ ] Semua report dinamis
[ ] Semua data dari database
[ ] Semua filter bekerja
[ ] Search bekerja
[ ] Pagination bekerja
[ ] Sorting bekerja
[ ] RBAC bekerja
[ ] Scope bekerja
[ ] PDF bekerja
[ ] XLSX bekerja
[ ] CSV bekerja
[ ] Print bekerja
[ ] Export history bekerja
[ ] Signed download bekerja
[ ] Audit export bekerja
[ ] Report konsisten
[ ] Tidak ada dummy
[ ] Tidak ada mock
[ ] Tidak ada simulation
[ ] Tidak ada hardcode.

============================================================
# 100. FINAL ACCEPTANCE
============================================================

DATABASE
↓
ATTENDANCE ENGINE
↓
REPORT SERVICE
↓
API
↓
WEB / FLUTTER
↓
PREVIEW
↓
PDF / XLSX / CSV / PRINT.

SEMUA HARUS MENGGUNAKAN
DATA DAN BUSINESS RULE
YANG SAMA.

============================================================
# 101. FINAL REPORT
============================================================

Setelah implementasi laporkan:

1. Report modules
2. API endpoints
3. Query architecture
4. Calculation service
5. RBAC
6. Scope isolation
7. PDF implementation
8. XLSX implementation
9. CSV implementation
10. Print implementation
11. Export job
12. Storage
13. Audit
14. Test result
15. Performance result
16. Migration result
17. Remaining issues.

============================================================
# FINAL COMMAND
============================================================

IMPLEMENTASIKAN ENTERPRISE
ATTENDANCE REPORTING & EXPORT
ENGINE.

INTEGRASIKAN DENGAN:

ATTENDANCE
+
QR
+
GPS
+
SECURITY GATE
+
CORRECTION
+
APPROVAL
+
RBAC
+
AUDIT
+
NOTIFICATION
+
DOCUMENT ENGINE
+
DATABASE.

HASIL AKHIR HARUS
PRODUCTION READY.

TIDAK BOLEH ADA:

DUMMY
MOCK
SIMULATION
HARDCODED STATISTICS
FAKE REPORT
FAKE PDF
FAKE EXPORT
BYPASS RBAC.

============================================================
END OF 148
============================================================