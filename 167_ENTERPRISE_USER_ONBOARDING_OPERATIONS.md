# 167 — ENTERPRISE USER ONBOARDING & OPERATIONS

## MASTER PRODUCTION USER ONBOARDING & DAILY OPERATIONS PROMPT

TUGAS INI KHUSUS UNTUK:

INITIAL SETUP
USER ONBOARDING
ROLE ASSIGNMENT
ACCESS CONTROL
TU OPERATIONS
TEACHER OPERATIONS
SECURITY OPERATIONS
ADMIN OPERATIONS
ATTENDANCE OPERATIONS
QR CARD OPERATIONS
GPS ATTENDANCE OPERATIONS
DEVICE OPERATIONS
OPERATIONAL SOP
GO-LIVE
PRODUCTION CHECKLIST.

==================================================
1. ATURAN UTAMA
==================================================

JANGAN MEMBUAT FITUR DUPLIKAT.

JANGAN MEMBUAT MODUL BARU
JIKA FITUR SUDAH ADA.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENAMPILKAN MENU
YANG TIDAK SESUAI ROLE.

JANGAN MENAMPILKAN
PENGATURAN SUPER ADMIN
KE USER BIASA.

JANGAN MEMBERIKAN
PERMISSION SECARA DEFAULT
TANPA RULE YANG JELAS.

JANGAN MENGUBAH DATA
PRODUKSI SECARA OTOMATIS
SAAT ONBOARDING.

==================================================
2. TUJUAN
==================================================

Memastikan aplikasi dapat
langsung digunakan oleh
lembaga sekolah/pondok
setelah deployment.

Alur:

INSTALL
↓
INITIAL CONFIGURATION
↓
ORGANIZATION SETUP
↓
USER SETUP
↓
ROLE
↓
PERMISSION
↓
DEVICE
↓
ATTENDANCE
↓
TEST
↓
TRAINING
↓
GO LIVE.

==================================================
3. SINGLE SOURCE OF TRUTH
==================================================

Gunakan module existing:

USER
ROLE
PERMISSION
ORGANIZATION
UNIT
STUDENT
EMPLOYEE
ATTENDANCE
QR
GPS
DOCUMENT
AUDIT
CONFIGURATION.

Jangan membuat
versi kedua.

==================================================
4. INITIAL SYSTEM SETUP
==================================================

Setelah deployment:

cek:

database
storage
cache
queue
scheduler
mail
notification
authentication.

==================================================
5. SYSTEM HEALTH
==================================================

Pastikan:

database connected
storage connected
queue healthy
cache healthy
application healthy.

Jika dependency gagal:

JANGAN menyatakan
system READY.

==================================================
6. ORGANIZATION SETUP
==================================================

Setup:

nama lembaga
logo
alamat
kontak
email
telepon
identitas lembaga.

Gunakan configuration
existing.

==================================================
7. UNIT SETUP
==================================================

Jika lembaga memiliki:

sekolah
pondok
PKBM
unit lain

pastikan struktur
unit sesuai data nyata.

==================================================
8. NO DUPLICATE UNIT
==================================================

Jangan membuat:

Unit A
Unit A Copy
Sekolah Baru
Sekolah Demo.

==================================================
9. ACADEMIC CONFIGURATION
==================================================

Gunakan academic
configuration existing.

Jika modul tahun ajaran
sudah tersedia:

REUSE.

==================================================
10. INITIAL ADMIN
==================================================

Buat hanya account
administrator yang
memang diperlukan.

==================================================
11. ADMIN SECURITY
==================================================

Password:

strong
hashed
never plaintext.

==================================================
12. ADMIN MFA
==================================================

Jika MFA sudah tersedia:

gunakan sesuai
security policy.

Jangan membuat
MFA engine duplicate.

==================================================
13. ADMIN PROFILE
==================================================

Administrator wajib
melengkapi:

nama
email
nomor kontak
profile.

==================================================
14. ROLE ASSIGNMENT
==================================================

Role harus berasal
dari role system
existing.

==================================================
15. PRINCIPLE OF LEAST PRIVILEGE
==================================================

