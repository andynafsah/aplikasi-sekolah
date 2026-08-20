# 146_ENTERPRISE_REPORTING_AND_EXECUTIVE_DASHBOARD_ENGINE.md

# ENTERPRISE REPORTING & EXECUTIVE DASHBOARD ENGINE
# SCHOOL & PONDOK PESANTREN MANAGEMENT SYSTEM

VERSION: 1.0.0
STATUS: PRODUCTION
PURPOSE: CENTRALIZED REPORTING, ANALYTICS & EXECUTIVE MONITORING

============================================================
1. OBJECTIVE
============================================================

Membangun satu Reporting Engine terpusat untuk:

- Dashboard pimpinan
- Dashboard yayasan
- Dashboard kepala sekolah
- Dashboard TU
- Dashboard bendahara
- Dashboard inventaris
- Dashboard kepegawaian
- Dashboard absensi
- Laporan administrasi
- Laporan keuangan
- Laporan inventaris
- Laporan kepegawaian
- Laporan siswa
- Laporan absensi
- Export
- Print
- PDF
- XLSX
- CSV

============================================================
2. ABSOLUTE RULE
============================================================

AUDIT EXISTING REPORTING FEATURES FIRST.

Jika laporan sudah tersedia:

REUSE.

Jika dashboard sudah tersedia:

EXTEND.

JANGAN membuat:

REPORT_ENGINE_2
DASHBOARD_ENGINE_2
EXPORT_ENGINE_2
PDF_REPORT_ENGINE_2

============================================================
3. CORE PRINCIPLE
============================================================

REPORTING ENGINE
BUKAN
SOURCE OF DATA.

Source data tetap berasal dari:

Student Engine
Employee Engine
Attendance Engine
TU Engine
Document Engine
Archive Engine
Inventory Engine
Finance Engine
Audit Engine

Reporting hanya
mengambil dan
mengolah data tersebut.

============================================================
4. NO DUPLICATE DATA
============================================================

Jangan membuat
database transaksi
khusus untuk dashboard.

Dashboard harus
menggunakan:

existing database
+
query/service layer.

============================================================
5. EXECUTIVE DASHBOARD
============================================================

Dashboard pimpinan:

- Total siswa
- Total guru
- Total karyawan
- Kehadiran hari ini
- Absensi siswa
- Absensi pegawai
- Surat masuk
- Surat keluar
- Dokumen
- Aset
- Stok
- Saldo kas
- Saldo bank
- Realisasi anggaran
- Pending approval

Semua harus dinamis.

============================================================
6. NO DUMMY STATISTICS
============================================================

Tidak boleh ada:

123 siswa
45 guru
Rp 50.000.000

yang ditulis langsung
di frontend.

Semua berasal dari
database.

============================================================
7. ROLE BASED DASHBOARD
============================================================

Dashboard harus
mengikuti role.

Contoh:

ADMIN
→ overview sistem.

TU
→ administrasi.

BENDAHARA
→ keuangan.

INVENTORY OFFICER
→ inventaris.

KEPALA SEKOLAH
→ executive overview.

YAYASAN
→ multi-unit overview
jika architecture
mendukung.

============================================================
8. PERMISSION
============================================================

Dashboard tidak boleh
menampilkan data yang
user tidak berhak lihat.

Contoh:

Bendahara tidak otomatis
dapat melihat dokumen
pegawai restricted.

============================================================
9. DASHBOARD WIDGET
============================================================

Widget configurable:

KPI
Chart
Table
Statistic
Alert
Recent Activity
Pending Task.

============================================================
10. WIDGET SOURCE
============================================================

Setiap widget harus
memiliki source/query
yang jelas.

Tidak boleh:

hardcoded number.

============================================================
11. KPI
============================================================

Contoh:

Total Students
Total Employees
Attendance Rate
Cash Balance
Bank Balance
Budget Utilization
Total Assets
Low Stock.

============================================================
12. DATE FILTER
============================================================

Global filter:

Today
This Week
This Month
This Year
Custom Range.

============================================================
13. PERIOD FILTER
============================================================

Finance report:

Fiscal Period.

Attendance:

Attendance Period.

Document:

Document Date.

Jangan memaksakan
satu tanggal untuk
semua domain jika
maknanya berbeda.

============================================================
14. DASHBOARD REFRESH
============================================================

Support:

Manual Refresh.

Jika architecture
memungkinkan:

automatic refresh.

============================================================
15. CACHE
============================================================

Dashboard boleh
menggunakan cache.

Tetapi:

CACHE ≠ SOURCE OF TRUTH.

Jika data berubah:

cache harus invalidated
atau expired.

============================================================
16. REPORT TYPES
============================================================

REPORT
├── Student
├── Employee
├── Attendance
├── Administration
├── Document
├── Archive
├── Inventory
├── Finance
├── Audit
└── Executive

