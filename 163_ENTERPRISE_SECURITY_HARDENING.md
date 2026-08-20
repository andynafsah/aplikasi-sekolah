# 163 — ENTERPRISE SECURITY HARDENING

## MASTER PRODUCTION SECURITY HARDENING PROMPT

TUGAS INI KHUSUS UNTUK:

APPLICATION SECURITY
API SECURITY
DATABASE SECURITY
AUTHENTICATION SECURITY
AUTHORIZATION SECURITY
RBAC SECURITY
SESSION SECURITY
QR SECURITY
GPS SECURITY
FILE SECURITY
DATA PROTECTION
AUDIT SECURITY
INFRASTRUCTURE SECURITY.

==================================================
1. ATURAN UTAMA
==================================================

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT MODUL BARU.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE.

JANGAN MENGUBAH BUSINESS LOGIC
TANPA ALASAN KEAMANAN YANG JELAS.

JANGAN MEMATIKAN SECURITY CHECK
HANYA AGAR ERROR HILANG.

PERBAIKI ROOT CAUSE.

==================================================
2. TUJUAN
==================================================

Pastikan:

USER
↓
AUTHENTICATION
↓
AUTHORIZATION
↓
RESOURCE ACCESS
↓
BUSINESS ACTION
↓
AUDIT

seluruhnya aman.

Tidak boleh ada user
mengakses resource yang
bukan haknya.

==================================================
3. SECURITY PRINCIPLE
==================================================

Gunakan:

LEAST PRIVILEGE
DEFENSE IN DEPTH
ZERO TRUST
SECURE BY DEFAULT
FAIL CLOSED
DATA MINIMIZATION
SEPARATION OF DUTIES.

==================================================
4. AUTHENTICATION
==================================================

Audit:

login
logout
password
password reset
session
token
refresh token
account status.

==================================================
5. PASSWORD
==================================================

Password harus:

hashed
salted
tidak reversible.

Jangan menyimpan:

plain text password.

==================================================
6. PASSWORD POLICY
==================================================

Gunakan policy yang
sesuai kebutuhan aplikasi.

Pertimbangkan:

minimum length
common password protection
rate limit.

Jangan membuat policy
yang menyebabkan user
kesulitan operasional
tanpa alasan.

==================================================
7. LOGIN RATE LIMIT
==================================================

Protect:

login
password reset
OTP jika digunakan.

Cegah:

brute force
credential stuffing.

==================================================
8. ACCOUNT LOCKOUT
==================================================

Jika menggunakan
lockout:

harus dapat dibuka
kembali secara aman.

Jangan membuat
permanent lockout
tanpa recovery mechanism.

==================================================
9. SESSION
==================================================

Audit:

session lifetime
idle timeout
logout invalidation.

==================================================
10. TOKEN
==================================================

Jika JWT digunakan:

audit:

expiration
signature
issuer
audience
algorithm
refresh mechanism.

Jangan menerima
token dengan algorithm
yang tidak diizinkan.

==================================================
11. TOKEN STORAGE
==================================================

Review storage
access token/refresh token.

Jangan menyimpan
credential sensitif
di tempat yang tidak aman.

==================================================
12. TOKEN REVOCATION
==================================================

Pastikan tersedia
mekanisme invalidation
jika architecture
membutuhkannya.

==================================================
13. AUTHORIZATION
==================================================

Authentication:

SIAPA USER?

Authorization:

APA YANG BOLEH DIA LAKUKAN?

Jangan mencampurkan
keduanya.

==================================================
14. RBAC
==================================================

Audit seluruh role:

SUPER ADMIN
ADMIN
KEPALA SEKOLAH
KEPALA UNIT
TU
BENDAHARA
GURU
WALI KELAS jika masih
dibutuhkan pada scope
management
SECURITY
KARYAWAN
USER LAIN.

Gunakan role existing.

JANGAN membuat role baru
jika role existing sudah
mencukupi.

==================================================
15. ROLE PERMISSION
==================================================

Setiap permission
harus memiliki:

resource
action
scope.

Contoh:

student.read
student.create
student.update
student.delete.

==================================================
16. UI SECURITY
==================================================

Jika user tidak memiliki
permission:

MENU TIDAK DITAMPILKAN.

Namun:

HIDING MENU BUKAN
SECURITY.

Backend tetap WAJIB
memvalidasi permission.

==================================================
17. BACKEND AUTHORIZATION
==================================================

Setiap endpoint protected
harus melakukan:

AUTHENTICATION
↓
AUTHORIZATION
↓
RESOURCE CHECK
↓
ACTION.