Berikan permission
minimum yang diperlukan
untuk pekerjaan.

==================================================
16. ROLE VALIDATION
==================================================

Audit:

ROLE
↓
PERMISSION
↓
MENU
↓
PAGE
↓
API
↓
ACTION.

Semua harus konsisten.

==================================================
17. HIDDEN MENU
==================================================

Menu yang tidak
diizinkan role:

JANGAN DITAMPILKAN.

==================================================
18. API SECURITY
==================================================

Hidden menu bukan
security.

API tetap harus
melakukan authorization.

==================================================
19. SUPER ADMIN
==================================================

Super Admin dapat
mengakses:

system-level configuration
security
global settings
audit
maintenance

sesuai permission
existing.

==================================================
20. NORMAL ADMIN
==================================================

Normal admin hanya
mendapatkan permission
yang diberikan.

Jangan otomatis
menjadi Super Admin.

==================================================
21. TU ROLE
==================================================

TU hanya melihat
fitur yang relevan
dengan pekerjaan TU.

Contoh:

student administration
employee administration
documents
letters
archives
reports

sesuai permission
existing.

==================================================
22. TEACHER ROLE
==================================================

Guru hanya mendapat
fitur yang diperlukan
untuk tugasnya.

Contoh:

attendance
student access
class-related operation

sesuai permission
existing.

==================================================
23. SECURITY ROLE
==================================================

Security fokus pada:

student QR attendance
gate attendance
attendance verification

jika permission
tersedia.

==================================================
24. SECURITY RESTRICTION
==================================================

Security:

TIDAK BOLEH

mengakses:

financial
system settings
user administration
security configuration
super admin configuration

kecuali secara eksplisit
diberi permission.

==================================================
25. ATTENDANCE OPERATOR
==================================================

Jika ada role operator
attendance existing:

REUSE.

Jangan membuat
AttendanceOperator2.

==================================================
26. USER INVITATION
==================================================

Jika invitation system
sudah tersedia:

gunakan.

Jangan membuat
invitation mechanism
kedua.

==================================================
27. ACCOUNT ACTIVATION
==================================================

User baru harus:

created
verified
activated

sesuai authentication
flow existing.

==================================================
28. INACTIVE USER
==================================================

User yang tidak aktif:

tidak boleh login
atau melakukan API
operation sesuai
security policy.

==================================================
29. USER DEACTIVATION
==================================================

Saat pegawai keluar:

ACCOUNT
→
DEACTIVATE.

Jangan menghapus
historical data
secara otomatis.

==================================================
30. USER REASSIGNMENT
==================================================

Jika pegawai pindah
jabatan:

update role/assignment
sesuai business rule.

==================================================
31. NO HISTORICAL LOSS
==================================================

Perubahan user/employee
tidak boleh menghilangkan:

attendance history
audit
documents
records.

==================================================
32. EMPLOYEE ONBOARDING
==================================================

Alur:

EMPLOYEE DATA
↓
USER ACCOUNT
↓
ROLE
↓
PERMISSION
↓
DEVICE
↓
ATTENDANCE.

==================================================
33. TEACHER ONBOARDING
==================================================

Guru:

profile
↓
employee relationship
↓
role
↓
attendance
↓
operational access.

Gunakan relationship
existing.

==================================================
34. STUDENT ONBOARDING
==================================================

Siswa:

student master
↓
identifier
↓
QR
↓
card
↓
attendance.

==================================================
35. QR GENERATION
==================================================

QR harus:

unique
secure
stable
traceable.

==================================================
36. QR CARD
==================================================

Kartu pelajar harus
menggunakan identifier
yang sama dengan
attendance system.

Jangan membuat
QR identifier kedua.

==================================================
37. QR REPLACEMENT
==================================================

Jika kartu hilang:

OLD QR
→
REVOKE/INACTIVE

NEW QR
→
ASSIGN.

Sesuai business rule
existing.

==================================================
38. LOST CARD
==================================================

Kartu hilang harus
dapat ditandai
sebagai:

LOST
atau
INACTIVE

tanpa menghapus
historical attendance.

