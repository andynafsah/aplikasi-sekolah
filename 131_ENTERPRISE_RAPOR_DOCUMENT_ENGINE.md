Lanjutkan project ERP yang sudah ada.

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

Bangun ENTERPRISE RAPOR & DOCUMENT ENGINE sebagai
pusat penerbitan rapor digital dan dokumen akademik.

ALUR UTAMA:

TAHUN AJARAN
→ SEMESTER
→ KURIKULUM
→ ROMBEL
→ SISWA
→ KBM
→ ABSENSI
→ ASSESSMENT
→ NILAI
→ LEGER
→ RAPOR
→ VERIFIKASI
→ PDF / WORD
→ PRINT
→ ARSIP.

RAPOR HARUS MENGAMBIL DATA DARI DATABASE DAN AUTO LEGER.

JANGAN meminta guru/TU memasukkan ulang nilai yang sudah tersedia.

==================================================
1. RAPOR COMMAND CENTER
==================================================

Dashboard:

Total Siswa
Rapor Draft
Rapor Diproses
Rapor Belum Lengkap
Rapor Menunggu Review
Rapor Approved
Rapor Published
Rapor Locked
Rapor Archived.

Progress:

Nilai
Absensi
Catatan
Ekstrakurikuler
Kepribadian
Deskripsi
Leger
Rapor.

Filter:

Tahun Ajaran
Semester
Unit
Jenjang
Kurikulum
Rombel
Wali Kelas
Status.

==================================================
2. JENIS RAPOR
==================================================

Support konfigurasi:

Rapor Semester
Rapor Tengah Semester
Rapor Akhir Tahun
Rapor Kelulusan
Rapor Tahfidz
Rapor Diniyah
Rapor PKBM
Rapor Custom.

Jenis rapor tidak boleh hardcoded.

==================================================
3. KURIKULUM
==================================================

Rapor harus mengikuti kurikulum yang dipilih.

Support:

Kurikulum Merdeka
K13
Pesantren
Madrasah
PKBM
Custom.

Setiap kurikulum dapat mempunyai:

Struktur Nilai
Mapel
KKM
Predikat
Deskripsi
Kegiatan
Ekstrakurikuler
Absensi
Catatan Wali Kelas.

==================================================
4. RAPOR TEMPLATE DESIGNER
==================================================

Gunakan Unified Document Designer yang sudah ada.

Template dapat:

Create
Edit
Duplicate
Clone
Preview
Publish
Archive
Restore
Version.

Template dapat dikaitkan dengan:

Yayasan
Unit
Jenjang
Kurikulum
Tahun Ajaran
Jenis Rapor.

==================================================
5. DESIGNER
==================================================

Support:

Drag & Drop
Move
Resize
Alignment
Grid
Ruler
Zoom
Layer
Lock
Hide
Duplicate
Delete
Undo
Redo.

Komponen:

Text
Rich Text
Table
Image
Logo
Student Photo
QR
Barcode
Line
Shape
Signature
Stamp
Dynamic Field
Dynamic Table
Page Break
Header
Footer.

==================================================
6. KERTAS
==================================================

Support:

A4
F4/Folio
Legal
Letter
A5
Custom.

Konfigurasi:

Width
Height
Orientation
Margin
Header
Footer.

Orientation:

Portrait
Landscape.

==================================================
7. FONT
==================================================

Support:

Arial
Times New Roman
Calibri
Cambria
Georgia
Tahoma
Verdana
Courier New.

Konfigurasi:

Font Size
Bold
Italic
Underline
Alignment
Line Height
Letter Spacing
Paragraph Spacing.

==================================================
8. KOP RAPOR
==================================================

Kop harus dinamis.

Data dari lembaga:

Logo Yayasan
Logo Sekolah
Nama Yayasan
Nama Lembaga
Alamat
Kabupaten/Kota
Provinsi
Kode Pos
Telepon
Email
Website
NPSN/NSM/NSS jika tersedia.