==================================================
18. IDOR PROTECTION
==================================================

Audit seluruh endpoint
yang menggunakan:

/students/{id}
/employees/{id}
/attendance/{id}
/documents/{id}
/payments/{id}

dan sejenisnya.

Pastikan user tidak dapat
mengganti ID lalu mengakses
resource milik unit lain.

==================================================
19. TENANT / ORGANIZATION
==================================================

Walaupun aplikasi
single tenant, tetap
pastikan scope organisasi
dan unit tidak dapat
ditembus.

Jika ada:

yayasan
lembaga
unit
sekolah
pondok

maka permission harus
mengikuti scope existing.

==================================================
20. UNIT ISOLATION
==================================================

Contoh:

USER UNIT A

tidak boleh otomatis
mengakses:

STUDENT UNIT B
EMPLOYEE UNIT B
ATTENDANCE UNIT B
DOCUMENT UNIT B

kecuali permission
memang mengizinkan.

==================================================
21. SUPER ADMIN
==================================================

Super Admin adalah
hak akses tertinggi.

Namun:

JANGAN menampilkan
pengaturan Super Admin
kepada user biasa.

JANGAN menganggap
frontend sebagai security.

==================================================
22. ADMIN PANEL
==================================================

Admin panel harus
mengikuti permission.

Menu:

user management
role
permission
system configuration
audit

hanya tampil jika
authorized.

==================================================
23. MASS ASSIGNMENT
==================================================

Jika terdapat fitur
assignment massal:

authorization harus
divalidasi sebelum
setiap operasi.

==================================================
24. API SECURITY
==================================================

Audit:

authentication
authorization
validation
rate limit
CORS
headers
error handling.

==================================================
25. INPUT VALIDATION
==================================================

Semua input user
harus divalidasi.

Termasuk:

form
query
path parameter
JSON
file
QR payload
GPS payload.

==================================================
26. SERVER-SIDE VALIDATION
==================================================

Jangan hanya
mengandalkan:

Flutter validation
React validation
HTML validation.

Backend harus
memvalidasi ulang.

==================================================
27. SQL INJECTION
==================================================

Gunakan:

ORM
parameterized query
prepared statement.

Jangan concatenate
raw user input ke SQL.

==================================================
28. MASS ASSIGNMENT
==================================================

Audit:

create
update
bulk update.

Jangan izinkan
field sensitif diubah
langsung oleh user.

==================================================
29. PRIVILEGED FIELDS
==================================================

Contoh field sensitif:

role
permission
status
unit_id
organization_id
approval_status
verified_at.

Tidak boleh dapat
diubah melalui input
biasa jika tidak
authorized.

==================================================
30. XSS
==================================================

Sanitize/escape
user-generated content.

Perhatikan:

nama
alamat
catatan
surat
deskripsi
HTML/template.

==================================================
31. CSRF
==================================================

Jika menggunakan
cookie/session-based
web authentication:

pastikan CSRF protection
aktif sesuai framework.

==================================================
32. CORS
==================================================

Production:

allow hanya origin
yang memang dibutuhkan.

Jangan menggunakan:

*

secara sembrono.

==================================================
33. SECURITY HEADERS
==================================================

Audit header seperti:

Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Frame protections
Strict-Transport-Security

sesuai stack dan
compatibility.

==================================================
34. HTTPS
==================================================

Semua authentication
dan sensitive operation
harus melalui HTTPS.

==================================================
35. HTTP REDIRECT
==================================================

Jika production:

HTTP
↓
HTTPS.

==================================================
36. FILE UPLOAD
==================================================

Validasi:

extension
MIME type
file size
filename
storage path.

==================================================
37. FILE EXTENSION
==================================================

Jangan percaya
extension dari user.

==================================================
38. FILE CONTENT
==================================================

Jika memungkinkan:

validasi file content
dan MIME sebenarnya.

==================================================
39. FILE EXECUTION
==================================================

Uploaded files tidak
boleh menjadi executable
di web server.

==================================================
40. FILE ACCESS
==================================================

Dokumen private:

HARUS AUTHORIZED.

Jangan menggunakan
public URL untuk
dokumen sensitif
tanpa alasan.

==================================================
41. DOCUMENT SECURITY
==================================================

Dokumen:

surat
SK
ijazah
data siswa
data karyawan
dokumen keuangan

harus mengikuti
permission.

==================================================
42. PDF SECURITY
==================================================

Generated PDF:

authorization
download
access logging
storage security.

==================================================
43. WORD SECURITY
==================================================

Generated DOCX:

authorization
download
storage security.

==================================================
44. QR CODE SECURITY
==================================================

QR tidak boleh
menjadi credential
yang mudah dipalsukan.

Gunakan identity
reference yang
divalidasi server.

==================================================
45. QR VALIDATION
==================================================

Flow:

SCAN
↓
DECODE
↓
VALIDATE
↓
CHECK STATUS
↓
CHECK SCOPE
↓
CHECK PERMISSION
↓
CHECK ATTENDANCE RULE
↓
SAVE.

==================================================
46. QR REPLAY
==================================================

Cegah QR scan
menghasilkan attendance
duplikat.

Gunakan rule existing:

student
date
session
attendance type

sesuai business logic.

==================================================
47. QR REVOKE
==================================================

Jika kartu pelajar
hilang/diganti:

QR dapat dinonaktifkan
atau diganti sesuai
architecture.

==================================================
48. QR PRIVACY
==================================================

Jangan menaruh
data sensitif langsung
di QR jika tidak perlu.

Lebih baik:

opaque identifier
atau signed reference.

==================================================
49. SECURITY GATE
==================================================

Security di gerbang
hanya dapat melakukan
attendance sesuai:

role
unit
gate scope.

Tidak otomatis
memiliki akses seluruh
data siswa.

==================================================
50. TEACHER ATTENDANCE
==================================================

Guru hanya dapat
melakukan attendance
sesuai scope yang
diberikan.

Contoh:

unit
kelas
jadwal
atau assignment

sesuai architecture
existing.

==================================================
51. MANUAL ATTENDANCE
==================================================

Manual attendance
lebih sensitif.

Audit:

WHO
WHEN
WHICH STUDENT
WHAT STATUS
WHY/NOTE jika tersedia.

==================================================
52. MANUAL CORRECTION
==================================================

Perubahan attendance
setelah dibuat harus:

authorized
audited
traceable.

==================================================
53. GPS SECURITY
==================================================

GPS attendance:

CLIENT LOCATION
↓
SERVER VALIDATION
↓
GEOFENCE RULE
↓
TIME RULE
↓
USER RULE
↓
SAVE.

Jangan percaya
nilai GPS dari client
secara langsung.

==================================================
54. GPS SPOOFING
==================================================

Deteksi indikasi
yang dapat dideteksi
oleh platform.

Namun:

jangan mengklaim
100% anti-spoofing.

==================================================
55. GPS PRIVACY
==================================================

Simpan lokasi hanya
sebatas kebutuhan
attendance.

Jangan melakukan
continuous tracking
jika tidak dibutuhkan.

==================================================
56. LOCATION PERMISSION
==================================================

Mobile harus menangani:

permission granted
permission denied
permission revoked
GPS disabled.

==================================================
57. TIME SECURITY
==================================================

Attendance timestamp
harus ditentukan
secara aman.

Jangan sepenuhnya
mempercayai clock
device.

Gunakan server time
untuk timestamp utama
jika architecture
mendukung.

==================================================
58. DUPLICATE ATTENDANCE
==================================================

Database harus
memiliki protection
terhadap duplicate
attendance sesuai
business rule.

Gunakan:

unique constraint
transaction
idempotency

jika sesuai.

==================================================
59. RACE CONDITION
==================================================

Audit terutama:

QR scan
attendance
payment
document generation
approval.

==================================================
60. IDEMPOTENCY
==================================================

Untuk operation yang
dapat terkirim ulang:

gunakan idempotency
strategy jika diperlukan.

==================================================
61. TRANSACTION
==================================================

Operation kritis:

attendance
payment
approval
assignment

harus atomic jika
memerlukan beberapa
database operation.

==================================================
62. DATABASE SECURITY
==================================================

Database:

strong credential
least privilege
network restriction
backup security.

==================================================
63. DATABASE USER
==================================================

Application database
user tidak boleh
memiliki privilege
yang tidak diperlukan.

==================================================
64. DATABASE ENCRYPTION
==================================================

Gunakan encryption
at rest jika
infrastructure
mendukung dan
diperlukan.

==================================================
65. BACKUP SECURITY
==================================================

Backup harus mengikuti:

access control
encryption
retention
audit.

==================================================
66. SECRET MANAGEMENT
==================================================

Audit semua:

.env
API key
JWT secret
SMTP credential
storage credential
Firebase credential.

==================================================
67. SECRET SCAN
==================================================

Scan repository untuk:

password
token
private key
API key
connection string.

==================================================
68. GIT SECURITY
==================================================

Pastikan tidak ada:

.env production
private key
database dump
backup
secret.

==================================================
69. DEPENDENCY SECURITY
==================================================

Audit dependency:

backend
frontend
mobile.

Perhatikan:

known vulnerabilities
outdated critical package
malicious package.

==================================================
70. LOCKFILE
==================================================

Gunakan lockfile.

Jangan mengubah
dependency version
secara sembarangan.

==================================================
71. DEPENDENCY UPDATE
==================================================

Flow:

SCAN
↓
REVIEW
↓
TEST
↓
STAGING
↓
PRODUCTION.

==================================================
72. ERROR RESPONSE
==================================================

Production error
tidak boleh membocorkan:

stack trace
SQL
filesystem path
secret
internal credential.

==================================================
73. ERROR ID
==================================================

Gunakan:

request ID
error ID

untuk troubleshooting.

==================================================
74. API RESPONSE
==================================================

Jangan mengirim
field internal
yang tidak diperlukan.

Gunakan response DTO/resource
sesuai architecture.

==================================================
75. DATA MINIMIZATION
==================================================

Frontend hanya menerima
data yang diperlukan.

Contoh:

Security tidak perlu
menerima seluruh profil
siswa jika hanya perlu
validasi identitas.

==================================================
76. API ENUMERATION
==================================================

Jangan membocorkan:

sequential sensitive IDs
data existence
user existence

lebih dari yang
dibutuhkan.

==================================================
77. SEARCH SECURITY
==================================================

Search endpoint harus
mengikuti authorization.

User tidak boleh
mencari data yang
tidak boleh dilihat.

==================================================
78. EXPORT SECURITY
==================================================

Export:

PDF
Excel
CSV
Word

harus mengikuti
permission dan scope.

==================================================
79. BULK EXPORT
==================================================

Perhatikan:

authorization
rate limit
file size
sensitive data.

==================================================
80. AUDIT LOG
==================================================

Audit minimal:

login
logout
failed login
permission denial
create
update
delete
attendance correction
document action
role change
permission change
system configuration.

==================================================
81. AUDIT LOG IMMUTABILITY
==================================================

User biasa tidak boleh
mengubah atau menghapus
audit log.

==================================================
82. ADMIN ACTION
==================================================

Action Super Admin
harus dapat ditelusuri:

actor
action
resource
timestamp
request ID.

==================================================
83. USER DEACTIVATION
==================================================

Saat user dinonaktifkan:

session/token
harus ditangani sesuai
mechanism existing.

Akses harus berhenti.

==================================================
84. EMPLOYEE DEACTIVATION
==================================================

Karyawan nonaktif
tidak boleh tetap
melakukan attendance
jika business rule
melarangnya.

==================================================
85. STUDENT STATUS
==================================================

Siswa nonaktif/lulus/
pindah harus mengikuti
attendance rule.

Jangan menghapus
history hanya karena
status berubah.

==================================================
86. ACCOUNT ENUMERATION
==================================================

Password reset dan
login error jangan
membocorkan informasi
akun secara berlebihan.

==================================================
87. RATE LIMIT
==================================================

Protect:

login
reset password
QR
attendance
upload
export
API expensive.

==================================================
88. DOS PROTECTION
==================================================

Batasi request
mahal:

large upload
large export
report
PDF generation.

==================================================
89. FILE SIZE
==================================================

Tetapkan batas
yang masuk akal.

==================================================
90. IMAGE PROCESSING
==================================================

Jika image processing
digunakan:

limit resolution
file size
format.

Hindari resource
exhaustion.

==================================================
91. PDF GENERATION
==================================================

Protect dari:

oversized input
infinite template
memory exhaustion.

==================================================
92. DOCUMENT TEMPLATE
==================================================

Template custom hanya
dapat dimodifikasi oleh
user authorized.

==================================================
93. TEMPLATE INJECTION
==================================================

Jika template
menggunakan expression:

JANGAN mengeksekusi
arbitrary code dari
user.

Gunakan safe template
engine.

==================================================
94. HTML SECURITY
==================================================

Jika surat/template
menggunakan HTML:

sanitize
escape
whitelist.

==================================================
95. WEBHOOK
==================================================

Jika webhook digunakan:

signature verification
timestamp validation
replay protection.

==================================================
96. THIRD PARTY API
==================================================

Audit:

payment
email
Firebase
Google
storage
notification.

Gunakan credential
minimum.

==================================================
97. THIRD PARTY FAILURE
==================================================

External provider
failure tidak boleh
membocorkan secret
atau membuat data
korup.

==================================================
98. SECURITY LOGGING
==================================================

