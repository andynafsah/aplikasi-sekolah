Lanjutkan project ERP Laravel yang sudah ada.

Jangan membuat project baru.
Jangan mengubah modul yang sudah selesai kecuali diperlukan.
Gunakan Smart Attendance Ecosystem, RBAC, Assignment Engine, Dashboard, Notification, Calendar, Audit Trail, Prisma ORM, Laravel API, React, Flutter Mobile API dan Settings Engine yang sudah ada.

Implementasikan langsung production-ready.

==================================================

Bangun Enterprise Attendance Security & Realtime Engine.

Target:

- Zero Hardcode
- Zero Dummy Data
- Zero Mock API
- Database Driven
- Prisma ORM
- REST API
- Flutter Ready

==================================================

DYNAMIC QR

QR Code bersifat dinamis.

Konfigurasi dari Settings:

- Berlaku 30 detik
- 1 menit
- 5 menit
- Per sesi
- Per hari

QR menggunakan UUID + Signature + Expired Time.

QR lama otomatis tidak valid.

==================================================

MANUAL APPROVAL

Jika absensi manual:

Wajib alasan.

Status:

Pending

Approved

Rejected

Approval mengikuti RBAC.

Semua tercatat di Audit Trail.

==================================================

LATE POLICY

Konfigurasi:

Unit

Shift

Role

Jam Masuk

Jam Pulang

Grace Period

Terlambat

Cepat Pulang

Alpha

Aturan berasal dari database.

==================================================

ACADEMIC CALENDAR

Sinkron otomatis dengan:

Kalender Akademik

KBM

Ujian

Tahfidz

Diniyah

Libur Nasional

Libur Yayasan

Hari Besar

Saat hari libur sistem menyesuaikan absensi otomatis.

==================================================

DEVICE & LOCATION

Catat:

Device

OS

Browser

IP

GPS

Google Maps

Login Device

Riwayat Lokasi

Admin dapat melihat histori.

==================================================

REALTIME MONITORING

Dashboard realtime:

Sudah Hadir

Belum Hadir

Terlambat

Izin

Sakit

Alpha

Per Unit

Per Kelas

Per Shift

Per Guru

Per Pegawai

Auto Refresh.

==================================================

REST API

Gunakan satu REST API untuk:

Web Laravel

Flutter Mobile

Tidak boleh ada business logic di Flutter.

Semua validasi berada di Backend.

==================================================

DATABASE

Gunakan schema Prisma.

Tambah migration bila diperlukan.

Tidak boleh merusak relasi lama.

==================================================

RBAC

Gunakan Role & Permission Engine.

Semua approval, monitoring dan konfigurasi mengikuti hak akses database.

==================================================

VALIDATION

Pastikan:

Tidak ada Hardcode

Tidak ada Dummy Data

Tidak ada Mock API

Tidak ada Duplicate Attendance

Tidak ada QR Reuse

Tidak ada Broken Relation

==================================================

OUTPUT

Bangun Enterprise Attendance Security & Realtime Engine yang terintegrasi penuh dengan Smart Attendance Ecosystem, Dashboard, Calendar, Audit Trail, Notification, Payroll, KBM dan Flutter Mobile menggunakan satu REST API backend.