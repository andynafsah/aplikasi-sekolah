# 52_ENTERPRISE_ASSESSMENT_FORMULA_ENGINE.md

# ENTERPRISE ASSESSMENT FORMULA ENGINE

Version

Enterprise 1.0

Architecture

Single Tenant

Laravel API

MySQL

Prisma ORM

React

Flutter Ready

Status

Production Ready

====================================================================

# OBJECTIVE

Bangun Enterprise Assessment Formula Engine sebagai pusat seluruh
perhitungan penilaian akademik.

Seluruh formula penilaian harus berasal dari database.

Tidak boleh ada rumus yang ditulis secara hardcode di frontend maupun backend.

Semua perubahan formula harus langsung memengaruhi:

Assessment

↓

Leger

↓

Rapor

↓

Dashboard

↓

Analitik

↓

Aplikasi Mobile

====================================================================

# CORE PRINCIPLE

Formula Driven

Database Driven

Rule Engine

Dynamic Configuration

No Hardcode

No Manual Calculation

====================================================================

# SUPPORTED CURRICULUM

Kurikulum Merdeka

Kurikulum Nasional

Pesantren

Madrasah

PKBM

Sekolah Internasional

Custom Curriculum

====================================================================

# ASSESSMENT COMPONENT

Penilaian Harian (PH)

Quiz

Tugas

Portofolio

Praktik

Project

PTS

PAS

PAT

Ujian Sekolah

Tahfidz

Mutabaah

Akhlak

Kehadiran

Ekstrakurikuler

====================================================================

# FORMULA CONFIGURATION

Setiap Formula memiliki:

ID

Kode

Nama Formula

Jenjang

Unit

Kelas

Mata Pelajaran

Semester

Tahun Ajaran

Status

Versi

Tanggal Berlaku

Tanggal Berakhir

====================================================================

# WEIGHT CONFIGURATION

Contoh

PH = 30%

PTS = 30%

PAS = 40%

Semua bobot disimpan di database.

Bobot dapat berbeda berdasarkan:

Unit

Jenjang

Kelas

Mapel

Semester

Tahun Ajaran

====================================================================

# FORMULA ENGINE

Contoh Formula

Nilai Akhir

=

(PH × Bobot PH)

+

(PTS × Bobot PTS)

+

(PAS × Bobot PAS)

Formula dapat diubah melalui menu Pengaturan.

====================================================================

# CUSTOM FORMULA

Administrator dapat membuat formula baru.

Contoh

((PH × 20%)

+

(Project × 30%)

+

(PTS × 20%)

+

(PAS × 30%))

Tidak perlu mengubah source code.

====================================================================

# FORMULA VALIDATION

Pastikan:

Total Bobot = 100%

Tidak ada bobot negatif

Tidak ada bobot lebih dari 100%

Tidak ada komponen ganda

====================================================================

# KKM ENGINE

KKM dapat diatur berdasarkan:

Unit

Jenjang

Kelas

Mapel

Semester

Tahun

Guru

KKM tidak boleh hardcode.

====================================================================

# PREDICATE ENGINE

Predikat berasal dari database.

Contoh

90–100 = A

80–89 = B

70–79 = C

0–69 = D

Administrator dapat mengubah rentang.

====================================================================

# DESCRIPTION ENGINE

Deskripsi otomatis berdasarkan:

Nilai

Kompetensi

CP

TP

KKM

Predikat

Contoh

"Sangat baik dalam memahami materi."

"Cukup memahami kompetensi."

"Perlu pendampingan."

Template dapat diubah.

====================================================================

# REMEDIAL ENGINE

Jika Nilai < KKM

↓

Generate Remedial

↓

Input Nilai

↓

Hitung ulang

↓

Update Leger

↓

Update Rapor

====================================================================

# ENRICHMENT ENGINE

Jika Nilai >= Ambang Pengayaan

↓

Generate Pengayaan

