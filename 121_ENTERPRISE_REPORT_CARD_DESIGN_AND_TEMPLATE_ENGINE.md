Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

==================================================
TARGET
==================================================

Bangun ENTERPRISE REPORT CARD DESIGN & TEMPLATE ENGINE sebagai sistem desain, konfigurasi, dan pencetakan rapor yang terintegrasi dengan Auto Leger, Assessment Formula Engine, Academic Analytics, dan Rapor Generator.

Seluruh data harus berasal dari PostgreSQL melalui REST API.

==================================================
WORKSPACE
==================================================

Dashboard

Template Rapor

Template Designer

Kurikulum

Komponen Rapor

Header & Footer

Layout Halaman

Cover Rapor

Identitas Sekolah

Identitas Yayasan

Tanda Tangan

QR Verification

Preview

Print

Publish

Versioning

==================================================
MASTER KURIKULUM
==================================================

Kurikulum Merdeka

Kurikulum 2013

Kurikulum Pesantren

PKBM

Madrasah

Template Yayasan

Template Custom

Admin dapat menambah kurikulum baru tanpa mengubah source code.

==================================================
TEMPLATE RAPOR
==================================================

Template SD

Template SMP

Template SMA

Template SMK

Template Pondok Pesantren

Template PKBM

Template Madrasah

Template Tahfidz

Template Yayasan

Template Custom

Semua template dapat diduplikasi.

==================================================
RAPOR DESIGNER
==================================================

Drag & Drop Layout

Resize Komponen

Move Komponen

Show/Hide Field

Tambah Logo

Tambah Background

Tambah Watermark

Tambah QR Code

Tambah Barcode

Tambah Foto Siswa

Tambah Foto Kepala Sekolah

Tambah Logo Yayasan

Tambah Identitas Sekolah

==================================================
KOMPONEN RAPOR
==================================================

Identitas Peserta Didik

Identitas Orang Tua/Wali

Identitas Sekolah

Identitas Yayasan

Nilai Mata Pelajaran

Nilai Ekstrakurikuler

Nilai Tahfidz

Nilai Asrama

Absensi

Catatan Wali Kelas

Catatan Kepala Sekolah

Prestasi

Pelanggaran

Kenaikan Kelas

Kelulusan

==================================================
LAYOUT
==================================================

Portrait

Landscape

A4

F4

Legal

Ukuran Custom

Margin Custom

Header Custom

Footer Custom

==================================================
HEADER
==================================================

Logo Sekolah

Logo Yayasan

Nama Sekolah

Nama Yayasan

Alamat

NPSN

NSS

Website

Email

==================================================
FOOTER
==================================================

Nomor Halaman

QR Verification

Barcode

Tanggal Cetak

Version

==================================================
TANDA TANGAN
==================================================

Kepala Sekolah

Wali Kelas

Orang Tua

Yayasan

Digital Signature Ready

==================================================
QR VERIFICATION
==================================================

Setiap rapor memiliki QR Code unik.

QR mengarah ke halaman verifikasi rapor.

Status:

Valid

Dicabut

Revisi

==================================================
VERSIONING
==================================================

Setiap perubahan template disimpan.

Version 1

Version 2

Version 3

Restore Version

Riwayat Perubahan

==================================================
PREVIEW
==================================================

Preview per Siswa

Preview per Kelas

Preview per Semester

Preview Massal

==================================================
PRINT
==================================================

Print

Bulk Print

PDF

Excel

ZIP PDF

==================================================
CUSTOM FIELD
==================================================

Admin dapat menambah field baru tanpa mengubah source code.

Field dapat dihubungkan ke REST API.

==================================================
INTEGRASI
==================================================

Auto Leger

Assessment Engine

Assessment Formula Engine

Academic Analytics

Attendance Engine

Tahfidz Engine

Asrama Engine

Student Engine

Parent Portal

Student Portal

Flutter

Web ERP

PWA

==================================================
ROLE
==================================================

Super Admin

Administrator Akademik

Wakil Kurikulum

Kepala Sekolah

Yayasan

Operator

==================================================
FITUR ENTERPRISE
==================================================

Template Library

Template Clone

Import Template

Export Template

Backup Template

Restore Template

Theme Manager

Color Palette

Typography Manager

Multi Bahasa

==================================================
VALIDASI
==================================================

Seluruh template harus tervalidasi sebelum Publish.

Template Draft

Review

Approved

Published

Archived

==================================================
KEAMANAN
==================================================

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Audit Trail

==================================================
LARANGAN
==================================================

Dummy Data

Mock API

Hardcoded Template

Hardcoded Kurikulum

Hardcoded Layout

Hardcoded Field

==================================================
OUTPUT
==================================================

Bangun ENTERPRISE REPORT CARD DESIGN & TEMPLATE ENGINE yang memungkinkan administrator membuat, memilih, menggandakan, dan mengubah template rapor secara visual melalui drag & drop. Sistem harus mendukung banyak kurikulum, template bawaan, template custom, komponen dinamis, QR verification, versioning, preview, bulk print PDF, serta sinkron penuh dengan Auto Leger, Assessment Formula Engine, Academic Analytics, dan Rapor Generator melalui REST API, siap digunakan pada lingkungan produksi.