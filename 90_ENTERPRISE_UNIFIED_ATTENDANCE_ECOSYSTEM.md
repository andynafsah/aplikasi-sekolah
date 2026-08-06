Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Bangun Enterprise Unified Attendance Ecosystem.

Seluruh jenis absensi menggunakan SATU ENGINE.

Tidak boleh membuat modul absensi yang terpisah.

Semua data tersimpan pada database yang sama.

Semua menggunakan REST API yang sama.

Semua mengikuti RBAC.

========================================================

ENGINE ABSENSI

Engine harus mampu digunakan untuk:

✓ Check In Sekolah

✓ Check Out Sekolah

✓ KBM

✓ Ekstrakurikuler

✓ Tahfidz

✓ Tahsin

✓ Diniyah

✓ Halaqah

✓ Asrama

✓ Shalat Berjamaah

✓ Kegiatan Pondok

✓ Perpustakaan

✓ Laboratorium

✓ CBT

✓ Ujian

✓ Seminar

✓ Pelatihan

✓ Event

✓ Study Tour

✓ Kunjungan Industri

✓ Magang

========================================================

JENIS PESERTA

Siswa

Santri

Guru

Pegawai

Musyrif

Pembina

Karyawan

Tamu

========================================================

METODE ABSENSI

QR Code

Barcode

Manual

GPS

Geofence

NFC Ready

RFID Ready

Face Recognition Ready

Fingerprint Ready

========================================================

PETUGAS

Guru

Guru Mapel

Wali Kelas

Guru Piket

Musyrif

Pembina

Operator

TU

Satpam

Admin

Hak akses mengikuti RBAC.

========================================================

FLOW

Pilih Jenis Kegiatan

↓

Pilih Unit

↓

Pilih Kelas

↓

Pilih Mata Pelajaran / Kegiatan

↓

Pilih Jadwal

↓

Scanner Aktif

↓

Scan QR / Barcode

↓

Validasi

↓

Simpan Database

↓

Scanner Aktif Kembali

========================================================

VALIDASI

Academic Year

Semester

Unit

Role

Permission

Assignment

Scope

Jadwal

Jam

Peserta

Status Aktif

QR Valid

Barcode Valid

GPS Valid (jika digunakan)

========================================================

STATUS

Hadir

Terlambat

Izin

Sakit

Alpha

Tugas

Dispensasi

Pulang Cepat

========================================================

MANUAL

Jika QR gagal.

Jika Barcode gagal.

Jika kartu hilang.

Jika perangkat rusak.

Guru dapat memilih siswa.

Mengubah status.

Menambahkan catatan.

Semua perubahan masuk Audit Trail.

========================================================

REKAP

Per Hari

Per Minggu

Per Bulan

Per Semester

Per Tahun

Per Unit

Per Kelas

Per Guru

Per Mapel

Per Kegiatan

Per Santri

Per Pegawai

========================================================

LAPORAN

Preview

Print

PDF

Excel

CSV

Search

Filter

Grouping

Sorting

Pagination

========================================================

INTEGRASI

Dashboard

KBM

Jurnal Mengajar

Leger

Rapor

Analitik

Portal Orang Tua

Portal Siswa

Portal Santri

Portal Pegawai

Payroll

Reward

Punishment

Notification

Flutter

PWA

REST API

========================================================

NOTIFIKASI

Kirim notifikasi apabila diaktifkan.

Siswa hadir.

Siswa terlambat.

Siswa tidak hadir.

Santri hadir.

Guru hadir.

Pegawai hadir.

========================================================

AUDIT

Simpan:

User

Role

Assignment

Scope

Tanggal

Jam

GPS

Device

IP

Action

========================================================

LARANGAN

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Jadwal

Hardcoded QR

Hardcoded Barcode

Hardcoded Kelas

Hardcoded Guru

Hardcoded Unit

========================================================

OUTPUT

Bangun Enterprise Unified Attendance Ecosystem yang menggunakan satu mesin absensi untuk seluruh aktivitas sekolah, pondok pesantren, yayasan, dan kegiatan akademik maupun non-akademik. Seluruh proses menggunakan QR Code, Barcode, GPS, dan metode manual sesuai hak akses, seluruh data tersimpan melalui REST API ke database PostgreSQL, terintegrasi dengan Dashboard, KBM, Jurnal Mengajar, Leger, Rapor, Analitik, Portal Orang Tua, Portal Siswa, Flutter Mobile, dan Web ERP, tanpa dummy data, tanpa hardcode, siap digunakan pada lingkungan produksi.