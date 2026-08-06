# ENTERPRISE SCHOOL ERP MOBILE
# PRODUCT REQUIREMENT DOCUMENT (PHASE 1)

Version : 1.0

Status : Production Ready

Target Platform :
- Flutter
- Android
- iOS
- Tablet

Backend :
- Existing ERP Backend
- Node.js + Express
- REST API
- PostgreSQL
- Prisma ORM
- JWT Authentication

---

# OBJECTIVE

Bangun aplikasi Flutter Enterprise sebagai client resmi ERP Web.

Aplikasi Mobile BUKAN project baru.

Flutter menggunakan Backend ERP yang sudah ada.

Tidak boleh membuat business logic baru.

Tidak boleh membuat database baru.

Semua data berasal dari REST API ERP.

---

# DEVELOPMENT RULE

- Gunakan Flutter Stable.
- Gunakan Material Design 3.
- Gunakan Riverpod.
- Gunakan GoRouter.
- Gunakan Dio.
- Gunakan Clean Architecture.
- Gunakan Repository Pattern.
- Gunakan Feature First.
- Gunakan Secure Storage.
- Gunakan Null Safety.
- Production Ready.
- Zero Hardcode.
- Zero Dummy Data.
- Zero Mock API.

---

# LOGIN

## Screen

Splash

↓

Check API

↓

Check Version

↓

Check Maintenance

↓

Check Token

↓

Login

↓

Dashboard sesuai Role

## Login

Field :

Username / Email

Password

Remember Me

Show Password

Forgot Password

Login Button

Biometric Ready

Loading

Error State

Session Validation

---

# ROLE

Sistem menggunakan Role + Permission + Assignment + Scope.

Role :

Super Admin

Yayasan

Kepala Sekolah

Wakil Kepala

TU

Guru

Wali Kelas

Guru Mapel

Bendahara

Operator

Pegawai

Satpam

Cleaning Service

Musyrif

Siswa

Santri

Orang Tua

Dashboard harus berubah otomatis sesuai Role.

---

# DASHBOARD

Dashboard berasal dari API.

Tidak boleh hardcoded.

Widget berdasarkan:

Role

Permission

Assignment

Scope

Widget contoh :

Attendance

Today's Schedule

Announcement

Calendar

Statistics

Quick Action

Billing Summary

Academic Summary

Notification

---

# DASHBOARD GURU

Status Kehadiran

Jadwal Hari Ini

KBM Hari Ini

Jurnal Mengajar

Absensi Siswa

Input Nilai

Leger

Rapor

Pengumuman

Kalender

---

# DASHBOARD KARYAWAN

Status Kehadiran

Jam Masuk

Jam Pulang

Shift

Jam Kerja

Lembur

Dokumen

Approval

Payroll Ringkas

Pengumuman

---

# SMART ATTENDANCE

Satu halaman.

Google Maps besar.

Menampilkan :

Current Location

Marker Sekolah

Marker Pengguna

Radius Geofence

GPS Accuracy

Alamat

Status Lokasi

Card Action :

Scan QR

Scan Barcode

Absen GPS

Manual Attendance

Riwayat

---

# QR / BARCODE

Support :

QR Code

Barcode

Dynamic QR

Validasi :

GPS

Geofence

Shift

Role

Assignment

Status Hari Ini

Setelah scan :

Foto

Nama

NIP/NIS

Role

Jam

Tanggal

Lokasi

Konfirmasi

---

# ABSENSI SISWA

Guru membuka KBM.

Pilih kelas.

Pilih mapel.

Scanner Full Screen.

Scan kartu siswa.

Tampilkan :

Foto

Nama

NIS

Kelas

Status

Jam

Scanner otomatis aktif kembali setelah scan berhasil.

---

# KBM

Jadwal Hari Ini

Kelas

Mapel

Jurnal Mengajar

Absensi

Penilaian

Leger

Rapor

Kalender

---

# PENILAIAN

Input Nilai

Tugas

UH

UTS

UAS

PAS

PTS

Remedial

Pengayaan

Predikat

KKM

Auto Hitung

Auto Save

---

# LEGER

Spreadsheet Modern

Sticky Header

Scroll Horizontal

Search

Filter

Ranking

Rata-rata

Ketuntasan

Auto Generate

---

# NOTIFICATION

Push Notification

In App Notification

Announcement

Reminder

Approval

Billing Reminder

Attendance Reminder

Academic Reminder

Notification Center

Badge Counter

---

# PROFILE

Foto

Nama

Role

Jabatan

Unit

Assignment

QR Digital ID

Barcode Digital ID

Edit Profile

Change Password

Registered Device

Security

---

# MENU

Dashboard

Attendance

KBM

Notification

Profile

Bottom Navigation

Drawer :

Dashboard

Attendance

Academic

Billing

Finance

Documents

Reports

Settings

Help

Logout

Menu berasal dari API.

---

# API

Gunakan endpoint ERP yang sudah ada.

JWT Authentication.

Refresh Token.

REST API.

Multipart Upload.

Pagination.

Filter.

Search.

Sorting.

---

# OFFLINE

Cache Dashboard

Offline Attendance Queue

Draft KBM

Draft Assessment

Auto Sync

Conflict Resolution

---

# SECURITY

JWT

Refresh Token

HTTPS

Secure Storage

Device Binding

RBAC

Permission

Audit Trail

---

# PERFORMANCE

Lazy Loading

Pagination

Image Cache

Background Sync

Shimmer Loading

Pull To Refresh

---

# OUTPUT

Bangun aplikasi Flutter Enterprise yang identik dengan ERP Web.

Seluruh halaman harus menggunakan Design System yang sama.

Semua data berasal dari Backend ERP.

Semua Dashboard berasal dari Role.

Semua Menu berasal dari Permission.

Semua data difilter menggunakan Assignment dan Scope.

Tidak boleh ada hardcode.

Tidak boleh ada dummy data.

Tidak boleh ada business logic di Flutter.

Flutter hanya sebagai UI + API Client.

Kode harus modular, reusable, scalable, mudah diuji, dan siap dikembangkan untuk seluruh modul ERP pada fase berikutnya.