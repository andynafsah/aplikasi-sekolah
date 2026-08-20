# 158 — ENTERPRISE FULL REGRESSION & END-TO-END QA

## MASTER PRODUCTION QA PROMPT

TUGAS INI ADALAH FINAL FULL-SYSTEM
REGRESSION DAN END-TO-END QA.

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT MODUL BARU.

JANGAN MEMBUAT ENGINE DUPLICATE.

JANGAN MEMBUAT DATA DUMMY UNTUK
MENUTUPI ERROR.

JANGAN MEMBUAT SIMULASI YANG
DIANGGAP SEBAGAI HASIL PRODUKSI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE PRODUKSI.

==================================================
1. TUJUAN
==================================================

Validasi seluruh aplikasi:

FRONTEND
↓
AUTHENTICATION
↓
RBAC
↓
REST API
↓
BUSINESS SERVICE
↓
DATABASE
↓
STORAGE
↓
NOTIFICATION
↓
AUDIT
↓
DOCUMENT
↓
REPORT.

Target:

PRODUCTION READY.

==================================================
2. TEST ENVIRONMENT
==================================================

Gunakan environment test/staging
yang menyerupai production.

WAJIB:

DATABASE TEST
STORAGE TEST
EMAIL/NOTIFICATION TEST
API TEST
WEB TEST
MOBILE/PWA TEST.

JANGAN menjalankan destructive
test terhadap production database.

==================================================
3. TEST DATA
==================================================

Jika membutuhkan data:

gunakan controlled test fixture.

Data harus:

isolated
identifiable
reversible.

JANGAN memasukkan data dummy
ke production.

==================================================
4. APPLICATION BOOT
==================================================

Test:

backend start
frontend start
database connection
storage connection
cache connection
queue connection
notification service.

Expected:

NO CRITICAL ERROR.

==================================================
5. DATABASE
==================================================

Check:

connection
migration state
schema
foreign key
unique constraint
index
transaction
relation.

==================================================
6. AUTHENTICATION E2E
==================================================

Test:

login valid
login invalid
logout
expired session
invalid token
inactive account
blocked account
password validation.

==================================================
7. LOGIN REDIRECT
==================================================

Setelah login:

role
↓
permission
↓
dashboard sesuai role.

Tidak boleh semua role
masuk ke dashboard Super Admin.

==================================================
8. ROLE DASHBOARD
==================================================

Test:

Super Admin
Yayasan
Kepala Sekolah
TU
Bendahara
Guru
Security
Karyawan.

Setiap role hanya melihat
dashboard dan menu yang
diizinkan.

==================================================
9. RBAC E2E
==================================================

Test:

VIEW
CREATE
UPDATE
DELETE
APPROVE
EXPORT.

Lakukan:

authorized request
unauthorized request.

==================================================
10. CROSS-UNIT TEST
==================================================

User Unit A:

read Unit A → PASS

read Unit B → DENY

update Unit B → DENY

delete Unit B → DENY.

Jika cross-unit permission
memang diberikan:

PASS sesuai policy.

==================================================
11. STUDENT E2E
==================================================

Test:

CREATE
READ
DETAIL
UPDATE
ARCHIVE
SEARCH
FILTER
PAGINATION
DOCUMENT
QR.

Flow:

Create Student
↓
Database
↓
Student List
↓
Student Detail
↓
QR
↓
Attendance.

==================================================
12. EMPLOYEE E2E
==================================================

Test:

Create Employee
↓
User Account
↓
Role
↓
Unit
↓
Attendance.

Pastikan tidak membuat
duplicate identity.

==================================================
13. TEACHER
==================================================

Test teacher relation
dengan employee.

Pastikan:

employee identity
tetap satu.

==================================================
14. STUDENT QR ATTENDANCE
==================================================

Production flow:

Student Card QR
↓
Scanner
↓
Validate QR
↓
Student
↓
Actor
↓
Unit
↓
Schedule
↓
Duplicate Check
↓
Attendance
↓
Audit.

Test:

valid QR
invalid QR
expired/revoked QR
duplicate scan
wrong unit
unauthorized actor.