==================================================
39. DUPLICATE QR
==================================================

System harus mencegah:

1 QR
→
2 ACTIVE STUDENT.

==================================================
40. QR TEST
==================================================

Production test harus
menggunakan data
production yang
memang ditunjuk
untuk testing.

JANGAN membuat
student dummy.

==================================================
41. SECURITY GATE
==================================================

Security workflow:

SISWA DATANG
↓
SCAN QR
↓
SYSTEM VALIDATION
↓
ATTENDANCE
↓
STATUS.

==================================================
42. TEACHER ATTENDANCE
==================================================

Guru dapat melakukan
attendance sesuai
permission melalui:

QR
atau
manual

jika fitur tersebut
sudah tersedia.

==================================================
43. MANUAL ATTENDANCE
==================================================

Manual attendance
harus memiliki:

actor
timestamp
student
status
reason

sesuai schema existing.

==================================================
44. GPS ATTENDANCE
==================================================

Guru/karyawan:

OPEN ATTENDANCE
↓
GET LOCATION
↓
VALIDATE LOCATION
↓
SUBMIT
↓
SAVE
↓
AUDIT.

==================================================
45. LOCATION PERMISSION
==================================================

Jika GPS permission
ditolak:

tampilkan error
yang jelas.

Jangan mencatat
attendance seolah-olah
GPS valid.

==================================================
46. LOCATION ACCURACY
==================================================

Gunakan accuracy
sesuai rule existing.

Jangan menerima
location invalid
hanya agar attendance
berhasil.

==================================================
47. GEOFENCE
==================================================

Jika geofence
sudah tersedia:

gunakan configuration
existing.

Jangan membuat
GeofenceEngine2.

==================================================
48. DEVICE REGISTRATION
==================================================

Jika device binding
tersedia:

gunakan mekanisme
existing.

==================================================
49. DEVICE CHANGE
==================================================

Pergantian HP:

gunakan flow
existing untuk
revoke/re-register.

==================================================
50. DEVICE SECURITY
==================================================

Jangan menyimpan:

password
secret
token sensitif

secara plaintext
di device.

==================================================
51. MOBILE LOGIN
==================================================

User mobile harus
mendapatkan session
sesuai authentication
system existing.

==================================================
52. SESSION
==================================================

Pastikan:

login
refresh
logout
revocation

berfungsi.

==================================================
53. LOGOUT
==================================================

Logout harus
menghentikan session
sesuai mechanism
existing.

==================================================
54. ROLE CHANGE
==================================================

Jika role berubah:

permission baru
harus berlaku sesuai
policy.

Permission lama
tidak boleh tetap aktif
secara tidak sengaja.

==================================================
55. PERMISSION CACHE
==================================================

Jika permission
menggunakan cache:

invalidate setelah
perubahan role/permission.

==================================================
56. TU DAILY OPERATION
==================================================

Workflow TU:

LOGIN
↓
DASHBOARD
↓
CHECK TASK
↓
STUDENT/EMPLOYEE DATA
↓
DOCUMENT
↓
LETTER
↓
ARCHIVE
↓
REPORT.

Gunakan menu existing.

==================================================
57. TEACHER DAILY OPERATION
==================================================

Workflow:

LOGIN
↓
ATTENDANCE
↓
CHECK STUDENTS
↓
MANUAL/QR ATTENDANCE
↓
SUBMIT
↓
VERIFY.

==================================================
58. SECURITY DAILY OPERATION
==================================================

Workflow:

LOGIN
↓
ATTENDANCE GATE
↓
SCAN STUDENT QR
↓
VALIDATE
↓
CONFIRM STATUS.

==================================================
59. ADMIN DAILY OPERATION
==================================================

Admin:

MONITOR
↓
USER
↓
DATA
↓
ATTENDANCE
↓
REPORT
↓
AUDIT.

==================================================
60. ATTENDANCE MONITORING
==================================================

Authorized user dapat
melihat:

hadir
izin
sakit
alpa
terlambat

sesuai attendance
status existing.

==================================================
61. REAL-TIME STATUS
==================================================

