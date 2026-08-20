# 165 — ENTERPRISE PERFORMANCE & SCALABILITY

## MASTER PRODUCTION PERFORMANCE & SCALABILITY PROMPT

TUGAS INI KHUSUS UNTUK:

APPLICATION PERFORMANCE
API PERFORMANCE
DATABASE PERFORMANCE
QUERY OPTIMIZATION
FRONTEND PERFORMANCE
MOBILE PERFORMANCE
CACHE
QUEUE
FILE PROCESSING
REPORT PERFORMANCE
PDF/WORD GENERATION
ABSENSI QR
ABSENSI GPS
CONCURRENCY
SCALABILITY
RESOURCE OPTIMIZATION.

==================================================
1. ATURAN UTAMA
==================================================

JANGAN MEMBUAT MODUL BISNIS BARU.

JANGAN MEMBUAT FITUR DUPLIKAT.

JANGAN MEMBUAT DATA DUMMY.

JANGAN MEMBUAT SIMULASI.

JANGAN MENGHAPUS DATA PRODUKSI.

JANGAN RESET DATABASE PRODUKSI.

JANGAN MENGUBAH BUSINESS LOGIC
KECUALI UNTUK PERBAIKAN
PERFORMANCE YANG AMAN.

JANGAN MENGORBANKAN:

DATA INTEGRITY
SECURITY
RBAC
AUDIT
TRANSACTION INTEGRITY

hanya demi kecepatan.

==================================================
2. TUJUAN
==================================================

Target utama:

CEPAT
STABIL
EFISIEN
SCALABLE
AMAN
KONSISTEN.

Pastikan aplikasi tetap
responsif ketika jumlah:

SISWA
GURU
KARYAWAN
USER
ABSENSI
DOKUMEN
SURAT
TRANSAKSI
LAPORAN

bertambah besar.

==================================================
3. PERFORMANCE PRINCIPLE
==================================================

Gunakan:

MEASURE
↓
IDENTIFY
↓
OPTIMIZE
↓
TEST
↓
VERIFY.

Jangan melakukan
optimasi berdasarkan
asumsi saja.

==================================================
4. PERFORMANCE BASELINE
==================================================

Audit terlebih dahulu:

API latency
database latency
page load
mobile startup
query count
memory usage
CPU usage
file generation
queue processing.

==================================================
5. PERFORMANCE BUDGET
==================================================

Tetapkan target berdasarkan
architecture dan infrastructure
yang benar-benar digunakan.

Jangan membuat angka
target palsu hanya agar
status PASS.

==================================================
6. APPLICATION STARTUP
==================================================

Audit:

backend startup
web startup
mobile startup.

Hindari:

dependency initialization
yang tidak diperlukan
saat startup.

==================================================
7. BACKEND STARTUP
==================================================

Pastikan startup tidak
melakukan:

query database besar
load seluruh data
generate report
scan seluruh filesystem.

==================================================
8. FRONTEND STARTUP
==================================================

Jangan load seluruh
module aplikasi sekaligus
jika code splitting
tersedia dan sesuai stack.

==================================================
9. MOBILE STARTUP
==================================================

Flutter/mobile:

hindari initialization
berat yang tidak diperlukan
sebelum halaman utama
ditampilkan.

==================================================
10. DATABASE FIRST
==================================================

Prioritas optimasi:

DATABASE
↓
API
↓
FRONTEND
↓
MOBILE.

Karena database sering
menjadi bottleneck utama.

==================================================
11. QUERY AUDIT
==================================================

Cari:

slow query
duplicate query
N+1 query
full table scan
unnecessary join
unnecessary select.

==================================================
12. N+1 QUERY
==================================================

Audit terutama:

students
employees
attendance
classes
units
documents
payments
reports.

Jangan mengambil
relationship satu per satu
jika dapat dilakukan
secara efisien.

==================================================
13. SELECT FIELD
==================================================

Jangan selalu:

SELECT *

Ambil hanya field
yang diperlukan.

==================================================
14. EAGER LOADING
==================================================

Gunakan eager loading
secara tepat.

Jangan:

lazy loading berulang
dalam loop.