==================================================
15. SECURITY GATE
==================================================

Test:

Security login
↓
Attendance screen
↓
Scan student card
↓
Student validation
↓
Attendance success.

Security tidak boleh
mengakses finance/payroll.

==================================================
16. TEACHER ATTENDANCE
==================================================

Test:

Teacher login
↓
Assigned student/group
↓
Scan QR
atau
Manual attendance
↓
Save
↓
Audit.

Guru hanya dapat
mengakses scope yang
diizinkan.

==================================================
17. EMPLOYEE GPS
==================================================

Test:

Employee login
↓
GPS permission
↓
Location acquisition
↓
Geofence validation
↓
Schedule
↓
Check-in
↓
Database
↓
Audit.

Test:

inside geofence
outside geofence
GPS unavailable
permission denied
duplicate check-in.

==================================================
18. EMPLOYEE QR
==================================================

Test:

Employee
↓
Scan school QR
↓
Validate location/method
↓
Attendance.

Test:

valid
invalid
wrong unit
duplicate.

==================================================
19. MANUAL ATTENDANCE
==================================================

Manual correction:

permission
↓
reason
↓
change
↓
audit.

Tidak boleh silent edit.

==================================================
20. ATTENDANCE IMMUTABILITY
==================================================

Final attendance tidak
boleh dihapus secara
bebas.

Test:

delete attempt
→ DENY.

Correction:

authorized workflow
→ PASS.

==================================================
21. SCHEDULE
==================================================

Test:

create schedule
update schedule
activate schedule
attendance relation.

Pastikan attendance
tidak menggunakan
schedule yang salah.

==================================================
22. DOCUMENT E2E
==================================================

Test:

Create Letter
↓
Preview
↓
Approve
↓
Publish
↓
PDF
↓
Word
↓
Print
↓
Archive.

==================================================
23. KOP SURAT
==================================================

Test Unit A.

Expected:

Kop Unit A.

Test Unit B.

Expected:

Kop Unit B.

Tidak boleh tertukar.

==================================================
24. TEMPLATE
==================================================

Test:

create
edit
preview
activate
archive.

Pastikan template
version tercatat.

==================================================
25. PDF
==================================================

Test:

A4
A5
F4/Folio
Portrait
Landscape
font
margin
header
footer
page number
table
signature.

==================================================
26. WORD
==================================================

Pastikan DOCX:

valid
editable
font correct
margin correct
table correct
header/footer correct.

==================================================
27. PRINT
==================================================

Bandingkan:

Preview
PDF
Print.

Tidak boleh terjadi
perbedaan layout kritis.

==================================================
28. DOCUMENT SECURITY
==================================================

User unauthorized
mencoba download:

DENY.

Authorized:

PASS.

==================================================
29. PAYMENT E2E
==================================================

Flow:

Student
↓
Invoice
↓
Payment
↓
Receipt
↓
Finance.

Test duplicate payment.

==================================================
30. SPP
==================================================

Test:

billing
payment
status
receipt
history
report.

Pastikan payment
masuk ke student yang
benar.

==================================================
31. FINANCE
==================================================

Test:

transaction
journal
ledger
report.

Pastikan:

DEBIT = CREDIT

untuk transaction
yang balanced.

==================================================
32. PAYROLL
==================================================

Flow:

Employee
↓
Attendance
↓
Payroll
↓
Payroll Run
↓
Result.

Test:

salary
deduction
attendance component
approval
report.

==================================================
33. INVENTORY
==================================================

Test:

item
stock in
stock out
adjustment
asset.

Pastikan stock tidak
menjadi negatif tanpa
business rule.

==================================================
34. NOTIFICATION
==================================================

Test:

notification creation
delivery
read
unread
mark read.

Pastikan notification
tidak membuat business
transaction kedua.

==================================================
35. REPORT
==================================================

Test report:

student
employee
attendance
payment
finance
payroll
inventory
documents.

Data report harus sama
dengan source database.

==================================================
36. EXPORT
==================================================

Test:

PDF
Excel
CSV
Word

jika tersedia.

Filter:

Unit
Date
Status.

Export harus mengikuti
filter aktif.

