# 162 — ENTERPRISE MONITORING & OBSERVABILITY

## MASTER PRODUCTION MONITORING PROMPT

TUGAS INI KHUSUS UNTUK:

MONITORING
OBSERVABILITY
LOGGING
METRICS
TRACING
ALERTING
HEALTH CHECK
INCIDENT DETECTION.

JANGAN MEMBUAT FITUR BISNIS BARU.

JANGAN MEMBUAT MODUL BISNIS BARU.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI YANG
DIANGGAP SEBAGAI DATA PRODUKSI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN MENGUBAH BUSINESS LOGIC
KECUALI UNTUK MEMPERBAIKI
OBSERVABILITY YANG DIPERLUKAN.

==================================================
1. TUJUAN
==================================================

Pastikan sistem dapat menjawab:

APAKAH APLIKASI HIDUP?

APAKAH API HIDUP?

APAKAH DATABASE HIDUP?

APAKAH STORAGE HIDUP?

APAKAH QUEUE HIDUP?

APAKAH LOGIN BERHASIL?

APAKAH ABSENSI BERHASIL?

APAKAH QR BERHASIL?

APAKAH GPS BERHASIL?

APAKAH DOKUMEN BERHASIL?

APAKAH NOTIFIKASI BERHASIL?

APAKAH SERVER SEHAT?

APAKAH APLIKASI LAMBAT?

APAKAH TERJADI ERROR?

==================================================
2. OBSERVABILITY MODEL
==================================================

Gunakan tiga pilar:

LOGS
METRICS
TRACES

Hubungan:

USER
 ↓
FRONTEND / FLUTTER
 ↓
API
 ↓
SERVICE
 ↓
DATABASE / STORAGE
 ↓
QUEUE
 ↓
LOG + METRICS + TRACE.

==================================================
3. SOURCE OF TRUTH
==================================================

Monitoring tidak boleh
menjadi source of truth
untuk business data.

Monitoring hanya
mengobservasi sistem.

DATABASE tetap:

SOURCE OF TRUTH.

==================================================
4. HEALTH CHECK
==================================================

Sediakan health check
sesuai architecture existing.

Minimal:

APPLICATION
DATABASE
STORAGE
CACHE
QUEUE

jika dependency tersebut
digunakan.

==================================================
5. LIVENESS
==================================================

Liveness menjawab:

APAKAH PROCESS HIDUP?

Jika process mati:

FAIL.

Jangan melakukan dependency
check berat pada liveness.

==================================================
6. READINESS
==================================================

Readiness menjawab:

APAKAH SERVICE SIAP
MENERIMA REQUEST?

Check dependency
yang memang diperlukan.

==================================================
7. HEALTH RESPONSE
==================================================

Health endpoint tidak boleh
membocorkan:

PASSWORD
TOKEN
SECRET
DATABASE PASSWORD
PRIVATE KEY.

==================================================
8. DATABASE HEALTH
==================================================

Monitor:

connection
latency
failed query
connection pool
availability.

==================================================
9. STORAGE HEALTH
==================================================

Monitor:

availability
upload
download
latency
capacity.

==================================================
10. QUEUE HEALTH
==================================================

Jika queue digunakan:

pending jobs
processing jobs
failed jobs
retry
latency.

Alert jika queue
terlalu lama tertahan.

==================================================
11. CACHE HEALTH
==================================================

Monitor:

availability
hit/miss
latency
failure.

Cache failure tidak
boleh menyebabkan
data corruption.

==================================================
12. APPLICATION LOGGING
==================================================

Gunakan structured log.

Minimal:

timestamp
level
service
environment
request_id
route
HTTP method
status
duration.

==================================================
13. LOG LEVEL
==================================================

Gunakan:

DEBUG
INFO
WARN
ERROR
FATAL

sesuai environment.

Production:

hindari DEBUG berlebihan.

==================================================
14. ERROR LOG
==================================================

Error log harus membantu
menjawab:

WHAT
WHERE
WHEN
WHY
REQUEST ID.

==================================================
15. SENSITIVE DATA
==================================================

JANGAN log:

password
JWT
refresh token
API secret
database password
storage secret.

Hindari logging
data siswa/karyawan
secara berlebihan.

==================================================
16. PERSONAL DATA
==================================================

Minimalkan:

NIK
alamat
nomor telepon
data orang tua
data GPS
dokumen pribadi.

Log hanya data yang
dibutuhkan untuk
diagnosis.

==================================================
17. REQUEST ID
==================================================

Gunakan correlation/request
ID jika architecture
mendukung.

Flow:

CLIENT
 ↓
REQUEST ID
 ↓
API
 ↓
SERVICE
 ↓
DATABASE
 ↓
LOG.

Tujuan:

satu request dapat
ditelusuri end-to-end.

==================================================
18. API METRICS
==================================================

Monitor:

request count
success count
error count
latency
status code.

==================================================
19. HTTP STATUS METRICS
==================================================

Kelompokkan:

2xx
3xx
4xx
5xx.

Perhatikan peningkatan:

401
403
404
409
422
429
500
502
503
504.

==================================================
20. API LATENCY
==================================================

Monitor:

average
p50
p95
p99

jika monitoring stack
mendukung.

==================================================
21. SLOW REQUEST
==================================================

Tentukan threshold
sesuai architecture.

Jika request terlalu
lambat:

LOG
↓
IDENTIFY
↓
INVESTIGATE.

Jangan sekadar
menambah timeout.

==================================================
22. DATABASE QUERY
==================================================

Monitor query yang:

slow
frequent
failed.

==================================================
23. N+1 DETECTION
==================================================

Periksa endpoint:

dashboard
student
employee
attendance
report.

Pastikan tidak terjadi
N+1 query kritis.

==================================================
24. AUTH METRICS
==================================================

Monitor:

login success
login failure
logout
expired session
password reset.

==================================================
25. SECURITY ALERT
==================================================

Alert untuk pola:

multiple failed login
brute force indication
RBAC denial spike
suspicious access
abnormal API request.

==================================================
26. RBAC MONITORING
==================================================

Catat authorization
failure:

user
role
resource
action
timestamp
request ID.

Jangan membocorkan
sensitive payload.

==================================================
27. ATTENDANCE MONITORING
==================================================

Monitor:

student attendance
employee attendance
QR scan
GPS attendance
manual attendance.

==================================================
28. QR METRICS
==================================================

Monitor:

scan count
success
invalid QR
expired QR
revoked QR
duplicate attempt
authorization failure.

==================================================
29. QR ERROR
==================================================

Jika QR gagal:

capture:

request ID
timestamp
method
safe error category.

Jangan log secret
atau credential.

==================================================
30. GPS METRICS
==================================================

Monitor:

GPS permission denied
location unavailable
outside geofence
inside geofence
successful check-in
duplicate attempt.

==================================================
31. GPS PRIVACY
==================================================

Jangan menyimpan
atau mengirim lokasi
lebih banyak daripada
yang dibutuhkan oleh
business rule.

==================================================
32. MANUAL ATTENDANCE
==================================================

Monitor:

manual creation
manual correction
rejection
approval.

Semua action penting
harus dapat diaudit.

==================================================
33. DOCUMENT METRICS
==================================================

Monitor:

document creation
PDF generation
Word generation
download
upload
storage failure
print-related generation.

==================================================
34. PDF MONITORING
==================================================

Track:

generation success
generation failure
duration
file size.

==================================================
35. WORD MONITORING
==================================================

Track:

generation success
generation failure
duration
file size.

==================================================
36. STORAGE CAPACITY
==================================================

Monitor:

disk
object storage
database storage
backup storage.

==================================================
37. STORAGE ALERT
==================================================

Alert sebelum storage
mencapai critical capacity.

==================================================
38. NOTIFICATION MONITORING
==================================================

Monitor:

created
queued
sent
delivered jika provider
mendukung
failed
retry.

==================================================
39. EMAIL MONITORING
==================================================

Jika email digunakan:

send success
send failure
provider response
queue delay.

==================================================
40. PUSH NOTIFICATION
==================================================

Jika push digunakan:

token registration
send
failure
expired token.

