# 124_ENTERPRISE_TATA_USAHA_ACADEMIC_ADMINISTRATION_ENGINE.md

```text
Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur yang sudah berjalan.
JANGAN membuat modul duplikat.
JANGAN membuat dummy/simulasi/mock.
JANGAN menggunakan hardcoded data.
Implementasikan langsung production-ready dan terintegrasi dengan database serta REST API yang sudah ada.

==================================================
TARGET
==================================================

Bangun ENTERPRISE TATA USAHA ACADEMIC ADMINISTRATION ENGINE.

Tata Usaha menjadi pusat administrasi operasional akademik yang menghubungkan seluruh siklus administrasi sekolah/pondok:

TAHUN AJARAN
↓
MASTER DATA
↓
PEMBENTUKAN ROMBEL
↓
PEMBAGIAN TUGAS
↓
SK
↓
SURAT TUGAS
↓
SURAT ORANG TUA
↓
KBM
↓
ABSENSI
↓
PENILAIAN
↓
LEGER
↓
RAPOR
↓
ARSIP

Setiap tahap harus menggunakan data dari tahap sebelumnya.

Tidak boleh ada data yang dibuat ulang secara manual jika sudah tersedia di database.

==================================================
1. TAHUN AJARAN & SEMESTER
==================================================

Kelola:

Tahun Ajaran
Semester
Tanggal Mulai
Tanggal Selesai
Status Aktif
Unit
Jenjang
Kurikulum
Kalender Akademik

Fitur:

Create
Edit
View
Delete
Activate
Archive
Clone Tahun Ajaran

Hanya satu Tahun Ajaran/Semester yang boleh aktif sesuai scope/unit.

Ketika Tahun Ajaran baru dibuat, sistem harus menyediakan proses rollover data secara aman.

==================================================
2. MASTER DATA
==================================================

Kelola:

Siswa
Santri
Guru
Pegawai
Orang Tua
Wali
Kelas
Ruang
Mapel
Kurikulum
Program
Jurusan
Unit
Jenjang
Jabatan
Tugas Tambahan

Pastikan semua data memiliki:

Status
Riwayat
Dokumen
Audit Trail

Data harus terhubung dengan Tahun Ajaran.

==================================================
3. PEMBENTUKAN ROMBEL
==================================================

TU dapat:

Membuat Rombel
Menentukan Unit
Jenjang
Tingkat
Kelas
Wali Kelas
Ruangan
Kapasitas

Memasukkan siswa secara:

Manual
Bulk
Import

Mendeteksi:

Siswa ganda
Siswa tanpa rombel
Rombel penuh
Siswa pindahan
Siswa naik kelas
Siswa tidak aktif

Simpan riwayat rombel setiap Tahun Ajaran.

==================================================
4. PEMBAGIAN TUGAS
==================================================

Kelola:

Wali Kelas
Guru Mapel
Guru Piket
Pembina
Koordinator
Tugas Tambahan
Jam Mengajar

Sistem harus mendukung:

Assignment
Scope
Unit
Jenjang
Kelas
Mapel
Tahun Ajaran

Deteksi:

Bentrok Guru
Bentrok Jadwal
Beban Mengajar
Kelas Tanpa Guru
Mapel Tanpa Guru

==================================================
5. SK
==================================================

TU dapat membuat dan mengelola:

SK Pembagian Tugas
SK Wali Kelas
SK Guru
SK Pegawai
SK Panitia
SK Kegiatan
SK Pembina
SK Tugas Tambahan

Gunakan Unified Document Template Designer.

Nomor SK otomatis.

Template dinamis.

Versioning.

Approval.

Publish.

QR Verification.

==================================================
6. SURAT TUGAS
==================================================

Generate otomatis berdasarkan data assignment.

Contoh:

Surat Tugas Guru
Surat Tugas Wali Kelas
Surat Tugas Panitia
Surat Tugas Kegiatan
Surat Tugas Pembina

Data guru, jabatan, unit, tugas, dan periode harus otomatis mengambil dari database.

Tidak boleh input ulang jika data sudah tersedia.

==================================================
7. SURAT ORANG TUA/WALI
==================================================

Kelola:

Surat Pemberitahuan
Surat Undangan
Surat Persetujuan
Surat Pernyataan
Surat Kegiatan
Surat Izin
Surat Panggilan
Surat Edaran
Surat Pengumuman

Generate berdasarkan:

Siswa
Orang Tua
Kelas
Rombel
Kegiatan
Tanggal
Unit

Dukung:

Bulk Generate
PDF
Print
QR Verification
Arsip

==================================================
8. KBM
==================================================

Data TU menjadi sumber data KBM.

KBM mengambil:

Tahun Ajaran
Semester
Guru
Mapel
Kelas
Rombel
Jadwal
Ruangan
Kurikulum

Guru menggunakan data tersebut melalui Teacher Command Center.

TU dapat memonitor:

Jadwal
Guru
Kelas
KBM
Jurnal
Status KBM

==================================================
9. ABSENSI
==================================================

Integrasikan dengan Smart Attendance Engine.

Siswa:

QR Kartu Pelajar
Barcode
Manual oleh guru/wali kelas

Guru/Pegawai:

QR/Barcode lokasi
GPS
Geofence
Manual Approval

TU dapat melihat:

Rekap Harian
Mingguan
Bulanan
Semester
Per Siswa
Per Guru
Per Kelas
Per Unit

Dukung:

PDF
Excel
CSV
Print

==================================================
10. PENILAIAN
==================================================

TU tidak menginput nilai guru secara langsung kecuali memiliki permission.

TU dapat memonitor:

Status Pengisian Nilai
Nilai Belum Lengkap
Nilai Sudah Lengkap
Approval
Remedial
Pengayaan

Terintegrasi dengan:

Assessment Formula Engine
Auto Leger Engine
Academic Analytics

==================================================
11. LEGER
==================================================

Leger otomatis berdasarkan database.

Generate:

Total
Rata-rata
Ranking
KKM
Predikat
Ketuntasan
Remedial
Pengayaan

TU dapat:

View
Print
Export
Archive

Tidak boleh mengubah nilai tanpa permission dan audit trail.

==================================================
12. RAPOR
==================================================

Rapor mengambil data dari:

Student Engine
Academic Engine
Assessment Engine
Formula Engine
Auto Leger
Attendance Engine
Tahfidz/Asrama jika tersedia

TU dapat:

Generate
Preview
Bulk Generate
Print
PDF
Archive

Template menggunakan:

Unified Document Template Designer.

Dukung berbagai:

Kurikulum
Unit
Jenjang
Semester
Program

==================================================
13. ARSIP
==================================================

Semua dokumen administrasi otomatis dapat masuk ke Digital Archive.

Kategori:

SK
Surat Tugas
Surat Orang Tua
Surat Masuk
Surat Keluar
Rapor
Leger
Ijazah
Sertifikat
Dokumen Siswa
Dokumen Guru
Dokumen Pegawai
Dokumen Akademik

Fitur:

Upload
Preview
Download
Print
Versioning
QR
Barcode
Tag
Folder
Search
Filter
Audit
Restore

==================================================
14. ADMINISTRATION WORKFLOW
==================================================

Setiap Tahun Ajaran memiliki workflow administrasi sendiri.

Contoh:

Buat Tahun Ajaran
↓
Aktifkan Semester
↓
Validasi Master Data
↓
Bentuk Rombel
↓
Tetapkan Wali Kelas
↓
Bagi Tugas Guru
↓
Generate SK
↓
Generate Surat Tugas
↓
Generate Surat Orang Tua
↓
Aktifkan KBM
↓
Monitoring Absensi
↓
Monitoring Penilaian
↓
Generate Leger
↓
Generate Rapor
↓
Arsipkan Dokumen

==================================================
15. DOCUMENT AUTOMATION
==================================================

Gunakan Unified Document Template Designer.

Semua dokumen mendukung:

Template
Dynamic Field
Formula
Conditional Field
QR
Barcode
Logo
Signature
Versioning
Approval
Preview
Print
PDF
Bulk Generate

==================================================
16. DASHBOARD TU
==================================================

Tampilkan:

Tahun Ajaran Aktif

Progress Administrasi

Master Data Lengkap

Rombel Terbentuk

Pembagian Tugas

SK Terbit

Surat Tugas Terbit

Surat Orang Tua

KBM Aktif

Absensi

Penilaian

Leger

Rapor

Dokumen Arsip

Task Pending

Approval Pending

==================================================
17. CHECKLIST TAHUN AJARAN
==================================================

Buat Academic Administration Checklist.

Contoh:

[ ] Tahun Ajaran aktif
[ ] Kalender akademik selesai
[ ] Master siswa valid
[ ] Master guru valid
[ ] Rombel selesai
[ ] Wali kelas ditetapkan
[ ] Pembagian tugas selesai
[ ] SK diterbitkan
[ ] Surat tugas diterbitkan
[ ] Surat orang tua diterbitkan
[ ] Jadwal KBM aktif
[ ] Absensi aktif
[ ] Penilaian aktif
[ ] Leger selesai
[ ] Rapor selesai
[ ] Arsip lengkap

Status:

Not Started
In Progress
Completed
Blocked

==================================================
18. VALIDATION CENTER
==================================================

Sebelum tahap berikutnya aktif, lakukan validasi.

Contoh:

Tidak boleh mengaktifkan KBM jika Rombel belum selesai.

Tidak boleh membuat SK jika Assignment belum valid.

Tidak boleh membuat Surat Tugas jika Guru belum memiliki Assignment.

Tidak boleh Generate Leger jika penilaian belum memenuhi persyaratan.

Tidak boleh Generate Rapor jika Leger belum valid.

Semua validasi harus berasal dari backend.

==================================================
19. PERMISSION
==================================================

Gunakan:

RBAC
Permission
Assignment
Scope
Policy Engine

Role contoh:

Super Admin
Kepala TU
Staff TU
Operator
Kepala Sekolah
Wakil Kurikulum
Guru
Wali Kelas
Yayasan

Jangan tampilkan menu atau data di luar permission user.

==================================================
20. AUDIT TRAIL
==================================================

Catat:

Create
Update
Delete
Approve
Reject
Publish
Generate
Print
Download
Export
Archive
Restore
Change Status

Simpan:

User
Role
Timestamp
IP
Device
Action
Old Value
New Value

==================================================
21. REPORT CENTER
==================================================

Semua rekap dapat:

Preview
Print
PDF
Excel
CSV

Laporan:

Data Siswa
Data Guru
Data Pegawai
Rombel
Pembagian Tugas
SK
Surat Tugas
Surat Orang Tua
KBM
Absensi
Penilaian
Leger
Rapor
Arsip

==================================================
22. PRODUCTION REQUIREMENT
==================================================

Tidak boleh ada:

Dummy Data
Mock API
Simulation
Demo Page
Placeholder Data
Hardcoded Data
Hardcoded Template
Hardcoded Role
Hardcoded Permission
Hardcoded Tahun Ajaran
Hardcoded Rombel
Hardcoded Guru
Hardcoded Siswa
Developer Menu

Semua data harus:

Database-driven
API-driven
Role-aware
Scope-aware
Audited
Validated

==================================================
23. FINAL INTEGRATION
==================================================

Pastikan modul TU terintegrasi dengan:

Student Engine
Employee Engine
Teacher Engine
Academic Engine
Curriculum Engine
Class/Rombel Engine
Assignment Engine
Attendance Engine
Assessment Engine
Formula Engine
Auto Leger Engine
Academic Analytics
Rapor Generator
Unified Document Designer
Digital Archive
Notification Engine
Flutter Mobile
Web ERP
PWA

==================================================
OUTPUT
==================================================

Bangun ENTERPRISE TATA USAHA ACADEMIC ADMINISTRATION ENGINE sebagai pusat administrasi operasional sekolah dan pondok pesantren.

Alur utama wajib:

TAHUN AJARAN
→ MASTER DATA
→ PEMBENTUKAN ROMBEL
→ PEMBAGIAN TUGAS
→ SK
→ SURAT TUGAS
→ SURAT ORANG TUA
→ KBM
→ ABSENSI
→ PENILAIAN
→ LEGER
→ RAPOR
→ ARSIP

Setiap tahap harus terhubung secara otomatis dengan tahap berikutnya melalui database dan REST API.

Tidak boleh ada duplikasi input data.

Tidak boleh ada dummy/simulasi/mock/hardcoded.

Semua CRUD, workflow, approval, dokumen, laporan, arsip, audit, notification, dan permission harus benar-benar berfungsi.

Sistem harus production-ready dan siap digunakan untuk operasional nyata sekolah, pondok pesantren, PKBM, dan yayasan.
```
