# PANDUAN DEPLOYMENT & SETUP FLUTTER DI VS CODE (SINKRONISASI API GATEWAY)

Panduan ini berisi tutorial lengkap langkah-demi-langkah tentang cara membuat, mengatur struktur folder, dan menjalankan proyek **Flutter** Anda menggunakan **Visual Studio Code (VS Code)** agar dapat tersinkronisasi langsung dengan sistem web ini.

---

## 1. PERSIAPAN ENVIROMENT (PRASYARAT)

Sebelum memulai di VS Code, pastikan komputer Anda telah terpasang:
1. **Flutter SDK**: [Unduh & Install Flutter](https://docs.flutter.dev/get-started/install) sesuai OS Anda.
2. **VS Code**: [Unduh VS Code](https://code.visualstudio.com/).
3. **Android Studio**: Diperlukan untuk lisensi SDK Android dan Emulator Android.
4. **Xcode** (Khusus pengguna macOS): Diperlukan untuk membuat simulator iOS dan kompilasi IPA.

### Ekstensi VS Code yang Wajib Diinstal:
Buka VS Code, klik ikon **Extensions** (Ctrl+Shift+X) di sisi kiri, lalu cari dan instal:
* **Flutter** (oleh Dart Code)
* **Dart** (oleh Dart Code)
* **Awesome Flutter Snippets** (opsional, mempercepat penulisan kode)

---

## 2. MEMBUAT PROYEK FLUTTER BARU DI VS CODE

Ikuti langkah berikut untuk membuat proyek dari awal:

1. Buka **VS Code**.
2. Buka **Command Palette** dengan menekan `Ctrl + Shift + P` (Windows/Linux) atau `Cmd + Shift + P` (macOS).
3. Ketik dan pilih: `Flutter: New Project`.
4. Pilih `Application`.
5. Pilih folder penyimpanan di komputer Anda untuk menaruh proyek ini.
6. Berikan nama proyek dengan huruf kecil dan underscore, contoh: `madrasah_mobile_app` lalu tekan **Enter**.
7. Tunggu beberapa saat sampai VS Code selesai men-generate struktur dasar proyek Flutter Anda.

---

## 3. STRUKTUR FOLDER TERPADU (SINKRON GATWAY)

Ganti atau susun ulang struktur folder di dalam direktori `lib/` proyek Flutter Anda agar sesuai dengan struktur standar **Clean Architecture** yang sinkron dengan API Gateway web Anda:

```text
madrasah_mobile_app/
├── android/                  # Pengaturan khusus platform Android
├── ios/                      # Pengaturan khusus platform iOS
├── pubspec.yaml              # Pengaturan library/dependencies proyek
└── lib/                      # SOURCE KODE UTAMA DART
    ├── main.dart             # Entry point utama aplikasi Flutter
    │
    ├── config/
    │   └── app_config.dart   # Konfigurasi URL API & Tenant ID global
    │
    ├── services/
    │   ├── api_client.dart   # HTTP Client (Dio) dengan interceptors otomatis
    │   ├── auth_service.dart # Logika login, logout, & role management
    │   ├── sync_service.dart # SQLite offline storage & sync dispatcher
    │   └── GPS_service.dart  # Deteksi geofence & verifikasi lokasi real-time
    │
    ├── models/
    │   ├── user_model.dart   # Parser JSON untuk data Siswa, Guru & Staff
    │   └── attendance_record.dart # Model data logs presensi kehadiran
    │
    └── screens/
        ├── login_screen.dart # Tampilan visual Form Login Multi-Peran
        └── dashboard_screen.dart # Tampilan utama absensi GPS berdasarkan peran
```

### Panduan Membuat Folder Secara Cepat di VS Code:
1. Klik kanan pada folder `lib` di Explorer VS Code.
2. Pilih `New Folder`, beri nama `config`.
3. Ulangi proses di atas untuk membuat folder `services`, `models`, dan `screens`.
4. Klik kanan di masing-masing folder baru tersebut, pilih `New File` untuk membuat file Dart sesuai struktur di atas.

---

## 4. KONFIGURASI DEPENDENCIES (`pubspec.yaml`)

Buka file `pubspec.yaml` di root direktori proyek Anda, lalu tambahkan dependensi berikut di bawah baris `dependencies:`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # HTTP request & interceptors
  dio: ^5.4.0

  # Akses lokasi GPS untuk geofencing kehadiran
  geolocator: ^10.1.0

  # Penyimpanan token JWT aman terenkripsi di keychain/keystore perangkat
  flutter_secure_storage: ^9.0.0

  # Local DB untuk menyimpan antrean transaksi presensi saat Offline
  sqflite: ^2.3.0
  path: ^1.8.3

  # Generator ID unik (UUID) untuk aksi offline tracker
  uuid: ^4.3.3
```

> **TIPS VS CODE:** Setelah mengedit `pubspec.yaml`, simpan file (`Ctrl + S`). VS Code akan otomatis menjalankan perintah `flutter pub get` untuk mengunduh library tersebut secara otomatis.

---

## 5. ISI FILE KONFIGURASI KUSTOM (`lib/config/app_config.dart`)

Buat file baru `lib/config/app_config.dart` untuk memudahkan Anda beralih dari server Lokal (Development) ke server Production:

```dart
// lib/config/app_config.dart
class AppConfig {
  // Ganti dengan URL server web Anda yang aktif
  static const String apiGatewayUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';
  
  // Kode Tenant ID institusi/sekolah target Anda
  static const String tenantId = 'TENANT-YAYASAN-PRO-MAX';

  // Radius Toleransi Absen dari Pusat Sekolah (dalam satuan meter)
  static const double maxGeofenceRadiusMeter = 100.0; 
}
```

---

## 6. CARA MENJALANKAN & DEBUGGING PROYEK DI VS CODE

Untuk menguji aplikasi Flutter Anda langsung ke HP Android/iOS atau Emulator:

### Langkah A: Memilih Device Target
1. Lihat di **bar status kanan bawah VS Code** (biasanya bertuliskan `No Device`, `macOS`, `Chrome`, atau nama Hp Anda jika sudah dicolok via kabel USB).
2. Klik nama device tersebut, lalu pilih device target pengujian Anda di menu dropdown bagian atas (misal: pilih `Pixel Emulator` atau `iPhone Simulator`).

### Langkah B: Menjalankan Aplikasi
1. Buka file `lib/main.dart`.
2. Tekan tombol **F5** pada keyboard Anda atau klik tab **Run and Debug** di sisi kiri VS Code, kemudian klik **Start Debugging** (ikon tombol Play hijau).
3. Proses kompilasi pertama kali akan memakan waktu sekitar 1-3 menit. Setelah selesai, aplikasi akan terpasang dan terbuka di HP/Emulator Anda secara otomatis.

### Langkah C: Memanfaatkan Fitur "Hot Reload"
Salah satu keunggulan Flutter di VS Code adalah **Hot Reload**:
* Setiap kali Anda mengubah kode UI, Anda cukup menekan tombol `Ctrl + S` (Save).
* Dalam hitungan kurang dari 1 detik, tampilan di layar Hp pengujian akan langsung berubah tanpa mengulangi proses login atau merestart aplikasi dari awal!

---

## 7. ALUR INTEGRASI SINKRONISASI OFFLINE-ONLINE

Secara fungsional, cara kerja kode Flutter yang Anda buat di proyek VS Code adalah sebagai berikut:

```text
               [ PENGGUNA TAP ABSEN ]
                         │
            Cek Koneksi Internet Perangkat
             /                         \
       [ ONLINE ]                   [ OFFLINE ]
           │                             │
    Kirim langsung ke             Simpan ke SQLite lokal
    API Gateway Server            di 'offline_attendance_queue'
           │                             │
  Data Tercatat di Web             Koneksi internet kembali aktif?
  & Tampil di Realtime Dashboard         ├─► YA: Kirim Batch Sync ke Server
                                         └─► TIDAK: Tetap simpan aman di HP
```

Untuk tutorial penulisan isi script Dart masing-masing file (`api_client.dart`, `auth_service.dart`, `sync_service.dart`, dll.), silakan merujuk pada file panduan terperinci di **`FLUTTER_ATTENDANCE_TUTORIAL.md`**.