==================================================
15. OVERFETCHING
==================================================

API jangan mengirim
data yang tidak digunakan
frontend.

==================================================
16. UNDERFETCHING
==================================================

Hindari terlalu banyak
request kecil hanya
untuk menampilkan
satu halaman.

==================================================
17. PAGINATION
==================================================

Semua dataset besar
harus menggunakan
pagination.

Contoh:

students
employees
attendance
documents
audit logs
transactions.

==================================================
18. PAGINATION DEFAULT
==================================================

Gunakan default page size
yang masuk akal.

Jangan mengizinkan
client meminta:

100.000
atau
1.000.000 record

dalam satu request
tanpa alasan.

==================================================
19. CURSOR PAGINATION
==================================================

Gunakan cursor pagination
jika dataset sangat besar
dan architecture
mendukungnya.

==================================================
20. SEARCH
==================================================

Search harus:

indexed
bounded
paginated.

==================================================
21. DATABASE INDEX
==================================================

Audit index untuk:

foreign key
status
date
unit
student
employee
attendance
created_at
updated_at.

==================================================
22. INDEX OVERUSE
==================================================

Jangan menambahkan
index pada semua kolom.

Terlalu banyak index
dapat memperlambat:

INSERT
UPDATE
DELETE.

==================================================
23. COMPOSITE INDEX
==================================================

Jika query sering
menggunakan kombinasi:

unit_id
+
date

atau:

student_id
+
date

pertimbangkan composite
index sesuai query nyata.

==================================================
24. UNIQUE CONSTRAINT
==================================================

Gunakan database constraint
untuk rule uniqueness
yang penting.

Contoh:

attendance duplicate
identifier duplicate.

==================================================
25. DATABASE CONSTRAINT
==================================================

Business rule yang
bersifat integritas data
harus diperkuat di database
jika memungkinkan.

==================================================
26. TRANSACTION
==================================================

Gunakan transaction
untuk operation yang
harus atomic.

Contoh:

attendance
payment
approval
assignment.

==================================================
27. TRANSACTION SIZE
==================================================

Hindari transaction
yang terlalu panjang.

Semakin lama transaction:

lock semakin lama
resource semakin besar.

==================================================
28. DEADLOCK
==================================================

Audit kemungkinan:

deadlock
lock contention
long transaction.

==================================================
29. CONNECTION POOL
==================================================

Audit:

pool size
active connection
idle connection
timeout.

==================================================
30. CONNECTION LEAK
==================================================

Pastikan connection
selalu dilepas oleh
ORM/framework.

==================================================
31. DATABASE CACHE
==================================================

Gunakan cache hanya
untuk data yang:

read-heavy
relatif stabil.

Jangan cache data
yang memerlukan
konsistensi real-time
tanpa strategy invalidation.

==================================================
32. CACHE INVALIDATION
==================================================

Jika data berubah:

cache harus:

invalidate
atau
refresh

sesuai architecture.

==================================================
33. CACHE KEY
==================================================

Gunakan key yang
jelas dan tidak bentrok.

Contoh konsep:

unit
student
configuration
permission.

==================================================
34. CACHE SECURITY
==================================================

Jangan sampai cache
mengembalikan data
user A kepada user B.

Cache key harus
memperhatikan scope
jika diperlukan.

==================================================
35. CACHE STAMPEDE
==================================================

Jika banyak request
meminta resource yang
sama:

hindari database
dihantam bersamaan
saat cache expired.

==================================================
36. API PERFORMANCE
==================================================

Audit:

request count
latency
payload size
serialization.

==================================================
37. RESPONSE PAYLOAD
==================================================

Jangan mengirim
payload besar jika
tidak diperlukan.

Gunakan:

pagination
projection
summary endpoint
detail endpoint.

==================================================
38. DASHBOARD
==================================================

Dashboard tidak boleh
melakukan puluhan query
berat hanya untuk
menampilkan statistik.

==================================================
39. DASHBOARD OPTIMIZATION
==================================================

Gunakan:

aggregated query
cached metrics
precomputed data
summary query

jika sesuai.

==================================================
40. REAL-TIME DATA
==================================================

