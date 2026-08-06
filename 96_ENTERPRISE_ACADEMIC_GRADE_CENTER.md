Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.
JANGAN mengubah arsitektur.
JANGAN mengubah REST API.
JANGAN membuat business logic di frontend.
Implementasikan langsung production-ready.

TARGET

Bangun menu utama baru bernama ACADEMIC GRADE CENTER (AUTO LEGER) sebagai pusat pengolahan seluruh nilai akademik.

Seluruh nilai berasal dari Assessment Engine dan Assessment Formula Engine.

Semua perhitungan dilakukan di Backend melalui REST API.

================================================

WORKSPACE

Dashboard

Leger Kelas

Leger Mata Pelajaran

Leger Guru

Leger Wali Kelas

Ranking

KKM

Remedial

Pengayaan

Analitik

Approval Nilai

Publish Nilai

Riwayat Publish

Freeze Nilai

Audit Nilai

Cetak

Export

================================================

DASHBOARD

Jumlah Nilai Masuk

Belum Dinilai

Sudah Dinilai

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

================================================

AUTO LEGER

Generate otomatis setiap guru menyimpan nilai.

Auto Total

Auto Rata-rata

Auto Ranking

Auto Predikat

Auto KKM

Auto Ketuntasan

Auto Remedial

Auto Pengayaan

Auto Deskripsi

Auto Statistik

Auto Sinkron ke Dashboard

Auto Sinkron ke Analytics

Auto Sinkron ke Rapor

================================================

LEGER KELAS

Filter:

Tahun

Semester

Unit

Jenjang

Kelas

Wali Kelas

Tampilkan:

NIS

Nama

Semua Mapel

Nilai Akhir

Total

Rata-rata

Ranking

Predikat

KKM

Status

================================================

LEGER MAPEL

Filter:

Guru

Mapel

Kelas

Semester

Tampilkan:

Nilai seluruh siswa

Nilai tertinggi

Nilai terendah

Rata-rata

Distribusi

Ketuntasan

================================================

RANKING

Per Kelas

Per Jenjang

Per Unit

Per Semester

Per Tahun

Ranking mengikuti konfigurasi sistem.

================================================

KKM

Status:

Tuntas

Belum Tuntas

Remedial

Pengayaan

Mengikuti KKM setiap Mapel.

================================================

APPROVAL

Guru

↓

Wali Kelas

↓

Wakil Kurikulum

↓

Kepala Sekolah

↓

Publish

================================================

FREEZE

Nilai yang telah dipublish dapat dikunci.

Unlock hanya oleh Role yang memiliki permission.

================================================

VERSIONING

Simpan seluruh riwayat perubahan nilai.

Old Value

New Value

User

Tanggal

Jam

IP

Device

================================================

AUDIT

Catat seluruh aktivitas:

Input

Edit

Delete

Approval

Publish

Freeze

Unlock

================================================

ANALYTICS

Grafik Ketuntasan

Distribusi Nilai

Performa Guru

Performa Kelas

Performa Mapel

Perkembangan Semester

Top Student

Bottom Student

================================================

CETAK

Leger Kelas

Leger Mapel

Ranking

KKM

Remedial

Pengayaan

PDF

Excel

CSV

================================================

ROLE

Guru Mapel

→ hanya Mapel yang diampu

Wali Kelas

→ hanya kelas perwalian

Wakil Kurikulum

→ seluruh akademik

Kepala Sekolah

→ monitoring seluruh sekolah

Yayasan

→ monitoring seluruh unit

Super Admin

→ konfigurasi sistem

================================================

INTEGRASI

Assessment Engine

Formula Engine

KBM

Academic Analytics

Rapor Generator

Portal Guru

Portal Wali Kelas

Portal Kepala Sekolah

Portal Orang Tua

Portal Siswa

Flutter

PWA

================================================

VALIDASI

JWT

RBAC

Permission

Assignment

Scope

================================================

LARANGAN

Tidak boleh ada:

Dummy Data

Mock API

Hardcoded Nilai

Hardcoded Ranking

Hardcoded KKM

Hardcoded Predikat

Perhitungan di Frontend

================================================

OUTPUT

Bangun ENTERPRISE ACADEMIC GRADE CENTER sebagai pusat pengolahan nilai otomatis yang menghasilkan leger nilai, ranking, ketuntasan KKM, remedial, pengayaan, analitik, approval, publish, freeze, audit trail, laporan PDF/Excel/CSV, serta sinkron otomatis dengan Dashboard, Academic Analytics, dan Rapor Generator melalui REST API yang aman, dinamis, dan siap digunakan pada lingkungan produksi.