==================================================
37. SEARCH
==================================================

Test:

exact search
partial search
case variation
empty search
special character.

==================================================
38. FILTER
==================================================

Test kombinasi:

unit
status
date
role
category.

Pastikan query benar.

==================================================
39. PAGINATION
==================================================

Test:

first page
middle page
last page
empty page
large dataset.

Pastikan:

total
page
limit
totalPages

benar.

==================================================
40. CRUD REGRESSION
==================================================

Setiap module:

CREATE
READ
DETAIL
UPDATE
DELETE/ARCHIVE

harus PASS.

==================================================
41. MODAL
==================================================

Test:

create modal
edit modal
detail modal
delete modal
preview modal.

Tidak boleh:

stuck
blank
wrong record
fake success.

==================================================
42. FRONTEND STATE
==================================================

Test:

loading
success
error
empty
refresh
mutation
cache invalidation.

==================================================
43. API REGRESSION
==================================================

Test setiap endpoint:

200
201
400
401
403
404
409
422
429
500.

Pastikan response
sesuai contract.

==================================================
44. API AUTHORIZATION
==================================================

Setiap endpoint sensitive
harus dites:

authenticated
unauthenticated
authorized
unauthorized
wrong scope.

==================================================
45. CONCURRENCY
==================================================

Test concurrent:

attendance
payment
document number
stock movement
payroll.

Tidak boleh terjadi
duplicate/corruption.

==================================================
46. IDEMPOTENCY
==================================================

Kirim request sama
dua kali.

Pastikan operation
yang seharusnya idempotent
tidak membuat duplicate.

==================================================
47. DATABASE ROLLBACK
==================================================

Simulasikan failure
di tengah transaction.

Expected:

ROLLBACK.

Tidak boleh ada
partial data.

==================================================
48. FILE STORAGE
==================================================

Test:

upload
download
preview
delete/archive
permission.

==================================================
49. ORPHAN DATA
==================================================

Cari:

record tanpa parent
file tanpa document
document tanpa file
user tanpa role
student tanpa unit.

Jangan langsung
menghapus.

Laporkan.

==================================================
50. DUPLICATE DATA
==================================================

Cari:

duplicate student
duplicate employee
duplicate QR
duplicate invoice
duplicate document number
duplicate payment.

==================================================
51. HARDCODE
==================================================

Scan:

school name
address
logo
API URL
role
permission
unit
status
ID.

==================================================
52. DUMMY
==================================================

Scan:

mock
demo
sample
fixture
fake
dummy.

Pastikan tidak aktif
di production.

==================================================
53. SIMULATION
==================================================

Cari:

simulation
simulasi
fake attendance
test attendance
demo mode.

Pastikan production
tidak menggunakannya.

==================================================
54. CONSOLE / LOG
==================================================

Production build tidak
boleh menghasilkan:

secret
password
token
stack trace
sensitive payload.

==================================================
55. PERFORMANCE
==================================================

Test:

slow API
N+1
large table
large report
large PDF
large export.

==================================================
56. MEMORY
==================================================

Audit:

large export
bulk PDF
large upload
large query.

Pastikan tidak terjadi
memory exhaustion.

==================================================
57. MOBILE / PWA
==================================================

Test:

install
launch
login
logout
navigation
API
QR
GPS
notification
document download.

==================================================
58. RESPONSIVE
==================================================

Test:

desktop
tablet
mobile.

Tidak boleh ada
critical UI overflow.

==================================================
59. BROWSER
==================================================

Test browser yang
memang ditargetkan
oleh project.

==================================================
60. OFFLINE
==================================================

Jika PWA memiliki
offline support:

pastikan offline
tidak membuat
false success.

Mutation harus
memiliki backend
confirmation.

==================================================
61. ACCESSIBILITY
==================================================

Audit:

keyboard
focus
labels
contrast
form error
button state.

==================================================
62. SECURITY REGRESSION
==================================================

Test:

IDOR
RBAC bypass
cross-unit
mass assignment
file access
QR replay
GPS spoofing assumptions
duplicate request.

==================================================
63. AUDIT REGRESSION
==================================================

