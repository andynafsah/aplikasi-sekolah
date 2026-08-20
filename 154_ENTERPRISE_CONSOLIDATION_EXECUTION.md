# 154 — ENTERPRISE CONSOLIDATION EXECUTION

## MASTER PRODUCTION EXECUTION PROMPT

TUGAS INI ADALAH MENJALANKAN HASIL AUDIT
152 DAN REKONSILIASI 153.

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT ENGINE KEDUA.

JANGAN MEMBUAT DATABASE SOURCE OF TRUTH KEDUA.

JANGAN MEMBUAT BUSINESS LOGIC DUPLICATE.

JANGAN MEMBUAT UI DUPLICATE.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT MODE SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE.

JANGAN DROP TABLE.

JANGAN TRUNCATE TABLE.

==================================================
1. SOURCE OF TRUTH
==================================================

Gunakan hasil:

153 — ENTERPRISE SYSTEM SOURCE OF TRUTH
RECONCILIATION REPORT

sebagai dasar eksekusi.

Jangan mengubah keputusan
Source of Truth tanpa bukti
dari codebase.

==================================================
2. PRIMARY DOMAIN SERVICES
==================================================

Gunakan implementation existing:

Student
→ src/services/student.service.ts

Employee
→ src/services/employee.service.ts

Teacher
→ src/services/teacher.service.ts
  jika memang digunakan sebagai
  extension dari Employee.

Attendance
→ src/services/smart-attendance.service.ts

Schedule
→ ScheduleEngineService

Document
→ src/services/document.service.ts

Payment/SPP
→ src/services/payment.service.ts

Finance
→ src/services/finance.service.ts

Payroll
→ src/services/payroll.service.ts

Notification
→ src/services/notification.service.ts

Audit
→ src/services/audit.service.ts

JANGAN membuat service kedua
untuk domain yang sama.

==================================================
3. DATABASE SOURCE OF TRUTH
==================================================

Gunakan database/model primary
yang telah ditetapkan audit.

Institution
→ schools

Units
→ school_units

Users
→ users

Students
→ students

Employees
→ employees

Teachers
→ teachers

Attendance
→ attendances

Schedule
→ attendance_schedules

Letters
→ letters

Payments
→ payments

Invoices
→ invoices

Payroll
→ payroll_masters
→ payroll_runs

Notifications
→ notifications

Audit
→ audit_logs.

==================================================
4. LEGACY SERVICES
==================================================

Audit menyatakan terdapat
duplicate services di:

src/database/services/Services.ts

yang mencakup:

StudentService
TeacherService
EmployeeService
FinanceService
PayrollService.

JANGAN menghapus langsung.

LANGKAH:

1. cari seluruh import
2. cari seluruh dependency
3. cari seluruh route yang memanggil
4. cari seluruh frontend caller
5. bandingkan business logic
6. redirect ke canonical service
7. buat compatibility adapter jika diperlukan
8. test
9. tandai deprecated
10. hanya hapus jika benar-benar
   sudah tidak memiliki dependency.

==================================================
5. COMPATIBILITY ADAPTER
==================================================

Jika kode legacy masih dipakai:

Legacy
↓
Compatibility Adapter
↓
Canonical Service.

JANGAN:

Legacy
↓
Database

jika canonical service
seharusnya menangani
business logic.

==================================================
6. API CONSOLIDATION
==================================================

Canonical REST API tetap
menjadi primary.

Contoh:

GET /api/v1/students

POST /api/v1/students

PUT /api/v1/students/:id

DELETE /api/v1/students/:id

GET /api/v1/employees

POST /api/v1/attendance/...

GET /api/v1/documents

POST /api/v1/payments

POST /api/v1/payroll/...

==================================================
7. UNIVERSAL ACTION ROUTER
==================================================

Existing:

/api/action

TIDAK BOLEH memiliki
business logic duplicate.

Semua action harus:

validate
↓
authorize
↓
delegate
↓
canonical service
↓
response.

Contoh:

action=getStudents
↓
StudentController
↓
StudentService.

action=saveStudent
↓
StudentController
↓
StudentService.

action=smartAttendance
↓
AttendanceController
↓
smartAttendanceService.

==================================================
8. ATTENDANCE
==================================================

JANGAN MEMBUAT ENGINE ABSENSI BARU.

Gunakan:

smartAttendanceService

untuk:

Student QR
Security Gate
Teacher Manual
Employee GPS
Employee QR
Check-in
Check-out
Correction.

Schedule:

ScheduleEngineService.

