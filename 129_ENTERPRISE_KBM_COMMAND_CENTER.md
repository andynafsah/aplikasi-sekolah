Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur utama.
JANGAN membuat modul duplikat.
JANGAN membuat dummy/mock/simulasi.
JANGAN hardcode data.
Gunakan PostgreSQL + Prisma + REST API existing.
Implementasikan production-ready.

==================================================
TARGET
==================================================

Bangun ENTERPRISE KBM COMMAND CENTER.

KBM harus menggunakan data resmi:

TAHUN AJARAN
→ SEMESTER
→ KURIKULUM
→ ROMBEL
→ SISWA
→ GURU
→ MAPEL
→ TEACHER ASSIGNMENT
→ JADWAL
→ KBM.

Tidak boleh guru memasukkan ulang kelas/mapel yang sudah tersedia dari Assignment Engine.

==================================================
1. DASHBOARD KBM
==================================================

Tampilkan:

Jadwal Hari Ini
KBM Hari Ini
Guru Mengajar
Kelas Aktif
KBM Selesai
KBM Belum Dimulai
KBM Terlewat
Jurnal Belum Diisi
Absensi Belum Diisi
Tugas Belum Dinilai
Materi Belum Diinput.

Filter:

Tahun Ajaran
Semester
Unit
Jenjang
Tanggal
Guru
Rombel
Mapel.

==================================================
2. JADWAL KBM
==================================================

Tampilkan jadwal dari Scheduler Engine.

Data:

Guru
Mapel
Rombel
Ruangan
Hari
Jam Mulai
Jam Selesai
Jam Pelajaran
Semester
Tahun Ajaran.

Status:

Scheduled
Ongoing
Completed
Cancelled
Rescheduled.

Jangan membuat jadwal hardcoded.

==================================================
3. HALAMAN "KBM SAYA"
==================================================

Untuk guru:

Hari Ini
Jadwal Saya
Kelas Saya
Mapel Saya
KBM Aktif
Riwayat KBM
Jurnal
Materi
Tugas
Assessment
Absensi.

Guru hanya melihat assignment miliknya.

==================================================
4. MULAI KBM
==================================================

Guru membuka jadwal:

→ Detail KBM
→ Mulai KBM
→ Konfirmasi kelas
→ Absensi
→ Materi
→ Jurnal
→ Tugas/Assessment
→ Selesai KBM.

Simpan waktu:

Start Time
End Time
Duration.

==================================================
5. JURNAL MENGAJAR
==================================================

Guru dapat mengisi:

Tanggal
Materi
Tujuan Pembelajaran
Kegiatan
Metode
Catatan
Tugas
Keterangan.

Support:

Draft
Submit
Edit sesuai policy
Lock setelah periode ditutup.

==================================================
6. MATERI
==================================================

Guru dapat:

Create
Edit
Delete
Publish
Archive.

Jenis:

Text
File
PDF
Video URL
Link
Document
Image.

Materi terhubung dengan:

Mapel
Rombel
Pertemuan
Tahun Ajaran
Semester.

==================================================
7. TUGAS
==================================================

Guru dapat membuat:

Tugas
PR
Latihan
Proyek
Quiz.

Field:

Judul
Deskripsi
Tanggal Mulai
Deadline
Bobot
Lampiran
Instruksi.

Terhubung dengan Assessment Engine.

==================================================
8. ABSENSI KBM
==================================================

Integrasikan Smart Attendance.

Guru dapat melakukan:

Scan QR Kartu Pelajar
Manual Attendance
Bulk Attendance.

Status:

Hadir
Izin
Sakit
Alpa
Terlambat
Dispensasi.

Guru hanya dapat melakukan absensi untuk rombel dan jadwal yang ditugaskan.

==================================================
9. SCAN QR SISWA
==================================================

Saat guru memilih Scan:

Buka kamera
→ Scan QR Kartu Pelajar
→ Validasi siswa
→ Validasi rombel
→ Validasi jadwal
→ Simpan presensi.

Jika siswa bukan anggota rombel:

Tolak.

Jika QR tidak valid:

Tolak.

Jika sudah hadir:

Tampilkan status sudah hadir.

==================================================
10. MANUAL ATTENDANCE
==================================================

Wali kelas/guru yang memiliki permission dapat mengubah absensi secara manual.

Wajib:

Alasan perubahan
Timestamp
User
Audit Trail.

Jika policy membutuhkan approval:

Pending Approval.

==================================================
11. PERTEMUAN KBM
==================================================

Setiap KBM menghasilkan record:

Tanggal
Guru
Mapel
Rombel
Jadwal
Materi
Jurnal
Absensi
Assessment
Status.

Jangan membuat record duplikat untuk jadwal/pertemuan yang sama.

==================================================
12. ASSESSMENT
==================================================

Guru dapat membuat penilaian dari KBM:

Quiz
Tugas
Ulangan
Praktik
Proyek
PTS
PAS
Custom.

Assessment terhubung dengan:

Siswa
Rombel
Mapel
Guru
Kurikulum
Semester.

==================================================
13. MONITORING GURU
==================================================

Kepala Sekolah/TU/Wakil Kurikulum dapat melihat:

Guru aktif mengajar
Guru belum memulai
Jurnal belum selesai
Absensi belum selesai
KBM dibatalkan
KBM terlambat
Progress KBM.

