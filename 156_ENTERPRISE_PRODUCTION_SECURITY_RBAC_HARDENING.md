# 156 — ENTERPRISE PRODUCTION SECURITY & RBAC HARDENING

## MASTER PRODUCTION PROMPT

TUGAS INI ADALAH HARDENING SECURITY
UNTUK APLIKASI MANAGEMENT SEKOLAH
DAN PONDOK PESANTREN.

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT ROLE BARU TANPA KEBUTUHAN.

JANGAN MEMBUAT PERMISSION DUPLICATE.

JANGAN MEMBUAT AUTHENTICATION ENGINE KEDUA.

JANGAN MEMBUAT DATABASE USER KEDUA.

JANGAN MEMBUAT DUMMY DATA.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

==================================================
1. TUJUAN
==================================================

Pastikan:

AUTHENTICATION
AUTHORIZATION
RBAC
PERMISSION
UNIT SCOPE
DATA SCOPE
API SECURITY
FILE SECURITY
AUDIT
SESSION
TOKEN

aman untuk production.

==================================================
2. SOURCE OF TRUTH
==================================================

Gunakan existing:

AuthService
RbacService
PermissionService
AuditService

sebagai primary architecture.

JANGAN membuat:

AuthService2
RbacService2
PermissionEngine2.

==================================================
3. AUTHENTICATION FLOW
==================================================

Flow wajib:

Login
↓
Credential Validation
↓
User Lookup
↓
Password Verification
↓
Account Status
↓
Role
↓
Permission
↓
Organization/Unit Scope
↓
Token/Session
↓
Audit Login
↓
Application.

==================================================
4. LOGIN
==================================================

Audit:

email/username
password
account status
failed attempts
session
token
logout.

Jangan menyimpan password
plaintext.

==================================================
5. PASSWORD
==================================================

Pastikan password:

hashed
salted
never logged
never returned API.

Jangan pernah:

console.log(password)
return password
store plaintext.

==================================================
6. TOKEN
==================================================

Audit JWT/session:

expiry
issuer
audience
signature
secret management.

Secret harus berasal
dari environment.

Jangan hardcode:

JWT_SECRET
API_KEY
PASSWORD
DATABASE_PASSWORD.

==================================================
7. REFRESH TOKEN
==================================================

Jika existing menggunakan
refresh token:

audit:

rotation
expiry
revocation
storage
reuse detection.

Jangan membuat
refresh architecture
kedua.

==================================================
8. LOGOUT
==================================================

Logout harus:

invalidate/revoke session
sesuai architecture existing.

Tidak cukup hanya:

hapus token dari UI.

==================================================
9. ACCOUNT STATUS
==================================================

User yang:

inactive
suspended
deleted
blocked

tidak boleh login.

==================================================
10. RBAC
==================================================

Gunakan:

Role
↓
Permission
↓
Scope.

Jangan hanya:

role === "admin".

==================================================
11. ROLE
==================================================

Audit role existing:

SUPER_ADMIN
YAYASAN
KEPALA_SEKOLAH
TU
BENDAHARA
GURU
SECURITY
KARYAWAN.

Gunakan role existing
jika memang sudah tersedia.

Jangan membuat:

Admin2
Guru2
Security2.

==================================================
12. SUPER ADMIN
==================================================

Super Admin dapat
mengakses system-level
management sesuai
architecture.

Namun tetap gunakan
authorization middleware.

Jangan bypass security
hanya karena role.

==================================================
13. TU
==================================================

TU hanya dapat:

administration
student management
employee administration
documents
archive
reports

sesuai permission.

Tidak boleh otomatis
mendapat:

system settings
role management
permission management
security configuration

kecuali diberi explicit
permission.

==================================================
14. BENDAHARA
==================================================

Bendahara:

finance
payment
SPP
report

sesuai permission.

Tidak otomatis dapat:

role management
system configuration
user security.

==================================================
15. GURU
==================================================

Guru hanya mendapat
fitur yang memang
dibutuhkan:

student access
attendance
sesuai assignment
notification
profile.