↓

Catat otomatis

====================================================================

# RANKING ENGINE

Hitung otomatis:

Ranking Kelas

Ranking Rombel

Ranking Tingkat

Ranking Unit

Ranking Semester

Ranking Tahunan

====================================================================

# STATISTICS ENGINE

Hitung otomatis:

Nilai Maksimum

Nilai Minimum

Rata-rata

Median

Modus

Standar Deviasi

Persentase Ketuntasan

Distribusi Nilai

====================================================================

# GRADE CONVERSION

Mendukung:

0–100

Huruf

Predikat

Skala 4

Skala 10

Custom Scale

====================================================================

# CP & TP ENGINE

Nilai dapat dikaitkan dengan:

Capaian Pembelajaran

Tujuan Pembelajaran

Alur Tujuan Pembelajaran

====================================================================

# TAHFIDZ FORMULA

Komponen:

Hafalan

Kelancaran

Makharijul Huruf

Tajwid

Adab

Nilai akhir dihitung otomatis.

====================================================================

# DINIYAH FORMULA

Komponen:

Fiqih

Aqidah

Hadits

Akhlak

Nahwu

Sharaf

Balaghah

Bahasa Arab

Formula dapat berbeda setiap mapel.

====================================================================

# APPROVAL FLOW

Guru

↓

Wali Kelas

↓

Waka Kurikulum

↓

Kepala Sekolah

↓

Finalisasi

====================================================================

# VERSIONING

Setiap perubahan formula:

Disimpan

Memiliki nomor versi

Tidak mengubah histori nilai lama

====================================================================

# SIMULATION

Administrator dapat mensimulasikan formula
sebelum digunakan.

====================================================================

# AUDIT LOG

Catat:

Membuat Formula

Mengubah Formula

Menghapus Formula

Mengaktifkan Formula

Menonaktifkan Formula

====================================================================

# API

GET

/api/v1/formulas

GET

/api/v1/formulas/{id}

POST

/api/v1/formulas

PUT

/api/v1/formulas/{id}

DELETE

/api/v1/formulas/{id}

POST

/api/v1/formulas/simulate

POST

/api/v1/formulas/validate

====================================================================

# SETTINGS

Aktifkan Formula

Default Formula

Default KKM

Default Predikat

Default Skala

Auto Ranking

Auto Remedial

Auto Pengayaan

====================================================================

# RBAC

Super Admin

Administrator

Kepala Sekolah

Wakil Kurikulum

Guru

Hak akses berdasarkan Permission Engine.

====================================================================

# INTEGRATION

Academic Engine

KBM Engine

Assessment Engine

Auto Leger Engine

Rapor Engine

Analytics Engine

Dashboard Engine

Notification Engine

Audit Engine

Print Engine

Document Engine

Mobile API Gateway

Flutter

====================================================================

# VALIDATION

Tidak boleh ada:

Hardcoded Formula

Hardcoded Bobot

Hardcoded KKM

Hardcoded Predikat

Manual Ranking

Manual Ketuntasan

Manual Perhitungan

Dummy Formula

Mock Formula

====================================================================

# OUTPUT

Bangun Enterprise Assessment Formula Engine.

Seluruh formula berasal dari database.

Seluruh perhitungan dilakukan otomatis.

Seluruh perubahan formula langsung
tersinkron ke Leger, Rapor, Dashboard,
Analitik, dan Mobile.

====================================================================

# TARGET

100% Dynamic Formula

100% Dynamic Weight

100% Dynamic KKM

100% Dynamic Predicate

100% Dynamic Description

100% Automatic Calculation

100% Automatic Ranking

100% Automatic Statistics

100% CRUD Complete

100% API Ready

100% Flutter Ready

100% Production Ready

Zero Hardcode

Zero Dummy Formula

Zero Manual Calculation

Zero Duplicate Formula

Zero Broken Relation

Enterprise Assessment Formula Ready