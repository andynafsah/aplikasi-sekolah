# 31_ENTERPRISE_RBAC_ROLE_PERMISSION_ENGINE.md

# ENTERPRISE ROLE BASED ACCESS CONTROL (RBAC) ENGINE

Version : 1.0 Enterprise

Architecture : Single Tenant

Database : MySQL

ORM : Prisma ORM

Backend : Laravel API

Frontend : React + Vite + Tailwind CSS

Status : Production Ready

---

# OBJECTIVE

Membangun sistem Dynamic Role Based Access Control (RBAC) yang sepenuhnya berasal dari Database.

Tidak boleh ada Role yang di-hardcode.

Tidak boleh ada Permission yang di-hardcode.

Tidak boleh ada Menu yang di-hardcode.

Tidak boleh ada Sidebar yang di-hardcode.

Semua Role, Permission, Menu, Dashboard, Widget, Assignment dan Data Scope berasal dari Database.

---

# PRINCIPLE

Role

↓

Permission

↓

Menu

↓

Sub Menu

↓

Button

↓

API

↓

Data Scope

↓

Dashboard

↓

Widget

↓

Activity

Semua bersifat dinamis.

---

# DEFAULT ROLE

SUPER_ADMIN

ADMINISTRATOR

KETUA_YAYASAN

KEPALA_SEKOLAH

WAKIL_KEPALA

BENDAHARA_YAYASAN

BENDAHARA_SEKOLAH

BENDAHARA_PKBM

OPERATOR

TU

GURU

GURU_MAPEL

WALI_KELAS

MUSYRIF

PEMBINA

PUSTAKAWAN

PETUGAS_KLINIK

SATPAM

PPDB

SISWA

SANTRI

WALI_SANTRI

ORANG_TUA

ALUMNI

AUDITOR

CUSTOM_ROLE

Role dapat ditambah dari frontend.

---

# ROLE MANAGEMENT

CRUD

Create

Edit

Delete

Clone Role

Copy Permission

Duplicate Role

Archive

Restore

Search

Filter

Export

Import

---

# PERMISSION

VIEW

CREATE

UPDATE

DELETE

RESTORE

ARCHIVE

APPROVE

REJECT

VERIFY

PUBLISH

UNPUBLISH

IMPORT

EXPORT

PRINT

DOWNLOAD

UPLOAD

GENERATE

SYNC

BACKUP

RESTORE_DATABASE

SYSTEM_SETTING

Semua Permission berasal dari Database.

---

# MENU PERMISSION

Dashboard

KBM

Leger

Rapor

Keuangan

PPDB

Sivitas

Inventaris

Perpustakaan

Tahfidz

Asrama

Yayasan

Laporan

Pengaturan

Audit

System

Semua Menu berasal dari Database.

---

# SUB MENU PERMISSION

Setiap Menu memiliki Sub Menu.

Setiap Sub Menu memiliki Permission sendiri.

Semua berasal dari Database.

---

# BUTTON PERMISSION

Tambah

Edit

Hapus

Simpan

Publish

Approval

Import

Export

Print

Download

Upload

Reset Password

Generate

Restore

Semua Button mengikuti Permission.

---

# API PERMISSION

GET

POST

PUT

PATCH

DELETE

APPROVE

EXPORT

IMPORT

Semua Endpoint wajib menggunakan Middleware Permission.

Tidak boleh bypass.

---

# DATA SCOPE

Semua query Prisma wajib otomatis difilter berdasarkan:

Unit

Jenjang

Kelas

Rombel

Guru

Mapel

Asrama

Semester

Tahun Ajaran

Academic Year

Assignment

Tidak boleh Guru melihat data guru lain.

Tidak boleh Guru melihat kelas lain.

Tidak boleh Wali Santri melihat anak lain.

Tidak boleh Bendahara melihat unit lain jika tidak memiliki hak akses.

---

# ASSIGNMENT ENGINE

Guru

↓

Unit

↓

Mapel

↓

Kelas

↓

Semester

↓

Academic Year

Guru dapat mengampu:

1 Unit

Banyak Unit

1 Kelas

Banyak Kelas

1 Mapel

Banyak Mapel

Semua Assignment berasal dari Database.

---

# DYNAMIC SIDEBAR

Sidebar tidak boleh di-hardcode.

Sidebar dibentuk berdasarkan:

Role

Permission

Assignment

Unit

Dashboard Template

Semua dari Database.

---

# DYNAMIC DASHBOARD

Dashboard setiap Role berbeda.

SUPER ADMIN

Server

Database

Backup

Audit

Statistik

Administrator

Monitoring Sistem

Operator

Monitoring Data

Guru

KBM

Jurnal

Absensi

Nilai

Leger

Wali Kelas

Rapor

Monitoring Siswa

Kepala Sekolah

Approval

Monitoring Guru

Monitoring KBM

Monitoring Nilai

Ketua Yayasan

Dashboard Seluruh Unit

Keuangan

Laporan

Monitoring

Siswa

Jadwal

Nilai

Rapor

Absensi

Wali Santri

Anak

Tagihan

Nilai

Absensi

Pengumuman

Semua Dashboard berasal dari Database.

---

# DYNAMIC WIDGET

Widget Dashboard berasal dari Database.

Widget dapat:

Tambah

Edit

Hapus

Urutkan

Resize

Hide

Show

Semua dari frontend.

---

# ROLE PREVIEW

SUPER_ADMIN dapat:

"Lihat Sebagai"

Guru

Wali Kelas

TU

Operator

Siswa

Wali Santri

Tanpa Login Ulang.

---

# SECURITY

JWT

Refresh Token

Permission Middleware

Assignment Middleware

Data Scope Middleware

Rate Limit

CSRF

XSS Protection

SQL Injection Protection

Encryption

Audit Trail

---

# AUDIT LOG

Login

Logout

CRUD

Approval

Delete

Restore

Export

Import

Print

Download

Reset Password

Semua aktivitas dicatat.

---

# DATABASE

roles

permissions

menus

submenus

menu_permissions

role_permissions

role_menus

role_widgets

widgets

dashboard_templates

dashboard_template_widgets

quick_actions

user_roles

teacher_assignments

student_assignments

guardian_assignments

user_units

user_classes

user_subjects

activity_logs

audit_logs

Semua menggunakan Prisma Relation.

---

# PRISMA

Relation

Foreign Key

Transaction

Soft Delete

Cascade

Repository Pattern

Service Layer

Validation

---

# SETTING

Semua Role dapat dibuat dari frontend.

Semua Permission dapat dibuat dari frontend.

Semua Menu dapat dibuat dari frontend.

Semua Dashboard dapat dibuat dari frontend.

Semua Widget dapat dibuat dari frontend.

Tidak perlu edit source code.

---

# FINAL QA

✓ Dynamic RBAC

✓ Dynamic Permission

✓ Dynamic Menu

✓ Dynamic Sidebar

✓ Dynamic Dashboard

✓ Dynamic Widget

✓ Dynamic Assignment

✓ Dynamic Data Scope

✓ Dynamic API Permission

✓ Dynamic Role

✓ Role Preview

✓ Audit Trail

✓ Activity Log

✓ Zero Hardcode

✓ Zero Dummy Data

✓ Zero Local Memory

✓ Zero SQL Error

✓ Zero Prisma Error

✓ Zero Runtime Error

✓ Production Ready

✓ Enterprise Ready

✓ Mobile Ready

✓ Future Ready