Jika existing system
mendukung real-time:

gunakan.

Jangan membuat
real-time engine
duplicate.

==================================================
62. ATTENDANCE CORRECTION
==================================================

Koreksi attendance
harus:

authorized
audited
traceable.

==================================================
63. ATTENDANCE EDIT
==================================================

Jangan izinkan
semua user mengubah
historical attendance.

==================================================
64. ATTENDANCE DELETE
==================================================

Delete historical
attendance harus
sangat terbatas
atau mengikuti
policy existing.

==================================================
65. ABSENCE REASON
==================================================

Jika manual correction
diperlukan:

wajib memiliki
alasan sesuai
business rule.

==================================================
66. DAILY CLOSING
==================================================

Jika attendance
memiliki daily closing:

gunakan existing
workflow.

Jangan membuat
closing system baru.

==================================================
67. MONTHLY CLOSING
==================================================

Jika tersedia:

gunakan existing
monthly closing.

==================================================
68. OPERATIONAL DASHBOARD
==================================================

Dashboard harus
menampilkan data
real production.

JANGAN:

demo
sample
mock.

==================================================
69. ONBOARDING CHECKLIST
==================================================

### ORGANIZATION

[ ] Nama lembaga
[ ] Logo
[ ] Alamat
[ ] Kontak
[ ] Unit.

### USERS

[ ] Super Admin
[ ] Admin
[ ] TU
[ ] Guru
[ ] Security
[ ] User lain sesuai
    kebutuhan.

### STUDENTS

[ ] Student master
[ ] Identifier
[ ] QR
[ ] Card.

### EMPLOYEES

[ ] Employee master
[ ] Role
[ ] Attendance.

### ATTENDANCE

[ ] QR
[ ] Manual
[ ] GPS
[ ] Gate.

==================================================
70. USER TRAINING
==================================================

Training harus
berdasarkan role.

==================================================
71. TU TRAINING
==================================================

Ajarkan:

login
student
employee
document
letter
archive
report.

Hanya fitur yang
memang tersedia.

==================================================
72. TEACHER TRAINING
==================================================

Ajarkan:

login
attendance
QR
manual attendance
status.

==================================================
73. SECURITY TRAINING
==================================================

Ajarkan:

login
scan QR
validation
attendance status
error handling.

==================================================
74. ADMIN TRAINING
==================================================

Ajarkan:

user
role
permission
monitoring
audit.

==================================================
75. SUPER ADMIN TRAINING
==================================================

Hanya untuk:

system configuration
security
global configuration
maintenance

sesuai permission
existing.

==================================================
76. SOP
==================================================

Setiap role harus
memiliki SOP operasional
yang sederhana.

==================================================
77. MORNING OPERATION
==================================================

Sebelum sekolah mulai:

CHECK SYSTEM
↓
CHECK NETWORK
↓
CHECK DEVICE
↓
CHECK QR SCANNER
↓
READY.

==================================================
78. GATE OPERATION
==================================================

Security:

DEVICE READY
↓
LOGIN
↓
OPEN QR ATTENDANCE
↓
SCAN.

==================================================
79. QR FAILURE
==================================================

Jika QR gagal:

CHECK CARD
↓
CHECK STUDENT
↓
CHECK NETWORK
↓
MANUAL ATTENDANCE
jika authorized.

Jangan membuat
attendance duplicate.

==================================================
80. NETWORK FAILURE
==================================================

Jika network gagal:

ikuti offline/retry
mechanism existing.

Jika offline belum
didukung:

jangan mengklaim
offline attendance
tersedia.

==================================================
81. GPS FAILURE
==================================================

Jika GPS gagal:

CHECK LOCATION
↓
CHECK PERMISSION
↓
CHECK ACCURACY
↓
RETRY.

Jangan bypass
security tanpa
authorization.

==================================================
82. DEVICE FAILURE
==================================================

Jika device rusak:

gunakan device
authorized lainnya.

==================================================
83. USER LOCKOUT
==================================================

Jika account locked:

gunakan recovery
existing.

==================================================
84. END OF DAY
==================================================

Operator:

CHECK ATTENDANCE
↓
CHECK ERROR
↓
CORRECTION
↓
CLOSE.

Jika closing
tersedia.

==================================================
85. DAILY REPORT
==================================================

Authorized user
dapat melihat
daily attendance
report.

==================================================
86. MONTHLY REPORT
==================================================

Authorized user
dapat melihat
monthly report.

==================================================
87. AUDIT
==================================================

Semua operation
penting harus
traceable.

==================================================
88. INCIDENT
==================================================

Jika terjadi:

duplicate
wrong student
wrong GPS
wrong attendance
unauthorized access

buat incident
sesuai mechanism
existing.

==================================================
89. INCIDENT RESPONSE
==================================================

STOP
↓
IDENTIFY
↓
CORRECT
↓
AUDIT
↓
VERIFY.

==================================================
90. DATA CORRECTION
==================================================

Jangan langsung
mengubah database
secara manual.

Gunakan:

application workflow
atau
authorized maintenance
procedure.

==================================================
91. PRODUCTION SUPPORT
==================================================

Support team harus
dapat melihat:

error
logs
audit
system status

sesuai permission.

==================================================
92. SUPER ADMIN VISIBILITY
==================================================

Fitur teknis seperti:

system configuration
database maintenance
queue
cache
security

JANGAN tampil kepada
user biasa.

==================================================
93. USER EXPERIENCE
==================================================

Setiap role hanya
melihat:

dashboard relevan
menu relevan
action relevan.

==================================================
94. EMPTY STATE
==================================================

Jika data belum ada:

tampilkan empty state
yang jelas.

Jangan tampilkan
dummy data.

==================================================
95. ERROR MESSAGE
==================================================

Error harus:

jelas
singkat
actionable.

Jangan menampilkan
stack trace kepada
user.

==================================================
96. LOADING
==================================================

Operation berat harus
memiliki loading state.

==================================================
97. SUCCESS
==================================================

Success message harus
menjelaskan operation
yang berhasil.

==================================================
98. CONFIRMATION
==================================================

Operation berisiko:

delete
deactivate
revoke
correction

harus meminta
confirmation sesuai
UX existing.

==================================================
99. PRODUCTION MODE
==================================================

Pastikan:

DEMO MODE
SIMULATION MODE
MOCK ATTENDANCE
FAKE GPS
FAKE QR

TIDAK AKTIF.

==================================================
100. TEST DATA
==================================================

Jika testing production
diperlukan:

gunakan record
yang memang ditunjuk
untuk production test
dan ikuti kebijakan
data lembaga.

Jangan membuat
dummy user sembarangan.

==================================================
101. GO-LIVE CHECK
==================================================

[ ] DOMAIN
[ ] SSL
[ ] DATABASE
[ ] STORAGE
[ ] CACHE
[ ] QUEUE
[ ] EMAIL
[ ] AUTH
[ ] RBAC
[ ] USER
[ ] STUDENT
[ ] EMPLOYEE
[ ] QR
[ ] GPS
[ ] ATTENDANCE
[ ] AUDIT
[ ] BACKUP
[ ] MONITORING.

==================================================
102. GO-LIVE ATTENDANCE
==================================================

Uji:

SECURITY QR
TEACHER QR
TEACHER MANUAL
EMPLOYEE GPS.

Pastikan setiap
operation masuk
database dengan benar.

==================================================
103. GO-LIVE SECURITY
==================================================

Pastikan:

security tidak dapat
mengakses:

Super Admin
financial
system settings

tanpa permission.

==================================================
104. GO-LIVE RBAC
==================================================

Test matrix:

ROLE
→
MENU
→
PAGE
→
API
→
ACTION.

Tidak boleh ada
privilege escalation.

==================================================
105. GO-LIVE DATA
==================================================

Pastikan:

NO DUMMY
NO DEMO
NO MOCK
NO SIMULATION.

==================================================
106. GO-LIVE DOCUMENT
==================================================

Surat/dokumen harus
menggunakan:

lembaga
logo
kop
identitas
format

yang telah dikonfigurasi.

==================================================
107. GO-LIVE PDF
==================================================

