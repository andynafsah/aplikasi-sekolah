# 38_ENTERPRISE_CURRICULUM_SUBJECT_ENGINE.md

# ENTERPRISE CURRICULUM & SUBJECT MANAGEMENT ENGINE

Version

Enterprise 1.0

Architecture

Single Tenant

Laravel API

MySQL

Prisma ORM

React

Vite

TailwindCSS

Flutter Ready

Status

Production Ready

---

# OBJECTIVE

Bangun Enterprise Curriculum & Subject Management Engine yang sepenuhnya dinamis.

Tidak boleh ada Hardcoded Mata Pelajaran.

Tidak boleh ada Hardcoded Kurikulum.

Seluruh konfigurasi berasal dari Database.

Mendukung:

✓ SD

✓ SMP

✓ SMA

✓ SMK

✓ Pondok Pesantren

✓ PKBM

✓ Madrasah

✓ Multi Unit

---

# MASTER KURIKULUM

Buat tabel

curriculums

Field

id

kode

nama

deskripsi

tahun_ajaran

semester

jenjang

unit

status

created_at

updated_at

Soft Delete

CRUD Lengkap

---

# MASTER KATEGORI MAPEL

Buat tabel

subject_categories

Kategori bawaan

Umum

Diniyah

Hayah

Tahfidz

Kepesantrenan

Muatan Lokal

Ekstrakurikuler

Life Skill

Keasramaan

Bahasa

Keorganisasian

Semua dapat ditambah.

Tidak Hardcode.

---

# MASTER MATA PELAJARAN

Buat tabel

subjects

Field

id

kode_mapel

nama_mapel

nama_arab

nama_inggris

kategori_id

kurikulum_id

jenjang

unit

semester

kkm

bobot

jam_per_minggu

warna

icon

urutan

is_rapor

is_leger

is_absensi

is_tahfidz

is_active

created_at

updated_at

deleted_at

---

# CONTOH MAPEL UMUM

Pendidikan Agama Islam

Pendidikan Pancasila

Bahasa Indonesia

Matematika

IPA

IPS

IPAS

Bahasa Inggris

PJOK

Seni Budaya

Informatika

Muatan Lokal

---

# CONTOH MAPEL DINIYAH

Al-Qur'an

Tahsin

Tahfidz

Tajwid

Fiqih

Ushul Fiqih

Hadits

Musthalah Hadits

Ulumul Hadits

Tafsir

Ulumul Qur'an

Aqidah

Akhlak

Sirah Nabawiyah

Tarikh Islam

Nahwu

Sharaf

Balaghah

Mantiq

Bahasa Arab

Imla'

Mahfuzhat

Khat

---

# CONTOH MAPEL HAYAH

Adab Harian

Life Skill

Leadership

Muhadharah

Khitobah

Public Speaking

Pramuka

Olahraga

Kaligrafi

Komputer

Literasi Digital

Organisasi Santri

Kedisiplinan

Kebersihan

Kemandirian

---

# CONTOH MAPEL TAHFIDZ

Setoran Hafalan

Murajaah

Tasmi'

Imtihan Tahfidz

Tahsin

---

# CONTOH MAPEL KEPESANTRENAN

Mutaba'ah Yaumiyah

Pembinaan Akhlak

Bahasa Arab Aktif

Bahasa Inggris Aktif

Pembinaan Asrama

Ibadah Harian

---

# KKM

Setiap mapel memiliki

KKM

Predikat

Bobot

Penilaian

Remedial

Pengayaan

Semua dinamis.

---

# CP

Learning Outcome

Dinamis

Per Jenjang

Per Kurikulum

Per Semester

---

# TP

Learning Objective

Dinamis

---

# ATP

Alur Tujuan Pembelajaran

Dinamis

---

# PLOTTING GURU

Setiap mapel dapat memiliki

Guru Utama

Guru Pendamping

Musyrif

Wali Kelas

Guru dapat mengampu lebih dari satu mapel.

Guru dapat mengampu lebih dari satu kelas.

Guru hanya melihat mapel yang diampunya.

---

# RELASI

Subject

↓

Teacher Assignment

↓

Schedule

↓

Attendance

↓

Journal

↓

Assessment

↓

Leger

↓

Rapor

↓

Dashboard

↓

Mobile

Semua sinkron otomatis.

---

# KBM

Saat membuat KBM

Mapel dipilih dari Database.

Tidak boleh diketik manual.

---

# LEGGER

Leger otomatis membuat kolom sesuai mapel.

Tidak Hardcode.

Jumlah mapel menyesuaikan Database.

---

# RAPOR

Mapel muncul otomatis.

Kelompok mapel otomatis.

Predikat otomatis.

KKM otomatis.

Deskripsi otomatis.

---

# DASHBOARD

Guru hanya melihat

Mapel

Kelas

Unit

yang diampu.

---

# MOBILE

Endpoint

/api/subjects

/api/subject-categories

/api/curriculums

/api/teacher-subjects

/api/student-subjects

Semua REST API.

---

# IMPORT

Excel

CSV

ODS

---

# EXPORT

PDF

Excel

CSV

Word

Print

---

# FILTER

Jenjang

Unit

Semester

Kategori

Guru

Status

---

# SEARCH

Kode

Nama

Kategori

Guru

Jenjang

---

# BULK ACTION

Bulk Import

Bulk Export

Bulk Delete

Bulk Archive

Bulk Restore

Bulk Activate

Bulk Deactivate

---

# AUDIT LOG

Tambah

Edit

Hapus

Restore

Import

Export

Approval

Semua dicatat.

---

# VALIDATION

Tidak boleh ada:

Hardcoded Subject

Hardcoded Curriculum

Hardcoded KKM

Hardcoded CP

Hardcoded TP

Hardcoded ATP

Hardcoded Semester

Hardcoded Unit

---

# OUTPUT

Lakukan refactor penuh.

Hubungkan seluruh modul:

KBM

Leger

Nilai

Rapor

Jadwal

Dashboard

Teacher Assignment

Mobile API

Prisma ORM

MySQL

Role RBAC

Assignment

Data Scope

Semua berasal dari Database.

---

# TARGET

100% Dynamic Curriculum

100% Dynamic Subject

100% Dynamic KKM

100% Dynamic CP

100% Dynamic TP

100% Dynamic ATP

100% Database Driven

100% CRUD

100% RBAC

100% Assignment

100% Mobile Ready

Zero Hardcode

Zero Dummy Data

Zero Broken Relation

Zero Duplicate Subject

Production Ready

Enterprise Ready