Tidak boleh hardcode.

==================================================
9. IDENTITAS SISWA
==================================================

Field dinamis:

Nama
NIS
NISN
NIK jika tersedia
Tempat Lahir
Tanggal Lahir
Jenis Kelamin
Agama
Kelas
Rombel
Fase
Program
Jurusan
Nama Orang Tua/Wali
Alamat.

Data berasal dari Student Engine.

==================================================
10. NILAI RAPOR
==================================================

Nilai mengambil dari Auto Leger.

Tampilkan:

Mapel
Nilai Akhir
Predikat
Deskripsi
KKM
Ketuntasan.

Jangan membuat kalkulasi nilai kedua di modul Rapor.

Auto Leger adalah source of truth.

==================================================
11. DESKRIPSI OTOMATIS
==================================================

Buat Description Engine.

Deskripsi dapat dibuat berdasarkan:

Nilai
CP/TP/ATP
Kompetensi
Kategori
Predikat.

Support:

Template Description
Dynamic Description
Manual Override dengan permission.

Contoh konsep:

Nilai tinggi
→ deskripsi capaian optimal.

Nilai sedang
→ deskripsi capaian berkembang.

Nilai rendah
→ deskripsi perlu peningkatan.

Aturan harus configurable.

==================================================
12. ABSENSI
==================================================

Rapor mengambil data Attendance Engine.

Tampilkan:

Sakit
Izin
Alpa
Terlambat jika digunakan.

Tidak boleh input ulang.

==================================================
13. EKSTRAKURIKULER
==================================================

Support:

Nama Kegiatan
Keikutsertaan
Predikat
Deskripsi
Pembina
Catatan.

Terhubung dengan Student/Activity Engine.

==================================================
14. PRESTASI
==================================================

Support:

Akademik
Non-Akademik
Tahfidz
Olahraga
Seni
Organisasi
Custom.

Field:

Nama
Tingkat
Peringkat
Tanggal
Penyelenggara
Keterangan.

==================================================
15. KEPRIBADIAN / CATATAN
==================================================

Wali kelas dapat mengisi:

Catatan Wali Kelas
Perkembangan Siswa
Saran
Catatan Akademik
Catatan Khusus.

Semua perubahan diaudit.

==================================================
16. KENAIKAN KELAS
==================================================

Rapor akhir tahun dapat menampilkan:

Naik Kelas
Tidak Naik
Lulus
Mengulang
Pindah.

Status mengambil dari Academic Year Engine.

Jangan membuat status terpisah.

==================================================
17. RAPOR WORKFLOW
==================================================

Workflow:

Draft
→ Data Collection
→ Validation
→ Review
→ Approved
→ Published
→ Locked
→ Archived.

Validation otomatis:

Nilai lengkap
Leger finalized
Absensi tersedia
Identitas lengkap
Template valid
Tanda tangan tersedia.

==================================================
18. BULK GENERATE
==================================================

Support:

Generate 1 siswa
Generate 1 rombel
Generate seluruh unit
Generate seluruh jenjang.

Proses:

Select
→ Validate
→ Preview
→ Generate
→ Verify
→ Publish.

Gunakan queue/background job bila jumlah besar.

==================================================
19. PDF ENGINE
==================================================

Generate PDF berdasarkan template yang sama dengan Preview.

Pertahankan:

Kop
Logo
Font
Margin
Table
Spacing
Page Break
Signature
Stamp
QR
Header
Footer.

PDF harus siap cetak resmi.

==================================================
20. WORD ENGINE
==================================================

Export DOCX.

Pertahankan semaksimal mungkin:

Ukuran kertas
Margin
Font
Logo
Kop
Table
Paragraph
Signature
Header
Footer.

Jika terdapat elemen yang tidak mendukung DOCX, gunakan fallback yang aman tanpa kehilangan informasi.

==================================================
21. PRINT ENGINE
==================================================

Support:

Preview
Browser Print
Print PDF
Single Print
Bulk Print.

