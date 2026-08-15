Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur aplikasi.
JANGAN mengubah REST API.
JANGAN membuat business logic di frontend.
Implementasikan langsung production-ready.

==================================================
TARGET
==================================================

Bangun ENTERPRISE UNIFIED DOCUMENT TEMPLATE DESIGNER sebagai satu-satunya sistem desain dokumen untuk seluruh ERP.

Semua dokumen seluruh modul menggunakan Document Designer yang sama.

Tidak boleh ada template hardcoded.

Semua template tersimpan di database.

Semua field berasal dari REST API.

Semua perubahan template dapat dilakukan tanpa mengubah source code.

==================================================
WORKSPACE
==================================================

Dashboard

Document Library

Template Library

Visual Designer

Drag Drop Designer

Component Library

Field Manager

Formula Manager

Conditional Rule

Theme Manager

Asset Manager

Layout Manager

Header Footer Manager

Signature Manager

QR Manager

Barcode Manager

Print Manager

Preview Manager

Version Manager

Approval Manager

Publish Manager

Import Export

Backup Restore

==================================================
DOCUMENT MODULE
==================================================

Rapor

Leger

Transkrip Nilai

Ijazah

SKL

Sertifikat

Daftar Nilai

Rekap Nilai

Rekap Absensi

Daftar Hadir

Jurnal Mengajar

Surat Masuk

Surat Keluar

Surat Aktif

Surat Pindah

Surat Kelulusan

Surat Tugas

Surat Keterangan

Legalisir

Invoice

Billing

SPP

Kwitansi

Bukti Pembayaran

Slip Gaji

SK Pegawai

Kontrak

Kartu Pelajar

Kartu Santri

Kartu Pegawai

Label Arsip

Barcode Label

QR Label

Dokumen Yayasan

Template Custom

==================================================
KURIKULUM
==================================================

Kurikulum Merdeka

K13

Madrasah

Pesantren

PKBM

Yayasan

Custom

Admin dapat membuat kurikulum baru tanpa coding.

==================================================
VISUAL DESIGNER
==================================================

Drag Drop

Resize

Move

Duplicate

Delete

Alignment

Snap Grid

Layer

Undo

Redo

Zoom

Ruler

Guide Line

==================================================
LAYOUT
==================================================

Portrait

Landscape

A4

F4

Legal

Letter

Custom

Margin

Padding

Header

Footer

Background

Watermark

==================================================
COMPONENT
==================================================

Text

Rich Text

Table

Image

Logo

Photo

QR Code

Barcode

Line

Shape

Chart

Signature

Stamp

Dynamic Table

Dynamic List

==================================================
FIELD MANAGER
==================================================

Dynamic API Binding

Student

Parent

Teacher

Employee

Class

Subject

Academic Year

Semester

Assessment

Attendance

Tahfidz

Asrama

Billing

Finance

Payroll

Leger

Analytics

Organization

Custom Field

==================================================
FORMULA FIELD
==================================================

Average

Total

Ranking

Predikat

KKM

Remedial

Pengayaan

Attendance %

Financial Formula

Custom Formula

==================================================
CONDITIONAL RULE
==================================================

Show Hide Component

Per Role

Per Unit

Per Jenjang

Per Kurikulum

Per Semester

Per Tahun

Per Status

Per Template

==================================================
THEME
==================================================

Color Palette

Typography

Border

Table Style

Header Style

Footer Style

Corporate Theme

School Theme

Pesantren Theme

==================================================
HEADER
==================================================

Logo Sekolah

Logo Yayasan

Nama Sekolah

Nama Yayasan

Alamat

NPSN

Website

Email

==================================================
FOOTER
==================================================

QR Verification

Barcode

Tanggal Cetak

Version

Copyright

==================================================
SIGNATURE
==================================================

Kepala Sekolah

Wali Kelas

Guru

Direktur

Ketua Yayasan

Orang Tua

Digital Signature Ready

==================================================
QR & BARCODE
==================================================

Generate Otomatis

Verification URL

Unique Code

Tracking

==================================================
VERSIONING
==================================================

Draft

Review

Approved

Published

Archived

Restore Version

History

Compare Version

==================================================
PREVIEW
==================================================

Realtime Preview

Single Preview

Bulk Preview

Print Preview

==================================================
PRINT
==================================================

PDF

Excel

CSV

DOCX Ready

Print

Bulk Print

ZIP Export

==================================================
IMPORT EXPORT
==================================================

Import Template

Export Template

Clone Template

Duplicate Template

Backup

Restore

==================================================
ROLE
==================================================

Super Admin

Administrator

Operator

Kurikulum

Kepala Sekolah

TU

Keuangan

HR

Yayasan

==================================================
INTEGRASI
==================================================

Student Engine

Employee Engine

Teacher Engine

Attendance Engine

Academic Engine

Assessment Engine

Formula Engine

Auto Leger

Academic Analytics

Rapor Generator

Billing Engine

Finance Engine

Payroll Engine

Document Engine

Notification Engine

Parent Portal

Student Portal

Teacher Portal

Flutter

Web ERP

PWA

==================================================
FITUR ENTERPRISE
==================================================

Document Marketplace

Template Marketplace

Clone

Favorite

Theme Library

Asset Library

API Binding

Dynamic Component

Bulk Print

Bulk Export

Realtime Preview

Auto Version

Approval Workflow

==================================================
KEAMANAN
==================================================

JWT

RBAC

Permission

Assignment

Scope

Policy Engine

Feature Flag

Audit Trail

==================================================
VALIDASI
==================================================

Seluruh template harus melalui:

Draft

Review

Approval

Publish

Archive

==================================================
LARANGAN
==================================================

Dummy Data

Mock API

Hardcoded Template

Hardcoded Layout

Hardcoded Field

Hardcoded Formula

Hardcoded QR

Hardcoded Barcode

Developer Menu

Simulation

==================================================
OUTPUT
==================================================

Bangun ENTERPRISE UNIFIED DOCUMENT TEMPLATE DESIGNER sebagai satu-satunya engine desain dokumen untuk seluruh ERP. Seluruh template dokumen harus bersifat dinamis, berbasis database dan REST API, mendukung visual drag & drop designer, multi template, multi kurikulum, formula field, conditional rule, QR verification, barcode, digital signature, versioning, approval workflow, preview, bulk print, import/export, backup/restore, serta terintegrasi penuh dengan seluruh modul ERP (Akademik, Auto Leger, Rapor, Absensi, Billing, Keuangan, SDM, Tata Usaha, Yayasan, Flutter Mobile, Web ERP, dan PWA). Administrator harus dapat membuat, mengubah, menggandakan, dan mempublikasikan seluruh format dokumen tanpa mengubah source code. Sistem harus siap digunakan pada lingkungan produksi tanpa dummy data, mock API, simulasi, maupun hardcoded template.