Catat security event:

failed login
permission denied
suspicious request
credential change
role change
security setting change.

==================================================
99. SECURITY ALERT
==================================================

Alert untuk:

brute force
critical permission change
abnormal admin action
multiple failed login
server security event.

==================================================
100. PRODUCTION SECURITY
==================================================

Pastikan:

DEBUG OFF
HTTPS ON
SECURE COOKIE jika digunakan
RATE LIMIT ON
RBAC ON
VALIDATION ON
AUDIT ON
SECRET PROTECTED.

==================================================
101. SECURITY TEST
==================================================

Test secara aman:

unauthorized access
wrong role
wrong unit
wrong resource ID
expired token
invalid QR
revoked QR
duplicate QR
invalid GPS
manual attendance permission
file unauthorized access
export unauthorized.

==================================================
102. NEGATIVE TEST
==================================================

Pengujian harus
memastikan:

USER A TIDAK BISA
MENGAKSES RESOURCE USER B.

USER UNIT A TIDAK BISA
MENGAKSES RESOURCE UNIT B
jika tidak diberi akses.

==================================================
103. SUPER ADMIN TEST
==================================================

Pastikan hanya
Super Admin authorized
yang dapat mengakses:

system settings
roles
permissions
global configuration
security configuration.

==================================================
104. USER UI TEST
==================================================

Login sebagai setiap
role existing.

Pastikan:

menu sesuai role
page sesuai role
action sesuai permission.

==================================================
105. BACKEND TEST
==================================================

Jangan hanya menguji
UI.

Uji endpoint secara
langsung dengan:

valid token
invalid token
wrong role
wrong scope
wrong resource.

==================================================
106. SECURITY REGRESSION
==================================================

Setiap perubahan:

RUN SECURITY TEST.

Jangan sampai
fitur baru membuka
akses lama yang
seharusnya tertutup.

==================================================
107. PRODUCTION DATA
==================================================

Security testing
tidak boleh merusak
data production.

Gunakan:

staging
test database
sanitized dataset.

==================================================
108. SECURITY INCIDENT
==================================================

Jika ditemukan
critical vulnerability:

STOP RELEASE
↓
PATCH
↓
TEST
↓
VERIFY
↓
RELEASE.

==================================================
109. VULNERABILITY PRIORITY
==================================================

CRITICAL
HIGH
MEDIUM
LOW.

Prioritaskan:

authentication
authorization
data exposure
remote code execution
SQL injection
file upload
credential leak.

==================================================
110. SECURITY REPORT
==================================================

Hasilkan:

### AUTHENTICATION
PASS / FAIL

### AUTHORIZATION
PASS / FAIL

### RBAC
PASS / FAIL

### API SECURITY
PASS / FAIL

### DATABASE SECURITY
PASS / FAIL

### FILE SECURITY
PASS / FAIL

### QR SECURITY
PASS / FAIL

### GPS SECURITY
PASS / FAIL

### SESSION SECURITY
PASS / FAIL

### SECRET SECURITY
PASS / FAIL

### AUDIT SECURITY
PASS / FAIL

### DEPENDENCY SECURITY
PASS / FAIL

### INFRASTRUCTURE SECURITY
PASS / FAIL

### CRITICAL VULNERABILITIES
LIST

### HIGH VULNERABILITIES
LIST

### REMEDIATION
LIST.

==================================================
111. RELEASE GATE
==================================================

JANGAN menyatakan:

SECURITY READY

jika masih ada:

critical vulnerability
high-risk authorization flaw
credential exposure
data leakage
production secret leak.

==================================================
112. FINAL COMMAND
==================================================

AUDIT SELURUH CODEBASE.

SCAN:

FRONTEND
BACKEND
DATABASE
API
MOBILE
STORAGE
AUTH
RBAC
DOCUMENT
ATTENDANCE
QR
GPS
AUDIT
CONFIGURATION.

Cari:

duplicate authorization
missing authorization
IDOR
privilege escalation
SQL injection
XSS
CSRF
secret leak
unsafe upload
unsafe template
token vulnerability
rate-limit bypass
data leakage
scope bypass.

Jangan hanya memperbaiki
error yang terlihat.

Cari root cause.

Jangan membuat
security theater.

Semua security control
harus benar-benar bekerja.

Setelah perbaikan:

RUN TEST
↓
RUN REGRESSION
↓
VERIFY
↓
REPORT.

Hanya jika semua
critical security blocker
selesai:

SECURITY READY.

Jika belum:

SECURITY NOT READY.

# END OF 163