Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur aplikasi.

JANGAN mengubah database schema kecuali benar-benar diperlukan.

JANGAN menghapus fitur yang sudah selesai.

Implementasikan langsung dalam bentuk kode production-ready.

========================================================

TARGET

Lakukan Final Production Refactoring terhadap seluruh aplikasi ERP.

Tujuan:

Menjadikan seluruh aplikasi 100% dinamis, sinkron dengan database, tanpa dummy data, tanpa mock, tanpa hardcode, dan seluruh fitur CRUD bekerja sempurna.

========================================================

PRODUCTION AUDIT

Periksa seluruh project.

Frontend.

Backend.

REST API.

Prisma ORM.

Database.

RBAC.

Permission.

Assignment.

Report Engine.

Print Engine.

Notification.

Dashboard.

Flutter API.

PWA.

========================================================

HAPUS SELURUH DUMMY

Cari dan hapus seluruh:

Dummy Data

Mock Data

Fake Data

Placeholder Data

Sample Data

Testing Data

Seed UI

Static Array

Static JSON

Mock Service

Mock API

Mock Provider

Mock Repository

Temporary State

Simulation Data

Legacy Demo

Hardcoded Menu

Hardcoded Dashboard

Hardcoded Permission

Hardcoded Role

Hardcoded Assignment

Hardcoded User

Hardcoded Student

Hardcoded Employee

Hardcoded Billing

Hardcoded Finance

Hardcoded Report

Hardcoded Attendance

Hardcoded Notification

Hardcoded Document

Hardcoded Setting

Hardcoded Academic Year

Hardcoded Semester

Hardcoded Subject

Hardcoded Class

Hardcoded Department

Hardcoded Position

Hardcoded Unit

========================================================

DATABASE

Pastikan seluruh data berasal dari PostgreSQL melalui Prisma ORM.

Tidak boleh lagi menggunakan:

Local Array

Temporary Object

In Memory Storage

Mock Repository

Simulated Database

Fallback Dummy

Static JSON

Local Variable Database

========================================================

REST API

Seluruh halaman wajib menggunakan REST API resmi.

Tidak boleh request langsung ke local object.

Tidak boleh fake response.

Tidak boleh mock response.

Semua request harus menggunakan:

GET

POST

PUT

PATCH

DELETE

Multipart Upload

========================================================

CRUD

Pastikan SELURUH modul memiliki CRUD lengkap.

Create

Read

Update

Delete

Restore (jika soft delete)

Bulk Delete

Bulk Update

Duplicate

Archive

Search

Filter

Sorting

Pagination

Export

Import

Print

Preview

========================================================

MODAL

Seluruh modal harus bekerja.

Create Modal

Edit Modal

Detail Modal

View Modal

Delete Confirmation

Restore Confirmation

Approval Modal

Reject Modal

Upload Modal

Preview Modal

Print Preview

History Modal

Audit Modal

Permission Modal

Assignment Modal

Role Modal

========================================================

BUTTON

Pastikan seluruh button berfungsi.

Tambah

Simpan

Update

Delete

Detail

View

Edit

Search

Refresh

Reset

Cancel

Close

Approve

Reject

Upload

Download

Export PDF

Export Excel

Export CSV

Print

Share

Duplicate

Archive

Restore

Semua button harus terhubung ke API.

========================================================

TABLE

Seluruh table wajib:

Search

Filter

Sorting

Pagination

Lazy Loading

Sticky Header

Responsive

Bulk Action

Refresh

Real Time Update

========================================================

FORM

Seluruh form wajib:

Validation

Server Validation

Client Validation

Loading

Success

Error

Reset

Cancel

Auto Save Draft (jika diperlukan)

========================================================

DETAIL PAGE

Seluruh halaman detail wajib:

Mengambil data berdasarkan ID.

Menampilkan relasi.

Menampilkan histori.

Menampilkan attachment.

Menampilkan audit trail.

Tidak boleh dummy.

========================================================

VIEW PAGE

Seluruh View menggunakan data database.

Tidak boleh static.

Tidak boleh fake.

========================================================

DELETE

Delete harus:

Confirmation Dialog

RBAC Validation

Soft Delete (jika diperlukan)

Audit Log

Refresh Data

========================================================

UPLOAD

Seluruh upload harus benar-benar tersimpan.

Foto

PDF

Excel

Word

Image

Document

Attachment

Tidak boleh fake upload.

========================================================

DOWNLOAD

Semua download berasal dari file server.

Tidak boleh dummy.

========================================================

PRINT

Semua print berasal dari data database.

Tidak boleh mock.

Tidak boleh sample.

========================================================

DASHBOARD

Dashboard harus:

Realtime

API Driven

Role Driven

Permission Driven

Assignment Driven

Scope Driven

Tidak boleh hardcoded.

========================================================

RBAC

Seluruh menu.

Seluruh tombol.

Seluruh endpoint.

Seluruh widget.

Seluruh dashboard.

Seluruh report.

Harus mengikuti:

Role

Permission

Assignment

Scope

========================================================

REPORT

Seluruh laporan wajib:

Realtime

Filter

Preview

Print

PDF

Excel

CSV

========================================================

NOTIFICATION

Semua notifikasi berasal dari database.

Tidak boleh static.

========================================================

SEARCH

Seluruh menu memiliki:

Global Search

Local Search

Advanced Filter

========================================================

SETTING

Seluruh setting berasal dari database.

Tidak boleh config hardcoded.

========================================================

ERROR HANDLING

Loading

Success

Empty

Offline

Unauthorized

Forbidden

Validation Error

Server Error

Retry

========================================================

SECURITY

JWT

Refresh Token

HTTPS

RBAC

Permission

Assignment

Audit Trail

Rate Limit

CSRF

XSS

SQL Injection Protection

========================================================

PERFORMANCE

Lazy Loading

Pagination

Code Splitting

Image Optimization

Cache

Compression

========================================================

CODE QUALITY

Hilangkan:

Unused Component

Unused Hook

Unused API

Unused Import

Unused Variable

Duplicate Component

Duplicate Logic

Duplicate API Call

Duplicate Query

Duplicate Modal

Duplicate State

========================================================

FINAL VALIDATION

Pastikan:

✓ Tidak ada Dummy Data

✓ Tidak ada Mock API

✓ Tidak ada Fake Service

✓ Tidak ada Hardcoded Data

✓ Tidak ada Static Array

✓ Tidak ada Local Dummy Storage

✓ Semua CRUD berfungsi

✓ Semua Modal berfungsi

✓ Semua Button berfungsi

✓ Semua API sinkron

✓ Semua Relasi Database benar

✓ Semua Dashboard realtime

✓ Semua Report realtime

✓ Semua Print realtime

✓ Semua Export realtime

✓ Semua Upload realtime

✓ Semua Notification realtime

✓ Semua Role bekerja

✓ Semua Permission bekerja

✓ Semua Assignment bekerja

✓ Semua Scope bekerja

✓ Seluruh aplikasi production-ready

========================================================

OUTPUT

Lakukan audit, refactor, dan finalisasi seluruh source code hingga menjadi ERP Enterprise yang sepenuhnya dinamis, seluruh data berasal dari database melalui REST API, seluruh fitur CRUD, modal, detail, view, delete, create, upload, download, print, export, dashboard, report, dan notifikasi bekerja sempurna tanpa dummy data, tanpa mock, tanpa hardcode, serta siap digunakan pada lingkungan produksi.