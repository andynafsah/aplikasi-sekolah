# 125_ENTERPRISE_OFFICIAL_LETTER_DOCUMENT_RENDERING_ENGINE.md

```text
Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur utama.
JANGAN membuat REST API baru jika endpoint yang dibutuhkan sudah tersedia.
JANGAN membuat business logic di frontend.
Implementasikan langsung production-ready.

==================================================
TARGET
==================================================

Tingkatkan modul SURAT MENYURAT dan UNIFIED DOCUMENT TEMPLATE DESIGNER agar menghasilkan dokumen resmi lembaga yang rapi, konsisten, dan siap digunakan.

Fokus utama:

KOP SURAT
LAYOUT
FONT
UKURAN KERTAS
MARGIN
LOGO
HEADER
FOOTER
NOMOR SURAT
ISI SURAT
TANDA TANGAN
QR VERIFICATION
PREVIEW
PDF
WORD
PRINT

Preview frontend harus menjadi acuan utama layout dokumen.

PDF dan Word harus menggunakan konfigurasi template yang sama.

==================================================
1. IDENTITAS LEMBAGA
==================================================

Template surat wajib mengambil data dari database:

Nama Yayasan

Nama Lembaga

Unit

Jenjang

Alamat

Desa/Kelurahan

Kecamatan

Kabupaten/Kota

Provinsi

Kode Pos

Telepon

Email

Website

NPSN

NSM/NSS jika tersedia

Logo Yayasan

Logo Sekolah/Lembaga

Nama Kepala Sekolah/Pimpinan

Jabatan

Semua data harus dinamis.

Jangan hardcode identitas lembaga.

==================================================
2. MULTI UNIT / LEMBAGA
==================================================

Satu ERP dapat memiliki:

Yayasan

Sekolah

Pondok Pesantren

PKBM

Unit lainnya

Setiap unit dapat memiliki:

Logo

Nama

Alamat

Kop Surat

Font

Warna

Header

Footer

Nomor Surat

Tanda Tangan

Template berbeda.

Saat membuat surat, sistem otomatis menggunakan identitas unit sesuai scope user dan surat.

==================================================
3. KOP SURAT DESIGNER
==================================================

Buat visual Kop Surat Designer.

Support:

Logo kiri

Logo tengah

Logo kanan

Dua logo

Nama yayasan

Nama lembaga

Alamat

Kontak

Website

Garis kop

Garis ganda

Custom separator

Header spacing

Logo size

Logo position

Text alignment

Font family

Font size

Font weight

Line height

Letter spacing

Semua dapat diatur melalui frontend.

==================================================
4. DOCUMENT DESIGNER
==================================================

Support:

Drag & Drop

Move

Resize

Alignment

Margin

Padding

Spacing

Grid

Ruler

Guideline

Zoom

Undo

Redo

Duplicate

Delete

Layer

Lock element

Hide element

==================================================
5. UKURAN KERTAS
==================================================

Support:

A4

F4/Folio

Legal

Letter

A5

Custom Size

User dapat mengatur:

Width

Height

Unit:

mm

cm

inch

px

==================================================
6. MARGIN
==================================================

Support:

Top

Bottom

Left

Right

Header Margin

Footer Margin

Mirror Margin

Semua dapat diatur dari frontend.

==================================================
7. FONT
==================================================

Font harus configurable.

Support minimal:

Arial

Times New Roman

Calibri

Cambria

Georgia

Tahoma

Verdana

Courier New

serta font tambahan yang tersedia pada document rendering engine.

Konfigurasi:

Font Family

Font Size

Font Weight

Italic

Underline

Line Height

Letter Spacing

Alignment

Paragraph Spacing

Jangan hardcode font.

==================================================
8. SURAT RESMI
==================================================

Template surat terdiri dari:

Kop

Nomor

Lampiran

Perihal

Tanggal

Tujuan

Salam

Isi

Penutup

Tanda Tangan

Nama

Jabatan

NIP/NIY jika tersedia

Tembusan

QR Verification

Footer

==================================================
9. DYNAMIC FIELD
==================================================

Support dynamic field:

{{nomor_surat}}

{{tanggal}}

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

dan field lain dari API/database.

Field harus berasal dari schema/REST API.

Admin dapat memilih field tanpa coding.

==================================================
10. NOMOR SURAT
==================================================

Nomor surat otomatis.

Format configurable.

Contoh:

{{sequence}}/{{kode_unit}}/{{kode_surat}}/{{bulan_romawi}}/{{tahun}}

Sequence harus aman dari duplikasi.

Gunakan transaction/database locking jika diperlukan.

==================================================
11. TANDA TANGAN
==================================================

Support:

Upload tanda tangan

Digital signature ready

Nama

Jabatan

NIP

NIY

QR

Stempel

Posisi dapat diatur melalui designer.

==================================================
12. QR VERIFICATION
==================================================

Setiap dokumen resmi dapat memiliki QR Code.

QR berisi unique document verification code.

Status:

Valid

Revoked

Archived

Revised

Halaman verifikasi harus menampilkan informasi dokumen sesuai permission.

==================================================
13. PREVIEW
==================================================

Frontend harus memiliki Live Preview.

Preview harus menggunakan:

Template

Database Data

Font

Ukuran Kertas

Margin

Logo

Kop

Field

Signature

QR

Footer

Preview harus semirip mungkin dengan hasil PDF, Word, dan Print.

==================================================
14. PDF RENDERING
==================================================

Generate PDF dari template yang sama.

PDF harus mempertahankan:

Ukuran kertas

Margin

Font

Logo

Kop

Spacing

Alignment

Table

Signature

QR

Page Break

Header

Footer

Nomor halaman

Jangan menggunakan layout PDF yang berbeda dari frontend.

==================================================
15. WORD EXPORT
==================================================

Support export DOCX.

DOCX harus mempertahankan semaksimal mungkin:

Ukuran kertas

Margin

Font

Logo

Kop

Heading

Paragraph

Table

Alignment

Spacing

Signature

Footer

Header

Dynamic field

Jangan menghasilkan Word kosong, rusak, atau kehilangan isi surat.

Jika terdapat elemen frontend yang tidak dapat direpresentasikan identik dalam DOCX, gunakan fallback rendering yang stabil tanpa merusak isi dan struktur dokumen.

==================================================
16. PRINT
==================================================

Print harus menggunakan template yang sama.

Support:

Print Current

Print Bulk

Print Preview

Browser Print

PDF Print

==================================================
17. BULK DOCUMENT
==================================================

Support generate surat untuk:

1 siswa

1 guru

1 pegawai

1 kelas

1 rombel

banyak siswa

banyak pegawai

banyak penerima

Semua field harus otomatis berubah sesuai record.

==================================================
18. TEMPLATE
==================================================

Template status:

Draft

Review

Approved

Published

Archived

Support:

Create

Edit

Clone

Duplicate

Version

Restore

Preview

Publish

Archive

==================================================
19. TEMPLATE PER LEMBAGA
==================================================

Template dapat dikaitkan dengan:

Yayasan

Unit

Jenjang

Tahun Ajaran

Jenis Surat

Kegiatan

Role

Template default dapat ditentukan per unit.

==================================================
20. DOCUMENT TYPES
==================================================

Minimal:

Surat Keterangan

Surat Aktif

Surat Pindah

Surat Tugas

Surat Undangan

Surat Panggilan

Surat Izin

Surat Pernyataan

Surat Rekomendasi

Surat Pengantar

Surat Keputusan

Surat Edaran

Surat Orang Tua

Surat Alumni

Legalisir

Surat Custom

==================================================
21. DATABASE
==================================================

Template tersimpan di database.

Konfigurasi tersimpan di database.

Kop tersimpan di database.

Font configuration tersimpan di database.

Ukuran kertas tersimpan di database.

Margin tersimpan di database.

Dynamic fields tersimpan di database.

Version tersimpan di database.

Jangan menyimpan konfigurasi utama dalam source code.

==================================================
22. SECURITY
==================================================

Gunakan:

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Audit Trail

User hanya dapat menggunakan template sesuai hak akses dan scope.

==================================================
23. AUDIT
==================================================

Catat:

Create Template

Update Template

Publish Template

Archive Template

Generate Document

Download PDF

Download DOCX

Print

Revoke Document

Restore Version

==================================================
24. FILE STORAGE
==================================================

File:

Logo

Signature

Stamp

Generated PDF

Generated DOCX

Template Asset

harus menggunakan storage engine yang sudah tersedia.

Jangan menyimpan file binary besar langsung pada database kecuali arsitektur existing memang mengharuskannya.

==================================================
25. VALIDATION
==================================================

Sebelum generate:

Validasi template

Validasi data

Validasi dynamic field

Validasi font

Validasi ukuran kertas

Validasi margin

Validasi penerima

Validasi nomor surat

Validasi permission

Jika gagal, tampilkan error yang jelas.

==================================================
26. PRODUCTION
==================================================

Tidak boleh ada:

Dummy

Mock

Simulation

Hardcoded Letterhead

Hardcoded Logo

Hardcoded School Name

Hardcoded Font

Hardcoded Paper Size

Hardcoded Margin

Hardcoded Signature

Hardcoded Number

Demo Template

==================================================
27. ACCEPTANCE TEST
==================================================

Test minimal:

Buat template surat.

Pilih lembaga.

Upload logo.

Atur kop.

Pilih font.

Atur A4/F4.

Atur margin.

Masukkan dynamic field.

Preview.

Generate PDF.

Generate DOCX.

Print.

Bandingkan hasil dengan preview.

Generate bulk.

Verify QR.

Download kembali dokumen.

Pastikan layout tidak rusak.

==================================================
OUTPUT
==================================================

Bangun ENTERPRISE OFFICIAL LETTER DOCUMENT RENDERING ENGINE yang membuat surat resmi lembaga memiliki kop surat, logo, identitas, font, ukuran kertas, margin, tanda tangan, QR verification, nomor surat, dan layout yang dapat dikonfigurasi melalui frontend.

Frontend Live Preview harus menjadi sumber konfigurasi layout.

PDF, DOCX, dan Print harus menggunakan template serta konfigurasi yang sama dan menghasilkan dokumen yang konsisten.

Seluruh data harus dinamis dari PostgreSQL melalui REST API.

Tidak boleh ada dummy, simulasi, mock, atau hardcoded identitas lembaga.

Sistem harus mendukung multi-unit, template per lembaga, custom font, custom ukuran kertas, custom margin, dynamic field, bulk document generation, PDF, DOCX, print, QR verification, versioning, approval, dan audit trail.

SIAP PRODUKSI.
```