============================================================
17. STUDENT REPORT
============================================================

Support:

Total siswa
Siswa per status
Siswa per unit
Siswa per gender
Siswa per grade/class
jika data tersebut
tersedia dari Student
Engine.

CATATAN:

Jangan membuat
logic KBM/Leger.

============================================================
18. EMPLOYEE REPORT
============================================================

Support:

Total guru
Total karyawan
Status employment
Unit
Position
Attendance.

Gunakan Employee Engine.

============================================================
19. ATTENDANCE REPORT
============================================================

Support:

Siswa hadir
Izin
Sakit
Alpa
Terlambat.

Guru/karyawan:

Hadir
Terlambat
Izin
Sakit
Alpa
GPS attendance
QR attendance.

Gunakan existing
Attendance Engine.

============================================================
20. STUDENT QR ATTENDANCE
============================================================

Reporting hanya
membaca:

attendance records.

Tidak membuat
scanner/attendance
engine kedua.

============================================================
21. EMPLOYEE GPS
============================================================

Reporting hanya
menampilkan hasil
attendance.

Tidak membuat
GPS engine kedua.

============================================================
22. ADMINISTRATION REPORT
============================================================

Support:

Surat masuk
Surat keluar
SK
Surat tugas
Disposisi
Dokumen
Arsip.

============================================================
23. DOCUMENT REPORT
============================================================

Report:

document by type
document by status
document by period
document by unit.

============================================================
24. ARCHIVE REPORT
============================================================

Report:

total archive
category
year
retention
legal hold
disposal.

============================================================
25. INVENTORY REPORT
============================================================

Report:

total items
stock
low stock
assets
asset condition
asset location
borrowed
maintenance
lost
disposed.

============================================================
26. FINANCE REPORT
============================================================

Support:

BKU
Income
Expense
Budget
Realization
Cash
Bank
Receivable
Payable
SPJ
Tax
Reconciliation.

============================================================
27. BUDGET REPORT
============================================================

Display:

Budget
Realization
Remaining
Utilization %.

============================================================
28. CASH REPORT
============================================================

Display:

Opening
Income
Expense
Transfer
Ending Balance.

============================================================
29. BANK REPORT
============================================================

Display:

Book balance
Bank statement balance
Difference
Unreconciled transactions.

============================================================
30. SPJ REPORT
============================================================

Display:

Draft
Submitted
Review
Approved
Rejected
Completed.

============================================================
31. AUDIT REPORT
============================================================

Display:

Login activity
Data changes
Financial activity
Document activity
Permission events
Security events.

============================================================
32. EXECUTIVE KPI
============================================================

Pimpinan dapat
melihat:

Operational Health
Attendance Health
Financial Health
Administrative Health
Asset Health.

============================================================
33. HEALTH STATUS
============================================================

GOOD
WARNING
CRITICAL

Status berasal dari
rules/configuration.

============================================================
34. ALERT ENGINE
============================================================

Alert contoh:

Low Stock
Overdue Loan
Pending Approval
Budget Overrun
Unreconciled Bank
Retention Review
Attendance Anomaly.

Gunakan existing
Notification/Monitoring
Engine jika tersedia.

============================================================
35. NO DUPLICATE ALERT
============================================================

Jangan membuat
Alert Engine baru.

Gunakan existing
Notification/Monitoring
architecture.

============================================================
36. CHARTS
============================================================

Support:

Bar
Line
Pie/Donut
Area
Table
KPI Card.

============================================================
37. CHART DATA
============================================================

Chart harus
menggunakan query
yang terukur.

Jangan mengambil
seluruh database lalu
mengolah semuanya
di browser.

============================================================
38. SERVER SIDE REPORTING
============================================================

Report besar harus
diproses server-side.

============================================================
39. PAGINATION
============================================================

Large reports:

pagination.

Jangan render
100.000 rows
sekaligus.

============================================================
40. FILTER
============================================================

Reports dapat
memiliki:

date
period
status
unit
category
employee
student
account
location.

============================================================
41. SAVED FILTER
============================================================

User dapat menyimpan
filter favorit jika
feature diperlukan.

Contoh:

Laporan Kas Bulanan.

============================================================
42. REPORT TEMPLATE
============================================================

Report template
configurable.

Data:

title
columns
filters
grouping
sorting
footer.

============================================================
43. REPORT BUILDER
============================================================

Jika tersedia:

reuse existing
Report Builder.

Jangan membuat
builder kedua.

============================================================
44. EXPORT
============================================================

Support:

PDF
XLSX
CSV.

============================================================
45. EXPORT SECURITY
============================================================

Export harus
mengikuti:

AUTH
RBAC
FILTER
DATA SCOPE.

============================================================
46. EXPORT LARGE DATA
============================================================