Calculation:

AttendanceCalculationService.

==================================================
9. STUDENT QR
==================================================

Canonical:

POST
/api/v1/attendance/students/scan

Flow:

QR
↓
QR validation
↓
Student validation
↓
Actor authorization
↓
Unit scope
↓
Schedule
↓
Duplicate detection
↓
Attendance Core
↓
Database
↓
Audit
↓
Notification.

==================================================
10. EMPLOYEE GPS
==================================================

Canonical:

POST
/api/v1/attendance/employees/gps/check-in

Gunakan:

smartAttendanceService
+
ScheduleEngineService
+
Geofence validation.

Jangan membuat GPS service
kedua.

==================================================
11. STUDENT CARD
==================================================

Student QR tetap berasal
dari:

Student.qr_code_token

Jangan membuat tabel student
identity kedua hanya untuk QR.

QR service bertugas:

generate
validate
revoke
rotate

sesuai architecture existing.

==================================================
12. DOCUMENT & TU
==================================================

Canonical:

DocumentService
+
TU Engine.

Gunakan:

Letter
Disposition
Archive
KopSuratConfig.

Jangan membuat:

LetterEngine2
DocumentEngine2
ArchiveEngine2.

==================================================
13. STUDIO DOKUMEN
==================================================

Audit 153 menetapkan:

StudioDokumen.tsx

diintegrasikan ke:

TataUsaha.tsx.

Eksekusi:

1. identifikasi fungsi
2. pindahkan entry point UI
3. gunakan component existing
4. pertahankan functionality
5. jangan membuat designer baru
6. jangan kehilangan template existing.

==================================================
14. KOP SURAT
==================================================

Kop surat harus dinamis.

Source:

School
+
SchoolUnit
+
KopSuratConfig.

Jangan hardcode:

nama
alamat
logo
telepon
email
NPSN.

Semua document:

preview
PDF
Word
print

menggunakan source yang sama.

==================================================
15. PAYMENT / SPP
==================================================

Canonical:

PaymentService.

Database:

payments
+
invoices
+
payment_allocations.

Jangan menggunakan
FinanceService lama
untuk transaksi SPP
jika PaymentService
sudah menjadi primary.

Finance hanya menangani
accounting ledger sesuai
architecture existing.

==================================================
16. FINANCE
==================================================

Canonical:

FinanceService.

Database:

COA
AccountingTransaction
Journal.

Semua transaksi accounting
harus masuk melalui
ledger architecture.

Jangan membuat:

FinanceService duplicate
di legacy layer.

==================================================
17. PAYROLL
==================================================

Canonical:

PayrollService.

Database:

payroll_masters
payroll_runs
payroll_kasbon.

Payroll boleh mengonsumsi
agregasi attendance.

Jangan membuat attendance
calculation kedua di payroll.

==================================================
18. NOTIFICATION
==================================================

Canonical:

NotificationService.

Jika WhatsApp digunakan:

NotificationService
↓
WhatsAppService.

Jangan membuat notification
engine per modul.

==================================================
19. AUDIT
==================================================

Canonical:

AuditService
+
audit_logs.

Attendance audit,
payroll audit,
financial audit

boleh mempunyai extension/
specialized audit table jika
memang sudah ada.

Tetapi central audit policy
tetap satu.

==================================================
20. FRONTEND CONSOLIDATION
==================================================

Gunakan primary UI
hasil audit 153.

Student:

Sivitas.tsx

Employee:

Pegawai.tsx

Attendance:

Attendance.tsx

TU:

TataUsaha.tsx

SPP:

BillingSpp.tsx

Finance:

Keuangan.tsx

Payroll:

Payroll.tsx

Inventory:

Asset.tsx
Inventory.tsx

Notification:

NotificationGateway.tsx

System:

Sistem.tsx.

Jangan menampilkan
duplicate screens.

==================================================
21. ATTENDANCE UI
==================================================

Gunakan:

Attendance.tsx

sebagai command center.

Mobile:

MobilePlatform.tsx

untuk gate/scan mode.

GoogleMapsAttendanceView.tsx

untuk GPS/location.

EnterpriseAttendanceCommandCenter
hanya dipertahankan jika
benar-benar digunakan sebagai
component/secondary view.

Jangan memiliki dua
command center yang
menjalankan logic sama.

==================================================
22. EXCLUDED KBM
==================================================

Aplikasi ini TIDAK menggunakan:

KBM Engine
Leger
Rapor
Penilaian
Curriculum Engine

sebagai domain utama.

