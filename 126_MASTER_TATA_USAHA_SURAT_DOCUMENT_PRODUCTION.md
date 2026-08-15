Lanjutkan ERP yang sudah ada. JANGAN membuat project baru, JANGAN mengubah arsitektur/API yang sudah berjalan, JANGAN membuat dummy/mock/simulasi. Implementasikan production-ready.

TARGET:
Maksimalkan modul TATA USAHA + SURAT MENYURAT + UNIFIED DOCUMENT DESIGNER sebagai sistem administrasi resmi sekolah, pesantren, PKBM, dan yayasan.

ALUR UTAMA:
TAHUN AJARAN
→ MASTER DATA
→ ROMBEL
→ PEMBAGIAN TUGAS
→ SK
→ SURAT TUGAS
→ SURAT ORANG TUA
→ KBM
→ ABSENSI
→ PENILAIAN
→ LEGER
→ RAPOR
→ ARSIP.

SEMUA DATA HARUS:
PostgreSQL + Prisma + REST API.
Tidak boleh hardcoded.
Tidak boleh dummy.
Tidak boleh mock.
Tidak boleh simulation.
Tidak boleh data lokal sebagai sumber utama.

==================================================
TATA USAHA
==================================================

Dashboard TU:

Tahun Ajaran
Master Data
Siswa/Santri
Guru
Pegawai
Orang Tua
Unit
Jenjang
Kelas
Rombel
Mapel
Ruangan
Kurikulum
Kalender Akademik
Pembagian Tugas
Jadwal
SK
Surat
Arsip
Laporan.

CRUD wajib berfungsi:
Create
Read
Update
Delete
Detail
Search
Filter
Sort
Pagination
Import
Export
Print
Approval
Archive
Restore.

==================================================
SURAT MENYURAT
==================================================

Kelola:

Surat Masuk
Surat Keluar
Surat Tugas
Surat Keputusan
Surat Undangan
Surat Panggilan
Surat Izin
Surat Pernyataan
Surat Keterangan
Surat Aktif
Surat Pindah
Surat Orang Tua
Surat Edaran
Surat Pengantar
Surat Rekomendasi
Surat Kelulusan
Surat Custom.

Nomor surat otomatis dan configurable.

Status:
Draft
Review
Approved
Published
Archived
Revoked.

==================================================
KOP SURAT
==================================================

Kop wajib dinamis berdasarkan lembaga/unit.

Data:

Logo Yayasan
Logo Sekolah
Nama Yayasan
Nama Lembaga
Alamat
Desa/Kelurahan
Kecamatan
Kabupaten/Kota
Provinsi
Kode Pos
Telepon
Email
Website
NPSN/NSS/NSM jika tersedia.

Support:

1 logo
2 logo
logo kiri
logo tengah
logo kanan
custom position
garis kop
garis ganda
spacing
alignment.

Tidak boleh ada nama/logo/alamat lembaga hardcoded.

==================================================
DOCUMENT DESIGNER
==================================================

Buat Visual Document Designer.

Support:

Drag & Drop
Move
Resize
Alignment
Grid
Ruler
Guideline
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
Foto
QR
Barcode
Line
Shape
Signature
Stamp
Chart
Dynamic Table.

==================================================
UKURAN DOKUMEN
==================================================

Support:

A4
F4/Folio
Legal
Letter
A5
Custom.

User dapat mengatur:

Width
Height
Unit
Margin Top
Margin Bottom
Margin Left
Margin Right
Header
Footer.

==================================================
FONT
==================================================

Font configurable.

Minimal:

Arial
Times New Roman
Calibri
Cambria
Georgia
Tahoma
Verdana
Courier New.

Support:

Font Size
Bold
Italic
Underline
Alignment
Line Height
Letter Spacing
Paragraph Spacing.

Jika font custom tersedia pada sistem, dapat digunakan.

==================================================
DYNAMIC FIELD
==================================================

Gunakan field dari API/database:

{{nama_siswa}}
{{nis}}
{{nisn}}
{{kelas}}
{{rombel}}
{{nama_orang_tua}}
{{nama_guru}}
{{nama_pegawai}}
{{nama_lembaga}}
{{nama_yayasan}}
{{alamat}}
{{nama_kepala}}
{{jabatan}}
{{tanggal}}
{{nomor_surat}}
{{tahun_ajaran}}
{{semester}}
dan seluruh field valid lainnya.

Admin memilih field melalui UI tanpa coding.

==================================================
SURAT OTOMATIS
==================================================

Data surat harus otomatis mengambil dari database.

Contoh:

Pilih siswa
→ identitas siswa otomatis.

Pilih guru
→ data guru otomatis.

Pilih pegawai
→ data pegawai otomatis.

Pilih unit
→ kop otomatis.

Pilih kepala sekolah
→ tanda tangan otomatis.

==================================================
TANDA TANGAN
==================================================

Support:

Nama
Jabatan
NIP
NIY
Tanda tangan
Stempel
QR
Digital Signature Ready.

