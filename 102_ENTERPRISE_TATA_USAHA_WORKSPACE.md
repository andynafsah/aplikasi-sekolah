Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur.
JANGAN mengubah REST API.
JANGAN membuat business logic di frontend.
Implementasikan langsung production-ready.

================================================

TARGET

Bangun ENTERPRISE TATA USAHA WORKSPACE sebagai pusat administrasi operasional sekolah, pondok pesantren, PKBM, dan yayasan.

Semua fitur harus terintegrasi penuh dengan:

REST API

PostgreSQL

Prisma ORM

RBAC

Assignment

Scope

Audit Trail

Flutter

PWA

================================================

WORKSPACE

Dashboard

Administrasi Peserta Didik

Administrasi Pegawai

Surat Menyurat

Dokumen Digital

Arsip Digital

Mutasi

Alumni

Ijazah

Legalisir

Kartu Identitas

Layanan TU

Agenda

Pengumuman

Print Center

Export Center

Approval Center

Audit Log

================================================

DASHBOARD

Jumlah Siswa

Jumlah Santri

Jumlah Pegawai

Jumlah Guru

Surat Masuk

Surat Keluar

Dokumen Pending

Ijazah Belum Diambil

Mutasi

Permohonan Surat

Notifikasi

Quick Action

Kalender

================================================

ADMINISTRASI PESERTA DIDIK

Pendaftaran

Mutasi Masuk

Mutasi Keluar

Pindah Kelas

Naik Kelas

Lulus

DO

Status Aktif

Riwayat

Biodata

Dokumen

Cetak Biodata

================================================

ADMINISTRASI PEGAWAI

Data Pegawai

Data Guru

Riwayat Jabatan

Riwayat Pendidikan

SK

Kontrak

Dokumen

Status Aktif

================================================

SURAT MENYURAT

Surat Masuk

Surat Keluar

Disposisi

Agenda

Template

Mail Merge

Nomor Otomatis

Digital Signature

QR Verification

================================================

DOKUMEN DIGITAL

Upload

Preview

Approval

Version

Kategori

Tag

Download

Print

================================================

ARSIP DIGITAL

Folder

Label

Kategori

QR

Barcode

Pencarian

Restore

Audit

================================================

LAYANAN TU

Permohonan Surat

Legalisir

Perubahan Data

Mutasi

Cetak Kartu

Tracking Status

================================================

KARTU IDENTITAS

Kartu Pelajar

Kartu Santri

Kartu Pegawai

QR

Barcode

Cetak Massal

================================================

IJAZAH

Data Ijazah

Nomor Ijazah

Status

Serah Terima

Tanda Tangan

QR Verification

================================================

PRINT CENTER

Preview

Print

PDF

Excel

CSV

Bulk Print

Bulk Export

================================================

APPROVAL

Draft

Review

Approved

Rejected

Published

================================================

FITUR PRODUKTIVITAS

Quick Search

Advanced Filter

Bulk Action

Favorite Menu

Recent Activity

Reminder

Task

Deadline

Calendar

================================================

ROLE

Kepala TU

TU

Operator

Kepala Sekolah

Yayasan

Super Admin

================================================

KEAMANAN

JWT

RBAC

Permission

Assignment

Scope

Policy

Audit Trail

================================================

VALIDASI

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

Approval

Audit Trail

================================================

LARANGAN

Dummy Data

Mock API

Hardcoded Nomor Surat

Hardcoded Template

Hardcoded Unit

Hardcoded Kelas

Developer Menu

Simulation

================================================

OUTPUT

Bangun ENTERPRISE TATA USAHA WORKSPACE yang menjadi pusat administrasi operasional sekolah dan pondok pesantren, seluruh fitur saling terhubung melalui REST API dan database, mendukung administrasi peserta didik, pegawai, surat menyurat, arsip digital, layanan TU, pencetakan massal, approval workflow, audit trail, serta siap digunakan pada lingkungan produksi.