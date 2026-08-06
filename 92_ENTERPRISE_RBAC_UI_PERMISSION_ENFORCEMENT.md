Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah REST API.

JANGAN membuat business logic di frontend.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Lakukan Enterprise RBAC UI Enforcement terhadap seluruh aplikasi.

Pastikan setiap Role hanya dapat melihat dan mengakses halaman, menu, fitur, tombol, widget, dashboard, data, dan endpoint API sesuai hak aksesnya.

ERP ini akan langsung digunakan pada lingkungan produksi.

Hilangkan seluruh halaman simulasi, demo, development, dan testing.

========================================================

RBAC

Seluruh aplikasi wajib menggunakan:

Role

Permission

Assignment

Scope

Unit

Academic Year

Semester

========================================================

ROLE

Super Administrator

Yayasan

Direktur

Kepala Sekolah

Wakil Kepala

Kepala TU

TU

Operator

Guru

Guru Mapel

Wali Kelas

Musyrif

Pembina Asrama

Bendahara Yayasan

Bendahara BOS

Bendahara SPP

HRD

Perpustakaan

Laboran

Satpam

Cleaning Service

Pegawai

Siswa

Santri

Orang Tua

========================================================

MENU

Menu harus berasal dari database.

Tidak boleh hardcoded.

User hanya melihat menu yang memiliki permission.

========================================================

DASHBOARD

Dashboard harus dibangun berdasarkan:

Role

Permission

Assignment

Scope

Widget yang tidak memiliki izin tidak boleh ditampilkan.

========================================================

HALAMAN

Seluruh halaman harus divalidasi.

Jika tidak memiliki hak akses:

403 Forbidden

Tidak boleh hanya menyembunyikan menu.

URL juga harus dilindungi.

========================================================

BUTTON

Button berikut hanya muncul jika user memiliki permission:

Create

Edit

Update

Delete

Restore

Approve

Reject

Upload

Download

Export

Import

Print

Share

Archive

Duplicate

========================================================

MODAL

Modal hanya dapat dibuka jika user memiliki permission.

========================================================

DATA

Seluruh data mengikuti Scope.

Guru hanya melihat:

Kelas yang diajar.

Mapel yang diampu.

Jadwal sendiri.

Nilai sendiri.

========================================================

WALI KELAS

Hanya melihat:

Kelas perwalian.

Absensi kelas.

Leger kelas.

Rapor kelas.

========================================================

TU

Hanya melihat:

Administrasi.

Data siswa.

Surat.

Arsip.

Mutasi.

========================================================

BENDAHARA

Hanya melihat:

Billing.

SPP.

Kas.

Keuangan.

Approval sesuai tugas.

========================================================

KEPALA SEKOLAH

Melihat seluruh data unit sekolah.

Tidak dapat mengubah konfigurasi Super Admin.

========================================================

YAYASAN

Melihat seluruh unit.

Monitoring.

Analitik.

Laporan.

========================================================

SUPER ADMIN

Hanya Super Admin yang dapat melihat:

System Settings

Master Configuration

Role

Permission

Assignment

API Management

System Log

Audit

Backup

Restore

Database Utility

Scheduler

Queue

Storage

Environment

Developer Tools

Monitoring Server

========================================================

HILANGKAN

Hapus seluruh:

Simulation Attendance

Demo Attendance

Sample Dashboard

Development Menu

Testing Menu

Sandbox

Dummy Page

Preview Dummy

Mock API Viewer

Sample Widget

Developer Panel

Debug Menu

========================================================

SMART ATTENDANCE

Gunakan sistem produksi.

Tidak ada lagi halaman simulasi.

Semua absensi harus langsung menggunakan:

REST API

Database

RBAC

QR

Barcode

GPS

Approval

========================================================

API

Seluruh endpoint wajib memvalidasi:

JWT

Role

Permission

Assignment

Scope

========================================================

ROUTE

Seluruh route wajib menggunakan Route Guard.

Jika tidak memiliki permission:

Redirect ke halaman 403.

========================================================

403 PAGE

Tampilkan halaman:

Access Denied

Tidak memiliki hak akses.

Hubungi Administrator.

========================================================

FRONTEND

Tidak boleh merender:

Menu

Widget

Card

Button

Modal

Shortcut

Floating Action Button

Quick Action

Jika user tidak memiliki permission.

========================================================

BACKEND

Tidak boleh mengembalikan data di luar scope user.

========================================================

FLUTTER

Flutter wajib menggunakan:

Role

Permission

Assignment

Scope

yang dikirim dari REST API.

Tidak boleh hardcoded.

========================================================

PWA

Menggunakan aturan yang sama.

========================================================

VALIDATION

Pastikan:

✓ Guru tidak melihat menu Super Admin.

✓ TU tidak melihat konfigurasi sistem.

✓ Bendahara tidak melihat menu akademik yang tidak menjadi tugasnya.

✓ Siswa tidak melihat data siswa lain.

✓ Orang Tua hanya melihat data anaknya.

✓ Wali Kelas hanya melihat kelas perwaliannya.

✓ Guru Mapel hanya melihat kelas yang diajar.

✓ Kepala Sekolah tidak dapat mengubah konfigurasi Super Admin.

✓ Yayasan tidak melihat menu Developer.

✓ Tidak ada halaman simulasi.

✓ Tidak ada dummy.

✓ Tidak ada mock.

✓ Tidak ada hardcode.

========================================================

OUTPUT

Bangun sistem Enterprise RBAC UI Enforcement yang memastikan seluruh menu, dashboard, halaman, widget, tombol, modal, data, dan endpoint API mengikuti Role, Permission, Assignment, dan Scope secara dinamis. Hapus seluruh fitur simulasi, demo, development, testing, dan dummy sehingga ERP siap digunakan pada lingkungan produksi dengan keamanan dan isolasi hak akses yang ketat.