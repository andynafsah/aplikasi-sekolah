# TUTORIAL INTEGRASI FLUTTER: LOGIN & ABSENSI MULTI-PERAN (SISWA, GURU, KARYAWAN)

Panduan praktis ini akan menuntun Anda langkah demi langkah dalam membangun aplikasi mobile berbasis **Flutter** yang tersinkronisasi sempurna dengan **Enterprise Mobile API Gateway** web Anda.

Tutorial ini berfokus pada dua fitur paling krusial:
1. **Otentikasi Multi-Peran** (Siswa, Guru, Karyawan) dengan penyimpanan token aman.
2. **Presensi Kehadiran Berbasis Geofence (GPS)** dengan fitur **Offline-First Save & Auto-Sync** jika tidak ada internet.

---

## DAFTAR ISI
1. [Prasyarat & Konfigurasi Flutter (`pubspec.yaml`)](#1-prasyarat--konfigurasi-flutter)
2. [Arsitektur Struktur Folder Flutter](#2-arsitektur-struktur-folder-flutter)
3. [Konfigurasi HTTP Client & Keamanan Token (`ApiClient`)](#3-konfigurasi-http-client--keamanan-token)
4. [Manajemen Database SQLite Lokal untuk Presensi Offline](#4-manajemen-database-sqlite-lokal)
5. [Layanan Otentikasi Multi-Peran (Siswa, Guru, Karyawan)](#5-layanan-otentikasi-multi-peran)
6. [Fitur Presensi GPS & Pendeteksian Geofence](#6-fitur-presensi-gps--pendeteksian-geofence)
7. [UI Screen: Halaman Login & Dashboard Absensi](#7-ui-screen-halaman-login--dashboard-absensi)
8. [Cara Pengujian (Testing) dengan Virtual Simulator](#8-cara-pengujian-testing)

---

## 1. PRASYARAT & KONFIGURASI FLUTTER

Pertama, buat proyek Flutter baru Anda lalu tambahkan library berikut pada file `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # Koneksi API & Middleware Interceptors
  dio: ^5.4.0

  # Mengambil Koordinat GPS Perangkat secara Realtime
  geolocator: ^10.1.0

  # Penyimpanan Enkripsi Lokal Aman untuk Token JWT & Data Kredensial
  flutter_secure_storage: ^9.0.0

  # Database SQLite Lokal untuk Mekanisme Antrean Offline-First
  sqflite: ^2.3.0
  path: ^1.8.3

  # State Management Ringan & Generator UUID
  provider: ^6.1.1
  uuid: ^4.3.3
```

### Konfigurasi Izin Perangkat (Permissions)

#### Android (`android/app/src/main/AndroidManifest.xml`)
Tambahkan izin akses lokasi (GPS) di dalam tag `<manifest>`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

#### iOS (`ios/Runner/Info.plist`)
Tambahkan deskripsi penggunaan GPS di dalam tag `<dict>`:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Aplikasi memerlukan akses lokasi Anda untuk memverifikasi area geofence presensi sekolah secara akurat.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>Aplikasi memerlukan akses lokasi Anda di latar belakang untuk sistem pelacakan kehadiran harian.</string>
```

---

## 2. ARSITEKTUR STRUKTUR FOLDER FLUTTER

Agar kode terstruktur secara bersih (Clean Architecture), terapkan struktur folder berikut pada direktori `lib/` Anda:

```text
lib/
│
├── main.dart                  # Titik masuk aplikasi
├── services/
│   ├── api_client.dart        # Klien HTTP kustom (Dio)
│   ├── auth_service.dart      # Mengurus login/logout multi-role
│   ├── location_service.dart  # Deteksi GPS & kalkulasi jarak geofence
│   └── sync_service.dart      # SQLite offline queue & sync scheduler
│
├── models/
│   ├── user_model.dart        # Model data Siswa, Guru, Karyawan
│   └── attendance_model.dart  # Model data log presensi
│
└── screens/
    ├── login_screen.dart      # UI Halaman Login Multi-Peran
    └── attendance_screen.dart # UI Dashboard Absensi GPS
```

---

## 3. KONFIGURASI HTTP CLIENT & KEAMANAN TOKEN (`ApiClient`)

Buat klien HTTP menggunakan **Dio** untuk otomatis melampirkan **Tenant ID** dan **Token Bearer JWT** pada setiap pemanggilan API:

```dart
// lib/services/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio dio = Dio();
  final _storage = const FlutterSecureStorage();

  // URL dasar server API Gateway Anda (sesuai app URL Cloud Run)
  static const String baseUrl = 'https://ais-dev-cuu72c5niw56xr2fibir2x-217257253856.asia-east1.run.app';
  
  // Tenant ID yayasan/sekolah target (opsional, disesuaikan dinamis)
  static const String tenantId = 'TENANT-YAYASAN-UTAMA';

  ApiClient() {
    dio.options.baseUrl = '$baseUrl/api/v2/mobile';
    dio.options.connectTimeout = const Duration(seconds: 15);
    dio.options.receiveTimeout = const Duration(seconds: 15);

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Sisipkan Header Wajib Multi-Tenancy & Autentikasi
          options.headers['X-Tenant-ID'] = tenantId;
          options.headers['Accept'] = 'application/json';

          final token = await _storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          // Tangani otomatis refresh token jika mendapat 401 Unauthorized
          if (e.response?.statusCode == 401) {
            final refreshToken = await _storage.read(key: 'refresh_token');
            if (refreshToken != null) {
              try {
                final refreshResponse = await Dio().post(
                  '$baseUrl/api/v2/mobile/auth/refresh',
                  data: {'refreshToken': refreshToken},
                  headers: {'X-Tenant-ID': tenantId},
                );

                if (refreshResponse.statusCode == 200 && refreshResponse.data['success'] == true) {
                  final newToken = refreshResponse.data['token'];
                  await _storage.write(key: 'jwt_token', value: newToken);

                  // Ulangi request asli dengan token baru
                  e.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                  final response = await dio.fetch(e.requestOptions);
                  return handler.resolve(response);
                }
              } catch (_) {
                // Sesi habis, bersihkan penyimpanan & arahkan ke Login Screen
                await _storage.deleteAll();
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
```

---

## 4. MANAJEMEN DATABASE SQLITE LOKAL

Kelas ini akan menyimpan transaksi kehadiran secara lokal di perangkat jika perangkat berstatus offline (tidak ada sinyal internet):

```dart
// lib/services/database_helper.dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('enterprise_attendance.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);
    return await openDatabase(path, version: 1, onCreate: _createDB);
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE offline_attendance_queue (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        status TEXT NOT NULL, -- 'Hadir' | 'Sakit' | 'Izin'
        timestamp TEXT NOT NULL,
        is_synced INTEGER DEFAULT 0
      )
    ''');
  }
}
```

---

## 5. LAYANAN OTENTIKASI MULTI-PERAN

Gunakan layanan ini untuk memproses verifikasi login dan menyimpan detail peran pengguna (Siswa, Guru, atau Karyawan/Pegawai):

```dart
// lib/services/auth_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _client = ApiClient();
  final _storage = const FlutterSecureStorage();

  Future<Map<String, dynamic>> loginUser({
    required String username,
    required String password,
    required String deviceUuid,
  }) async {
    try {
      final response = await _client.dio.post('/auth/login', data: {
        'username': username,
        'password': password,
        'device_uuid': deviceUuid,
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        final data = response.data;
        
        // Simpan token & profil pengguna ke Secure Storage
        await _storage.write(key: 'jwt_token', value: data['token']);
        await _storage.write(key: 'refresh_token', value: data['refreshToken']);
        await _storage.write(key: 'user_id', value: data['user']['id']);
        await _storage.write(key: 'user_name', value: data['user']['name']);
        await _storage.write(key: 'user_role', value: data['user']['role']); // 'STUDENT' | 'TEACHER' | 'EMPLOYEE'

        return {
          'success': true,
          'role': data['user']['role'],
          'name': data['user']['name']
        };
      }
      return {'success': false, 'message': response.data['message'] ?? 'Login Gagal'};
    } catch (e) {
      return {'success': false, 'message': 'Terjadi kesalahan koneksi server'};
    }
  }

  Future<void> logoutUser(String deviceUuid) async {
    try {
      await _client.dio.post('/auth/logout', data: {'device_uuid': deviceUuid});
    } finally {
      await _storage.deleteAll();
    }
  }
}
```

---

## 6. FITUR PRESENSI GPS & PENDETEKSIAN GEOFENCE

Layanan ini mengontrol perolehan koordinat GPS saat tombol presensi ditekan, menghitung jarak geofence (pusat sekolah), serta melakukan fallback sinkronisasi offline-first jika tidak terhubung ke jaringan:

```dart
// lib/services/location_service.dart
import 'package:geolocator/geolocator.dart';

class LocationService {
  // Pusat Geofence Sekolah / Madrasah / Yayasan
  // Sesuaikan koordinat ini dengan koordinat Sekolah Anda
  static const double schoolLatitude = -6.200000;
  static const double schoolLongitude = 106.816666;
  static const double maxDistanceMeter = 100.0; // Batas radius toleransi 100 meter

  // Ambil Lokasi Sekarang
  Future<Position> getCurrentUserLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw 'Layanan GPS Perangkat dinonaktifkan. Aktifkan GPS Anda.';
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw 'Izin lokasi ditolak oleh pengguna.';
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw 'Izin lokasi diblokir permanen. Aktifkan manual di Pengaturan Hp.';
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high
    );
  }

  // Cek apakah User berada di dalam Geofence Sekolah
  double calculateDistanceToSchool(double userLat, double userLng) {
    return Geolocator.distanceBetween(
      userLat,
      userLng,
      schoolLatitude,
      schoolLongitude
    );
  }
}
```

### Sinkronisasi Kehadiran (Online & Offline Queue)

```dart
// lib/services/sync_service.dart
import 'dart:convert';
import 'package:uuid/uuid.dart';
import 'database_helper.dart';
import 'api_client.dart';

class SyncService {
  final ApiClient _apiClient = ApiClient();
  final _dbHelper = DatabaseHelper.instance;

  // Lakukan Presensi Kehadiran
  Future<Map<String, dynamic>> submitAttendance({
    required String userId,
    required String role,
    required double latitude,
    required double longitude,
    required String status, // 'Hadir', 'Sakit', 'Izin'
  }) async {
    final String timestamp = DateTime.now().toIso8601String();
    final String uniqueId = const Uuid().v4();

    try {
      // 1. Coba kirim langsung ke server (Online Flow)
      final response = await _apiClient.dio.post('/sync', data: {
        'actions': [
          {
            'id': uniqueId,
            'module': 'ATTENDANCE',
            'action': 'SUBMIT_PRESENSI',
            'payload': {
              'user_id': userId,
              'role': role,
              'latitude': latitude,
              'longitude': longitude,
              'status': status,
              'timestamp': timestamp,
            }
          }
        ]
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        return {'success': true, 'offline': false, 'message': 'Presensi online berhasil tercatat!'};
      }
      throw 'Server Rejected';
    } catch (_) {
      // 2. Jika koneksi bermasalah / offline (Offline Flow)
      final db = await _dbHelper.database;
      await db.insert('offline_attendance_queue', {
        'id': uniqueId,
        'user_id': userId,
        'role': role,
        'latitude': latitude,
        'longitude': longitude,
        'status': status,
        'timestamp': timestamp,
        'is_synced': 0
      });

      return {
        'success': true,
        'offline': true,
        'message': 'Presensi tersimpan lokal di HP. Akan disinkronkan otomatis saat ada internet.'
      };
    }
  }

  // Kirim semua data antrean lokal ke API Gateway saat terhubung internet
  Future<void> syncOfflineDataToServer() async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> unsyncedList = await db.query(
      'offline_attendance_queue',
      where: 'is_synced = ?',
      whereArgs: [0]
    );

    if (unsyncedList.isEmpty) return;

    final List<Map<String, dynamic>> syncPayload = unsyncedList.map((item) {
      return {
        'id': item['id'],
        'module': 'ATTENDANCE',
        'action': 'SUBMIT_PRESENSI',
        'payload': {
          'user_id': item['user_id'],
          'role': item['role'],
          'latitude': item['latitude'],
          'longitude': item['longitude'],
          'status': item['status'],
          'timestamp': item['timestamp'],
        }
      };
    }).toList();

    try {
      final response = await _apiClient.dio.post('/sync', data: {
        'actions': syncPayload
      });

      if (response.statusCode == 200 && response.data['success'] == true) {
        // Tandai data sebagai sudah tersinkronisasi di database lokal
        for (var item in unsyncedList) {
          await db.update(
            'offline_attendance_queue',
            {'is_synced': 1},
            where: 'id = ?',
            whereArgs: [item['id']]
          );
        }
        print("Sinkronisasi data presensi offline berhasil diselesaikan.");
      }
    } catch (e) {
      print("Gagal sinkronisasi data offline: $e");
    }
  }
}
```

---

## 7. UI SCREEN: HALAMAN LOGIN & DASHBOARD ABSENSI

Berikut rancangan UI sederhana yang menggabungkan seluruh layanan di atas:

### UI Login Multi-Peran (`lib/screens/login_screen.dart`)

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'attendance_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  bool _isLoading = false;

  void _handleLogin() async {
    setState(() => _isLoading = true);
    
    final result = await _authService.loginUser(
      username: _usernameController.text,
      password: _passwordController.text,
      deviceUuid: 'DEVICE-UUID-TEST-FLUTTER-123', // UUID unik hp siswa/guru
    );

    setState(() => _isLoading = false);

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Selamat datang, ${result['name']} (${result['role']})')),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => AttendanceScreen(
          userId: 'usr-demo-id', 
          role: result['role']
        )),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Login gagal')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login Portal Sivitas & Staf')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(controller: _usernameController, decoration: const InputDecoration(labelText: 'Username / NISN / NIP')),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Kata Sandi')),
            const SizedBox(height: 30),
            _isLoading 
              ? const CircularProgressIndicator()
              : ElevatedButton(onPressed: _handleLogin, child: const Text('MASUK KE KONSOL MOBILE'))
          ],
        ),
      ),
    );
  }
}
```

### UI Dashboard Absensi GPS Geofence (`lib/screens/attendance_screen.dart`)

```dart
import 'package:flutter/material.dart';
import '../services/location_service.dart';
import '../services/sync_service.dart';

class AttendanceScreen extends StatefulWidget {
  final String userId;
  final String role;

  const AttendanceScreen({super.key, required this.userId, required this.role});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final _locationService = LocationService();
  final _syncService = SyncService();
  
  String _gpsStatus = "Membaca GPS...";
  double _distanceToSchool = 0.0;
  bool _isInGeofence = false;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _checkLocation();
  }

  Future<void> _checkLocation() async {
    try {
      final position = await _locationService.getCurrentUserLocation();
      final dist = _locationService.calculateDistanceToSchool(position.latitude, position.longitude);
      
      setState(() {
        _distanceToSchool = dist;
        _isInGeofence = dist <= LocationService.maxDistanceMeter;
        _gpsStatus = "Latitude: ${position.latitude.toStringAsFixed(6)}, Longitude: ${position.longitude.toStringAsFixed(6)}";
      });
    } catch (e) {
      setState(() => _gpsStatus = "Error: $e");
    }
  }

  void _submitAbsensi() async {
    setState(() => _isProcessing = true);
    try {
      final position = await _locationService.getCurrentUserLocation();
      
      final result = await _syncService.submitAttendance(
        userId: widget.userId,
        role: widget.role,
        latitude: position.latitude,
        longitude: position.longitude,
        status: 'Hadir',
      );

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message']), backgroundColor: result['offline'] ? Colors.orange : Colors.green),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e"), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Presensi ${widget.role}')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("ID Akun: ${widget.userId}", style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Card(
                color: Colors.blue.shade50,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(_gpsStatus, textAlign: TextAlign.center),
                ),
              ),
              const SizedBox(height: 20),
              Text("Jarak ke Pusat Sekolah: ${_distanceToSchool.toStringAsFixed(1)} Meter"),
              const SizedBox(height: 10),
              _isInGeofence 
                ? const Text("✅ POSISI SAH DI GEOFENCE", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold))
                : const Text("❌ DI LUAR RADIUS ABSEN (MAKSIMAL 100M)", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
              const SizedBox(height: 40),
              _isProcessing 
                ? const CircularProgressIndicator()
                : ElevatedButton.icon(
                    onPressed: _submitAbsensi,
                    icon: const Icon(Icons.fingerprint),
                    label: const Text('TAP PRESENSI SEKARANG'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 15),
                      backgroundColor: _isInGeofence ? Colors.emerald : Colors.grey,
                    ),
                  ),
              const SizedBox(height: 30),
              TextButton.icon(
                onPressed: _syncService.syncOfflineDataToServer,
                icon: const Icon(Icons.sync),
                label: const Text('SINKRONISASIKAN ANTRIAN OFFLINE'),
              )
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 8. CARA PENGUJIAN (TESTING) DENGAN VIRTUAL SIMULATOR

Untuk menyimulasikan data dari Flutter secara visual, ikuti langkah berikut:

1. **Jalankan Aplikasi Web**:
   * Masuk ke dashboard web utama.
   * Pergi ke menu **"Parent Portal & Tracker"** atau menu **"Sistem"** -> **"Virtual Mobile Simulator"**.
2. **Kirim Data Uji**:
   * Gunakan tombol simulator di panel web untuk melihat skema log masuk (login payloads) dan pengujian geofence GPS.
   * Endpoint penanganan API Gateway akan mencatat setiap transaksi `ATTENDANCE` (Siswa, Guru, dan Karyawan) ke database yayasan dan langsung menampilkan status kehadiran yang diperbarui secara real-time pada monitor asrama, kelas, dan dashboard eksekutif.