Jika ditemukan:

PlotingGuru.tsx
atau fitur KBM legacy,

jangan dikembangkan.

Tandai:

LEGACY / EXCLUDED.

Jangan membuat replacement.

==================================================
23. TENANTS
==================================================

Aplikasi menggunakan:

Single Organization
+
Multi Unit.

Jangan mengaktifkan
tenant management sebagai
fitur utama.

Tenants.tsx:

DEPRECATED / EXCLUDED

jika hanya untuk SaaS
multi-tenant yang belum
digunakan.

==================================================
24. RBAC
==================================================

Pertahankan:

AuthService
+
RbacService.

Roles:

Super Admin
Yayasan
Kepala Sekolah
TU/Admin
Bendahara
Guru
Security
Karyawan.

Gunakan:

permission
+
unit scope.

Jangan authorization
berdasarkan frontend
visibility saja.

==================================================
25. CROSS-UNIT SECURITY
==================================================

WAJIB memastikan:

user Unit A

tidak dapat:

read
update
delete
approve

data Unit B

tanpa permission eksplisit.

JWT scope harus digunakan
oleh backend.

==================================================
26. CRUD
==================================================

Setiap primary module
harus memiliki:

CREATE
READ
UPDATE
DELETE
DETAIL
SEARCH
FILTER
PAGINATION.

Jika fitur existing belum
mendukung salah satunya:

JANGAN membuat module baru.

Perbaiki implementation
existing.

==================================================
27. MODAL
==================================================

Pastikan:

Create modal
Edit modal
Detail modal
Delete confirmation
Preview modal

benar-benar terhubung
ke API.

Tidak boleh:

fake submit
fake delete
fake success
dummy response.

==================================================
28. DELETE
==================================================

Gunakan policy entity.

Master data:

soft delete jika
architecture menggunakan
is_active/deleted_at.

Attendance:

IMMUTABLE.

Payment:

IMMUTABLE.

Audit:

IMMUTABLE.

Financial transaction:

REVERSAL/JOURNAL.

Jangan hard delete
historical records.

==================================================
29. DATABASE RELATION
==================================================

Verifikasi:

School
↓
SchoolUnit
↓
Student
↓
Attendance
↓
Payment

School
↓
SchoolUnit
↓
Employee
↓
User
↓
Attendance
↓
Payroll.

Semua foreign key
harus valid.

==================================================
30. RAW DATABASE ACCESS
==================================================

Cari seluruh:

prisma.student.create
prisma.student.update
prisma.attendance.create
prisma.payment.create
prisma.payroll.create

yang dilakukan langsung
di:

controller
route
frontend
legacy service.

Business mutation harus
melewati canonical service.

==================================================
31. CACHE
==================================================

Redis/In-Memory:

CACHE/FALLBACK ONLY.

Tidak boleh menjadi
authoritative database.

Jika database tersedia:

database adalah source
of truth.

==================================================
32. DIAG_STATE
==================================================

Audit menyatakan:

DIAG_STATE

adalah recovery fallback.

JANGAN menghapus sebelum
dependency check.

Pastikan fallback:

tidak diam-diam mengaktifkan
data dummy saat production
database tersedia.

Jika MySQL offline:

fail safely.

Jangan menampilkan
dummy production data.

==================================================
33. MOCK DATA
==================================================

Cari:

boardingMockData.ts
communicationData.ts
mock
demo
fixture.

Development/test data
tidak boleh bocor
ke production UI.

Jika diperlukan untuk
development:

isolasi berdasarkan
environment.

==================================================
34. FILE STORAGE
==================================================

Primary:

MinIO/S3.

Fallback:

local storage hanya
untuk development/fallback
sesuai configuration.

Database menyimpan:

URL
metadata
etag
size
mime type.

Jangan menyimpan
binary base64 besar
di database.

==================================================
35. DOCUMENT EXPORT
==================================================

PDF
Word
Print

harus berasal dari
document/template engine
yang sama.

Jangan membuat
PDF layout yang berbeda
dengan preview frontend
tanpa alasan.

==================================================
36. REPORT
==================================================

ReportService menjadi
single reporting layer.

AttendanceExportService
khusus attendance jika
memang existing.

Dashboard tidak boleh
menghasilkan angka
berbeda dari report.

==================================================
37. API RESPONSE
==================================================

Standardize:

success
data
message
errors
pagination
meta.

Jangan merusak contract
frontend existing.

==================================================
38. ERROR HANDLING
==================================================

Backend:

controlled errors.

