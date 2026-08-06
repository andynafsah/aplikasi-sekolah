Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur yang sudah stabil.

JANGAN menghapus fitur yang sudah selesai kecuali benar-benar diperlukan.

Seluruh implementasi harus mengikuti arsitektur project yang sudah ada.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================
TARGET
========================================================

Lakukan audit menyeluruh, validasi, sinkronisasi, refactor, optimasi, dan hardening terhadap seluruh aplikasi ERP agar siap digunakan pada lingkungan produksi.

Pastikan seluruh modul, halaman, menu, API, database, relasi, workflow, dan business process bekerja secara konsisten.

Jangan menghasilkan kode contoh, mock, dummy, atau placeholder.

Jika menemukan masalah, perbaiki langsung tanpa mengubah arsitektur inti.

========================================================
ARSITEKTUR
========================================================

Pertahankan arsitektur yang sudah ada.

Frontend

React 18

TypeScript

Vite

TailwindCSS

Framer Motion

Lucide React

Backend

Node.js

Express.js

TypeScript

Prisma ORM

PostgreSQL

REST API

JWT

RBAC

Audit Trail

Flutter Mobile

PWA

========================================================
DATABASE
========================================================

Audit seluruh schema database.

Pastikan:

Foreign Key valid.

Primary Key valid.

Unique Constraint valid.

Cascade Rule benar.

Index optimal.

Relasi One To One benar.

Relasi One To Many benar.

Relasi Many To Many benar.

Tidak ada tabel yatim (orphan).

Tidak ada relasi putus.

Tidak ada query yang tidak digunakan.

Tidak ada duplikasi struktur.

Seluruh data menggunakan database sebagai sumber utama.

========================================================
REST API
========================================================

Audit seluruh endpoint.

Pastikan:

CRUD lengkap.

HTTP Status benar.

Validation lengkap.

Pagination.

Filtering.

Sorting.

Searching.

Bulk Action bila diperlukan.

Error Handling konsisten.

Response konsisten.

Versioning siap.

Swagger/OpenAPI (jika digunakan) diperbarui.

========================================================
BUSINESS LOGIC
========================================================

Pastikan seluruh business logic berada di Backend.

Frontend hanya bertugas:

Render UI.

Mengirim request.

Menampilkan response.

Tidak boleh ada perhitungan bisnis penting di frontend.

========================================================
SINKRONISASI MODUL
========================================================

Pastikan seluruh modul saling terhubung secara otomatis sesuai alur bisnis.

Contoh integrasi:

Login → Dashboard → Role → Menu → Permission.

Pegawai → Akun Login → Role → Jabatan → Assignment → Scope.

Siswa → Kelas → Rombel → Wali Kelas → Jadwal → KBM.

Guru → Jadwal → KBM → Penilaian → Leger → Analitik → Rapor.

Absensi → Dashboard → Rekap → Analitik → Notifikasi.

Billing → Pembayaran → Jurnal → Laporan.

Keuangan → Buku Kas → Laporan → Dashboard.

Dokumen → Template → Print → Export.

Portal Orang Tua → Tagihan → Pembayaran → Absensi → Nilai → Rapor.

Portal Siswa → Jadwal → Tugas → Nilai → Rapor → Absensi.

Flutter Mobile menggunakan REST API yang sama dengan Web ERP.

========================================================
RBAC
========================================================

Pastikan seluruh Role menggunakan:

Role

Permission

Assignment

Scope

Policy

Feature Flag

Tidak boleh ada menu, halaman, widget, tombol, modal, endpoint, atau data yang dapat diakses di luar hak akses.

Seluruh route wajib menggunakan Authorization Guard.

========================================================
UI/UX
========================================================

Pastikan:

Responsive.

Desktop.

Tablet.

Mobile.

Tidak ada halaman kosong.

Tidak ada layout rusak.

Tidak ada overflow.

Tidak ada komponen yang tidak digunakan.

Loading state tersedia.

Empty state tersedia.

Error state tersedia.

Success state tersedia.

========================================================
FORM
========================================================

Seluruh Form harus memiliki:

Validasi.

Required Field.

Format Validation.

Duplicate Validation.

Server Validation.

Client Validation.

Loading.

Disable saat submit.

Pesan sukses.

Pesan gagal.

========================================================
CRUD
========================================================

Seluruh modul wajib memiliki jika relevan:

Create

Read

Update

Delete

View Detail

Search

Filter

Sorting

Pagination

Import

Export

Print

Preview

Riwayat Perubahan

Audit Trail

Restore (jika menggunakan soft delete)

========================================================
SMART ATTENDANCE
========================================================

Pastikan:

QR Code.

Barcode.

GPS.

Geofence.

Manual Approval.

Dynamic Configuration.

Rekap.

Dashboard.

Notifikasi.

Portal Orang Tua.

Portal Siswa.

Flutter.

Web.

Semua menggunakan REST API yang sama.

Tidak ada halaman simulasi.

========================================================
KBM
========================================================

Pastikan:

Jadwal.

Jurnal Mengajar.

Absensi.

Materi.

Tugas.

Penilaian.

Remedial.

Pengayaan.

Terhubung otomatis ke Leger.

========================================================
LEGER
========================================================

Pastikan:

Auto Generate.

Auto Ranking.

Auto Total.

Auto Rata-rata.

Auto Predikat.

Auto KKM.

Auto Remedial.

Auto Pengayaan.

Auto Publish.

Auto Lock.

Sinkron dengan Rapor.

========================================================
RAPOR
========================================================

Pastikan:

Generate otomatis.

Preview.

Publish.

Lock.

QR Verification.

PDF.

Print.

========================================================
REPORT
========================================================

Semua laporan wajib memiliki:

Preview.

Print.

PDF.

Excel.

CSV.

Filter.

Search.

Sorting.

Pagination.

========================================================
NOTIFICATION
========================================================

Pastikan:

In App.

Push Notification.

Email Ready.

WhatsApp Ready.

Reminder.

========================================================
SECURITY
========================================================

Audit:

JWT.

Password Hash.

RBAC.

Permission.

Policy.

Rate Limiting.

Input Validation.

SQL Injection Protection.

XSS Protection.

CSRF Protection (jika relevan).

CORS.

Audit Trail.

========================================================
PERFORMANCE
========================================================

Optimalkan:

Database Query.

Lazy Loading.

Pagination.

Caching.

Compression.

Image Optimization.

Bundle Size.

Code Splitting.

========================================================
LOGGING
========================================================

Catat:

Login.

Logout.

CRUD.

Approval.

Publish.

Delete.

Import.

Export.

Print.

Error.

Exception.

========================================================
HILANGKAN
========================================================

Hapus seluruh:

Dummy Data.

Mock API.

Hardcoded Value.

Simulation Page.

Demo Page.

Sandbox.

Testing Page.

Developer Menu.

Debug Menu.

Console Log yang tidak diperlukan.

Komentar kode yang tidak relevan.

========================================================
VALIDASI AKHIR
========================================================

Sebelum selesai, lakukan pemeriksaan menyeluruh terhadap:

Database.

REST API.

Frontend.

Backend.

Flutter API Contract.

RBAC.

CRUD.

Workflow.

Integrasi antar modul.

Laporan.

Cetak.

Export.

Notifikasi.

Dashboard.

Absensi.

KBM.

Leger.

Rapor.

Billing.

Keuangan.

Portal Orang Tua.

Portal Siswa.

Pastikan seluruh fitur bekerja sesuai business process.

========================================================
OUTPUT
========================================================

Lakukan audit dan penyempurnaan seluruh ERP hingga mencapai kondisi production-ready. Seluruh fitur harus menggunakan database dan REST API sebagai sumber data utama, menerapkan Role, Permission, Assignment, Scope, Policy, dan Feature Flag secara konsisten, menghilangkan komponen dummy dan simulasi, memperkuat validasi, keamanan, performa, dan integrasi antar modul sehingga aplikasi siap digunakan pada lingkungan produksi dan mudah dikembangkan pada tahap berikutnya tanpa mengubah arsitektur inti.