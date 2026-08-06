Lanjutkan project ERP Laravel yang sudah ada.

Jangan membuat project baru.
Jangan mengubah module yang sudah selesai kecuali diperlukan.
Gunakan Authentication, RBAC, Assignment Engine, Employee Engine, Student Engine, Finance Engine, Payroll Engine, KBM Engine, Notification Engine, Dashboard Engine, Audit Engine, Print Engine, Prisma ORM, Laravel API, React, Tailwind dan Mobile API yang sudah ada.

Implementasikan langsung production-ready.

==================================================

Bangun Enterprise Smart Attendance Ecosystem.

Target:

- Zero Hardcode
- Zero Dummy Data
- Zero Mock API
- Database Driven
- Prisma ORM
- REST API
- Flutter Ready
- Offline Sync Ready

==================================================

ATTENDANCE TYPE

Student

Santri

Teacher

Employee

Visitor

Parent

==================================================

ATTENDANCE METHOD

QR Code Card

Dynamic QR

Manual (Approval)

GPS

QR + GPS

Selfie + GPS (Config)

NFC (Optional)

Semua method dapat diaktifkan/nonaktifkan dari Settings.

==================================================

STUDENT CARD

Setiap siswa/santri memiliki kartu digital & cetak berisi:

Foto

Nama

NIS/NISN

Unit

Kelas

Status

QR Code unik

Barcode (opsional)

UUID terenkripsi

Masa berlaku

Generate otomatis dari database.

==================================================

STUDENT ATTENDANCE

Guru/Wali Kelas:

Pilih kelas

Pilih KBM/Jadwal

Scan QR siswa

Absen otomatis

Jika kartu hilang:

Cari Nama

Cari NIS

Input manual

Semua metode tersimpan pada audit log.

==================================================

BOARDING ATTENDANCE

Subuh

Tahfidz Pagi

KBM

Dzuhur

Ashar

Tahfidz Sore

Maghrib

Isya

Murojaah

Apel

Makan

Asrama

Jadwal berasal dari database.

==================================================

EMPLOYEE ATTENDANCE

Flutter App:

Check In

Check Out

Break

Overtime

Scan QR di lokasi kerja.

Validasi:

GPS

Radius

Jam Kerja

Shift

Device

Optional Selfie.

==================================================

SHIFT

Pagi

Siang

Malam

Guru

TU

Satpam

Cleaning

Asrama

Custom

Semua berasal dari database.

==================================================

GPS

Radius dinamis

Polygon Area

Multi Lokasi

Google Maps

Location Accuracy

Anti Fake GPS (validasi server bila memungkinkan).

==================================================

DEVICE

Binding Device

Reset Device

Riwayat Device

Login Device

Logout Device

==================================================

OFFLINE

Flutter menyimpan absensi lokal.

Sinkron otomatis saat online.

Hindari duplikasi transaksi.

==================================================

LATE ENGINE

Terlambat

Cepat Pulang

Tidak Hadir

Izin

Sakit

Alpha

Overtime

Auto Calculation.

==================================================

PAYROLL

Absensi otomatis terhubung ke:

Payroll

Honor

Potongan

Lembur

Slip Gaji

==================================================

KBM

Absensi guru membuka:

Jurnal Mengajar

Daftar Hadir

Sesi KBM

Penilaian

Leger

==================================================

PARENT

Notifikasi otomatis:

Masuk

Pulang

Tidak Hadir

Terlambat

Melalui:

WhatsApp

Email

Push Notification

In App

==================================================

VISITOR

Check In

Check Out

QR Visitor

Tujuan

PIC

Riwayat

==================================================

REPORT

Harian

Mingguan

Bulanan

Semester

Tahunan

Per Unit

Per Kelas

Per Guru

Per Karyawan

Per Santri

Per Asrama

Export:

PDF

Excel

CSV

Print

==================================================

DASHBOARD

Realtime Widget:

Siswa Hadir

Guru Hadir

Karyawan Hadir

Santri Hadir

Terlambat

Alpha

Izin

Sakit

Trend Kehadiran

Heatmap Kehadiran

==================================================

API

GET /attendance

POST /attendance/checkin

POST /attendance/checkout

POST /attendance/scan

GET /attendance/report

GET /attendance/dashboard

GET /attendance/student

GET /attendance/employee

==================================================

RBAC

Gunakan Role & Permission Engine.

Data Scope berdasarkan Assignment:

Unit

Kelas

Mapel

Guru

Asrama

Shift

Tidak boleh hardcode.

==================================================

DATABASE

Gunakan schema Prisma.

Tambah migration bila diperlukan.

Tidak boleh merusak relasi lama.

==================================================

RELASI

Student
Employee
Teacher
Visitor
↓

Attendance

↓

KBM

↓

Assessment

↓

Auto Leger

↓

Payroll

↓

Finance

↓

Notification

↓

Dashboard

↓

Print Center

↓

Audit Trail

↓

Flutter Mobile

==================================================

VALIDATION

Pastikan:

Tidak ada Hardcode

Tidak ada Dummy Data

Tidak ada Mock API

Tidak ada Broken Relation

Tidak ada Duplicate Attendance

Tidak ada Duplicate QR

Semua transaksi tercatat di Audit Trail.

==================================================

OUTPUT

Bangun Enterprise Smart Attendance Ecosystem yang sepenuhnya dinamis, sinkron dengan seluruh modul ERP, menggunakan QR, GPS, Mobile Flutter, Dashboard, Payroll, KBM, Notification, Print Center dan Audit Trail tanpa mengubah arsitektur project yang sudah ada.