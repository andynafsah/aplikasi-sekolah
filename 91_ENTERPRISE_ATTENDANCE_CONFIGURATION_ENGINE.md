Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Bangun Enterprise Attendance Configuration Engine.

Engine ini menjadi pusat konfigurasi seluruh sistem absensi.

Semua aturan absensi berasal dari database.

Tidak boleh ada konfigurasi yang di-hardcode.

========================================================

CORE PRINCIPLE

Semua modul absensi wajib membaca konfigurasi dari database.

Tidak boleh menggunakan nilai tetap di source code.

========================================================

MASTER CONFIGURATION

Academic Year

Semester

Unit

Jenjang

Program

Shift

Hari Belajar

Hari Libur

Kalender Akademik

========================================================

UNIT

Konfigurasi dapat dibuat berbeda untuk:

TK

SD

SMP

SMA

SMK

PKBM

Pesantren

Asrama

Yayasan

========================================================

ATTENDANCE TYPE

Check In

Check Out

KBM

Tahfidz

Tahsin

Diniyah

Halaqah

Asrama

Shalat Berjamaah

Ekstrakurikuler

Perpustakaan

Laboratorium

CBT

Ujian

Event

Magang

Study Tour

========================================================

ATTENDANCE METHOD

QR Code

Barcode

GPS

Geofence

Manual

RFID Ready

NFC Ready

Fingerprint Ready

Face Recognition Ready

========================================================

GPS CONFIGURATION

Latitude

Longitude

Radius

Multiple Location

Accuracy

Minimum Accuracy

Maximum Distance

GPS Required

GPS Optional

========================================================

QR CONFIGURATION

QR Static

QR Dynamic

Rotation Time

Expired Time

One Time Scan

Multiple Scan

Encryption

Signature Validation

========================================================

BARCODE CONFIGURATION

Barcode Type

Unique Barcode

Expiration

========================================================

TIME CONFIGURATION

Jam Masuk

Jam Pulang

Jam KBM

Jam Tahfidz

Jam Diniyah

Jam Asrama

Jam Ekstrakurikuler

Jam Istirahat

========================================================

LATE CONFIGURATION

Toleransi Terlambat

Kategori Terlambat

Sanksi

Peringatan

Notifikasi

========================================================

EARLY CHECK OUT

Aktif / Tidak

Toleransi

Approval Required

========================================================

MANUAL ATTENDANCE

Aktif / Tidak

Role yang diperbolehkan

Approval Required

Alasan Wajib

Lampiran Opsional

========================================================

APPROVAL

Level 1

Guru

Level 2

Wali Kelas

Level 3

Operator

Level 4

Kepala Sekolah

========================================================

ROLE CONFIGURATION

Setiap jenis absensi dapat diatur siapa yang boleh melakukan.

Contoh:

Guru

Guru Mapel

Wali Kelas

Guru Piket

TU

Operator

Satpam

Musyrif

Admin

========================================================

NOTIFICATION

Aktif / Tidak

Push Notification

Email

WhatsApp Ready

Telegram Ready

SMS Ready

========================================================

PARENT NOTIFICATION

Saat Hadir

Saat Terlambat

Saat Alpha

Saat Pulang

========================================================

AUTO ACTION

Masuk Dashboard

Update Rekap

Update Leger

Update Rapor

Update Analitik

Update Portal Orang Tua

Update Portal Siswa

========================================================

PAYROLL

Absensi Pegawai otomatis mempengaruhi:

Jam Kerja

Lembur

Keterlambatan

Potongan

Reward

========================================================

ACADEMIC

Absensi siswa otomatis terhubung ke:

KBM

Jurnal Mengajar

Leger

Rapor

Analitik

========================================================

REPORT

Semua konfigurasi dapat:

Preview

Print

Export PDF

Export Excel

Export CSV

========================================================

AUDIT

Seluruh perubahan konfigurasi wajib mencatat:

User

Role

Tanggal

Jam

Device

IP

Old Value

New Value

========================================================

API

Semua konfigurasi dibaca melalui REST API.

Flutter.

React.

PWA.

Menggunakan endpoint yang sama.

========================================================

VALIDATION

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Jam

Hardcoded GPS

Hardcoded Radius

Hardcoded QR

Hardcoded Barcode

Hardcoded Shift

Hardcoded Hari Libur

========================================================

OUTPUT

Bangun Enterprise Attendance Configuration Engine sebagai pusat konfigurasi seluruh sistem absensi sekolah, pesantren, yayasan, dan aplikasi mobile. Seluruh aturan dibaca secara dinamis dari database melalui REST API, mendukung multi-unit, multi-shift, multi-metode absensi, notifikasi, approval, audit trail, integrasi payroll, KBM, leger, rapor, analitik, Flutter Mobile, Web ERP, dan PWA tanpa hardcode maupun dummy data, siap digunakan pada lingkungan produksi.