==================================================
41. REPORT MONITORING
==================================================

Monitor report:

generation
duration
record count
failure.

==================================================
42. EXPORT MONITORING
==================================================

Monitor:

PDF
Excel
CSV
Word

jika tersedia.

==================================================
43. LARGE EXPORT
==================================================

Perhatikan:

memory
CPU
duration
file size.

Jangan membuat
export besar menyebabkan
server crash.

==================================================
44. QUEUE METRICS
==================================================

Monitor:

queue depth
job duration
failed jobs
retry count.

==================================================
45. FAILED JOB
==================================================

Jika job gagal:

LOG
↓
RETRY jika aman
↓
ALERT jika berulang.

Jangan retry infinite.

==================================================
46. SCHEDULER MONITORING
==================================================

Pastikan scheduled task
benar-benar dieksekusi.

Catat:

last run
duration
status
failure.

==================================================
47. SERVER METRICS
==================================================

Monitor:

CPU
RAM
Disk
Network
Load.

==================================================
48. CPU ALERT
==================================================

Alert jika CPU
berada pada kondisi
abnormal secara
berkelanjutan.

Jangan menggunakan
satu spike singkat
sebagai alasan
langsung scale.

==================================================
49. MEMORY ALERT
==================================================

Monitor:

RAM usage
memory growth
OOM.

==================================================
50. DISK ALERT
==================================================

Monitor:

application disk
database disk
log disk
storage disk.

==================================================
51. NETWORK
==================================================

Monitor:

latency
packet loss jika
tersedia
bandwidth
connection errors.

==================================================
52. DATABASE METRICS
==================================================

Monitor:

connections
slow queries
locks
deadlocks
errors
storage.

==================================================
53. DEADLOCK
==================================================

Jika deadlock terjadi:

LOG
↓
IDENTIFY TRANSACTION
↓
INVESTIGATE.

Jangan menyembunyikan
deadlock dengan retry
tanpa memahami root cause.

==================================================
54. CONNECTION POOL
==================================================

Monitor:

active
idle
max
failed.

==================================================
55. CACHE METRICS
==================================================

Monitor:

hit
miss
latency
error.

==================================================
56. FRONTEND ERROR
==================================================

Jika observability
frontend tersedia:

track:

runtime exception
API failure
navigation failure
asset failure.

==================================================
57. FLUTTER ERROR
==================================================

Track:

startup failure
API error
QR camera error
GPS error
notification error
document error.

Jangan mengirim
data pribadi berlebihan.

==================================================
58. MOBILE CRASH
==================================================

Jika crash reporting
tersedia:

monitor:

crash-free sessions
fatal crash
non-fatal error.

==================================================
59. PWA ERROR
==================================================

Monitor:

service worker
cache
asset
API
routing.

==================================================
60. BROWSER ERROR
==================================================

Monitor runtime
JavaScript error jika
web client menggunakannya.

==================================================
61. ALERTING
==================================================

Alert harus:

actionable
specific
non-duplicate.

Jangan membuat
alert noise.

==================================================
62. CRITICAL ALERT
==================================================

Contoh:

APPLICATION DOWN
DATABASE DOWN
STORAGE DOWN
HIGH 5XX
BACKUP FAILURE
QUEUE FAILURE
DISK CRITICAL.

==================================================
63. HIGH ALERT
==================================================

Contoh:

latency tinggi
error meningkat
failed jobs meningkat
storage mendekati limit.

==================================================
64. ALERT CHANNEL
==================================================

Gunakan channel
yang tersedia:

email
dashboard
push
messaging

sesuai infrastructure.

Jangan mengklaim channel
yang belum dikonfigurasi.

==================================================
65. ALERT DEDUPLICATION
==================================================

Satu incident tidak
boleh menghasilkan
ratusan alert identik.

==================================================
66. ALERT ESCALATION
==================================================

Jika critical:

DETECT
↓
NOTIFY
↓
ESCALATE
↓
RESOLVE
↓
CLOSE.

==================================================
67. INCIDENT ID
==================================================

Setiap critical incident
harus memiliki ID.

Contoh:

INC-2026-0001

