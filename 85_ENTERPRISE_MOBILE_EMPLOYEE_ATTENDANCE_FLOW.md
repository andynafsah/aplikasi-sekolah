Lanjutkan project ERP yang sudah ada.

Jangan membuat project baru.
Jangan mengubah module yang sudah selesai kecuali diperlukan.

Implementasikan langsung production-ready.

Gunakan arsitektur yang sudah ada:

Frontend:
React + TypeScript + Vite
Tailwind CSS

Backend:
Node.js + Express + TypeScript
Prisma ORM
Database

Mobile:
Flutter menggunakan REST API yang sama.

Gunakan:
RBAC Engine
Employee Engine
Attendance Engine
Teacher Workspace
Payroll Engine
Notification Engine
Audit Trail
Calendar Engine
Assignment Engine

==================================================

TARGET

Bangun Mobile Employee Attendance Flow.

Digunakan untuk:

Guru

Pegawai

TU

Bendahara

Operator

Staff Yayasan

Musyrif

Satpam

Cleaning Service


Database driven.
Zero hardcode.
Zero dummy data.

==================================================

LOGIN FLOW

Mobile login menggunakan API ERP.

Setelah login ambil:

User

Role

Permission

Jabatan

Unit

Assignment

Shift

Jadwal

==================================================

DASHBOARD DINAMIS

Tampilkan sesuai role.

Guru:

Status absensi

Jadwal mengajar

KBM hari ini

Jurnal

Absensi siswa

Nilai


Pegawai:

Status absensi

Shift

Jam kerja

Tugas

Payroll summary


Menu berdasarkan RBAC.

==================================================

CHECK IN FLOW

User klik:

ABSEN MASUK


Flutter mengambil:

GPS

Latitude

Longitude

Accuracy

Device ID

Time


User scan:

Dynamic QR

Barcode


Kirim ke API:

POST /attendance/check-in


==================================================

BACKEND VALIDATION

Sebelum simpan wajib cek:

User aktif

Role valid

Permission valid

QR valid

QR belum expired

GPS valid

Geofence valid

Device valid

Shift sesuai

Jadwal sesuai

Belum absen hari ini


==================================================

ATTENDANCE STATUS

Generate otomatis:

Hadir

Terlambat

Izin

Sakit

Cuti

DL

WFH

Alpha


==================================================

CHECK OUT FLOW

User klik:

ABSEN PULANG


Validasi:

QR

GPS

Device

Jam kerja


Simpan:

Check out time

Durasi kerja

Lembur

==================================================

GURU INTEGRATION

Jika role Guru:

Attendance sukses membuka:

Teacher Workspace


Terhubung:

Jadwal KBM

Jurnal Mengajar

Absensi Siswa

Input Nilai

Leger


Guru yang belum check-in tidak dapat membuka KBM jika aturan diaktifkan.

==================================================

EMPLOYEE INTEGRATION

Jika role Pegawai:

Terhubung:

Shift

Jam Kerja

Lembur

Payroll

Potongan

Insentif


==================================================

MANUAL ATTENDANCE

Jika gagal QR/GPS:

Buat:

Pengajuan Absensi Manual


Field:

Tanggal

Jam

Lokasi

Alasan

Foto Bukti


Masuk approval:

Kepala TU

Kepala Sekolah

Yayasan


==================================================

SECURITY

Implementasikan:

Dynamic QR

QR Expired

Anti Replay

Anti Duplicate

Device Binding

GPS Validation

Audit Log


==================================================

NOTIFICATION

Kirim notifikasi:

Absensi berhasil

Terlambat

Belum check-in

Belum check-out

Approval berhasil

Approval ditolak


==================================================

REPORT

Buat laporan:

Absensi harian

Absensi bulanan

Rekap guru

Rekap pegawai

Keterlambatan

Lembur

Izin

Cuti


Support:

Preview

Print

PDF

Excel

CSV


==================================================

API CONTRACT

Gunakan REST API:

POST /api/auth/login

POST /api/attendance/check-in

POST /api/attendance/check-out

GET /api/attendance/today

GET /api/attendance/history

POST /api/attendance/manual-request

GET /api/attendance/report


==================================================

DATABASE

Gunakan Prisma ORM.

Pastikan relasi:

User

Employee

Role

Permission

Assignment

Attendance

Shift

Schedule

Payroll

AuditLog


tidak terputus.

==================================================

VALIDATION

Pastikan:

Tidak ada mock data.

Tidak ada localStorage sebagai database.

Tidak ada hardcoded role.

Tidak ada duplicate logic Flutter dan Backend.


==================================================

OUTPUT

Bangun Mobile Employee Attendance Flow yang terintegrasi penuh dengan ERP Web.

Satu API.

Satu Database.

Satu RBAC.

Satu Business Logic.

Siap produksi untuk sekolah, pondok pesantren, yayasan, dan PKBM.