Pastikan hasil Print identik dengan Preview.

==================================================
22. QR VERIFICATION
==================================================

Setiap rapor yang dipublish dapat mempunyai QR unik.

QR mengarah ke:

Document Verification.

Tampilkan:

Nomor Dokumen
Nama Siswa
Rombel
Tahun Ajaran
Semester
Tanggal Terbit
Status.

Status:

Valid
Revised
Revoked
Archived.

Jangan menampilkan data sensitif berlebihan pada halaman publik.

==================================================
23. REVISI RAPOR
==================================================

Jika terjadi koreksi setelah Published:

Buat Revision.

Jangan menimpa histori tanpa jejak.

Simpan:

Version
Old Document
New Document
Reason
User
Timestamp
Approval.

QR versi lama dapat berubah status menjadi:

Revised.

==================================================
24. TANDA TANGAN
==================================================

Support:

Kepala Sekolah
Wali Kelas
Kepala Madrasah
Kepala PKBM
Pimpinan Lembaga
Custom.

Data:

Nama
Jabatan
NIP
NIY
Signature
Stamp.

Posisi diatur melalui Template Designer.

==================================================
25. RAPOR DIGITAL
==================================================

Siswa/orang tua dapat melihat rapor sesuai permission.

Support:

Preview
Download PDF
Download DOCX jika diizinkan
Verification QR.

==================================================
26. RAPOR WALI KELAS
==================================================

Wali kelas dapat:

Melihat daftar siswa
Memeriksa nilai
Melihat absensi
Mengisi catatan
Memeriksa ekstrakurikuler
Memeriksa prestasi
Preview rapor
Submit Review.

Wali kelas tidak boleh mengubah nilai sumber dari Auto Leger kecuali memiliki permission khusus melalui Assessment Engine.

==================================================
27. REVIEW KEPALA SEKOLAH
==================================================

Kepala sekolah dapat:

Review
Approve
Reject
Return
Publish.

Jika Reject:

Wajib alasan.

==================================================
28. MONITORING
==================================================

Tampilkan progress:

Rapor belum dibuat
Rapor belum lengkap
Rapor review
Rapor approved
Rapor published
Rapor downloaded.

Per:

Unit
Jenjang
Rombel
Wali Kelas.

==================================================
29. REPORT
==================================================

Sediakan:

Rekap Status Rapor
Rekap Rapor per Rombel
Rapor per Siswa
Daftar Belum Lengkap
Daftar Belum Review
Daftar Published
Daftar Archived.

Export:

PDF
Excel
CSV
Print.

==================================================
30. DATABASE
==================================================

Gunakan Prisma.

Relasi minimal:

AcademicYear
Semester
Unit
Curriculum
Rombel
Student
Parent
Teacher
Subject
Assessment
StudentScore
Leger
ReportCard
ReportCardTemplate
ReportCardVersion
ReportCardItem
ReportCardApproval
ReportCardSignature
ReportCardVerification
ReportCardArchive.

Gunakan:

Foreign Key
Unique Constraint
Index
Transaction
Soft Delete
Audit Trail.

==================================================
31. SNAPSHOT
==================================================

Saat rapor finalized:

Buat immutable snapshot.

Snapshot harus menyimpan data yang digunakan untuk rapor:

Identitas
Nilai
Predikat
Deskripsi
KKM
Ketuntasan
Absensi
Ekstrakurikuler
Prestasi
Catatan
Status kenaikan.

Jika data sumber berubah setelah rapor finalized, dokumen lama tetap konsisten.

==================================================
32. API
==================================================

Gunakan REST API existing.

Minimal:

/report-cards
/report-card-templates
/report-card-designer
/report-card/generate
/report-card/preview
/report-card/publish
/report-card/approve
/report-card/revise
/report-card/verify
/report-card/archive
/report-card/reports.

Semua endpoint:

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
33. FLUTTER
==================================================

Flutter menggunakan API yang sama.

