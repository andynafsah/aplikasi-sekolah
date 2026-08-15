Lanjutkan project ERP yang sudah ada. Jangan membuat project baru, jangan mengubah arsitektur utama, jangan membuat API/logic duplikat. Implementasikan production-ready menggunakan database PostgreSQL + Prisma + REST API existing.

TARGET:
Bangun ENTERPRISE ACADEMIC YEAR COMMAND CENTER sebagai pusat pengendalian seluruh siklus Tahun Ajaran dan Semester.

ALUR:
TAHUN AJARAN
→ SEMESTER
→ UNIT
→ KURIKULUM
→ MASTER DATA
→ ROMBEL
→ PEMBAGIAN TUGAS
→ JADWAL
→ KBM
→ ABSENSI
→ PENILAIAN
→ LEGER
→ RAPOR
→ ARSIP.

==================================================
1. DASHBOARD
==================================================

Tampilkan:

Tahun Ajaran Aktif
Semester Aktif
Unit
Jenjang
Kurikulum
Jumlah Siswa
Jumlah Guru
Jumlah Pegawai
Jumlah Rombel
Progress Setup
Progress KBM
Progress Absensi
Progress Penilaian
Progress Leger
Progress Rapor
Dokumen Pending
Approval Pending
Warning/Error.

Gunakan data database real-time.

==================================================
2. TAHUN AJARAN
==================================================

CRUD:

Create
View
Edit
Delete
Activate
Deactivate
Archive
Clone
Rollover.

Field:

Nama Tahun Ajaran
Tahun Mulai
Tahun Selesai
Tanggal Mulai
Tanggal Selesai
Status
Unit
Keterangan.

Status:

Draft
Preparation
Active
Completed
Archived.

Tidak boleh ada lebih dari satu Tahun Ajaran aktif dalam scope yang sama.

==================================================
3. SEMESTER
==================================================

Kelola:

Ganjil
Genap
Semester Custom.

Field:

Tahun Ajaran
Nama Semester
Tanggal Mulai
Tanggal Selesai
Status.

Status:

Draft
Active
Completed
Locked
Archived.

Support:

Open Semester
Close Semester
Lock Semester
Reopen dengan permission khusus.

==================================================
4. UNIT & JENJANG
==================================================

Tahun Ajaran dapat dikaitkan dengan:

Yayasan
Sekolah
Pesantren
PKBM
Unit
Jenjang
Program
Jurusan.

Semua mengikuti scope RBAC.

==================================================
5. KURIKULUM
==================================================

Pilih:

Kurikulum Merdeka
K13
Pesantren
Madrasah
PKBM
Custom.

Kurikulum dapat memiliki:

Mapel
KKM/Kriteria Ketuntasan
CP/TP/ATP
Struktur Kurikulum
Jam Pelajaran
Assessment Rule
Rapor Template.

Jangan hardcode kurikulum.

==================================================
6. ROLLOVER TAHUN AJARAN
==================================================

Buat wizard:

Pilih Tahun Ajaran Sumber
→ Pilih Tahun Ajaran Tujuan
→ Review Data
→ Mapping
→ Validasi
→ Execute
→ Summary.

Support:

Naik Kelas
Lulus
Tidak Naik
Siswa Pindahan
Siswa Baru
Siswa Nonaktif
Guru
Pegawai
Mapel
Kurikulum
Rombel.

Jangan mengubah histori tahun ajaran lama.

==================================================
7. STUDENT PROMOTION
==================================================

Status siswa:

Naik Kelas
Lulus
Mengulang
Pindah
Tidak Aktif.

Sistem harus menyimpan riwayat akademik siswa per Tahun Ajaran.

Tidak boleh menghapus histori.

==================================================
8. ROMBEL INTEGRATION
==================================================

Setelah Tahun Ajaran aktif, integrasikan dengan Rombel Engine.

Validasi:

Siswa tanpa rombel
Rombel kosong
Rombel melebihi kapasitas
Siswa ganda
Wali kelas kosong.

==================================================
9. TEACHER ASSIGNMENT
==================================================

Integrasikan dengan Teacher Assignment Engine.

Validasi:

Guru tanpa tugas
Mapel tanpa guru
Kelas tanpa guru
Bentrok assignment
Beban mengajar.

==================================================
10. ACADEMIC CALENDAR
==================================================

Kelola:

Hari Efektif
Libur
Ujian
PTS
PAS
TKA
Kegiatan
Rapat
Pelatihan
Ramadhan
Hari Nasional
Kegiatan Khusus.

Calendar digunakan oleh:

KBM
Attendance
Assessment
Notification
Reporting.

==================================================
11. PERIOD CONTROL
==================================================

Setiap periode memiliki status:

Open
Locked
Closed.

Jika Locked:

Tidak boleh mengubah data akademik tertentu tanpa permission khusus.

Semua override wajib tercatat Audit Trail.

==================================================
12. SETUP CHECKLIST
==================================================

Buat checklist otomatis:

Tahun Ajaran dibuat
Semester dibuat
Kalender dibuat
Kurikulum dipilih
Master siswa valid
Master guru valid
Rombel selesai
Wali kelas selesai
Pembagian tugas selesai
Jadwal selesai
KBM siap
Absensi siap
Penilaian siap
Leger siap
Rapor siap
Arsip siap.

Status:

Not Started
In Progress
Completed
Blocked.

