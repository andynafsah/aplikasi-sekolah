# PANDUAN TAHAP LANJUTAN FLUTTER: AUTO-SYNC, MOCK GPS TESTING & RELEASE APK

Setelah berhasil membuat struktur proyek di VS Code dan mengimplementasikan fitur Login & Absensi, langkah selanjutnya adalah meningkatkan kualitas aplikasi Anda agar siap digunakan secara nyata oleh Siswa, Guru, dan Staf.

Panduan ini membahas 4 topik penting berikutnya:
1. **Auto-Trigger Sync**: Deteksi otomatis status internet untuk sinkronisasi tanpa klik tombol.
2. **Cara Simulasi & Pengujian GPS (Mock Location)**: Menguji fitur geofence tanpa harus berjalan keluar rumah/kantor.
3. **Pemberitahuan Lokal (Local Notifications)**: Memberi peringatan pop-up instan di Hp saat absen berhasil disinkronkan.
4. **Build APK / IPA Release**: Panduan mengekspor aplikasi Anda menjadi file instalan (`.apk` / `.ipa`) untuk disebarkan.

---

## 1. INTEGRASI AUTO-TRIGGER SYNC (OTOMATIS SINKRON)

Agar pengguna tidak perlu menekan tombol "SINKRONISASI" secara manual, kita bisa menggunakan library `connectivity_plus` untuk mendeteksi kapan Hp kembali mendapatkan sinyal internet, lalu memicu sinkronisasi latar belakang secara otomatis.

### A. Tambahkan Dependensi di `pubspec.yaml`
```yaml
dependencies:
  # ... dependensi sebelumnya
  connectivity_plus: ^5.0.2
```

### B. Implementasi Network Listener di `lib/main.dart`
Edit file `lib/main.dart` Anda untuk memantau status jaringan:

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'services/sync_service.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final SyncService _syncService = SyncService();

  @override
  void initState() {
    super.initState();
    _initNetworkListener();
  }

  // Monitor perubahan sinyal internet secara berkala
  void _initNetworkListener() {
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result == ConnectivityResult.mobile || result == ConnectivityResult.wifi) {
        print("Koneksi Internet Terdeteksi! Memulai sinkronisasi otomatis...");
        
        // Picu sinkronisasi data absensi offline yang tersimpan di SQLite ke API Gateway
        _syncService.syncOfflineDataToServer();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Madrasah Mobile App',
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.emerald,
      ),
      home: const LoginScreen(),
    );
  }
}
```

---

## 2. CARA SIMULASI & PENGUJIAN GEOLOKASI (MOCK GPS)

Fitur Geofence membatasi absensi maksimal 100 meter dari pusat koordinat sekolah. Untuk mengujinya di rumah atau di depan komputer, Anda bisa memalsukan lokasi GPS emulator Anda:

### Pengujian Menggunakan Android Emulator (AVD):
1. Jalankan emulator Android Anda dari VS Code.
2. Di panel kontrol emulator samping kanan, klik ikon **Tiga Titik (...)** (Extended Controls).
3. Pilih menu **Location**.
4. Masukkan koordinat pusat sekolah Anda pada kolom pencarian atau input manual koordinat:
   * **Latitude**: `-6.200000` (sesuaikan dengan nilai di `LocationService`)
   * **Longitude**: `106.816666`
5. Klik **Set Location**.
6. Sekarang, buka menu absensi di aplikasi Flutter Anda, maka jarak ke sekolah akan otomatis terhitung sedekat `0.0 Meter` (Sah/Bisa Absen).
7. Untuk menguji kondisi di luar jangkauan geofence, ganti koordinat di emulator ke lokasi yang berjarak beberapa kilometer, lalu buka kembali aplikasi untuk memastikan tombol absen berubah menjadi abu-abu dan memblokir presensi.

---

## 3. NOTIFIKASI LOKAL PADA LAYAR HANDPHONE

Gunakan notifikasi lokal untuk memberikan umpan balik (feedback) visual instan kepada pengguna ketika antrean absensi offline mereka berhasil terkirim ke server secara otomatis di latar belakang.

### A. Tambahkan Dependensi di `pubspec.yaml`
```yaml
dependencies:
  flutter_local_notifications: ^16.1.0
```

### B. Setup Notifikasi Lokal (`lib/services/notification_helper.dart`)
```dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationHelper {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin = FlutterLocalNotificationsPlugin();

  static Future<void> init() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
    );

    await _notificationsPlugin.initialize(initializationSettings);
  }

  static Future<void> showLocalNotification(String title, String body) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
          'sync_channel_id',
          'Status Sinkronisasi',
          importance: Importance.max,
          priority: Priority.high,
        );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );

    await _notificationsPlugin.show(
      0,
      title,
      body,
      platformChannelSpecifics,
    );
  }
}
```

---

## 4. BUILD APK UNTUK RILIS (PRODUCTION BUILD)

Jika seluruh fitur absensi dan sinkronisasi online-offline sudah tervalidasi dengan baik, Anda dapat mengekspornya menjadi format instalan APK rilis:

### Langkah-langkah Pembuatan APK Rilis di VS Code:

1. Buka terminal di VS Code (tekan ``Ctrl + ` `` atau pilih **Terminal -> New Terminal**).
2. Bersihkan sisa kompilasi cache lama dengan mengetik perintah:
   ```bash
   flutter clean
   ```
3. Unduh ulang library terbaru:
   ```bash
   flutter pub get
   ```
4. Buat file APK rilis yang optimal dengan perintah:
   ```bash
   flutter build apk --release
   ```
   * *Opsi Tambahan (Mengecilkan Ukuran APK)*: Anda dapat memisahkan kompilasi berdasarkan arsitektur CPU Hp menggunakan perintah:
     ```bash
     flutter build apk --split-per-abi
     ```
5. Tunggu sampai proses build selesai. File instalan APK rilis Anda akan tersimpan di direktori:
   `build/app/outputs/flutter-apk/app-release.apk`
6. Anda sekarang bisa menyalin file `app-release.apk` tersebut ke Hp mana saja dan langsung menginstalnya untuk uji coba operasional lapangan!
