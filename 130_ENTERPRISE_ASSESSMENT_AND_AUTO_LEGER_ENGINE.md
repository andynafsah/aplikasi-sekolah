Lanjutkan ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur utama.
JANGAN membuat modul duplikat.
JANGAN menggunakan dummy/mock/simulasi.
JANGAN hardcode data.
Gunakan PostgreSQL + Prisma + REST API existing.
Implementasikan production-ready.

==================================================
TARGET
==================================================

Bangun ENTERPRISE ASSESSMENT & AUTO LEGER ENGINE.

ALUR:

TAHUN AJARAN
→ SEMESTER
→ KURIKULUM
→ ROMBEL
→ SISWA
→ GURU
→ MAPEL
→ KBM
→ ASSESSMENT
→ NILAI
→ VALIDASI
→ KKM
→ PREDIKAT
→ RATA-RATA
→ RANKING
→ KETUNTASAN
→ LEGER
→ RAPOR.

Tidak boleh ada input ulang data siswa, guru, rombel, mapel, atau assignment.

==================================================
1. ASSESSMENT COMMAND CENTER
==================================================

Dashboard:

Assessment Aktif
Assessment Selesai
Nilai Belum Diisi
Nilai Belum Lengkap
Nilai Sudah Lengkap
Belum Dinilai
Remedial
Pengayaan
Leger Belum Selesai
Approval Pending.

Filter:

Tahun Ajaran
Semester
Unit
Jenjang
Kurikulum
Rombel
Guru
Mapel
Jenis Assessment
Tanggal
Status.

==================================================
2. JENIS PENILAIAN
==================================================

Support configurable:

Tugas
Quiz
Latihan
UH
Ulangan
Praktik
Proyek
Portofolio
PTS
PAS
Ujian
TKA
Remedial
Pengayaan
Custom.

Jangan hardcode formula penilaian.

==================================================
3. ASSESSMENT
==================================================

Field:

Tahun Ajaran
Semester
Unit
Kurikulum
Guru
Mapel
Rombel
Jenis
Judul
Tanggal
Bobot
KKM
Status.

Status:

Draft
Open
Submitted
Reviewed
Approved
Locked
Archived.

==================================================
4. INPUT NILAI
==================================================

Guru hanya dapat menginput nilai berdasarkan assignment valid.

Tampilkan daftar siswa dari Rombel database.

Input:

Nilai
Catatan
Status
Remedial
Pengayaan.

Support:

Inline Input
Bulk Input
Import
Copy Score
Clear Score dengan permission.

Validasi:

Range nilai
Siswa valid
Assignment valid
Periode valid.

==================================================
5. FORMULA ENGINE
==================================================

Gunakan Formula Engine terpusat.

Support:

Weighted Average
Simple Average
Custom Formula
Maximum
Minimum
Percentage
Conversion.

Contoh:

Nilai Akhir =
Σ(nilai × bobot) / Σ bobot.

Formula harus tersimpan di database/configuration.

Jangan menaruh formula utama hanya di frontend.

==================================================
6. KKM / KETUNTASAN
==================================================

KKM/Kriteria Ketuntasan harus configurable per:

Kurikulum
Unit
Jenjang
Mapel
Tingkat
Tahun Ajaran.

Status:

Tuntas
Belum Tuntas.

Jangan hardcode angka KKM.

==================================================
7. PREDIKAT
==================================================

Support configurable range:

A
B
C
D

atau predikat custom.

Mapping nilai → predikat harus berasal dari configuration.

==================================================
8. REMEDIAL & PENGAYAAN
==================================================

Jika nilai belum tuntas:

Tandai Remedial.

Guru dapat memasukkan:

Nilai Remedial
Tanggal
Materi
Catatan.

Jika memenuhi aturan ketuntasan, update status secara otomatis.

Pengayaan juga dapat dicatat.

==================================================
9. AUTO CALCULATION
==================================================

Sistem otomatis menghitung:

Nilai Akhir
Rata-rata
Predikat
KKM
Ketuntasan
Nilai Remedial
Status.

Perubahan nilai harus otomatis memperbarui hasil terkait.

==================================================
10. AUTO LEGER
==================================================

Leger otomatis dibuat berdasarkan:

Tahun Ajaran
Semester
Unit
Jenjang
Rombel
Siswa
Mapel
Assessment
Formula
KKM.

Tidak boleh mengetik leger secara manual.

==================================================
11. LEGER PER KELAS
==================================================

Tampilkan:

No
NIS
NISN
Nama Siswa
Mapel
Nilai
KKM
Predikat
Status
Rata-rata
Ranking.

Support:

Filter
Sort
Search
Print
PDF
Excel
CSV.

==================================================
12. LEGER PER SISWA
==================================================

Tampilkan seluruh nilai siswa:

Per semester
Per mapel
Per tahun ajaran
Nilai akhir
KKM
Predikat
Ketuntasan
Rata-rata
Ranking.

==================================================
13. RANKING
==================================================

Ranking dapat dihitung berdasarkan konfigurasi lembaga.

Support:

Rata-rata
Nilai Akhir
Weighted Score.

Ranking harus:

Deterministic
Consistent
Tie-aware.

Jangan hardcode metode ranking.

==================================================
14. APPROVAL
==================================================

Workflow:

Draft
→ Submitted
→ Reviewed
→ Approved
→ Locked.

Guru submit nilai.

Wali kelas/Wakil Kurikulum melakukan review sesuai permission.

Nilai yang sudah Locked tidak dapat diubah biasa.

Perubahan setelah Lock wajib menggunakan override permission dan audit trail.

==================================================
15. MONITORING NILAI
==================================================

Dashboard pimpinan:

Guru sudah input
Guru belum input
Mapel selesai
Mapel belum selesai
Rombel selesai
Rombel belum selesai.

Progress percentage.

==================================================
16. IMPORT NILAI
==================================================

Support Excel/CSV.

Proses:

Upload
→ Parse
→ Validate
→ Preview
→ Confirm
→ Transaction.

Tolak:

Siswa tidak ditemukan
Mapel tidak valid
Assignment tidak valid
Nilai invalid
Duplicate.

Jangan memasukkan data invalid.

==================================================
17. REPORT
==================================================

Laporan:

Daftar Nilai
Rekap Nilai
Leger
Ranking
Ketuntasan
Remedial
Pengayaan
Progress Guru
Progress Rombel
Progress Mapel.

Export:

PDF
Excel
CSV
Print.

Gunakan Unified Document Designer.

==================================================
18. INTEGRASI RAPOR
==================================================

Rapor harus mengambil data langsung dari Auto Leger.

Data:

Nilai
Predikat
Deskripsi
Ketuntasan
Ranking jika digunakan
Attendance
Catatan.

Tidak boleh input ulang nilai ke rapor.

==================================================
19. INTEGRASI KBM
==================================================

Assessment dapat dibuat dari:

KBM Session
Jurnal
Materi
Tugas.

Guru hanya melihat assessment sesuai KBM/assignment miliknya.

==================================================
20. INTEGRASI ABSENSI
==================================================

Leger/Rapor dapat mengambil rekap:

Hadir
Sakit
Izin
Alpa
Terlambat.

Gunakan Attendance Engine existing.

==================================================
21. RBAC
==================================================

Guru:

Input nilai assignment sendiri.

Wali Kelas:

Monitoring nilai rombel.

Wakil Kurikulum:

Review/approval.

Kepala Sekolah:

Monitoring/report.

TU:

Administrasi/report sesuai permission.

Super Admin:

Full access.

Jangan tampilkan fitur Super Admin kepada role lain.

==================================================
22. DATABASE
==================================================

Gunakan Prisma.

Relasi:

AcademicYear
Semester
Curriculum
Unit
Rombel
Student
Teacher
Subject
TeacherAssignment
KBMSession
Assessment
AssessmentItem
StudentScore
GradingRule
KKMRule
GradeScale
Remedial
Enrichment
LegerSnapshot
AssessmentApproval.