Pastikan PDF
menghasilkan:

layout benar
font benar
margin benar
kop benar
data benar.

==================================================
108. GO-LIVE WORD
==================================================

Pastikan Word
menghasilkan:

layout
font
header
footer
data

sesuai template.

==================================================
109. GO-LIVE BACKUP
==================================================

Pastikan backup
production aktif
dan terverifikasi.

==================================================
110. GO-LIVE MONITORING
==================================================

Monitor:

API
database
errors
queue
storage
attendance.

==================================================
111. GO-LIVE PERFORMANCE
==================================================

Pastikan peak attendance
tidak menyebabkan:

timeout
duplicate
lost attendance.

==================================================
112. FIRST DAY SUPPORT
==================================================

Hari pertama:

monitor lebih ketat:

LOGIN
QR
GPS
ATTENDANCE
DATABASE
ERROR.

==================================================
113. FIRST WEEK
==================================================

Review:

user issue
permission issue
attendance issue
performance
data quality.

==================================================
114. FEEDBACK
==================================================

Kumpulkan feedback
berdasarkan:

role
workflow
error
usability.

Jangan langsung
membuat fitur baru
tanpa analisis.

==================================================
115. CHANGE REQUEST
==================================================

Semua permintaan
perubahan harus
dibedakan:

BUG
IMPROVEMENT
NEW FEATURE
CONFIGURATION.

==================================================
116. BUG
==================================================

BUG:

fix existing behavior.

==================================================
117. IMPROVEMENT
==================================================

Improvement:

optimasi behavior
existing.

==================================================
118. NEW FEATURE
==================================================

New feature:

jangan dimasukkan
ke production
tanpa review
arsitektur dan
duplikasi.

==================================================
119. CONFIGURATION
==================================================

Jika dapat diselesaikan
dengan configuration:

JANGAN membuat
feature baru.

==================================================
120. SUPPORT ACCESS
==================================================

Support access
harus:

limited
audited
time-bound jika
mechanism tersedia.

==================================================
121. BREAK-GLASS
==================================================

Emergency access
jika tersedia harus:

audited
restricted
reviewed.

==================================================
122. NO DIRECT DATABASE
==================================================

Operator biasa
tidak boleh melakukan
database modification
langsung.

==================================================
123. OPERATIONAL SECURITY
==================================================

Jangan membagikan:

password
API key
secret
token.

==================================================
124. DEVICE SECURITY
==================================================

Device attendance:

gunakan lock screen
dan authentication
yang sesuai.

==================================================
125. QR CARD SECURITY
==================================================

Jika QR berisi
identifier sensitif:

hindari menampilkan
data sensitif langsung
dalam QR.

==================================================
126. USER OFFBOARDING
==================================================

Saat user berhenti:

DEACTIVATE
↓
REVOKE ACCESS
↓
REVOKE DEVICE
↓
RETAIN HISTORY.

==================================================
127. EMPLOYEE TRANSFER
==================================================

Saat pindah unit:

UPDATE ASSIGNMENT
↓
UPDATE ACCESS
↓
VERIFY.

==================================================
128. ROLE REVIEW
==================================================

Secara berkala:

review user
review role
review permission.

==================================================
129. UNUSED ACCOUNT
==================================================

Account tidak aktif
harus ditinjau sesuai
security policy.

==================================================
130. OPERATIONAL AUDIT
==================================================

Audit:

siapa
melakukan apa
kapan
pada data apa
hasilnya.

==================================================
131. FINAL ONBOARDING AUDIT
==================================================

Periksa:

USER
ROLE
PERMISSION
MENU
API
STUDENT
EMPLOYEE
QR
GPS
ATTENDANCE
AUDIT
DOCUMENT
BACKUP.

==================================================
132. NO DUPLICATE SYSTEM
==================================================

SCAN CODEBASE.

Cari:

OnboardingService
UserSetupService
RoleAssignmentService
AttendanceSetup
QRSetup
DeviceSetup.

Jika sudah ada:

REUSE.

Jangan membuat:

OnboardingEngine2
UserSetupEngine2
AttendanceSetup2.

