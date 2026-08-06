# 46_ENTERPRISE_HR_ACCOUNT_RBAC_ASSIGNMENT_ENGINE.md

# ENTERPRISE HR • ACCOUNT • RBAC • ASSIGNMENT ENGINE

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

=================================================================

# OBJECTIVE

Bangun Enterprise Human Resource Engine sebagai pusat identitas seluruh pegawai.

Seluruh akun aplikasi harus berasal dari satu data Pegawai.

Tidak boleh ada akun Guru terpisah.

Tidak boleh ada akun TU terpisah.

Tidak boleh ada akun Bendahara terpisah.

Tidak boleh ada akun Kepala Sekolah terpisah.

Semua berasal dari tabel Pegawai.

=================================================================

# KONSEP UTAMA

Pegawai

↓

Akun Login

↓

Role

↓

Jabatan

↓

Assignment

↓

Permission

↓

Dashboard

↓

Menu

↓

Data Scope

↓

Hak Akses

=================================================================

# ARSITEKTUR

Satu Pegawai

=

Satu Akun Login

Tetapi

dapat memiliki

banyak Role

banyak Jabatan

banyak Kelas

banyak Mata Pelajaran

banyak Unit

banyak Tugas Tambahan

=================================================================

# CONTOH

Nama

Muhammad Andi

Status

Pegawai

Akun

muhammad.andi

Role

Guru

Role

Wali Kelas

Role

Wakil Kepala Sekolah

Role

Bendahara BOS

Jabatan

Guru Tetap

Jabatan

Koordinator Kurikulum

Assignment

Kelas X IPA 1

Assignment

Kelas X IPA 2

Assignment

Matematika

Assignment

Fisika

Semua menggunakan SATU akun.

=================================================================

# DATABASE

employees

employee_accounts

roles

permissions

role_permissions

employee_roles

positions

employee_positions

teacher_assignments

class_assignments

subject_assignments

unit_assignments

homeroom_assignments

department_assignments

additional_assignments

employee_permissions

login_histories

employee_sessions

Semua menggunakan Foreign Key.

=================================================================

# EMPLOYEE

Master Pegawai.

Data

NIP

NIY

Nama

Foto

JK

TTL

Agama

Alamat

No HP

Email

Pendidikan

Status

Golongan

Jenis Pegawai

Tanggal Masuk

Status Aktif

NPWP

BPJS

Bank

Nomor Rekening

QR Pegawai

Barcode Pegawai

=================================================================

# LOGIN ACCOUNT

Setiap Pegawai

memiliki

SATU akun login.

Username

Email

Password

2FA

PIN

Status

Last Login

Device

Token

=================================================================

# ROLE

Contoh

Super Admin

Administrator

Operator

TU

Guru

Guru BK

Guru Mapel

Guru Tahfidz

Guru Diniyah

Guru Hayah

Guru Ekstra

Musyrif

Wali Kelas

Kepala Sekolah

Wakil Kurikulum

Wakil Kesiswaan

Wakil Sarpras

Wakil Humas

Ketua Yayasan

Sekretaris Yayasan

Bendahara Yayasan

Bendahara BOS

Bendahara Komite

Petugas Perpustakaan

Petugas UKS

Satpam

Office Boy

Driver

Semua CRUD.

=================================================================

# JABATAN

Terpisah dari Role.

Contoh

Guru Tetap

Guru Honorer

Staff TU

Operator

Koordinator

Supervisor

Manager

Direktur

Kepala Sekolah

Ketua Yayasan

Semua CRUD.

=================================================================

# ASSIGNMENT

Pegawai dapat memiliki

lebih dari satu Assignment.

=================================================================

# CLASS ASSIGNMENT

Pilih

Unit

↓

Jenjang

↓

Kelas

↓

Rombel

Guru dapat mengampu

lebih dari satu kelas.

=================================================================

# SUBJECT ASSIGNMENT

Pilih

Unit

↓

Jenjang

↓

Mapel

↓

Kelas

↓

Semester

Guru dapat mengampu

banyak Mapel.

=================================================================

# HOMEROOM ASSIGNMENT

Pilih

Wali Kelas

