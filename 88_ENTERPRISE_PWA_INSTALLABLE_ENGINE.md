Lanjutkan project ERP yang sudah ada.

JANGAN membuat project baru.

JANGAN mengubah arsitektur backend.

JANGAN mengubah REST API.

JANGAN mengubah business logic.

Implementasikan production-ready.

==================================================

TARGET

Upgrade ERP menjadi:

1. Web Application

2. Progressive Web App (PWA)

3. Flutter Mobile Client

Semua menggunakan:

Satu Backend

Satu REST API

Satu Database

Satu RBAC

Satu Business Logic

==================================================

WEB

Aplikasi tetap dapat berjalan melalui browser.

Support:

Chrome

Edge

Firefox

Safari

Opera

Responsive Desktop

Responsive Tablet

Responsive Mobile

==================================================

PWA

Ubah React + Vite menjadi Progressive Web App.

Support:

Install dari Browser

Offline Cache

Splash Screen

App Icon

Home Screen Icon

Launch Screen

Standalone Mode

Landscape & Portrait

Auto Update

Background Sync

Push Notification Ready

==================================================

INSTALL

Jika browser mendukung PWA.

Tampilkan tombol:

Install Application

atau

Pasang Aplikasi

Setelah berhasil:

Aplikasi dapat dibuka seperti aplikasi desktop/mobile.

Tanpa membuka browser.

==================================================

MANIFEST

Buat manifest lengkap.

Nama aplikasi.

Short Name.

Description.

Theme Color.

Background Color.

Display Standalone.

Orientation.

Start URL.

Scope.

Maskable Icon.

Semua icon berasal dari System Settings ERP.

==================================================

SERVICE WORKER

Implementasikan:

Caching

Offline Page

Auto Update

Cache Version

Background Sync

Runtime Cache

Image Cache

API Cache (GET saja)

Jangan cache request mutasi.

==================================================

OFFLINE

Saat offline.

Tetap dapat membuka:

Dashboard cache.

Profil.

Master data cache.

Draft.

Queue.

Saat online.

Auto Sync.

==================================================

NOTIFICATION

PWA siap menerima:

Push Notification

Announcement

Reminder

Approval

Billing Reminder

Attendance Reminder

Academic Reminder

Menggunakan backend ERP.

==================================================

SECURITY

HTTPS wajib.

JWT.

Refresh Token.

Secure Storage.

Session Validation.

RBAC.

Permission.

Audit Trail.

==================================================

LOGIN

Tetap menggunakan:

REST API.

JWT.

Role.

Permission.

Assignment.

Scope.

==================================================

SHORTCUT

Tambahkan App Shortcuts:

Dashboard

Attendance

KBM

Billing

Finance

Reports

Settings

==================================================

FILE

Support:

Camera

Gallery

Upload

Download

Print

PDF Preview

Share

==================================================

RESPONSIVE

Desktop

Laptop

Tablet

Mobile Browser

Foldable Device

==================================================

PERFORMANCE

Lazy Loading

Route Splitting

Image Optimization

Code Splitting

Compression

Caching

==================================================

ACCESSIBILITY

Keyboard Navigation

High Contrast

Screen Reader Ready

Responsive Font

==================================================

UI

Saat aplikasi telah di-install.

Hilangkan kesan browser.

Gunakan:

Standalone Window

Native Feel

Splash Screen

Loading Animation

App Icon

==================================================

DESKTOP EXPERIENCE

Saat dijalankan di Windows, macOS, Linux.

PWA terasa seperti aplikasi desktop.

Window sendiri.

Taskbar Icon.

Dock Icon.

App Launcher.

==================================================

MOBILE EXPERIENCE

Saat dibuka di Android/iPhone.

Dapat dipasang ke Home Screen.

Tidak menampilkan address bar browser.

Full Screen.

==================================================

FLUTTER

Flutter tetap menggunakan REST API yang sama.

Tidak ada perubahan endpoint.

Tidak ada duplicate business logic.

==================================================

VALIDATION

Tidak boleh:

Hardcoded

Dummy Data

Mock API

Business Logic di Frontend

Duplicate Logic antara Web dan Mobile

==================================================

OUTPUT

Upgrade ERP menjadi Progressive Web App (PWA) yang dapat digunakan melalui browser maupun di-install sebagai aplikasi desktop/mobile, dengan pengalaman seperti aplikasi native, tetap menggunakan satu backend, satu REST API, satu database, satu RBAC, dan satu business logic yang sama dengan Flutter Mobile.