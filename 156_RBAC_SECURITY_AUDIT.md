# 156_RBAC_SECURITY_AUDIT.md

MODE: RBAC + SECURITY AUDIT
PRIORITY: CRITICAL

==================================================
OBJECTIVE
==================================================

Audit seluruh:

- Authentication
- Authorization
- RBAC
- Permission
- Role
- Middleware
- API Security
- Frontend Guard
- File Access
- Audit Log

JANGAN membuat sistem RBAC kedua.

Gunakan architecture existing.

==================================================
1. SCAN EXISTING
==================================================

Cari:

roles
permissions
middleware
guards
policies
auth service
API middleware
route protection
frontend permission hooks
navigation permission.

Petakan:

ROLE
→ PERMISSION
→ ROUTE
→ API
→ MODULE.

==================================================
2. ROLE AUDIT
==================================================

Audit role existing.

Role utama yang digunakan
jika memang sudah tersedia:

ADMIN
TU
BENDAHARA
GURU
SECURITY
MANAGEMENT
YAYASAN

Jangan membuat role baru
jika role existing masih
dapat digunakan.

==================================================
3. LEAST PRIVILEGE
==================================================

Setiap role hanya mendapat
akses yang diperlukan.

Contoh:

SECURITY:
- attendance siswa
- scan QR
- melihat hasil scan
- fungsi yang memang
  diberikan administrator

SECURITY TIDAK BOLEH:
- keuangan
- payroll
- konfigurasi sistem
- data sensitif siswa
- user management

kecuali explicitly
diberikan permission.

==================================================
4. ADMIN
==================================================

Admin dapat mengelola
system sesuai permission
existing.

Tetap gunakan audit log
untuk critical action.

==================================================
5. TU
==================================================

Audit akses:

student
employee
document
letter
archive
administration.

Jangan otomatis memberikan
akses finance jika tidak
diperlukan.

==================================================
6. BENDAHARA
==================================================

Audit:

finance
transaction
budget
payment
financial report.

Jangan otomatis memberikan
system administration.

==================================================
7. GURU
==================================================

Audit akses:

attendance siswa
sesuai scope.

Guru tidak boleh otomatis
mengakses:

finance
system configuration
user administration.

==================================================
8. SECURITY
==================================================

Audit khusus:

QR scan siswa
attendance gate
manual attendance jika
memang diberikan.

Security tidak boleh
mengubah data master
siswa secara bebas.

==================================================
9. MANAGEMENT / YAYASAN
==================================================

Audit:

dashboard
report
monitoring
approval
data sesuai scope.

Jangan memberikan
permission teknis
tanpa kebutuhan.

==================================================
10. FRONTEND GUARD
==================================================

Pastikan menu/page
disembunyikan berdasarkan
permission.

Tetapi:

FRONTEND GUARD
BUKAN SECURITY UTAMA.

==================================================
11. BACKEND AUTHORIZATION
==================================================

Setiap endpoint sensitif
WAJIB memiliki authorization.

Test langsung API.

Jika user mencoba
mengakses endpoint
tanpa permission:

403.

==================================================
12. IDOR
==================================================

Test:

User A
→ data User B.

Contoh:

/students/{id}
/employees/{id}
/documents/{id}
/transactions/{id}

User tidak boleh
mengakses data di luar
scope.

==================================================
13. RESOURCE OWNERSHIP
==================================================

Periksa:

user
→ unit
→ resource.

Pastikan authorization
mengikuti ownership/scope
existing.

==================================================
14. ROUTE PROTECTION
==================================================

Audit:

public
authenticated
role protected
permission protected.

Tidak boleh ada route
sensitif yang public.

==================================================
15. API PROTECTION
==================================================

Audit:

GET
POST
PUT
PATCH
DELETE

untuk setiap endpoint
sensitif.

==================================================
16. AUTHENTICATION
==================================================

Test:

valid login
invalid login
expired session
expired token
logout
password reset.

==================================================
17. PASSWORD
==================================================

Pastikan:

hashed
tidak plaintext
tidak muncul pada log
tidak dikirim kembali
dalam response.

==================================================
18. TOKEN
==================================================

Pastikan token:

tidak hardcoded
tidak masuk database
secara plaintext jika
architecture tidak
memerlukannya.

Jangan log token.

==================================================
19. SESSION
==================================================

Audit:

expiration
logout
revocation
refresh

sesuai authentication
architecture existing.

==================================================
20. BRUTE FORCE
==================================================

Protect:

login
password reset
OTP jika ada.

Gunakan rate limit
existing.

==================================================
21. API RATE LIMIT
==================================================

Protect endpoint
sensitif:

authentication
attendance
financial operation
bulk operation.

==================================================
22. CORS
==================================================

Pastikan CORS hanya
mengizinkan origin
yang diperlukan.

==================================================
23. CSRF
==================================================

Gunakan protection
sesuai architecture
authentication.

==================================================
24. XSS
==================================================

Audit:

input
output
HTML rendering
rich text.

Sanitize untrusted
content.

==================================================
25. SQL INJECTION
==================================================

Gunakan:

ORM
parameter binding.

Jangan concatenate
user input ke SQL.

==================================================
26. FILE SECURITY
==================================================

Audit:

upload
download
preview
delete.

Validasi:

MIME
extension
size.

==================================================
27. PRIVATE FILE
==================================================

Dokumen private
tidak boleh dapat
diakses langsung
tanpa authorization.

