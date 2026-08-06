Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Bangun Enterprise Policy Engine sebagai pusat seluruh keputusan hak akses.

Policy Engine berada di backend.

Frontend (React, Flutter, PWA) hanya membaca hasil policy melalui REST API.

Tidak boleh ada pengecekan permission yang di-hardcode pada frontend.

========================================================

CORE ACCESS MODEL

Seluruh hak akses wajib ditentukan berdasarkan:

Role

Permission

Assignment

Scope

Policy

Feature Flag

Academic Year

Semester

Unit

Status User

========================================================

ACCESS FLOW

User Login

↓

JWT Validation

↓

Role Validation

↓

Permission Validation

↓

Assignment Validation

↓

Scope Validation

↓

Policy Validation

↓

Feature Flag Validation

↓

API Response

↓

Frontend Render

========================================================

ROLE

Gunakan seluruh Role ERP yang sudah ada.

Tidak boleh hardcoded.

========================================================

PERMISSION

Permission minimal:

View

Create

Edit

Delete

Approve

Reject

Restore

Print

Export

Import

Upload

Download

Share

Archive

Duplicate

========================================================

ASSIGNMENT

Guru

↓

Kelas

↓

Mapel

↓

Shift

↓

Unit

↓

Semester

↓

Tahun Ajaran

Semua Assignment berasal dari database.

========================================================

SCOPE

Contoh Scope:

Own Data

Own Class

Own Subject

Own Unit

School

Foundation

Global

========================================================

POLICY ENGINE

Policy harus mampu menentukan:

Boleh membuka halaman

Boleh membuka menu

Boleh membuka widget

Boleh membuka modal

Boleh melihat data

Boleh mengubah data

Boleh menghapus data

Boleh mencetak

Boleh export

Boleh import

Boleh approval

========================================================

FEATURE FLAG

Feature Flag berasal dari database.

Contoh:

Attendance

Payroll

Tahfidz

Asrama

Inventory

CBT

Library

Billing

Finance

AI

LMS

Jika modul dimatikan:

Menu hilang.

Route tidak aktif.

Endpoint ditolak.

========================================================

API POLICY

Seluruh endpoint wajib memanggil Policy Engine.

Tidak boleh bypass.

========================================================

ROUTE GUARD

Seluruh route wajib menggunakan:

Authentication Guard

Authorization Guard

Policy Guard

========================================================

UI

Frontend hanya merender:

Menu

Dashboard

Widget

Button

Modal

Shortcut

berdasarkan policy yang diterima dari backend.

========================================================

403

Jika policy gagal:

403 Forbidden

Tidak memiliki hak akses.

========================================================

AUDIT

Catat:

User

Role

Permission

Assignment

Scope

Policy

IP

Device

Tanggal

Jam

========================================================

VALIDATION

Guru tidak dapat melihat kelas guru lain.

Guru Mapel tidak dapat mengubah kelas lain.

Wali Kelas hanya melihat kelas perwaliannya.

Bendahara hanya melihat keuangan.

TU hanya melihat administrasi.

Siswa hanya melihat data sendiri.

Orang Tua hanya melihat anaknya.

Super Admin melihat seluruh sistem.

========================================================

FLUTTER

Flutter tidak boleh menyimpan policy tetap.

Seluruh policy berasal dari REST API.

========================================================

PWA

Menggunakan policy yang sama.

========================================================

WEB

Menggunakan policy yang sama.

========================================================

LARANGAN

Tidak boleh ada:

Hardcoded Permission

Hardcoded Role

Hardcoded Menu

Hardcoded Widget

Hardcoded Button

Hardcoded Policy

========================================================

OUTPUT

Bangun Enterprise Policy Engine sebagai pusat pengambilan keputusan hak akses. Seluruh aplikasi Web, Flutter, dan PWA wajib menggunakan policy yang sama melalui REST API sehingga Role, Permission, Assignment, Scope, dan Feature Flag selalu sinkron, aman, dinamis, dan siap digunakan pada lingkungan produksi.