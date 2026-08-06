Lanjutkan project ERP yang sudah ada.

Jangan membuat project baru.
Jangan mengubah arsitektur backend yang sudah selesai.
Jangan menduplikasi business logic ke Flutter.

Buat dokumen lengkap bernama:

70_MOBILE_PRD.md

==================================================

PROJECT

Enterprise Mobile ERP

Terintegrasi penuh dengan ERP Web.

Mobile hanya sebagai Client.

Backend tetap menjadi pusat business logic.

==================================================

ARSITEKTUR

Frontend Mobile

- Flutter (Stable)
- Dart

Backend

- Node.js
- Express.js
- TypeScript
- REST API

Database

- MySQL
- Prisma ORM

Authentication

- JWT
- Refresh Token

==================================================

TARGET

Membangun aplikasi Flutter yang sinkron 100% dengan ERP Web.

Semua data berasal dari REST API backend.

Tidak boleh ada business logic di Flutter.

==================================================

PRINSIP

Single Source of Truth = Backend

Flutter hanya:

- Login
- Menampilkan data
- Mengirim request
- Menampilkan hasil

==================================================

ROLE

Super Admin

Yayasan

Kepala Sekolah

Wakil Kepala

TU

Guru

Wali Kelas

Guru Mapel

Musyrif

Bendahara

Staff

Orang Tua

Siswa

Santri

Semua mengikuti RBAC.

==================================================

FITUR

Authentication

Dashboard

Menu Dinamis

Profile

Notification

Calendar

Attendance

KBM

Assessment

Auto Leger

Rapor

Billing

SPP

Finance

Inventory

Library

Tahfidz

Diniyah

Boarding

Document

Print

Announcement

Messaging

Settings

Audit (Role tertentu)

==================================================

SMART ATTENDANCE

QR Code

GPS

Manual

Offline Sync

Realtime

Riwayat

Rekap

==================================================

KBM

Jadwal

Jurnal

Absensi

Nilai

Materi

Upload

Auto Leger

==================================================

ORANG TUA

Dashboard Anak

Absensi

Nilai

Rapor

Tagihan

Pembayaran

Pengumuman

Chat

==================================================

SISWA

Dashboard

Jadwal

Nilai

Rapor

Absensi

Tahfidz

Tagihan

==================================================

PEGAWAI

Absensi

Payroll

Slip Gaji

Jadwal

Pengumuman

==================================================

DASHBOARD

Widget berdasarkan Role.

Menu berdasarkan Permission.

Data berdasarkan Assignment.

==================================================

API

Gunakan satu REST API.

Semua endpoint sama dengan Web.

Tidak membuat endpoint baru tanpa kebutuhan.

==================================================

OFFLINE

SQLite hanya sebagai cache.

Sinkron otomatis saat online.

Backend tetap sumber data utama.

==================================================

NOTIFICATION

Firebase Push

WhatsApp (Backend)

Email (Backend)

In App Notification

==================================================

SECURITY

JWT

Refresh Token

HTTPS

RBAC

Assignment Scope

Audit Trail

==================================================

DESIGN

Material 3

Responsive

Modern

Minimalis

Mengikuti Design System ERP Web.

==================================================

PERFORMANCE

Lazy Loading

Pagination

Caching

Image Optimization

Request Optimization

==================================================

OUTPUT DOKUMEN

Buat PRD lengkap yang mencakup:

1. Vision
2. Goals
3. Scope
4. User Persona
5. Role Mobile
6. Functional Requirements
7. Non Functional Requirements
8. Mobile Architecture
9. API Integration Strategy
10. Authentication Flow
11. Navigation Structure
12. Module Detail
13. UI/UX Guideline
14. Offline Strategy
15. Notification Strategy
16. Security
17. Synchronization Flow
18. Deployment Strategy
19. Future Roadmap
20. Production Checklist

Dokumen harus siap menjadi acuan pembangunan Flutter menggunakan Google AI Studio, Stitch, dan Google AI, serta sinkron penuh dengan ERP Web tanpa duplikasi business logic.