==================================================
13. VALIDATION ENGINE
==================================================

Backend harus melakukan validasi sebelum periode diaktifkan.

Contoh:

Tidak boleh Active jika data wajib belum lengkap.

Tidak boleh KBM aktif jika rombel belum siap.

Tidak boleh penilaian aktif jika struktur mapel belum valid.

Tidak boleh Leger jika assessment belum tersedia.

Tidak boleh Rapor jika Leger belum valid.

Tampilkan error yang jelas dan actionable.

==================================================
14. YEAR-TO-YEAR COMPARISON
==================================================

Bandingkan:

Jumlah Siswa
Jumlah Guru
Jumlah Rombel
Jumlah Mapel
Kehadiran
Nilai
Kelulusan
Rapor
Data Akademik.

Gunakan data historis.

==================================================
15. REPORT
==================================================

Sediakan:

Profil Tahun Ajaran
Rekap Siswa
Rekap Guru
Rekap Rombel
Rekap Kurikulum
Kalender Akademik
Pembagian Tugas
Progress Akademik
Progress Penilaian
Progress Rapor.

Support:

Preview
PDF
Excel
CSV
Print.

Gunakan Unified Document Designer.

==================================================
16. NOTIFICATION
==================================================

Berikan notification ketika:

Tahun Ajaran akan berakhir
Semester akan berakhir
Setup belum selesai
Rombel belum lengkap
Guru belum ditugaskan
Penilaian belum lengkap
Leger belum selesai
Rapor belum selesai.

==================================================
17. RBAC
==================================================

Role:

Super Admin
Yayasan
Kepala Sekolah
Kepala TU
Staff TU
Wakil Kurikulum
Operator
Guru
Wali Kelas.

Menu dan data harus mengikuti:

RBAC
Permission
Assignment
Scope
Policy.

Jangan tampilkan menu Super Admin kepada role lain.

==================================================
18. AUDIT
==================================================

Catat:

Create
Update
Delete
Activate
Deactivate
Rollover
Promotion
Lock
Unlock
Close
Reopen
Archive
Restore.

Simpan:

User
Role
Timestamp
IP
Device
Action
Old Value
New Value.

==================================================
19. DATABASE
==================================================

Semua data harus tersimpan melalui Prisma ORM.

Gunakan:

Transaction
Foreign Key
Unique Constraint
Index
Soft Delete bila sesuai
Audit Trail.

Rollover harus transactional dan aman dari partial failure.

==================================================
20. API
==================================================

Gunakan REST API existing.

Endpoint minimal:

Academic Years
Semesters
Academic Units
Curriculums
Academic Calendars
Rollover
Promotion
Setup Checklist
Period Control
Reports.

Gunakan:

JWT
RBAC
Validation
Pagination
Filtering
Sorting
Error Handling.

==================================================
21. FRONTEND
==================================================

React 18 + TypeScript + Vite.

Tailwind CSS.

Lucide React.

Framer Motion.

UI harus enterprise:

Responsive
Clean
Fast
Accessible
Loading State
Empty State
Error State
Success State
Confirmation Modal
Form Validation
Toast
Skeleton.

Jangan tampilkan data dummy.

==================================================
22. FLUTTER
==================================================

Semua data harus tersedia melalui REST API agar Flutter dapat menggunakan:

Tahun Ajaran Aktif
Semester
Kalender
Jadwal
Rombel
Assignment
Status Akademik.

Jangan membuat logic akademik berbeda di Flutter.

Backend menjadi single source of truth.

==================================================
23. PRODUCTION CLEANUP
==================================================

Hapus:

Dummy Data
Mock Data
Simulation
Demo Mode
Placeholder
Hardcoded Tahun Ajaran
Hardcoded Semester
Hardcoded Kurikulum
Hardcoded Rombel
Hardcoded User
Hardcoded Permission
Developer Menu.

==================================================
24. ACCEPTANCE TEST
==================================================

Uji alur:

Login
→ Role
→ Dashboard
→ Create Tahun Ajaran
→ Create Semester
→ Pilih Unit
→ Pilih Kurikulum
→ Setup Kalender
→ Validasi Master Data
→ Rollover
→ Bentuk Rombel
→ Assignment Guru
→ Aktifkan KBM
→ Aktifkan Absensi
→ Aktifkan Penilaian
→ Leger
→ Rapor
→ Arsip.

Pastikan Tahun Ajaran lama tetap aman dan tidak berubah.

==================================================
FINAL OUTPUT
==================================================

Bangun ENTERPRISE ACADEMIC YEAR COMMAND CENTER sebagai pusat kendali Tahun Ajaran, Semester, Kurikulum, Kalender Akademik, Rollover, Promosi Siswa, Setup Checklist, Period Lock, Validation, Reporting, Notification, RBAC, Audit Trail, dan integrasi penuh dengan Rombel, Teacher Assignment, KBM, Attendance, Assessment, Leger, Rapor, Archive, Web ERP, Flutter, dan REST API.

Semua data harus dinamis, database-driven, API-driven, role-aware, scope-aware, transactional, auditable, dan production-ready.

Tidak boleh ada dummy, mock, simulasi, hardcoded, atau fitur yang hanya berupa tampilan UI.
Semua tombol, CRUD, modal, API, database, workflow, validasi, laporan, export, print, dan permission harus benar-benar berfungsi.