Pastikan action penting
membuat audit log.

==================================================
64. DATA CONSISTENCY
==================================================

Check:

Student count
Employee count
Attendance count
Payment total
Finance total
Payroll total
Inventory total.

Bandingkan:

Dashboard
Report
Database.

==================================================
65. DASHBOARD
==================================================

Dashboard tidak boleh
menampilkan data dummy.

Jika database kosong:

0
atau
empty state.

==================================================
66. NOTIFICATION
==================================================

Pastikan notification
tidak menampilkan
dummy messages.

==================================================
67. FINAL BUILD
==================================================

WAJIB:

typecheck
lint
unit test
integration test
E2E test
frontend build
backend build
mobile build
PWA build

sesuai project.

==================================================
68. ZERO CRITICAL
==================================================

Production release
TIDAK BOLEH memiliki:

Critical bug
Critical security issue
Data corruption
Broken authentication
Broken authorization
Broken database relation.

==================================================
69. HIGH BUG POLICY
==================================================

High severity issue
yang mempengaruhi
data/security/core
workflow harus diperbaiki
sebelum production.

==================================================
70. MEDIUM / LOW
==================================================

Catat dan klasifikasikan.

Jangan menyembunyikan
bug hanya agar status
PASS.

==================================================
71. BUG REPORT
==================================================

Format:

ID
Severity
Module
Steps
Expected
Actual
Root Cause
Fix
Regression Test
Status.

==================================================
72. FINAL TEST MATRIX
==================================================

| Module | UI | API | DB | RBAC | E2E | Status |
|---|---|---|---|---|---|---|

Semua critical module
harus PASS.

==================================================
73. PRODUCTION DATA SAFETY
==================================================

JANGAN:

DROP
TRUNCATE
RESET
DELETE MASSAL
SEED DUMMY.

==================================================
74. FINAL ACCEPTANCE
==================================================

PASS jika:

[ ] Application boots
[ ] Login PASS
[ ] Logout PASS
[ ] RBAC PASS
[ ] Scope PASS
[ ] Student PASS
[ ] Employee PASS
[ ] Attendance PASS
[ ] QR PASS
[ ] GPS PASS
[ ] Document PASS
[ ] PDF PASS
[ ] Word PASS
[ ] Print PASS
[ ] Payment PASS
[ ] Finance PASS
[ ] Payroll PASS
[ ] Inventory PASS
[ ] Notification PASS
[ ] Report PASS
[ ] Export PASS
[ ] Mobile PASS
[ ] PWA PASS
[ ] Security PASS
[ ] Database integrity PASS
[ ] Build PASS
[ ] E2E PASS
[ ] Zero critical bug.

==================================================
75. FINAL RELEASE DECISION
==================================================

Gunakan hanya:

READY
atau
NOT READY.

Jika NOT READY:

tampilkan blocker.

Jangan menyebut
"production ready"
jika masih ada
critical blocker.

==================================================
76. FINAL REPORT
==================================================

WAJIB LAPORKAN:

1. Total test
2. Passed
3. Failed
4. Blocked
5. Critical bugs
6. High bugs
7. Medium bugs
8. Low bugs
9. Security issues
10. Data integrity issues
11. API issues
12. UI issues
13. Mobile issues
14. Document issues
15. Performance issues
16. Fixed issues
17. Remaining blockers
18. Final release status.

==================================================
FINAL COMMAND
==================================================

JALANKAN FULL REGRESSION
TERHADAP APLIKASI EXISTING.

JANGAN MEMBUAT FITUR BARU.

JANGAN MEMBUAT DUMMY.

JANGAN MENUTUP ERROR DENGAN
FAKE SUCCESS.

JANGAN MENGUBAH DATA PRODUKSI.

TEMUKAN ROOT CAUSE.

PERBAIKI ERROR YANG AMAN
UNTUK DIPERBAIKI.

TEST ULANG.

PASTIKAN PERUBAHAN TIDAK
MERUSAK MODUL LAIN.

HANYA NYATAKAN READY
JIKA SELURUH BLOCKER KRITIS
SUDAH SELESAI.

# END OF 158