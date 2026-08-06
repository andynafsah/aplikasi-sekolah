Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================
TARGET
========================================================

Bangun ENTERPRISE ADMINISTRATION OFFICE SUITE (TATA USAHA) sebagai pusat administrasi sekolah, pondok pesantren, PKBM, dan yayasan.

Semua fitur harus terintegrasi dengan PostgreSQL, Prisma ORM, REST API, RBAC, Assignment, Scope, Audit Trail, Flutter Mobile, dan Web ERP.

Tidak boleh ada dummy data maupun hardcode.

========================================================
DASHBOARD TU
========================================================

Dashboard menampilkan:

Jumlah Siswa Aktif

Jumlah Santri Aktif

Jumlah Pegawai

Jumlah Guru

Jumlah Surat Masuk

Jumlah Surat Keluar

Jumlah Dokumen Menunggu Approval

Jumlah Mutasi

Jumlah Alumni

Jumlah Berkas Belum Lengkap

Jumlah Ijazah Belum Diambil

Jumlah Kartu Pelajar Belum Dicetak

Statistik Administrasi

Kalender Agenda TU

Notifikasi Tugas

Quick Action

========================================================
MASTER DATA
========================================================

Data Siswa

Data Santri

Data Guru

Data Pegawai

Data Orang Tua

Data Wali

Data Alumni

Data Unit

Data Kelas

Data Rombel

Data Jabatan

Data Ruangan

Data Dokumen

========================================================
ADMINISTRASI SISWA
========================================================

Pendaftaran

Mutasi Masuk

Mutasi Keluar

Naik Kelas

Lulus

Drop Out

Status Aktif

Riwayat Akademik

Riwayat Administrasi

Cetak Biodata

Cetak Kartu Pelajar

Cetak NIS

QR Code

Barcode

========================================================
MANAJEMEN DOKUMEN
========================================================

Upload Dokumen

Preview

Versioning

Approval

Arsip Digital

Kategori Dokumen

Masa Berlaku

Pengingat Dokumen

Download

Print

QR Verification

========================================================
SURAT MENYURAT
========================================================

Surat Masuk

Surat Keluar

Disposisi

Nomor Surat Otomatis

Template Surat

Mail Merge

Digital Signature Ready

QR Verification

Agenda Surat

Arsip Surat

========================================================
LEGALISIR & DOKUMEN AKADEMIK
========================================================

Legalisir

Surat Keterangan Aktif

Surat Keterangan Lulus

Surat Pindah

Surat Kelakuan Baik

Surat Izin

Surat Magang

Surat Tugas

Surat Rekomendasi

Surat Alumni

========================================================
KARTU IDENTITAS
========================================================

Kartu Pelajar

Kartu Santri

Kartu Pegawai

QR Code

Barcode

Cetak Massal

Preview

========================================================
PENCETAKAN MASSAL
========================================================

Kartu Pelajar

Daftar Siswa

Daftar Guru

Daftar Pegawai

Label Berkas

Map Arsip

Ijazah

SKHU

Transkrip

Surat

========================================================
ARSIP DIGITAL
========================================================

Folder

Kategori

Tag

Pencarian Cepat

Riwayat

Versioning

Restore

Audit

========================================================
LAYANAN TU
========================================================

Permohonan Surat

Permohonan Legalisir

Permohonan Dokumen

Permohonan Mutasi

Permohonan Perubahan Data

Tracking Status

Approval Workflow

========================================================
ANTRIAN LAYANAN
========================================================

Nomor Antrian

Layar Antrian

Status Layanan

Estimasi Waktu

Riwayat Layanan

========================================================
INTEGRASI
========================================================

Absensi

KBM

Billing

SPP

Keuangan

Perpustakaan

Asrama

Tahfidz

Rapor

Leger

Portal Orang Tua

Portal Siswa

Portal Pegawai

Flutter Mobile

========================================================
LAPORAN
========================================================

Rekap Siswa

Rekap Guru

Rekap Pegawai

Rekap Surat

Rekap Dokumen

Rekap Mutasi

Rekap Alumni

Rekap Layanan

Preview

Print

PDF

Excel

CSV

========================================================
FITUR PRODUKTIVITAS
========================================================

Quick Search

Advanced Filter

Bulk Edit

Bulk Print

Bulk Export

Bulk Import

Drag & Drop Upload

Scan QR Dokumen

Scan Barcode Dokumen

Recent Activity

Favorite Menu

Task Reminder

Deadline Reminder

Calendar Integration

========================================================
KEAMANAN
========================================================

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Feature Flag

Audit Trail

========================================================
VALIDASI
========================================================

Seluruh halaman wajib memiliki:

Create

View

Edit

Delete

Detail

Search

Filter

Sorting

Pagination

Import

Export

Print

Preview

Approval

Audit Trail

Soft Delete (jika digunakan)

========================================================
LARANGAN
========================================================

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Nomor Surat

Hardcoded Template

Hardcoded Role

Hardcoded Unit

Hardcoded Kelas

Halaman Simulasi

Menu Development

========================================================
OUTPUT
========================================================

Bangun ENTERPRISE ADMINISTRATION OFFICE SUITE sebagai pusat administrasi digital yang mendukung operasional nyata Tata Usaha sekolah, pondok pesantren, PKBM, dan yayasan. Seluruh fitur harus saling terhubung melalui REST API dan database, mendukung otomatisasi administrasi, pencetakan massal, arsip digital, surat menyurat, layanan TU, audit trail, serta siap digunakan pada lingkungan produksi tanpa dummy data maupun hardcode.