Gunakan:

Foreign Key
Unique Constraint
Index
Transaction
Audit Trail.

==================================================
23. SNAPSHOT LEGER
==================================================

Leger yang sudah finalized dapat dibuat snapshot.

Snapshot menyimpan:

Periode
Siswa
Mapel
Nilai
KKM
Predikat
Ketuntasan
Ranking
Formula Version.

Jika formula berubah, histori leger lama tidak berubah.

==================================================
24. API
==================================================

Gunakan REST API existing.

Minimal:

/assessments
/assessment-types
/scores
/grading-rules
/kkm
/remedial
/enrichment
/leger
/leger/students
/leger/classes
/leger/reports
/assessment-approvals.

Semua:

JWT
RBAC
Permission
Scope
Validation
Pagination
Filter
Sort
Error Handling.

==================================================
25. FLUTTER
==================================================

Flutter menggunakan API yang sama.

Guru dapat:

Login
→ Assessment
→ Pilih KBM
→ Pilih Rombel
→ Input Nilai
→ Simpan
→ Submit.

Wali kelas dapat:

Monitoring nilai rombel.

Jangan membuat formula berbeda di Flutter.

Backend adalah single source of truth.

==================================================
26. FRONTEND
==================================================

React 18 + TypeScript + Vite.

Tailwind CSS.
Lucide React.
Framer Motion.

UI:

Assessment Dashboard
Score Table
Inline Editing
Bulk Input
Filter
Search
Detail
Approval
Leger
Report
Preview.

Gunakan loading, empty, error, success state.

Semua CRUD/modal/tombol harus berfungsi.

==================================================
27. AUDIT TRAIL
==================================================

Catat:

Create Assessment
Update Assessment
Input Score
Update Score
Delete Score
Submit
Review
Approve
Lock
Unlock
Remedial
Import
Export
Generate Leger
Finalize Leger.

Simpan:

User
Role
Timestamp
IP
Device
Old Value
New Value.

==================================================
28. PRODUCTION CLEANUP
==================================================

Hapus:

Dummy
Mock
Simulation
Demo
Placeholder
Hardcoded Nilai
Hardcoded KKM
Hardcoded Predikat
Hardcoded Ranking
Hardcoded Siswa
Hardcoded Mapel
Hardcoded Guru
Hardcoded Rombel.

==================================================
29. ACCEPTANCE TEST
==================================================

Test:

Login Guru
→ Dashboard
→ KBM
→ Buat Assessment
→ Pilih Rombel
→ Sistem mengambil siswa otomatis
→ Input Nilai
→ Simpan
→ Submit
→ Review
→ Approve
→ Formula dihitung
→ KKM dihitung
→ Predikat dihitung
→ Ketuntasan dihitung
→ Leger otomatis
→ Ranking
→ Finalize
→ Rapor mengambil data otomatis.

Test perubahan nilai sebelum Lock.

Test perubahan setelah Lock.

Test Remedial.

Test Import Excel.

Test PDF.

Test Excel.

Test CSV.

Test Print.

==================================================
FINAL OUTPUT
==================================================

Bangun ENTERPRISE ASSESSMENT & AUTO LEGER ENGINE.

Assessment menjadi sumber nilai.
Formula Engine menjadi sumber perhitungan.
KKM Engine menjadi sumber ketuntasan.
Auto Leger menjadi sumber rekap nilai.
Rapor mengambil data dari Leger.

Tidak boleh ada input nilai ganda.

Tidak boleh ada data dummy/mock/simulasi.

Tidak boleh ada hardcoded formula, KKM, ranking, predikat, atau data akademik.

Semua harus database-driven, API-driven, transactional, auditable, role-aware, scope-aware, dan production-ready.

Semua fitur harus benar-benar bekerja di Web ERP dan dapat digunakan Flutter melalui REST API yang sama.