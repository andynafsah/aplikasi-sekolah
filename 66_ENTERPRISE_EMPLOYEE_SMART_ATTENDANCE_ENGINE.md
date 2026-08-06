Lanjutkan project ERP yang sudah ada.

Jangan membuat project baru.
Jangan mengubah modul yang sudah selesai kecuali diperlukan.

Gunakan:
RBAC Engine
Employee Engine
Attendance Engine
Payroll Engine
Finance Engine
Notification Engine
Calendar Engine
Dashboard Engine
Audit Trail
Assignment Engine
Flutter API
REST API
Prisma ORM
React
Tailwind

Implementasikan langsung production-ready.

==================================================

TARGET

Bangun Enterprise Employee Smart Attendance Engine.

Zero Hardcode.

Zero Dummy Data.

Database Driven.

Semua proses sinkron otomatis.

==================================================

METODE ABSENSI

QR Static

Dynamic QR

Barcode

GPS

Geofence

Face Verification (opsional)

NFC Ready

Manual (Approval)

Offline Queue

==================================================

CHECK IN

Scan QR

GPS Valid

Foto Selfie (opsional)

Jam Masuk

Device

Lokasi

IP

Status

==================================================

CHECK OUT

Scan QR

GPS

Jam Pulang

Durasi Kerja

Lembur

==================================================

SHIFT

Shift Pagi

Shift Siang

Shift Malam

Custom Shift

Split Shift

==================================================

JADWAL

Jam Kerja

Hari Kerja

Hari Libur

Kalender Akademik

Kalender Yayasan

==================================================

STATUS

Hadir

Terlambat

Izin

Sakit

Cuti

WFH

DL

Mangkir

Alpha

==================================================

KETERLAMBATAN

Hitung otomatis.

Toleransi per unit.

Toleransi per jabatan.

Potongan Payroll otomatis.

==================================================

LEMBUR

Request

Approval

Jam Lembur

Perhitungan

Payroll

==================================================

IZIN

Sakit

Cuti

Izin

Dinas

Dispensasi

Approval bertingkat.

==================================================

APPROVAL

Guru

Kepala TU

Kepala Sekolah

Yayasan

Sesuai RBAC.

==================================================

MOBILE

Flutter

Scan QR

GPS

Offline

Realtime Sync

==================================================

SECURITY

Dynamic QR

QR Expired

Device Binding

GPS Validation

Geofence

Anti Fake GPS

Anti Screenshot QR

Audit Device

==================================================

MONITORING

Siapa hadir

Belum hadir

Terlambat

Sedang bekerja

Sudah pulang

Realtime Dashboard.

==================================================

REKAP

Harian

Mingguan

Bulanan

Tahunan

Per Unit

Per Jabatan

Per Pegawai

==================================================

LAPORAN

Preview

Print

PDF

Excel

CSV

==================================================

PAYROLL

Sinkron otomatis.

Hadir

Terlambat

Lembur

Cuti

Potongan

Insentif

==================================================

NOTIFICATION

Check In berhasil

Check Out berhasil

Terlambat

Belum Absen

Approval

==================================================

RBAC

Hak akses berdasarkan:

Role

Permission

Assignment

Unit

==================================================

API

Gunakan REST API yang sudah ada.

Flutter menggunakan API yang sama.

==================================================

DATABASE

Gunakan Prisma ORM.

Migration bila diperlukan.

==================================================

VALIDATION

Tidak boleh ada:

Hardcode

Dummy Data

Mock API

Duplicate Attendance

Broken Relation

==================================================

SINKRONISASI

Attendance

↓

Dashboard

↓

Payroll

↓

Finance

↓

Notification

↓

Audit Trail

↓

Flutter

==================================================

OUTPUT

Bangun Enterprise Employee Smart Attendance Engine yang aman, realtime, terintegrasi penuh dengan Payroll, Dashboard, Audit, Mobile dan siap digunakan di lingkungan sekolah, pesantren, yayasan, dan PKBM.