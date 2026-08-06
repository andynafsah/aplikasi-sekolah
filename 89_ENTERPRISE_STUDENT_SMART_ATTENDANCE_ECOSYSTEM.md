Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Bangun Enterprise Student Smart Attendance Ecosystem yang terintegrasi penuh dengan ERP.

Seluruh proses absensi harus menggunakan:

REST API

PostgreSQL

Prisma ORM

RBAC

Permission

Assignment

Scope

Academic Year

Semester

Jadwal

KBM

Leger

Rapor

Notification

Analytics

Flutter Mobile

Web ERP

PWA

========================================================

SMART ATTENDANCE MODE

Sistem harus mendukung 4 mode absensi.

MODE 1

CHECK IN SEKOLAH

MODE 2

KBM

MODE 3

CHECK OUT SEKOLAH

MODE 4

MANUAL + APPROVAL

========================================================

MODE 1

CHECK IN SEKOLAH

Dilakukan ketika siswa datang ke sekolah.

Petugas yang dapat melakukan:

Guru Piket

Petugas Piket

Satpam

Operator

TU (jika diizinkan)

Metode:

Scan QR Card

Scan Barcode Card

Status:

Hadir

Terlambat

Belum Hadir

GPS opsional sesuai kebijakan.

========================================================

MODE 2

KBM

Dilakukan setiap pergantian jam pelajaran.

Guru hanya melihat:

Jadwal sendiri

Kelas sendiri

Mapel sendiri

Guru membuka:

KBM

↓

Pilih Kelas

↓

Pilih Mapel

↓

Pilih Jam

↓

Scanner aktif

↓

Scan QR atau Barcode kartu pelajar

↓

Sistem menampilkan:

Foto

Nama

NIS

Kelas

Jam

Status

↓

Data tersimpan otomatis

↓

Scanner aktif kembali tanpa menekan tombol.

========================================================

MODE 3

CHECK OUT SEKOLAH

Saat siswa pulang.

Scan kartu pelajar.

Simpan:

Jam Pulang

Status

Durasi Belajar

========================================================

MODE 4

MANUAL + APPROVAL

Jika:

QR rusak

Barcode rusak

Kartu hilang

Scanner rusak

Perangkat bermasalah

Guru atau Wali Kelas dapat melakukan input manual.

Setiap perubahan wajib mengisi:

Alasan

Catatan

Petugas

Tanggal

Jam

Audit Trail

========================================================

PETUGAS ABSENSI

Super Admin

Kepala Sekolah

Wakil Kepala

Operator

Guru

Guru Mapel

Wali Kelas

Guru Piket

Petugas Piket

TU (opsional)

Hak akses mengikuti RBAC.

========================================================

VALIDASI

Sebelum menyimpan absensi:

Role

Permission

Assignment

Scope

Academic Year

Semester

Unit

Kelas

Rombel

Mapel

Jadwal

Jam Pelajaran

QR/Barcode Valid

Tidak boleh terjadi absensi ganda.

========================================================

STATUS KEHADIRAN

Hadir

Terlambat

Izin

Sakit

Alpha

Tugas

Dispensasi

Pulang Cepat

========================================================

REKAP

Otomatis menghasilkan:

Per Hari

Per Minggu

Per Bulan

Per Semester

Per Tahun

Per Siswa

Per Kelas

Per Wali Kelas

Per Guru

Per Mapel

Per Unit

========================================================

LAPORAN

Preview

Print

PDF

Excel

CSV

Search

Filter

Sorting

Pagination

========================================================

INTEGRASI

Dashboard

KBM

Jurnal Mengajar

Leger

Rapor

Academic Analytics

Portal Orang Tua

Portal Siswa

Notification

REST API

Flutter

PWA

========================================================

NOTIFIKASI

Jika diaktifkan.

Kirim notifikasi kepada Orang Tua:

Siswa hadir.

Siswa terlambat.

Siswa tidak hadir.

Siswa pulang.

========================================================

AUDIT

Semua aktivitas wajib mencatat:

User

Role

Assignment

Device

IP Address

Tanggal

Jam

Action

========================================================

LARANGAN

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Jadwal

Hardcoded Guru

Hardcoded QR

Hardcoded Barcode

Hardcoded Kelas

Local Storage sebagai sumber data utama

========================================================

OUTPUT

Bangun Enterprise Student Smart Attendance Ecosystem yang mendukung Check In Sekolah, Absensi KBM per Jam Pelajaran, Check Out Sekolah, serta Manual Attendance dengan Approval, menggunakan QR Code dan Barcode pada kartu pelajar sebagai metode utama, seluruh data tersimpan melalui REST API dan otomatis terhubung dengan Dashboard, KBM, Jurnal Mengajar, Leger, Rapor, Analitik Akademik, Portal Orang Tua, Portal Siswa, Web ERP, PWA, dan Flutter Mobile secara dinamis, aman, dan siap digunakan pada lingkungan produksi.