Jangan melakukan
polling terlalu sering.

Jika real-time
memang dibutuhkan:

gunakan mechanism
yang sudah tersedia
dalam architecture.

==================================================
41. ATTENDANCE PERFORMANCE
==================================================

QR attendance harus
cepat:

SCAN
↓
VALIDATE
↓
CHECK
↓
SAVE
↓
RESPONSE.

==================================================
42. QR DATABASE
==================================================

Query QR harus
menggunakan field
yang ter-index.

Jangan mencari
seluruh tabel siswa
setiap scan.

==================================================
43. QR CONCURRENCY
==================================================

Jika banyak siswa
scan bersamaan:

database harus mampu
menangani concurrency.

Gunakan:

constraint
transaction
idempotency

sesuai business rule.

==================================================
44. QR DUPLICATE
==================================================

Duplicate scan harus
ditangani dengan cepat.

Jangan membuat
multiple attendance
karena race condition.

==================================================
45. QR RESPONSE
==================================================

Response QR harus
ringkas.

Tidak perlu mengirim
seluruh profil siswa.

==================================================
46. SECURITY GATE
==================================================

Jika security melakukan
scan banyak siswa:

optimalkan:

QR lookup
attendance write
response.

==================================================
47. TEACHER ATTENDANCE
==================================================

Guru yang melakukan
scan melalui HP tidak
boleh mengalami request
lambat karena sistem
mengambil data yang
tidak diperlukan.

==================================================
48. MANUAL ATTENDANCE
==================================================

Manual attendance:

gunakan bulk operation
jika sesuai business rule.

Hindari:

1 student
=
1 request

jika satu kelas harus
diisi sekaligus.

==================================================
49. GPS ATTENDANCE
==================================================

GPS flow:

LOCATION
↓
VALIDATION
↓
GEOFENCE
↓
ATTENDANCE
↓
AUDIT.

Jangan melakukan
query yang tidak perlu.

==================================================
50. GPS DATA
==================================================

Jangan menyimpan
location history
berlebihan jika
tidak dibutuhkan.

==================================================
51. MOBILE NETWORK
==================================================

Mobile dapat berada
pada jaringan:

lambat
tidak stabil
putus.

Handle:

timeout
retry
failure
duplicate request.

==================================================
52. RETRY
==================================================

Retry harus:

bounded
safe
idempotent jika diperlukan.

Jangan:

infinite retry.

==================================================
53. OFFLINE
==================================================

Jika aplikasi
memang mendukung
offline attendance:

pastikan:

queue lokal
sync
conflict handling
duplicate prevention.

Jika offline belum
menjadi fitur existing:

JANGAN membuatnya
sebagai fitur baru
dalam task ini.

==================================================
54. FILE UPLOAD
==================================================

Optimalkan:

size
compression
storage
processing.

==================================================
55. IMAGE UPLOAD
==================================================

Gunakan compression
yang sesuai.

Jangan menyimpan
gambar resolusi
sangat tinggi jika
tidak diperlukan.

==================================================
56. FILE STORAGE
==================================================

Jangan menyimpan
file besar di:

database blob

jika architecture
menggunakan object
storage.

Gunakan storage
yang memang sudah
tersedia.

==================================================
57. PDF GENERATION
==================================================

PDF generation besar
jangan membuat API
request menggantung
terlalu lama.

Jika queue existing
digunakan:

gunakan queue.

==================================================
58. WORD GENERATION
==================================================

Dokumen Word besar
gunakan processing
yang sesuai.

==================================================
59. DOCUMENT TEMPLATE
==================================================

Template harus
efisien.

Hindari:

loop tidak terbatas
query database
di dalam template.

==================================================
60. REPORT PERFORMANCE
==================================================

Report harus:

paginated
optimized
indexed.

==================================================
61. LARGE REPORT
==================================================

Untuk laporan besar:

gunakan queue/background
processing jika architecture
mendukung.

==================================================
62. EXPORT
==================================================

Export besar jangan
menggunakan memory
secara berlebihan.

Gunakan streaming/chunking
jika framework mendukung.

==================================================
63. EXCEL EXPORT
==================================================