Posisi dapat diatur melalui Designer.

==================================================
QR VERIFICATION
==================================================

Setiap dokumen dapat memiliki QR unik.

QR membuka halaman verifikasi dokumen.

Status:

Valid
Revised
Revoked
Archived.

==================================================
TEMPLATE
==================================================

Template dapat dibuat berdasarkan:

Yayasan
Unit
Jenjang
Kurikulum
Tahun Ajaran
Jenis Surat.

Template dapat:

Create
Edit
Clone
Duplicate
Preview
Publish
Archive
Restore
Version.

Template disimpan di database.

==================================================
PDF
==================================================

Generate PDF berdasarkan template yang sama dengan Live Preview.

Pertahankan:

Kop
Logo
Font
Ukuran
Margin
Spacing
Table
Signature
QR
Header
Footer
Page Break.

PDF siap print resmi.

==================================================
WORD
==================================================

Export DOCX dari template yang sama.

Pertahankan semaksimal mungkin:

Ukuran kertas
Margin
Font
Logo
Kop
Heading
Paragraph
Table
Signature
Footer
Header
Dynamic Field.

Jika elemen tidak dapat direpresentasikan 100% oleh DOCX, gunakan fallback yang stabil tanpa merusak isi dokumen.

==================================================
PRINT
==================================================

Support:

Print Preview
Browser Print
Print PDF
Single Print
Bulk Print.

==================================================
BULK GENERATE
==================================================

Generate surat untuk:

1 siswa
1 guru
1 pegawai
1 kelas
1 rombel
banyak siswa
banyak guru
banyak pegawai
banyak penerima.

Semua data otomatis berbeda sesuai record.

==================================================
ARSIP
==================================================

Setiap surat yang diterbitkan dapat otomatis masuk Digital Archive.

Simpan:

Nomor
Jenis
Unit
Tanggal
Pembuat
Penerima
File PDF
File DOCX
Template
Version
QR
Status.

Support:

Search
Filter
Preview
Download
Print
Archive
Restore.

==================================================
LAPORAN TU
==================================================

Sediakan:

Rekap Siswa
Rekap Guru
Rekap Pegawai
Rekap Rombel
Rekap Pembagian Tugas
Rekap SK
Rekap Surat
Rekap Absensi
Rekap KBM
Rekap Penilaian
Rekap Leger
Rekap Rapor
Rekap Arsip.

Semua dapat:

Preview
PDF
Excel
CSV
Print.

==================================================
INTEGRASI
==================================================

Integrasikan dengan:

Student Engine
Teacher Engine
Employee Engine
Master Data
Academic Engine
Curriculum Engine
Rombel Engine
Assignment Engine
KBM
Smart Attendance
Assessment Engine
Auto Leger
Rapor Generator
Academic Analytics
Notification
Digital Archive
Unified Document Designer
Flutter
Web ERP
PWA.

Jangan membuat data duplikat jika data sudah tersedia di modul lain.

==================================================
RBAC
==================================================

Gunakan:

JWT
RBAC
Permission
Assignment
Scope
Policy Engine
Audit Trail.

Menu harus tampil sesuai role.

Jangan tampilkan menu Super Admin kepada TU.

==================================================
AUDIT
==================================================

Audit:

Create
Update
Delete
Approve
Reject
Publish
Generate
Download
Print
Export
Archive
Restore
Revoke.

Simpan user, role, waktu, IP/device, action, old value, new value.

==================================================
PRODUCTION CLEANUP
==================================================

HAPUS seluruh:

Dummy Data
Mock Data
Mock API
Simulation
Demo Page
Placeholder
Hardcoded School
Hardcoded Logo
Hardcoded Address
Hardcoded Font
Hardcoded Paper Size
Hardcoded Template
Hardcoded Role
Hardcoded Permission
Developer Menu
Testing Menu
Sandbox.

==================================================
VALIDASI AKHIR
==================================================

Pastikan:

Login → Role → Dashboard → Menu → Permission → CRUD → Database → API → Report → Print → Archive bekerja.

Test nyata:

Buat surat
→ pilih lembaga
→ kop otomatis
→ pilih penerima
→ data otomatis
→ pilih template
→ atur font
→ atur ukuran kertas
→ atur margin
→ preview
→ generate PDF
→ generate Word
→ print
→ QR verification
→ arsip otomatis.

Pastikan PDF, Word, Preview dan Print menggunakan konfigurasi template yang sama.

Jangan meninggalkan TODO, dummy, mock, simulation, broken route, broken API, atau tombol yang tidak berfungsi.

HASIL AKHIR:
Tata Usaha menjadi pusat administrasi produksi yang lengkap, dinamis, terintegrasi, aman, dan siap digunakan sekolah/pesantren/PKBM/yayasan tanpa perubahan kode untuk kebutuhan format surat biasa. Semua konfigurasi lembaga, kop surat, template, font, ukuran kertas, margin, tanda tangan, field, PDF, Word, print, QR, dan arsip harus dapat dikelola melalui aplikasi.