atau format existing.

==================================================
68. INCIDENT TIMELINE
==================================================

Catat:

detected
acknowledged
investigated
mitigated
resolved.

==================================================
69. INCIDENT REPORT
==================================================

Format:

Incident ID
Date
Duration
Impact
Root Cause
Resolution
Affected Modules
Action Taken
Preventive Action.

==================================================
70. DASHBOARD MONITORING
==================================================

Monitoring dashboard
harus menunjukkan:

SYSTEM HEALTH
API
DATABASE
STORAGE
QUEUE
ERROR
LATENCY
ATTENDANCE
NOTIFICATION.

==================================================
71. BUSINESS HEALTH
==================================================

Selain technical health,
jika architecture
mendukung, monitor
indikator operasional:

attendance transaction
payment transaction
document generation.

Namun:

monitoring tidak
mengubah business data.

==================================================
72. DATA ANOMALY
==================================================

Deteksi anomali:

attendance spike
payment spike
error spike
login failure spike.

Jangan otomatis
mengubah data bisnis
hanya karena anomali.

==================================================
73. AUDIT INTEGRATION
==================================================

Critical system actions
harus memiliki:

audit
+
request ID
+
timestamp.

==================================================
74. OBSERVABILITY STORAGE
==================================================

Log/metrics retention
harus memiliki policy.

Jangan memenuhi
production disk.

==================================================
75. LOG ROTATION
==================================================

Gunakan:

rotation
retention
compression

sesuai infrastructure.

==================================================
76. LOG ACCESS
==================================================

Tidak semua user
boleh melihat production
technical logs.

Pisahkan:

application user
system administrator.

==================================================
77. OBSERVABILITY SECURITY
==================================================

Monitoring system
juga harus aman.

Jangan expose:

database
secret
token
internal topology
credential.

==================================================
78. PERFORMANCE IMPACT
==================================================

Observability tidak boleh
membebani aplikasi
secara berlebihan.

Gunakan sampling jika
diperlukan.

==================================================
79. TRACE SAMPLING
==================================================

Jika distributed tracing
digunakan:

gunakan sampling
sesuai kebutuhan.

Critical/error traces
dapat memiliki prioritas
lebih tinggi.

==================================================
80. TRACE FLOW
==================================================

Ideal:

Flutter/Web
↓
API
↓
Service
↓
Database
↓
Storage/Queue.

Satu request dapat
ditelusuri dengan
correlation ID.

==================================================
81. DEPLOYMENT MONITORING
==================================================

Setelah deployment:

monitor error
monitor latency
monitor database
monitor queue
monitor storage.

==================================================
82. RELEASE COMPARISON
==================================================

Bandingkan:

BEFORE RELEASE
vs
AFTER RELEASE.

Perhatikan:

error rate
latency
CPU
RAM
database.

==================================================
83. REGRESSION DETECTION
==================================================

Jika setelah release:

5xx meningkat
latency meningkat
attendance failure meningkat

maka:

INVESTIGATE.

==================================================
84. HEALTH CHECK AUTOMATION
==================================================

Jika infrastructure
mendukung:

health check otomatis
secara berkala.

==================================================
85. UPTIME
==================================================

Track uptime sesuai
infrastructure.

Jangan mengklaim
availability yang tidak
benar-benar diukur.

==================================================
86. SLO
==================================================

Jika dibutuhkan:

definisikan SLO untuk:

API availability
latency
critical workflows.

==================================================
87. SLA
==================================================

Jangan membuat
klaim SLA kepada user
jika belum ada
operational agreement.

==================================================
88. MONITORING TEST
==================================================

Uji:

application down
database unavailable
storage unavailable
queue failure
high error.

Pastikan alert
benar-benar bekerja.

==================================================
89. FALSE POSITIVE
==================================================

Review alert:

false positive
noise
duplicate.

Perbaiki threshold
jika diperlukan.

==================================================
90. FALSE NEGATIVE
==================================================

Pastikan critical
failure tidak lolos
tanpa alert.

==================================================
91. ON-CALL / RESPONSIBILITY
==================================================

Tentukan:

siapa menerima alert
siapa melakukan
diagnosis
siapa melakukan
rollback.

==================================================
92. RUNBOOK
==================================================

Untuk setiap critical
alert, buat:

SYMPTOM
CHECK
ACTION
ESCALATION
RECOVERY.

==================================================
93. RUNBOOK EXAMPLE
==================================================

DATABASE DOWN

Check:
database process
network
credentials
connection.

Action:
restart/recover sesuai
procedure.

Verify:
health check
API
smoke test.

==================================================
94. RUNBOOK ATTENDANCE
==================================================

QR attendance failure:

Check:

camera
API
QR validation
database
permission.

Gunakan request ID
untuk tracing.

==================================================
95. RUNBOOK GPS
==================================================

GPS attendance failure:

Check:

permission
device GPS
network
location payload
geofence
API
database.

==================================================
96. RUNBOOK DOCUMENT
==================================================

PDF/Word failure:

Check:

template
font
storage
generator
queue
memory.

==================================================
97. RUNBOOK STORAGE
==================================================

Storage failure:

Check:

capacity
credential
network
provider
permission.

==================================================
98. RUNBOOK LOGIN
==================================================

Login failure:

Check:

API
database
authentication
rate limit
user status.

==================================================
99. FINAL MONITORING CHECKLIST
==================================================

[ ] Health check
[ ] Liveness
[ ] Readiness
[ ] API logs
[ ] Error logs
[ ] Request ID
[ ] API metrics
[ ] Database metrics
[ ] Storage metrics
[ ] Queue metrics
[ ] Cache metrics
[ ] Server metrics
[ ] Attendance metrics
[ ] QR metrics
[ ] GPS metrics
[ ] Document metrics
[ ] Notification metrics
[ ] Frontend errors
[ ] Flutter errors
[ ] Alerts
[ ] Incident tracking
[ ] Runbooks
[ ] Log rotation
[ ] Access control
[ ] Monitoring security.

==================================================
100. FINAL REPORT
==================================================

Hasilkan:

### APPLICATION HEALTH
PASS / FAIL

### API HEALTH
PASS / FAIL

### DATABASE HEALTH
PASS / FAIL

### STORAGE HEALTH
PASS / FAIL

### QUEUE HEALTH
PASS / FAIL

### CACHE HEALTH
PASS / FAIL

### SERVER HEALTH
PASS / FAIL

### ATTENDANCE OBSERVABILITY
PASS / FAIL

### DOCUMENT OBSERVABILITY
PASS / FAIL

### NOTIFICATION OBSERVABILITY
PASS / FAIL

### MOBILE OBSERVABILITY
PASS / FAIL

### ALERTING
PASS / FAIL

### INCIDENT RESPONSE
PASS / FAIL

### SECURITY
PASS / FAIL

### FINAL STATUS

MONITORING READY

atau

MONITORING NOT READY.

==================================================
101. FINAL COMMAND
==================================================

AUDIT OBSERVABILITY EXISTING.

GUNAKAN MONITORING STACK
YANG SUDAH TERSEDIA.

JANGAN MEMBUAT STACK
MONITORING BARU TANPA
ALASAN.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI
YANG DITAMPILKAN SEBAGAI
DATA PRODUKSI.

JANGAN MENYIMPAN SECRET
DI LOG.

JANGAN MENYIMPAN DATA
PRIBADI SECARA BERLEBIHAN.

VALIDASI:

LOG
METRICS
TRACE
HEALTH
ALERT
INCIDENT
RUNBOOK.

PASTIKAN ERROR DAPAT
DITELUSURI DARI:

USER
↓
CLIENT
↓
API
↓
SERVICE
↓
DATABASE/STORAGE.

PASTIKAN CRITICAL INCIDENT
DAPAT DIDETEKSI DAN
DI-ALERT.

PASTIKAN MONITORING TIDAK
MERUSAK PERFORMANCE.

JIKA ADA KEKURANGAN:

TAMPILKAN ROOT CAUSE
DAN REMEDIATION.

JANGAN MENYATAKAN
MONITORING READY TANPA
VERIFIKASI.

# END OF 162