↓

Kelas

↓

Semester

↓

Tahun Ajaran

=================================================================

# UNIT ASSIGNMENT

Pegawai dapat bekerja di

SD

SMP

SMA

SMK

PKBM

Pondok

Yayasan

Lebih dari satu Unit.

=================================================================

# ADDITIONAL ASSIGNMENT

Tugas Tambahan

Contoh

Operator Dapodik

Admin ARKAS

BOS

Koordinator Tahfidz

Pembina Pramuka

Pembina OSIS

Tim IT

Tim PPDB

Panitia

Tidak membatasi Role utama.

=================================================================

# DATA SCOPE

Inilah yang menentukan data yang boleh dilihat.

Contoh

Guru Matematika

↓

Hanya melihat

kelas yang diampu.

Guru Tahfidz

↓

Hanya melihat

santri yang diampu.

Bendahara BOS

↓

Hanya melihat

keuangan BOS.

Kepala Sekolah

↓

Melihat seluruh unit sekolah.

=================================================================

# PERMISSION

Permission berasal dari

Database.

Tidak Hardcode.

Contoh

student.read

student.create

student.update

student.delete

ledger.input

ledger.approval

rapor.publish

finance.payment

inventory.create

Semua CRUD.

=================================================================

# MENU ENGINE

Sidebar dibangun

dari Permission.

Tidak boleh

if(role=="guru")

Semua dari Database.

=================================================================

# DASHBOARD

Dashboard berasal dari

Role

+

Assignment

+

Permission

+

Data Scope

Bukan Hardcode.

=================================================================

# LOGIN ENGINE

Saat Login

↓

Validasi User

↓

Validasi Status Pegawai

↓

Ambil Role

↓

Ambil Jabatan

↓

Ambil Assignment

↓

Ambil Permission

↓

Bangun Session

↓

Bangun Dashboard

↓

Bangun Sidebar

↓

Bangun Widget

↓

Bangun Data Scope

Secara otomatis.

=================================================================

# MULTI ROLE

Contoh

Guru

+

Wali Kelas

+

Bendahara

+

Operator

Menggunakan

SATU akun.

Permission digabung.

Conflict Resolver otomatis.

=================================================================

# CONFLICT RESOLUTION

Jika memiliki

lebih dari satu Role

gunakan

Permission Union.

Jika ada konflik

gunakan

Priority Level.

Contoh

Super Admin

100

Kepala Sekolah

90

Administrator

80

Guru

50

=================================================================

# MOBILE

Login menggunakan

API yang sama.

Flutter

Android

iOS

=================================================================

# AUDIT LOG

Login

Logout

Role berubah

Permission berubah

Assignment berubah

Password berubah

Semua dicatat.

=================================================================

# VALIDATION

Tidak boleh ada

Role Hardcode

Permission Hardcode

Dashboard Hardcode

Sidebar Hardcode

Assignment Hardcode

Dummy Data

Mock Data

=================================================================

# INTEGRASI

RBAC Engine

Dashboard Engine

KBM

Assessment

Leger

Rapor

Keuangan

Payroll

Absensi

Tahfidz

Mutabaah

Sivitas

Surat

Dapodik

Document Engine

Notification

Mobile API

Prisma ORM

MySQL

=================================================================

# OUTPUT

Refactor seluruh sistem akun.

Seluruh identitas berasal dari Pegawai.

Semua hak akses berasal dari Database.

Semua dashboard berasal dari Role dan Assignment.

Semua menu berasal dari Permission.

Seluruh Data Scope otomatis mengikuti Assignment.

=================================================================

# TARGET

100% Single Account

100% Multi Role

100% Multi Position

100% Multi Assignment

100% Dynamic Permission

100% Dynamic Sidebar

100% Dynamic Dashboard

100% Dynamic Data Scope

100% Database Driven

100% RBAC

100% CRUD Complete

100% Mobile Ready

100% Production Ready

Zero Hardcode

Zero Dummy Data

Zero Duplicate Employee

Zero Duplicate Login

Zero Broken Permission

Zero Runtime Error

Zero SQL Error

Zero Prisma Error

Enterprise Ready