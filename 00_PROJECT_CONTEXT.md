# MASTER PROMPT V3
# 00_PROJECT_CONTEXT.md

Version : 3.0.0
Project : ERP Sekolah & Pondok Pesantren Enterprise
Status : Production Architecture
Priority : Highest
Language : Bahasa Indonesia
Code Language : English

---

# PROJECT OVERVIEW

Proyek ini adalah pengembangan aplikasi ERP (Enterprise Resource Planning)
khusus untuk Sekolah, Madrasah, Boarding School, Pondok Pesantren,
Lembaga Pendidikan Islam, Yayasan Pendidikan,
serta lembaga pendidikan formal maupun non-formal.

Aplikasi dikembangkan sebagai produk komersial
yang dapat dijual dalam bentuk SaaS (Cloud),
Self Hosted,
Enterprise,
dan Offline.

Target utama bukan hanya membuat aplikasi administrasi sekolah,
tetapi membangun Platform Enterprise Education Management
yang modern, scalable, modular,
AI Ready,
Audit Ready,
Multi Tenant,
Offline Ready,
dan Mobile Ready.

---

# PROJECT GOAL

Membangun sistem ERP pendidikan
yang mampu mengintegrasikan seluruh proses bisnis sekolah
dan pondok pesantren ke dalam satu platform.

Seluruh modul harus saling terintegrasi
tanpa terjadi duplikasi data.

Setiap modul wajib menggunakan Master Data yang sama.

Tidak diperbolehkan membuat data master yang terpisah.

---

# TARGET USER

Platform harus dapat digunakan oleh:

- Yayasan
- Sekolah TK
- Sekolah SD
- Sekolah SMP
- Sekolah SMA
- SMK
- Madrasah
- Pondok Pesantren
- Boarding School
- Kampus
- LPK
- Bimbingan Belajar
- Rumah Tahfidz
- TPQ
- MDT
- Organisasi Pendidikan

---

# BUSINESS MODEL

Produk harus mendukung beberapa model bisnis:

## SaaS

Multi Tenant

Cloud

Subscription

Bulanan

Tahunan

Lifetime

---

## Self Hosted

Single Tenant

Install pada server pelanggan

---

## Enterprise

Kustomisasi

Integrasi

API

White Label

---

## Offline

Berjalan tanpa internet.

Sinkronisasi otomatis ketika internet tersedia.

---

# PROJECT PRINCIPLE

Seluruh pengembangan harus mengikuti prinsip berikut.

Single Source of Truth

Modular

Reusable

Scalable

Maintainable

Clean Architecture

SOLID Principle

DRY

KISS

Production Ready

Documentation First

Security First

API First

Offline First

Mobile First

AI Ready

Audit Ready

Performance First

---

# DEVELOPMENT PRINCIPLE

Jangan membuat kode contoh.

Jangan membuat pseudo code.

Jangan membuat placeholder.

Semua kode harus dapat dijalankan.

Semua source code harus production ready.

---

# TARGET SCALE

Platform harus mampu melayani:

1 Yayasan

↓

Beberapa Sekolah

↓

Beberapa Unit

↓

Beberapa Gedung

↓

Beberapa Kampus

↓

Ribuan Guru

↓

Puluhan Ribu Siswa

↓

Ratusan Ribu Dokumen

↓

Jutaan Transaksi

Tanpa mengubah arsitektur.

---

# CORE SYSTEM

Platform terdiri dari beberapa Core Engine.

Master Data Engine

Academic Engine

Attendance Engine

Finance Engine

Payroll Engine

HR Engine

Library Engine

Inventory Engine

Asset Engine

Dormitory Engine

Health Engine

Medical Engine

Student Affair Engine

CBT Engine

LMS Engine

AI Engine

Notification Engine

Workflow Engine

Audit Engine

Reporting Engine

Dashboard Engine

Mobile Engine

Offline Engine

Google Workspace Engine

Integration Engine

Plugin Engine

Marketplace Engine

System Engine

---

# CORE MODULE

