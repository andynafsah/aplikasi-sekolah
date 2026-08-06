Lanjutkan project ERP Laravel yang sudah ada.

Jangan membuat project baru.
Jangan mengubah module yang sudah selesai kecuali diperlukan.
Gunakan seluruh arsitektur, database, Prisma ORM, Laravel API, React, Tailwind, RBAC, Assignment Engine, Notification Engine, Print Engine, Audit Engine, Finance Engine, dan Settings Engine yang sudah ada.

Implementasikan langsung dalam bentuk kode production-ready.

====================================================

TARGET

Refactor menu Billing & SPP menjadi Enterprise Billing Engine.

Module ini harus terhubung dengan seluruh sistem ERP.

Target:

- Zero Hardcode
- Zero Dummy Data
- Zero Mock API
- Zero Duplicate Logic
- 100% Database Driven
- 100% Prisma ORM
- 100% Laravel API
- 100% RBAC
- 100% Assignment Engine
- 100% CRUD
- 100% Flutter Ready

====================================================

JANGAN MENGUBAH

Authentication Engine

RBAC Engine

Assignment Engine

Dashboard Engine

Finance Engine

Audit Engine

Notification Engine

Print Engine

Document Engine

Monitoring Engine

Settings Engine

Gunakan seluruh module tersebut.

====================================================

IMPLEMENTASI

Master Billing

Master Jenis Tagihan

Master SPP

Master Diskon

Master Denda

Master Beasiswa

Master Payment Method

Master Rekening

Master Virtual Account

====================================================

AUTO BILLING

Generate otomatis ketika

- PPDB diterima

- Registrasi ulang

- Naik kelas

- Semester baru

- Tahun ajaran baru

- Mutasi masuk

- Santri baru

Rule berasal dari database.

====================================================

BILLING RULE

Billing dapat dibuat berdasarkan

Unit

Jenjang

Kelas

Rombel

Angkatan

Semester

Tahun Ajaran

Program

Status Santri

Individu

Kelompok

====================================================

JENIS TAGIHAN

SPP

DSP

Daftar Ulang

Seragam

Buku

Asrama

Makan

Tahfidz

Diniyah

Ujian

Wisuda

Study Tour

Kegiatan

Custom Billing

====================================================

PAYMENT

Tunai

Transfer

VA

QRIS

Payment Gateway

Multi Payment

Partial Payment

Cicilan

Over Payment

====================================================

AUTO CALCULATION

Tagihan

Diskon

Denda

Beasiswa

Potongan

Pajak (Opsional)

Grand Total

Total Bayar

Sisa Tagihan

Semua berasal dari database.

====================================================

STATUS

Draft

Aktif

Sebagian

Lunas

Jatuh Tempo

Dibatalkan

Refund

====================================================

AUTO REMINDER

WhatsApp

Telegram

Email

Firebase

In App

Rule reminder berasal dari database.

====================================================

KWITANSI

Nomor otomatis

QR Verification

Barcode

PDF

Print

Download

Share

====================================================

IMPORT

Excel

CSV

ODS

====================================================

EXPORT

Excel

CSV

PDF

Print

====================================================

DASHBOARD

Total Billing

Total Piutang

Total Pembayaran

Tagihan Hari Ini

Jatuh Tempo

Grafik Pembayaran

Grafik Piutang

Top Outstanding

====================================================

FILTER

Unit

Kelas

Semester

Status

Jenis Tagihan

Tanggal

====================================================

SEARCH

Nama

NIS

Nomor Billing

Nomor Invoice

====================================================

CRUD

Create

Read

Update

Delete

Restore

Bulk Delete

Bulk Generate

Bulk Reminder

Bulk Print

Bulk Export

====================================================

VALIDASI

Tidak boleh

Hardcoded Nominal

Hardcoded SPP

Hardcoded Diskon

Hardcoded Denda

Hardcoded Invoice

Dummy Data

Mock API

Manual Jurnal

Manual Piutang

====================================================

RELASI

Student

↓

Billing

↓

Invoice

↓

Payment

↓

Finance

↓

Cash Book

↓

Journal

↓

Notification

↓

Document

↓

Print Center

↓

Audit Trail

====================================================

RBAC

Gunakan Role & Permission Engine yang sudah ada.

Permission berasal dari database.

Tidak boleh hardcoded.

====================================================

API

Gunakan API Laravel yang sudah ada.

Jika endpoint belum tersedia maka buat endpoint baru mengikuti standar REST.

Gunakan Service Layer.

Gunakan Repository Pattern yang sudah ada.

====================================================

DATABASE

Gunakan schema Prisma yang sudah ada.

Jika diperlukan buat migration baru.

Tidak boleh menghapus tabel lama.

Tidak boleh merusak relasi lama.

Semua foreign key harus konsisten.

====================================================

UI

Gunakan Design System yang sudah ada.

Gunakan modal CRUD enterprise.

Gunakan server-side pagination.

Gunakan lazy loading.

Gunakan loading state.

Gunakan skeleton.

Gunakan toast notification.

Gunakan confirmation dialog.

====================================================

PRINT

Terhubung dengan Enterprise Print Center.

====================================================

AUDIT

Semua aktivitas tercatat.

Generate Billing

Edit

Delete

Payment

Refund

Print

Export

Reminder

====================================================

TESTING

Pastikan

Tidak ada TypeScript Error

Tidak ada Prisma Error

Tidak ada React Warning

Tidak ada Broken Relation

Tidak ada Duplicate Query

Tidak ada N+1 Query

Semua CRUD berjalan normal.

====================================================

OUTPUT

Implementasikan langsung ke project ERP yang sudah ada.

Jangan membuat project baru.

Jangan mengubah arsitektur yang sudah selesai.

Pastikan seluruh module Billing & SPP terintegrasi penuh dengan:

Finance Engine

Notification Engine

Print Engine

Document Engine

Dashboard Engine

RBAC Engine

Assignment Engine

Settings Engine

Audit Engine

Monitoring Engine

Flutter Mobile API

Production Ready.