==================================================
28. MASS ASSIGNMENT
==================================================

Audit backend:

request → model.

Jangan menerima field
sensitif secara bebas.

Contoh:

role
permission
approved
balance
user_id.

==================================================
29. PRIVILEGE ESCALATION
==================================================

User biasa tidak boleh
mengubah:

role
permission
unit
ownership
approval status

melalui manipulasi request.

==================================================
30. APPROVAL SECURITY
==================================================

User tidak boleh
menyetujui request
sendiri jika business
rule melarang.

Request
≠
Approve

jika separation of duties
diterapkan.

==================================================
31. AUDIT LOG
==================================================

Critical action harus
dapat dilacak:

login
logout
create
update
delete
approve
reject
permission change
role change.

==================================================
32. AUDIT LOG SECURITY
==================================================

Audit log:

tidak boleh diedit
user biasa.

Jangan menyimpan:

password
token
secret.

==================================================
33. ATTENDANCE SECURITY
==================================================

Pastikan:

Security hanya
attendance scope.

Guru hanya dapat
attendance siswa
sesuai scope.

Employee attendance
tidak dapat dimanipulasi
oleh role yang tidak
memiliki permission.

==================================================
34. QR SECURITY
==================================================

QR identifier:

unique
stable
tidak menggunakan
password/secret.

Scan harus divalidasi
ke backend.

Jangan percaya data
yang dikirim dari QR
secara langsung.

==================================================
35. GPS SECURITY
==================================================

GPS attendance:

server melakukan
validation.

Jangan hanya percaya:

latitude
longitude

dari client.

Validasi:

user
timestamp
location
accuracy
attendance rule.

==================================================
36. FINANCE SECURITY
==================================================

Pastikan hanya role
berwenang dapat:

create transaction
edit transaction
approve
delete/cancel
view sensitive report.

==================================================
37. DATA EXPORT SECURITY
==================================================

Export mengikuti
permission yang sama
dengan data source.

Jangan sampai user
tidak boleh melihat data
tetapi dapat export
seluruh data.

==================================================
38. REPORT SECURITY
==================================================

Report harus mengikuti:

role
permission
unit/scope.

==================================================
39. API ERROR SECURITY
==================================================

Production tidak boleh
menampilkan:

stack trace
SQL
filesystem path
secret
internal configuration.

==================================================
40. SECURITY HEADERS
==================================================

Audit security headers
sesuai deployment.

==================================================
41. SECRET MANAGEMENT
==================================================

Cari hardcoded:

JWT_SECRET
API_KEY
PASSWORD
TOKEN
PRIVATE_KEY.

Semua harus berasal
dari environment/secret
management existing.

==================================================
42. ENVIRONMENT
==================================================

Pastikan:

development
staging
production

tidak mencampur
credential.

==================================================
43. DATABASE ACCESS
==================================================

Frontend/mobile:

TIDAK BOLEH
akses database langsung.

Gunakan API.

==================================================
44. API VERSION
==================================================

Gunakan API version
existing.

Jangan membuat
version baru tanpa
kebutuhan.

==================================================
45. SECURITY TEST MATRIX
==================================================

Test setiap role:

LOGIN
MENU
PAGE
API
CREATE
READ
UPDATE
DELETE
EXPORT
APPROVE.

==================================================
46. NEGATIVE TEST
==================================================

Jangan hanya test
akses yang benar.

Test juga:

role salah
permission salah
ID salah
unit salah
token salah
expired token.

==================================================
47. DUPLICATE SECURITY
==================================================

Jangan membuat:

AuthEngine kedua
RBACEngine kedua
PermissionEngine kedua
Middleware duplicate.

Gunakan existing.

==================================================
48. FIX RULE
==================================================

SEARCH EXISTING FIRST.

Jika benar:

REUSE.

Jika bug:

FIX.

Jika duplicate:

CONSOLIDATE.

Jika insecure:

HARDEN.

Jangan rewrite
authentication system
yang sudah berfungsi
tanpa alasan kuat.

==================================================
49. OUTPUT
==================================================

Tampilkan:

ROLE
PERMISSION
RESOURCE
ISSUE
RISK
ROOT CAUSE
FIX
TEST
STATUS

Format:

[P1]
SECURITY
Role: Security
Resource: Finance
Issue: endpoint dapat diakses
Root Cause: missing permission middleware
Fix: gunakan middleware existing
Test: 403
Status: VERIFIED

==================================================
50. PRIORITY
==================================================

P0:
authentication bypass
data leak
privilege escalation
critical vulnerability.

P1:
broken authorization
IDOR
private file exposure.

P2:
configuration/security
weakness.

P3:
minor hardening.

==================================================
FINAL COMMAND
==================================================

SCAN AUTH.

SCAN RBAC.

SCAN PERMISSIONS.

SCAN ROUTES.

SCAN API.

SCAN FILE ACCESS.

SCAN ATTENDANCE SECURITY.

SCAN FINANCE SECURITY.

SCAN EXPORT SECURITY.

SCAN AUDIT LOG.

DETECT PRIVILEGE ESCALATION.

DETECT IDOR.

DETECT DUPLICATE RBAC.

FIX EXISTING SYSTEM.

RUN NEGATIVE TEST.

RUN REGRESSION.

DO NOT CREATE SECOND AUTH/RBAC ENGINE.

DO NOT ADD NEW FEATURE.

# END 156_RBAC_SECURITY_AUDIT