Large export dapat
menggunakan:

background job.

============================================================
47. EXPORT JOB
============================================================

Flow:

REQUEST
↓
QUEUE
↓
GENERATE
↓
STORE
↓
NOTIFY
↓
DOWNLOAD.

Gunakan existing
Queue Engine jika ada.

============================================================
48. EXPORT FILE
============================================================

Temporary export
harus memiliki
retention.

Jangan menyimpan
file export selamanya
tanpa policy.

============================================================
49. PDF
============================================================

Gunakan existing
Document Renderer.

Jangan membuat
PDF engine baru.

============================================================
50. XLSX
============================================================

Export harus
memiliki:

header
column
number formatting
date formatting.

============================================================
51. CSV
============================================================

CSV harus:

UTF-8
safe escaping
consistent delimiter.

============================================================
52. PRINT
============================================================

Print menggunakan
existing Document
Renderer.

============================================================
53. REPORT HEADER
============================================================

Header menggunakan
Institution Settings.

Tidak hardcode:

nama sekolah
alamat
logo.

============================================================
54. REPORT FOOTER
============================================================

Support:

generated by
date
page number
verification.

============================================================
55. REPORT METADATA
============================================================

Setiap generated
report dapat mencatat:

report_type
filters
generated_by
generated_at.

============================================================
56. REPORT AUDIT
============================================================

Catat:

view
export
print
download.

============================================================
57. FINANCIAL REPORT SAFETY
============================================================

Laporan keuangan
harus menggunakan
transaction ledger
sebagai source.

Tidak boleh menghitung
saldo dari data dummy.

============================================================
58. ATTENDANCE REPORT SAFETY
============================================================

Attendance report
menggunakan attendance
record asli.

Tidak boleh menghitung
dari frontend state
saja.

============================================================
59. INVENTORY REPORT SAFETY
============================================================

Stock report harus
menggunakan stock
ledger.

============================================================
60. DOCUMENT REPORT SAFETY
============================================================

Document report
menggunakan existing
Document Engine.

============================================================
61. ACADEMIC BOUNDARY
============================================================

REPORTING ENGINE
TIDAK BOLEH membuat:

KBM
Leger
Rapor
Nilai
Kurikulum
Penilaian.

============================================================
62. ACADEMIC INTEGRATION
============================================================

Jika diperlukan:

Management System
↓
API
↓
External KBM/Leger

Reporting hanya
menampilkan data yang
secara resmi disediakan
oleh integration.

Jangan membuat
academic database
duplicate.

============================================================
63. EXTERNAL REPORT
============================================================

External integration
harus diberi label:

SOURCE:
External Academic System.

============================================================
64. DASHBOARD LOADING
============================================================

Dashboard harus:

skeleton loading
empty state
error state
retry.

Tidak boleh blank screen.

============================================================
65. ERROR
============================================================

Jika query gagal:

Tampilkan:

"Kendala memuat data."

Berikan:

Retry.

Jangan tampilkan
stack trace production.

============================================================
66. EMPTY STATE
============================================================

Jika tidak ada data:

"Belum ada data."

Bukan:

dummy chart.

============================================================
67. QUERY ERROR
============================================================

Frontend harus
menggunakan existing
Query Client/provider.

Pastikan:

QueryClientProvider
tersedia di root
application.

============================================================
68. NO QUERY CLIENT ERROR
============================================================

WAJIB mencegah error:

"No QueryClient set"

Pastikan semua
React Query hooks
berjalan di dalam:

QueryClientProvider.

============================================================
69. QUERY CACHE
============================================================

Gunakan existing
TanStack Query
configuration.

Jangan membuat
provider kedua
secara sembarangan.

============================================================
70. API ERROR
============================================================

Handle:

401
403
404
422
429
500.

============================================================
71. 401
============================================================

Redirect/refresh
authentication sesuai
existing Auth Engine.

============================================================
72. 403
============================================================

Tampilkan:

Access Denied.

Jangan expose data.

============================================================
73. 422
============================================================

Tampilkan validation
message.

============================================================
74. 500
============================================================

Generic production
error.

Log detail hanya
di server/monitoring.

============================================================
75. DATABASE
============================================================

Reporting tidak
boleh mengubah
transaction data.

Default:

READ ONLY.

============================================================
76. QUERY OPTIMIZATION
============================================================

Gunakan:

indexes
aggregations
server-side filters
pagination.

============================================================
77. N+1 PREVENTION
============================================================

Gunakan:

eager loading
optimized joins
aggregation queries.

============================================================
78. REPORT CONSISTENCY
============================================================

Angka dashboard
harus konsisten dengan
laporan detail.

Contoh:

Dashboard Cash
=
Cash Report.

============================================================
79. RECONCILIATION
============================================================

Jika:

Dashboard = Rp X
Report = Rp Y

maka harus dianggap
bug dan diperbaiki.

============================================================
80. REPORT VERSION
============================================================

Jika struktur laporan
berubah:

versioning dapat
digunakan.

============================================================
81. REPORT ACCESS
============================================================

Permission:

report.view
report.export
report.print
report.download.

============================================================
82. EXECUTIVE ACCESS
============================================================

Pimpinan hanya
melihat data sesuai
scope lembaga/unit.

============================================================
83. MULTI-UNIT READY
============================================================

Jika sistem nantinya
mendukung:

Yayasan
├── Sekolah
├── Pondok
└── PKBM

dashboard dapat
menggunakan:

institution_id
unit_id.

Untuk single tenant
saat ini:

tetap jangan
hardcode.

============================================================
84. MOBILE
============================================================

Mobile dashboard:

KPI
Alerts
Recent Activity
Approval.

Desktop:

full reports
charts
tables
exports.

============================================================
85. RESPONSIVE
============================================================

Semua dashboard
harus responsive.

Tidak boleh:

horizontal overflow
yang tidak diperlukan.

============================================================
86. PERFORMANCE TARGET
============================================================

Dashboard normal:

target cepat
dan tidak melakukan
query berlebihan.

Report besar:

gunakan pagination
atau background job.

============================================================
87. SECURITY
============================================================

Jangan expose:

financial sensitive data
employee sensitive data
restricted documents.

============================================================
88. AUDIT
============================================================

Semua report
access/export
dapat diaudit.

============================================================
89. TESTING
============================================================

Unit test:

KPI calculation
budget percentage
attendance percentage
stock summary
cash summary.

============================================================
90. INTEGRATION TEST
============================================================

Test:

Student
Employee
Attendance
TU
Document
Archive
Inventory
Finance
Audit.

============================================================
91. E2E
============================================================

Dashboard:

Login
↓
Load dashboard
↓
Apply filter
↓
Open detail
↓
Export
↓
Print
↓
Audit.

============================================================
92. REGRESSION TEST
============================================================

Pastikan perubahan
report tidak merusak:

CRUD
Finance
Inventory
Attendance
TU.

============================================================
93. NO DUPLICATE
============================================================

Audit:

dashboard
component
query
service
report
export
route
menu.

Jika sudah ada:

REUSE.

============================================================
94. NO DUMMY
============================================================

Production:

NO DUMMY KPI
NO DUMMY CHART
NO DUMMY TABLE
NO DUMMY BALANCE.

============================================================
95. NO HARDCODE
============================================================

Jangan hardcode:

KPI
threshold
institution
currency
report title
category.

============================================================
96. FINAL HEALTH CHECK
============================================================

[ ] Executive Dashboard
[ ] Role Dashboard
[ ] KPI
[ ] Charts
[ ] Filters
[ ] Reports
[ ] PDF
[ ] XLSX
[ ] CSV
[ ] Print
[ ] Pagination
[ ] Export Job
[ ] Audit
[ ] Query Provider
[ ] Error State
[ ] Empty State
[ ] Loading State
[ ] RBAC
[ ] Real Data
[ ] No Dummy
[ ] No Hardcode
[ ] No Duplicate
[ ] No Academic Logic

============================================================
97. FINAL COMMAND
============================================================

AUDIT EXISTING REPORTING FIRST.

REUSE EXISTING DASHBOARD.

REUSE EXISTING REPORT ENGINE.

REUSE EXISTING EXPORT ENGINE.

REUSE EXISTING PDF ENGINE.

REUSE EXISTING DOCUMENT RENDERER.

REUSE EXISTING QUERY ARCHITECTURE.

REUSE EXISTING RBAC.

REUSE EXISTING AUDIT.

REUSE EXISTING NOTIFICATION.

REUSE EXISTING QUEUE.

DO NOT CREATE DUPLICATE REPORT ENGINE.

DO NOT CREATE DUPLICATE DASHBOARD.

DO NOT CREATE DUPLICATE EXPORT ENGINE.

NO KBM.

NO LEGER.

NO RAPOR.

NO NILAI.

NO KURIKULUM.

NO DUMMY DATA.

NO HARDCODED STATISTICS.

ALL DASHBOARD DATA MUST BE REAL.

ALL REPORT DATA MUST BE TRACEABLE.

ALL REPORT TOTALS MUST RECONCILE
WITH SOURCE MODULES.

ALL EXPORTS MUST RESPECT RBAC.

ALL PRINT/PDF/XLSX/CSV MUST WORK.

ALL QUERY ERRORS MUST HAVE
SAFE ERROR HANDLING.

NO "NO QUERYCLIENT SET" ERROR.

PRODUCTION READY.

# END ENTERPRISE REPORTING & EXECUTIVE DASHBOARD ENGINE