==================================================
133. PRODUCTION OPERATIONS
==================================================

Aplikasi harus
mendukung operasi:

HARIAN
MINGGUAN
BULANAN
TAHUNAN

sesuai fitur existing.

==================================================
134. OPERATIONAL DOCUMENTATION
==================================================

Dokumentasikan:

LOGIN
USER
ROLE
STUDENT
EMPLOYEE
QR
GPS
ATTENDANCE
REPORT
DOCUMENT
BACKUP
INCIDENT.

==================================================
135. QUICK START
==================================================

Buat alur singkat:

1. Login
2. Pilih menu
3. Jalankan tugas
4. Simpan
5. Verifikasi
6. Logout.

==================================================
136. FINAL PRODUCTION CHECK
==================================================

[ ] Semua user valid
[ ] Semua role valid
[ ] Semua permission valid
[ ] Menu sesuai role
[ ] API sesuai role
[ ] Tidak ada super admin
    setting pada user biasa
[ ] Tidak ada dummy
[ ] Tidak ada simulasi
[ ] QR aktif
[ ] GPS aktif
[ ] Attendance aktif
[ ] Audit aktif
[ ] Backup aktif
[ ] Monitoring aktif.

==================================================
137. FINAL REPORT
==================================================

### ORGANIZATION
PASS / FAIL

### USER
PASS / FAIL

### ROLE
PASS / FAIL

### PERMISSION
PASS / FAIL

### STUDENT
PASS / FAIL

### EMPLOYEE
PASS / FAIL

### QR
PASS / FAIL

### GPS
PASS / FAIL

### ATTENDANCE
PASS / FAIL

### DOCUMENT
PASS / FAIL

### AUDIT
PASS / FAIL

### BACKUP
PASS / FAIL

### MONITORING
PASS / FAIL

### GO-LIVE
PASS / FAIL.

==================================================
138. CRITICAL FINDINGS
==================================================

Untuk setiap masalah:

MODULE:
ROLE:
ISSUE:
ROOT CAUSE:
IMPACT:
RISK:
FIX:
STATUS.

==================================================
139. FINAL COMMAND
==================================================

AUDIT SELURUH CODEBASE.

JANGAN MEMBUAT FITUR BARU
SEBELUM MEMERIKSA FITUR
EXISTING.

Pastikan:

SEMUA ROLE
↓
SEMUA MENU
↓
SEMUA PAGE
↓
SEMUA API
↓
SEMUA ACTION

konsisten.

Pastikan:

TU
GURU
SECURITY
ADMIN
SUPER ADMIN

masing-masing hanya
mendapatkan akses
yang memang menjadi
haknya.

Pastikan:

QR SISWA
SECURITY GATE
GURU QR
GURU MANUAL
EMPLOYEE GPS

berjalan menggunakan
ENGINE ABSENSI EXISTING.

==================================================
140. RELEASE GATE
==================================================

Jika:

NO DUPLICATE FEATURE
NO DUMMY DATA
NO SIMULATION
NO RBAC LEAK
NO SUPER ADMIN LEAK
NO BROKEN ATTENDANCE
NO BROKEN QR
NO BROKEN GPS
NO BROKEN DATABASE RELATION
NO CRITICAL ERROR

maka:

USER ONBOARDING &
OPERATIONS READY.

Jika tidak:

USER ONBOARDING &
OPERATIONS NOT READY.

==================================================
141. FINAL OUTPUT
==================================================

Jangan hanya menjawab:

"Onboarding selesai."

Tampilkan:

1. SYSTEM SETUP
2. ORGANIZATION SETUP
3. USER SETUP
4. ROLE MATRIX
5. PERMISSION MATRIX
6. STUDENT SETUP
7. EMPLOYEE SETUP
8. QR SETUP
9. GPS SETUP
10. ATTENDANCE SETUP
11. DOCUMENT SETUP
12. AUDIT SETUP
13. BACKUP CHECK
14. MONITORING CHECK
15. PRODUCTION CHECK
16. CRITICAL FINDINGS
17. FINAL STATUS.

# END OF 167