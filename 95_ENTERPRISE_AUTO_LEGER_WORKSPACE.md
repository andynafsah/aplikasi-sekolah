Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================
TARGET
========================================================

Bangun menu baru bernama:

LEGER NILAI

atau

AUTO LEGER

Menu ini merupakan workspace utama pengolahan nilai siswa secara otomatis.

Leger bukan bagian dari menu Penilaian.

Leger merupakan modul tersendiri yang menerima seluruh hasil penilaian dari Assessment Engine kemudian mengolahnya menjadi rekap nilai siap rapor.

Semua proses menggunakan database PostgreSQL, Prisma ORM, REST API, RBAC, Assignment, Scope dan Formula Engine.

Tidak boleh ada perhitungan manual di frontend.

========================================================
SUMBER DATA
========================================================

Seluruh data berasal dari:

Assessment Engine

Assessment Formula Engine

Academic Configuration

KKM

Bobot Penilaian

Data Siswa

Data Guru

Data Kelas

Data Mapel

Semester

Tahun Ajaran

========================================================
MENU LEGER
========================================================

Dashboard Leger

Leger Per Kelas

Leger Per Mata Pelajaran

Leger Per Guru

Leger Per Semester

Leger Per Tahun Ajaran

Leger Remedial

Leger Pengayaan

Ranking

Ketuntasan KKM

Analitik

Riwayat Publish

Approval

Cetak

Export

========================================================
DASHBOARD LEGER
========================================================

Tampilkan ringkasan:

Jumlah Kelas

Jumlah Siswa

Jumlah Guru

Jumlah Mapel

Nilai Belum Lengkap

Nilai Sudah Lengkap

Belum Publish

Sudah Publish

Jumlah Remedial

Jumlah Pengayaan

Rata-rata Sekolah

Rata-rata Unit

Grafik Ketuntasan

Grafik Distribusi Nilai

Grafik Ranking

Progress Pengisian Nilai

Semua widget realtime dari REST API.

========================================================
LEGER PER KELAS
========================================================

Filter:

Tahun Ajaran

Semester

Unit

Jenjang

Kelas

Rombel

Wali Kelas

Menampilkan tabel:

No

NIS

Nama

Seluruh Mata Pelajaran

Nilai Akhir

Total Nilai

Rata-rata

Ranking

Status KKM

Remedial

Pengayaan

Catatan

========================================================
LEGER PER MAPEL
========================================================

Filter:

Guru

Mapel

Kelas

Semester

Tampilkan:

Nilai seluruh siswa.

Rata-rata kelas.

Nilai tertinggi.

Nilai terendah.

Distribusi nilai.

Ketuntasan.

========================================================
PERHITUNGAN OTOMATIS
========================================================

Auto Total Nilai

Auto Rata-rata

Auto Ranking

Auto Predikat

Auto Ketuntasan KKM

Auto Remedial

Auto Pengayaan

Auto Deskripsi Nilai

Auto Statistik

Auto Publish Status

Semua dihitung di backend.

========================================================
RANKING
========================================================

Per Kelas

Per Unit

Per Jenjang

Per Semester

Per Tahun

Menggunakan konfigurasi Ranking Engine.

========================================================
KKM
========================================================

Status:

Tuntas

Belum Tuntas

Remedial

Pengayaan

Mengikuti konfigurasi KKM setiap mata pelajaran.

========================================================
REMEDIAL
========================================================

Daftar siswa remedial.

Nilai awal.

Nilai remedial.

Nilai akhir.

Status.

========================================================
PENGAYAAN
========================================================

Daftar siswa pengayaan.

Nilai awal.

Nilai pengayaan.

Nilai akhir.

========================================================
ANALYTICS
========================================================

Grafik Nilai

Distribusi Nilai

Ketuntasan

Ranking

Performa Kelas

Performa Guru

Performa Mata Pelajaran

========================================================
PUBLISH
========================================================

Draft

Review

Approved

Published

Locked

Nilai yang sudah Locked tidak dapat diubah kecuali melalui proses Unlock dengan hak akses yang sesuai.

========================================================
ROLE
========================================================

Guru Mapel

Melihat hanya mapel yang diampu.

Wali Kelas

Melihat hanya kelas perwaliannya.

Kepala Sekolah

Melihat seluruh kelas.

Yayasan

Monitoring seluruh unit.

Super Administrator

Mengelola konfigurasi sistem.

========================================================
FITUR
========================================================

Search

Filter

Sorting

Pagination

Bulk Publish

Bulk Lock

Bulk Unlock

Bulk Export

Bulk Print

Preview

Riwayat Perubahan

Audit Trail

========================================================
LAPORAN
========================================================

Preview

Print

PDF

Excel

CSV

========================================================
INTEGRASI
========================================================

Assessment Engine

Assessment Formula Engine

Academic Analytics

Rapor Generator

Dashboard

Portal Guru

Portal Wali Kelas

Portal Kepala Sekolah

Portal Orang Tua

Portal Siswa

Flutter Mobile

Web ERP

PWA

========================================================
KEAMANAN
========================================================

JWT

RBAC

Permission

Assignment

Scope

Audit Trail

========================================================
LARANGAN
========================================================

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Nilai

Hardcoded Ranking

Hardcoded KKM

Hardcoded Predikat

Perhitungan di Frontend

========================================================
OUTPUT
========================================================

Bangun menu ENTERPRISE AUTO LEGER WORKSPACE sebagai pusat pengolahan nilai otomatis yang menerima data dari Assessment Engine dan Formula Engine, menghitung total nilai, rata-rata, ranking, predikat, ketuntasan KKM, remedial, pengayaan, statistik, dan analitik secara otomatis di backend, menyediakan dashboard, rekap per kelas dan per mata pelajaran, fitur publish dan lock nilai, laporan PDF/Excel/CSV, serta terintegrasi penuh dengan Academic Analytics, Rapor Generator, Dashboard, Web ERP, Flutter Mobile, dan PWA menggunakan REST API yang aman, dinamis, dan siap digunakan pada lingkungan produksi.