Jangan load seluruh
dataset ke RAM jika
dataset besar.

==================================================
64. CSV EXPORT
==================================================

Gunakan streaming
untuk dataset besar
jika tersedia.

==================================================
65. PDF REPORT
==================================================

Audit:

memory
CPU
duration
file size.

==================================================
66. WORD REPORT
==================================================

Audit:

memory
CPU
duration
file size.

==================================================
67. QUEUE
==================================================

Gunakan queue untuk
operation yang memang
berat:

document generation
notification
large export
background processing.

==================================================
68. QUEUE PRIORITY
==================================================

Pisahkan job berdasarkan
urgency jika architecture
mendukung.

Contoh:

CRITICAL
NORMAL
BACKGROUND.

==================================================
69. QUEUE RETRY
==================================================

Gunakan:

max attempts
backoff
dead-letter/failed job

sesuai stack.

==================================================
70. QUEUE DUPLICATE
==================================================

Pastikan job yang
seharusnya sekali
tidak diproses
berulang.

==================================================
71. QUEUE MONITORING
==================================================

Monitor:

queue depth
processing time
failed jobs
retry count.

==================================================
72. SCHEDULER
==================================================

Scheduled task harus
efisien.

Jangan menjalankan
query besar terlalu
sering.

==================================================
73. BATCH PROCESSING
==================================================

Gunakan batch/chunk
untuk:

import
export
mass update
report.

==================================================
74. MEMORY
==================================================

Cari:

memory leak
large object
unbounded collection
large response.

==================================================
75. COLLECTION
==================================================

Jangan:

load seluruh tabel
ke memory

jika hanya diperlukan
sebagian data.

==================================================
76. LOOP
==================================================

Audit loop yang:

query database
melakukan API request
menghasilkan file.

Hindari nested expensive
operation.

==================================================
77. API NESTED DATA
==================================================

Jangan mengirim:

student
+
all attendance
+
all documents
+
all payments
+

dalam satu response
jika halaman hanya
membutuhkan summary.

==================================================
78. LAZY LOADING FRONTEND
==================================================

Gunakan lazy loading
untuk halaman berat
jika sesuai architecture.

==================================================
79. CODE SPLITTING
==================================================

Pisahkan bundle
berdasarkan module
jika framework mendukung.

==================================================
80. ASSET OPTIMIZATION
==================================================

Optimalkan:

image
font
JS
CSS
icons.

==================================================
81. FONT
==================================================

Jangan memuat
puluhan font jika
tidak diperlukan.

==================================================
82. IMAGE
==================================================

Gunakan:

appropriate format
compression
responsive sizing.

==================================================
83. MOBILE UI
==================================================

Hindari:

rebuild berlebihan
large widget tree
unnecessary network
request.

==================================================
84. FLUTTER PERFORMANCE
==================================================

Audit:

widget rebuild
list rendering
image loading
network request
state management.

==================================================
85. LIST PERFORMANCE
==================================================

Gunakan lazy list
untuk dataset besar.

Jangan render
ribuan record sekaligus.

==================================================
86. MOBILE CACHE
==================================================

Cache data yang
aman dan memang
dibutuhkan.

Jangan cache
data sensitif
secara sembarangan.

==================================================
87. NETWORK PAYLOAD
==================================================

Minimalkan:

JSON size
image size
unnecessary field.

==================================================
88. API COMPRESSION
==================================================

Jika infrastructure
mendukung:

gunakan compression
untuk payload besar.

==================================================
89. DATABASE READ/WRITE
==================================================

Identifikasi:

read-heavy
write-heavy.

Optimasi sesuai
karakteristiknya.

==================================================
90. WRITE PERFORMANCE
==================================================

Untuk bulk write:

gunakan batch insert/
update jika aman.

==================================================
91. BULK ATTENDANCE
==================================================

Jika guru mengisi
satu kelas:

gunakan efficient
bulk operation.

Pastikan:

transaction
validation
authorization
audit.

==================================================
92. BULK IMPORT
==================================================

Import besar harus:

validate
chunk
transaction strategy
error reporting.

==================================================
93. BULK DELETE
==================================================

