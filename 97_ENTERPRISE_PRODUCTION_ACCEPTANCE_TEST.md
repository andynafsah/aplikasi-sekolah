Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur.

JANGAN membuat fitur baru kecuali diperlukan agar fitur yang sudah ada dapat berjalan dengan benar.

Implementasikan production-ready.

========================================================

TARGET

Lakukan Enterprise Production Acceptance Test (PAT) terhadap seluruh aplikasi ERP.

Tujuan:

Memastikan seluruh fitur siap digunakan pada lingkungan produksi.

Tidak boleh ada dummy.

Tidak boleh ada mock.

Tidak boleh ada hardcode.

Seluruh data harus berasal dari database melalui REST API.

========================================================

PRODUCTION ACCEPTANCE TEST

Lakukan audit terhadap seluruh project.

Frontend.

Backend.

REST API.

Database.

Prisma ORM.

RBAC.

Flutter API.

Report Engine.

Notification Engine.

Print Engine.

Upload Engine.

========================================================

MENU TEST

Periksa seluruh menu.

Pastikan:

Menu dapat dibuka.

Menu tidak error.

Menu tidak blank.

Menu tidak crash.

Menu mengikuti Role.

Menu mengikuti Permission.

Menu mengikuti Assignment.

Menu mengikuti Scope.

========================================================

PAGE TEST

Seluruh halaman wajib:

Load normal.

Responsive.

Tidak blank.

Tidak error.

Tidak crash.

========================================================

BUTTON TEST

Klik seluruh tombol.

Pastikan semuanya bekerja.

Tambah

Simpan

Edit

Update

Delete

View

Detail

Preview

Approve

Reject

Upload

Download

Export PDF

Export Excel

Export CSV

Print

Search

Refresh

Filter

Sorting

Pagination

Duplicate

Archive

Restore

Share

Close

Cancel

========================================================

CRUD TEST

Seluruh modul wajib lulus:

Create

Read

Update

Delete

Soft Delete

Restore

Bulk Delete

Bulk Update

Import

Export

========================================================

MODAL TEST

Seluruh modal wajib:

Buka.

Tutup.

Simpan.

Update.

Delete.

Detail.

View.

History.

Audit.

Approval.

Reject.

Upload.

Preview.

========================================================

FORM TEST

Semua form wajib:

Validation.

Server Validation.

Loading.

Error.

Success.

Reset.

Cancel.

========================================================

DATABASE TEST

Pastikan:

Insert berhasil.

Update berhasil.

Delete berhasil.

Relasi benar.

Constraint benar.

Foreign Key benar.

Cascade benar.

========================================================

REST API TEST

Semua endpoint:

GET

POST

PUT

PATCH

DELETE

Multipart Upload

Pagination

Search

Filter

Sorting

Authentication

Authorization

Harus berhasil.

========================================================

RBAC TEST

Setiap Role wajib diuji.

Super Admin

Yayasan

Kepala Sekolah

Wakil Kepala

TU

Guru

Wali Kelas

Guru Mapel

Operator

Bendahara

Pegawai

Satpam

Musyrif

Siswa

Santri

Orang Tua

Guest

Pastikan hanya dapat mengakses fitur sesuai hak akses.

========================================================

ASSIGNMENT TEST

Pastikan:

Guru hanya melihat kelas yang diajar.

Wali Kelas hanya melihat kelasnya.

Bendahara hanya melihat modul keuangan sesuai tugas.

TU hanya melihat administrasi.

Orang Tua hanya melihat data anak.

Siswa hanya melihat data dirinya.

========================================================

DASHBOARD TEST

Dashboard:

Realtime.

API Driven.

Role Driven.

Permission Driven.

Assignment Driven.

Scope Driven.

========================================================

ATTENDANCE TEST

Guru.

Pegawai.

Siswa.

Santri.

QR.

Barcode.

GPS.

Geofence.

Riwayat.

Rekap.

Approval.

========================================================

KBM TEST

Jadwal.

Jurnal.

Absensi.

Penilaian.

Leger.

Rapor.

========================================================

REPORT TEST

Preview.

PDF.

Excel.

CSV.

Print.

========================================================

PRINT TEST

Seluruh dokumen.

Tidak boleh dummy.

Data berasal dari database.

========================================================

UPLOAD TEST

Foto.

PDF.

Excel.

Word.

Attachment.

Pastikan benar-benar tersimpan.

========================================================

DOWNLOAD TEST

Pastikan file dapat diunduh.

========================================================

SEARCH TEST

Global Search.

Local Search.

Advanced Filter.

========================================================

NOTIFICATION TEST

Push Notification.

Announcement.

Reminder.

Approval.

========================================================

PERFORMANCE TEST

Loading.

Pagination.

Lazy Loading.

Memory.

CPU.

Database Query.

========================================================

SECURITY TEST

JWT.

Refresh Token.

HTTPS.

RBAC.

Permission.

Assignment.

Audit Trail.

Rate Limit.

SQL Injection.

XSS.

CSRF.

========================================================

CODE QUALITY TEST

Tidak boleh ada:

Unused Import.

Unused Variable.

Duplicate Code.

Duplicate API.

Duplicate Component.

Duplicate State.

========================================================

FINAL CHECKLIST

Pastikan:

✓ Semua Menu Berfungsi

✓ Semua Halaman Berfungsi

✓ Semua CRUD Berfungsi

✓ Semua Modal Berfungsi

✓ Semua Button Berfungsi

✓ Semua Form Berfungsi

✓ Semua API Berfungsi

✓ Semua Database Sinkron

✓ Semua Report Berfungsi

✓ Semua Print Berfungsi

✓ Semua Upload Berfungsi

✓ Semua Download Berfungsi

✓ Semua Export Berfungsi

✓ Semua Dashboard Realtime

✓ Semua Notification Berfungsi

✓ Semua Role Berfungsi

✓ Semua Permission Berfungsi

✓ Semua Assignment Berfungsi

✓ Semua Scope Berfungsi

✓ Tidak Ada Dummy

✓ Tidak Ada Mock

✓ Tidak Ada Hardcode

✓ Tidak Ada Broken Link

✓ Tidak Ada Error Console

✓ Tidak Ada Error API

✓ Tidak Ada Query Gagal

✓ Tidak Ada Data Tidak Sinkron

========================================================

HASIL AKHIR

Buat laporan Production Acceptance Test yang berisi:

1. Daftar seluruh modul yang diuji.
2. Status setiap modul (PASS / FAIL).
3. Daftar bug yang ditemukan beserta lokasi dan penyebabnya.
4. Rekomendasi perbaikan untuk setiap bug.
5. Ringkasan tingkat kesiapan aplikasi.
6. Sertifikasi akhir apakah aplikasi layak digunakan pada lingkungan produksi.

Aplikasi hanya dinyatakan READY FOR PRODUCTION apabila seluruh pengujian kritis lulus dan tidak ada bug yang menyebabkan kegagalan fungsi utama.