KBM/Leger/Rapor
TIDAK dikembangkan
sebagai core module
aplikasi ini.

==================================================
16. SECURITY
==================================================

Security dapat:

student QR attendance
gate attendance
attendance verification

sesuai scope.

Tidak dapat:

finance
payroll
role management
system settings

kecuali permission
eksplisit diberikan.

==================================================
17. KARYAWAN
==================================================

Karyawan dapat:

profile
attendance
notification
fitur yang diberikan
role/permission.

Tidak boleh mengakses
data karyawan lain
tanpa permission.

==================================================
18. UNIT SCOPE
==================================================

Data harus mengikuti:

Organization
↓
Unit
↓
User Scope
↓
Record.

Contoh:

User Unit A
tidak dapat membaca
Student Unit B

tanpa explicit
cross-unit permission.

==================================================
19. CROSS UNIT
==================================================

Test:

GET Unit B
POST Unit B
PUT Unit B
DELETE Unit B.

Expected:

403/404 sesuai
security policy.

==================================================
20. IDOR PROTECTION
==================================================

Test:

/students/{id}
/employees/{id}
/attendance/{id}
/payments/{id}
/documents/{id}
/payroll/{id}.

Pastikan ID saja
tidak cukup untuk
mengakses record.

Server harus memeriksa:

identity
permission
scope
ownership.

==================================================
21. MASS ASSIGNMENT
==================================================

Backend harus
whitelist field.

Jangan menerima:

role
permission
organization_id
unit_id

dari request biasa
tanpa authorization
khusus.

==================================================
22. USER PRIVILEGE ESCALATION
==================================================

User biasa tidak boleh
mengubah:

role
permission
scope
organization
unit
account status.

==================================================
23. API SECURITY
==================================================

Semua protected endpoint:

Authentication
+
Authorization
+
Validation
+
Scope.

Jangan ada endpoint
sensitive yang hanya
mengandalkan frontend.

==================================================
24. PUBLIC ENDPOINT
==================================================

Audit seluruh:

/login
/public/*
/health
/password-reset
/file-download

Pastikan hanya endpoint
yang benar-benar public
yang tanpa authentication.

==================================================
25. HEALTH ENDPOINT
==================================================

Health check tidak boleh
membocorkan:

database credential
JWT secret
environment variables
internal stack trace.

==================================================
26. RATE LIMIT
==================================================

Gunakan rate limiting
untuk:

login
password reset
QR scan
attendance
public endpoints.

Jangan membuat rate-limit
engine kedua.

==================================================
27. BRUTE FORCE
==================================================

Login harus memiliki
perlindungan terhadap
brute force.

Audit:

attempt
cooldown
rate limit
account protection.

==================================================
28. QR SECURITY
==================================================

QR attendance tidak boleh
hanya bergantung pada
ID siswa mentah.

Gunakan token/identifier
yang memang telah
ditetapkan architecture.

Validasi:

token
status
student
unit
actor
time
schedule
duplicate.

==================================================
29. QR REPLAY
==================================================

Cegah:

replay
duplicate scan
stale token

sesuai business rule
existing.

==================================================
30. GPS SECURITY
==================================================

GPS attendance:

server menerima
location data.

Server melakukan:

permission
employee validation
unit scope
schedule
geofence
timestamp
duplicate detection.

Jangan percaya
frontend saja.

==================================================
31. LOCATION DATA
==================================================

Location hanya dapat
diakses oleh role
yang memiliki permission.

Jangan menampilkan
GPS history karyawan
kepada user yang
tidak berhak.

==================================================
32. ATTENDANCE CORRECTION
==================================================

Correction harus:

permission
reason
actor
timestamp
before
after
audit.

Jangan mengubah
record attendance
secara silent.

==================================================
33. FINANCE SECURITY
==================================================

Payment
Finance
Payroll

harus mempunyai
permission terpisah.

Jangan memberikan
akses finance hanya
karena user adalah
admin aplikasi.

==================================================
34. FINANCIAL IMMUTABILITY
==================================================

Transaction final
tidak boleh:

hard delete
silent update.

Gunakan:

reversal
adjustment
correction

sesuai architecture.

==================================================
35. AUDIT LOG
==================================================

Catat:

LOGIN
LOGOUT
CREATE
UPDATE
DELETE
APPROVE
REJECT
EXPORT
DOWNLOAD
ATTENDANCE CORRECTION
PAYMENT
PAYROLL.

==================================================
36. AUDIT LOG SECURITY
==================================================

Audit log:

immutable
append-only
restricted access.

Jangan izinkan user biasa
mengubah audit.

==================================================
37. SENSITIVE DATA
==================================================

Jangan log:

password
JWT
secret
API key
credential
full payment credential
sensitive location
sensitive personal data
yang tidak diperlukan.

==================================================
38. FILE UPLOAD
==================================================

Validasi:

extension
MIME
size
filename
authorization.

Jangan percaya
Content-Type client
secara buta.

==================================================
39. FILE DOWNLOAD
==================================================

Download harus:

authenticate
authorize
scope check.

Jangan:

/uploads/private/file.pdf

langsung public.

==================================================
40. PATH TRAVERSAL
==================================================

Tolak:

../
absolute path
unsafe filename
unexpected storage path.

==================================================
41. DOCUMENT SECURITY
==================================================

Dokumen:

surat
ijazah jika ada
student document
employee document
financial document

harus mengikuti
permission.

==================================================
42. CORS
==================================================

Production CORS:

allowlist.

Jangan:

Access-Control-Allow-Origin: *

untuk protected
application jika tidak
diperlukan.

==================================================
43. CSRF
==================================================

Jika authentication
menggunakan cookie:

aktifkan CSRF protection
sesuai architecture.

Jika bearer token:

audit token handling
dan XSS protection.

==================================================
44. XSS
==================================================

Audit:

HTML rendering
rich text
document content
notification
announcement.

Sanitize untrusted
HTML.

==================================================
45. SQL INJECTION
==================================================

Gunakan ORM parameterized
queries.

Jangan concatenation
raw SQL dari input user.

==================================================
46. INPUT VALIDATION
==================================================

Semua API input:

validate
sanitize
normalize
authorize.

Gunakan schema validation
existing.

==================================================
47. ENUM VALIDATION
==================================================

Status/role/method
harus berasal dari
allowed enum.

Jangan menerima
arbitrary string.

==================================================
48. ERROR RESPONSE
==================================================

Production tidak boleh
mengembalikan:

stack trace
SQL query
filesystem path
secret
environment.

==================================================
49. SECURITY HEADERS
==================================================

Audit:

Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Frame protection
Strict-Transport-Security
jika deployment HTTPS.

Gunakan configuration
sesuai environment.

==================================================
50. HTTPS
==================================================

Production:

HTTPS wajib.

Jangan mengirim
credential melalui
HTTP production.

==================================================
51. COOKIE
==================================================

Jika cookie digunakan:

Secure
HttpOnly
SameSite

sesuai architecture.

==================================================
52. SESSION
==================================================

Audit:

session expiration
concurrent sessions
logout
revocation.

==================================================
53. MOBILE SECURITY
==================================================

Flutter/PWA:

Jangan hardcode:

API secret
JWT secret
database credential.

Client hanya menyimpan
credential/token yang
memang diperlukan.

==================================================
54. WEB SECURITY
==================================================

React:

jangan menyimpan
sensitive secret di
frontend bundle.

Environment frontend
bukan tempat menyimpan
server secrets.

==================================================
55. PWA
==================================================

Service worker
tidak boleh cache:

password
private API response
financial sensitive data
private documents

secara sembarangan.

==================================================
56. RBAC UI
==================================================

Frontend boleh
menyembunyikan menu.

TETAPI:

backend tetap wajib
menolak unauthorized
request.

==================================================
57. PERMISSION MATRIX
==================================================

Buat:

| Role | Module | View | Create | Update | Delete | Approve | Export |
|---|---|---|---|---|---|---|---|

Cari:

permission tanpa route
route tanpa permission
menu tanpa permission
permission duplicate.

==================================================
58. ROUTE GUARD
==================================================

Audit semua route.

Setiap protected route
harus memiliki:

auth middleware
+
permission/policy
+
scope.

==================================================
59. SERVICE AUTHORIZATION
==================================================

Authorization jangan
hanya di controller.

Untuk sensitive operation:

service/business layer
harus memastikan
authorization invariant
tidak dapat dilewati.

==================================================
60. TRANSACTION SECURITY
==================================================

Untuk operasi sensitif:

permission
↓
validation
↓
transaction
↓
audit.

==================================================
61. RACE CONDITION
==================================================

Test:

dua payment
dua attendance
dua update
dua approval.

Pastikan tidak terjadi
double processing.

==================================================
62. DUPLICATE SUBMISSION
==================================================

Button submit harus
mencegah double click.

Backend tetap harus
memiliki protection.

Frontend protection
bukan satu-satunya
security layer.

==================================================
63. PRODUCTION ENVIRONMENT
==================================================

Pastikan:

NODE_ENV=production

dan tidak mengaktifkan:

debug mode
mock
demo
simulation
seed production.

==================================================
64. SECRETS
==================================================

Audit:

.env
.env.example
CI/CD secrets
hosting variables.

Jangan commit:

.env
private key
JWT secret
database password.

==================================================
65. DEPENDENCY SECURITY
==================================================

Audit dependency:

npm
Flutter/Dart
Laravel/Node dependencies
sesuai stack existing.

Cari:

known vulnerabilities
deprecated package
unused security package.

Jangan upgrade major
secara sembarangan.

==================================================
66. SECURITY REGRESSION
==================================================

Test:

Unauthorized
Forbidden
IDOR
Cross-unit
Privilege escalation
Mass assignment
File access
QR replay
Duplicate attendance
Financial mutation.

==================================================
67. PRODUCTION TEST
==================================================

WAJIB:

Login
Logout
RBAC
Permission
Unit scope
Student
Employee
Attendance
Document
Payment
Finance
Payroll
File
Notification.

==================================================
68. SECURITY ACCEPTANCE
==================================================

PASS jika:

[ ] Password aman
[ ] Token aman
[ ] Secrets tidak hardcoded
[ ] RBAC enforced backend
[ ] Unit scope enforced
[ ] IDOR blocked
[ ] Privilege escalation blocked
[ ] Mass assignment blocked
[ ] File access protected
[ ] QR replay protected
[ ] GPS validated server-side
[ ] Financial records protected
[ ] Audit immutable
[ ] Rate limit active
[ ] Production errors sanitized
[ ] CORS secured
[ ] HTTPS enforced
[ ] Mobile secrets safe
[ ] PWA cache safe.

==================================================
69. FINAL REPORT
==================================================

WAJIB LAPORKAN:

1. Critical vulnerabilities
2. High vulnerabilities
3. Medium vulnerabilities
4. Low vulnerabilities
5. RBAC problems
6. Permission problems
7. Scope problems
8. IDOR findings
9. Authentication findings
10. File security findings
11. API security findings
12. QR findings
13. GPS findings
14. Finance security findings
15. Audit findings
16. Secrets findings
17. Dependency findings
18. Fixed issues
19. Remaining blockers
20. Tests passed.

==================================================
70. FINAL RULE
==================================================

SECURITY HARUS ENFORCED
DI BACKEND.

FRONTEND HANYA
PRESENTATION LAYER.

ROLE BUKAN SATU-SATUNYA
AUTHORIZATION MECHANISM.

PERMISSION + SCOPE
HARUS DIPERIKSA.

DATABASE TETAP
SOURCE OF TRUTH.

JANGAN MEMBUAT
SECURITY ENGINE KEDUA.

JANGAN MEMBUAT
RBAC ENGINE KEDUA.

JANGAN MEMBUAT
AUTH ENGINE KEDUA.

JANGAN MEMBUAT DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MERUSAK DATA.

STOP JIKA MENEMUKAN
CRITICAL SECURITY ISSUE
YANG MEMBUTUHKAN KEPUTUSAN
ARSITEKTUR.

# END OF 156