Bulk delete harus:

authorized
audited
bounded.

==================================================
94. CONCURRENCY
==================================================

Uji:

multiple users
multiple scanners
multiple teachers
multiple security staff.

==================================================
95. LOAD TEST
==================================================

Gunakan staging/test
environment.

Jangan melakukan
load test agresif
pada production
tanpa prosedur.

==================================================
96. LOAD TEST SCENARIO
==================================================

Uji:

login
student search
QR attendance
manual attendance
GPS attendance
dashboard
report
document generation.

==================================================
97. SPIKE TEST
==================================================

Simulasikan kondisi
traffic tinggi secara
terkendali.

Contoh:

jam masuk sekolah
banyak siswa scan
bersamaan.

==================================================
98. ABSENSI PEAK
==================================================

Prioritas utama:

QR scan
↓
API
↓
DATABASE
↓
ATTENDANCE
↓
AUDIT.

Pastikan tidak terjadi:

timeout
duplicate
lost transaction.

==================================================
99. RATE LIMIT
==================================================

Performance tidak boleh
mengorbankan rate limit
security.

==================================================
100. DATABASE REPLICATION
==================================================

Jika infrastructure
menggunakan replication:

pastikan read/write
consistency sesuai
kebutuhan.

Jangan menambahkan
replication hanya demi
dokumen ini.

==================================================
101. HORIZONTAL SCALING
==================================================

Aplikasi harus dapat
dikembangkan ke
multiple instance
jika architecture
mendukungnya.

Hindari state lokal
yang membuat scaling
mustahil.

==================================================
102. SESSION SCALABILITY
==================================================

Jika multiple server:

session harus menggunakan
mechanism yang konsisten.

==================================================
103. FILE SCALABILITY
==================================================

Jangan bergantung
pada local filesystem
untuk file production
jika architecture
memerlukan shared storage.

==================================================
104. CACHE SCALABILITY
==================================================

Jika multiple instance
menggunakan cache:

gunakan shared cache
jika memang diperlukan
oleh architecture.

==================================================
105. CRON SCALABILITY
==================================================

Pastikan scheduler
tidak menjalankan job
duplicate ketika
multiple instance.

==================================================
106. HEALTH CHECK
==================================================

Performance monitoring
harus terintegrasi
dengan health check
existing.

==================================================
107. OBSERVABILITY
==================================================

Gunakan data dari:

logs
metrics
traces.

Jangan mengandalkan
perasaan "terasa cepat".

==================================================
108. SLOW ENDPOINT
==================================================

Identifikasi endpoint
dengan:

high latency
high error
high traffic.

Prioritaskan optimasi
yang berdampak besar.

==================================================
109. SLOW QUERY
==================================================

Identifikasi query:

high frequency
high duration
high rows scanned.

==================================================
110. REGRESSION
==================================================

Setelah optimasi:

bandingkan:

BEFORE
vs
AFTER.

Jangan menganggap
optimasi berhasil
tanpa pengukuran.

==================================================
111. PERFORMANCE REGRESSION
==================================================

Setiap perubahan
signifikan harus
diperiksa apakah
menyebabkan:

API lebih lambat
query lebih berat
memory naik
CPU naik.

==================================================
112. CACHE REGRESSION
==================================================

Pastikan cache tidak
menyebabkan:

stale data
authorization leak
inconsistent state.

==================================================
113. DATABASE REGRESSION
==================================================

Setelah index/query
optimization:

jalankan regression
test.

==================================================
114. SECURITY REGRESSION
==================================================

Optimasi tidak boleh
melewati:

RBAC
scope
authorization
audit.

==================================================
115. DATA INTEGRITY
==================================================

Performance optimization
tidak boleh menyebabkan:

lost data
duplicate data
partial transaction.

==================================================
116. TIMEOUT
==================================================

Timeout harus
reasonable.

Jangan menyelesaikan
slow query hanya dengan:

timeout = 10 menit.

Perbaiki root cause.

==================================================
117. RETRY STORM
==================================================

Pastikan retry tidak
menghasilkan:

traffic storm
duplicate transaction
database overload.

==================================================
118. CIRCUIT BREAKER
==================================================

