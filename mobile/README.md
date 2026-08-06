# 📱 STANDALONE MOBILE CLIENT (FLUTTER)
# mobile/README.md

Aplikasi seluler (Mobile App) terpadu sekolah dikembangkan menggunakan **Flutter SDK**, dapat dikompilasi ke platform Android dan iOS secara native.

---

## ⚡ FITUR-FITUR UTAMA

1.  **Single REST API Client**: Hanya menggunakan endpoint REST JSON yang sama dengan klien web React.
2.  **No Local Business Logic**: Flutter tidak menghitung aturan keuangan atau validasi kelulusan. Seluruh logika kalkulasi didelegasikan ke backend Express.
3.  **Local SQLite Offline Cache (`sqflite`)**: Berfungsi menyimpan log presensi/nilai harian siswa secara lokal di memori HP apabila koneksi internet terputus.
4.  **Automatic Sync Broker (`connectivity_plus`)**: Mendeteksi status koneksi seluler secara real-time. Saat internet kembali terhubung, antrean transaksi offline (FIFO) otomatis disubmit ke server MySQL.

---

## 🛠️ CARA MENJALANKAN DI LOCALHOST

### 1. Pasang SDK Flutter
Pastikan komputer pengembang Anda telah terpasang SDK Flutter versi 3.20.x ke atas.

### 2. Dapatkan Package Dependensi
```bash
flutter pub get
```

### 3. Konfigurasi Alamat API Server
Edit alamat IP/Domain backend server Anda di dalam kode `/lib/services/offline_sync.dart` pada baris:
```dart
const String baseUrl = 'https://sekolah-api.com'; // Isi dengan IP atau Domain VPS API Anda
```

### 4. Jalankan Aplikasi di Emulator / Perangkat Fisik
```bash
# Lihat daftar perangkat terhubung
flutter devices

# Jalankan aplikasi
flutter run
```
Aplikasi mobile Flutter siap digunakan untuk pencatatan presensi offline, monitoring tabungan santri, dan verifikasi tagihan SPP bulanan.