Seluruh modul wajib menggunakan Master Data yang sama.

PPDB

Akademik

KBM

Absensi

Keuangan

SPP

Payroll

Inventaris

Perpustakaan

Asrama

Tahfidz

Kesehatan

Klinik

BK

Prestasi

Pelanggaran

Koperasi

Kantin

Laundry

Transportasi

CBT

LMS

Rapor

Alumni

CRM

Helpdesk

Audit

AI

Pengaturan

---

# TARGET STANDARD

Platform harus memenuhi standar berikut.

DAPODIK Ready

EMIS Ready

Akreditasi Ready

Audit Ready

ISO Ready

REST API Ready

Multi Tenant Ready

Offline Ready

Mobile Ready

AI Ready

Plugin Ready

White Label Ready

---

# MULTI TENANT

Seluruh data harus memiliki tenant_id.

Tidak boleh ada data
yang bercampur antar tenant.

Semua query harus otomatis
memfilter tenant_id.

---

# APPLICATION TYPE

Web Application

Progressive Web App

Android Ready

iOS Ready

Desktop Ready

Offline Ready

---

# DATA PRINCIPLE

Semua data menggunakan Master Data.

Tidak boleh terjadi
duplikasi data.

Seluruh perubahan data
harus memiliki histori.

Seluruh penghapusan data
menggunakan Soft Delete.

---

# AUDIT PRINCIPLE

Semua perubahan data harus tercatat.

Siapa mengubah.

Kapan mengubah.

Data sebelum.

Data sesudah.

Alamat IP.

Browser.

Perangkat.

Lokasi (jika tersedia).

---

# SECURITY PRINCIPLE

Authentication

Authorization

Role

Permission

Session

JWT

Refresh Token

Encryption

Audit Log

Rate Limit

CSRF Protection

XSS Protection

SQL Injection Protection

---

# PERFORMANCE PRINCIPLE

Lazy Loading

Pagination

Caching

Background Job

Queue

Chunk Upload

Chunk Import

Optimized Query

Composite Index

Connection Pool

---

# USER EXPERIENCE

UI modern.

Cepat.

Mudah dipahami.

Responsif.

Dark Mode.

Light Mode.

Accessibility.

Keyboard Shortcut.

Realtime Notification.

---

# AI PRINCIPLE

AI digunakan sebagai asisten.

AI tidak boleh
mengubah data
tanpa persetujuan pengguna.

AI harus dapat membantu:

Analisis

Prediksi

Rekomendasi

Generate Dokumen

Generate Soal

Generate Surat

Generate RPP

Generate Modul

Generate Laporan

Generate Dashboard

---

# DOCUMENT PRINCIPLE

Semua dokumen harus mendukung:

Versioning

Approval

Download

Upload

Archive

Restore

History

Digital Signature Ready

QR Verification Ready

---

# INTEGRATION

Platform harus siap
diintegrasikan dengan:

WhatsApp

Telegram

Email

SMS

Payment Gateway

Google Workspace

Microsoft 365

Zoom

Google Meet

API Pemerintah

Dapodik

EMIS

Fingerprint

Face Recognition

RFID

Barcode

QR Code

GPS

---

# DEVELOPMENT RULE

Setiap Sprint harus menghasilkan:

1. Analisis

2. Database

3. Backend

4. Frontend

5. API

6. Testing

7. Dokumentasi

8. Deployment

Jika tidak berubah,
tulis:

NO DATABASE CHANGE

NO API CHANGE

NO FRONTEND CHANGE

UNCHANGED

Jangan mengulang kode
yang sudah pernah dibuat.

---

# PROJECT OBJECTIVE

Membangun ERP Pendidikan
kelas Enterprise
yang mampu bersaing
dengan solusi komersial,
namun tetap fleksibel,
mudah dikembangkan,
dan siap digunakan
oleh ribuan institusi pendidikan
di Indonesia.

Dokumen ini adalah sumber konteks utama.

Seluruh sprint berikutnya
WAJIB mengikuti aturan
pada dokumen ini.