Jika architecture
memiliki external
dependency:

gunakan circuit
breaker strategy
jika diperlukan.

Jangan membuat
implementasi duplicate.

==================================================
119. THIRD PARTY
==================================================

Monitor dependency:

payment
email
storage
notification
Google/Firebase
lainnya jika digunakan.

==================================================
120. THIRD PARTY LATENCY
==================================================

External service lambat
tidak boleh membuat
worker/application
mengalami resource
exhaustion.

==================================================
121. BACKGROUND JOB
==================================================

Operation berat:

request
↓
queue
↓
worker
↓
result.

Gunakan hanya jika
architecture memang
mendukung.

==================================================
122. WORKER SCALING
==================================================

Jika queue backlog
meningkat:

analisis:

worker capacity
job duration
dependency bottleneck.

==================================================
123. DATABASE MAINTENANCE
==================================================

Pastikan tersedia
maintenance policy
untuk:

index
statistics
storage
backup.

Ikuti kemampuan
database/infrastructure
yang benar-benar
digunakan.

==================================================
124. LOG PERFORMANCE
==================================================

Logging terlalu banyak
dapat membebani sistem.

Gunakan:

structured logging
level
sampling
rotation.

==================================================
125. AUDIT PERFORMANCE
==================================================

Audit logging tidak
boleh menjadi
bottleneck.

Namun:

JANGAN mematikan
audit hanya demi
performance.

Optimalkan pipeline-nya.

==================================================
126. MONITORING PERFORMANCE
==================================================

Monitoring sendiri
tidak boleh membebani
application secara
berlebihan.

==================================================
127. RESOURCE LIMIT
==================================================

Tetapkan batas:

request
upload
export
query
job
memory.

==================================================
128. ABUSE PROTECTION
==================================================

Protect operation
mahal dari abuse:

PDF
Word
Excel
report
search
upload.

==================================================
129. DATABASE PAGINATION
==================================================

Pastikan pagination
menggunakan query
efficient.

Jangan:

ambil semua data
kemudian paginate
di memory.

==================================================
130. SEARCH PAGINATION
==================================================

Search result harus
dibatasi.

==================================================
131. DASHBOARD QUERY
==================================================

Gunakan aggregation
langsung di database
jika lebih efisien.

==================================================
132. REPORT QUERY
==================================================

Report besar:

hindari query
berulang untuk
setiap record.

==================================================
133. RELATIONSHIP
==================================================

Audit relationship
yang menyebabkan:

N+1
over-fetch
duplicate join.

==================================================
134. ORM PERFORMANCE
==================================================

Audit ORM:

Prisma
Eloquent
atau ORM existing.

Jangan mengganti ORM
hanya karena alasan
performance tanpa
benchmark.

==================================================
135. RAW QUERY
==================================================

Raw SQL hanya digunakan
jika:

benar-benar diperlukan
dan aman.

Jangan mengganti
semua ORM query dengan
raw query.

==================================================
136. API CACHING
==================================================

Cache hanya endpoint
yang sesuai.

Jangan cache:

personalized
permission-sensitive
real-time data

tanpa strategy yang aman.

==================================================
137. CONFIGURATION CACHE
==================================================

Configuration yang
jarang berubah dapat
di-cache jika architecture
mendukung.

==================================================
138. PERMISSION CACHE
==================================================

Jika permission
di-cache:

pastikan invalidation
saat role/permission
berubah.

==================================================
139. STUDENT DATA CACHE
==================================================

Jangan menggunakan
cache siswa sebagai
source of truth.

==================================================
140. ATTENDANCE CACHE
==================================================

Attendance real-time
jangan menggunakan
stale cache sebagai
hasil final.

==================================================
141. FINANCE CACHE
==================================================

Data finansial harus
mengutamakan consistency.

==================================================
142. REPORT CACHE
==================================================

Report yang aman
untuk cache dapat
menggunakan cache
dengan expiration
yang sesuai.

==================================================
143. PERFORMANCE SECURITY
==================================================

Jangan membuka
security vulnerability
demi performance.

Contoh:

menghapus authorization
karena query lambat.

SALAH.