==================================================
14. MONITORING ROMBEL
==================================================

Per kelas:

Jadwal
Guru
Mapel
KBM
Absensi
Materi
Tugas
Assessment
Progress.

==================================================
15. KBM CALENDAR
==================================================

Calendar:

Hari
Minggu
Bulan.

Tampilkan:

Jadwal
KBM
Ujian
Kegiatan
Libur
Perubahan jadwal.

Gunakan Academic Calendar.

==================================================
16. RESCHEDULE
==================================================

Support perubahan jadwal dengan permission.

Wajib menyimpan:

Jadwal Lama
Jadwal Baru
Alasan
User
Waktu
Approval.

Notification otomatis kepada guru dan pihak terkait.

==================================================
17. CANCEL KBM
==================================================

Guru tidak boleh menghapus KBM yang sudah tercatat.

Gunakan:

Cancel

dengan:

Alasan
User
Timestamp
Audit.

==================================================
18. REPORT
==================================================

Laporan:

Rekap KBM Guru
Rekap KBM Rombel
Rekap Mapel
Jurnal Mengajar
Materi
Absensi KBM
KBM Terlaksana
KBM Tidak Terlaksana
KBM Dibatalkan
Progress Guru.

Export:

PDF
Excel
CSV
Print.

Gunakan Unified Document Designer.

==================================================
19. NOTIFICATION
==================================================

Notification:

Jadwal KBM
KBM akan dimulai
KBM terlewat
Absensi belum selesai
Jurnal belum selesai
Tugas mendekati deadline
Assessment belum dinilai
Perubahan jadwal
Pembatalan KBM.

==================================================
20. RBAC
==================================================

Guru:

KBM sendiri.

Wali Kelas:

KBM rombel yang ditugaskan.

Wakil Kurikulum:

Monitoring KBM.

Kepala Sekolah:

Monitoring dan laporan.

TU:

Administrasi dan laporan sesuai permission.

Super Admin:

Full access.

Jangan tampilkan menu atau data di luar permission.

==================================================
21. DATABASE
==================================================

Gunakan Prisma.

Relasi minimal:

AcademicYear
Semester
Curriculum
Unit
Rombel
Student
Teacher
Subject
TeacherAssignment
Schedule
KBMSession
KBMJournal
KBMMaterial
KBMAssignment
Attendance
Assessment.

Gunakan:

Foreign Key
Unique Constraint
Index
Transaction
Audit Trail
Soft Delete sesuai kebutuhan.

==================================================
22. API
==================================================

Gunakan REST API existing.

Resource:

/kbm
/kbm/sessions
/kbm/journal
/kbm/materials
/kbm/assignments
/kbm/attendance
/kbm/calendar
/kbm/reports.

Semua menggunakan:

JWT
RBAC
Permission
Scope
Validation
Pagination
Filter
Sort
Search
Error Handling.

==================================================
23. FLUTTER
==================================================

Flutter menggunakan API yang sama.

Guru dapat:

Login
→ Dashboard
→ KBM Saya
→ Jadwal
→ Mulai KBM
→ Scan QR
→ Absensi
→ Jurnal
→ Materi
→ Tugas
→ Assessment
→ Selesai KBM.

Jangan membuat business logic berbeda di Flutter.

==================================================
24. FRONTEND WEB
==================================================

React 18 + TypeScript + Vite.

Tailwind CSS.
Lucide React.
Framer Motion.

Support:

Dashboard
Calendar
Data Table
Detail
Modal
Drawer
Form
QR Scanner
Filter
Search
Report
Print.

Semua tombol harus benar-benar bekerja.

==================================================
25. AUDIT
==================================================

Catat:

Start KBM
Finish KBM
Create Journal
Update Journal
Submit Journal
Create Material
Create Assignment
Attendance
Manual Attendance
Cancel
Reschedule
Assessment.

==================================================
26. PRODUCTION CLEANUP
==================================================

Hapus:

Dummy
Mock
Simulation
Demo
Placeholder
Hardcoded Guru
Hardcoded Jadwal
Hardcoded Mapel
Hardcoded Rombel
Hardcoded Siswa
Developer Menu.

==================================================
27. ACCEPTANCE TEST
==================================================

Test:

Login Guru
→ Dashboard
→ KBM Saya
→ Jadwal Hari Ini
→ Buka KBM
→ Mulai KBM
→ Scan QR Siswa
→ Validasi Siswa
→ Simpan Absensi
→ Isi Jurnal
→ Upload Materi
→ Buat Tugas
→ Selesai KBM
→ Monitoring
→ Report
→ PDF
→ Excel
→ Print.

Pastikan data langsung tersimpan ke PostgreSQL melalui REST API.

==================================================
FINAL OUTPUT
==================================================

Bangun ENTERPRISE KBM COMMAND CENTER sebagai pusat kegiatan belajar mengajar harian.

KBM harus sepenuhnya terintegrasi dengan Tahun Ajaran, Kurikulum, Rombel, Student Engine, Teacher Assignment, Schedule, Smart Attendance, Assessment, Auto Leger, Rapor, Notification, Archive, Flutter dan Web ERP.

Tidak boleh ada dummy, mock, simulasi, hardcoded data, CRUD palsu, tombol tidak berfungsi, atau logic yang hanya berjalan di frontend.

Semua fitur harus production-ready.