Guru:

Login
→ Rapor
→ Pilih Rombel
→ Review
→ Catatan
→ Submit.

Wali Kelas:

Review Rapor
→ Catatan
→ Preview
→ Submit.

Kepala Sekolah:

Review
→ Approve
→ Publish.

Siswa/Orang Tua:

Lihat Rapor
→ Preview
→ Download
→ Verify.

Jangan membuat business logic berbeda di Flutter.

==================================================
34. RBAC
==================================================

Role:

Super Admin
Yayasan
Kepala Sekolah
Kepala TU
Wakil Kurikulum
Staff TU
Operator
Guru
Wali Kelas
Orang Tua
Siswa.

Permission harus granular.

Contoh:

report_card.view
report_card.create
report_card.update
report_card.review
report_card.approve
report_card.publish
report_card.download
report_card.revise
report_card.archive
report_card.verify
template.manage.

Jangan tampilkan pengaturan Super Admin kepada role lain.

==================================================
35. AUDIT TRAIL
==================================================

Catat:

Create
Update
Preview
Generate
Download
Print
Submit
Review
Approve
Reject
Publish
Revise
Revoke
Archive
Restore
Verify.

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
36. FRONTEND
==================================================

React 18 + TypeScript + Vite.

Tailwind CSS.
Lucide React.
Framer Motion.

UI:

Dashboard
Report Table
Student Report Detail
Template Designer
Preview
Approval Panel
Revision Panel
Verification
Archive
Reports.

Gunakan:

Loading State
Empty State
Error State
Success State
Skeleton
Confirmation Modal
Toast.

Semua tombol harus benar-benar berfungsi.

==================================================
37. PRODUCTION CLEANUP
==================================================

HAPUS:

Dummy
Mock
Simulation
Demo
Placeholder
Hardcoded Nama Siswa
Hardcoded Nilai
Hardcoded Mapel
Hardcoded Guru
Hardcoded Rombel
Hardcoded Kurikulum
Hardcoded Kop
Hardcoded Logo
Hardcoded Template
Hardcoded KKM
Hardcoded Deskripsi.

==================================================
38. ACCEPTANCE TEST
==================================================

Uji:

Login
→ Tahun Ajaran
→ Semester
→ Rombel
→ Siswa
→ KBM
→ Absensi
→ Assessment
→ Nilai
→ Auto Leger
→ Finalize Leger
→ Generate Rapor
→ Validate
→ Review Wali Kelas
→ Approve Kepala Sekolah
→ Publish
→ Generate PDF
→ Generate Word
→ Print
→ QR Verification
→ Archive.

Uji juga:

Perubahan nilai sebelum rapor finalized.

Perubahan nilai setelah rapor finalized.

Revision rapor.

Bulk generate satu rombel.

Bulk generate seluruh unit.

Download PDF.

Download DOCX.

Print.

QR Verification.

Pastikan tidak ada data duplikat.

==================================================
FINAL OUTPUT
==================================================

Bangun ENTERPRISE RAPOR & DOCUMENT ENGINE.

Auto Leger adalah sumber nilai.
Assessment Engine adalah sumber penilaian.
Attendance Engine adalah sumber absensi.
Student Engine adalah sumber identitas siswa.
Academic Year Engine adalah sumber periode.
Curriculum Engine adalah sumber struktur kurikulum.
Unified Document Designer adalah sumber desain dokumen.

Rapor hanya menggabungkan sumber-sumber tersebut.

Tidak boleh ada input ulang nilai.
Tidak boleh ada database nilai duplikat.
Tidak boleh ada template hardcoded.
Tidak boleh ada dummy/mock/simulasi.
Tidak boleh ada tombol palsu.
Tidak boleh ada halaman hanya berupa UI.

Semua fitur harus database-driven, API-driven, transactional, auditable, role-aware, scope-aware, versioned dan production-ready.

Web ERP dan Flutter harus menggunakan REST API yang sama.