==================================================
144. PERFORMANCE CHECKLIST
==================================================

[ ] Startup
[ ] API
[ ] Database
[ ] Query
[ ] N+1
[ ] Index
[ ] Pagination
[ ] Search
[ ] Cache
[ ] Queue
[ ] Memory
[ ] CPU
[ ] Storage
[ ] PDF
[ ] Word
[ ] Excel
[ ] Mobile
[ ] Flutter
[ ] QR
[ ] GPS
[ ] Attendance
[ ] Dashboard
[ ] Report
[ ] Export
[ ] Concurrency
[ ] Load test
[ ] Monitoring
[ ] Security
[ ] Data integrity.

==================================================
145. FINAL PRODUCTION TEST
==================================================

Uji kondisi:

NORMAL LOAD
HIGH LOAD
PEAK ATTENDANCE
LARGE DATABASE
LARGE REPORT
LARGE EXPORT
MULTIPLE USER
MULTIPLE QR SCAN
MULTIPLE GPS ATTENDANCE.

==================================================
146. FINAL REPORT
==================================================

Hasilkan:

### APPLICATION PERFORMANCE
PASS / FAIL

### API PERFORMANCE
PASS / FAIL

### DATABASE PERFORMANCE
PASS / FAIL

### QUERY PERFORMANCE
PASS / FAIL

### CACHE
PASS / FAIL

### QUEUE
PASS / FAIL

### FILE PROCESSING
PASS / FAIL

### PDF
PASS / FAIL

### WORD
PASS / FAIL

### EXPORT
PASS / FAIL

### MOBILE
PASS / FAIL

### QR ATTENDANCE
PASS / FAIL

### GPS ATTENDANCE
PASS / FAIL

### CONCURRENCY
PASS / FAIL

### LOAD TEST
PASS / FAIL

### SECURITY REGRESSION
PASS / FAIL

### DATA INTEGRITY
PASS / FAIL

### BOTTLENECKS
LIST.

### ROOT CAUSE
LIST.

### REMEDIATION
LIST.

==================================================
147. RELEASE GATE
==================================================

JANGAN menyatakan:

PERFORMANCE READY

jika masih ada:

critical slow query
critical timeout
memory leak
data corruption
duplicate attendance
race condition
N+1 kritis
database overload
export crash
QR peak failure.

==================================================
148. FINAL COMMAND
==================================================

AUDIT SELURUH CODEBASE.

JANGAN LANGSUNG REFACTOR.

Lakukan:

SCAN
↓
MEASURE
↓
IDENTIFY BOTTLENECK
↓
OPTIMIZE
↓
TEST
↓
REGRESSION
↓
VERIFY.

Cari terutama:

N+1 QUERY
SLOW QUERY
MISSING INDEX
UNBOUNDED QUERY
LARGE PAYLOAD
MEMORY LEAK
DUPLICATE REQUEST
RACE CONDITION
QUEUE BACKLOG
SLOW PDF
SLOW WORD
SLOW EXPORT
QR BOTTLENECK
GPS BOTTLENECK
DASHBOARD BOTTLENECK.

Pastikan:

SEMUA CRUD TETAP BERFUNGSI.

SEMUA RBAC TETAP BERFUNGSI.

SEMUA AUDIT TETAP BERFUNGSI.

SEMUA DATABASE RELATION
TETAP AMAN.

SEMUA DATA TETAP KONSISTEN.

JANGAN MEMBUAT FITUR
DUPLIKAT.

JIKA SUDAH ADA PERFORMANCE
ENGINE:

REUSE.

JANGAN MEMBUAT:

PerformanceEngine2
CacheEngineDuplicate
QueryOptimizerDuplicate
ReportPerformanceEngineDuplicate.

==================================================
149. FINAL DECISION
==================================================

Jika seluruh critical
performance blocker
telah diselesaikan:

PERFORMANCE & SCALABILITY
READY.

Jika belum:

PERFORMANCE & SCALABILITY
NOT READY.

Tampilkan:

BOTTLENECK
ROOT CAUSE
AFFECTED MODULE
RISK
REMEDIATION
STATUS.

# END OF 165