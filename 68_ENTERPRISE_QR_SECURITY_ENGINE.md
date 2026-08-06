Lanjutkan project ERP yang sudah ada.

Jangan membuat project baru.
Jangan mengubah modul yang sudah selesai kecuali diperlukan.

Gunakan:

Attendance Engine
RBAC Engine
Audit Trail
Notification Engine
Dashboard Engine
Flutter API
REST API
JWT
Prisma ORM
React
Tailwind

Implementasikan production-ready.

==================================================

TARGET

Bangun Enterprise QR Security Engine.

QR menjadi sistem autentikasi absensi.

Zero Hardcode.

Zero Dummy Data.

==================================================

DIGUNAKAN UNTUK

Guru

Pegawai

TU

Musyrif

Satpam

Cleaning Service

Siswa

Santri

==================================================

QR TYPE

Dynamic QR

Static QR

Personal QR

Location QR

Class QR

Room QR

Event QR

==================================================

DYNAMIC QR

QR berubah otomatis.

Interval dapat diatur.

30 detik

60 detik

120 detik

300 detik

Pengaturan melalui database.

==================================================

QR SECURITY

Signed Token

JWT

Encrypted Payload

Expired Time

Nonce

One Time Scan

==================================================

ANTI FRAUD

Anti Screenshot

Anti Replay

Anti Duplicate Scan

Anti QR Copy

Anti Fake Token

Anti Manual URL

==================================================

VALIDATION

Role

Permission

Assignment

Unit

Lokasi

GPS

Jam

Shift

Hari

Kalender

==================================================

DEVICE

Device ID

Device Binding

Trusted Device

Unknown Device Alert

==================================================

SCAN VALIDATION

QR Valid

QR Expired

QR Invalid

QR Already Used

QR Wrong Unit

QR Wrong Role

QR Wrong Schedule

==================================================

LOCATION

Geofence

Radius

GPS Accuracy

==================================================

AUDIT

Siapa Scan

Jam

Lokasi

Perangkat

IP

Status

==================================================

NOTIFICATION

Scan Berhasil

Scan Ditolak

QR Kadaluarsa

Percobaan Curang

==================================================

SETTING

Interval QR

Panjang Token

TTL

Radius GPS

Retry

Semua dari database.

==================================================

API

GET /attendance/qr

POST /attendance/scan

GET /attendance/history

POST /attendance/verify

==================================================

FLUTTER

Gunakan API yang sama.

Tidak ada business logic.

==================================================

DATABASE

Prisma ORM.

Migration bila diperlukan.

==================================================

VALIDATION

Tidak boleh ada:

Hardcode

Dummy

Mock

QR tetap

QR tanpa expired

==================================================

OUTPUT

Bangun Enterprise QR Security Engine yang aman, realtime, terenkripsi, mendukung Flutter dan Web ERP, serta mampu mencegah seluruh bentuk penyalahgunaan QR pada sistem absensi.