Frontend:

toast/dialog/error state.

Tidak boleh:

silent catch
fake success
console-only error.

==================================================
39. LOGGING
==================================================

Production log tidak boleh
mengandung:

password
JWT
secret
credential
sensitive payload.

==================================================
40. TEST SEBELUM MERGE
==================================================

Untuk setiap consolidation:

1. TypeScript
2. Lint
3. Unit test
4. Integration test
5. API test
6. Build.

Jangan melanjutkan jika
critical test gagal.

==================================================
41. REGRESSION
==================================================

WAJIB test:

Login
RBAC
Student CRUD
Employee CRUD
Student QR
Employee GPS
Employee QR
Manual Attendance
Correction
Schedule
TU Letter
Document
SPP
Finance
Payroll
Inventory
Notification
Report
Export.

==================================================
42. PRODUCTION DATA SAFETY
==================================================

DILARANG:

DROP DATABASE
TRUNCATE
RESET
DELETE production records
seed dummy production
mass update tanpa migration
mass delete.

==================================================
43. GIT / CHANGE SAFETY
==================================================

Sebelum perubahan:

buat daftar file.

Setiap perubahan harus
dapat ditelusuri.

Jangan melakukan
mass replacement tanpa
dependency analysis.

==================================================
44. DEPRECATION
==================================================

Setiap legacy implementation
harus diberi:

@deprecated

atau dokumentasi
deprecation yang sesuai
dengan bahasa/framework.

Tetapi jangan menghapus
jika masih digunakan.

==================================================
45. ACCEPTANCE MATRIX
==================================================

Hasil akhir harus:

| Domain | Primary | Duplicate Removed/Adapter | CRUD | RBAC | Test |
|---|---|---|---|---|---|

Semua primary domain
harus PASS.

==================================================
46. FINAL CODEBASE SCAN
==================================================

Setelah consolidation:

scan ulang:

services
controllers
routes
models
components
pages
hooks
stores
utilities.

Cari kembali:

duplicate
legacy
mock
simulation
hardcode
raw database mutation.

==================================================
47. FINAL SOURCE OF TRUTH
==================================================

Hasil akhir WAJIB tetap
konsisten dengan 153:

Student
→ StudentService

Employee
→ EmployeeService

Attendance
→ smartAttendanceService

Schedule
→ ScheduleEngineService

Document
→ DocumentService

Payment
→ PaymentService

Finance
→ FinanceService

Payroll
→ PayrollService

Notification
→ NotificationService

Audit
→ AuditService.

==================================================
48. STOP CONDITION
==================================================

Jika ditemukan:

database conflict
service conflict
business logic conflict
RBAC conflict
data integrity issue

JANGAN MENEBak.

STOP pada area tersebut
dan laporkan.

==================================================
49. FINAL REPORT
==================================================

WAJIB laporkan:

1. Files changed
2. Services consolidated
3. Services deprecated
4. Routes consolidated
5. APIs preserved
6. Components consolidated
7. Database untouched/changed
8. Relations verified
9. RBAC verified
10. CRUD verified
11. Dummy data removed/isolated
12. Simulation removed/isolated
13. Hardcoded values fixed
14. Tests passed
15. Build passed
16. Remaining blockers
17. Remaining risks.

==================================================
50. FINAL PRODUCTION RULE
==================================================

TIDAK ADA FITUR BARU.

TIDAK ADA DUPLICATE ENGINE.

TIDAK ADA DUPLICATE DATABASE.

TIDAK ADA DUPLICATE API BUSINESS LOGIC.

TIDAK ADA DUPLICATE UI.

TIDAK ADA DUMMY PRODUCTION.

TIDAK ADA SIMULATION PRODUCTION.

WEB DAN FLUTTER HARUS
MENGGUNAKAN BACKEND CORE
YANG SAMA.

DATABASE ADALAH
SOURCE OF TRUTH.

==================================================
FINAL COMMAND
==================================================

EXECUTE CONSOLIDATION
BERDASARKAN HASIL 153.

PERTAHANKAN DATA.

PERTAHANKAN FUNCTIONALITY.

KONSOLIDASIKAN LOGIC.

DEPRECATE DUPLICATE.

GUNAKAN COMPATIBILITY ADAPTER
JIKA MASIH DIPERLUKAN.

TEST SETIAP PERUBAHAN.

JANGAN MEMBUAT FITUR BARU.

STOP DAN LAPORKAN JIKA
MENEMUKAN KONFLIK KRITIS.

# END OF 154